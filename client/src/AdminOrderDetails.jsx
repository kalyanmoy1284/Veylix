import React, { useEffect, useState } from "react";

import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Package,
  Printer,
  RefreshCcw,
  ShoppingBag,
  XCircle,
  UserRound,
} from "lucide-react";

import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

function AdminOrderDetails() {
  const navigate = useNavigate();
  const { orderNumber } = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  const [updatingStatus, setUpdatingStatus] =
    useState(false);

  const [returnRequest, setReturnRequest] =
    useState(null);

  const [returnLoading, setReturnLoading] =
    useState(false);

  const [returnActionLoading, setReturnActionLoading] =
    useState(false);

  const [returnReason, setReturnReason] =
    useState("");

  const [returnRefundAmount, setReturnRefundAmount] =
    useState("");

  /* =====================================================
     FORMAT PRICE
  ===================================================== */

  const formatPrice = (value) => {
    return `৳ ${Number(value || 0).toLocaleString()}`;
  };

  const formatPaymentMethod = (method) => {
    const labels = {
      cod: "Cash on Delivery",
      cash: "Cash",
      bkash: "bKash",
      nagad: "Nagad",
      rocket: "Rocket",
      card: "Credit / Debit Card",
    };

    return labels[method] || method || "N/A";
  };

  const getSubmittedPaymentDetails = (notes) => {
    const value = String(notes || "");

    const paymentNumberMatch = value.match(
      /Payment Number:\s*([^|]+)/i
    );

    const transactionIdMatch = value.match(
      /Transaction ID:\s*([^|]+)/i
    );

    const paymentReferenceMatch = value.match(
      /Payment Reference:\s*([^|]+)/i
    );

    return {
      paymentNumber:
        paymentNumberMatch?.[1]?.trim() || "",
      transactionId:
        transactionIdMatch?.[1]?.trim() ||
        paymentReferenceMatch?.[1]?.trim() ||
        "",
    };
  };

  /* =====================================================
     FORMAT DATE
  ===================================================== */

  const formatDate = (value) => {
    if (!value) {
      return "N/A";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "N/A";
    }

    return date.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  /* =====================================================
     LOAD RETURN REQUEST
  ===================================================== */

  const loadReturnRequest = async (orderId) => {
    try {
      setReturnLoading(true);

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
        "http://localhost:5000/api/returns",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Failed to load return information."
        );
      }

      const allReturns = Array.isArray(data.returns)
        ? data.returns
        : [];

      const matchingReturn = allReturns.find(
        (item) =>
          Number(item.order_id) === Number(orderId)
      );

      setReturnRequest(matchingReturn || null);

      if (!matchingReturn) {
        setReturnReason("");
      }
    } catch (returnError) {
      console.error(
        "Return information error:",
        returnError
      );
    } finally {
      setReturnLoading(false);
    }
  };

  /* =====================================================
     LOAD ORDER
  ===================================================== */

  const loadOrder = async () => {
    try {
      setLoading(true);
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
        `http://localhost:5000/api/orders/${encodeURIComponent(
          orderNumber
        )}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to load order."
        );
      }

      setOrder(data.order);

      setReturnRefundAmount(
        String(Number(data.order.total_amount || 0))
      );

      await loadReturnRequest(data.order.id);
    } catch (orderError) {
      console.error(
        "Order details error:",
        orderError
      );

      setError(
        orderError.message ||
          "Unable to load order."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     AUTH + INITIAL LOAD
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

    if (orderNumber) {
      loadOrder();
    }
  }, [navigate, orderNumber]);

  /* =====================================================
     PRINT
  ===================================================== */

  const handlePrint = () => {
    window.print();
  };

  /* =====================================================
     UPDATE ORDER STATUS
  ===================================================== */

  const handleStatusChange = async (newStatus) => {
    if (!order) {
      return;
    }

    if (order.order_type === "pos") {
      return;
    }

    if (newStatus === order.order_status) {
      return;
    }

    try {
      setUpdatingStatus(true);
      setError("");
      setStatusMessage("");

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
        `http://localhost:5000/api/orders/${order.id}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: newStatus,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Failed to update order status."
        );
      }

      setOrder((currentOrder) => ({
        ...currentOrder,
        order_status:
          data.order?.orderStatus || newStatus,
        payment_status:
          data.order?.paymentStatus ||
          currentOrder.payment_status,
      }));

      setStatusMessage(
        "Order status updated successfully."
      );
    } catch (statusError) {
      console.error(
        "Status update error:",
        statusError
      );

      setError(
        statusError.message ||
          "Unable to update order status."
      );
    } finally {
      setUpdatingStatus(false);
    }
  };

  /* =====================================================
     CANCEL ORDER
  ===================================================== */

  const handleCancelOrder = async () => {
    if (!order || order.order_type === "pos") {
      return;
    }

    const cancellableStatuses = [
      "pending",
      "confirmed",
      "processing",
    ];

    if (!cancellableStatuses.includes(order.order_status)) {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to cancel this order?\n\nThe purchased stock will be restored."
    );

    if (!confirmed) {
      return;
    }

    try {
      setUpdatingStatus(true);
      setError("");
      setStatusMessage("");

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
        `http://localhost:5000/api/orders/${order.id}/cancel`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Failed to cancel order."
        );
      }

      setOrder((currentOrder) => ({
        ...currentOrder,
        order_status:
          data.order?.orderStatus || "cancelled",
        payment_status:
          data.order?.paymentStatus ||
          currentOrder.payment_status,
      }));

      setStatusMessage(
        "Order cancelled successfully. Stock has been restored."
      );
    } catch (cancelError) {
      console.error(
        "Order cancellation error:",
        cancelError
      );

      setError(
        cancelError.message ||
          "Unable to cancel order."
      );
    } finally {
      setUpdatingStatus(false);
    }
  };

  /* =====================================================
     CREATE RETURN REQUEST
  ===================================================== */

  const handleCreateReturn = async (event) => {
    event.preventDefault();

    if (!order) {
      return;
    }

    if (
      order.order_type !== "online" ||
      order.order_status !== "delivered"
    ) {
      return;
    }

    if (returnRequest) {
      return;
    }

    const reason = returnReason.trim();

    const refundAmount = Number(
      returnRefundAmount
    );

    if (!reason) {
      setError(
        "Please provide a return reason."
      );

      return;
    }

    if (
      !Number.isFinite(refundAmount) ||
      refundAmount <= 0
    ) {
      setError(
        "Please enter a valid refund amount."
      );

      return;
    }

    if (
      refundAmount >
      Number(order.total_amount || 0)
    ) {
      setError(
        "Refund amount cannot exceed the order total."
      );

      return;
    }

    const confirmed = window.confirm(
      "Create a return request for this order?\n\nThe request will be sent to Return Management for approval."
    );

    if (!confirmed) {
      return;
    }

    try {
      setReturnActionLoading(true);
      setError("");
      setStatusMessage("");

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
        "http://localhost:5000/api/returns",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            orderId: order.id,
            reason,
            refundAmount,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Failed to create return request."
        );
      }

      setStatusMessage(
        "Return request created successfully."
      );

      setReturnReason("");

      await loadReturnRequest(order.id);
    } catch (returnError) {
      console.error(
        "Create return request error:",
        returnError
      );

      setError(
        returnError.message ||
          "Unable to create return request."
      );
    } finally {
      setReturnActionLoading(false);
    }
  };

  /* =====================================================
     RETURN STATUS LABEL
  ===================================================== */

  const getReturnStatusLabel = (status) => {
    switch (status) {
      case "requested":
        return "Requested";

      case "approved":
        return "Approved";

      case "rejected":
        return "Rejected";

      case "completed":
        return "Completed";

      default:
        return "No Request";
    }
  };

  const latestPayment =
    Array.isArray(order?.payments) &&
    order.payments.length > 0
      ? order.payments[order.payments.length - 1]
      : null;

  const submittedPayment =
    getSubmittedPaymentDetails(order?.notes);

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <div className="admin-dashboard-page">
        <div className="admin-dashboard-loading">
          <div className="admin-loading-spinner" />

          <h2>Loading order...</h2>

          <p>Fetching order details.</p>
        </div>
      </div>
    );
  }

  /* =====================================================
     ERROR WITHOUT ORDER
  ===================================================== */

  if (error && !order) {
    return (
      <div className="admin-dashboard-page">
        <main className="admin-main">
          <div className="admin-error-box">
            <AlertTriangle size={18} />

            <span>{error}</span>
          </div>

          <Link
            to="/admin/orders"
            className="secondary-button"
          >
            <ArrowLeft size={15} />

            Back to Orders
          </Link>
        </main>
      </div>
    );
  }

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <div className="admin-dashboard-page">

      <style>{`
        @media print {
          .no-print { display: none !important; }
          .admin-dashboard-page { background: #fff !important; }
          .admin-main { margin: 0 !important; padding: 0 !important; }
          .admin-invoice { box-shadow: none !important; border: 0 !important; }
          .admin-invoice-watermark { opacity: 0.04 !important; }
        }
      `}</style>

      {/* =================================================
          SIDEBAR
      ================================================= */}

      <aside className="admin-sidebar no-print">

        <div className="admin-sidebar-brand">
          <div>
            <img
              src="/assets/logo.svg"
              alt="Veylix"
              style={{
                width: "105px",
                height: "auto",
                display: "block",
                filter: "brightness(0) invert(1)",
              }}
            />

            <span>MANAGEMENT</span>
          </div>
        </div>

        <nav className="admin-sidebar-nav">

          <button
            type="button"
            className="admin-nav-item"
            onClick={() => navigate("/admin")}
          >
            <ShoppingBag size={18} />

            Dashboard
          </button>

          <button
            type="button"
            className="admin-nav-item"
            onClick={() =>
              navigate("/admin/products")
            }
          >
            <Package size={18} />

            Products
          </button>

          <button
            type="button"
            className="admin-nav-item"
            onClick={() =>
              navigate("/admin/inventory")
            }
          >
            <Package size={18} />

            Inventory
          </button>

          <button
            type="button"
            className="admin-nav-item"
            onClick={() =>
              navigate("/admin/pos")
            }
          >
            <ShoppingBag size={18} />

            New Sale
          </button>

          <button
            type="button"
            className="admin-nav-item active"
            onClick={() =>
              navigate("/admin/orders")
            }
          >
            <Package size={18} />

            Orders
          </button>

          <button
            type="button"
            className="admin-nav-item"
            onClick={() =>
              navigate("/admin/returns")
            }
          >
            <RefreshCcw size={18} />

            Returns
          </button>

          <button
            type="button"
            className="admin-nav-item"
            onClick={() =>
              navigate("/admin/customers")
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

              navigate("/admin/login", {
                replace: true,
              });
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

        <header className="admin-topbar no-print">

          <div>
            <p className="admin-topbar-label">
              ORDER DETAILS
            </p>

            <h2>{order.order_number}</h2>
          </div>

          <div className="admin-order-actions">

            <Link
              to="/admin/orders"
              className="secondary-button"
            >
              <ArrowLeft size={15} />

              Orders
            </Link>

            <button
              type="button"
              className="admin-print-button"
              onClick={handlePrint}
            >
              <Printer size={15} />

              Print Invoice
            </button>

          </div>

        </header>

        {/* =================================================
            MESSAGES
        ================================================= */}

        <div className="no-print">

          {error && (
            <div className="admin-error-box">
              <AlertTriangle size={18} />

              <span>{error}</span>
            </div>
          )}

          {statusMessage && (
            <div className="admin-success-box">
              <CheckCircle2 size={18} />

              <span>{statusMessage}</span>
            </div>
          )}

        </div>

        {/* =================================================
            ORDER STATUS
        ================================================= */}

        <section
          className="admin-panel no-print"
          style={{
            marginBottom: "18px",
          }}
        >

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "20px",
              flexWrap: "wrap",
            }}
          >

            <div>

              <p className="section-label">
                ORDER MANAGEMENT
              </p>

              <h3
                style={{
                  margin: 0,
                }}
              >
                Order Status
              </h3>

              <p
                style={{
                  marginTop: "6px",
                  color: "#888882",
                  fontSize: "9px",
                }}
              >
                Update the current status of this
                order.
              </p>

            </div>

            {order.order_type === "pos" ? (

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "9px",
                }}
              >

                <span
                  style={{
                    color: "#777771",
                    fontSize: "9px",
                  }}
                >
                  POS Sale
                </span>

                <span className="admin-status-badge completed">
                  Completed
                </span>

              </div>

            ) : (

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  flexWrap: "wrap",
                  justifyContent: "flex-end",
                }}
              >

                {order.order_status === "cancelled" ? (
                  <span className="admin-status-badge cancelled">
                    Cancelled
                  </span>
                ) : (
                  <>
                    <select
                      value={
                        order.order_status || "pending"
                      }
                      onChange={(event) =>
                        handleStatusChange(
                          event.target.value
                        )
                      }
                      disabled={
                        updatingStatus
                      }
                      style={{
                        minWidth: "155px",
                        minHeight: "40px",
                        padding: "0 34px 0 12px",
                        border: "1px solid #dcdcd7",
                        borderRadius: "5px",
                        background: "#ffffff",
                        color: "#111111",
                        fontSize: "10px",
                        fontWeight: 600,
                        outline: "none",
                      }}
                    >
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
                    </select>

                    {[
                      "pending",
                      "confirmed",
                      "processing",
                    ].includes(
                      order.order_status
                    ) && (
                      <button
                        type="button"
                        className="secondary-button"
                        onClick={
                          handleCancelOrder
                        }
                        disabled={
                          updatingStatus
                        }
                        style={{
                          minHeight: "40px",
                          padding: "10px 13px",
                          color: "#b42318",
                          borderColor: "#e3c1bd",
                          whiteSpace: "nowrap",
                        }}
                      >
                        <XCircle size={14} />
                        {updatingStatus
                          ? "Updating..."
                          : "Cancel Order"}
                      </button>
                    )}
                  </>
                )}

              </div>

            )}

          </div>

        </section>

        {/* =================================================
            RETURN / REFUND
        ================================================= */}

        {order.order_type === "online" &&
          !returnLoading && (
            <section
              className="admin-panel no-print"
              style={{
                marginBottom: "18px",
              }}
            >

              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent:
                    "space-between",
                  gap: "25px",
                  flexWrap: "wrap",
                }}
              >

                <div>

                  <p className="section-label">
                    RETURNS & REFUNDS
                  </p>

                  <h3
                    style={{
                      margin: 0,
                    }}
                  >
                    Return this order
                  </h3>

                  <p
                    style={{
                      marginTop: "6px",
                      color: "#888882",
                      fontSize: "9px",
                      lineHeight: 1.6,
                      maxWidth: "600px",
                    }}
                  >
                    Delivered online orders can
                    be submitted for return. The
                    request must be approved before
                    stock restoration and refund
                    processing.
                  </p>

                </div>

                {returnRequest && (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-end",
                      gap: "5px",
                    }}
                  >

                    <span
                      className={`admin-status-badge ${
                        returnRequest.return_status
                      }`}
                    >
                      {getReturnStatusLabel(
                        returnRequest.return_status
                      )}
                    </span>

                    <span
                      style={{
                        fontSize: "9px",
                        color: "#888882",
                      }}
                    >
                      Refund:{" "}
                      {formatPrice(
                        returnRequest.refund_amount
                      )}
                    </span>

                  </div>
                )}

              </div>

              {returnRequest ? (

                <div
                  style={{
                    marginTop: "18px",
                    paddingTop: "18px",
                    borderTop:
                      "1px solid #eeeeee",
                    display: "flex",
                    alignItems: "center",
                    justifyContent:
                      "space-between",
                    gap: "15px",
                    flexWrap: "wrap",
                  }}
                >

                  <div>

                    <strong
                      style={{
                        display: "block",
                        fontSize: "11px",
                      }}
                    >
                      Return request status
                    </strong>

                    <span
                      style={{
                        display: "block",
                        marginTop: "5px",
                        color: "#777771",
                        fontSize: "9px",
                      }}
                    >
                      {returnRequest.reason ||
                        "No reason provided."}
                    </span>

                    <span
                      style={{
                        display: "block",
                        marginTop: "5px",
                        color: "#999999",
                        fontSize: "8px",
                      }}
                    >
                      Refund status:{" "}
                      {returnRequest.refund_status}
                    </span>

                  </div>

                  <Link
                    to="/admin/returns"
                    className="secondary-button"
                    style={{
                      minHeight: "38px",
                      padding: "9px 14px",
                      fontSize: "10px",
                    }}
                  >
                    <RefreshCcw size={14} />

                    Open Return Management
                  </Link>

                </div>

              ) : order.order_status === "delivered" ? (

                <form
                  onSubmit={handleCreateReturn}
                  style={{
                    marginTop: "18px",
                    paddingTop: "18px",
                    borderTop:
                      "1px solid #eeeeee",
                    display: "grid",
                    gridTemplateColumns:
                      "minmax(0, 1fr) 180px auto",
                    gap: "12px",
                    alignItems: "end",
                  }}
                >

                  <div>

                    <label
                      style={{
                        display: "block",
                        marginBottom: "7px",
                        fontSize: "9px",
                        fontWeight: 700,
                        letterSpacing: "0.7px",
                        color: "#666666",
                        textTransform:
                          "uppercase",
                      }}
                    >
                      Return reason
                    </label>

                    <input
                      type="text"
                      value={returnReason}
                      onChange={(event) =>
                        setReturnReason(
                          event.target.value
                        )
                      }
                      placeholder="Example: Product arrived damaged"
                      disabled={
                        returnActionLoading
                      }
                      style={{
                        width: "100%",
                        minHeight: "40px",
                        padding: "0 11px",
                        border:
                          "1px solid #dddddd",
                        borderRadius: "5px",
                        outline: "none",
                        fontSize: "10px",
                        color: "#111111",
                      }}
                    />

                  </div>

                  <div>

                    <label
                      style={{
                        display: "block",
                        marginBottom: "7px",
                        fontSize: "9px",
                        fontWeight: 700,
                        letterSpacing: "0.7px",
                        color: "#666666",
                        textTransform:
                          "uppercase",
                      }}
                    >
                      Refund amount
                    </label>

                    <input
                      type="number"
                      min="0.01"
                      max={Number(
                        order.total_amount || 0
                      )}
                      step="0.01"
                      value={returnRefundAmount}
                      onChange={(event) =>
                        setReturnRefundAmount(
                          event.target.value
                        )
                      }
                      disabled={
                        returnActionLoading
                      }
                      style={{
                        width: "100%",
                        minHeight: "40px",
                        padding: "0 11px",
                        border:
                          "1px solid #dddddd",
                        borderRadius: "5px",
                        outline: "none",
                        fontSize: "10px",
                        color: "#111111",
                      }}
                    />

                  </div>

                  <button
                    type="submit"
                    className="primary-button"
                    disabled={
                      returnActionLoading
                    }
                    style={{
                      minHeight: "40px",
                      padding: "10px 14px",
                      fontSize: "10px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <RefreshCcw size={14} />

                    {returnActionLoading
                      ? "Submitting..."
                      : "Request Return"}
                  </button>

                </form>

              ) : (

                <div
                  style={{
                    marginTop: "18px",
                    paddingTop: "18px",
                    borderTop:
                      "1px solid #eeeeee",
                    color: "#888882",
                    fontSize: "9px",
                  }}
                >
                  This order must be delivered
                  before a return request can be
                  created.
                </div>

              )}

            </section>
          )}

        {/* =================================================
            INVOICE
        ================================================= */}

        <section
          className="admin-invoice admin-invoice-branded"
          style={{
            position: "relative",
            overflow: "hidden",
          }}
        >

          <img
            src="/assets/watermark.svg"
            alt=""
            aria-hidden="true"
            className="admin-invoice-watermark"
            style={{
              position: "absolute",
              right: "20px",
              bottom: "45px",
              width: "330px",
              height: "330px",
              objectFit: "contain",
              opacity: 0.045,
              pointerEvents: "none",
            }}
          />

          <div className="admin-invoice-header" style={{ position: "relative", zIndex: 1 }}>

            <div>
              <img
                src="/assets/logo.svg"
                alt="Veylix"
                style={{
                  width: "155px",
                  height: "auto",
                  display: "block",
                  marginBottom: "8px",
                }}
              />

              <p>Sales Invoice</p>
            </div>

            <div className="admin-invoice-meta">

              <div>
                <span>Invoice</span>

                <strong>
                  {order.order_number}
                </strong>
              </div>

              <div>
                <span>Date</span>

                <strong>
                  {formatDate(
                    order.created_at
                  )}
                </strong>
              </div>

            </div>

          </div>

          <div className="admin-invoice-info-grid" style={{ position: "relative", zIndex: 1 }}>

            <div className="admin-invoice-info-box">

              <p className="section-label">
                CUSTOMER
              </p>

              <strong>
                {order.customer_name ||
                  "Walk-in Customer"}
              </strong>

              <span>
                {order.customer_phone ||
                  "No phone number"}
              </span>

              {order.customer_email && (
                <span>
                  {order.customer_email}
                </span>
              )}

              {order.delivery_address && (
                <span>
                  {order.delivery_address}
                </span>
              )}

            </div>

            <div className="admin-invoice-info-box">

              <p className="section-label">
                ORDER INFORMATION
              </p>

              <div className="admin-invoice-detail-row">
                <span>Order type</span>

                <strong>
                  {order.order_type}
                </strong>
              </div>

              <div className="admin-invoice-detail-row">
                <span>Payment</span>

                <strong>
                  {formatPaymentMethod(
                    order.payment_method
                  )}
                </strong>
              </div>

              <div className="admin-invoice-detail-row">
                <span>Payment status</span>

                <strong
                  className={`admin-status-badge ${
                    order.payment_status
                  }`}
                >
                  {order.payment_status}
                </strong>
              </div>

              {submittedPayment.paymentNumber && (
                <div className="admin-invoice-detail-row">
                  <span>Payment Number</span>

                  <strong>
                    {submittedPayment.paymentNumber}
                  </strong>
                </div>
              )}

              {submittedPayment.transactionId && (
                <div className="admin-invoice-detail-row">
                  <span>Customer Transaction ID</span>

                  <strong style={{ wordBreak: "break-word", textAlign: "right" }}>
                    {submittedPayment.transactionId}
                  </strong>
                </div>
              )}

              {latestPayment?.transaction_id && (
                <div className="admin-invoice-detail-row">
                  <span>System Transaction ID</span>

                  <strong style={{ wordBreak: "break-word", textAlign: "right" }}>
                    {latestPayment.transaction_id}
                  </strong>
                </div>
              )}

              {latestPayment && (
                <>
                  <div className="admin-invoice-detail-row">
                    <span>Payment amount</span>

                    <strong>
                      {formatPrice(
                        latestPayment.amount
                      )}
                    </strong>
                  </div>

                  <div className="admin-invoice-detail-row">
                    <span>Paid at</span>

                    <strong>
                      {formatDate(
                        latestPayment.paid_at
                      )}
                    </strong>
                  </div>
                </>
              )}

              <div className="admin-invoice-detail-row">
                <span>Status</span>

                <strong
                  className={`admin-status-badge ${
                    order.order_status
                  }`}
                >
                  {order.order_status}
                </strong>
              </div>

            </div>

          </div>

          <div className="admin-invoice-items" style={{ position: "relative", zIndex: 1 }}>

            <div className="admin-invoice-items-heading">

              <h3>Order Items</h3>

              <span>
                {Array.isArray(order.items)
                  ? order.items.length
                  : 0}{" "}
                products
              </span>

            </div>

            <table className="admin-invoice-table">

              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Qty</th>
                  <th>Unit Price</th>
                  <th>Total</th>
                </tr>
              </thead>

              <tbody>

                {Array.isArray(order.items) &&
                  order.items.map(
                    (item, index) => {

                      const quantity = Number(
                        item.quantity || 0
                      );

                      const unitPrice = Number(
                        item.unit_price ||
                          item.price ||
                          0
                      );

                      const itemTotal = Number(
                        item.item_total ||
                          unitPrice * quantity
                      );

                      return (
                        <tr
                          key={
                            item.id ||
                            item.product_id ||
                            index
                          }
                        >

                          <td>
                            <div className="admin-invoice-product">

                              {item.image && (
                                <div className="admin-invoice-product-image">
                                  <img
                                    src={item.image}
                                    alt={
                                      item.product_name ||
                                      "Product"
                                    }
                                  />
                                </div>
                              )}

                              <div>
                                <strong>
                                  {item.product_name ||
                                    item.name ||
                                    "Product"}
                                </strong>
                              </div>

                            </div>
                          </td>

                          <td>
                            {item.sku || "N/A"}
                          </td>

                          <td>{quantity}</td>

                          <td>
                            {formatPrice(
                              unitPrice
                            )}
                          </td>

                          <td>
                            <strong>
                              {formatPrice(
                                itemTotal
                              )}
                            </strong>
                          </td>

                        </tr>
                      );
                    }
                  )}

              </tbody>

            </table>

          </div>

          <div className="admin-invoice-bottom" style={{ position: "relative", zIndex: 1 }}>

            <div className="admin-invoice-note">

              <CheckCircle2 size={18} />

              <div>
                <strong>
                  Thank you for shopping with
                  Veylix.
                </strong>

                <span>
                  This invoice is generated from
                  the Veylix Management System.
                </span>
              </div>

            </div>

            <div className="admin-invoice-totals">

              <div>
                <span>Subtotal</span>

                <strong>
                  {formatPrice(
                    order.subtotal ??
                      order.subtotal_amount ??
                      order.total_amount
                  )}
                </strong>
              </div>

              {Number(
                order.discount ??
                  order.discount_amount ??
                  0
              ) > 0 && (
                <div>
                  <span>Discount</span>

                  <strong>
                    -{" "}
                    {formatPrice(
                      order.discount ??
                        order.discount_amount
                    )}
                  </strong>
                </div>
              )}

              <div>
                <span>Shipping</span>

                <strong>
                  {formatPrice(
                    order.shipping_cost ?? 0
                  )}
                </strong>
              </div>

              <div className="grand-total">
                <span>Total</span>

                <strong>
                  {formatPrice(
                    order.total_amount
                  )}
                </strong>
              </div>

            </div>

          </div>

        </section>

      </main>

    </div>
  );
}

export default AdminOrderDetails;