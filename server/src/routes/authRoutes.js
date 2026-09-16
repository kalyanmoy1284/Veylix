const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const db = require("../db");

const router = express.Router();

/* =====================================================
   ADMIN / MANAGER / EMPLOYEE LOGIN
===================================================== */

router.post("/login", async (req, res) => {
  try {
    const {
      email,
      password,
    } = req.body;

    /* =========================================
       VALIDATION
    ========================================= */

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message:
          "Email and password are required.",
      });
    }

    /* =========================================
       FIND USER
    ========================================= */

    const [users] = await db.query(
      `
      SELECT
        id,
        name,
        email,
        password,
        role,
        is_active
      FROM users
      WHERE email = ?
      LIMIT 1
      `,
      [
        email
          .trim()
          .toLowerCase(),
      ]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid email or password.",
      });
    }

    const user = users[0];

    /* =========================================
       ACTIVE CHECK
    ========================================= */

    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message:
          "This account is inactive.",
      });
    }

    /* =========================================
       ROLE CHECK
    ========================================= */

    const allowedRoles = [
      "admin",
      "manager",
      "employee",
    ];

    if (
      !allowedRoles.includes(
        user.role
      )
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You are not authorized to access this system.",
      });
    }

    /* =========================================
       PASSWORD CHECK
    ========================================= */

    const passwordMatch =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid email or password.",
      });
    }

    /* =========================================
       JWT TOKEN
    ========================================= */

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        accountType: "admin",
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    /* =========================================
       RESPONSE
    ========================================= */

    res.json({
      success: true,
      message:
        "Login successful.",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        accountType: "admin",
      },
    });
  } catch (error) {
    console.error(
      "Admin login error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Login failed.",
      error: error.message,
    });
  }
});

/* =====================================================
   CUSTOMER REGISTRATION
===================================================== */

router.post(
  "/customer/register",
  async (req, res) => {
    try {
      const {
        name,
        phone,
        email,
        password,
      } = req.body;

      /* =========================================
         VALIDATION
      ========================================= */

      const cleanName =
        String(name || "").trim();

      const cleanPhone =
        String(phone || "")
          .replace(/\s+/g, "")
          .trim();

      const cleanEmail =
        String(email || "")
          .trim()
          .toLowerCase();

      if (
        !cleanName ||
        !cleanPhone ||
        !cleanEmail ||
        !password
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Name, phone, email and password are required.",
        });
      }

      if (
        !/^01\d{9}$/.test(
          cleanPhone
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Enter a valid Bangladeshi phone number.",
        });
      }

      if (
        !/^\S+@\S+\.\S+$/.test(
          cleanEmail
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Enter a valid email address.",
        });
      }

      if (
        String(password).length < 6
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Password must be at least 6 characters.",
        });
      }

      /* =========================================
         CHECK EXISTING CUSTOMER
      ========================================= */

      const [existingCustomers] =
        await db.query(
          `
          SELECT
            id,
            name,
            phone,
            email,
            password,
            is_active
          FROM customers
          WHERE phone = ?
             OR email = ?
          LIMIT 1
          `,
          [
            cleanPhone,
            cleanEmail,
          ]
        );

      if (
        existingCustomers.length > 0
      ) {
        const existing =
          existingCustomers[0];

        if (
          existing.phone ===
          cleanPhone
        ) {
          return res.status(409).json({
            success: false,
            message:
              "A customer account already exists with this phone number.",
          });
        }

        if (
          existing.email &&
          existing.email.toLowerCase() ===
            cleanEmail
        ) {
          return res.status(409).json({
            success: false,
            message:
              "A customer account already exists with this email address.",
          });
        }
      }

      /* =========================================
         HASH PASSWORD
      ========================================= */

      const hashedPassword =
        await bcrypt.hash(
          String(password),
          10
        );

      /* =========================================
         CREATE CUSTOMER
      ========================================= */

      const [
        customerResult,
      ] = await db.query(
        `
        INSERT INTO customers
        (
          name,
          phone,
          email,
          password,
          is_active
        )
        VALUES (?, ?, ?, ?, 1)
        `,
        [
          cleanName,
          cleanPhone,
          cleanEmail,
          hashedPassword,
        ]
      );

      const customerId =
        customerResult.insertId;

      /* =========================================
         JWT TOKEN
      ========================================= */

      const token = jwt.sign(
        {
          id: customerId,
          phone: cleanPhone,
          email: cleanEmail,
          accountType:
            "customer",
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "7d",
        }
      );

      /* =========================================
         RESPONSE
      ========================================= */

      return res.status(201).json({
        success: true,
        message:
          "Customer registration successful.",
        token,
        customer: {
          id: customerId,
          name: cleanName,
          phone: cleanPhone,
          email: cleanEmail,
          accountType:
            "customer",
        },
      });
    } catch (error) {
      console.error(
        "Customer registration error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Customer registration failed.",
        error: error.message,
      });
    }
  }
);

/* =====================================================
   CUSTOMER LOGIN
===================================================== */

router.post(
  "/customer/login",
  async (req, res) => {
    try {
      const {
        email,
        password,
      } = req.body;

      /* =========================================
         VALIDATION
      ========================================= */

      const cleanEmail =
        String(email || "")
          .trim()
          .toLowerCase();

      if (
        !cleanEmail ||
        !password
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Email and password are required.",
        });
      }

      /* =========================================
         FIND CUSTOMER
      ========================================= */

      const [customers] =
        await db.query(
          `
          SELECT
            id,
            name,
            phone,
            email,
            password,
            is_active
          FROM customers
          WHERE email = ?
          LIMIT 1
          `,
          [cleanEmail]
        );

      if (
        customers.length === 0
      ) {
        return res.status(401).json({
          success: false,
          message:
            "Invalid email or password.",
        });
      }

      const customer =
        customers[0];

      /* =========================================
         ACTIVE CHECK
      ========================================= */

      if (!customer.is_active) {
        return res.status(403).json({
          success: false,
          message:
            "This customer account is inactive.",
        });
      }

      /* =========================================
         PASSWORD CHECK
      ========================================= */

      if (!customer.password) {
        return res.status(401).json({
          success: false,
          message:
            "This customer account does not have a password yet.",
        });
      }

      const passwordMatch =
        await bcrypt.compare(
          password,
          customer.password
        );

      if (!passwordMatch) {
        return res.status(401).json({
          success: false,
          message:
            "Invalid email or password.",
        });
      }

      /* =========================================
         JWT TOKEN
      ========================================= */

      const token = jwt.sign(
        {
          id: customer.id,
          phone: customer.phone,
          email: customer.email,
          accountType:
            "customer",
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "7d",
        }
      );

      /* =========================================
         RESPONSE
      ========================================= */

      return res.json({
        success: true,
        message:
          "Customer login successful.",
        token,
        customer: {
          id: customer.id,
          name: customer.name,
          phone: customer.phone,
          email: customer.email,
          accountType:
            "customer",
        },
      });
    } catch (error) {
      console.error(
        "Customer login error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Customer login failed.",
        error: error.message,
      });
    }
  }
);

module.exports = router;