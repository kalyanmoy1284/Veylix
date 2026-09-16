import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AlertTriangle,
  BarChart3,
  Box,
  CheckCircle2,
  Clock3,
  LogOut,
  Package,
  RefreshCcw,
  ShoppingCart,
  TrendingUp,
  Users,
  Wallet,
  XCircle,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

function AdminDashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);

  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [returns, setReturns] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* =====================================================
     AUTH CHECK
  ===================================================== */

  useEffect(() => {
    const token =
      localStorage.getItem(
        "veylix_admin_token"
      );

    const savedUser =
      localStorage.getItem(
        "veylix_admin_user"
      );

    if (!token || !savedUser) {
      navigate(
        "/admin/login",
        {
          replace: true,
        }
      );

      return;
    }

    try {
      setUser(
        JSON.parse(savedUser)
      );
    } catch {
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
    }
  }, [navigate]);

  /* =====================================================
     LOAD DASHBOARD DATA
  ===================================================== */

  const loadDashboard =
    async () => {
      try {
        setLoading(true);
        setError("");

        const [
          ordersResponse,
          productsResponse,
          returnsResponse,
        ] = await Promise.all([
          fetch(
            "http://localhost:5000/api/orders",
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem(
                  "veylix_admin_token"
                )}`,
              },
            }
          ),

          fetch(
            "http://localhost:5000/api/products"
          ),

          fetch(
            "http://localhost:5000/api/returns",
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem(
                  "veylix_admin_token"
                )}`,
              },
            }
          ),
        ]);

        if (
          !ordersResponse.ok ||
          !productsResponse.ok
        ) {
          throw new Error(
            "Failed to load dashboard data."
          );
        }

        const ordersData =
          await ordersResponse.json();

        const productsData =
          await productsResponse.json();

        let returnsData = {
          success: true,
          returns: [],
        };

        if (
          returnsResponse.ok
        ) {
          try {
            returnsData =
              await returnsResponse.json();
          } catch {
            returnsData = {
              success: true,
              returns: [],
            };
          }
        }

        if (
          !ordersData.success ||
          !productsData.success
        ) {
          throw new Error(
            "Invalid dashboard data."
          );
        }

        setOrders(
          Array.isArray(
            ordersData.orders
          )
            ? ordersData.orders
            : []
        );

        setProducts(
          Array.isArray(
            productsData.products
          )
            ? productsData.products
            : []
        );

        setReturns(
          returnsData.success &&
          Array.isArray(
            returnsData.returns
          )
            ? returnsData.returns
            : []
        );
      } catch (
        dashboardError
      ) {
        console.error(
          "Dashboard error:",
          dashboardError
        );

        setError(
          dashboardError.message ||
            "Unable to load dashboard."
        );
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    loadDashboard();
  }, []);

  /* =====================================================
     HELPERS
  ===================================================== */

  const isCancelledOrder =
    (order) =>
      order.order_status ===
      "cancelled";

  const isValidSaleOrder =
    (order) =>
      !isCancelledOrder(order);

  const getOrderAmount =
    (order) =>
      Number(
        order.total_amount || 0
      );

  const sameCalendarDay =
    (dateValue, targetDate) => {
      if (!dateValue) {
        return false;
      }

      const date =
        new Date(dateValue);

      if (
        Number.isNaN(
          date.getTime()
        )
      ) {
        return false;
      }

      return (
        date.getFullYear() ===
          targetDate.getFullYear() &&
        date.getMonth() ===
          targetDate.getMonth() &&
        date.getDate() ===
          targetDate.getDate()
      );
    };

  const formatMoney =
    (value) =>
      `৳ ${Number(
        value || 0
      ).toLocaleString()}`;

  const formatDate =
    (value) => {
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

  const getStatusLabel =
    (status) => {
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
          return status ||
            "Pending";
      }
    };

  /* =====================================================
     DASHBOARD CALCULATIONS
  ===================================================== */

  const statistics = useMemo(() => {
    const today =
      new Date();

    const validOrders =
      orders.filter(
        isValidSaleOrder
      );

    const totalOrders =
      orders.length;

    const cancelledOrders =
      orders.filter(
        (order) =>
          order.order_status ===
          "cancelled"
      ).length;

    const pendingOrders =
      orders.filter(
        (order) =>
          order.order_status ===
          "pending"
      ).length;

    const activeOrders =
      orders.filter(
        (order) =>
          [
            "pending",
            "confirmed",
            "processing",
            "shipped",
          ].includes(
            order.order_status
          )
      ).length;

    const completedOrders =
      orders.filter(
        (order) =>
          [
            "delivered",
            "completed",
          ].includes(
            order.order_status
          )
      ).length;

    const totalSales =
      validOrders.reduce(
        (
          total,
          order
        ) =>
          total +
          getOrderAmount(order),
        0
      );

    const todaySales =
      validOrders
        .filter(
          (order) =>
            sameCalendarDay(
              order.created_at,
              today
            )
        )
        .reduce(
          (
            total,
            order
          ) =>
            total +
            getOrderAmount(order),
          0
        );

    const onlineSales =
      validOrders
        .filter(
          (order) =>
            order.order_type ===
            "online"
        )
        .reduce(
          (
            total,
            order
          ) =>
            total +
            getOrderAmount(order),
          0
        );

    const posSales =
      validOrders
        .filter(
          (order) =>
            order.order_type ===
            "pos"
        )
        .reduce(
          (
            total,
            order
          ) =>
            total +
            getOrderAmount(order),
          0
        );

    const todayOrders =
      validOrders.filter(
        (order) =>
          sameCalendarDay(
            order.created_at,
            today
          )
      ).length;

    const totalProducts =
      products.length;

    const lowStockProducts =
      products.filter(
        (product) =>
          Number(
            product.stock_quantity ||
              0
          ) <=
          Number(
            product.low_stock_threshold ||
              0
          )
      ).length;

    const outOfStockProducts =
      products.filter(
        (product) =>
          Number(
            product.stock_quantity ||
              0
          ) <= 0
      ).length;

    const totalStock =
      products.reduce(
        (
          total,
          product
        ) =>
          total +
          Number(
            product.stock_quantity ||
              0
          ),
        0
      );

    const completedReturns =
      returns.filter(
        (item) =>
          item.return_status ===
          "completed"
      );

    const requestedReturns =
      returns.filter(
        (item) =>
          item.return_status ===
          "requested"
      );

    const approvedReturns =
      returns.filter(
        (item) =>
          item.return_status ===
          "approved"
      );

    const processedRefunds =
      completedReturns.reduce(
        (
          total,
          item
        ) =>
          total +
          Number(
            item.refund_amount ||
              0
          ),
        0
      );

    const pendingRefunds =
      returns
        .filter(
          (item) =>
            item.refund_status ===
              "pending" &&
            [
              "requested",
              "approved",
            ].includes(
              item.return_status
            )
        )
        .reduce(
          (
            total,
            item
          ) =>
            total +
            Number(
              item.refund_amount ||
                0
            ),
          0
        );

    const netSales =
      Math.max(
        0,
        totalSales -
          processedRefunds
      );

    return {
      totalOrders,
      todayOrders,
      cancelledOrders,
      pendingOrders,
      activeOrders,
      completedOrders,

      totalSales,
      todaySales,
      onlineSales,
      posSales,
      netSales,

      totalProducts,
      lowStockProducts,
      outOfStockProducts,
      totalStock,

      totalReturns:
        returns.length,

      requestedReturns:
        requestedReturns.length,

      approvedReturns:
        approvedReturns.length,

      completedReturns:
        completedReturns.length,

      processedRefunds,
      pendingRefunds,
    };
  }, [
    orders,
    products,
    returns,
  ]);

  /* =====================================================
     RECENT ORDERS
  ===================================================== */

  const recentOrders =
    useMemo(
      () =>
        [...orders]
          .sort(
            (a, b) =>
              new Date(
                b.created_at || 0
              ).getTime() -
              new Date(
                a.created_at || 0
              ).getTime()
          )
          .slice(0, 6),
      [orders]
    );

  /* =====================================================
     LOW STOCK PRODUCTS
  ===================================================== */

  const lowStockItems =
    useMemo(
      () =>
        products
          .filter(
            (product) =>
              Number(
                product.stock_quantity ||
                  0
              ) <=
              Number(
                product.low_stock_threshold ||
                  0
              )
          )
          .sort(
            (a, b) =>
              Number(
                a.stock_quantity ||
                  0
              ) -
              Number(
                b.stock_quantity ||
                  0
              )
          )
          .slice(0, 5),
      [products]
    );

  /* =====================================================
     RECENT RETURNS
  ===================================================== */

  const recentReturns =
    useMemo(
      () =>
        [...returns]
          .sort(
            (a, b) =>
              new Date(
                b.created_at || 0
              ).getTime() -
              new Date(
                a.created_at || 0
              ).getTime()
          )
          .slice(0, 4),
      [returns]
    );

  /* =====================================================
     FASHION CATEGORY OVERVIEW
  ===================================================== */

  const fashionCategories = [
    "Men",
    "Women",
    "Shirts",
    "T-Shirts",
    "Pants",
    "Panjabi",
    "Shoes",
    "Watches",
    "Wallets",
    "Ladies Bags",
    "Accessories",
    "Deals",
  ];

  const categoryOverview = useMemo(() => {
    return fashionCategories.map((categoryName) => {
      const categoryProducts = products.filter(
        (product) =>
          String(product.category || "")
            .trim()
            .toLowerCase() === categoryName.toLowerCase()
      );

      const stockUnits = categoryProducts.reduce(
        (total, product) =>
          total +
          Number(product.stock_quantity || 0),
        0
      );

      const lowStock = categoryProducts.filter(
        (product) =>
          Number(product.stock_quantity || 0) <=
          Number(product.low_stock_threshold || 0)
      ).length;

      return {
        name: categoryName,
        count: categoryProducts.length,
        stockUnits,
        lowStock,
      };
    });
  }, [products]);

  /* =====================================================
     LOGOUT
  ===================================================== */

  const handleLogout =
    () => {
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
            Loading dashboard...
          </h2>

          <p>
            Preparing your Veylix
            management dashboard.
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

      <style>{`

        .admin-report-section {
          margin-top: 22px;
        }

        .admin-category-panel {
          margin-top: 22px;
        }

        .admin-category-grid {
          display: grid;
          grid-template-columns:
            repeat(4, minmax(0, 1fr));
          gap: 10px;
        }

        .admin-category-card {
          padding: 14px;
          background: #ffffff;
          border: 1px solid #e3e3de;
          border-radius: 4px;
          text-align: left;
          cursor: pointer;
          font-family: inherit;
          transition: .2s ease;
        }

        .admin-category-card:hover {
          border-color: #c9a52d;
          transform: translateY(-1px);
        }

        .admin-category-card-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          color: #777771;
          font-size: 9px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: .7px;
        }

        .admin-category-card strong {
          display: block;
          margin-top: 13px;
          font-size: 22px;
          line-height: 1;
        }

        .admin-category-card small {
          display: block;
          margin-top: 6px;
          color: #888882;
          font-size: 8px;
        }

        .admin-category-card em {
          display: inline-block;
          margin-top: 9px;
          padding: 4px 7px;
          border-radius: 999px;
          background: #f8e8e5;
          color: #9a3c32;
          font-size: 7px;
          font-style: normal;
          font-weight: 700;
        }

        .admin-category-card em.healthy {
          background: #edf6ef;
          color: #31724a;
        }

        .admin-report-grid {
          display: grid;
          grid-template-columns:
            repeat(4, minmax(0, 1fr));
          gap: 14px;
        }

        .admin-report-card {
          padding: 18px;
          background: #ffffff;
          border: 1px solid #e2e2dd;
          min-height: 115px;
        }

        .admin-report-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .admin-report-card-header span {
          color: #80807b;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: .8px;
          text-transform: uppercase;
        }

        .admin-report-icon {
          width: 34px;
          height: 34px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: #f3f3f0;
        }

        .admin-report-value {
          display: block;
          margin-top: 15px;
          font-size: 24px;
          line-height: 1;
          letter-spacing: -.8px;
          font-weight: 800;
        }

        .admin-report-meta {
          margin-top: 8px;
          color: #8a8a85;
          font-size: 9px;
        }

        .admin-business-grid {
          display: grid;
          grid-template-columns:
            repeat(4, minmax(0, 1fr));
          gap: 14px;
          margin-top: 14px;
        }

        .admin-mini-stat {
          padding: 16px 18px;
          background: #ffffff;
          border: 1px solid #e2e2dd;
        }

        .admin-mini-stat span {
          display: block;
          color: #858580;
          font-size: 9px;
          text-transform: uppercase;
          letter-spacing: .8px;
          font-weight: 700;
        }

        .admin-mini-stat strong {
          display: block;
          margin-top: 9px;
          font-size: 18px;
        }

        .admin-mini-stat small {
          display: block;
          margin-top: 5px;
          color: #858580;
          font-size: 9px;
        }

        .admin-report-card.warning-card {
          border-color: #e4d8b7;
        }

        .admin-report-card.danger-card {
          border-color: #e6caca;
        }

        .admin-report-card.success-card {
          border-color: #d2e3d5;
        }

        .admin-return-panel {
          margin-top: 22px;
        }

        .admin-return-item {
          display: grid;
          grid-template-columns:
            minmax(0, 1fr)
            auto
            auto;
          gap: 14px;
          align-items: center;
          padding: 13px 0;
          border-bottom: 1px solid #eeeeea;
        }

        .admin-return-item:last-child {
          border-bottom: 0;
        }

        .admin-return-main strong {
          display: block;
          font-size: 11px;
        }

        .admin-return-main span {
          display: block;
          margin-top: 3px;
          color: #858580;
          font-size: 9px;
        }

        .admin-return-amount {
          font-size: 11px;
          font-weight: 800;
        }

        .admin-return-status {
          padding: 5px 8px;
          border-radius: 999px;
          background: #f3f3f0;
          color: #555550;
          font-size: 8px;
          font-weight: 700;
          text-transform: capitalize;
        }

        .admin-refresh-button {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          min-height: 37px;
          padding: 0 12px;
          border: 1px solid #ddddda;
          background: #ffffff;
          color: #111111;
          border-radius: 3px;
          cursor: pointer;
          font-family: inherit;
          font-size: 10px;
          font-weight: 700;
        }

        .admin-refresh-button:hover {
          border-color: #111111;
        }

        @media (max-width: 1050px) {
          .admin-report-grid,
          .admin-business-grid,
          .admin-category-grid {
            grid-template-columns:
              repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 650px) {
          .admin-report-grid,
          .admin-business-grid,
          .admin-category-grid {
            grid-template-columns: 1fr;
          }
        }

      `}</style>

      {/* =================================================
          SIDEBAR
      ================================================= */}

      <aside className="admin-sidebar">

        <div className="admin-sidebar-brand">

          <div>
            <img
              src="/assets/logo.svg"
              alt="Veylix"
              style={{
                width: "112px",
                height: "auto",
                display: "block",
                marginBottom: "8px",
              }}
            />

            <span>
              MANAGEMENT
            </span>
          </div>

        </div>

        <nav className="admin-sidebar-nav">

          <button
            type="button"
            className="admin-nav-item active"
          >
            <BarChart3 size={18} />
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
            <ShoppingCart size={18} />
            New Sale
          </button>

          <button
            type="button"
            className="admin-nav-item"
            onClick={() =>
              navigate(
                "/admin/orders"
              )
            }
          >
            <Wallet size={18} />
            Orders
          </button>

          <button
            type="button"
            className="admin-nav-item"
            onClick={() =>
              navigate(
                "/admin/returns"
              )
            }
          >
            <RefreshCcw size={18} />
            Returns
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
            <Users size={18} />
            Customers
          </button>

        </nav>

        <div className="admin-sidebar-bottom">

          <button
            type="button"
            className="admin-nav-item logout"
            onClick={
              handleLogout
            }
          >
            <LogOut size={18} />
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
              VEYLIX MANAGEMENT
            </p>

            <h2>
              Dashboard
            </h2>

          </div>

          <div
            style={{
              display:
                "flex",
              alignItems:
                "center",
              gap: "12px",
            }}
          >

            <button
              type="button"
              className="admin-refresh-button"
              onClick={
                loadDashboard
              }
            >
              <RefreshCcw size={13} />
              Refresh
            </button>

            <div className="admin-user">

              <div className="admin-user-avatar">

                {user?.name
                  ?.charAt(0)
                  ?.toUpperCase() ||
                  "A"}

              </div>

              <div>

                <strong>
                  {user?.name ||
                    "Veylix Admin"}
                </strong>

                <span>
                  {user?.role ||
                    "admin"}
                </span>

              </div>

            </div>

          </div>

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
            PRIMARY BUSINESS METRICS
        ================================================= */}

        <section className="admin-report-section">

          <div className="admin-report-grid">

            <div className="admin-report-card">

              <div className="admin-report-card-header">

                <span>
                  Today's Sales
                </span>

                <div className="admin-report-icon">
                  <TrendingUp size={17} />
                </div>

              </div>

              <strong className="admin-report-value">
                {formatMoney(
                  statistics.todaySales
                )}
              </strong>

              <div className="admin-report-meta">
                {statistics.todayOrders} orders today
              </div>

            </div>

            <div className="admin-report-card">

              <div className="admin-report-card-header">

                <span>
                  Total Sales
                </span>

                <div className="admin-report-icon">
                  <Wallet size={17} />
                </div>

              </div>

              <strong className="admin-report-value">
                {formatMoney(
                  statistics.totalSales
                )}
              </strong>

              <div className="admin-report-meta">
                Gross sales excluding cancelled orders
              </div>

            </div>

            <div className="admin-report-card success-card">

              <div className="admin-report-card-header">

                <span>
                  Net Sales
                </span>

                <div className="admin-report-icon">
                  <BarChart3 size={17} />
                </div>

              </div>

              <strong className="admin-report-value">
                {formatMoney(
                  statistics.netSales
                )}
              </strong>

              <div className="admin-report-meta">
                Sales after processed refunds
              </div>

            </div>

            <div className="admin-report-card">

              <div className="admin-report-card-header">

                <span>
                  Total Orders
                </span>

                <div className="admin-report-icon">
                  <ShoppingCart size={17} />
                </div>

              </div>

              <strong className="admin-report-value">
                {
                  statistics.totalOrders
                }
              </strong>

              <div className="admin-report-meta">
                {statistics.activeOrders} active orders
              </div>

            </div>

          </div>

          <div className="admin-business-grid">

            <div className="admin-mini-stat">

              <span>
                Online Sales
              </span>

              <strong>
                {formatMoney(
                  statistics.onlineSales
                )}
              </strong>

              <small>
                Website orders
              </small>

            </div>

            <div className="admin-mini-stat">

              <span>
                POS Sales
              </span>

              <strong>
                {formatMoney(
                  statistics.posSales
                )}
              </strong>

              <small>
                Physical store sales
              </small>

            </div>

            <div className="admin-mini-stat warning-card">

              <span>
                Refunds
              </span>

              <strong>
                {formatMoney(
                  statistics.processedRefunds
                )}
              </strong>

              <small>
                {statistics.completedReturns} completed returns
              </small>

            </div>

            <div className="admin-mini-stat danger-card">

              <span>
                Cancelled Orders
              </span>

              <strong>
                {
                  statistics.cancelledOrders
                }
              </strong>

              <small>
                Stock restored where applicable
              </small>

            </div>

          </div>

        </section>

        {/* =================================================
            ORIGINAL SUMMARY CARDS
        ================================================= */}

        <section className="admin-stats-grid">

          <div className="admin-stat-card">

            <div className="admin-stat-icon">
              <CheckCircle2 size={20} />
            </div>

            <div>

              <span>
                Completed
              </span>

              <strong>
                {
                  statistics.completedOrders
                }
              </strong>

            </div>

          </div>

          <div className="admin-stat-card">

            <div className="admin-stat-icon">
              <Clock3 size={20} />
            </div>

            <div>

              <span>
                Pending
              </span>

              <strong>
                {
                  statistics.pendingOrders
                }
              </strong>

            </div>

          </div>

          <div className="admin-stat-card">

            <div className="admin-stat-icon">
              <Package size={20} />
            </div>

            <div>

              <span>
                Products
              </span>

              <strong>
                {
                  statistics.totalProducts
                }
              </strong>

            </div>

          </div>

          <div
            className={`admin-stat-card ${
              statistics.lowStockProducts >
              0
                ? "warning"
                : ""
            }`}
          >

            <div className="admin-stat-icon">

              <AlertTriangle
                size={20}
              />

            </div>

            <div>

              <span>
                Low Stock
              </span>

              <strong>
                {
                  statistics.lowStockProducts
                }
              </strong>

            </div>

          </div>

        </section>

        {/* =================================================
            CATEGORY OVERVIEW
        ================================================= */}

        <section className="admin-panel admin-category-panel">

          <div className="admin-panel-header">

            <div>
              <p className="section-label">
                FASHION CATALOG
              </p>

              <h3>
                Category Overview
              </h3>
            </div>

            <button
              type="button"
              className="admin-view-button"
              onClick={() =>
                navigate("/admin/products")
              }
            >
              Manage Products
            </button>

          </div>

          <div className="admin-category-grid">
            {categoryOverview.map((category) => (
              <button
                key={category.name}
                type="button"
                className="admin-category-card"
                onClick={() =>
                  navigate("/admin/products")
                }
              >
                <div className="admin-category-card-top">
                  <span>
                    {category.name}
                  </span>

                  <Package size={15} />
                </div>

                <strong>
                  {category.count}
                </strong>

                <small>
                  {category.count === 1
                    ? "product"
                    : "products"}{" "}
                  • {category.stockUnits} stock units
                </small>

                {category.lowStock > 0 ? (
                  <em>
                    {category.lowStock} low stock
                  </em>
                ) : (
                  <em className="healthy">
                    Stock healthy
                  </em>
                )}
              </button>
            ))}
          </div>

        </section>

        {/* =================================================
            CONTENT GRID
        ================================================= */}

        <section className="admin-content-grid">

          {/* RECENT ORDERS */}

          <div className="admin-panel">

            <div className="admin-panel-header">

              <div>

                <p className="section-label">
                  SALES ACTIVITY
                </p>

                <h3>
                  Recent Orders
                </h3>

              </div>

              <button
                type="button"
                className="admin-view-button"
                onClick={() =>
                  navigate(
                    "/admin/orders"
                  )
                }
              >
                View all
              </button>

            </div>

            {recentOrders.length ===
            0 ? (

              <div className="admin-empty-state">

                <ShoppingCart
                  size={28}
                />

                <p>
                  No orders yet.
                </p>

              </div>

            ) : (

              <div className="admin-table-wrapper">

                <table className="admin-table">

                  <thead>

                    <tr>

                      <th>
                        Order
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

                    {recentOrders.map(
                      (order) => (

                        <tr
                          key={
                            order.id
                          }
                        >

                          <td>

                            <button
                              type="button"
                              onClick={() =>
                                navigate(
                                  `/admin/orders/${order.id}`
                                )
                              }
                              aria-label={`Open order ${order.order_number}`}
                              style={{
                                padding: 0,
                                border: 0,
                                background: "transparent",
                                color: "inherit",
                                font: "inherit",
                                textAlign: "left",
                                cursor: "pointer",
                              }}
                            >
                              <strong
                                style={{
                                  textDecoration: "underline",
                                  textUnderlineOffset: "3px",
                                }}
                              >
                                {order.order_number}
                              </strong>
                            </button>

                            <div
                              style={{
                                marginTop:
                                  "3px",
                                color:
                                  "#888",
                                fontSize:
                                  "9px",
                              }}
                            >
                              {formatDate(
                                order.created_at
                              )}
                            </div>

                          </td>

                          <td>

                            <div className="admin-customer-cell">

                              <strong>
                                {
                                  order.customer_name
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

                          <td>

                            <span
                              className={`admin-type-badge ${order.order_type}`}
                            >
                              {
                                order.order_type
                              }
                            </span>

                          </td>

                          <td>
                            <span>
                              {
                                order.payment_method
                              }
                            </span>
                          </td>

                          <td>

                            <span
                              className={`admin-status-badge ${order.order_status}`}
                            >
                              {
                                getStatusLabel(
                                  order.order_status
                                )
                              }
                            </span>

                          </td>

                          <td>

                            <strong>
                              {formatMoney(
                                getOrderAmount(
                                  order
                                )
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

          </div>

          {/* LOW STOCK */}

          <div className="admin-panel">

            <div className="admin-panel-header">

              <div>

                <p className="section-label">
                  INVENTORY
                </p>

                <h3>
                  Low Stock Alerts
                </h3>

              </div>

              <button
                type="button"
                className="admin-view-button"
                onClick={() =>
                  navigate(
                    "/admin/inventory"
                  )
                }
              >
                Manage
              </button>

            </div>

            {lowStockItems.length ===
            0 ? (

              <div className="admin-empty-state">

                <Package
                  size={28}
                />

                <p>
                  All products have healthy stock.
                </p>

              </div>

            ) : (

              <div className="admin-low-stock-list">

                {lowStockItems.map(
                  (product) => (

                    <div
                      key={
                        product.id
                      }
                      className="admin-low-stock-item"
                    >

                      <div className="admin-low-stock-image">

                        <img
                          src={
                            product.image
                          }
                          alt={
                            product.name
                          }
                        />

                      </div>

                      <div className="admin-low-stock-info">

                        <strong>
                          {
                            product.name
                          }
                        </strong>

                        <span>
                          SKU:{" "}
                          {
                            product.sku
                          }
                        </span>

                      </div>

                      <div className="admin-low-stock-number">

                        <strong>
                          {
                            product.stock_quantity
                          }
                        </strong>

                        <span>
                          left
                        </span>

                      </div>

                    </div>

                  )
                )}

              </div>

            )}

          </div>

        </section>

        {/* =================================================
            RETURNS SNAPSHOT
        ================================================= */}

        <section className="admin-panel admin-return-panel">

          <div className="admin-panel-header">

            <div>

              <p className="section-label">
                RETURNS & REFUNDS
              </p>

              <h3>
                Return Activity
              </h3>

            </div>

            <button
              type="button"
              className="admin-view-button"
              onClick={() =>
                navigate(
                  "/admin/returns"
                )
              }
            >
              View returns
            </button>

          </div>

          <div className="admin-business-grid">

            <div className="admin-mini-stat">

              <span>
                Total Returns
              </span>

              <strong>
                {
                  statistics.totalReturns
                }
              </strong>

              <small>
                All return requests
              </small>

            </div>

            <div className="admin-mini-stat">

              <span>
                Requested
              </span>

              <strong>
                {
                  statistics.requestedReturns
                }
              </strong>

              <small>
                Waiting for approval
              </small>

            </div>

            <div className="admin-mini-stat">

              <span>
                Approved
              </span>

              <strong>
                {
                  statistics.approvedReturns
                }
              </strong>

              <small>
                Ready for refund processing
              </small>

            </div>

            <div className="admin-mini-stat">

              <span>
                Pending Refund
              </span>

              <strong>
                {formatMoney(
                  statistics.pendingRefunds
                )}
              </strong>

              <small>
                Refunds not processed yet
              </small>

            </div>

          </div>

          {recentReturns.length >
            0 && (

            <div
              style={{
                marginTop:
                  "18px",
              }}
            >

              {recentReturns.map(
                (item) => (

                  <div
                    key={
                      item.id
                    }
                    className="admin-return-item"
                  >

                    <div className="admin-return-main">

                      <strong>
                        {item.order_number ||
                          `Return #${item.id}`}
                      </strong>

                      <span>
                        {
                          item.customer_name ||
                          "Customer"
                        }{" "}
                        •{" "}
                        {
                          item.reason ||
                          "Return request"
                        }
                      </span>

                    </div>

                    <strong className="admin-return-amount">

                      {formatMoney(
                        item.refund_amount
                      )}

                    </strong>

                    <span className="admin-return-status">

                      {
                        item.return_status ||
                        "requested"
                      }

                    </span>

                  </div>

                )
              )}

            </div>

          )}

        </section>

        {/* =================================================
            STORE OVERVIEW
        ================================================= */}

        <section className="admin-overview-grid">

          <div className="admin-overview-card">

            <span>
              Total Stock Units
            </span>

            <strong>
              {
                statistics.totalStock
              }
            </strong>

          </div>

          <div className="admin-overview-card">

            <span>
              Out of Stock
            </span>

            <strong>
              {
                statistics.outOfStockProducts
              }
            </strong>

          </div>

          <div className="admin-overview-card">

            <span>
              Active Orders
            </span>

            <strong>
              {
                statistics.activeOrders
              }
            </strong>

          </div>

          <div className="admin-overview-card">

            <span>
              Completed Returns
            </span>

            <strong>
              {
                statistics.completedReturns
              }
            </strong>

          </div>

        </section>

      </main>

    </div>
  );
}

export default AdminDashboard;