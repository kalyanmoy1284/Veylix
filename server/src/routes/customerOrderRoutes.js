const express = require("express");

const db = require("../db");
const {
  authenticateToken,
} = require("../middleware/authMiddleware");

const router = express.Router();

/* =====================================================
   GET LOGGED-IN CUSTOMER ORDERS
===================================================== */

router.get(
  "/",
  authenticateToken,
  async (req, res) => {
    try {
      /* =========================================
         CUSTOMER AUTH CHECK
      ========================================= */

      if (
        !req.user ||
        req.user.accountType !==
          "customer"
      ) {
        return res.status(403).json({
          success: false,
          message:
            "Only customer accounts can access customer orders.",
        });
      }

      const customerId =
        Number(req.user.id);

      if (
        !Number.isInteger(
          customerId
        ) ||
        customerId <= 0
      ) {
        return res.status(401).json({
          success: false,
          message:
            "Invalid customer authentication.",
        });
      }

      /* =========================================
         FETCH CUSTOMER ORDERS
      ========================================= */

      const [orders] =
        await db.query(
          `
          SELECT
            o.id,
            o.order_number,
            o.customer_id,
            o.customer_name,
            o.customer_phone,
            o.customer_email,
            o.delivery_address,
            o.city,
            o.area,
            o.postal_code,
            o.order_type,
            o.payment_method,
            o.payment_status,
            o.order_status,
            o.subtotal,
            o.discount,
            o.shipping_cost,
            o.total_amount,
            o.notes,
            o.created_at,
            o.updated_at,

            (
              SELECT COUNT(*)
              FROM order_items oi
              WHERE oi.order_id = o.id
            ) AS item_count,

            (
              SELECT COALESCE(
                JSON_ARRAYAGG(
                  JSON_OBJECT(
                    'id', oi.id,
                    'order_id', oi.order_id,
                    'product_id', oi.product_id,
                    'product_name', oi.product_name,
                    'sku', oi.sku,
                    'quantity', oi.quantity,
                    'unit_price', oi.unit_price,
                    'discount', oi.discount,
                    'total_price', oi.total_price
                  )
                ),
                JSON_ARRAY()
              )
              FROM order_items oi
              WHERE oi.order_id = o.id
            ) AS items

          FROM orders o
          WHERE o.customer_id = ?
          ORDER BY o.created_at DESC
          `,
          [customerId]
        );

      /* =========================================
         FORMAT ITEMS
      ========================================= */

      const formattedOrders =
        orders.map((order) => {
          let parsedItems = [];

          try {
            if (
              Array.isArray(
                order.items
              )
            ) {
              parsedItems =
                order.items;
            } else if (
              typeof order.items ===
              "string"
            ) {
              parsedItems =
                JSON.parse(
                  order.items
                );
            }
          } catch {
            parsedItems = [];
          }

          return {
            ...order,
            items:
              Array.isArray(
                parsedItems
              )
                ? parsedItems
                : [],
            item_count: Number(
              order.item_count || 0
            ),
          };
        });

      /* =========================================
         RESPONSE
      ========================================= */

      return res.json({
        success: true,
        count:
          formattedOrders.length,
        orders:
          formattedOrders,
      });
    } catch (error) {
      console.error(
        "Customer orders error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to fetch customer orders.",
        error: error.message,
      });
    }
  }
);

module.exports = router;