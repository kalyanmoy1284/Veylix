import React, { useState } from "react";

import {
  ArrowLeft,
  CheckCircle2,
  LockKeyhole,
  Mail,
  ShoppingBag,
  User,
} from "lucide-react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

function CustomerLogin() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
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

    const email =
      formData.email
        .trim()
        .toLowerCase();

    const password =
      formData.password;

    if (!email || !password) {
      setError(
        "Please enter your email and password."
      );
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");

      const response = await fetch(
        "http://localhost:5000/api/auth/customer/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
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
            "Customer login failed."
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
    } catch (loginError) {
      console.error(
        "Customer login error:",
        loginError
      );

      setError(
        loginError.message ||
          "Unable to login."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="customer-login-page">

      {/* =================================================
          PAGE STYLES
      ================================================= */}

      <style>{`
        .customer-login-page {
          min-height: 100vh;
          background: #f6f6f4;
          color: #111111;
          font-family: Inter, Arial, Helvetica, sans-serif;
        }

        .customer-login-header {
          height: 78px;
          background: #ffffff;
          border-bottom: 1px solid #e8e8e5;
        }

        .customer-login-header-inner {
          width: min(1120px, calc(100% - 48px));
          height: 100%;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .customer-login-logo {
          text-decoration: none;
          color: #111111;
          font-size: 26px;
          font-weight: 800;
          letter-spacing: -0.8px;
        }

        .customer-login-shop-link {
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

        .customer-login-shop-link:hover {
          background: #111111;
          color: #ffffff;
          border-color: #111111;
        }

        .customer-login-main {
          min-height: calc(100vh - 78px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 60px 24px;
        }

        .customer-login-card {
          width: min(470px, 100%);
          background: #ffffff;
          border: 1px solid #e1e1dd;
          padding: 44px 42px 34px;
          box-shadow: 0 14px 40px rgba(0, 0, 0, 0.05);
        }

        .customer-login-icon {
          width: 52px;
          height: 52px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: #f1f1ee;
          margin-bottom: 24px;
        }

        .customer-login-eyebrow {
          margin: 0 0 10px;
          font-size: 10px;
          line-height: 1;
          font-weight: 700;
          letter-spacing: 2.2px;
          text-transform: uppercase;
          color: #777773;
        }

        .customer-login-heading h1 {
          margin: 0;
          font-size: 38px;
          line-height: 1.08;
          letter-spacing: -1.6px;
          font-weight: 800;
        }

        .customer-login-heading p {
          margin: 14px 0 0;
          color: #777773;
          font-size: 14px;
          line-height: 1.7;
        }

        .customer-login-error {
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

        .customer-login-form {
          margin-top: 28px;
        }

        .customer-login-field {
          margin-bottom: 19px;
        }

        .customer-login-field label {
          display: block;
          margin-bottom: 8px;
          font-size: 12px;
          font-weight: 700;
          color: #262624;
        }

        .customer-login-input-wrap {
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

        .customer-login-input-wrap:focus-within {
          border-color: #111111;
          box-shadow: 0 0 0 3px rgba(17, 17, 17, 0.06);
        }

        .customer-login-input-wrap svg {
          color: #777773;
          flex-shrink: 0;
        }

        .customer-login-input-wrap input {
          width: 100%;
          height: 100%;
          border: 0;
          outline: 0;
          background: transparent;
          color: #111111;
          font-size: 14px;
          font-family: inherit;
        }

        .customer-login-input-wrap input::placeholder {
          color: #aaaaa5;
        }

        .customer-login-submit {
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
          margin-top: 5px;
        }

        .customer-login-submit:hover:not(:disabled) {
          background: #2a2a2a;
        }

        .customer-login-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .customer-login-register {
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

        .customer-login-register a {
          color: #111111;
          font-weight: 700;
          text-decoration: none;
        }

        .customer-login-register a:hover {
          text-decoration: underline;
        }

        .customer-login-back {
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

        .customer-login-back:hover {
          color: #111111;
        }

        .customer-login-security {
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

        .customer-login-security svg {
          flex-shrink: 0;
        }

        @media (max-width: 640px) {
          .customer-login-header-inner {
            width: calc(100% - 28px);
          }

          .customer-login-shop-link {
            padding: 9px 11px;
          }

          .customer-login-main {
            padding: 35px 14px;
          }

          .customer-login-card {
            padding: 34px 24px 28px;
          }

          .customer-login-heading h1 {
            font-size: 32px;
          }
        }
      `}</style>

      {/* =================================================
          HEADER
      ================================================= */}

      <header className="customer-login-header">

        <div className="customer-login-header-inner">

          <Link
            to="/"
            className="customer-login-logo"
          >
            Veylix
          </Link>

          <Link
            to="/shop"
            className="customer-login-shop-link"
          >
            <ShoppingBag size={16} />
            Continue Shopping
          </Link>

        </div>

      </header>

      {/* =================================================
          MAIN
      ================================================= */}

      <main className="customer-login-main">

        <div className="customer-login-card">

          {/* ICON */}

          <div className="customer-login-icon">
            <User size={24} />
          </div>

          {/* HEADING */}

          <div className="customer-login-heading">

            <p className="customer-login-eyebrow">
              VEYLIX ACCOUNT
            </p>

            <h1>
              Welcome back
            </h1>

            <p>
              Login to view your orders
              and manage your Veylix account.
            </p>

          </div>

          {/* ERROR */}

          {error && (
            <div className="customer-login-error">
              <strong>
                Login failed
              </strong>

              <span>
                {error}
              </span>
            </div>
          )}

          {/* FORM */}

          <form
            className="customer-login-form"
            onSubmit={handleSubmit}
          >

            <div className="customer-login-field">

              <label htmlFor="customer-email">
                Email address
              </label>

              <div className="customer-login-input-wrap">

                <Mail size={17} />

                <input
                  id="customer-email"
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

            <div className="customer-login-field">

              <label htmlFor="customer-password">
                Password
              </label>

              <div className="customer-login-input-wrap">

                <LockKeyhole size={17} />

                <input
                  id="customer-password"
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  value={
                    formData.password
                  }
                  onChange={
                    handleChange
                  }
                  autoComplete="current-password"
                />

              </div>

            </div>

            <button
              type="submit"
              className="customer-login-submit"
              disabled={
                isSubmitting
              }
            >
              {isSubmitting
                ? "Signing in..."
                : "Sign In"}
            </button>

          </form>

          {/* REGISTER */}

          <div className="customer-login-register">

            <span>
              Don't have an account?
            </span>

            <Link
              to="/customer/register"
            >
              Create one
            </Link>

          </div>

          {/* BACK */}

          <Link
            to="/"
            className="customer-login-back"
          >
            <ArrowLeft size={15} />
            Back to home
          </Link>

          {/* SECURITY */}

          <div className="customer-login-security">

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

export default CustomerLogin;