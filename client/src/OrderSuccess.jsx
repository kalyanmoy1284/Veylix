import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Check,
  Home,
  PackageCheck,
  Printer,
  ShoppingBag,
  ShieldCheck,
  Truck,
} from "lucide-react";

import {
  Link,
  useNavigate,
  useSearchParams,
} from "react-router-dom";

function OrderSuccess() {
  const navigate = useNavigate();

  const [
    searchParams,
  ] = useSearchParams();

  const orderNumber =
    searchParams.get("order") ||
    "VXL-PENDING";

  const [
    order,
    setOrder,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  /*
  =========================================================
  FORMAT DATE
  =========================================================
  */

  const formatDate = (
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
      "en-BD",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  /*
  =========================================================
  LOAD LAST ORDER
  =========================================================
  */

  useEffect(() => {
    try {
      const savedOrder =
        localStorage.getItem(
          "veylix_last_order"
        );

      if (savedOrder) {
        const parsedOrder =
          JSON.parse(
            savedOrder
          );

        /*
        Make sure the success
        page belongs to the
        latest created order.
        */

        if (
          String(
            parsedOrder.orderId
          ) ===
          String(orderNumber)
        ) {
          setOrder(
            parsedOrder
          );
        }
      }
    } catch (error) {
      console.error(
        "Order success data error:",
        error
      );
    } finally {
      setLoading(false);
    }
  }, [orderNumber]);

  /*
  =========================================================
  PRINT
  =========================================================
  */

  const handlePrint = () => {
    window.print();
  };

  /*
  =========================================================
  CALCULATED DATA
  =========================================================
  */

  const customer =
    order?.customer || {};

  const items =
    Array.isArray(
      order?.items
    )
      ? order.items
      : [];

  const subtotal = Number(
    order?.subtotal || 0
  );

  const shipping = Number(
    order?.shipping || 0
  );

  const discount = Number(
    order?.discount || 0
  );

  const total = Number(
    order?.total || 0
  );

  const paymentMethod =
    order?.paymentMethod ||
    "cod";

  const paymentStatus =
    order?.paymentStatus ||
    "pending";

  const paymentAccountNumber =
    order?.paymentAccountNumber ||
    "";

  const customerTransactionId =
    order?.transactionId ||
    "";

  const paymentLabel = useMemo(
    () => {
      const labels = {
        cod: "Cash on Delivery",
        cash: "Cash",
        bkash: "bKash",
        nagad: "Nagad",
        rocket: "Rocket",
        card: "Credit / Debit Card",
      };

      return (
        labels[
          paymentMethod
        ] ||
        paymentMethod
      );
    },
    [paymentMethod]
  );

  /*
  =========================================================
  STATUS
  =========================================================
  */

  const isPaid =
    paymentStatus ===
    "paid";

  /*
  =========================================================
  LOADING
  =========================================================
  */

  if (loading) {
    return (
      <div
        className="store-page"
        style={{
          minHeight:
            "100vh",
          background:
            "#f7f7f5",
        }}
      >
        <header className="navbar">
          <div className="container navbar-content">
            <Link to="/">
              <img
                src="/assets/logo.svg"
                alt="Veylix"
                style={{
                  height:
                    "38px",
                  width:
                    "auto",
                  display:
                    "block",
                }}
              />
            </Link>
          </div>
        </header>

        <main
          style={{
            minHeight:
              "70vh",
            display:
              "flex",
            alignItems:
              "center",
            justifyContent:
              "center",
          }}
        >
          <p>
            Loading your
            order...
          </p>
        </main>
      </div>
    );
  }

  /*
  =========================================================
  NO ORDER DATA
  =========================================================
  */

  if (!order) {
    return (
      <div
        className="store-page"
        style={{
          minHeight:
            "100vh",
          background:
            "#f7f7f5",
        }}
      >
        <header className="navbar">
          <div className="container navbar-content">
            <Link
              to="/"
              className="logo"
            >
              <img
                src="/assets/logo.svg"
                alt="Veylix"
                style={{
                  height:
                    "38px",
                  width:
                    "auto",
                  display:
                    "block",
                }}
              />
            </Link>
          </div>
        </header>

        <main
          style={{
            minHeight:
              "70vh",
            display:
              "flex",
            alignItems:
              "center",
            justifyContent:
              "center",
            padding:
              "40px 20px",
          }}
        >
          <div
            style={{
              width:
                "100%",
              maxWidth:
                "560px",
              background:
                "#fff",
              border:
                "1px solid #e6e6e6",
              padding:
                "50px 40px",
              textAlign:
                "center",
            }}
          >
            <ShoppingBag
              size={42}
              style={{
                marginBottom:
                  "18px",
              }}
            />

            <p className="section-label">
              VEYLIX ORDER
            </p>

            <h1>
              Order information
              unavailable
            </h1>

            <p
              style={{
                color:
                  "#777",
                lineHeight:
                  1.7,
              }}
            >
              The order confirmation
              information could not
              be loaded.
            </p>

            <div
              style={{
                display:
                  "flex",
                justifyContent:
                  "center",
                gap:
                  "10px",
                marginTop:
                  "24px",
              }}
            >
              <Link
                to="/shop"
                className="primary-button"
              >
                Continue Shopping
              </Link>

              <Link
                to="/"
                className="success-home-button"
              >
                <Home
                  size={16}
                />

                Home
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="store-page">
      {/* =====================================================
          PRINT STYLES
      ===================================================== */}

      <style>
        {`
          @media print {
            body {
              background: #ffffff !important;
            }

            .no-print {
              display: none !important;
            }

            .print-invoice {
              box-shadow: none !important;
              border: none !important;
              margin: 0 !important;
              max-width: none !important;
            }

            .store-page {
              background: #ffffff !important;
            }
          }
        `}
      </style>

      {/* =====================================================
          NAVBAR
      ===================================================== */}

      <header className="navbar no-print">
        <div className="container navbar-content">
          <Link
            to="/"
            className="logo"
          >
            <img
              src="/assets/logo.svg"
              alt="Veylix"
              style={{
                height:
                  "38px",
                width:
                  "auto",
                display:
                  "block",
              }}
            />
          </Link>

          <div
            style={{
              fontSize:
                "13px",
              fontWeight:
                700,
              letterSpacing:
                "0.06em",
            }}
          >
            ORDER CONFIRMATION
          </div>

          <Link
            to="/shop"
            className="nav-icon"
            aria-label="Continue Shopping"
          >
            <ShoppingBag
              size={19}
            />
          </Link>
        </div>
      </header>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <main
        style={{
          background:
            "#f7f7f5",
          padding:
            "55px 20px 90px",
        }}
      >
        <div
          className="container"
          style={{
            maxWidth:
              "1120px",
          }}
        >
          {/* SUCCESS MESSAGE */}

          <div
            className="no-print"
            style={{
              textAlign:
                "center",
              marginBottom:
                "42px",
            }}
          >
            <div
              className="success-icon"
              style={{
                margin:
                  "0 auto 18px",
                width:
                  "64px",
                height:
                  "64px",
              }}
            >
              <Check
                size={34}
              />
            </div>

            <p className="section-label">
              ORDER CONFIRMED
            </p>

            <h1>
              Thank you for
              your order.
            </h1>

            <p
              style={{
                maxWidth:
                  "650px",
                margin:
                  "12px auto 0",
                color:
                  "#777",
                lineHeight:
                  1.7,
              }}
            >
              Your order has
              been successfully
              placed. We will
              prepare your items
              for delivery.
            </p>

            <div
              style={{
                display:
                  "flex",
                justifyContent:
                  "center",
                gap:
                  "10px",
                marginTop:
                  "24px",
                flexWrap:
                  "wrap",
              }}
            >
              <button
                type="button"
                onClick={
                  handlePrint
                }
                className="primary-button"
              >
                <Printer
                  size={16}
                />

                Print Invoice
              </button>

              <Link
                to={`/orders/${order.databaseOrderId}`}
                className="success-home-button"
              >
                <PackageCheck
                  size={16}
                />

                View Order
              </Link>
            </div>
          </div>

          {/* =================================================
              INVOICE
          ================================================= */}

          <section
            className="print-invoice"
            style={{
              position:
                "relative",
              overflow:
                "hidden",
              background:
                "#ffffff",
              border:
                "1px solid #dededb",
              maxWidth:
                "1050px",
              margin:
                "0 auto",
              padding:
                "52px",
              boxShadow:
                "0 12px 45px rgba(0,0,0,0.06)",
            }}
          >
            {/* WATERMARK */}

            <img
              src="/assets/watermark.svg"
              alt=""
              aria-hidden="true"
              style={{
                position:
                  "absolute",
                right:
                  "-50px",
                bottom:
                  "80px",
                width:
                  "420px",
                height:
                  "420px",
                objectFit:
                  "contain",
                opacity:
                  0.045,
                pointerEvents:
                  "none",
              }}
            />

            {/* INVOICE HEADER */}

            <div
              style={{
                position:
                  "relative",
                zIndex:
                  1,
                display:
                  "flex",
                justifyContent:
                  "space-between",
                alignItems:
                  "flex-start",
                gap:
                  "30px",
                borderBottom:
                  "1px solid #e8e8e8",
                paddingBottom:
                  "28px",
              }}
            >
              <div>
                <img
                  src="/assets/logo.svg"
                  alt="Veylix"
                  style={{
                    width:
                      "180px",
                    height:
                      "auto",
                    display:
                      "block",
                  }}
                />

                <p
                  style={{
                    margin:
                      "10px 0 0",
                    fontSize:
                      "13px",
                    color:
                      "#777",
                    letterSpacing:
                      "0.12em",
                    textTransform:
                      "uppercase",
                  }}
                >
                  Style for Every
                  You
                </p>
              </div>

              <div
                style={{
                  textAlign:
                    "right",
                }}
              >
                <p
                  style={{
                    margin:
                      0,
                    fontSize:
                      "11px",
                    color:
                      "#777",
                    letterSpacing:
                      "0.14em",
                    textTransform:
                      "uppercase",
                  }}
                >
                  Sales Invoice
                </p>

                <h2
                  style={{
                    margin:
                      "8px 0 8px",
                    fontSize:
                      "22px",
                  }}
                >
                  #
                  {
                    order.orderId
                  }
                </h2>

                <p
                  style={{
                    margin:
                      0,
                    fontSize:
                      "13px",
                    color:
                      "#666",
                  }}
                >
                  {formatDate(
                    order.createdAt
                  )}
                </p>
              </div>
            </div>

            {/* CUSTOMER + PAYMENT */}

            <div
              style={{
                position:
                  "relative",
                zIndex:
                  1,
                display:
                  "grid",
                gridTemplateColumns:
                  "1fr 1fr",
                gap:
                  "22px",
                marginTop:
                  "28px",
              }}
            >
              {/* CUSTOMER */}

              <div
                style={{
                  border:
                    "1px solid #eeeeee",
                  padding:
                    "22px",
                }}
              >
                <p
                  style={{
                    margin:
                      "0 0 12px",
                    fontSize:
                      "10px",
                    fontWeight:
                      700,
                    letterSpacing:
                      "0.14em",
                    color:
                      "#777",
                    textTransform:
                      "uppercase",
                  }}
                >
                  Billed To
                </p>

                <strong
                  style={{
                    display:
                      "block",
                    fontSize:
                      "16px",
                    marginBottom:
                      "7px",
                  }}
                >
                  {customer.fullName ||
                    "Customer"}
                </strong>

                <span
                  style={{
                    display:
                      "block",
                    color:
                      "#666",
                    fontSize:
                      "13px",
                    marginBottom:
                      "4px",
                  }}
                >
                  {customer.phone ||
                    "No phone"}
                </span>

                {customer.email && (
                  <span
                    style={{
                      display:
                        "block",
                      color:
                        "#666",
                      fontSize:
                        "13px",
                      marginBottom:
                        "4px",
                    }}
                  >
                    {
                      customer.email
                    }
                  </span>
                )}

                {customer.address && (
                  <span
                    style={{
                      display:
                        "block",
                      color:
                        "#666",
                      fontSize:
                        "13px",
                      lineHeight:
                        1.6,
                    }}
                  >
                    {
                      customer.address
                    }

                    {customer.area
                      ? `, ${customer.area}`
                      : ""}

                    {customer.city
                      ? `, ${customer.city}`
                      : ""}

                    {customer.postalCode
                      ? `, ${customer.postalCode}`
                      : ""}
                  </span>
                )}
              </div>

              {/* PAYMENT */}

              <div
                style={{
                  border:
                    "1px solid #eeeeee",
                  padding:
                    "22px",
                }}
              >
                <p
                  style={{
                    margin:
                      "0 0 14px",
                    fontSize:
                      "10px",
                    fontWeight:
                      700,
                    letterSpacing:
                      "0.14em",
                    color:
                      "#777",
                    textTransform:
                      "uppercase",
                  }}
                >
                  Payment
                </p>

                <div
                  style={{
                    display:
                      "grid",
                    gap:
                      "10px",
                  }}
                >
                  <div
                    style={{
                      display:
                        "flex",
                      justifyContent:
                        "space-between",
                      gap:
                        "20px",
                    }}
                  >
                    <span>
                      Method
                    </span>

                    <strong>
                      {
                        paymentLabel
                      }
                    </strong>
                  </div>

                  <div
                    style={{
                      display:
                        "flex",
                      justifyContent:
                        "space-between",
                      gap:
                        "20px",
                    }}
                  >
                    <span>
                      Status
                    </span>

                    <strong
                      style={{
                        color:
                          isPaid
                            ? "#23834b"
                            : "#9a7417",
                      }}
                    >
                      {isPaid
                        ? "Paid"
                        : "Pending"}
                    </strong>
                  </div>

                  {paymentAccountNumber && (
                    <div
                      style={{
                        display:
                          "flex",
                        justifyContent:
                          "space-between",
                        gap:
                          "20px",
                      }}
                    >
                      <span>
                        Payment Number
                      </span>

                      <strong>
                        {
                          paymentAccountNumber
                        }
                      </strong>
                    </div>
                  )}

                  {customerTransactionId && (
                    <div
                      style={{
                        display:
                          "flex",
                        justifyContent:
                          "space-between",
                        gap:
                          "20px",
                      }}
                    >
                      <span>
                        Transaction ID
                      </span>

                      <strong
                        style={{
                          textAlign:
                            "right",
                          maxWidth:
                            "230px",
                          wordBreak:
                            "break-word",
                        }}
                      >
                        {
                          customerTransactionId
                        }
                      </strong>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ORDER ITEMS */}

            <div
              style={{
                position:
                  "relative",
                zIndex:
                  1,
                marginTop:
                  "32px",
              }}
            >
              <div
                style={{
                  display:
                    "flex",
                  justifyContent:
                    "space-between",
                  alignItems:
                    "center",
                  marginBottom:
                    "14px",
                }}
              >
                <h3
                  style={{
                    margin: 0,
                    fontSize:
                      "18px",
                  }}
                >
                  Order Items
                </h3>

                <span
                  style={{
                    fontSize:
                      "12px",
                    color:
                      "#777",
                  }}
                >
                  {
                    items.length
                  }{" "}
                  product
                  {items.length ===
                  1
                    ? ""
                    : "s"}
                </span>
              </div>

              <div
                style={{
                  overflowX:
                    "auto",
                }}
              >
                <table
                  style={{
                    width:
                      "100%",
                    borderCollapse:
                      "collapse",
                    fontSize:
                      "13px",
                  }}
                >
                  <thead>
                    <tr>
                      <th
                        style={{
                          textAlign:
                            "left",
                          padding:
                            "13px 10px",
                          borderTop:
                            "1px solid #ddd",
                          borderBottom:
                            "1px solid #ddd",
                        }}
                      >
                        Product
                      </th>

                      <th
                        style={{
                          textAlign:
                            "left",
                          padding:
                            "13px 10px",
                          borderTop:
                            "1px solid #ddd",
                          borderBottom:
                            "1px solid #ddd",
                        }}
                      >
                        SKU
                      </th>

                      <th
                        style={{
                          textAlign:
                            "center",
                          padding:
                            "13px 10px",
                          borderTop:
                            "1px solid #ddd",
                          borderBottom:
                            "1px solid #ddd",
                        }}
                      >
                        Qty
                      </th>

                      <th
                        style={{
                          textAlign:
                            "right",
                          padding:
                            "13px 10px",
                          borderTop:
                            "1px solid #ddd",
                          borderBottom:
                            "1px solid #ddd",
                        }}
                      >
                        Unit Price
                      </th>

                      <th
                        style={{
                          textAlign:
                            "right",
                          padding:
                            "13px 10px",
                          borderTop:
                            "1px solid #ddd",
                          borderBottom:
                            "1px solid #ddd",
                        }}
                      >
                        Total
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {items.map(
                      (
                        item,
                        index
                      ) => {
                        const quantity =
                          Number(
                            item.quantity ||
                              0
                          );

                        const unitPrice =
                          Number(
                            item.price ||
                              item.unitPrice ||
                              0
                          );

                        const itemTotal =
                          unitPrice *
                          quantity;

                        return (
                          <tr
                            key={
                              item.id ||
                              item.productId ||
                              index
                            }
                          >
                            <td
                              style={{
                                padding:
                                  "15px 10px",
                                borderBottom:
                                  "1px solid #eeeeee",
                              }}
                            >
                              <div
                                style={{
                                  display:
                                    "flex",
                                  alignItems:
                                    "center",
                                  gap:
                                    "12px",
                                }}
                              >
                                <div
                                  style={{
                                    width:
                                      "48px",
                                    height:
                                      "60px",
                                    overflow:
                                      "hidden",
                                    background:
                                      "#f5f5f5",
                                    flexShrink:
                                      0,
                                  }}
                                >
                                  {item.image ? (
                                    <img
                                      src={
                                        item.image
                                      }
                                      alt={
                                        item.name ||
                                        item.productName ||
                                        "Product"
                                      }
                                      style={{
                                        width:
                                          "100%",
                                        height:
                                          "100%",
                                        objectFit:
                                          "cover",
                                      }}
                                    />
                                  ) : (
                                    <div
                                      style={{
                                        width:
                                          "100%",
                                        height:
                                          "100%",
                                        display:
                                          "flex",
                                        alignItems:
                                          "center",
                                        justifyContent:
                                          "center",
                                      }}
                                    >
                                      <ShoppingBag
                                        size={
                                          18
                                        }
                                      />
                                    </div>
                                  )}
                                </div>

                                <strong>
                                  {item.name ||
                                    item.productName ||
                                    "Product"}
                                </strong>
                              </div>
                            </td>

                            <td
                              style={{
                                padding:
                                  "15px 10px",
                                borderBottom:
                                  "1px solid #eeeeee",
                                color:
                                  "#666",
                              }}
                            >
                              {item.sku ||
                                "N/A"}
                            </td>

                            <td
                              style={{
                                padding:
                                  "15px 10px",
                                borderBottom:
                                  "1px solid #eeeeee",
                                textAlign:
                                  "center",
                              }}
                            >
                              {
                                quantity
                              }
                            </td>

                            <td
                              style={{
                                padding:
                                  "15px 10px",
                                borderBottom:
                                  "1px solid #eeeeee",
                                textAlign:
                                  "right",
                              }}
                            >
                              ৳{" "}
                              {unitPrice.toLocaleString(
                                "en-BD"
                              )}
                            </td>

                            <td
                              style={{
                                padding:
                                  "15px 10px",
                                borderBottom:
                                  "1px solid #eeeeee",
                                textAlign:
                                  "right",
                                fontWeight:
                                  700,
                              }}
                            >
                              ৳{" "}
                              {itemTotal.toLocaleString(
                                "en-BD"
                              )}
                            </td>
                          </tr>
                        );
                      }
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* TOTALS */}

            <div
              style={{
                position:
                  "relative",
                zIndex:
                  1,
                display:
                  "flex",
                justifyContent:
                  "flex-end",
                marginTop:
                  "26px",
              }}
            >
              <div
                style={{
                  width:
                    "330px",
                }}
              >
                <div
                  style={{
                    display:
                      "flex",
                    justifyContent:
                      "space-between",
                    padding:
                      "8px 0",
                    fontSize:
                      "13px",
                  }}
                >
                  <span>
                    Subtotal
                  </span>

                  <strong>
                    ৳{" "}
                    {subtotal.toLocaleString(
                      "en-BD"
                    )}
                  </strong>
                </div>

                {discount > 0 && (
                  <div
                    style={{
                      display:
                        "flex",
                      justifyContent:
                        "space-between",
                      padding:
                        "8px 0",
                      fontSize:
                        "13px",
                    }}
                  >
                    <span>
                      Discount
                    </span>

                    <strong>
                      − ৳{" "}
                      {discount.toLocaleString(
                        "en-BD"
                      )}
                    </strong>
                  </div>
                )}

                <div
                  style={{
                    display:
                      "flex",
                    justifyContent:
                      "space-between",
                    padding:
                      "8px 0",
                    fontSize:
                      "13px",
                  }}
                >
                  <span>
                    Shipping
                  </span>

                  <strong>
                    ৳{" "}
                    {shipping.toLocaleString(
                      "en-BD"
                    )}
                  </strong>
                </div>

                <div
                  style={{
                    borderTop:
                      "2px solid #111",
                    display:
                      "flex",
                    justifyContent:
                      "space-between",
                    padding:
                      "17px 0 5px",
                    marginTop:
                      "7px",
                  }}
                >
                  <strong
                    style={{
                      fontSize:
                        "17px",
                    }}
                  >
                    Total
                  </strong>

                  <strong
                    style={{
                      fontSize:
                        "21px",
                    }}
                  >
                    ৳{" "}
                    {total.toLocaleString(
                      "en-BD"
                    )}
                  </strong>
                </div>
              </div>
            </div>

            {/* FOOTER NOTE */}

            <div
              style={{
                position:
                  "relative",
                zIndex:
                  1,
                marginTop:
                  "45px",
                paddingTop:
                  "24px",
                borderTop:
                  "1px solid #e8e8e8",
                display:
                  "flex",
                justifyContent:
                  "space-between",
                gap:
                  "25px",
                alignItems:
                  "flex-end",
              }}
            >
              <div>
                <p
                  style={{
                    margin:
                      0,
                    fontSize:
                      "20px",
                    fontFamily:
                      "Georgia, serif",
                  }}
                >
                  Thank you
                </p>

                <p
                  style={{
                    margin:
                      "4px 0 0",
                    fontSize:
                      "13px",
                    color:
                      "#777",
                  }}
                >
                  for choosing
                  Veylix.
                </p>
              </div>

              <div
                style={{
                  textAlign:
                    "right",
                  fontSize:
                    "12px",
                  color:
                    "#777",
                  lineHeight:
                    1.7,
                }}
              >
                <strong
                  style={{
                    display:
                      "block",
                    color:
                      "#111",
                  }}
                >
                  Veylix
                </strong>

                <span>
                  STYLE FOR EVERY
                  YOU
                </span>
              </div>
            </div>
          </section>

          {/* =================================================
              BOTTOM ACTIONS
          ================================================= */}

          <div
            className="no-print"
            style={{
              display:
                "flex",
              justifyContent:
                "center",
              gap:
                "10px",
              flexWrap:
                "wrap",
              marginTop:
                "28px",
            }}
          >
            <Link
              to="/shop"
              className="primary-button"
            >
              Continue Shopping
            </Link>

            <Link
              to="/"
              className="success-home-button"
            >
              <Home
                size={16}
              />

              Back Home
            </Link>
          </div>

          {/* =================================================
              TRUST
          ================================================= */}

          <div
            className="no-print"
            style={{
              display:
                "flex",
              justifyContent:
                "center",
              gap:
                "25px",
              flexWrap:
                "wrap",
              marginTop:
                "28px",
              color:
                "#777",
              fontSize:
                "12px",
            }}
          >
            <div
              style={{
                display:
                  "flex",
                alignItems:
                  "center",
                gap:
                  "7px",
              }}
            >
              <ShieldCheck
                size={15}
              />

              Secure checkout
            </div>

            <div
              style={{
                display:
                  "flex",
                alignItems:
                  "center",
                gap:
                  "7px",
              }}
            >
              <Truck
                size={15}
              />

              Delivery to your
              address
            </div>

            <div
              style={{
                display:
                  "flex",
                alignItems:
                  "center",
                gap:
                  "7px",
              }}
            >
              <PackageCheck
                size={15}
              />

              Order tracking
            </div>
          </div>
        </div>
      </main>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="footer no-print">
        <div className="container footer-content">
          <div>
            <img
              src="/assets/logo.svg"
              alt="Veylix"
              style={{
                width:
                  "145px",
                height:
                  "auto",
                display:
                  "block",
                marginBottom:
                  "12px",
              }}
            />

            <p>
              Style for every
              you.
            </p>
          </div>

          <p className="copyright">
            © 2026 Veylix. All
            rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default OrderSuccess;