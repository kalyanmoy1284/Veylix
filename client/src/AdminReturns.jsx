import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Package,
  RefreshCcw,
  ShoppingBag,
  UserRound,
  XCircle,
} from "lucide-react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

const API_BASE = "http://localhost:5000/api";

function AdminReturns() {
  const navigate = useNavigate();

  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] =
    useState(false);
  const [message, setMessage] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("all");

  /* =====================================================
     AUTH + LOAD RETURNS
  ===================================================== */

  useEffect(() => {
    const token = localStorage.getItem(
      "veylix_admin_token"
    );

    const savedUser = localStorage.getItem(
      "veylix_admin_user"
    );

    if (!token || !savedUser) {
      navigate("/admin/login", {
        replace: true,
      });

      return;
    }

    loadReturns();
  }, [navigate]);

  /* =====================================================
     LOAD RETURNS
  ===================================================== */

  const loadReturns = async () => {
    try {
      setLoading(true);
      setError("");
      setMessage("");

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
        `${API_BASE}/returns`,
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
            "Failed to load returns."
        );
      }

      setReturns(
        Array.isArray(data.returns)
          ? data.returns
          : []
      );
    } catch (loadError) {
      console.error(
        "Returns load error:",
        loadError
      );

      setError(
        loadError.message ||
          "Unable to load return requests."
      );
    } finally {
      setLoading(false);
    }
  };

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

    return date.toLocaleString(
      "en-GB",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  /* =====================================================
     UPDATE RETURN ACTION
  ===================================================== */

  const handleReturnAction = async (
    returnId,
    action
  ) => {
    if (
      !returnId ||
      actionLoading
    ) {
      return;
    }

    let endpoint = "";
    let confirmationMessage = "";

    if (action === "approve") {
      endpoint = `${API_BASE}/returns/${returnId}/approve`;

      confirmationMessage =
        "Approve this return request?";
    }

    if (action === "reject") {
      endpoint = `${API_BASE}/returns/${returnId}/reject`;

      confirmationMessage =
        "Reject this return request?";
    }

    if (action === "process") {
      endpoint = `${API_BASE}/returns/${returnId}/process`;

      confirmationMessage =
        "Process this approved return?\n\nStock will be restored and the payment will be marked as refunded.";
    }

    if (!endpoint) {
      return;
    }

    const confirmed =
      window.confirm(
        confirmationMessage
      );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoading(true);
      setError("");
      setMessage("");

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
        endpoint,
        {
          method: "PUT",
          headers: {
            "Content-Type":
              "application/json",
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
            "Action failed."
        );
      }

      setMessage(
        data.message ||
          "Return updated successfully."
      );

      await loadReturns();
    } catch (actionError) {
      console.error(
        "Return action error:",
        actionError
      );

      setError(
        actionError.message ||
          "Unable to update return."
      );
    } finally {
      setActionLoading(false);
    }
  };

  /* =====================================================
     FILTER
  ===================================================== */

  const filteredReturns = useMemo(() => {
    if (
      statusFilter === "all"
    ) {
      return returns;
    }

    return returns.filter(
      (item) =>
        item.return_status ===
        statusFilter
    );
  }, [
    returns,
    statusFilter,
  ]);

  /* =====================================================
     STATS
  ===================================================== */

  const stats = useMemo(() => {
    const requested =
      returns.filter(
        (item) =>
          item.return_status ===
          "requested"
      ).length;

    const approved =
      returns.filter(
        (item) =>
          item.return_status ===
          "approved"
      ).length;

    const rejected =
      returns.filter(
        (item) =>
          item.return_status ===
          "rejected"
      ).length;

    const completed =
      returns.filter(
        (item) =>
          item.return_status ===
          "completed"
      ).length;

    const refundedAmount =
      returns
        .filter(
          (item) =>
            item.refund_status ===
            "processed"
        )
        .reduce(
          (total, item) =>
            total +
            Number(
              item.refund_amount ||
                0
            ),
          0
        );

    return {
      total: returns.length,
      requested,
      approved,
      rejected,
      completed,
      refundedAmount,
    };
  }, [returns]);

  /* =====================================================
     BADGE
  ===================================================== */

  const getStatusClass = (
    status
  ) => {
    return `admin-status-badge ${
      status || "pending"
    }`;
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
            Loading returns...
          </h2>

          <p>
            Fetching return requests.
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
            <ShoppingBag
              size={18}
            />

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
            <Package size={18} />

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
            <ShoppingBag
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
            onClick={() =>
              navigate(
                "/admin/returns"
              )
            }
          >
            <RefreshCcw
              size={18}
            />

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
            <UserRound
              size={18}
            />

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
            <ArrowLeft
              size={18}
            />

            Logout
          </button>

        </div>

      </aside>

      {/* =================================================
          MAIN
      ================================================= */}

      <main className="admin-main">

        {/* =================================================
            TOPBAR
        ================================================= */}

        <header className="admin-topbar">

          <div>
            <p className="admin-topbar-label">
              RETURNS & REFUNDS
            </p>

            <h2>
              Return Management
            </h2>
          </div>

          <div
            style={{
              display: "flex",
              gap: "10px",
            }}
          >
            <button
              type="button"
              className="secondary-button"
              onClick={
                loadReturns
              }
              disabled={
                actionLoading
              }
            >
              <RefreshCcw
                size={15}
              />

              Refresh
            </button>
          </div>

        </header>

        {/* =================================================
            ALERTS
        ================================================= */}

        {error && (
          <div
            className="admin-error-box"
            style={{
              marginBottom: "18px",
            }}
          >
            <AlertTriangle
              size={18}
            />

            <span>
              {error}
            </span>
          </div>
        )}

        {message && (
          <div
            className="admin-success-box"
            style={{
              marginBottom: "18px",
            }}
          >
            <CheckCircle2
              size={18}
            />

            <span>
              {message}
            </span>
          </div>
        )}

        {/* =================================================
            STATS
        ================================================= */}

        <section className="admin-stat-grid">

          <div className="admin-stat-card">
            <div className="admin-stat-icon">
              <RefreshCcw
                size={18}
              />
            </div>

            <div>
              <span>
                Total Returns
              </span>

              <strong>
                {stats.total}
              </strong>
            </div>
          </div>

          <div className="admin-stat-card">
            <div className="admin-stat-icon">
              <RefreshCcw
                size={18}
              />
            </div>

            <div>
              <span>
                Requested
              </span>

              <strong>
                {stats.requested}
              </strong>
            </div>
          </div>

          <div className="admin-stat-card">
            <div className="admin-stat-icon">
              <CheckCircle2
                size={18}
              />
            </div>

            <div>
              <span>
                Approved
              </span>

              <strong>
                {stats.approved}
              </strong>
            </div>
          </div>

          <div className="admin-stat-card">
            <div className="admin-stat-icon">
              <CheckCircle2
                size={18}
              />
            </div>

            <div>
              <span>
                Completed
              </span>

              <strong>
                {stats.completed}
              </strong>
            </div>
          </div>

        </section>

        {/* =================================================
            REFUND TOTAL
        ================================================= */}

        <section
          className="admin-panel"
          style={{
            marginTop: "18px",
            marginBottom: "18px",
          }}
        >

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent:
                "space-between",
              gap: "20px",
              flexWrap: "wrap",
            }}
          >

            <div>
              <p className="section-label">
                REFUNDS
              </p>

              <h3
                style={{
                  margin: 0,
                  fontSize: "20px",
                }}
              >
                Processed Refunds
              </h3>

              <p
                style={{
                  marginTop: "5px",
                  color: "#888888",
                  fontSize: "11px",
                }}
              >
                Total value of refunds
                already processed.
              </p>
            </div>

            <strong
              style={{
                fontSize: "24px",
                letterSpacing:
                  "-0.7px",
              }}
            >
              {formatPrice(
                stats.refundedAmount
              )}
            </strong>

          </div>

        </section>

        {/* =================================================
            FILTER
        ================================================= */}

        <section className="admin-panel">

          <div className="admin-panel-header">

            <div>
              <p className="section-label">
                RETURN HISTORY
              </p>

              <h3>
                All Returns
              </h3>
            </div>

            <select
              value={
                statusFilter
              }
              onChange={(event) =>
                setStatusFilter(
                  event.target.value
                )
              }
              style={{
                minWidth: "160px",
                minHeight: "38px",
                padding:
                  "0 30px 0 10px",
                border:
                  "1px solid #dddddd",
                background:
                  "#ffffff",
                color: "#222222",
                borderRadius: "5px",
                fontSize: "10px",
                outline: "none",
              }}
            >
              <option value="all">
                All Statuses
              </option>

              <option value="requested">
                Requested
              </option>

              <option value="approved">
                Approved
              </option>

              <option value="rejected">
                Rejected
              </option>

              <option value="completed">
                Completed
              </option>
            </select>

          </div>

          {/* =================================================
              TABLE
          ================================================= */}

          {filteredReturns.length ===
          0 ? (

            <div
              style={{
                minHeight: "260px",
                display: "flex",
                flexDirection:
                  "column",
                alignItems:
                  "center",
                justifyContent:
                  "center",
                textAlign: "center",
                borderTop:
                  "1px solid #eeeeee",
              }}
            >

              <div
                style={{
                  width: "52px",
                  height: "52px",
                  display: "flex",
                  alignItems:
                    "center",
                  justifyContent:
                    "center",
                  borderRadius:
                    "50%",
                  background:
                    "#f4f4f2",
                  marginBottom:
                    "15px",
                }}
              >
                <RefreshCcw
                  size={22}
                />
              </div>

              <h3
                style={{
                  margin: 0,
                  fontSize: "18px",
                }}
              >
                No returns found
              </h3>

              <p
                style={{
                  marginTop: "7px",
                  color: "#888888",
                  fontSize: "11px",
                }}
              >
                There are no return
                requests for this
                filter.
              </p>

            </div>

          ) : (

            <div
              style={{
                overflowX:
                  "auto",
              }}
            >

              <table
                style={{
                  width: "100%",
                  borderCollapse:
                    "collapse",
                  minWidth:
                    "1000px",
                }}
              >

                <thead>

                  <tr
                    style={{
                      borderBottom:
                        "1px solid #e5e5e5",
                    }}
                  >

                    <th className="admin-table-heading">
                      RETURN
                    </th>

                    <th className="admin-table-heading">
                      ORDER
                    </th>

                    <th className="admin-table-heading">
                      CUSTOMER
                    </th>

                    <th className="admin-table-heading">
                      REASON
                    </th>

                    <th className="admin-table-heading">
                      REFUND
                    </th>

                    <th className="admin-table-heading">
                      STATUS
                    </th>

                    <th className="admin-table-heading">
                      ACTION
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {filteredReturns.map(
                    (item) => (
                      <tr
                        key={
                          item.id
                        }
                        style={{
                          borderBottom:
                            "1px solid #eeeeee",
                        }}
                      >

                        <td
                          style={{
                            padding:
                              "16px 10px",
                            fontSize:
                              "10px",
                            fontWeight:
                              700,
                          }}
                        >
                          #{item.id}
                        </td>

                        <td
                          style={{
                            padding:
                              "16px 10px",
                          }}
                        >

                          <Link
                            to={`/admin/orders/${item.order_id}`}
                            style={{
                              fontSize:
                                "10px",
                              fontWeight:
                                700,
                            }}
                          >
                            {
                              item.order_number
                            }
                          </Link>

                          <div
                            style={{
                              marginTop:
                                "4px",
                              color:
                                "#999999",
                              fontSize:
                                "9px",
                            }}
                          >
                            Order ID:{" "}
                            {
                              item.order_id
                            }
                          </div>

                        </td>

                        <td
                          style={{
                            padding:
                              "16px 10px",
                          }}
                        >

                          <strong
                            style={{
                              display:
                                "block",
                              fontSize:
                                "10px",
                            }}
                          >
                            {
                              item.customer_name ||
                              "Walk-in Customer"
                            }
                          </strong>

                          <span
                            style={{
                              display:
                                "block",
                              marginTop:
                                "4px",
                              color:
                                "#999999",
                              fontSize:
                                "9px",
                            }}
                          >
                            {
                              item.customer_phone ||
                              "No phone"
                            }
                          </span>

                        </td>

                        <td
                          style={{
                            maxWidth:
                              "190px",
                            padding:
                              "16px 10px",
                            color:
                              "#777777",
                            fontSize:
                              "9px",
                            lineHeight:
                              1.5,
                          }}
                        >
                          {
                            item.reason ||
                            "No reason provided"
                          }
                        </td>

                        <td
                          style={{
                            padding:
                              "16px 10px",
                            whiteSpace:
                              "nowrap",
                          }}
                        >

                          <strong
                            style={{
                              display:
                                "block",
                              fontSize:
                                "10px",
                            }}
                          >
                            {formatPrice(
                              item.refund_amount
                            )}
                          </strong>

                          <span
                            className={getStatusClass(
                              item.refund_status ===
                                "processed"
                                ? "completed"
                                : "pending"
                            )}
                            style={{
                              marginTop:
                                "5px",
                              display:
                                "inline-flex",
                            }}
                          >
                            {
                              item.refund_status
                            }
                          </span>

                        </td>

                        <td
                          style={{
                            padding:
                              "16px 10px",
                          }}
                        >

                          <span
                            className={getStatusClass(
                              item.return_status
                            )}
                          >
                            {
                              item.return_status
                            }
                          </span>

                          <div
                            style={{
                              marginTop:
                                "5px",
                              color:
                                "#999999",
                              fontSize:
                                "8px",
                            }}
                          >
                            {
                              formatDate(
                                item.requested_at
                              )
                            }
                          </div>

                        </td>

                        <td
                          style={{
                            padding:
                              "16px 10px",
                          }}
                        >

                          <div
                            style={{
                              display:
                                "flex",
                              flexWrap:
                                "wrap",
                              gap: "6px",
                            }}
                          >

                            {item.return_status ===
                              "requested" && (
                              <>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleReturnAction(
                                      item.id,
                                      "approve"
                                    )
                                  }
                                  disabled={
                                    actionLoading
                                  }
                                  style={{
                                    display:
                                      "inline-flex",
                                    alignItems:
                                      "center",
                                    gap: "5px",
                                    minHeight:
                                      "30px",
                                    padding:
                                      "0 9px",
                                    border:
                                      "1px solid #111111",
                                    background:
                                      "#111111",
                                    color:
                                      "#ffffff",
                                    borderRadius:
                                      "4px",
                                    fontSize:
                                      "8px",
                                    fontWeight:
                                      700,
                                  }}
                                >
                                  <CheckCircle2
                                    size={12}
                                  />

                                  Approve
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    handleReturnAction(
                                      item.id,
                                      "reject"
                                    )
                                  }
                                  disabled={
                                    actionLoading
                                  }
                                  style={{
                                    display:
                                      "inline-flex",
                                    alignItems:
                                      "center",
                                    gap: "5px",
                                    minHeight:
                                      "30px",
                                    padding:
                                      "0 9px",
                                    border:
                                      "1px solid #dddddd",
                                    background:
                                      "#ffffff",
                                    color:
                                      "#333333",
                                    borderRadius:
                                      "4px",
                                    fontSize:
                                      "8px",
                                    fontWeight:
                                      700,
                                  }}
                                >
                                  <XCircle
                                    size={12}
                                  />

                                  Reject
                                </button>
                              </>
                            )}

                            {item.return_status ===
                              "approved" && (
                              <button
                                type="button"
                                onClick={() =>
                                  handleReturnAction(
                                    item.id,
                                    "process"
                                  )
                                }
                                disabled={
                                  actionLoading
                                }
                                style={{
                                  display:
                                    "inline-flex",
                                  alignItems:
                                    "center",
                                  gap: "5px",
                                  minHeight:
                                    "30px",
                                  padding:
                                    "0 9px",
                                  border:
                                    "1px solid #111111",
                                  background:
                                    "#111111",
                                  color:
                                    "#ffffff",
                                  borderRadius:
                                    "4px",
                                  fontSize:
                                    "8px",
                                  fontWeight:
                                    700,
                                }}
                              >
                                <RefreshCcw
                                  size={12}
                                />

                                Process Refund
                              </button>
                            )}

                            {item.return_status ===
                              "completed" && (
                              <span
                                style={{
                                  display:
                                    "inline-flex",
                                  alignItems:
                                    "center",
                                  gap: "5px",
                                  color:
                                    "#247343",
                                  fontSize:
                                    "8px",
                                  fontWeight:
                                    700,
                                }}
                              >
                                <CheckCircle2
                                  size={13}
                                />

                                Completed
                              </span>
                            )}

                            {item.return_status ===
                              "rejected" && (
                              <span
                                style={{
                                  display:
                                    "inline-flex",
                                  alignItems:
                                    "center",
                                  gap: "5px",
                                  color:
                                    "#999999",
                                  fontSize:
                                    "8px",
                                  fontWeight:
                                    700,
                                }}
                              >
                                <XCircle
                                  size={13}
                                />

                                Rejected
                              </span>
                            )}

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

export default AdminReturns;