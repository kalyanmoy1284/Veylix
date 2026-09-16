const express = require("express");
const cors = require("cors");
require("dotenv").config();

const db = require("./db");

const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const orderStatusRoutes = require("./routes/orderStatusRoutes");
const orderCancelRoutes = require("./routes/orderCancelRoutes");
const authRoutes = require("./routes/authRoutes");
const returnRoutes = require("./routes/returnRoutes");
const customerOrderRoutes = require("./routes/customerOrderRoutes");

const app = express();

const PORT =
  Number(process.env.PORT) || 5000;

app.use(cors());
app.use(express.json());

/* =====================================================
   BASIC ROUTES
===================================================== */

app.get("/", (req, res) => {
  res.json({
    success: true,
    message:
      "Veylix backend server is running",
  });
});

app.get(
  "/api/health",
  async (req, res) => {
    try {
      const [rows] =
        await db.query(
          "SELECT 1 AS database_connected"
        );

      res.json({
        success: true,
        message:
          "Veylix backend and database are connected",
        database:
          rows[0]
            .database_connected === 1,
      });
    } catch (error) {
      console.error(
        "Database connection error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Database connection failed",
        error: error.message,
      });
    }
  }
);

/* =====================================================
   API ROUTES
===================================================== */

app.use(
  "/api/products",
  productRoutes
);

/*
  Admin / Management orders
*/
app.use(
  "/api/orders",
  orderRoutes
);

app.use(
  "/api/orders",
  orderStatusRoutes
);

app.use(
  "/api/orders",
  orderCancelRoutes
);

/*
  Customer-specific authenticated orders
*/
app.use(
  "/api/customer/orders",
  customerOrderRoutes
);

app.use(
  "/api/auth",
  authRoutes
);

app.use(
  "/api/returns",
  returnRoutes
);

/* =====================================================
   SERVER
===================================================== */

const server = app.listen(
  PORT,
  "0.0.0.0",
  () => {
    console.log(
      `Veylix server running on http://localhost:${PORT}`
    );
  }
);

/* =====================================================
   ERROR HANDLERS
===================================================== */

server.on(
  "error",
  (error) => {
    console.error(
      "Veylix server error:",
      error
    );
  }
);

process.on(
  "uncaughtException",
  (error) => {
    console.error(
      "Uncaught exception:",
      error
    );
  }
);

process.on(
  "unhandledRejection",
  (error) => {
    console.error(
      "Unhandled rejection:",
      error
    );
  }
);