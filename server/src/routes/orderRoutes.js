const express = require("express");
const db = require("../db");
const {
  authenticateToken,
} = require("../middleware/authMiddleware");

const router = express.Router();

const allowedAdminRoles = [
  "admin",
  "manager",
  "employee",
];

/*
=========================================================
ORDER AUTHENTICATION
=========================================================
*/

const authenticateOrderRequest = (
  req,
  res,
  next
) => {
  const orderType =
    req.body?.orderType || "online";

  return authenticateToken(
    req,
    res,
    () => {
      /*
      POS ORDER
      */

      if (orderType === "pos") {
        if (
          req.user?.accountType !==
            "admin" ||
          !allowedAdminRoles.includes(
            req.user?.role
          )
        ) {
          return res.status(403).json({
            success: false,
            message:
              "Admin access is required for POS sales.",
          });
        }

        return next();
      }

      /*
      ONLINE ORDER
      */

      if (
        req.user?.accountType !==
        "customer"
      ) {
        return res.status(403).json({
          success: false,
          message:
            "Customer authentication is required for online orders.",
        });
      }

      next();
    }
  );
};

/*
=========================================================
GET ALL ORDERS
ADMIN / MANAGER / EMPLOYEE ONLY
=========================================================
*/

router.get(
  "/",
  authenticateToken,
  async (req, res) => {
    try {
      if (
        req.user?.accountType !==
          "admin" ||
        !allowedAdminRoles.includes(
          req.user?.role
        )
      ) {
        return res.status(403).json({
          success: false,
          message:
            "Admin access is required.",
        });
      }

      const [orders] =
        await db.query(`
        SELECT
          o.id,
          o.order_number,
          o.customer_id,
          o.customer_name,
          o.customer_phone,
          o.customer_email,
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

        ORDER BY o.created_at DESC
      `);

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
            items: Array.isArray(
              parsedItems
            )
              ? parsedItems
              : [],
            item_count: Number(
              order.item_count || 0
            ),
          };
        });

      res.json({
        success: true,
        count:
          formattedOrders.length,
        orders:
          formattedOrders,
      });
    } catch (error) {
      console.error(
        "Get orders error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to fetch orders.",
        error: error.message,
      });
    }
  }
);

/*
=========================================================
GET SINGLE ORDER
ADMIN / MANAGER / EMPLOYEE ONLY
=========================================================
*/

router.get(
  "/:id",
  authenticateToken,
  async (req, res) => {
    try {
      if (
        req.user?.accountType !==
          "admin" ||
        !allowedAdminRoles.includes(
          req.user?.role
        )
      ) {
        return res.status(403).json({
          success: false,
          message:
            "Admin access is required.",
        });
      }

      const orderId = Number(
        req.params.id
      );

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

      const [orders] =
        await db.query(
          `
          SELECT
            id,
            order_number,
            customer_id,
            customer_name,
            customer_phone,
            customer_email,
            delivery_address,
            city,
            area,
            postal_code,
            order_type,
            payment_method,
            payment_status,
            order_status,
            subtotal,
            discount,
            shipping_cost,
            total_amount,
            notes,
            created_by,
            created_at,
            updated_at

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

      const [items] =
        await db.query(
          `
          SELECT
            id,
            order_id,
            product_id,
            product_name,
            sku,
            quantity,
            unit_price,
            discount,
            total_price

          FROM order_items

          WHERE order_id = ?

          ORDER BY id ASC
          `,
          [orderId]
        );

      const [payments] =
        await db.query(
          `
          SELECT
            id,
            order_id,
            payment_method,
            transaction_id,
            amount,
            payment_status,
            paid_at,
            created_at

          FROM payments

          WHERE order_id = ?

          ORDER BY id ASC
          `,
          [orderId]
        );

      res.json({
        success: true,
        order: {
          ...orders[0],
          items,
          payments,
        },
      });
    } catch (error) {
      console.error(
        "Get single order error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to fetch order.",
        error: error.message,
      });
    }
  }
);

/*
=========================================================
CREATE NEW ORDER

Supported order types:
online
pos

Supported payment methods:
cod
bkash
nagad
rocket
card
cash
=========================================================
*/

router.post(
  "/",
  authenticateOrderRequest,
  async (req, res) => {
    const connection =
      await db.getConnection();

    try {
      const {
        customer,
        items,
        orderType = "online",
        paymentMethod = "cod",
        discount = 0,
        shippingCost =
          orderType === "pos"
            ? 0
            : 100,
        notes = null,
      } = req.body;

      /*
      =====================================================
      CREATED BY
      =====================================================
      */

      const createdBy =
        orderType === "pos"
          ? req.user.id
          : null;

      /*
      =====================================================
      BASIC VALIDATION
      =====================================================
      */

      if (
        !Array.isArray(items) ||
        items.length === 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Order must contain at least one product.",
        });
      }

      const allowedOrderTypes = [
        "online",
        "pos",
      ];

      if (
        !allowedOrderTypes.includes(
          orderType
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid order type.",
        });
      }

      /*
      =====================================================
      PAYMENT METHODS
      =====================================================
      */

      const allowedPaymentMethods = [
        "cod",
        "bkash",
        "nagad",
        "rocket",
        "card",
        "cash",
      ];

      if (
        !allowedPaymentMethods.includes(
          paymentMethod
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid payment method.",
        });
      }

      /*
      =====================================================
      START DATABASE TRANSACTION
      =====================================================
      */

      await connection.beginTransaction();

      /*
      =====================================================
      CUSTOMER
      =====================================================
      */

      let customerId = null;

      /*
      ONLINE CUSTOMER

      Must use authenticated customer ID.
      */

      if (
        orderType === "online"
      ) {
        customerId = Number(
          req.user?.id
        );

        if (
          !Number.isInteger(
            customerId
          ) ||
          customerId <= 0
        ) {
          throw new Error(
            "Invalid authenticated customer account."
          );
        }

        const [
          authenticatedCustomerRows,
        ] =
          await connection.query(
            `
            SELECT id
            FROM customers
            WHERE id = ?
            LIMIT 1
            `,
            [customerId]
          );

        if (
          authenticatedCustomerRows.length ===
          0
        ) {
          throw new Error(
            "Authenticated customer account was not found."
          );
        }

        /*
        Update authenticated customer's
        latest delivery information.
        */

        await connection.query(
          `
          UPDATE customers

          SET
            name = ?,
            email = ?,
            address = ?,
            city = ?,
            area = ?,
            postal_code = ?

          WHERE id = ?
          `,
          [
            customer?.name ||
              null,

            customer?.email ||
              null,

            customer?.address ||
              null,

            customer?.city ||
              null,

            customer?.area ||
              null,

            customer?.postalCode ||
              null,

            customerId,
          ]
        );
      }

      /*
      POS / WALK-IN CUSTOMER
      */

      else if (
        customer &&
        customer.phone
      ) {
        const customerPhone =
          String(
            customer.phone
          ).trim();

        const [
          existingCustomers,
        ] =
          await connection.query(
            `
            SELECT id

            FROM customers

            WHERE phone = ?

            LIMIT 1
            `,
            [customerPhone]
          );

        if (
          existingCustomers.length >
          0
        ) {
          customerId =
            existingCustomers[0].id;

          await connection.query(
            `
            UPDATE customers

            SET
              name = ?,
              email = ?,
              address = ?,
              city = ?,
              area = ?,
              postal_code = ?

            WHERE id = ?
            `,
            [
              customer.name ||
                "Walk-in Customer",

              customer.email ||
                null,

              customer.address ||
                null,

              customer.city ||
                null,

              customer.area ||
                null,

              customer.postalCode ||
                null,

              customerId,
            ]
          );
        } else {
          const [
            customerResult,
          ] =
            await connection.query(
              `
              INSERT INTO customers
              (
                name,
                phone,
                email,
                address,
                city,
                area,
                postal_code
              )

              VALUES (?, ?, ?, ?, ?, ?, ?)
              `,
              [
                customer.name ||
                  "Walk-in Customer",

                customerPhone,

                customer.email ||
                  null,

                customer.address ||
                  null,

                customer.city ||
                  null,

                customer.area ||
                  null,

                customer.postalCode ||
                  null,
              ]
            );

          customerId =
            customerResult.insertId;
        }
      }

      /*
      =====================================================
      PREPARE ORDER ITEMS
      =====================================================
      */

      const orderItems = [];

      let subtotal = 0;

      for (
        const item of items
      ) {
        const productId =
          Number(
            item.productId
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
            "Invalid product ID in order."
          );
        }

        if (
          !Number.isInteger(
            quantity
          ) ||
          quantity <= 0
        ) {
          throw new Error(
            "Invalid product quantity in order."
          );
        }

        /*
        Lock product row
        to prevent overselling.
        */

        const [
          productRows,
        ] =
          await connection.query(
            `
            SELECT
              id,
              name,
              sku,
              price,
              stock_quantity

            FROM products

            WHERE id = ?
              AND is_active = TRUE

            FOR UPDATE
            `,
            [productId]
          );

        if (
          productRows.length ===
          0
        ) {
          throw new Error(
            `Product with ID ${productId} was not found.`
          );
        }

        const product =
          productRows[0];

        /*
        STOCK CHECK
        */

        if (
          Number(
            product.stock_quantity
          ) < quantity
        ) {
          throw new Error(
            `Insufficient stock for ${product.name}. Available: ${product.stock_quantity}`
          );
        }

        /*
        PRICE CALCULATION
        */

        const unitPrice =
          Number(
            product.price
          );

        const totalPrice =
          unitPrice *
          quantity;

        subtotal +=
          totalPrice;

        orderItems.push({
          productId:
            product.id,

          productName:
            product.name,

          sku:
            product.sku,

          quantity,

          unitPrice,

          totalPrice,

          currentStock:
            Number(
              product.stock_quantity
            ),
        });
      }

      /*
      =====================================================
      TOTAL CALCULATION
      =====================================================
      */

      const discountAmount =
        Math.max(
          0,
          Number(
            discount
          ) || 0
        );

      const shippingAmount =
        Math.max(
          0,
          Number(
            shippingCost
          ) || 0
        );

      const totalAmount =
        subtotal -
        discountAmount +
        shippingAmount;

      if (
        totalAmount < 0
      ) {
        throw new Error(
          "Order total cannot be negative."
        );
      }

      /*
      =====================================================
      ORDER NUMBER
      =====================================================
      */

      const [
        storeSettings,
      ] =
        await connection.query(
          `
          SELECT
            invoice_prefix

          FROM store_settings

          LIMIT 1
          `
        );

      const prefix =
        storeSettings.length >
          0 &&
        storeSettings[0]
          .invoice_prefix
          ? storeSettings[0]
              .invoice_prefix
          : "VXL";

      const orderNumber =
        `${prefix}-${Date.now()}`;

      /*
      =====================================================
      PAYMENT STATUS
      =====================================================

      POS:
      every non COD payment = paid

      ONLINE:
      bKash = paid
      Nagad = paid
      Rocket = paid
      Card = paid
      COD = pending
      =====================================================
      */

      const isImmediatelyPaid =
        (orderType === "pos" &&
          paymentMethod !==
            "cod") ||
        (orderType === "online" &&
          [
            "bkash",
            "nagad",
            "rocket",
            "card",
          ].includes(
            paymentMethod
          ));

      const paymentStatus =
        isImmediatelyPaid
          ? "paid"
          : "pending";

      /*
      Current project uses a generated
      transaction ID for payment records.
      */

      const generatedTransactionId =
        isImmediatelyPaid
          ? `${paymentMethod.toUpperCase()}-${Date.now()}-${Math.floor(
              Math.random() *
                100000
            )}`
          : null;

      /*
      =====================================================
      ORDER STATUS
      =====================================================
      */

      const orderStatus =
        orderType === "pos"
          ? "completed"
          : "pending";

      /*
      =====================================================
      CREATE ORDER
      =====================================================
      */

      const [
        orderResult,
      ] =
        await connection.query(
          `
          INSERT INTO orders
          (
            order_number,
            customer_id,
            customer_name,
            customer_phone,
            customer_email,
            delivery_address,
            city,
            area,
            postal_code,
            order_type,
            payment_method,
            payment_status,
            order_status,
            subtotal,
            discount,
            shipping_cost,
            total_amount,
            notes,
            created_by
          )

          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `,
          [
            orderNumber,

            customerId,

            customer?.name ||
              "Walk-in Customer",

            customer?.phone ||
              null,

            customer?.email ||
              null,

            customer?.address ||
              null,

            customer?.city ||
              null,

            customer?.area ||
              null,

            customer?.postalCode ||
              null,

            orderType,

            paymentMethod,

            paymentStatus,

            orderStatus,

            subtotal,

            discountAmount,

            shippingAmount,

            totalAmount,

            notes,

            createdBy,
          ]
        );

      const orderId =
        orderResult.insertId;

      /*
      =====================================================
      CREATE ORDER ITEMS
      =====================================================
      */

      for (
        const item of orderItems
      ) {
        await connection.query(
          `
          INSERT INTO order_items
          (
            order_id,
            product_id,
            product_name,
            sku,
            quantity,
            unit_price,
            discount,
            total_price
          )

          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `,
          [
            orderId,

            item.productId,

            item.productName,

            item.sku,

            item.quantity,

            item.unitPrice,

            0,

            item.totalPrice,
          ]
        );
      }

      /*
      =====================================================
      CREATE PAYMENT
      =====================================================
      */

      await connection.query(
        `
        INSERT INTO payments
        (
          order_id,
          payment_method,
          transaction_id,
          amount,
          payment_status,
          paid_at
        )

        VALUES (?, ?, ?, ?, ?, ?)
        `,
        [
          orderId,

          paymentMethod,

          generatedTransactionId,

          totalAmount,

          paymentStatus,

          paymentStatus ===
          "paid"
            ? new Date()
            : null,
        ]
      );

      /*
      =====================================================
      UPDATE STOCK
      =====================================================
      */

      for (
        const item of orderItems
      ) {
        const newStock =
          item.currentStock -
          item.quantity;

        await connection.query(
          `
          UPDATE products

          SET
            stock_quantity = ?

          WHERE id = ?
          `,
          [
            newStock,
            item.productId,
          ]
        );

        /*
        INVENTORY TRANSACTION
        */

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

          VALUES (?, 'sale', ?, 'order', ?, ?, ?)
          `,
          [
            item.productId,

            -item.quantity,

            orderId,

            `Sale ${orderNumber}`,

            createdBy,
          ]
        );

        /*
        STOCK HISTORY
        */

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

          VALUES (?, ?, ?, ?, ?, ?, ?)
          `,
          [
            item.productId,

            item.currentStock,

            -item.quantity,

            newStock,

            "Sale",

            orderId,

            createdBy,
          ]
        );
      }

      /*
      =====================================================
      COMMIT
      =====================================================
      */

      await connection.commit();

      /*
      =====================================================
      RESPONSE
      =====================================================
      */

      res.status(201).json({
        success: true,

        message:
          "Order created successfully.",

        order: {
          id: orderId,

          orderNumber,

          customerId,

          orderType,

          paymentMethod,

          paymentStatus,

          transactionId:
            generatedTransactionId,

          orderStatus,

          subtotal,

          discount:
            discountAmount,

          shippingCost:
            shippingAmount,

          totalAmount,

          items:
            orderItems.map(
              (item) => ({
                productId:
                  item.productId,

                productName:
                  item.productName,

                sku:
                  item.sku,

                quantity:
                  item.quantity,

                unitPrice:
                  item.unitPrice,

                totalPrice:
                  item.totalPrice,
              })
            ),
        },
      });
    } catch (error) {
      /*
      =====================================================
      ROLLBACK
      =====================================================
      */

      try {
        await connection.rollback();
      } catch {}

      console.error(
        "Create order error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to create order.",
        error: error.message,
      });
    } finally {
      connection.release();
    }
  }
);

module.exports = router;