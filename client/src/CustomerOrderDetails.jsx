import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  LockKeyhole,
  MapPin,
  Package,
  RefreshCcw,
  ShoppingBag,
  Truck,
  XCircle,
} from "lucide-react";

import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

function CustomerOrderDetails() {
  const navigate = useNavigate();
  const { orderId } = useParams();

  const [order, setOrder] = useState(null);
  const [customer, setCustomer] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isCancelling, setIsCancelling] =
    useState(false);

  const [cancelError, setCancelError] =
    useState("");

  const [cancelSuccess, setCancelSuccess] =
    useState("");

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

  const [returnError, setReturnError] =
    useState("");

  const [returnSuccess, setReturnSuccess] =
    useState("");

  /* =====================================================
     LOAD CUSTOMER
  ===================================================== */

  useEffect(() => {
    try {
      const savedCustomer =
        localStorage.getItem(
          "veylix_customer"
        );

      if (savedCustomer) {
        setCustomer(
          JSON.parse(savedCustomer)
        );
      }
    } catch {
      setCustomer(null);
    }
  }, []);

  /* =====================================================
     LOAD ORDER
  ===================================================== */

  useEffect(() => {
    loadOrder();
  }, [orderId]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      setError("");

      const token =
        localStorage.getItem(
          "veylix_customer_token"
        );

      if (!token) {
        navigate(
          "/customer/login",
          {
            replace: true,
          }
        );

        return;
      }

      const response =
        await fetch(
          "https://veylix-backend-production.up.railway.app/api/customer/orders",
          {
            method: "GET",
            headers: {
              Authorization:
                `Bearer ${token}`,
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
          {
            replace: true,
          }
        );

        return;
      }

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            "Failed to load order."
        );
      }

      const orders =
        Array.isArray(
          data.orders
        )
          ? data.orders
          : [];

      const foundOrder =
        orders.find(
          (item) =>
            String(item.id) ===
            String(orderId)
        );

      if (!foundOrder) {
        setError(
          "This order could not be found."
        );

        return;
      }

      setOrder(foundOrder);

      setReturnRefundAmount(
        String(
          Number(
            foundOrder.total_amount || 0
          )
        )
      );

      await loadReturnRequest(
        foundOrder.id,
        token
      );
    } catch (loadError) {
      console.error(
        "Customer order details error:",
        loadError
      );

      setError(
        loadError.message ||
          "Unable to load order details."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     LOAD RETURN REQUEST
  ===================================================== */

  const loadReturnRequest = async (
    currentOrderId,
    tokenOverride = null
  ) => {
    try {
      setReturnLoading(true);

      const token =
        tokenOverride ||
        localStorage.getItem(
          "veylix_customer_token"
        );

      const response =
        await fetch(
          "https://veylix-backend-production.up.railway.app/api/returns",
          {
            method: "GET",
            headers: token
              ? {
                  Authorization:
                    `Bearer ${token}`,
                }
              : {},
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
            "Failed to load return information."
        );
      }

      const matchingReturn =
        Array.isArray(
          data.returns
        )
          ? data.returns.find(
              (item) =>
                Number(
                  item.order_id
                ) ===
                Number(
                  currentOrderId
                )
            )
          : null;

      setReturnRequest(
        matchingReturn || null
      );

      if (!matchingReturn) {
        setReturnReason("");
      }
    } catch (returnLoadError) {
      console.error(
        "Return information error:",
        returnLoadError
      );
    } finally {
      setReturnLoading(false);
    }
  };

  /* =====================================================
     CANCEL ORDER
  ===================================================== */

  const handleCancelOrder =
    async () => {
      if (
        !order ||
        isCancelling
      ) {
        return;
      }

      const cancellableStatuses = [
        "pending",
        "confirmed",
        "processing",
      ];

      if (
        !cancellableStatuses.includes(
          order.order_status
        )
      ) {
        setCancelError(
          "This order can no longer be cancelled."
        );

        return;
      }

      const confirmed =
        window.confirm(
          "Cancel this order?\n\nThe order will be cancelled and the reserved stock will be restored."
        );

      if (!confirmed) {
        return;
      }

      try {
        setIsCancelling(true);
        setCancelError("");
        setCancelSuccess("");

        const token =
          localStorage.getItem(
            "veylix_customer_token"
          );

        if (!token) {
          navigate(
            "/customer/login",
            {
              replace: true,
            }
          );

          return;
        }

        const response =
          await fetch(
            `https://veylix-backend-production.up.railway.app/api/orders/${order.id}/cancel`,
            {
              method: "PUT",
              headers: {
                Authorization:
                  `Bearer ${token}`,
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
            {
              replace: true,
            }
          );

          return;
        }

        if (
          !response.ok ||
          !data.success
        ) {
          throw new Error(
            data.message ||
              "Unable to cancel this order."
          );
        }

        setOrder((currentOrder) => {
          if (!currentOrder) {
            return currentOrder;
          }

          return {
            ...currentOrder,
            order_status:
              "cancelled",
            payment_status:
              data.order?.paymentStatus ||
              currentOrder.payment_status,
          };
        });

        setCancelSuccess(
          "Order cancelled successfully. Reserved stock has been restored."
        );
      } catch (cancelOrderError) {
        console.error(
          "Cancel order error:",
          cancelOrderError
        );

        setCancelError(
          cancelOrderError.message ||
            "Unable to cancel this order."
        );
      } finally {
        setIsCancelling(false);
      }
    };

  /* =====================================================
     CREATE RETURN REQUEST
  ===================================================== */

  const handleCreateReturn =
    async (event) => {
      event.preventDefault();

      if (
        !order ||
        returnActionLoading
      ) {
        return;
      }

      if (
        order.order_type !==
          "online" ||
        order.order_status !==
          "delivered"
      ) {
        return;
      }

      if (returnRequest) {
        return;
      }

      const reason =
        returnReason.trim();

      const refundAmount =
        Number(
          returnRefundAmount
        );

      if (!reason) {
        setReturnError(
          "Please provide a return reason."
        );

        return;
      }

      if (
        !Number.isFinite(
          refundAmount
        ) ||
        refundAmount <= 0
      ) {
        setReturnError(
          "Please enter a valid refund amount."
        );

        return;
      }

      if (
        refundAmount >
        Number(
          order.total_amount || 0
        )
      ) {
        setReturnError(
          "Refund amount cannot exceed the order total."
        );

        return;
      }

      const confirmed =
        window.confirm(
          "Create a return request for this order?\n\nThe request will be sent to Return Management for approval."
        );

      if (!confirmed) {
        return;
      }

      try {
        setReturnActionLoading(
          true
        );

        setReturnError("");
        setReturnSuccess("");

        const token =
          localStorage.getItem(
            "veylix_customer_token"
          );

        if (!token) {
          navigate(
            "/customer/login",
            {
              replace: true,
            }
          );

          return;
        }

        const response =
          await fetch(
            "https://veylix-backend-production.up.railway.app/api/returns",
            {
              method: "POST",
              headers: {
                "Content-Type":
                  "application/json",
                Authorization:
                  `Bearer ${token}`,
              },
              body: JSON.stringify({
                orderId:
                  order.id,
                reason,
                refundAmount,
              }),
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
              "Failed to create return request."
          );
        }

        setReturnSuccess(
          data.message ||
            "Return request created successfully."
        );

        setReturnReason("");

        await loadReturnRequest(
          order.id,
          token
        );
      } catch (returnRequestError) {
        console.error(
          "Create return request error:",
          returnRequestError
        );

        setReturnError(
          returnRequestError.message ||
            "Unable to create return request."
        );
      } finally {
        setReturnActionLoading(
          false
        );
      }
    };

  /* =====================================================
     RETURN STATUS LABEL
  ===================================================== */

  const getReturnStatusLabel = (
    status
  ) => {
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

  /* =====================================================
     FORMAT PRICE
  ===================================================== */

  const formatPrice = (
    value
  ) => {
    return `৳ ${Number(
      value || 0
    ).toLocaleString()}`;
  };

  /* =====================================================
     FORMAT DATE
  ===================================================== */

  const formatDateTime = (
    value
  ) => {
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
     STATUS HELPERS
  ===================================================== */

  const statusSteps = [
    "pending",
    "confirmed",
    "processing",
    "shipped",
    "delivered",
  ];

  const getStatusLabel = (
    status
  ) => {
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

  const getStatusIcon = (
    status
  ) => {
    switch (status) {
      case "confirmed":
        return (
          <CheckCircle2 size={18} />
        );

      case "processing":
        return (
          <Clock3 size={18} />
        );

      case "shipped":
        return (
          <Truck size={18} />
        );

      case "delivered":
      case "completed":
        return (
          <CheckCircle2 size={18} />
        );

      case "cancelled":
        return (
          <XCircle size={18} />
        );

      default:
        return (
          <Clock3 size={18} />
        );
    }
  };

  const currentStep =
    useMemo(() => {
      if (!order) {
        return 0;
      }

      const index =
        statusSteps.indexOf(
          order.order_status
        );

      return index >= 0
        ? index
        : 0;
    }, [order]);

  const canCancel =
    Boolean(
      order &&
        [
          "pending",
          "confirmed",
          "processing",
        ].includes(
          order.order_status
        )
    );

  const isCancelled =
    order?.order_status ===
    "cancelled";

  const isDelivered =
    order?.order_status ===
      "delivered" ||
    order?.order_status ===
      "completed";

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <div className="customer-order-details-page">

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

              <Link to="/orders">
                My Orders
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

        <main className="customer-order-details-main">

          <div className="customer-order-loading">

            <div className="customer-order-spinner" />

            <h2>
              Loading order...
            </h2>

            <p>
              Please wait while we fetch
              your order details.
            </p>

          </div>

        </main>

      </div>
    );
  }

  /* =====================================================
     ERROR
  ===================================================== */

  if (
    error ||
    !order
  ) {
    return (
      <div className="customer-order-details-page">

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

              <Link to="/orders">
                My Orders
              </Link>

            </nav>

          </div>

        </header>

        <main className="customer-order-details-main">

          <div className="customer-order-error-card">

            <div className="customer-order-error-icon">
              <XCircle size={26} />
            </div>

            <h1>
              Order not found
            </h1>

            <p>
              {error ||
                "We could not find this order."}
            </p>

            <div className="customer-order-error-actions">

              <button
                type="button"
                className="customer-order-secondary-button"
                onClick={() =>
                  navigate(
                    "/orders"
                  )
                }
              >
                <ArrowLeft size={15} />
                Back to My Orders
              </button>

              <button
                type="button"
                className="customer-order-primary-button"
                onClick={loadOrder}
              >
                <RefreshCcw size={15} />
                Try Again
              </button>

            </div>

          </div>

        </main>

      </div>
    );
  }

  return (
    <div className="customer-order-details-page">

      <style>{`

        .customer-order-details-page {
          min-height: 100vh;
          background: #f7f7f5;
          color: #111111;
          font-family: Inter, Arial, Helvetica, sans-serif;
        }

        .customer-order-details-main {
          width: min(1120px, calc(100% - 48px));
          margin: 0 auto;
          padding: 48px 0 80px;
        }

        .customer-order-details-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 30px;
          margin-bottom: 26px;
        }

        .customer-order-back {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          color: #5f5f5a;
          text-decoration: none;
          font-size: 11px;
          font-weight: 600;
          margin-bottom: 21px;
        }

        .customer-order-back:hover {
          color: #111111;
        }

        .customer-order-eyebrow {
          margin: 0 0 8px;
          color: #777773;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 1.8px;
          text-transform: uppercase;
        }

        .customer-order-title {
          margin: 0;
          font-size: 37px;
          line-height: 1.08;
          letter-spacing: -1.5px;
          font-weight: 800;
        }

        .customer-order-date {
          margin: 9px 0 0;
          color: #7d7d78;
          font-size: 11px;
        }

        .customer-order-top-actions {
          display: flex;
          gap: 10px;
        }

        .customer-order-primary-button,
        .customer-order-secondary-button {
          min-height: 40px;
          padding: 0 14px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          border-radius: 3px;
          font-family: inherit;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
          text-decoration: none;
        }

        .customer-order-primary-button {
          background: #111111;
          color: #ffffff;
          border: 1px solid #111111;
        }

        .customer-order-primary-button:hover {
          background: #2a2a2a;
        }

        .customer-order-secondary-button {
          background: #ffffff;
          color: #222222;
          border: 1px solid #ddddda;
        }

        .customer-order-secondary-button:hover {
          border-color: #111111;
        }

        .customer-order-status-banner {
          margin-bottom: 20px;
          padding: 17px 19px;
          background: #ffffff;
          border: 1px solid #e1e1dc;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
        }

        .customer-order-status-main {
          display: flex;
          align-items: center;
          gap: 11px;
        }

        .customer-order-status-main-icon {
          width: 41px;
          height: 41px;
          flex-shrink: 0;
          border-radius: 50%;
          background: #f1f1ee;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .customer-order-status-text strong {
          display: block;
          font-size: 13px;
          margin-bottom: 4px;
        }

        .customer-order-status-text span {
          color: #7c7c77;
          font-size: 10px;
        }

        .customer-order-status-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 7px 10px;
          border-radius: 999px;
          border: 1px solid #ddddda;
          background: #fafaf8;
          font-size: 10px;
          font-weight: 700;
        }

        .customer-order-content {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 325px;
          gap: 20px;
          align-items: start;
        }

        .customer-order-card,
        .customer-order-side-card {
          background: #ffffff;
          border: 1px solid #e1e1dc;
          margin-bottom: 20px;
        }

        .customer-order-card-header {
          padding: 20px 23px;
          border-bottom: 1px solid #ededE8;
        }

        .customer-order-card-heading {
          display: flex;
          align-items: center;
          gap: 9px;
        }

        .customer-order-card-heading h2 {
          margin: 0;
          font-size: 16px;
          letter-spacing: -0.3px;
          font-weight: 800;
        }

        .customer-order-items {
          padding: 0 23px;
        }

        .customer-order-item-row {
          display: grid;
          grid-template-columns: 72px minmax(0, 1fr) auto;
          gap: 15px;
          align-items: center;
          padding: 17px 0;
          border-bottom: 1px solid #eeeeea;
        }

        .customer-order-item-row:last-child {
          border-bottom: 0;
        }

        .customer-order-item-image {
          width: 72px;
          height: 72px;
          background: #f4f4f1;
          border: 1px solid #e5e5e0;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .customer-order-item-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .customer-order-item-info strong {
          display: block;
          font-size: 13px;
          margin-bottom: 5px;
        }

        .customer-order-item-info span {
          display: block;
          margin-top: 3px;
          color: #858580;
          font-size: 9px;
        }

        .customer-order-item-price {
          font-size: 12px;
          font-weight: 800;
        }

        .customer-order-price-breakdown {
          padding: 18px 23px;
          border-top: 1px solid #ededE8;
        }

        .customer-order-price-row {
          display: flex;
          justify-content: space-between;
          gap: 15px;
          padding: 6px 0;
          color: #6f6f6b;
          font-size: 11px;
        }

        .customer-order-price-row strong {
          color: #222222;
          font-size: 11px;
        }

        .customer-order-total-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 13px;
          margin-top: 6px;
          border-top: 1px solid #e8e8e3;
        }

        .customer-order-total-row span {
          font-size: 12px;
          font-weight: 700;
        }

        .customer-order-total-row strong {
          font-size: 21px;
          letter-spacing: -0.5px;
        }

        .customer-order-info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
          padding: 20px 23px;
        }

        .customer-order-info-box {
          padding: 16px;
          border: 1px solid #e6e6e1;
        }

        .customer-order-info-label {
          margin-bottom: 9px;
          color: #858580;
          font-size: 8px;
          font-weight: 700;
          letter-spacing: 1.5px;
          text-transform: uppercase;
        }

        .customer-order-info-value {
          font-size: 12px;
          font-weight: 700;
          line-height: 1.55;
        }

        .customer-order-info-muted {
          margin-top: 5px;
          color: #777772;
          font-size: 10px;
          line-height: 1.55;
        }

        .customer-order-side-card {
          padding: 21px;
        }

        .customer-order-side-card h3 {
          margin: 0 0 17px;
          font-size: 15px;
          font-weight: 800;
        }

        .customer-order-timeline-item {
          position: relative;
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding-bottom: 20px;
        }

        .customer-order-timeline-item:last-child {
          padding-bottom: 0;
        }

        .customer-order-timeline-line {
          position: absolute;
          top: 19px;
          bottom: -2px;
          left: 9px;
          width: 1px;
          background: #deded9;
        }

        .customer-order-timeline-dot {
          width: 19px;
          height: 19px;
          flex-shrink: 0;
          position: relative;
          z-index: 2;
          border-radius: 50%;
          border: 1px solid #ddddda;
          background: #f4f4f1;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #999994;
        }

        .customer-order-timeline-item.active
          .customer-order-timeline-dot {
          background: #111111;
          border-color: #111111;
          color: #ffffff;
        }

        .customer-order-timeline-copy strong {
          display: block;
          font-size: 11px;
          margin-bottom: 4px;
        }

        .customer-order-timeline-copy span {
          color: #858580;
          font-size: 9px;
          line-height: 1.5;
        }

        .customer-order-payment-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 8px 0;
          font-size: 10px;
          color: #74746f;
        }

        .customer-order-payment-row strong {
          color: #222222;
          text-transform: capitalize;
        }

        .customer-order-security {
          display: flex;
          align-items: flex-start;
          gap: 7px;
          margin-top: 13px;
          padding-top: 13px;
          border-top: 1px solid #ededE8;
          color: #7e7e79;
          font-size: 9px;
          line-height: 1.5;
        }

        .customer-order-cancel-button {
          width: 100%;
          min-height: 39px;
          margin-top: 15px;
          padding: 0 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          border-radius: 3px;
          border: 1px solid #ddbcbc;
          background: #ffffff;
          color: #963b3b;
          font-family: inherit;
          font-size: 10px;
          font-weight: 700;
          cursor: pointer;
        }

        .customer-order-cancel-button:hover:not(:disabled) {
          background: #fff7f7;
        }

        .customer-order-cancel-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .customer-order-cancel-note {
          margin-top: 8px;
          color: #858580;
          font-size: 8px;
          line-height: 1.5;
        }

        .customer-order-alert {
          padding: 13px 16px;
          margin-bottom: 20px;
          border: 1px solid #d2e6d7;
          background: #f3fbf5;
          color: #2b6940;
          font-size: 10px;
          line-height: 1.5;
        }

        .customer-order-alert.error {
          border-color: #ebcaca;
          background: #fff7f7;
          color: #963b3b;
        }

        .customer-return-section {
          padding: 20px 23px 22px;
          border-top: 1px solid #ededE8;
        }

        .customer-return-section-title {
          margin: 0 0 6px;
          font-size: 14px;
          font-weight: 800;
        }

        .customer-return-section-description {
          margin: 0;
          max-width: 650px;
          color: #7e7e79;
          font-size: 10px;
          line-height: 1.6;
        }

        .customer-return-form {
          margin-top: 18px;
          display: grid;
          grid-template-columns: minmax(0, 1fr) 180px auto;
          gap: 12px;
          align-items: end;
        }

        .customer-return-field label {
          display: block;
          margin-bottom: 7px;
          color: #5e5e59;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }

        .customer-return-field input {
          width: 100%;
          min-height: 40px;
          padding: 0 10px;
          border: 1px solid #ddddda;
          border-radius: 4px;
          outline: none;
          background: #ffffff;
          color: #111111;
          font-family: inherit;
          font-size: 10px;
          box-sizing: border-box;
        }

        .customer-return-field input:focus {
          border-color: #111111;
        }

        .customer-return-submit {
          min-height: 40px;
          padding: 0 13px;
          border: 1px solid #111111;
          border-radius: 3px;
          background: #111111;
          color: #ffffff;
          font-family: inherit;
          font-size: 10px;
          font-weight: 700;
          cursor: pointer;
          white-space: nowrap;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }

        .customer-return-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .customer-return-summary {
          margin-top: 18px;
          padding-top: 18px;
          border-top: 1px solid #ededE8;
          display: flex;
          flex-wrap: wrap;
          gap: 22px;
        }

        .customer-return-summary div {
          min-width: 120px;
        }

        .customer-return-summary span {
          display: block;
          margin-bottom: 5px;
          color: #858580;
          font-size: 8px;
          font-weight: 700;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        .customer-return-summary strong {
          display: block;
          font-size: 11px;
        }

        .customer-return-note {
          margin-top: 14px;
          padding: 12px 13px;
          background: #f7f7f5;
          color: #767671;
          font-size: 9px;
          line-height: 1.55;
        }

        .customer-order-cancelled-box {
          padding: 14px 16px;
          border: 1px solid #ebcccc;
          background: #fff7f7;
          color: #8d3636;
          font-size: 10px;
          line-height: 1.5;
        }

        .customer-order-loading,
        .customer-order-error-card {
          min-height: 430px;
          background: #ffffff;
          border: 1px solid #e1e1dc;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          text-align: center;
          padding: 30px;
          box-sizing: border-box;
        }

        .customer-order-loading h2,
        .customer-order-error-card h1 {
          margin: 18px 0 7px;
          font-size: 20px;
        }

        .customer-order-loading p,
        .customer-order-error-card p {
          margin: 0;
          max-width: 440px;
          color: #7e7e79;
          font-size: 11px;
          line-height: 1.6;
        }

        .customer-order-spinner {
          width: 34px;
          height: 34px;
          border: 3px solid #e3e3df;
          border-top-color: #111111;
          border-radius: 50%;
          animation: customerOrderSpin 0.8s linear infinite;
        }

        @keyframes customerOrderSpin {
          to {
            transform: rotate(360deg);
          }
        }

        .customer-order-error-icon {
          width: 52px;
          height: 52px;
          border-radius: 50%;
          background: #f1f1ee;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .customer-order-error-actions {
          display: flex;
          gap: 10px;
          margin-top: 22px;
        }

        @media (max-width: 900px) {
          .customer-order-content {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 700px) {
          .customer-order-details-main {
            width: calc(100% - 28px);
            padding-top: 30px;
          }

          .customer-order-details-top {
            flex-direction: column;
          }

          .customer-order-info-grid {
            grid-template-columns: 1fr;
          }

          .customer-return-form {
            grid-template-columns: 1fr;
          }

          .customer-order-item-row {
            grid-template-columns: 60px minmax(0, 1fr);
          }

          .customer-order-item-image {
            width: 60px;
            height: 60px;
          }

          .customer-order-item-price {
            grid-column: 2;
          }
        }

      `}</style>

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

            <Link to="/orders">
              My Orders
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

      {/* =================================================
          MAIN
      ================================================= */}

      <main className="customer-order-details-main">

        {/* TOP */}

        <div className="customer-order-details-top">

          <div>

            <Link
              to="/orders"
              className="customer-order-back"
            >
              <ArrowLeft size={14} />
              Back to My Orders
            </Link>

            <p className="customer-order-eyebrow">
              ORDER DETAILS
            </p>

            <h1 className="customer-order-title">
              {order.order_number}
            </h1>

            <p className="customer-order-date">
              Placed on{" "}
              {formatDateTime(
                order.created_at
              )}
            </p>

          </div>

          <div className="customer-order-top-actions">

            <Link
              to="/shop"
              className="customer-order-secondary-button"
            >
              <ShoppingBag size={14} />
              Continue Shopping
            </Link>

          </div>

        </div>

        {/* CANCEL SUCCESS */}

        {cancelSuccess && (
          <div className="customer-order-alert">

            <strong>
              Order cancelled
            </strong>

            <div>
              {cancelSuccess}
            </div>

          </div>
        )}

        {/* CANCEL ERROR */}

        {cancelError && (
          <div className="customer-order-alert error">

            <strong>
              Cancellation failed
            </strong>

            <div>
              {cancelError}
            </div>

          </div>
        )}

        {/* RETURN SUCCESS */}

        {returnSuccess && (
          <div className="customer-order-alert">

            <strong>
              Return request
            </strong>

            <div>
              {returnSuccess}
            </div>

          </div>
        )}

        {/* RETURN ERROR */}

        {returnError && (
          <div className="customer-order-alert error">

            <strong>
              Return request failed
            </strong>

            <div>
              {returnError}
            </div>

          </div>
        )}

        {/* STATUS BANNER */}

        <section className="customer-order-status-banner">

          <div className="customer-order-status-main">

            <div className="customer-order-status-main-icon">

              {getStatusIcon(
                order.order_status
              )}

            </div>

            <div className="customer-order-status-text">

              <strong>

                {isCancelled
                  ? "Order cancelled"
                  : isDelivered
                  ? "Order delivered"
                  : "Order in progress"}

              </strong>

              <span>

                {isCancelled
                  ? "This order has been cancelled."
                  : isDelivered
                  ? "Your order has been delivered successfully."
                  : "We are preparing your order for delivery."}

              </span>

            </div>

          </div>

          <div className="customer-order-status-badge">

            {getStatusIcon(
              order.order_status
            )}

            {getStatusLabel(
              order.order_status
            )}

          </div>

        </section>

        <div className="customer-order-content">

          {/* =================================================
              LEFT
          ================================================= */}

          <div>

            {/* ORDER ITEMS */}

            <section className="customer-order-card">

              <div className="customer-order-card-header">

                <div className="customer-order-card-heading">

                  <Package size={17} />

                  <h2>
                    Order Items
                  </h2>

                </div>

              </div>

              <div className="customer-order-items">

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
                        className="customer-order-item-row"
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

                            <Package size={20} />

                          )}

                        </div>

                        <div className="customer-order-item-info">

                          <strong>
                            {
                              item.product_name ||
                              "Product"
                            }
                          </strong>

                          <span>
                            SKU:{" "}
                            {item.sku ||
                              "N/A"}
                          </span>

                          <span>
                            Quantity:{" "}
                            {Number(
                              item.quantity ||
                                0
                            )}
                          </span>

                          <span>
                            Unit price:{" "}
                            {formatPrice(
                              item.unit_price
                            )}
                          </span>

                        </div>

                        <strong className="customer-order-item-price">

                          {formatPrice(
                            item.total_price ??
                              Number(
                                item.unit_price ||
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

                  <div
                    style={{
                      padding:
                        "25px 0",
                      color:
                        "#777773",
                      fontSize:
                        "11px",
                    }}
                  >
                    Order item details unavailable.
                  </div>

                )}

              </div>

              <div className="customer-order-price-breakdown">

                <div className="customer-order-price-row">

                  <span>
                    Subtotal
                  </span>

                  <strong>
                    {formatPrice(
                      order.subtotal
                    )}
                  </strong>

                </div>

                {Number(
                  order.discount || 0
                ) > 0 && (

                  <div className="customer-order-price-row">

                    <span>
                      Discount
                    </span>

                    <strong>
                      -{" "}
                      {formatPrice(
                        order.discount
                      )}
                    </strong>

                  </div>

                )}

                <div className="customer-order-price-row">

                  <span>
                    Shipping
                  </span>

                  <strong>
                    {formatPrice(
                      order.shipping_cost
                    )}
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

            </section>

            {/* =================================================
                DELIVERY INFORMATION
            ================================================= */}

            <section className="customer-order-card">

              <div className="customer-order-card-header">

                <div className="customer-order-card-heading">

                  <MapPin size={17} />

                  <h2>
                    Delivery information
                  </h2>

                </div>

              </div>

              <div className="customer-order-info-grid">

                <div className="customer-order-info-box">

                  <div className="customer-order-info-label">
                    Customer
                  </div>

                  <div className="customer-order-info-value">

                    {order.customer_name ||
                      customer?.name ||
                      "Customer"}

                  </div>

                  <div className="customer-order-info-muted">

                    {order.customer_phone ||
                      customer?.phone ||
                      "No phone"}

                    <br />

                    {order.customer_email ||
                      customer?.email ||
                      "No email"}

                  </div>

                </div>

                <div className="customer-order-info-box">

                  <div className="customer-order-info-label">
                    Delivery address
                  </div>

                  <div className="customer-order-info-value">

                    {order.delivery_address ||
                      order.address ||
                      "Address not available"}

                  </div>

                  <div className="customer-order-info-muted">

                    {order.area
                      ? `${order.area}, `
                      : ""}

                    {order.city ||
                      ""}

                    {order.postal_code
                      ? `, ${order.postal_code}`
                      : ""}

                  </div>

                </div>

              </div>

            </section>

            {/* =================================================
                RETURN SECTION
            ================================================= */}

            {order.order_type ===
              "online" && (

              <section className="customer-order-card">

                <div className="customer-order-card-header">

                  <div className="customer-order-card-heading">

                    <RefreshCcw size={17} />

                    <h2>
                      Returns & Refunds
                    </h2>

                  </div>

                </div>

                {returnLoading ? (

                  <div
                    style={{
                      padding:
                        "22px 23px",
                      color:
                        "#777773",
                      fontSize:
                        "10px",
                    }}
                  >
                    Checking return status...
                  </div>

                ) : returnRequest ? (

                  <div className="customer-return-section">

                    <h3 className="customer-return-section-title">
                      Return request
                    </h3>

                    <p className="customer-return-section-description">

                      Your return request has
                      already been submitted to
                      Veylix Return Management.

                    </p>

                    <div className="customer-return-summary">

                      <div>

                        <span>
                          Status
                        </span>

                        <strong>
                          {getReturnStatusLabel(
                            returnRequest.return_status
                          )}
                        </strong>

                      </div>

                      <div>

                        <span>
                          Refund
                        </span>

                        <strong>
                          {formatPrice(
                            returnRequest.refund_amount
                          )}
                        </strong>

                      </div>

                      <div>

                        <span>
                          Refund Status
                        </span>

                        <strong>
                          {returnRequest.refund_status ||
                            "Pending"}
                        </strong>

                      </div>

                    </div>

                    <div className="customer-return-note">

                      <strong>
                        Reason:
                      </strong>{" "}

                      {returnRequest.reason ||
                        "No reason provided."}

                      <br />

                      Return requests must be
                      reviewed and approved before
                      stock restoration and refund
                      processing.

                    </div>

                    <Link
                      to="/orders"
                      className="customer-order-secondary-button"
                      style={{
                        marginTop:
                          "15px",
                      }}
                    >
                      <ArrowLeft size={13} />
                      Back to My Orders
                    </Link>

                  </div>

                ) : isDelivered ? (

                  <div className="customer-return-section">

                    <h3 className="customer-return-section-title">
                      Return this order
                    </h3>

                    <p className="customer-return-section-description">

                      Delivered online orders can
                      be submitted for return. Your
                      request will be reviewed by
                      Veylix before refund and stock
                      processing.

                    </p>

                    <form
                      className="customer-return-form"
                      onSubmit={
                        handleCreateReturn
                      }
                    >

                      <div className="customer-return-field">

                        <label>
                          Return reason
                        </label>

                        <input
                          type="text"
                          value={
                            returnReason
                          }
                          onChange={(event) =>
                            setReturnReason(
                              event.target
                                .value
                            )
                          }
                          placeholder="Example: Product arrived damaged"
                          disabled={
                            returnActionLoading
                          }
                        />

                      </div>

                      <div className="customer-return-field">

                        <label>
                          Refund amount
                        </label>

                        <input
                          type="number"
                          min="0.01"
                          max={Number(
                            order.total_amount ||
                              0
                          )}
                          step="0.01"
                          value={
                            returnRefundAmount
                          }
                          onChange={(event) =>
                            setReturnRefundAmount(
                              event.target
                                .value
                            )
                          }
                          disabled={
                            returnActionLoading
                          }
                        />

                      </div>

                      <button
                        type="submit"
                        className="customer-return-submit"
                        disabled={
                          returnActionLoading
                        }
                      >

                        <RefreshCcw
                          size={14}
                        />

                        {returnActionLoading
                          ? "Submitting..."
                          : "Request Return"}

                      </button>

                    </form>

                    <div className="customer-return-note">

                      Return approval is handled by
                      Veylix Return Management.
                      Stock is not restored until the
                      return workflow is approved and
                      processed.

                    </div>

                  </div>

                ) : (

                  <div className="customer-return-section">

                    <p className="customer-order-info-muted">
                      This order must be delivered
                      before a return request can be
                      created.
                    </p>

                  </div>

                )}

              </section>

            )}

            {/* CANCELLED NOTICE */}

            {isCancelled && (

              <div className="customer-order-cancelled-box">

                <strong>
                  This order has been cancelled.
                </strong>

                <div>
                  Reserved stock has been restored.
                </div>

              </div>

            )}

          </div>

          {/* =================================================
              RIGHT
          ================================================= */}

          <aside>

            {/* ORDER STATUS */}

            <section className="customer-order-side-card">

              <h3>
                Order status
              </h3>

              {isCancelled ? (

                <div>

                  <div className="customer-order-timeline-item active">

                    <div className="customer-order-timeline-dot">

                      <XCircle size={11} />

                    </div>

                    <div className="customer-order-timeline-copy">

                      <strong>
                        Cancelled
                      </strong>

                      <span>
                        This order was cancelled.
                      </span>

                    </div>

                  </div>

                </div>

              ) : (

                <div>

                  {statusSteps.map(
                    (
                      step,
                      index
                    ) => {

                      const active =
                        index <=
                        currentStep;

                      return (

                        <div
                          key={step}
                          className={`customer-order-timeline-item ${
                            active
                              ? "active"
                              : ""
                          }`}
                        >

                          <div className="customer-order-timeline-dot">

                            {active ? (
                              <CheckCircle2
                                size={11}
                              />
                            ) : (
                              <Clock3
                                size={11}
                              />
                            )}

                          </div>

                          {index <
                            statusSteps.length -
                              1 && (
                            <div className="customer-order-timeline-line" />
                          )}

                          <div className="customer-order-timeline-copy">

                            <strong>
                              {getStatusLabel(
                                step
                              )}
                            </strong>

                            <span>

                              {step ===
                                "pending" &&
                                "Order has been received."}

                              {step ===
                                "confirmed" &&
                                "Order has been confirmed."}

                              {step ===
                                "processing" &&
                                "Your items are being prepared."}

                              {step ===
                                "shipped" &&
                                "Your order is on the way."}

                              {step ===
                                "delivered" &&
                                "Your order has been delivered."}

                            </span>

                          </div>

                        </div>

                      );
                    }
                  )}

                </div>

              )}

            </section>

            {/* PAYMENT */}

            <section className="customer-order-side-card">

              <h3>
                Payment
              </h3>

              <div className="customer-order-payment-row">

                <span>
                  Method
                </span>

                <strong>
                  {order.payment_method ||
                    "N/A"}
                </strong>

              </div>

              <div className="customer-order-payment-row">

                <span>
                  Status
                </span>

                <strong>
                  {order.payment_status ||
                    "pending"}
                </strong>

              </div>

              <div className="customer-order-payment-row">

                <span>
                  Order type
                </span>

                <strong>
                  {order.order_type ||
                    "online"}
                </strong>

              </div>

              {/* CANCEL */}

              {canCancel && (

                <>
                  <button
                    type="button"
                    className="customer-order-cancel-button"
                    onClick={
                      handleCancelOrder
                    }
                    disabled={
                      isCancelling
                    }
                  >

                    <XCircle size={14} />

                    {isCancelling
                      ? "Cancelling..."
                      : "Cancel Order"}

                  </button>

                  <div className="customer-order-cancel-note">

                    Cancellation is available
                    before the order is shipped.

                  </div>

                </>

              )}

              {/* SECURITY */}

              <div className="customer-order-security">

                <LockKeyhole
                  size={13}
                />

                <span>
                  This order is private and can
                  only be viewed from your Veylix
                  account.
                </span>

              </div>

            </section>

          </aside>

        </div>

      </main>

    </div>
  );
}

export default CustomerOrderDetails;