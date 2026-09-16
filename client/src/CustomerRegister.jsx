import React, { useState } from "react";

import {
  ArrowLeft,
  CheckCircle2,
  Mail,
  Phone,
  ShoppingBag,
  User,
  LockKeyhole,
} from "lucide-react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

function CustomerRegister() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [error, setError] =
    useState("");

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    const name =
      formData.name.trim();

    const phone =
      formData.phone
        .replace(/\s+/g, "")
        .trim();

    const email =
      formData.email
        .trim()
        .toLowerCase();

    const password =
      formData.password;

    const confirmPassword =
      formData.confirmPassword;

    if (
      !name ||
      !phone ||
      !email ||
      !password ||
      !confirmPassword
    ) {
      setError(
        "Please complete all required fields."
      );
      return;
    }

    if (
      !/^01\d{9}$/.test(phone)
    ) {
      setError(
        "Enter a valid Bangladeshi phone number."
      );
      return;
    }

    if (
      !/^\S+@\S+\.\S+$/.test(email)
    ) {
      setError(
        "Enter a valid email address."
      );
      return;
    }

    if (password.length < 6) {
      setError(
        "Password must be at least 6 characters."
      );
      return;
    }

    if (
      password !== confirmPassword
    ) {
      setError(
        "Passwords do not match."
      );
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");

      const response = await fetch(
        "https://veylix-backend-production.up.railway.app/api/auth/customer/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            phone,
            email,
            password,
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
            "Customer registration failed."
        );
      }

      localStorage.setItem(
        "veylix_customer_token",
        data.token
      );

      localStorage.setItem(
        "veylix_customer",
        JSON.stringify(
          data.customer
        )
      );

      navigate("/orders");
    } catch (registerError) {
      console.error(
        "Customer registration error:",
        registerError
      );

      setError(
        registerError.message ||
          "Unable to create your account."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="customer-register-page">

      <style>{`
        .customer-register-page {
          min-height: 100vh;
          background: #f6f6f4;
          color: #111111;
          font-family: Inter, Arial, Helvetica, sans-serif;
        }

        .customer-register-header {
          height: 78px;
          background: #ffffff;
          border-bottom: 1px solid #e8e8e5;
        }

        .customer-register-header-inner {
          width: min(1120px, calc(100% - 48px));
          height: 100%;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .customer-register-logo {
          text-decoration: none;
          color: #111111;
          font-size: 26px;
          font-weight: 800;
          letter-spacing: -0.8px;
        }

        .customer-register-shop-link {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          text-decoration: none;
          color: #252525;
          font-size: 13px;
          font-weight: 600;
          padding: 11px 15px;
          border: 1px solid #ddddda;
          background: #ffffff;
          border-radius: 4px;
          transition: 0.2s ease;
        }

        .customer-register-shop-link:hover {
          background: #111111;
          color: #ffffff;
          border-color: #111111;
        }

        .customer-register-main {
          min-height: calc(100vh - 78px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 50px 24px;
        }

        .customer-register-card {
          width: min(540px, 100%);
          background: #ffffff;
          border: 1px solid #e1e1dd;
          padding: 42px 42px 34px;
          box-shadow: 0 14px 40px rgba(0, 0, 0, 0.05);
        }

        .customer-register-icon {
          width: 52px;
          height: 52px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: #f1f1ee;
          margin-bottom: 23px;
        }

        .customer-register-eyebrow {
          margin: 0 0 10px;
          font-size: 10px;
          line-height: 1;
          font-weight: 700;
          letter-spacing: 2.2px;
          text-transform: uppercase;
          color: #777773;
        }

        .customer-register-heading h1 {
          margin: 0;
          font-size: 38px;
          line-height: 1.08;
          letter-spacing: -1.6px;
          font-weight: 800;
        }

        .customer-register-heading p {
          margin: 14px 0 0;
          color: #777773;
          font-size: 14px;
          line-height: 1.7;
        }

        .customer-register-error {
          margin-top: 24px;
          padding: 14px 15px;
          border: 1px solid #edc8c8;
          background: #fff6f6;
          display: flex;
          flex-direction: column;
          gap: 4px;
          color: #9c2525;
          font-size: 13px;
          line-height: 1.5;
        }

        .customer-register-form {
          margin-top: 28px;
        }

        .customer-register-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 18px 16px;
        }

        .customer-register-field {
          margin: 0;
        }

        .customer-register-field.full {
          grid-column: 1 / -1;
        }

        .customer-register-field label {
          display: block;
          margin-bottom: 8px;
          font-size: 12px;
          font-weight: 700;
          color: #262624;
        }

        .customer-register-input-wrap {
          height: 48px;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 0 13px;
          background: #ffffff;
          border: 1px solid #d9d9d4;
          border-radius: 3px;
          transition: border-color 0.2s ease,
            box-shadow 0.2s ease;
        }

        .customer-register-input-wrap:focus-within {
          border-color: #111111;
          box-shadow: 0 0 0 3px rgba(17, 17, 17, 0.06);
        }

        .customer-register-input-wrap svg {
          color: #777773;
          flex-shrink: 0;
        }

        .customer-register-input-wrap input {
          width: 100%;
          height: 100%;
          border: 0;
          outline: 0;
          background: transparent;
          color: #111111;
          font-size: 14px;
          font-family: inherit;
        }

        .customer-register-input-wrap input::placeholder {
          color: #aaaaa5;
        }

        .customer-register-password-note {
          margin: 7px 0 0;
          font-size: 11px;
          color: #8a8a85;
        }

        .customer-register-submit {
          width: 100%;
          height: 49px;
          border: 1px solid #111111;
          border-radius: 3px;
          background: #111111;
          color: #ffffff;
          font-size: 14px;
          font-weight: 700;
          font-family: inherit;
          cursor: pointer;
          transition: 0.2s ease;
          margin-top: 24px;
        }

        .customer-register-submit:hover:not(:disabled) {
          background: #2a2a2a;
        }

        .customer-register-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .customer-register-login {
          margin-top: 25px;
          padding-top: 24px;
          border-top: 1px solid #ecece8;
          text-align: center;
          display: flex;
          justify-content: center;
          gap: 5px;
          font-size: 13px;
          color: #777773;
        }

        .customer-register-login a {
          color: #111111;
          font-weight: 700;
          text-decoration: none;
        }

        .customer-register-login a:hover {
          text-decoration: underline;
        }

        .customer-register-back {
          margin-top: 20px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          width: 100%;
          text-decoration: none;
          color: #555551;
          font-size: 12px;
          font-weight: 600;
        }

        .customer-register-back:hover {
          color: #111111;
        }

        .customer-register-security {
          margin-top: 26px;
          padding-top: 20px;
          border-top: 1px solid #ecece8;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          text-align: center;
          color: #777773;
          font-size: 11px;
          line-height: 1.5;
        }

        .customer-register-security svg {
          flex-shrink: 0;
        }

        @media (max-width: 680px) {
          .customer-register-header-inner {
            width: calc(100% - 28px);
          }

          .customer-register-shop-link {
            padding: 9px 11px;
          }

          .customer-register-main {
            padding: 32px 14px;
          }

          .customer-register-card {
            padding: 34px 24px 28px;
          }

          .customer-register-heading h1 {
            font-size: 32px;
          }

          .customer-register-grid {
            grid-template-columns: 1fr;
          }

          .customer-register-field.full {
            grid-column: auto;
          }
        }
      `}</style>

      {/* HEADER */}

      <header className="customer-register-header">
        <div className="customer-register-header-inner">

          <Link
            to="/"
            className="customer-register-logo"
          >
            Veylix
          </Link>

          <Link
            to="/shop"
            className="customer-register-shop-link"
          >
            <ShoppingBag size={16} />
            Continue Shopping
          </Link>

        </div>
      </header>

      {/* MAIN */}

      <main className="customer-register-main">

        <div className="customer-register-card">

          <div className="customer-register-icon">
            <User size={24} />
          </div>

          <div className="customer-register-heading">

            <p className="customer-register-eyebrow">
              VEYLIX ACCOUNT
            </p>

            <h1>
              Create your account
            </h1>

            <p>
              Create a Veylix account to
              track your orders and manage
              your shopping experience.
            </p>

          </div>

          {error && (
            <div className="customer-register-error">

              <strong>
                Registration failed
              </strong>

              <span>
                {error}
              </span>

            </div>
          )}

          <form
            className="customer-register-form"
            onSubmit={handleSubmit}
          >

            <div className="customer-register-grid">

              {/* NAME */}

              <div className="customer-register-field full">

                <label htmlFor="register-name">
                  Full name
                </label>

                <div className="customer-register-input-wrap">

                  <User size={17} />

                  <input
                    id="register-name"
                    name="name"
                    type="text"
                    placeholder="Your full name"
                    value={
                      formData.name
                    }
                    onChange={
                      handleChange
                    }
                    autoComplete="name"
                  />

                </div>

              </div>

              {/* PHONE */}

              <div className="customer-register-field">

                <label htmlFor="register-phone">
                  Phone number
                </label>

                <div className="customer-register-input-wrap">

                  <Phone size={17} />

                  <input
                    id="register-phone"
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

                </div>

              </div>

              {/* EMAIL */}

              <div className="customer-register-field">

                <label htmlFor="register-email">
                  Email address
                </label>

                <div className="customer-register-input-wrap">

                  <Mail size={17} />

                  <input
                    id="register-email"
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

                </div>

              </div>

              {/* PASSWORD */}

              <div className="customer-register-field">

                <label htmlFor="register-password">
                  Password
                </label>

                <div className="customer-register-input-wrap">

                  <LockKeyhole size={17} />

                  <input
                    id="register-password"
                    name="password"
                    type="password"
                    placeholder="Create a password"
                    value={
                      formData.password
                    }
                    onChange={
                      handleChange
                    }
                    autoComplete="new-password"
                  />

                </div>

                <p className="customer-register-password-note">
                  Minimum 6 characters
                </p>

              </div>

              {/* CONFIRM */}

              <div className="customer-register-field">

                <label htmlFor="register-confirm-password">
                  Confirm password
                </label>

                <div className="customer-register-input-wrap">

                  <LockKeyhole size={17} />

                  <input
                    id="register-confirm-password"
                    name="confirmPassword"
                    type="password"
                    placeholder="Repeat your password"
                    value={
                      formData.confirmPassword
                    }
                    onChange={
                      handleChange
                    }
                    autoComplete="new-password"
                  />

                </div>

              </div>

            </div>

            <button
              type="submit"
              className="customer-register-submit"
              disabled={
                isSubmitting
              }
            >
              {isSubmitting
                ? "Creating account..."
                : "Create Account"}
            </button>

          </form>

          <div className="customer-register-login">

            <span>
              Already have an account?
            </span>

            <Link
              to="/customer/login"
            >
              Sign in
            </Link>

          </div>

          <Link
            to="/"
            className="customer-register-back"
          >
            <ArrowLeft size={15} />
            Back to home
          </Link>

          <div className="customer-register-security">

            <CheckCircle2 size={15} />

            <span>
              Your account information is
              securely protected.
            </span>

          </div>

        </div>

      </main>

    </div>
  );
}

export default CustomerRegister;