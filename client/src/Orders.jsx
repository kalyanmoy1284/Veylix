import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ArrowLeft,
  ArrowRight,
  Package,
  RefreshCcw,
  ShoppingBag,
  CheckCircle2,
  Clock3,
  Truck,
  XCircle,
  LockKeyhole,
} from "lucide-react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

function Orders() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* =====================================================
     LOAD LOGGED-IN CUSTOMER ORDERS
  ===================================================== */

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem(
        "veylix_customer_token"
      );

      if (!token) {
        navigate(
          "/customer/login",
          { replace: true }
        );
        return;
      }

      const response = await fetch(
        "http://localhost:5000/api/customer/orders",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data =
        await response.json();

      if (
        response.status === 401 ||
        response.status === 403
      ) {
        localStorage.removeItem(
          "veylix_customer_token"
        );

        localStorage.removeItem(
          "veylix_customer"
        );

        navigate(
          "/customer/login",
          { replace: true }
        );

        return;
      }

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            "Failed to load orders."
        );
      }

      setOrders(
        Array.isArray(data.orders)
          ? data.orders
          : []
      );
    } catch (loadError) {
      console.error(
        "Customer orders load error:",
        loadError
      );

      setError(
        loadError.message ||
          "Unable to load orders."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     LOGOUT
  ===================================================== */

  const handleLogout = () => {
    localStorage.removeItem(
      "veylix_customer_token"
    );

    localStorage.removeItem(
      "veylix_customer"
    );

    navigate(
      "/customer/login",
      { replace: true }
    );
  };

  /* =====================================================
     CUSTOMER
  ===================================================== */

  const customer = useMemo(() => {
    try {
      const savedCustomer =
        localStorage.getItem(
          "veylix_customer"
        );

      if (!savedCustomer) {
        return null;
      }

      return JSON.parse(
        savedCustomer
      );
    } catch {
      return null;
    }
  }, []);

  /* =====================================================
     FORMAT PRICE
  ===================================================== */

  const formatPrice = (value) => {
    return `৳ ${Number(
      value || 0
    ).toLocaleString()}`;
  };

  /* =====================================================
     FORMAT DATE
  ===================================================== */

  const formatDate = (value) => {
    if (!value) {
      return "N/A";
    }

    const date = new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return "N/A";
    }

    return date.toLocaleDateString(
      "en-GB",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  /* =====================================================
     STATUS LABEL
  ===================================================== */

  const getStatusLabel = (status) => {
    switch (status) {
      case "pending":
        return "Pending";

      case "confirmed":
        return "Confirmed";

      case "processing":
        return "Processing";

      case "shipped":
        return "Shipped";

      case "delivered":
        return "Delivered";

      case "cancelled":
        return "Cancelled";

      case "completed":
        return "Completed";

      default:
        return status || "Pending";
    }
  };

  /* =====================================================
     STATUS ICON
  ===================================================== */

  const getStatusIcon = (status) => {
    switch (status) {
      case "confirmed":
        return (
          <CheckCircle2 size={15} />
        );

      case "processing":
        return (
          <Clock3 size={15} />
        );

      case "shipped":
        return (
          <Truck size={15} />
        );

      case "delivered":
      case "completed":
        return (
          <CheckCircle2 size={15} />
        );

      case "cancelled":
        return (
          <XCircle size={15} />
        );

      default:
        return (
          <Clock3 size={15} />
        );
    }
  };

  /* =====================================================
     SORT ORDERS
  ===================================================== */

  const sortedOrders = useMemo(() => {
    return [...orders].sort(
      (a, b) => {
        const dateA =
          new Date(
            a.created_at || 0
          ).getTime();

        const dateB =
          new Date(
            b.created_at || 0
          ).getTime();

        return dateB - dateA;
      }
    );
  }, [orders]);

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <div className="customer-orders-page">

        <header className="site-header">

          <div className="site-header-inner">

            <Link
              to="/"
              className="site-logo"
            >
              Veylix
            </Link>

            <nav className="site-nav">

              <Link to="/">
                Home
              </Link>

              <Link to="/shop">
                Shop
              </Link>

              <Link to="/shop">
                Categories
              </Link>

            </nav>

            <Link
              to="/cart"
              className="site-cart-link"
            >
              <ShoppingBag size={18} />
            </Link>

          </div>

        </header>

        <main className="customer-orders-main">

          <div className="customer-orders-loading">

            <div className="customer-orders-spinner" />

            <h2>
              Loading your orders...
            </h2>

            <p>
              Please wait while we fetch
              your order history.
            </p>

          </div>

        </main>

      </div>
    );
  }

  /* =====================================================
     ERROR
  ===================================================== */

  if (error) {
    return (
      <div className="customer-orders-page">

        <header className="site-header">

          <div className="site-header-inner">

            <Link
              to="/"
              className="site-logo"
            >
              Veylix
            </Link>

            <nav className="site-nav">

              <Link to="/">
                Home
              </Link>

              <Link to="/shop">
                Shop
              </Link>

              <Link to="/shop">
                Categories
              </Link>

            </nav>

            <Link
              to="/cart"
              className="site-cart-link"
            >
              <ShoppingBag size={18} />
            </Link>

          </div>

        </header>

        <main className="customer-orders-main">

          <div className="customer-orders-header">

            <div>

              <p className="customer-eyebrow">
                ORDER HISTORY
              </p>

              <h1>
                My Orders
              </h1>

            </div>

            <button
              type="button"
              className="orders-back-button"
              onClick={() =>
                navigate("/")
              }
            >
              <ArrowLeft size={15} />
              Back Home
            </button>

          </div>

          <section className="customer-orders-empty">

            <div className="customer-orders-empty-icon">
              <XCircle size={25} />
            </div>

            <h2>
              Unable to load orders
            </h2>

            <p>
              {error}
            </p>

            <button
              type="button"
              className="orders-primary-button"
              onClick={loadOrders}
            >
              <RefreshCcw size={15} />
              Try Again
            </button>

          </section>

        </main>

      </div>
    );
  }

  /* =====================================================
     EMPTY
  ===================================================== */

  if (sortedOrders.length === 0) {
    return (
      <div className="customer-orders-page">

        <header className="site-header">

          <div className="site-header-inner">

            <Link
              to="/"
              className="site-logo"
            >
              Veylix
            </Link>

            <nav className="site-nav">

              <Link to="/">
                Home
              </Link>

              <Link to="/shop">
                Shop
              </Link>

              <Link to="/shop">
                Categories
              </Link>

            </nav>

            <Link
              to="/cart"
              className="site-cart-link"
            >
              <ShoppingBag size={18} />
            </Link>

          </div>

        </header>

        <main className="customer-orders-main">

          <div className="customer-orders-header">

            <div>

              <p className="customer-eyebrow">
                ORDER HISTORY
              </p>

              <h1>
                My Orders
              </h1>

              <p>
                {customer?.name
                  ? `Welcome, ${customer.name}.`
                  : "Track and review your Veylix orders."}
              </p>

            </div>

            <button
              type="button"
              className="orders-logout-button"
              onClick={
                handleLogout
              }
            >
              Logout
            </button>

          </div>

          <section className="customer-orders-empty">

            <div className="customer-orders-empty-icon">
              <Package size={25} />
            </div>

            <h2>
              No orders yet
            </h2>

            <p>
              You haven't placed an
              order with this account yet.
            </p>

            <Link
              to="/shop"
              className="orders-primary-button"
            >
              <ShoppingBag size={15} />
              Start Shopping
            </Link>

          </section>

        </main>

      </div>
    );
  }

  /* =====================================================
     MAIN
  ===================================================== */

  return (
    <div className="customer-orders-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <header className="site-header">

        <div className="site-header-inner">

          <Link
            to="/"
            className="site-logo"
          >
            Veylix
          </Link>

          <nav className="site-nav">

            <Link to="/">
              Home
            </Link>

            <Link to="/shop">
              Shop
            </Link>

            <Link to="/shop">
              Categories
            </Link>

          </nav>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
            }}
          >

            <button
              type="button"
              onClick={
                handleLogout
              }
              style={{
                border: "0",
                background:
                  "transparent",
                cursor:
                  "pointer",
                fontSize: "12px",
                fontWeight: 600,
              }}
            >
              Logout
            </button>

            <Link
              to="/cart"
              className="site-cart-link"
            >
              <ShoppingBag size={18} />
            </Link>

          </div>

        </div>

      </header>

      {/* =================================================
          MAIN
      ================================================= */}

      <main className="customer-orders-main">

        <div className="customer-orders-header">

          <div>

            <p className="customer-eyebrow">
              ORDER HISTORY
            </p>

            <h1>
              My Orders
            </h1>

            <p>
              {customer?.name
                ? `${customer.name}'s recent Veylix orders.`
                : "Track and review your recent Veylix orders."}
            </p>

          </div>

          <div className="customer-orders-actions">

            <button
              type="button"
              className="orders-refresh-button"
              onClick={
                loadOrders
              }
            >
              <RefreshCcw size={15} />
              Refresh
            </button>

            <Link
              to="/shop"
              className="orders-primary-button"
            >
              Continue Shopping
            </Link>

          </div>

        </div>

        {/* =================================================
            SUMMARY
        ================================================= */}

        <section className="customer-orders-summary">

          <div className="customer-summary-card">

            <span>
              Total Orders
            </span>

            <strong>
              {sortedOrders.length}
            </strong>

          </div>

          <div className="customer-summary-card">

            <span>
              Delivered
            </span>

            <strong>
              {
                sortedOrders.filter(
                  (order) =>
                    order.order_status ===
                      "delivered" ||
                    order.order_status ===
                      "completed"
                ).length
              }
            </strong>

          </div>

          <div className="customer-summary-card">

            <span>
              Processing
            </span>

            <strong>
              {
                sortedOrders.filter(
                  (order) =>
                    order.order_status ===
                      "pending" ||
                    order.order_status ===
                      "confirmed" ||
                    order.order_status ===
                      "processing" ||
                    order.order_status ===
                      "shipped"
                ).length
              }
            </strong>

          </div>

          <div className="customer-summary-card">

            <span>
              Cancelled
            </span>

            <strong>
              {
                sortedOrders.filter(
                  (order) =>
                    order.order_status ===
                    "cancelled"
                ).length
              }
            </strong>

          </div>

        </section>

        {/* =================================================
            ORDERS
        ================================================= */}

        <section className="customer-orders-list">

          {sortedOrders.map(
            (order) => (

              <article
                key={order.id}
                className="customer-order-card"
              >

                {/* HEADER */}

                <div className="customer-order-card-header">

                  <div>

                    <p>
                      ORDER
                    </p>

                    <h2>
                      {order.order_number}
                    </h2>

                    <span>
                      {formatDate(
                        order.created_at
                      )}
                    </span>

                  </div>

                  <div className="customer-order-status">

                    <span
                      className={`customer-status-badge ${
                        order.order_status ||
                        "pending"
                      }`}
                    >

                      {getStatusIcon(
                        order.order_status
                      )}

                      {getStatusLabel(
                        order.order_status
                      )}

                    </span>

                  </div>

                </div>

                {/* BODY */}

                <div className="customer-order-card-body">

                  <div className="customer-order-products">

                    <p className="customer-section-label">
                      ITEMS
                    </p>

                    {Array.isArray(
                      order.items
                    ) &&
                    order.items.length > 0 ? (

                      order.items.map(
                        (
                          item,
                          index
                        ) => (

                          <div
                            key={
                              item.id ||
                              item.product_id ||
                              index
                            }
                            className="customer-order-item"
                          >

                            <div className="customer-order-item-image">

                              {item.image ? (

                                <img
                                  src={
                                    item.image
                                  }
                                  alt={
                                    item.product_name ||
                                    "Product"
                                  }
                                />

                              ) : (

                                <Package
                                  size={20}
                                />

                              )}

                            </div>

                            <div className="customer-order-item-info">

                              <strong>
                                {
                                  item.product_name ||
                                  item.name ||
                                  "Product"
                                }
                              </strong>

                              <span>
                                Qty{" "}
                                {Number(
                                  item.quantity ||
                                    0
                                )}
                              </span>

                            </div>

                            <strong className="customer-order-item-price">

                              {formatPrice(
                                item.total_price ??
                                  item.item_total ??
                                  Number(
                                    item.unit_price ||
                                      item.price ||
                                      0
                                  ) *
                                    Number(
                                      item.quantity ||
                                        0
                                    )
                              )}

                            </strong>

                          </div>

                        )
                      )

                    ) : (

                      <div className="customer-order-no-items">

                        <Package size={16} />

                        <span>
                          Order item details
                          unavailable.
                        </span>

                      </div>

                    )}

                  </div>

                  {/* TOTAL */}

                  <div className="customer-order-total-box">

                    <div>

                      <span>
                        Payment
                      </span>

                      <strong>
                        {
                          order.payment_method ||
                          "N/A"
                        }
                      </strong>

                    </div>

                    <div>

                      <span>
                        Payment Status
                      </span>

                      <strong>
                        {
                          order.payment_status ||
                          "pending"
                        }
                      </strong>

                    </div>

                    <div className="customer-order-total-row">

                      <span>
                        Total
                      </span>

                      <strong>
                        {formatPrice(
                          order.total_amount
                        )}
                      </strong>

                    </div>

                  </div>

                </div>

                {/* FOOTER */}

                <div className="customer-order-card-footer">

                  <span>
                    Online order
                  </span>

                  <div
                    style={{
                      display: "flex",
                      alignItems:
                        "center",
                      gap: "10px",
                    }}
                  >

                    <span
                      style={{
                        display:
                          "inline-flex",
                        alignItems:
                          "center",
                        gap: "6px",
                        fontSize:
                          "11px",
                      }}
                    >
                      <LockKeyhole
                        size={13}
                      />

                      Private order
                    </span>

                    <Link
                      to={`/orders/${order.id}`}
                      style={{
                        display:
                          "inline-flex",
                        alignItems:
                          "center",
                        justifyContent:
                          "center",
                        gap: "6px",
                        minHeight:
                          "34px",
                        padding:
                          "0 12px",
                        border:
                          "1px solid #dcdcd7",
                        background:
                          "#ffffff",
                        color:
                          "#111111",
                        textDecoration:
                          "none",
                        borderRadius:
                          "3px",
                        fontSize:
                          "11px",
                        fontWeight:
                          700,
                      }}
                    >
                      View Order
                      <ArrowRight
                        size={14}
                      />
                    </Link>

                  </div>

                </div>

              </article>

            )
          )}

        </section>

      </main>

    </div>
  );
}

export default Orders;