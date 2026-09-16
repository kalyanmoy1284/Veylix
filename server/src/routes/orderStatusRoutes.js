const express = require("express");
const db = require("../db");

const {
  authenticateToken,
} = require("../middleware/authMiddleware");

const router = express.Router();

/* =====================================================
   ALLOWED ADMIN ROLES
===================================================== */

const allowedRoles = [
  "admin",
  "manager",
  "employee",
];

/* =====================================================
   ALLOWED ORDER STATUS
===================================================== */

const allowedStatuses = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
];

/* =====================================================
   UPDATE ORDER STATUS
===================================================== */

router.put(
  "/:id/status",
  authenticateToken,
  async (req, res) => {
    const connection =
      await db.getConnection();

    try {
      /* =========================================
         ROLE CHECK
      ========================================= */

      const userRole =
        req.user?.role;

      if (
        !allowedRoles.includes(
          userRole
        )
      ) {
        return res.status(403).json({
          success: false,
          message:
            "You are not authorized to update order status.",
        });
      }

      /* =========================================
         ORDER ID
      ========================================= */

      const orderId =
        Number(req.params.id);

      const {
        status,
      } = req.body;

      if (
        !Number.isInteger(
          orderId
        ) ||
        orderId <= 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid order ID.",
        });
      }

      /* =========================================
         STATUS VALIDATION
      ========================================= */

      if (
        !allowedStatuses.includes(
          status
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid order status. Use the cancellation endpoint for cancelled orders.",
        });
      }

      /* =========================================
         FIND ORDER
      ========================================= */

      const [orders] =
        await connection.query(
          `
          SELECT
            id,
            order_number,
            order_type,
            order_status,
            payment_status
          FROM orders
          WHERE id = ?
          LIMIT 1
          `,
          [orderId]
        );

      if (
        orders.length === 0
      ) {
        return res.status(404).json({
          success: false,
          message:
            "Order not found.",
        });
      }

      const order =
        orders[0];

      /* =========================================
         POS ORDER SAFETY
      ========================================= */

      if (
        order.order_type ===
        "pos"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "POS orders are already completed and cannot be updated through this workflow.",
        });
      }

      /* =========================================
         CANCELLED ORDER SAFETY
      ========================================= */

      if (
        order.order_status ===
        "cancelled"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Cancelled orders cannot be moved back to an active status.",
        });
      }

      /* =========================================
         DELIVERY PAYMENT UPDATE
      ========================================= */

      let newPaymentStatus =
        order.payment_status;

      /*
        COD becomes paid when the order
        is delivered.
      */

      if (
        status ===
          "delivered" &&
        order.payment_status ===
          "pending"
      ) {
        newPaymentStatus =
          "paid";
      }

      /* =========================================
         UPDATE
      ========================================= */

      await connection.beginTransaction();

      await connection.query(
        `
        UPDATE orders
        SET
          order_status = ?,
          payment_status = ?
        WHERE id = ?
        `,
        [
          status,
          newPaymentStatus,
          orderId,
        ]
      );

      await connection.commit();

      /* =========================================
         RESPONSE
      ========================================= */

      return res.json({
        success: true,

        message:
          "Order status updated successfully.",

        order: {
          id:
            order.id,

          orderNumber:
            order.order_number,

          previousStatus:
            order.order_status,

          orderStatus:
            status,

          paymentStatus:
            newPaymentStatus,
        },
      });

    } catch (error) {
      try {
        await connection.rollback();
      } catch {}

      console.error(
        "Order status update error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to update order status.",
      });
    } finally {
      connection.release();
    }
  }
);

module.exports = router;