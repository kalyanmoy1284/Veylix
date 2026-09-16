import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AlertTriangle,
  ArrowLeft,
  Box,
  Package,
  RefreshCw,
  Search,
  ShoppingCart,
  UserRound,
  Wallet,
} from "lucide-react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

function AdminOrders() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] =
    useState("");

  const [filterType, setFilterType] =
    useState("all");

  const [filterStatus, setFilterStatus] =
    useState("all");

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] = useState("");

  /* =====================================================
     LOAD ORDERS
  ===================================================== */

  const loadOrders = async (
    showRefreshing = false
  ) => {
    try {
      if (showRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const token = localStorage.getItem(
        "veylix_admin_token"
      );

      if (!token) {
        navigate("/admin/login", {
          replace: true,
        });
        return;
      }

      const response = await fetch(
        "https://veylix-backend-production.up.railway.app/api/orders",
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
          "veylix_admin_token"
        );

        localStorage.removeItem(
          "veylix_admin_user"
        );

        navigate("/admin/login", {
          replace: true,
        });

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
    } catch (ordersError) {
      console.error(
        "Admin orders error:",
        ordersError
      );

      setError(
        ordersError.message ||
          "Unable to load orders."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /* =====================================================
     AUTH CHECK
  ===================================================== */

  useEffect(() => {
    const token = localStorage.getItem(
      "veylix_admin_token"
    );

    const savedUser =
      localStorage.getItem(
        "veylix_admin_user"
      );

    if (!token || !savedUser) {
      navigate("/admin/login", {
        replace: true,
      });

      return;
    }

    loadOrders();
  }, [navigate]);

  /* =====================================================
     FILTER ORDERS
  ===================================================== */

  const filteredOrders = useMemo(() => {
    const query =
      searchTerm.trim().toLowerCase();

    return orders.filter((order) => {
      const orderNumber =
        String(
          order.order_number || ""
        ).toLowerCase();

      const customerName =
        String(
          order.customer_name || ""
        ).toLowerCase();

      const customerPhone =
        String(
          order.customer_phone || ""
        ).toLowerCase();

      const matchesSearch =
        !query ||
        orderNumber.includes(query) ||
        customerName.includes(query) ||
        customerPhone.includes(query);

      const matchesType =
        filterType === "all" ||
        order.order_type ===
          filterType;

      const matchesStatus =
        filterStatus === "all" ||
        order.order_status ===
          filterStatus;

      return (
        matchesSearch &&
        matchesType &&
        matchesStatus
      );
    });
  }, [
    orders,
    searchTerm,
    filterType,
    filterStatus,
  ]);

  /* =====================================================
     STATISTICS
  ===================================================== */

  const statistics = useMemo(() => {
    const totalOrders =
      orders.length;

    const onlineOrders =
      orders.filter(
        (order) =>
          order.order_type ===
          "online"
      ).length;

    const posOrders =
      orders.filter(
        (order) =>
          order.order_type ===
          "pos"
      ).length;

    const completedOrders =
      orders.filter(
        (order) =>
          order.order_status ===
          "completed"
      ).length;

    const pendingOrders =
      orders.filter(
        (order) =>
          order.order_status ===
          "pending"
      ).length;

    const confirmedOrders =
      orders.filter(
        (order) =>
          order.order_status ===
          "confirmed"
      ).length;

    const processingOrders =
      orders.filter(
        (order) =>
          order.order_status ===
          "processing"
      ).length;

    const shippedOrders =
      orders.filter(
        (order) =>
          order.order_status ===
          "shipped"
      ).length;

    const deliveredOrders =
      orders.filter(
        (order) =>
          order.order_status ===
          "delivered"
      ).length;

    const cancelledOrders =
      orders.filter(
        (order) =>
          order.order_status ===
          "cancelled"
      ).length;

    const totalSales =
      orders.reduce(
        (total, order) =>
          total +
          Number(
            order.total_amount || 0
          ),
        0
      );

    return {
      totalOrders,
      onlineOrders,
      posOrders,
      completedOrders,
      pendingOrders,
      confirmedOrders,
      processingOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      totalSales,
    };
  }, [orders]);

  /* =====================================================
     FORMAT PRICE
  ===================================================== */

  const formatPrice = (value) => {
    return `৳ ${Number(
      value || 0
    ).toLocaleString()}`;
  };

  /* =====================================================
     ORDER DATE
  ===================================================== */

  const formatDate = (value) => {
    if (!value) {
      return "N/A";
    }

    const date =
      new Date(value);

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
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <div className="admin-dashboard-page">
        <div className="admin-dashboard-loading">
          <div className="admin-loading-spinner" />

          <h2>
            Loading orders...
          </h2>

          <p>
            Fetching sales and order history.
          </p>
        </div>
      </div>
    );
  }

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <div className="admin-dashboard-page">

      {/* =================================================
          SIDEBAR
      ================================================= */}

      <aside className="admin-sidebar">

        <div className="admin-sidebar-brand">
          <div>
            <h1>
              Veylix
            </h1>

            <span>
              MANAGEMENT
            </span>
          </div>
        </div>

        <nav className="admin-sidebar-nav">

          <button
            type="button"
            className="admin-nav-item"
            onClick={() =>
              navigate("/admin")
            }
          >
            <Box size={18} />
            Dashboard
          </button>

          <button
            type="button"
            className="admin-nav-item"
            onClick={() =>
              navigate(
                "/admin/products"
              )
            }
          >
            <Package size={18} />
            Products
          </button>

          <button
            type="button"
            className="admin-nav-item"
            onClick={() =>
              navigate(
                "/admin/inventory"
              )
            }
          >
            <Box size={18} />
            Inventory
          </button>

          <button
            type="button"
            className="admin-nav-item"
            onClick={() =>
              navigate(
                "/admin/pos"
              )
            }
          >
            <ShoppingCart
              size={18}
            />
            New Sale
          </button>

          <button
            type="button"
            className="admin-nav-item active"
          >
            <Package size={18} />
            Orders
          </button>

          <button
            type="button"
            className="admin-nav-item"
            onClick={() =>
              navigate(
                "/admin/customers"
              )
            }
          >
            <UserRound size={18} />
            Customers
          </button>

        </nav>

        <div className="admin-sidebar-bottom">

          <button
            type="button"
            className="admin-nav-item logout"
            onClick={() => {
              localStorage.removeItem(
                "veylix_admin_token"
              );

              localStorage.removeItem(
                "veylix_admin_user"
              );

              navigate(
                "/admin/login",
                {
                  replace: true,
                }
              );
            }}
          >
            <ArrowLeft size={18} />
            Logout
          </button>

        </div>

      </aside>

      {/* =================================================
          MAIN
      ================================================= */}

      <main className="admin-main">

        {/* HEADER */}

        <header className="admin-topbar">

          <div>
            <p className="admin-topbar-label">
              SALES MANAGEMENT
            </p>

            <h2>
              Orders
            </h2>
          </div>

          <Link
            to="/admin"
            className="secondary-button"
          >
            <ArrowLeft size={15} />
            Dashboard
          </Link>

        </header>

        {/* ERROR */}

        {error && (
          <div className="admin-error-box">
            <AlertTriangle
              size={18}
            />

            <span>
              {error}
            </span>
          </div>
        )}

        {/* =================================================
            STATISTICS
        ================================================= */}

        <section className="admin-stats-grid">

          <div className="admin-stat-card">

            <div className="admin-stat-icon">
              <Package size={20} />
            </div>

            <div>
              <span>
                Total Orders
              </span>

              <strong>
                {
                  statistics.totalOrders
                }
              </strong>
            </div>

          </div>

          <div className="admin-stat-card">

            <div className="admin-stat-icon">
              <ShoppingCart
                size={20}
              />
            </div>

            <div>
              <span>
                POS Sales
              </span>

              <strong>
                {
                  statistics.posOrders
                }
              </strong>
            </div>

          </div>

          <div className="admin-stat-card">

            <div className="admin-stat-icon">
              <Wallet size={20} />
            </div>

            <div>
              <span>
                Total Sales
              </span>

              <strong>
                {formatPrice(
                  statistics.totalSales
                )}
              </strong>
            </div>

          </div>

          <div className="admin-stat-card">

            <div className="admin-stat-icon">
              <Package size={20} />
            </div>

            <div>
              <span>
                Pending Orders
              </span>

              <strong>
                {
                  statistics.pendingOrders
                }
              </strong>
            </div>

          </div>

        </section>

        {/* =================================================
            ORDERS PANEL
        ================================================= */}

        <section
          className="admin-panel"
          style={{
            marginTop: "18px",
          }}
        >

          <div className="admin-orders-toolbar">

            <div>
              <p className="section-label">
                ORDER HISTORY
              </p>

              <h3>
                All Orders
              </h3>
            </div>

            <div className="admin-orders-tools">

              {/* SEARCH */}

              <div className="admin-products-search">

                <Search size={16} />

                <input
                  type="text"
                  placeholder="Search order, customer or phone..."
                  value={searchTerm}
                  onChange={(
                    event
                  ) =>
                    setSearchTerm(
                      event.target
                        .value
                    )
                  }
                />

              </div>

              {/* TYPE FILTER */}

              <select
                className="admin-orders-filter"
                value={filterType}
                onChange={(
                  event
                ) =>
                  setFilterType(
                    event.target
                      .value
                  )
                }
              >

                <option value="all">
                  All Types
                </option>

                <option value="pos">
                  POS
                </option>

                <option value="online">
                  Online
                </option>

              </select>

              {/* STATUS FILTER */}

              <select
                className="admin-orders-filter"
                value={filterStatus}
                onChange={(
                  event
                ) =>
                  setFilterStatus(
                    event.target
                      .value
                  )
                }
              >

                <option value="all">
                  All Status
                </option>

                <option value="pending">
                  Pending
                </option>

                <option value="confirmed">
                  Confirmed
                </option>

                <option value="processing">
                  Processing
                </option>

                <option value="shipped">
                  Shipped
                </option>

                <option value="delivered">
                  Delivered
                </option>

                <option value="cancelled">
                  Cancelled
                </option>

                <option value="completed">
                  Completed
                </option>

              </select>

              {/* REFRESH */}

              <button
                type="button"
                className="admin-refresh-button"
                onClick={() =>
                  loadOrders(true)
                }
                disabled={
                  refreshing
                }
              >

                <RefreshCw
                  size={16}
                  className={
                    refreshing
                      ? "admin-refresh-spinning"
                      : ""
                  }
                />

                Refresh

              </button>

            </div>

          </div>

          {/* =================================================
              RESULT SUMMARY
          ================================================= */}

          <div className="admin-orders-result-summary">

            <span>
              Showing{" "}
              <strong>
                {
                  filteredOrders.length
                }
              </strong>{" "}
              of{" "}
              <strong>
                {orders.length}
              </strong>{" "}
              orders
            </span>

            <span>
              Completed:{" "}
              <strong>
                {
                  statistics.completedOrders
                }
              </strong>
            </span>

          </div>

          {/* =================================================
              ORDER TABLE
          ================================================= */}

          {filteredOrders.length ===
          0 ? (

            <div className="admin-empty-state">

              <Package size={30} />

              <p>
                No orders found.
              </p>

            </div>

          ) : (

            <div className="admin-table-wrapper">

              <table className="admin-table admin-orders-table">

                <thead>

                  <tr>

                    <th>
                      Order
                    </th>

                    <th>
                      Date
                    </th>

                    <th>
                      Customer
                    </th>

                    <th>
                      Type
                    </th>

                    <th>
                      Payment
                    </th>

                    <th>
                      Status
                    </th>

                    <th>
                      Total
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {filteredOrders.map(
                    (order) => (
                      <tr
                        key={
                          order.id
                        }
                      >

                        {/* ORDER */}

                        <td>

                          <div className="admin-order-number">

                            <Link
                              to={`/admin/orders/${order.id}`}
                              style={{
                                color:
                                  "#111111",
                                fontSize:
                                  "10px",
                                fontWeight:
                                  600,
                                textDecoration:
                                  "none",
                                transition:
                                  "opacity 0.2s ease",
                              }}
                              onMouseEnter={(
                                event
                              ) => {
                                event.currentTarget.style.textDecoration =
                                  "underline";
                              }}
                              onMouseLeave={(
                                event
                              ) => {
                                event.currentTarget.style.textDecoration =
                                  "none";
                              }}
                            >
                              {
                                order.order_number
                              }
                            </Link>

                            <span>
                              ID:{" "}
                              {
                                order.id
                              }
                            </span>

                          </div>

                        </td>

                        {/* DATE */}

                        <td>

                          <span>
                            {formatDate(
                              order.created_at
                            )}
                          </span>

                        </td>

                        {/* CUSTOMER */}

                        <td>

                          <div className="admin-customer-cell">

                            <strong>
                              {
                                order.customer_name ||
                                "Walk-in Customer"
                              }
                            </strong>

                            <span>
                              {
                                order.customer_phone ||
                                "No phone"
                              }
                            </span>

                          </div>

                        </td>

                        {/* TYPE */}

                        <td>

                          <span
                            className={`admin-type-badge ${
                              order.order_type
                            }`}
                          >
                            {
                              order.order_type
                            }
                          </span>

                        </td>

                        {/* PAYMENT */}

                        <td>

                          <span className="admin-payment-method">
                            {
                              order.payment_method
                            }
                          </span>

                        </td>

                        {/* STATUS */}

                        <td>

                          <span
                            className={`admin-status-badge ${
                              order.order_status
                            }`}
                          >
                            {
                              order.order_status
                            }
                          </span>

                        </td>

                        {/* TOTAL */}

                        <td>

                          <strong>
                            {formatPrice(
                              order.total_amount
                            )}
                          </strong>

                        </td>

                      </tr>
                    )
                  )}

                </tbody>

              </table>

            </div>

          )}

        </section>

        {/* =================================================
            SUMMARY CARDS
        ================================================= */}

        <section className="admin-overview-grid">

          <div className="admin-overview-card">

            <span>
              Online Orders
            </span>

            <strong>
              {
                statistics.onlineOrders
              }
            </strong>

          </div>

          <div className="admin-overview-card">

            <span>
              POS Sales
            </span>

            <strong>
              {
                statistics.posOrders
              }
            </strong>

          </div>

          <div className="admin-overview-card">

            <span>
              Completed Orders
            </span>

            <strong>
              {
                statistics.completedOrders
              }
            </strong>

          </div>

        </section>

      </main>

    </div>
  );
}

export default AdminOrders;