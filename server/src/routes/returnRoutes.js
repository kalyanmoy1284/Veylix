const express = require("express");
const db = require("../db");

const {
  authenticateToken,
} = require("../middleware/authMiddleware");

const router = express.Router();

/* =====================================================
   ROLES
===================================================== */

const adminRoles = [
  "admin",
  "manager",
  "employee",
];

/* =====================================================
   HELPERS
===================================================== */

function isAdminUser(req) {
  return adminRoles.includes(
    req.user?.role
  );
}

function getUserId(req) {
  const userId =
    Number(req.user?.id);

  return Number.isInteger(
    userId
  ) && userId > 0
    ? userId
    : null;
}

/* =====================================================
   CREATE RETURN REQUEST
===================================================== */

router.post(
  "/",
  authenticateToken,
  async (req, res) => {
    const connection =
      await db.getConnection();

    try {
      const userId =
        getUserId(req);

      if (!userId) {
        return res.status(401).json({
          success: false,
          message:
            "Invalid authenticated user.",
        });
      }

      const {
        orderId,
        reason,
        refundAmount,
      } = req.body || {};

      const numericOrderId =
        Number(orderId);

      const numericRefundAmount =
        Number(
          refundAmount || 0
        );

      if (
        !Number.isInteger(
          numericOrderId
        ) ||
        numericOrderId <= 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid order ID.",
        });
      }

      if (
        !Number.isFinite(
          numericRefundAmount
        ) ||
        numericRefundAmount < 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Refund amount cannot be negative.",
        });
      }

      const [orders] =
        await connection.query(
          `
          SELECT
            id,
            order_number,
            customer_id,
            order_type,
            order_status,
            payment_status,
            total_amount
          FROM orders
          WHERE id = ?
          LIMIT 1
          `,
          [numericOrderId]
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
         CUSTOMER OWNERSHIP
      ========================================= */

      if (
        !isAdminUser(req) &&
        Number(
          order.customer_id
        ) !== userId
      ) {
        return res.status(403).json({
          success: false,
          message:
            "You are not authorized to request a return for this order.",
        });
      }

      /* =========================================
         ORDER VALIDATION
      ========================================= */

      if (
        order.order_type !==
        "online"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Only online orders can be returned.",
        });
      }

      if (
        order.order_status !==
        "delivered"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Only delivered orders can be returned.",
        });
      }

      if (
        order.payment_status ===
        "cancelled"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Cancelled orders cannot be returned.",
        });
      }

      if (
        numericRefundAmount >
        Number(
          order.total_amount
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Refund amount cannot exceed the order total.",
        });
      }

      /* =========================================
         EXISTING RETURN
      ========================================= */

      const [
        existingReturns,
      ] =
        await connection.query(
          `
          SELECT
            id,
            return_status,
            refund_status
          FROM returns
          WHERE order_id = ?
            AND return_status IN (
              'requested',
              'approved',
              'completed'
            )
          LIMIT 1
          `,
          [numericOrderId]
        );

      if (
        existingReturns.length >
        0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "A return request already exists for this order.",
        });
      }

      /* =========================================
         CREATE RETURN
      ========================================= */

      await connection.beginTransaction();

      const [
        returnResult,
      ] =
        await connection.query(
          `
          INSERT INTO returns
          (
            order_id,
            return_status,
            reason,
            refund_amount,
            refund_status,
            created_by
          )
          VALUES
          (
            ?,
            'requested',
            ?,
            ?,
            'pending',
            ?
          )
          `,
          [
            numericOrderId,
            reason?.trim() ||
              null,
            numericRefundAmount,
            userId,
          ]
        );

      await connection.commit();

      return res.status(201).json({
        success: true,
        message:
          "Return request created successfully.",
        return: {
          id:
            returnResult.insertId,
          orderId:
            numericOrderId,
          orderNumber:
            order.order_number,
          returnStatus:
            "requested",
          reason:
            reason?.trim() ||
            null,
          refundAmount:
            numericRefundAmount,
          refundStatus:
            "pending",
        },
      });

    } catch (error) {
      try {
        await connection.rollback();
      } catch {}

      console.error(
        "Create return request error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to create return request.",
      });
    } finally {
      connection.release();
    }
  }
);

/* =====================================================
   GET ALL RETURNS
===================================================== */

router.get(
  "/",
  authenticateToken,
  async (req, res) => {
    try {
      const userId =
        getUserId(req);

      if (!userId) {
        return res.status(401).json({
          success: false,
          message:
            "Invalid authenticated user.",
        });
      }

      let query = `
        SELECT
          r.id,
          r.order_id,
          r.return_status,
          r.reason,
          r.refund_amount,
          r.refund_status,
          r.requested_at,
          r.processed_at,
          r.created_by,

          o.order_number,
          o.customer_id,
          o.customer_name,
          o.customer_phone,
          o.order_type,
          o.order_status,
          o.payment_method,
          o.payment_status,
          o.total_amount

        FROM returns r

        INNER JOIN orders o
          ON o.id = r.order_id
      `;

      const params = [];

      /*
        Admin sees every return.

        Customer sees only returns
        belonging to their own account.
      */

      if (
        !isAdminUser(req)
      ) {
        query += `
          WHERE o.customer_id = ?
        `;

        params.push(userId);
      }

      query += `
        ORDER BY
          r.requested_at DESC
      `;

      const [returns] =
        await db.query(
          query,
          params
        );

      return res.json({
        success: true,
        returns,
      });

    } catch (error) {
      console.error(
        "Load returns error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to load return requests.",
      });
    }
  }
);

/* =====================================================
   GET SINGLE RETURN
===================================================== */

router.get(
  "/:id",
  authenticateToken,
  async (req, res) => {
    try {
      const userId =
        getUserId(req);

      if (!userId) {
        return res.status(401).json({
          success: false,
          message:
            "Invalid authenticated user.",
        });
      }

      const returnId =
        Number(
          req.params.id
        );

      if (
        !Number.isInteger(
          returnId
        ) ||
        returnId <= 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid return ID.",
        });
      }

      let query = `
        SELECT
          r.id,
          r.order_id,
          r.return_status,
          r.reason,
          r.refund_amount,
          r.refund_status,
          r.requested_at,
          r.processed_at,
          r.created_by,

          o.order_number,
          o.customer_id,
          o.customer_name,
          o.customer_phone,
          o.customer_email,
          o.delivery_address,
          o.order_type,
          o.order_status,
          o.payment_method,
          o.payment_status,
          o.total_amount

        FROM returns r

        INNER JOIN orders o
          ON o.id = r.order_id

        WHERE r.id = ?
      `;

      const params = [
        returnId,
      ];

      if (
        !isAdminUser(req)
      ) {
        query += `
          AND o.customer_id = ?
        `;

        params.push(userId);
      }

      query += `
        LIMIT 1
      `;

      const [rows] =
        await db.query(
          query,
          params
        );

      if (
        rows.length === 0
      ) {
        return res.status(404).json({
          success: false,
          message:
            "Return request not found.",
        });
      }

      return res.json({
        success: true,
        return: rows[0],
      });

    } catch (error) {
      console.error(
        "Load return details error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to load return details.",
      });
    }
  }
);

/* =====================================================
   APPROVE RETURN
===================================================== */

router.put(
  "/:id/approve",
  authenticateToken,
  async (req, res) => {
    const connection =
      await db.getConnection();

    try {
      if (
        !isAdminUser(req)
      ) {
        return res.status(403).json({
          success: false,
          message:
            "Only authorized staff can approve returns.",
        });
      }

      const userId =
        getUserId(req);

      if (!userId) {
        return res.status(401).json({
          success: false,
          message:
            "Invalid authenticated user.",
        });
      }

      const returnId =
        Number(
          req.params.id
        );

      if (
        !Number.isInteger(
          returnId
        ) ||
        returnId <= 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid return ID.",
        });
      }

      const [rows] =
        await connection.query(
          `
          SELECT
            r.id,
            r.order_id,
            r.return_status,
            r.refund_status,
            o.order_status,
            o.order_type
          FROM returns r
          INNER JOIN orders o
            ON o.id = r.order_id
          WHERE r.id = ?
          LIMIT 1
          `,
          [returnId]
        );

      if (
        rows.length === 0
      ) {
        return res.status(404).json({
          success: false,
          message:
            "Return request not found.",
        });
      }

      const returnRequest =
        rows[0];

      if (
        returnRequest.order_type !==
        "online"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Only online orders can be returned.",
        });
      }

      if (
        returnRequest.return_status !==
        "requested"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Only requested returns can be approved.",
        });
      }

      await connection.beginTransaction();

      await connection.query(
        `
        UPDATE returns
        SET
          return_status = 'approved'
        WHERE id = ?
        `,
        [returnId]
      );

      await connection.commit();

      return res.json({
        success: true,
        message:
          "Return request approved successfully.",
        return: {
          id:
            returnRequest.id,
          orderId:
            returnRequest.order_id,
          returnStatus:
            "approved",
          refundStatus:
            returnRequest.refund_status,
          approvedBy:
            userId,
        },
      });

    } catch (error) {
      try {
        await connection.rollback();
      } catch {}

      console.error(
        "Approve return error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to approve return request.",
      });
    } finally {
      connection.release();
    }
  }
);

/* =====================================================
   REJECT RETURN
===================================================== */

router.put(
  "/:id/reject",
  authenticateToken,
  async (req, res) => {
    const connection =
      await db.getConnection();

    try {
      if (
        !isAdminUser(req)
      ) {
        return res.status(403).json({
          success: false,
          message:
            "Only authorized staff can reject returns.",
        });
      }

      const returnId =
        Number(
          req.params.id
        );

      if (
        !Number.isInteger(
          returnId
        ) ||
        returnId <= 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid return ID.",
        });
      }

      const [rows] =
        await connection.query(
          `
          SELECT
            id,
            order_id,
            return_status
          FROM returns
          WHERE id = ?
          LIMIT 1
          `,
          [returnId]
        );

      if (
        rows.length === 0
      ) {
        return res.status(404).json({
          success: false,
          message:
            "Return request not found.",
        });
      }

      const returnRequest =
        rows[0];

      if (
        returnRequest.return_status !==
        "requested"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Only requested returns can be rejected.",
        });
      }

      await connection.beginTransaction();

      await connection.query(
        `
        UPDATE returns
        SET
          return_status = 'rejected'
        WHERE id = ?
        `,
        [returnId]
      );

      await connection.commit();

      return res.json({
        success: true,
        message:
          "Return request rejected successfully.",
        return: {
          id:
            returnRequest.id,
          orderId:
            returnRequest.order_id,
          returnStatus:
            "rejected",
        },
      });

    } catch (error) {
      try {
        await connection.rollback();
      } catch {}

      console.error(
        "Reject return error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to reject return request.",
      });
    } finally {
      connection.release();
    }
  }
);

/* =====================================================
   PROCESS RETURN / REFUND
===================================================== */

router.put(
  "/:id/process",
  authenticateToken,
  async (req, res) => {
    const connection =
      await db.getConnection();

    try {
      if (
        !isAdminUser(req)
      ) {
        return res.status(403).json({
          success: false,
          message:
            "Only authorized staff can process refunds.",
        });
      }

      const userId =
        getUserId(req);

      if (!userId) {
        return res.status(401).json({
          success: false,
          message:
            "Invalid authenticated user.",
        });
      }

      const returnId =
        Number(
          req.params.id
        );

      if (
        !Number.isInteger(
          returnId
        ) ||
        returnId <= 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid return ID.",
        });
      }

      const [returnRows] =
        await connection.query(
          `
          SELECT
            r.id,
            r.order_id,
            r.return_status,
            r.refund_status,
            r.refund_amount,

            o.order_number,
            o.order_type,
            o.order_status,
            o.payment_status,
            o.payment_method,
            o.total_amount

          FROM returns r

          INNER JOIN orders o
            ON o.id = r.order_id

          WHERE r.id = ?

          LIMIT 1
          `,
          [returnId]
        );

      if (
        returnRows.length === 0
      ) {
        return res.status(404).json({
          success: false,
          message:
            "Return request not found.",
        });
      }

      const returnRequest =
        returnRows[0];

      if (
        returnRequest.order_type !==
        "online"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Only online orders can be processed for return.",
        });
      }

      if (
        returnRequest.return_status !==
        "approved"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Only approved returns can be processed.",
        });
      }

      if (
        returnRequest.refund_status ===
        "processed"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "This return has already been processed.",
        });
      }

      const [items] =
        await connection.query(
          `
          SELECT
            id,
            product_id,
            product_name,
            sku,
            quantity,
            unit_price,
            total_price
          FROM order_items
          WHERE order_id = ?
          ORDER BY id ASC
          `,
          [returnRequest.order_id]
        );

      if (
        items.length === 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Cannot process return without order items.",
        });
      }

      await connection.beginTransaction();

      /* =========================================
         RESTORE STOCK
      ========================================= */

      for (
        const item of items
      ) {
        const quantity =
          Number(
            item.quantity
          );

        if (
          !Number.isInteger(
            quantity
          ) ||
          quantity <= 0
        ) {
          throw new Error(
            `Invalid return quantity for ${item.product_name}.`
          );
        }

        const [
          productRows,
        ] =
          await connection.query(
            `
            SELECT
              id,
              name,
              stock_quantity
            FROM products
            WHERE id = ?
            FOR UPDATE
            `,
            [item.product_id]
          );

        if (
          productRows.length ===
          0
        ) {
          throw new Error(
            `Product with ID ${item.product_id} was not found.`
          );
        }

        const product =
          productRows[0];

        const previousStock =
          Number(
            product.stock_quantity
          );

        const newStock =
          previousStock +
          quantity;

        await connection.query(
          `
          UPDATE products
          SET
            stock_quantity = ?
          WHERE id = ?
          `,
          [
            newStock,
            item.product_id,
          ]
        );

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
            'return',
            ?,
            ?,
            ?
          )
          `,
          [
            item.product_id,
            quantity,
            returnId,
            `Return for ${returnRequest.order_number}`,
            userId,
          ]
        );

        /* -----------------------------------------
           STOCK MOVEMENT
        ----------------------------------------- */

        await connection.query(
          `
          INSERT INTO stock_movements
          (
            product_id,
            previous_stock,
            quantity_changed,
            new_stock,
            reason,
            reference_id,
            created_by
          )
          VALUES
          (
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?
          )
          `,
          [
            item.product_id,
            previousStock,
            quantity,
            newStock,
            "Return",
            returnId,
            userId,
          ]
        );
      }

      /* =========================================
         REFUND PAYMENT
      ========================================= */

      await connection.query(
        `
        UPDATE payments
        SET
          payment_status = 'refunded',
          transaction_id =
            COALESCE(
              transaction_id,
              ?
            )
        WHERE order_id = ?
        `,
        [
          `REF-${Date.now()}`,
          returnRequest.order_id,
        ]
      );

      /* =========================================
         ORDER PAYMENT STATUS
      ========================================= */

      await connection.query(
        `
        UPDATE orders
        SET
          payment_status = 'refunded'
        WHERE id = ?
        `,
        [returnRequest.order_id]
      );

      /* =========================================
         COMPLETE RETURN
      ========================================= */

      await connection.query(
        `
        UPDATE returns
        SET
          return_status = 'completed',
          refund_status = 'processed',
          processed_at =
            CURRENT_TIMESTAMP
        WHERE id = ?
        `,
        [returnId]
      );

      await connection.commit();

      return res.json({
        success: true,

        message:
          "Return processed successfully. Stock restored and refund completed.",

        return: {
          id:
            returnId,

          orderId:
            returnRequest.order_id,

          orderNumber:
            returnRequest.order_number,

          returnStatus:
            "completed",

          refundStatus:
            "processed",

          refundAmount:
            Number(
              returnRequest.refund_amount
            ),

          restoredItems:
            items.length,

          processedBy:
            userId,
        },
      });

    } catch (error) {
      try {
        await connection.rollback();
      } catch {}

      console.error(
        "Process return error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to process return.",
      });
    } finally {
      connection.release();
    }
  }
);

module.exports = router;