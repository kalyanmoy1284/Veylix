const express = require("express");
const db = require("../db");
const {
  authenticateToken,
} = require("../middleware/authMiddleware");

const router = express.Router();

const ADMIN_ROLES = [
  "admin",
  "manager",
  "employee",
];

function requireAdminRole(
  req,
  res,
  next
) {
  if (
    !req.user ||
    req.user.accountType !== "admin" ||
    !ADMIN_ROLES.includes(
      req.user.role
    )
  ) {
    return res.status(403).json({
      success: false,
      message:
        "You are not authorized to manage products.",
    });
  }

  next();
}

/*
=========================================================
PUBLIC
GET ALL ACTIVE PRODUCTS
=========================================================
*/

router.get("/", async (req, res) => {
  try {
    const [products] =
      await db.query(`
      SELECT
        p.id,
        p.name,
        p.sku,
        p.description,
        p.price,
        p.stock_quantity,
        p.low_stock_threshold,
        p.image,
        p.is_active,
        c.name AS category
      FROM products p
      LEFT JOIN categories c
        ON p.category_id = c.id
      WHERE p.is_active = TRUE
      ORDER BY p.id DESC
    `);

    res.json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error(
      "Get products error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to fetch products.",
      error: error.message,
    });
  }
});

/*
=========================================================
ADMIN
GET ALL PRODUCTS
=========================================================
*/

router.get(
  "/admin",
  authenticateToken,
  requireAdminRole,
  async (req, res) => {
    try {
      const [products] =
        await db.query(`
        SELECT
          p.id,
          p.name,
          p.sku,
          p.description,
          p.price,
          p.cost_price,
          p.stock_quantity,
          p.low_stock_threshold,
          p.image,
          p.is_active,
          p.category_id,
          c.name AS category
        FROM products p
        LEFT JOIN categories c
          ON p.category_id = c.id
        ORDER BY p.id DESC
      `);

      res.json({
        success: true,
        count: products.length,
        products,
      });
    } catch (error) {
      console.error(
        "Admin get products error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to fetch admin products.",
        error: error.message,
      });
    }
  }
);

/*
=========================================================
ADMIN
GET CATEGORIES

Only id and name are needed by the
product form, so we keep this query
simple and schema-safe.
=========================================================
*/

router.get(
  "/categories",
  authenticateToken,
  requireAdminRole,
  async (req, res) => {
    try {
      const [categories] =
        await db.query(`
        SELECT
          id,
          name
        FROM categories
        WHERE name IS NOT NULL
        ORDER BY name ASC
      `);

      res.json({
        success: true,
        count: categories.length,
        categories,
      });
    } catch (error) {
      console.error(
        "Get categories error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to fetch categories.",
        error: error.message,
      });
    }
  }
);

/*
=========================================================
ADMIN
ADD PRODUCT
=========================================================
*/

router.post(
  "/",
  authenticateToken,
  requireAdminRole,
  async (req, res) => {
    try {
      const {
        name,
        sku,
        description,
        price,
        cost_price,
        stock_quantity,
        low_stock_threshold,
        image,
        category_id,
      } = req.body;

      const cleanName =
        String(name || "").trim();

      const cleanSku =
        String(sku || "")
          .trim()
          .toUpperCase();

      const numericPrice =
        Number(price);

      const numericCostPrice =
        Number(
          cost_price || 0
        );

      const numericStock =
        Number(
          stock_quantity || 0
        );

      const numericThreshold =
        Number(
          low_stock_threshold || 0
        );

      const numericCategoryId =
        Number(category_id);

      if (!cleanName) {
        return res.status(400).json({
          success: false,
          message:
            "Product name is required.",
        });
      }

      if (!cleanSku) {
        return res.status(400).json({
          success: false,
          message:
            "SKU is required.",
        });
      }

      if (
        !Number.isFinite(
          numericPrice
        ) ||
        numericPrice <= 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Selling price must be greater than 0.",
        });
      }

      if (
        !Number.isFinite(
          numericCostPrice
        ) ||
        numericCostPrice < 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Cost price must be 0 or greater.",
        });
      }

      if (
        !Number.isInteger(
          numericStock
        ) ||
        numericStock < 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Stock quantity must be a valid non-negative integer.",
        });
      }

      if (
        !Number.isInteger(
          numericThreshold
        ) ||
        numericThreshold < 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Low stock threshold must be a valid non-negative integer.",
        });
      }

      if (
        !Number.isInteger(
          numericCategoryId
        ) ||
        numericCategoryId <= 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "A valid category is required.",
        });
      }

      const [
        existingSku,
      ] = await db.query(
        `
        SELECT id
        FROM products
        WHERE sku = ?
        LIMIT 1
        `,
        [cleanSku]
      );

      if (
        existingSku.length > 0
      ) {
        return res.status(409).json({
          success: false,
          message:
            "A product with this SKU already exists.",
        });
      }

      const [
        existingCategory,
      ] = await db.query(
        `
        SELECT id
        FROM categories
        WHERE id = ?
        LIMIT 1
        `,
        [numericCategoryId]
      );

      if (
        existingCategory.length ===
        0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Selected category does not exist.",
        });
      }

      const [
        result,
      ] = await db.query(
        `
        INSERT INTO products (
          name,
          sku,
          description,
          price,
          cost_price,
          stock_quantity,
          low_stock_threshold,
          image,
          category_id,
          is_active
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE)
        `,
        [
          cleanName,
          cleanSku,
          String(
            description || ""
          ).trim(),
          numericPrice,
          numericCostPrice,
          numericStock,
          numericThreshold,
          String(
            image || ""
          ).trim(),
          numericCategoryId,
        ]
      );

      const [
        newProduct,
      ] = await db.query(
        `
        SELECT
          p.id,
          p.name,
          p.sku,
          p.description,
          p.price,
          p.cost_price,
          p.stock_quantity,
          p.low_stock_threshold,
          p.image,
          p.is_active,
          p.category_id,
          c.name AS category
        FROM products p
        LEFT JOIN categories c
          ON p.category_id = c.id
        WHERE p.id = ?
        LIMIT 1
        `,
        [result.insertId]
      );

      return res.status(201).json({
        success: true,
        message:
          "Product created successfully.",
        product:
          newProduct[0] ||
          null,
      });
    } catch (error) {
      console.error(
        "Create product error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to create product.",
        error: error.message,
      });
    }
  }
);

/*
=========================================================
ADMIN
UPDATE PRODUCT
=========================================================
*/

router.put(
  "/:id",
  authenticateToken,
  requireAdminRole,
  async (req, res) => {
    try {
      const productId =
        Number(req.params.id);

      if (
        !Number.isInteger(
          productId
        ) ||
        productId <= 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid product ID.",
        });
      }

      const [
        existingProduct,
      ] = await db.query(
        `
        SELECT *
        FROM products
        WHERE id = ?
        LIMIT 1
        `,
        [productId]
      );

      if (
        existingProduct.length ===
        0
      ) {
        return res.status(404).json({
          success: false,
          message:
            "Product not found.",
        });
      }

      const current =
        existingProduct[0];

      const cleanName =
        req.body.name !==
        undefined
          ? String(
              req.body.name || ""
            ).trim()
          : current.name;

      const cleanSku =
        req.body.sku !==
        undefined
          ? String(
              req.body.sku || ""
            )
              .trim()
              .toUpperCase()
          : current.sku;

      const description =
        req.body.description !==
        undefined
          ? String(
              req.body.description ||
                ""
            ).trim()
          : current.description;

      const numericPrice =
        req.body.price !==
        undefined
          ? Number(
              req.body.price
            )
          : Number(
              current.price
            );

      const numericCostPrice =
        req.body.cost_price !==
        undefined
          ? Number(
              req.body.cost_price ||
                0
            )
          : Number(
              current.cost_price ||
                0
            );

      const numericStock =
        req.body.stock_quantity !==
        undefined
          ? Number(
              req.body
                .stock_quantity
            )
          : Number(
              current.stock_quantity
            );

      const numericThreshold =
        req.body
          .low_stock_threshold !==
        undefined
          ? Number(
              req.body
                .low_stock_threshold
            )
          : Number(
              current.low_stock_threshold
            );

      const image =
        req.body.image !==
        undefined
          ? String(
              req.body.image || ""
            ).trim()
          : current.image;

      const numericCategoryId =
        req.body.category_id !==
        undefined
          ? Number(
              req.body
                .category_id
            )
          : Number(
              current.category_id
            );

      if (!cleanName) {
        return res.status(400).json({
          success: false,
          message:
            "Product name is required.",
        });
      }

      if (!cleanSku) {
        return res.status(400).json({
          success: false,
          message:
            "SKU is required.",
        });
      }

      if (
        !Number.isFinite(
          numericPrice
        ) ||
        numericPrice <= 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Selling price must be greater than 0.",
        });
      }

      if (
        !Number.isFinite(
          numericCostPrice
        ) ||
        numericCostPrice < 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Cost price must be 0 or greater.",
        });
      }

      if (
        !Number.isInteger(
          numericStock
        ) ||
        numericStock < 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Stock quantity must be a valid non-negative integer.",
        });
      }

      if (
        !Number.isInteger(
          numericThreshold
        ) ||
        numericThreshold < 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Low stock threshold must be a valid non-negative integer.",
        });
      }

      if (
        !Number.isInteger(
          numericCategoryId
        ) ||
        numericCategoryId <= 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "A valid category is required.",
        });
      }

      const [
        duplicateSku,
      ] = await db.query(
        `
        SELECT id
        FROM products
        WHERE sku = ?
          AND id <> ?
        LIMIT 1
        `,
        [
          cleanSku,
          productId,
        ]
      );

      if (
        duplicateSku.length > 0
      ) {
        return res.status(409).json({
          success: false,
          message:
            "Another product already uses this SKU.",
        });
      }

      const [
        categoryExists,
      ] = await db.query(
        `
        SELECT id
        FROM categories
        WHERE id = ?
        LIMIT 1
        `,
        [numericCategoryId]
      );

      if (
        categoryExists.length ===
        0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Selected category does not exist.",
        });
      }

      const isActive =
        req.body.is_active !==
        undefined
          ? Boolean(
              req.body.is_active
            )
          : Boolean(
              current.is_active
            );

      await db.query(
        `
        UPDATE products
        SET
          name = ?,
          sku = ?,
          description = ?,
          price = ?,
          cost_price = ?,
          stock_quantity = ?,
          low_stock_threshold = ?,
          image = ?,
          category_id = ?,
          is_active = ?
        WHERE id = ?
        `,
        [
          cleanName,
          cleanSku,
          description,
          numericPrice,
          numericCostPrice,
          numericStock,
          numericThreshold,
          image,
          numericCategoryId,
          isActive ? 1 : 0,
          productId,
        ]
      );

      const [
        updatedProduct,
      ] = await db.query(
        `
        SELECT
          p.id,
          p.name,
          p.sku,
          p.description,
          p.price,
          p.cost_price,
          p.stock_quantity,
          p.low_stock_threshold,
          p.image,
          p.is_active,
          p.category_id,
          c.name AS category
        FROM products p
        LEFT JOIN categories c
          ON p.category_id = c.id
        WHERE p.id = ?
        LIMIT 1
        `,
        [productId]
      );

      return res.json({
        success: true,
        message:
          "Product updated successfully.",
        product:
          updatedProduct[0] ||
          null,
      });
    } catch (error) {
      console.error(
        "Update product error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to update product.",
        error: error.message,
      });
    }
  }
);

/*
=========================================================
ADMIN
DEACTIVATE / REACTIVATE
=========================================================
*/

router.patch(
  "/:id/status",
  authenticateToken,
  requireAdminRole,
  async (req, res) => {
    try {
      const productId =
        Number(req.params.id);

      const isActive =
        Boolean(
          req.body.is_active
        );

      if (
        !Number.isInteger(
          productId
        ) ||
        productId <= 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid product ID.",
        });
      }

      const [
        existingProduct,
      ] = await db.query(
        `
        SELECT id, name
        FROM products
        WHERE id = ?
        LIMIT 1
        `,
        [productId]
      );

      if (
        existingProduct.length ===
        0
      ) {
        return res.status(404).json({
          success: false,
          message:
            "Product not found.",
        });
      }

      await db.query(
        `
        UPDATE products
        SET is_active = ?
        WHERE id = ?
        `,
        [
          isActive ? 1 : 0,
          productId,
        ]
      );

      return res.json({
        success: true,
        message: isActive
          ? "Product reactivated successfully."
          : "Product deactivated successfully.",
      });
    } catch (error) {
      console.error(
        "Product status error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to update product status.",
        error: error.message,
      });
    }
  }
);

module.exports = router;