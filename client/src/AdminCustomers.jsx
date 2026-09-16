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
  Users,
  Wallet,
} from "lucide-react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

function AdminCustomers() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);

  const [searchTerm, setSearchTerm] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] = useState("");

  /* =====================================================
     LOAD ORDERS
  ===================================================== */

  const loadCustomersData = async (
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
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            "Failed to load customer data."
        );
      }

      setOrders(
        Array.isArray(data.orders)
          ? data.orders
          : []
      );
    } catch (customersError) {
      console.error(
        "Customer data error:",
        customersError
      );

      setError(
        customersError.message ||
          "Unable to load customers."
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

    loadCustomersData();
  }, [navigate]);

  /* =====================================================
     BUILD CUSTOMER LIST
  ===================================================== */

  const customers = useMemo(() => {
    const customerMap =
      new Map();

    orders.forEach((order) => {
      const name =
        String(
          order.customer_name ||
            "Walk-in Customer"
        ).trim();

      const phone =
        String(
          order.customer_phone ||
            ""
        ).trim();

      /*
        Use phone as the main customer
        identity when available.

        For walk-in customers without
        a phone, use the name.
      */
      const key =
        phone ||
        name.toLowerCase();

      if (!customerMap.has(key)) {
        customerMap.set(key, {
          id: key,
          name,
          phone:
            phone || null,
          totalOrders: 0,
          totalSpent: 0,
          lastOrderDate:
            order.created_at ||
            null,
          lastOrderNumber:
            order.order_number ||
            null,
        });
      }

      const customer =
        customerMap.get(key);

      customer.totalOrders += 1;

      customer.totalSpent +=
        Number(
          order.total_amount || 0
        );

      if (
        new Date(
          order.created_at || 0
        ).getTime() >
        new Date(
          customer.lastOrderDate ||
            0
        ).getTime()
      ) {
        customer.lastOrderDate =
          order.created_at ||
          customer.lastOrderDate;

        customer.lastOrderNumber =
          order.order_number ||
          customer.lastOrderNumber;
      }
    });

    return Array.from(
      customerMap.values()
    ).sort(
      (a, b) =>
        new Date(
          b.lastOrderDate || 0
        ).getTime() -
        new Date(
          a.lastOrderDate || 0
        ).getTime()
    );
  }, [orders]);

  /* =====================================================
     FILTER CUSTOMERS
  ===================================================== */

  const filteredCustomers =
    useMemo(() => {
      const query =
        searchTerm.trim().toLowerCase();

      if (!query) {
        return customers;
      }

      return customers.filter(
        (customer) => {
          const name =
            String(
              customer.name || ""
            ).toLowerCase();

          const phone =
            String(
              customer.phone || ""
            ).toLowerCase();

          return (
            name.includes(query) ||
            phone.includes(query)
          );
        }
      );
    }, [
      customers,
      searchTerm,
    ]);

  /* =====================================================
     STATISTICS
  ===================================================== */

  const statistics = useMemo(() => {
    const registeredCustomers =
      customers.filter(
        (customer) =>
          customer.phone
      ).length;

    const walkInCustomers =
      customers.filter(
        (customer) =>
          !customer.phone
      ).length;

    const totalSpent =
      customers.reduce(
        (total, customer) =>
          total +
          Number(
            customer.totalSpent || 0
          ),
        0
      );

    const averageCustomerValue =
      customers.length > 0
        ? totalSpent /
          customers.length
        : 0;

    return {
      totalCustomers:
        customers.length,

      registeredCustomers,

      walkInCustomers,

      totalSpent,

      averageCustomerValue,
    };
  }, [customers]);

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
            Loading customers...
          </h2>

          <p>
            Preparing customer records.
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
            className="admin-nav-item"
            onClick={() =>
              navigate(
                "/admin/orders"
              )
            }
          >
            <Package size={18} />

            Orders
          </button>

          <button
            type="button"
            className="admin-nav-item active"
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
              CUSTOMER MANAGEMENT
            </p>

            <h2>
              Customers
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
              <Users size={20} />
            </div>

            <div>

              <span>
                Total Customers
              </span>

              <strong>
                {
                  statistics.totalCustomers
                }
              </strong>

            </div>

          </div>

          <div className="admin-stat-card">

            <div className="admin-stat-icon">
              <UserRound size={20} />
            </div>

            <div>

              <span>
                With Phone
              </span>

              <strong>
                {
                  statistics.registeredCustomers
                }
              </strong>

            </div>

          </div>

          <div className="admin-stat-card">

            <div className="admin-stat-icon">
              <ShoppingCart size={20} />
            </div>

            <div>

              <span>
                Walk-in Customers
              </span>

              <strong>
                {
                  statistics.walkInCustomers
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
                Customer Sales
              </span>

              <strong>
                {formatPrice(
                  statistics.totalSpent
                )}
              </strong>

            </div>

          </div>

        </section>

        {/* =================================================
            CUSTOMER PANEL
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
                CUSTOMER DIRECTORY
              </p>

              <h3>
                All Customers
              </h3>

            </div>

            <div className="admin-orders-tools">

              <div className="admin-products-search">

                <Search size={16} />

                <input
                  type="text"
                  placeholder="Search customer or phone..."
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

              <button
                type="button"
                className="admin-refresh-button"
                onClick={() =>
                  loadCustomersData(
                    true
                  )
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

          {/* RESULT SUMMARY */}

          <div className="admin-orders-result-summary">

            <span>
              Showing{" "}
              <strong>
                {
                  filteredCustomers.length
                }
              </strong>{" "}
              of{" "}
              <strong>
                {customers.length}
              </strong>{" "}
              customers
            </span>

            <span>
              Avg. customer value:{" "}
              <strong>
                {formatPrice(
                  statistics.averageCustomerValue
                )}
              </strong>
            </span>

          </div>

          {/* =================================================
              TABLE
          ================================================= */}

          {filteredCustomers.length ===
          0 ? (

            <div className="admin-empty-state">

              <Users size={30} />

              <p>
                No customers found.
              </p>

            </div>

          ) : (

            <div className="admin-table-wrapper">

              <table className="admin-table admin-customers-table">

                <thead>

                  <tr>

                    <th>
                      Customer
                    </th>

                    <th>
                      Phone
                    </th>

                    <th>
                      Orders
                    </th>

                    <th>
                      Total Spent
                    </th>

                    <th>
                      Last Order
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {filteredCustomers.map(
                    (customer) => (
                      <tr
                        key={
                          customer.id
                        }
                      >

                        {/* CUSTOMER */}

                        <td>

                          <div className="admin-customer-cell">

                            <div
                              style={{
                                width:
                                  "34px",
                                height:
                                  "34px",
                                display:
                                  "flex",
                                alignItems:
                                  "center",
                                justifyContent:
                                  "center",
                                flexShrink: 0,
                                borderRadius:
                                  "50%",
                                background:
                                  "#f1f1ed",
                                color:
                                  "#555550",
                              }}
                            >

                              <UserRound
                                size={16}
                              />

                            </div>

                            <div>

                              <strong>
                                {
                                  customer.name
                                }
                              </strong>

                              <span>
                                {customer.phone
                                  ? "Customer"
                                  : "Walk-in"}
                              </span>

                            </div>

                          </div>

                        </td>

                        {/* PHONE */}

                        <td>

                          <span>
                            {
                              customer.phone ||
                              "No phone number"
                            }
                          </span>

                        </td>

                        {/* ORDERS */}

                        <td>

                          <strong>
                            {
                              customer.totalOrders
                            }
                          </strong>

                        </td>

                        {/* SPENDING */}

                        <td>

                          <strong>
                            {formatPrice(
                              customer.totalSpent
                            )}
                          </strong>

                        </td>

                        {/* LAST ORDER */}

                        <td>

                          <div
                            style={{
                              display:
                                "flex",
                              flexDirection:
                                "column",
                              gap: "3px",
                            }}
                          >

                            <span>
                              {formatDate(
                                customer.lastOrderDate
                              )}
                            </span>

                            <span
                              style={{
                                color:
                                  "#999999",
                                fontSize:
                                  "8px",
                              }}
                            >
                              {
                                customer.lastOrderNumber
                              }
                            </span>

                          </div>

                        </td>

                      </tr>
                    )
                  )}

                </tbody>

              </table>

            </div>

          )}

        </section>

      </main>

    </div>
  );
}

export default AdminCustomers;