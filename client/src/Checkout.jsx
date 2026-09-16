import React, {
  useEffect,
  useState,
} from "react";

import {
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  MapPin,
  ShoppingBag,
  Smartphone,
  Truck,
  ShieldCheck,
  Copy,
} from "lucide-react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import { useCart } from "./context/CartContext";

/*
=========================================================
VEYLIX PAYMENT CONFIGURATION
=========================================================
*/

const BKASH_MERCHANT_NUMBER =
  "01XXXXXXXXX";

const NAGAD_MERCHANT_NUMBER =
  "01XXXXXXXXX";

const ROCKET_MERCHANT_NUMBER =
  "01XXXXXXXXX";

function Checkout() {
  const navigate = useNavigate();

  const {
    cartItems,
    cartCount,
    cartSubtotal,
    shipping,
    cartTotal,
    clearCart,
  } = useCart();

  const [
    formData,
    setFormData,
  ] = useState({
    fullName: "",
    phone: "",
    email: "",
    address: "",
    city: "Dhaka",
    area: "",
    postalCode: "",
  });

  const [
    paymentMethod,
    setPaymentMethod,
  ] = useState("cod");

  const [
    paymentAccountNumber,
    setPaymentAccountNumber,
  ] = useState("");

  const [
    transactionId,
    setTransactionId,
  ] = useState("");

  const [
    cardType,
    setCardType,
  ] = useState("visa");

  const [
    cardNumber,
    setCardNumber,
  ] = useState("");

  const [
    cardholderName,
    setCardholderName,
  ] = useState("");

  const [
    cardExpiry,
    setCardExpiry,
  ] = useState("");

  const [
    cardCvv,
    setCardCvv,
  ] = useState("");

  const [
    saveCardInfo,
    setSaveCardInfo,
  ] = useState(true);

  const [
    errors,
    setErrors,
  ] = useState({});

  const [
    paymentErrors,
    setPaymentErrors,
  ] = useState({});

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false);

  const [
    submitError,
    setSubmitError,
  ] = useState("");

  const [
    showPaymentModal,
    setShowPaymentModal,
  ] = useState(false);

  const [
    isPaymentProcessing,
    setIsPaymentProcessing,
  ] = useState(false);

  /*
  =========================================================
  CUSTOMER AUTH + PREFILL
  =========================================================
  */

  useEffect(() => {
    const token =
      localStorage.getItem(
        "veylix_customer_token"
      );

    const savedCustomer =
      localStorage.getItem(
        "veylix_customer"
      );

    if (!token || !savedCustomer) {
      navigate(
        "/customer/login",
        {
          replace: true,
          state: {
            from: "/checkout",
          },
        }
      );

      return;
    }

    try {
      const customer =
        JSON.parse(savedCustomer);

      setFormData((current) => ({
        ...current,

        fullName:
          customer?.name ||
          current.fullName,

        phone:
          customer?.phone ||
          current.phone,

        email:
          customer?.email ||
          current.email,
      }));
    } catch (error) {
      console.error(
        "Customer data parse error:",
        error
      );

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
    }
  }, [navigate]);

  /*
  =========================================================
  INPUT CHANGE
  =========================================================
  */

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    setErrors((current) => ({
      ...current,
      [name]: "",
    }));

    setSubmitError("");
  };

  /*
  =========================================================
  PAYMENT METHOD CHANGE
  =========================================================
  */

  const handlePaymentMethodChange =
    (event) => {
      const method =
        event.target.value;

      setPaymentMethod(method);

      setPaymentAccountNumber("");

      setTransactionId("");

      setCardNumber("");
      setCardholderName("");
      setCardExpiry("");
      setCardCvv("");
      setCardType("visa");
      setSaveCardInfo(true);

      setPaymentErrors({});

      setSubmitError("");
    };

  /*
  =========================================================
  PHONE VALIDATION
  =========================================================
  */

  const isValidPhone = (value) => {
    const clean =
      String(value || "").replace(
        /\s+/g,
        ""
      );

    return /^01\d{9}$/.test(
      clean
    );
  };

  /*
  =========================================================
  FORM VALIDATION
  =========================================================
  */

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName =
        "Please enter your full name.";
    }

    const cleanPhone =
      formData.phone.replace(
        /\s+/g,
        ""
      );

    if (!cleanPhone) {
      newErrors.phone =
        "Please enter your phone number.";
    } else if (
      !isValidPhone(cleanPhone)
    ) {
      newErrors.phone =
        "Enter a valid Bangladeshi phone number.";
    }

    if (
      formData.email.trim() &&
      !/^\S+@\S+\.\S+$/.test(
        formData.email
      )
    ) {
      newErrors.email =
        "Enter a valid email address.";
    }

    if (!formData.address.trim()) {
      newErrors.address =
        "Please enter your delivery address.";
    }

    if (!formData.area.trim()) {
      newErrors.area =
        "Please enter your area.";
    }

    setErrors(newErrors);

    return (
      Object.keys(
        newErrors
      ).length === 0
    );
  };

  /*
  =========================================================
  PAYMENT VALIDATION
  =========================================================
  */

  const validatePayment = () => {
    const newErrors = {};

    if (
      paymentMethod === "bkash" ||
      paymentMethod === "nagad" ||
      paymentMethod === "rocket"
    ) {
      if (
        !paymentAccountNumber.trim()
      ) {
        newErrors.accountNumber =
          `Please enter your ${paymentMethod} number.`;
      } else if (
        !isValidPhone(
          paymentAccountNumber
        )
      ) {
        newErrors.accountNumber =
          "Enter a valid Bangladeshi mobile number.";
      }

      if (!transactionId.trim()) {
        newErrors.transactionId =
          "Please enter your transaction ID.";
      }
    }

    if (paymentMethod === "card") {
      const cleanCardNumber =
        cardNumber.replace(/\s+/g, "");

      if (!/^\d{16}$/.test(cleanCardNumber)) {
        newErrors.cardNumber =
          "Enter a valid 16-digit card number.";
      }

      if (!cardholderName.trim()) {
        newErrors.cardholderName =
          "Please enter the cardholder's name.";
      }

      if (!/^\d{2}\/\d{2}$/.test(cardExpiry)) {
        newErrors.cardExpiry =
          "Use MM/YY format.";
      }

      if (!/^\d{3,4}$/.test(cardCvv)) {
        newErrors.cardCvv =
          "Enter a valid CVV.";
      }
    }

    setPaymentErrors(
      newErrors
    );

    return (
      Object.keys(
        newErrors
      ).length === 0
    );
  };

  /*
  =========================================================
  PAYMENT LABEL
  =========================================================
  */

  const paymentLabel =
    paymentMethod === "bkash"
      ? "bKash"
      : paymentMethod === "nagad"
      ? "Nagad"
      : paymentMethod === "rocket"
      ? "Rocket"
      : paymentMethod === "card"
      ? "Card"
      : "Cash on Delivery";

  /*
  =========================================================
  MERCHANT NUMBER
  =========================================================
  */

  const merchantNumber =
    paymentMethod === "bkash"
      ? BKASH_MERCHANT_NUMBER
      : paymentMethod === "nagad"
      ? NAGAD_MERCHANT_NUMBER
      : paymentMethod === "rocket"
      ? ROCKET_MERCHANT_NUMBER
      : "";

  /*
  =========================================================
  PAYMENT LOGO
  =========================================================
  */

  const paymentLogo =
    paymentMethod === "bkash"
      ? "/assets/bkash.png"
      : paymentMethod === "nagad"
      ? "/assets/nagad.png"
      : paymentMethod === "rocket"
      ? "/assets/rocket.png"
      : null;

  /*
  =========================================================
  COPY PAYMENT NUMBER
  =========================================================
  */

  const copyMerchantNumber =
    async () => {
      if (!merchantNumber) {
        return;
      }

      try {
        await navigator.clipboard.writeText(
          merchantNumber
        );
      } catch (error) {
        console.error(
          "Copy failed:",
          error
        );
      }
    };

  /*
  =========================================================
  CREATE ORDER
  =========================================================
  */

  const createOrder = async () => {
    if (isSubmitting) {
      return;
    }

    const token =
      localStorage.getItem(
        "veylix_customer_token"
      );

    const savedCustomer =
      localStorage.getItem(
        "veylix_customer"
      );

    if (!token || !savedCustomer) {
      navigate(
        "/customer/login",
        {
          replace: true,
          state: {
            from: "/checkout",
          },
        }
      );

      return;
    }

    try {
      setIsSubmitting(true);

      setSubmitError("");

      const cleanPhone =
        formData.phone.replace(
          /\s+/g,
          ""
        );

      let customerId = null;

      try {
        const parsedCustomer =
          JSON.parse(
            savedCustomer
          );

        customerId =
          Number(
            parsedCustomer?.id
          ) || null;
      } catch {
        customerId = null;
      }

      /*
      Payment details are stored
      in order notes for this
      simulated payment flow.
      */

      let orderNotes = null;

      if (
        paymentMethod === "bkash" ||
        paymentMethod === "nagad" ||
        paymentMethod === "rocket"
      ) {
        orderNotes =
          `Online Payment | Method: ${paymentMethod.toUpperCase()} | Payment Number: ${paymentAccountNumber.trim()} | Transaction ID: ${transactionId.trim()}`;
      }

      if (
        paymentMethod === "card"
      ) {
        orderNotes =
          `Online Payment | Method: CARD | Payment Reference: ${transactionId.trim()}`;
      }

      const payload = {
        customer: {
          id: customerId,

          name:
            formData.fullName.trim(),

          phone:
            cleanPhone,

          email:
            formData.email.trim() ||
            null,

          address:
            formData.address.trim(),

          city:
            formData.city,

          area:
            formData.area.trim(),

          postalCode:
            formData.postalCode.trim() ||
            null,
        },

        items:
          cartItems.map(
            (item) => ({
              productId:
                Number(
                  item.id
                ),

              quantity:
                Number(
                  item.quantity
                ),
            })
          ),

        orderType:
          "online",

        paymentMethod,

        discount: 0,

        shippingCost:
          Number(
            shipping || 0
          ),

        notes:
          orderNotes,

        createdBy: null,
      };

      const response =
        await fetch(
          "http://localhost:5000/api/orders",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`,
            },

            body:
              JSON.stringify(
                payload
              ),
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

            state: {
              from: "/checkout",
            },
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
            data.error ||
            "Failed to place order."
        );
      }

      const savedOrder = {
        orderId:
          data.order.orderNumber,

        databaseOrderId:
          data.order.id,

        customer:
          formData,

        paymentMethod:
          data.order
            .paymentMethod,

        paymentStatus:
          data.order
            .paymentStatus,

        orderStatus:
          data.order
            .orderStatus,

        paymentAccountNumber,

        transactionId,

        items:
          cartItems,

        subtotal:
          Number(
            data.order
              .subtotal || 0
          ),

        shipping:
          Number(
            data.order
              .shippingCost || 0
          ),

        discount:
          Number(
            data.order
              .discount || 0
          ),

        total:
          Number(
            data.order
              .totalAmount || 0
          ),

        createdAt:
          new Date().toISOString(),
      };

      localStorage.setItem(
        "veylix_last_order",
        JSON.stringify(
          savedOrder
        )
      );

      clearCart();

      setShowPaymentModal(
        false
      );

      navigate(
        `/order-success?order=${encodeURIComponent(
          data.order
            .orderNumber
        )}`
      );
    } catch (error) {
      console.error(
        "Checkout order error:",
        error
      );

      setSubmitError(
        error.message ||
          "Something went wrong while placing your order."
      );
    } finally {
      setIsSubmitting(false);

      setIsPaymentProcessing(
        false
      );
    }
  };

  /*
  =========================================================
  PLACE ORDER
  =========================================================
  */

  const handlePlaceOrder =
    async (event) => {
      event.preventDefault();

      if (isSubmitting) {
        return;
      }

      if (
        cartItems.length === 0
      ) {
        return;
      }

      if (!validateForm()) {
        return;
      }

      if (
        paymentMethod === "cod"
      ) {
        await createOrder();
        return;
      }

      setPaymentErrors({});

      setSubmitError("");

      setShowPaymentModal(
        true
      );
    };

  /*
  =========================================================
  CONFIRM ONLINE PAYMENT
  =========================================================
  */

  const handleConfirmPayment =
    async () => {
      if (
        isPaymentProcessing ||
        isSubmitting
      ) {
        return;
      }

      if (!validatePayment()) {
        return;
      }

      setIsPaymentProcessing(
        true
      );

      if (paymentMethod === "card") {
        const cleanCardNumber =
          cardNumber.replace(/\s+/g, "");

        const simulatedReference =
          `CARD-${Date.now()}-${cleanCardNumber.slice(-4)}`;

        setTransactionId(
          simulatedReference
        );
      }

      await new Promise(
        (resolve) =>
          setTimeout(
            resolve,
            1200
          )
      );

      await createOrder();
    };

  /*
  =========================================================
  CANCEL PAYMENT
  =========================================================
  */

  const handleCancelPayment =
    () => {
      if (
        isPaymentProcessing ||
        isSubmitting
      ) {
        return;
      }

      setShowPaymentModal(
        false
      );

      setPaymentErrors({});

      setSubmitError("");
    };

  /*
  =========================================================
  EMPTY CART
  =========================================================
  */

  if (
    cartItems.length === 0
  ) {
    return (
      <div className="store-page">
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

        <main className="empty-checkout">
          <ShoppingBag
            size={42}
          />

          <p className="section-label">
            VEYLIX CHECKOUT
          </p>

          <h1>
            Your cart is empty
          </h1>

          <p>
            Add some products
            before going to
            checkout.
          </p>

          <Link
            to="/shop"
            className="primary-button"
          >
            Continue Shopping
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="store-page">
      {/* HEADER */}

      <header className="navbar">
        <div className="container navbar-content">
          <Link
            to="/"
            className="logo"
          >
            <img
              src="/assets/logo-dark.svg"
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
            SECURE CHECKOUT
          </div>

          <Link
            to="/cart"
            className="nav-icon cart-icon"
            aria-label="Shopping Cart"
          >
            <ShoppingBag
              size={19}
            />

            <span className="cart-count">
              {cartCount}
            </span>
          </Link>
        </div>
      </header>

      {/* MAIN */}

      <main className="checkout-page">
        <div className="container">
          <Link
            to="/cart"
            className="back-button"
          >
            <ArrowLeft
              size={16}
            />

            Back to Cart
          </Link>

          <div className="checkout-header">
            <p className="section-label">
              VEYLIX CHECKOUT
            </p>

            <h1>
              Complete your order
            </h1>

            <p>
              Enter your delivery
              details and choose
              your preferred
              payment method.
            </p>
          </div>

          {submitError && (
            <div
              className="checkout-card"
              style={{
                marginBottom:
                  "24px",
                border:
                  "1px solid #e0b4b4",
                background:
                  "#fff8f8",
              }}
            >
              <strong>
                Order could not
                be placed
              </strong>

              <p
                style={{
                  marginTop:
                    "6px",
                }}
              >
                {submitError}
              </p>
            </div>
          )}

          <form
            className="checkout-layout"
            onSubmit={
              handlePlaceOrder
            }
          >
            {/* CUSTOMER */}

            <div className="checkout-main">
              <section className="checkout-card">
                <div className="checkout-card-heading">
                  <div className="checkout-step">
                    01
                  </div>

                  <div>
                    <h2>
                      Customer
                      information
                    </h2>

                    <p>
                      Your account
                      contact
                      details
                    </p>
                  </div>
                </div>

                <div className="checkout-form-grid">
                  <div className="form-field full-width">
                    <label htmlFor="fullName">
                      Full name
                    </label>

                    <input
                      id="fullName"
                      name="fullName"
                      type="text"
                      placeholder="Enter your full name"
                      value={
                        formData.fullName
                      }
                      onChange={
                        handleChange
                      }
                      autoComplete="name"
                    />

                    {errors.fullName && (
                      <small className="form-error">
                        {
                          errors.fullName
                        }
                      </small>
                    )}
                  </div>

                  <div className="form-field">
                    <label htmlFor="phone">
                      Phone number
                    </label>

                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="01XXXXXXXXX"
                      value={
                        formData.phone
                      }
                      onChange={
                        handleChange
                      }
                      autoComplete="tel"
                    />

                    {errors.phone && (
                      <small className="form-error">
                        {
                          errors.phone
                        }
                      </small>
                    )}
                  </div>

                  <div className="form-field">
                    <label htmlFor="email">
                      Email address
                    </label>

                    <input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="you@example.com"
                      value={
                        formData.email
                      }
                      onChange={
                        handleChange
                      }
                      autoComplete="email"
                    />

                    {errors.email && (
                      <small className="form-error">
                        {
                          errors.email
                        }
                      </small>
                    )}
                  </div>
                </div>
              </section>

              {/* DELIVERY */}

              <section className="checkout-card">
                <div className="checkout-card-heading">
                  <div className="checkout-step">
                    02
                  </div>

                  <div>
                    <h2>
                      Delivery
                      address
                    </h2>

                    <p>
                      Where should
                      we deliver
                      your order?
                    </p>
                  </div>
                </div>

                <div className="checkout-form-grid">
                  <div className="form-field full-width">
                    <label htmlFor="address">
                      Full address
                    </label>

                    <textarea
                      id="address"
                      name="address"
                      rows="4"
                      placeholder="House / Road / Apartment / Building"
                      value={
                        formData.address
                      }
                      onChange={
                        handleChange
                      }
                    />

                    {errors.address && (
                      <small className="form-error">
                        {
                          errors.address
                        }
                      </small>
                    )}
                  </div>

                  <div className="form-field">
                    <label htmlFor="city">
                      City
                    </label>

                    <select
                      id="city"
                      name="city"
                      value={
                        formData.city
                      }
                      onChange={
                        handleChange
                      }
                    >
                      <option value="Dhaka">
                        Dhaka
                      </option>

                      <option value="Chattogram">
                        Chattogram
                      </option>

                      <option value="Sylhet">
                        Sylhet
                      </option>

                      <option value="Rajshahi">
                        Rajshahi
                      </option>

                      <option value="Khulna">
                        Khulna
                      </option>

                      <option value="Barishal">
                        Barishal
                      </option>
                    </select>
                  </div>

                  <div className="form-field">
                    <label htmlFor="area">
                      Area
                    </label>

                    <input
                      id="area"
                      name="area"
                      type="text"
                      placeholder="e.g. Dhanmondi"
                      value={
                        formData.area
                      }
                      onChange={
                        handleChange
                      }
                    />

                    {errors.area && (
                      <small className="form-error">
                        {
                          errors.area
                        }
                      </small>
                    )}
                  </div>

                  <div className="form-field">
                    <label htmlFor="postalCode">
                      Postal code
                      <span>
                        Optional
                      </span>
                    </label>

                    <input
                      id="postalCode"
                      name="postalCode"
                      type="text"
                      placeholder="1205"
                      value={
                        formData.postalCode
                      }
                      onChange={
                        handleChange
                      }
                    />
                  </div>
                </div>

                <div className="delivery-note">
                  <MapPin
                    size={17}
                  />

                  <span>
                    Please make sure
                    your delivery
                    address is
                    accurate.
                  </span>
                </div>
              </section>

              {/* PAYMENT */}

              <section className="checkout-card">
                <div className="checkout-card-heading">
                  <div className="checkout-step">
                    03
                  </div>

                  <div>
                    <h2>
                      Payment method
                    </h2>

                    <p>
                      Choose how you
                      would like to
                      pay.
                    </p>
                  </div>
                </div>

                <div
                  className="payment-options"
                  style={{
                    display:
                      "grid",
                    gap:
                      "10px",
                  }}
                >
                  {/* COD */}

                  <label
                    className={`payment-option ${
                      paymentMethod ===
                      "cod"
                        ? "selected"
                        : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value="cod"
                      checked={
                        paymentMethod ===
                        "cod"
                      }
                      onChange={
                        handlePaymentMethodChange
                      }
                    />

                    <div className="payment-icon">
                      <Truck
                        size={20}
                      />
                    </div>

                    <div className="payment-info">
                      <strong>
                        Cash on
                        Delivery
                      </strong>

                      <span>
                        Pay when your
                        order arrives
                      </span>
                    </div>

                    {paymentMethod ===
                      "cod" && (
                      <div className="payment-check">
                        <CheckCircle2
                          size={
                            18
                          }
                        />
                      </div>
                    )}
                  </label>

                  {/* BKASH */}

                  <label
                    className={`payment-option ${
                      paymentMethod ===
                      "bkash"
                        ? "selected"
                        : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value="bkash"
                      checked={
                        paymentMethod ===
                        "bkash"
                      }
                      onChange={
                        handlePaymentMethodChange
                      }
                    />

                    <div
                      className="payment-icon"
                      style={{
                        background:
                          "#fff",
                        padding:
                          "4px",
                      }}
                    >
                      <img
                        src="/assets/bkash.png"
                        alt="bKash"
                        style={{
                          width:
                            "48px",
                          height:
                            "30px",
                          objectFit:
                            "contain",
                        }}
                      />
                    </div>

                    <div className="payment-info">
                      <strong>
                        bKash
                      </strong>

                      <span>
                        Pay using
                        your bKash
                        account
                      </span>
                    </div>

                    {paymentMethod ===
                      "bkash" && (
                      <div className="payment-check">
                        <CheckCircle2
                          size={
                            18
                          }
                        />
                      </div>
                    )}
                  </label>

                  {/* NAGAD */}

                  <label
                    className={`payment-option ${
                      paymentMethod ===
                      "nagad"
                        ? "selected"
                        : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value="nagad"
                      checked={
                        paymentMethod ===
                        "nagad"
                      }
                      onChange={
                        handlePaymentMethodChange
                      }
                    />

                    <div
                      className="payment-icon"
                      style={{
                        background:
                          "#fff",
                        padding:
                          "4px",
                      }}
                    >
                      <img
                        src="/assets/nagad.png"
                        alt="Nagad"
                        style={{
                          width:
                            "48px",
                          height:
                            "30px",
                          objectFit:
                            "contain",
                        }}
                      />
                    </div>

                    <div className="payment-info">
                      <strong>
                        Nagad
                      </strong>

                      <span>
                        Pay using
                        your Nagad
                        account
                      </span>
                    </div>

                    {paymentMethod ===
                      "nagad" && (
                      <div className="payment-check">
                        <CheckCircle2
                          size={
                            18
                          }
                        />
                      </div>
                    )}
                  </label>

                  {/* ROCKET */}

                  <label
                    className={`payment-option ${
                      paymentMethod ===
                      "rocket"
                        ? "selected"
                        : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value="rocket"
                      checked={
                        paymentMethod ===
                        "rocket"
                      }
                      onChange={
                        handlePaymentMethodChange
                      }
                    />

                    <div
                      className="payment-icon"
                      style={{
                        background:
                          "#fff",
                        padding:
                          "4px",
                      }}
                    >
                      <img
                        src="/assets/rocket.png"
                        alt="Rocket"
                        style={{
                          width:
                            "48px",
                          height:
                            "30px",
                          objectFit:
                            "contain",
                        }}
                      />
                    </div>

                    <div className="payment-info">
                      <strong>
                        Rocket
                      </strong>

                      <span>
                        Pay using
                        your Rocket
                        account
                      </span>
                    </div>

                    {paymentMethod ===
                      "rocket" && (
                      <div className="payment-check">
                        <CheckCircle2
                          size={
                            18
                          }
                        />
                      </div>
                    )}
                  </label>

                  {/* CARD */}

                  <label
                    className={`payment-option ${
                      paymentMethod ===
                      "card"
                        ? "selected"
                        : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value="card"
                      checked={
                        paymentMethod ===
                        "card"
                      }
                      onChange={
                        handlePaymentMethodChange
                      }
                    />

                    <div
                      className="payment-icon"
                      style={{
                        display:
                          "flex",
                        alignItems:
                          "center",
                        gap:
                          "4px",
                        background:
                          "#fff",
                      }}
                    >
                      <img
                        src="/assets/visa.png"
                        alt="Visa"
                        style={{
                          width:
                            "34px",
                          height:
                            "22px",
                          objectFit:
                            "contain",
                        }}
                      />

                      <img
                        src="/assets/mastercard.png"
                        alt="Mastercard"
                        style={{
                          width:
                            "34px",
                          height:
                            "22px",
                          objectFit:
                            "contain",
                        }}
                      />
                    </div>

                    <div className="payment-info">
                      <strong>
                        Credit / Debit
                        Card
                      </strong>

                      <span>
                        Visa and
                        Mastercard
                      </span>
                    </div>

                    {paymentMethod ===
                      "card" && (
                      <div className="payment-check">
                        <CheckCircle2
                          size={
                            18
                          }
                        />
                      </div>
                    )}
                  </label>
                </div>

                <div
                  className="payment-disclaimer"
                  style={{
                    display:
                      "flex",
                    alignItems:
                      "center",
                    gap:
                      "8px",
                    marginTop:
                      "14px",
                  }}
                >
                  <ShieldCheck
                    size={16}
                  />

                  Payment processing
                  is currently
                  simulated for this
                  Veylix project.
                </div>
              </section>
            </div>

            {/* SUMMARY */}

            <aside className="checkout-summary">
              <div className="checkout-summary-header">
                <p className="section-label">
                  YOUR ORDER
                </p>

                <h2>
                  Order Summary
                </h2>
              </div>

              <div className="checkout-products">
                {cartItems.map(
                  (item) => (
                    <div
                      className="checkout-product"
                      key={
                        item.id
                      }
                    >
                      <div className="checkout-product-image">
                        <img
                          src={
                            item.image
                          }
                          alt={
                            item.name
                          }
                          onError={(
                            event
                          ) => {
                            event.currentTarget.src =
                              "/assets/mark.svg";
                          }}
                        />

                        <span>
                          {
                            item.quantity
                          }
                        </span>
                      </div>

                      <div className="checkout-product-info">
                        <strong>
                          {
                            item.name
                          }
                        </strong>

                        <span>
                          {
                            item.category
                          }
                        </span>
                      </div>

                      <strong>
                        ৳{" "}
                        {(
                          Number(
                            item.price ||
                              0
                          ) *
                          Number(
                            item.quantity ||
                              0
                          )
                        ).toLocaleString(
                          "en-BD"
                        )}
                      </strong>
                    </div>
                  )
                )}
              </div>

              <div className="checkout-summary-lines">
                <div>
                  <span>
                    Subtotal
                  </span>

                  <strong>
                    ৳{" "}
                    {Number(
                      cartSubtotal ||
                        0
                    ).toLocaleString(
                      "en-BD"
                    )}
                  </strong>
                </div>

                <div>
                  <span>
                    Shipping
                  </span>

                  <strong>
                    ৳{" "}
                    {Number(
                      shipping ||
                        0
                    ).toLocaleString(
                      "en-BD"
                    )}
                  </strong>
                </div>
              </div>

              <div className="checkout-summary-total">
                <span>
                  Total
                </span>

                <strong>
                  ৳{" "}
                  {Number(
                    cartTotal ||
                      0
                  ).toLocaleString(
                    "en-BD"
                  )}
                </strong>
              </div>

              <button
                type="submit"
                className="place-order-button"
                disabled={
                  isSubmitting
                }
              >
                <ShoppingBag
                  size={18}
                />

                {isSubmitting
                  ? "Placing Order..."
                  : paymentMethod ===
                    "cod"
                  ? "Place Order"
                  : `Continue with ${paymentLabel}`}
              </button>

              <div className="secure-payment">
                <ShieldCheck
                  size={17}
                />

                <span>
                  Secure and protected
                  checkout
                </span>
              </div>

              <div
                style={{
                  marginTop:
                    "16px",
                  paddingTop:
                    "16px",
                  borderTop:
                    "1px solid #e8e8e8",
                  fontSize:
                    "12px",
                  color:
                    "#777",
                  lineHeight:
                    1.6,
                }}
              >
                Free shipping on
                orders over ৳2,000.
              </div>
            </aside>
          </form>
        </div>
      </main>

      {/* PAYMENT MODAL */}

      {showPaymentModal && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position:
              "fixed",
            inset: 0,
            zIndex:
              1000,
            background:
              "rgba(0,0,0,0.52)",
            display:
              "flex",
            alignItems:
              "center",
            justifyContent:
              "center",
            padding:
              "20px",
          }}
        >
          <div
            style={{
              width:
                "100%",
              maxWidth:
                "530px",
              maxHeight:
                "90vh",
              overflowY:
                "auto",
              background:
                "#fff",
              borderRadius:
                "18px",
              padding:
                "28px",
              boxShadow:
                "0 24px 80px rgba(0,0,0,0.24)",
            }}
          >
            {/* MODAL HEADER */}

            <div
              style={{
                display:
                  "flex",
                alignItems:
                  "center",
                gap:
                  "14px",
                marginBottom:
                  "22px",
              }}
            >
              <div
                style={{
                  width:
                    "64px",
                  height:
                    "52px",
                  borderRadius:
                    "10px",
                  background:
                    "#fff",
                  border:
                    "1px solid #eee",
                  display:
                    "flex",
                  alignItems:
                    "center",
                  justifyContent:
                    "center",
                  overflow:
                    "hidden",
                }}
              >
                {paymentLogo ? (
                  <img
                    src={
                      paymentLogo
                    }
                    alt={
                      paymentLabel
                    }
                    style={{
                      width:
                        "54px",
                      height:
                        "38px",
                      objectFit:
                        "contain",
                    }}
                  />
                ) : (
                  <CreditCard
                    size={22}
                  />
                )}
              </div>

              <div>
                <p
                  className="section-label"
                  style={{
                    margin: 0,
                  }}
                >
                  VEYLIX PAYMENT
                </p>

                <h2
                  style={{
                    margin:
                      "4px 0 0",
                  }}
                >
                  {paymentLabel}
                  {" "}
                  Payment
                </h2>
              </div>
            </div>

            {/* PAYMENT AMOUNT */}

            <div
              style={{
                padding:
                  "16px",
                border:
                  "1px solid #e8e8e8",
                borderRadius:
                  "12px",
                marginBottom:
                  "18px",
                background:
                  "#fafafa",
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
                }}
              >
                <span>
                  Payment Amount
                </span>

                <strong
                  style={{
                    fontSize:
                      "20px",
                  }}
                >
                  ৳{" "}
                  {Number(
                    cartTotal ||
                      0
                  ).toLocaleString(
                    "en-BD"
                  )}
                </strong>
              </div>
            </div>

            {/* BKASH / NAGAD / ROCKET */}

            {(paymentMethod ===
              "bkash" ||
              paymentMethod ===
                "nagad" ||
              paymentMethod ===
                "rocket") && (
              <>
                <div
                  style={{
                    padding:
                      "18px",
                    borderRadius:
                      "12px",
                    background:
                      "#f7f7f7",
                    marginBottom:
                      "18px",
                  }}
                >
                  <p
                    style={{
                      margin:
                        "0 0 8px",
                      fontSize:
                        "12px",
                      fontWeight:
                        700,
                      textTransform:
                        "uppercase",
                      letterSpacing:
                        "0.06em",
                    }}
                  >
                    Payment Number
                  </p>

                  <div
                    style={{
                      display:
                        "flex",
                      alignItems:
                        "center",
                      justifyContent:
                        "space-between",
                      gap:
                        "12px",
                    }}
                  >
                    <strong
                      style={{
                        fontSize:
                          "22px",
                        letterSpacing:
                          "0.03em",
                      }}
                    >
                      {
                        merchantNumber
                      }
                    </strong>

                    <button
                      type="button"
                      onClick={
                        copyMerchantNumber
                      }
                      style={{
                        width:
                          "40px",
                        height:
                          "40px",
                        border:
                          "1px solid #ddd",
                        background:
                          "#fff",
                        borderRadius:
                          "9px",
                        cursor:
                          "pointer",
                        display:
                          "flex",
                        alignItems:
                          "center",
                        justifyContent:
                          "center",
                      }}
                      title="Copy payment number"
                    >
                      <Copy
                        size={
                          16
                        }
                      />
                    </button>
                  </div>

                  <p
                    style={{
                      margin:
                        "10px 0 0",
                      color:
                        "#666",
                      fontSize:
                        "13px",
                      lineHeight:
                        1.6,
                    }}
                  >
                    Pay the exact
                    amount shown above
                    to this payment
                    number. Then enter
                    the number you used
                    and your transaction
                    ID below.
                  </p>
                </div>

                <div
                  className="form-field"
                  style={{
                    marginBottom:
                      "16px",
                  }}
                >
                  <label htmlFor="paymentAccountNumber">
                    Your{" "}
                    {
                      paymentLabel
                    }{" "}
                    Number
                  </label>

                  <input
                    id="paymentAccountNumber"
                    type="tel"
                    placeholder="01XXXXXXXXX"
                    value={
                      paymentAccountNumber
                    }
                    onChange={(
                      event
                    ) => {
                      setPaymentAccountNumber(
                        event
                          .target
                          .value
                      );

                      setPaymentErrors(
                        (current) => ({
                          ...current,
                          accountNumber:
                            "",
                        })
                      );
                    }}
                  />

                  {paymentErrors.accountNumber && (
                    <small className="form-error">
                      {
                        paymentErrors.accountNumber
                      }
                    </small>
                  )}
                </div>

                <div
                  className="form-field"
                  style={{
                    marginBottom:
                      "18px",
                  }}
                >
                  <label htmlFor="transactionId">
                    Transaction ID
                  </label>

                  <input
                    id="transactionId"
                    type="text"
                    placeholder={`Enter your ${paymentLabel} transaction ID`}
                    value={
                      transactionId
                    }
                    onChange={(
                      event
                    ) => {
                      setTransactionId(
                        event
                          .target
                          .value
                      );

                      setPaymentErrors(
                        (current) => ({
                          ...current,
                          transactionId:
                            "",
                        })
                      );
                    }}
                  />

                  {paymentErrors.transactionId && (
                    <small className="form-error">
                      {
                        paymentErrors.transactionId
                      }
                    </small>
                  )}
                </div>
              </>
            )}

            {/* CARD */}

            {paymentMethod ===
              "card" && (
              <div
                style={{
                  marginBottom:
                    "18px",
                }}
              >
                <div
                  style={{
                    display:
                      "flex",
                    gap:
                      "8px",
                    marginBottom:
                      "16px",
                  }}
                >
                  <button
                    type="button"
                    onClick={() =>
                      setCardType("mastercard")
                    }
                    style={{
                      flex: 1,
                      minHeight:
                        "54px",
                      border:
                        cardType === "mastercard"
                          ? "2px solid #111"
                          : "1px solid #ddd",
                      background:
                        "#fff",
                      borderRadius:
                        "10px",
                      display:
                        "flex",
                      alignItems:
                        "center",
                      justifyContent:
                        "center",
                      cursor:
                        "pointer",
                    }}
                  >
                    <img
                      src="/assets/mastercard.png"
                      alt="Mastercard"
                      style={{
                        width:
                          "72px",
                        height:
                          "34px",
                        objectFit:
                          "contain",
                      }}
                    />
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setCardType("visa")
                    }
                    style={{
                      flex: 1,
                      minHeight:
                        "54px",
                      border:
                        cardType === "visa"
                          ? "2px solid #111"
                          : "1px solid #ddd",
                      background:
                        "#fff",
                      borderRadius:
                        "10px",
                      display:
                        "flex",
                      alignItems:
                        "center",
                      justifyContent:
                        "center",
                      cursor:
                        "pointer",
                    }}
                  >
                    <img
                      src="/assets/visa.png"
                      alt="Visa"
                      style={{
                        width:
                          "72px",
                        height:
                          "34px",
                        objectFit:
                          "contain",
                      }}
                    />
                  </button>
                </div>

                <div
                  style={{
                    display:
                      "grid",
                    gap:
                      "13px",
                  }}
                >
                  <div
                    className="form-field"
                  >
                    <label htmlFor="cardNumber">
                      Card number
                    </label>

                    <input
                      id="cardNumber"
                      type="text"
                      inputMode="numeric"
                      autoComplete="cc-number"
                      maxLength={19}
                      placeholder="1111 2222 3333 4444"
                      value={cardNumber}
                      onChange={(event) => {
                        const digits =
                          event.target.value
                            .replace(/\D/g, "")
                            .slice(0, 16);

                        const formatted =
                          digits.replace(
                            /(.{4})/g,
                            "$1 "
                          ).trim();

                        setCardNumber(
                          formatted
                        );

                        setPaymentErrors(
                          (current) => ({
                            ...current,
                            cardNumber:
                              "",
                          })
                        );
                      }}
                    />

                    {paymentErrors.cardNumber && (
                      <small className="form-error">
                        {
                          paymentErrors.cardNumber
                        }
                      </small>
                    )}
                  </div>

                  <div
                    className="form-field"
                  >
                    <label htmlFor="cardholderName">
                      Cardholder's name
                    </label>

                    <input
                      id="cardholderName"
                      type="text"
                      autoComplete="cc-name"
                      placeholder="JOHN DOE"
                      value={cardholderName}
                      onChange={(event) => {
                        setCardholderName(
                          event.target.value
                        );

                        setPaymentErrors(
                          (current) => ({
                            ...current,
                            cardholderName:
                              "",
                          })
                        );
                      }}
                    />

                    {paymentErrors.cardholderName && (
                      <small className="form-error">
                        {
                          paymentErrors.cardholderName
                        }
                      </small>
                    )}
                  </div>

                  <div
                    style={{
                      display:
                        "grid",
                      gridTemplateColumns:
                        "1fr 1fr",
                      gap:
                        "10px",
                    }}
                  >
                    <div
                      className="form-field"
                    >
                      <label htmlFor="cardExpiry">
                        Expiry date
                      </label>

                      <input
                        id="cardExpiry"
                        type="text"
                        inputMode="numeric"
                        autoComplete="cc-exp"
                        maxLength={5}
                        placeholder="MM/YY"
                        value={cardExpiry}
                        onChange={(event) => {
                          const digits =
                            event.target.value
                              .replace(/\D/g, "")
                              .slice(0, 4);

                          const formatted =
                            digits.length > 2
                              ? `${digits.slice(0, 2)}/${digits.slice(2)}`
                              : digits;

                          setCardExpiry(
                            formatted
                          );

                          setPaymentErrors(
                            (current) => ({
                              ...current,
                              cardExpiry:
                                "",
                            })
                          );
                        }}
                      />

                      {paymentErrors.cardExpiry && (
                        <small className="form-error">
                          {
                            paymentErrors.cardExpiry
                          }
                        </small>
                      )}
                    </div>

                    <div
                      className="form-field"
                    >
                      <label htmlFor="cardCvv">
                        CVV
                      </label>

                      <input
                        id="cardCvv"
                        type="password"
                        inputMode="numeric"
                        autoComplete="cc-csc"
                        maxLength={4}
                        placeholder="123"
                        value={cardCvv}
                        onChange={(event) => {
                          const digits =
                            event.target.value
                              .replace(/\D/g, "")
                              .slice(0, 4);

                          setCardCvv(
                            digits
                          );

                          setPaymentErrors(
                            (current) => ({
                              ...current,
                              cardCvv:
                                "",
                            })
                          );
                        }}
                      />

                      {paymentErrors.cardCvv && (
                        <small className="form-error">
                          {
                            paymentErrors.cardCvv
                          }
                        </small>
                      )}
                    </div>
                  </div>

                  <label
                    style={{
                      display:
                        "flex",
                      alignItems:
                        "center",
                      gap:
                        "9px",
                      cursor:
                        "pointer",
                      fontSize:
                        "13px",
                      color:
                        "#666",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={saveCardInfo}
                      onChange={(event) =>
                        setSaveCardInfo(
                          event.target.checked
                        )
                      }
                    />

                    Save information for future payments
                  </label>

                  <div
                    style={{
                      display:
                        "flex",
                      alignItems:
                        "center",
                      gap:
                        "8px",
                      padding:
                        "12px 14px",
                      border:
                        "1px solid #e8e8e8",
                      borderRadius:
                        "10px",
                      background:
                        "#fafafa",
                      color:
                        "#666",
                      fontSize:
                        "12px",
                      lineHeight:
                        "1.5",
                    }}
                  >
                    <ShieldCheck
                      size={16}
                    />

                    Card details are used only for this simulated payment step.
                    Full card information is not stored with the order.
                  </div>
                </div>
              </div>
            )}

            {/* NOTICE */}

            <div
              style={{
                display:
                  "flex",
                alignItems:
                  "center",
                gap:
                  "8px",
                padding:
                  "12px 14px",
                border:
                  "1px solid #e5e5e5",
                borderRadius:
                  "10px",
                fontSize:
                  "12px",
                color:
                  "#666",
                lineHeight:
                  1.6,
                marginBottom:
                  "18px",
              }}
            >
              <ShieldCheck
                size={16}
              />

              Payment is simulated
              for this project. Mobile
              banking payment numbers
              and transaction IDs are
              stored with the order.
              Card details are not stored.
            </div>

            {/* BUTTONS */}

            <div
              style={{
                display:
                  "flex",
                gap:
                  "10px",
                justifyContent:
                  "flex-end",
              }}
            >
              <button
                type="button"
                onClick={
                  handleCancelPayment
                }
                disabled={
                  isPaymentProcessing ||
                  isSubmitting
                }
                style={{
                  minHeight:
                    "44px",
                  padding:
                    "0 18px",
                  border:
                    "1px solid #ddd",
                  background:
                    "#fff",
                  borderRadius:
                    "10px",
                  cursor:
                    "pointer",
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                className="place-order-button"
                onClick={
                  handleConfirmPayment
                }
                disabled={
                  isPaymentProcessing ||
                  isSubmitting
                }
                style={{
                  minHeight:
                    "44px",
                  padding:
                    "0 20px",
                }}
              >
                {isPaymentProcessing
                  ? "Processing..."
                  : "Confirm Payment"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}

      <footer className="footer">
        <div className="container footer-content">
          <div>
            <img
              src="/assets/logo-dark.svg"
              alt="Veylix"
              style={{
                width:
                  "130px",
                height:
                  "auto",
                marginBottom:
                  "12px",
                display:
                  "block",
              }}
            />

            <p>
              Fashion and lifestyle
              essentials made for
              every you.
            </p>
          </div>

          <div className="footer-links">
            <Link to="/">
              Home
            </Link>

            <Link to="/shop">
              Shop
            </Link>

            <Link to="/shop/men">
              Men
            </Link>

            <Link to="/shop/women">
              Women
            </Link>
          </div>

          <p className="copyright">
            © 2026 Veylix. All rights
            reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default Checkout;