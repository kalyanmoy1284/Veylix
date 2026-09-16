const express = require("express");

const db = require("../db");

const {
  authenticateToken,
} = require("../middleware/authMiddleware");

const router = express.Router();

/* =====================================================
   ALLOWED ADMIN ROLES
===================================================== */

const allowedAdminRoles = [
  "admin",
  "manager",
  "employee",
];

/* =====================================================
   CUSTOMER + ADMIN ORDER CANCELLATION
===================================================== */

router.put(
  "/:id/cancel",
  authenticateToken,
  async (req, res) => {
    const connection =
      await db.getConnection();

    try {
      /* =========================================
         AUTHENTICATED USER
      ========================================= */

      const userId =
        Number(req.user?.id);

      const userRole =
        req.user?.role;

      const isAdminUser =
        allowedAdminRoles.includes(
          userRole
        );

      if (
        !Number.isInteger(
          userId
        ) ||
        userId <= 0
      ) {
        return res.status(401).json({
          success: false,
          message:
            "Invalid authenticated user.",
        });
      }

      /* =========================================
         ORDER ID
      ========================================= */

      const orderId =
        Number(req.params.id);

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
         FIND ORDER
      ========================================= */

      const [orders] =
        await connection.query(
          `
          SELECT
            id,
            order_number,
            customer_id,
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
         AUTHORIZATION
      ========================================= */

      /*
        Admin / Manager / Employee
        can manage any order.

        Customer can only cancel
        their own order.
      */

      if (
        !isAdminUser &&
        Number(
          order.customer_id
        ) !== userId
      ) {
        return res.status(403).json({
          success: false,
          message:
            "You are not authorized to cancel this order.",
        });
      }

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
            "POS sales cannot be cancelled from the online cancellation workflow.",
        });
      }

      /* =========================================
         STATUS CHECK
      ========================================= */

      const cancellableStatuses = [
        "pending",
        "confirmed",
        "processing",
      ];

      if (
        !cancellableStatuses.includes(
          order.order_status
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "This order can no longer be cancelled.",
        });
      }

      /* =========================================
         GET ORDER ITEMS
      ========================================= */

      const [items] =
        await connection.query(
          `
          SELECT
            product_id,
            product_name,
            quantity
          FROM order_items
          WHERE order_id = ?
          `,
          [orderId]
        );

      if (
        items.length === 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Cannot cancel an order without items.",
        });
      }

      /* =========================================
         START TRANSACTION
      ========================================= */

      await connection.beginTransaction();

      /* =========================================
         RESTORE STOCK
         + CREATE INVENTORY RETURN LOG
      ========================================= */

      for (
        const item of items
      ) {
        const productId =
          Number(
            item.product_id
          );

        const quantity =
          Number(
            item.quantity
          );

        if (
          !Number.isInteger(
            productId
          ) ||
          productId <= 0
        ) {
          throw new Error(
            "Invalid product ID."
          );
        }

        if (
          !Number.isInteger(
            quantity
          ) ||
          quantity <= 0
        ) {
          throw new Error(
            "Invalid order item quantity."
          );
        }

        /* -----------------------------------------
           RESTORE STOCK
        ----------------------------------------- */

        const [stockUpdate] =
          await connection.query(
            `
            UPDATE products
            SET
              stock_quantity =
                stock_quantity + ?
            WHERE id = ?
            `,
            [
              quantity,
              productId,
            ]
          );

        if (
          stockUpdate.affectedRows !==
          1
        ) {
          throw new Error(
            `Product ${productId} was not found.`
          );
        }

        /* -----------------------------------------
           INVENTORY TRANSACTION
        ----------------------------------------- */

        await connection.query(
          `
          INSERT INTO inventory_transactions
          (
            product_id,
            transaction_type,
            quantity,
            reference_type,
            reference_id,
            note,
            created_by
          )
          VALUES
          (
            ?,
            'return',
            ?,
            'order',
            ?,
            ?,
            ?
          )
          `,
          [
            productId,
            quantity,
            orderId,
            `Cancelled order ${order.order_number}`,
            userId,
          ]
        );
      }

      /* =========================================
         UPDATE ORDER STATUS
      ========================================= */

      await connection.query(
        `
        UPDATE orders
        SET
          order_status = 'cancelled'
        WHERE id = ?
        `,
        [orderId]
      );

      /* =========================================
         PAYMENT STATUS
      ========================================= */

      let newPaymentStatus =
        order.payment_status;

      if (
        order.payment_status ===
        "pending"
      ) {
        newPaymentStatus =
          "cancelled";

        await connection.query(
          `
          UPDATE orders
          SET
            payment_status = 'cancelled'
          WHERE id = ?
          `,
          [orderId]
        );
      }

      /* =========================================
         COMMIT
      ========================================= */

      await connection.commit();

      /* =========================================
         RESPONSE
      ========================================= */

      return res.json({
        success: true,

        message:
          "Order cancelled and stock restored successfully.",

        order: {
          id:
            order.id,

          orderNumber:
            order.order_number,

          previousStatus:
            order.order_status,

          orderStatus:
            "cancelled",

          paymentStatus:
            newPaymentStatus,

          restoredItems:
            items.length,
        },
      });

    } catch (error) {
      try {
        await connection.rollback();
      } catch {}

      console.error(
        "Order cancellation error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to cancel order.",
      });
    } finally {
      connection.release();
    }
  }
);

module.exports = router;