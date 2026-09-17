import React from "react";
import ReactDOM from "react-dom/client";

import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import App from "./App";
import ProductDetails from "./ProductDetails";
import Cart from "./Cart/Cart";
import Shop from "./shop/shop";
import Wishlist from "./wishlist";
import Checkout from "./Checkout";
import OrderSuccess from "./OrderSuccess";
import Orders from "./Orders";

import CustomerLogin from "./CustomerLogin";
import CustomerRegister from "./CustomerRegister";
import CustomerOrderDetails from "./CustomerOrderDetails";

import AdminLogin from "./AdminLogin";
import AdminDashboard from "./AdminDashboard";
import AdminCreateAccount from "./AdminCreateAccount";
import AdminProducts from "./AdminProducts";
import AdminInventory from "./AdminInventory";
import AdminPOS from "./AdminPOS";
import AdminOrders from "./AdminOrders";
import AdminOrderDetails from "./AdminOrderDetails";
import AdminCustomers from "./AdminCustomers";
import AdminReturns from "./AdminReturns";

import { CartProvider } from "./context/CartContext";

import "./styles/global.css";

/* =====================================================
   PROTECTED ROUTE

   Checks whether the required login token exists
   before allowing access to protected pages.
===================================================== */

function ProtectedRoute({
  tokenKey,
  loginPath,
  children,
}) {
  const token =
    localStorage.getItem(tokenKey);

  if (!token) {
    return (
      <Navigate
        to={loginPath}
        replace
      />
    );
  }

  return children;
}

/* =====================================================
   APP
===================================================== */

ReactDOM.createRoot(
  document.getElementById("root")
).render(
  <React.StrictMode>
    <BrowserRouter>
      <CartProvider>
        <Routes>

          {/* ================================
              CUSTOMER PUBLIC
          ================================= */}

          <Route
            path="/"
            element={<App />}
          />

          <Route
            path="/shop"
            element={<Shop />}
          />

          <Route
            path="/shop/:category"
            element={<Shop />}
          />

          <Route
            path="/product/:id"
            element={<ProductDetails />}
          />

          <Route
            path="/cart"
            element={<Cart />}
          />

          <Route
            path="/wishlist"
            element={<Wishlist />}
          />

          <Route
            path="/checkout"
            element={<Checkout />}
          />

          <Route
            path="/order-success"
            element={<OrderSuccess />}
          />

          {/* ================================
              CUSTOMER AUTH
          ================================= */}

          <Route
            path="/customer/login"
            element={<CustomerLogin />}
          />

          <Route
            path="/customer/register"
            element={<CustomerRegister />}
          />

          {/* ================================
              CUSTOMER PROTECTED
          ================================= */}

          <Route
            path="/orders"
            element={
              <ProtectedRoute
                tokenKey="veylix_customer_token"
                loginPath="/customer/login"
              >
                <Orders />
              </ProtectedRoute>
            }
          />

          <Route
            path="/orders/:orderId"
            element={
              <ProtectedRoute
                tokenKey="veylix_customer_token"
                loginPath="/customer/login"
              >
                <CustomerOrderDetails />
              </ProtectedRoute>
            }
          />

          {/* ================================
              ADMIN AUTH
          ================================= */}

          <Route
            path="/admin/login"
            element={<AdminLogin />}
          />

          <Route
            path="/admin/create-account"
            element={
              <ProtectedRoute
                tokenKey="veylix_admin_token"
                loginPath="/admin/login"
              >
                <AdminCreateAccount />
              </ProtectedRoute>
            }
          />

          {/* ================================
              ADMIN PROTECTED
          ================================= */}

          <Route
            path="/admin"
            element={
              <ProtectedRoute
                tokenKey="veylix_admin_token"
                loginPath="/admin/login"
              >
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/products"
            element={
              <ProtectedRoute
                tokenKey="veylix_admin_token"
                loginPath="/admin/login"
              >
                <AdminProducts />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/inventory"
            element={
              <ProtectedRoute
                tokenKey="veylix_admin_token"
                loginPath="/admin/login"
              >
                <AdminInventory />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/pos"
            element={
              <ProtectedRoute
                tokenKey="veylix_admin_token"
                loginPath="/admin/login"
              >
                <AdminPOS />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/orders"
            element={
              <ProtectedRoute
                tokenKey="veylix_admin_token"
                loginPath="/admin/login"
              >
                <AdminOrders />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/orders/:orderNumber"
            element={
              <ProtectedRoute
                tokenKey="veylix_admin_token"
                loginPath="/admin/login"
              >
                <AdminOrderDetails />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/customers"
            element={
              <ProtectedRoute
                tokenKey="veylix_admin_token"
                loginPath="/admin/login"
              >
                <AdminCustomers />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/returns"
            element={
              <ProtectedRoute
                tokenKey="veylix_admin_token"
                loginPath="/admin/login"
              >
                <AdminReturns />
              </ProtectedRoute>
            }
          />

          {/* ================================
              FALLBACK
          ================================= */}

          <Route
            path="*"
            element={
              <Navigate
                to="/"
                replace
              />
            }
          />

        </Routes>
      </CartProvider>
    </BrowserRouter>
  </React.StrictMode>
);
