import React, { useState } from "react";
import { LockKeyhole, Mail, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

function AdminLogin() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (loading) {
      return;
    }

    if (!formData.email.trim()) {
      setError("Please enter your email.");
      return;
    }

    if (!formData.password) {
      setError("Please enter your password.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "http://localhost:5000/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: formData.email.trim().toLowerCase(),
            password: formData.password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Login failed."
        );
      }

      localStorage.setItem(
        "veylix_admin_token",
        data.token
      );

      localStorage.setItem(
        "veylix_admin_user",
        JSON.stringify(data.user)
      );

      navigate("/admin");
    } catch (loginError) {
      console.error(
        "Admin login error:",
        loginError
      );

      setError(
        loginError.message ||
          "Unable to login. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <div className="admin-login-brand">
          <h1>Veylix</h1>

          <span>ADMIN</span>
        </div>

        <div className="admin-login-heading">
          <p className="section-label">
            STAFF PORTAL
          </p>

          <h2>
            Welcome back.
          </h2>

          <p>
            Sign in to manage your store,
            orders and inventory.
          </p>
        </div>

        <form
          className="admin-login-form"
          onSubmit={handleSubmit}
        >
          <div className="admin-form-field">
            <label htmlFor="admin-email">
              Email address
            </label>

            <div className="admin-input-wrapper">
              <Mail size={18} />

              <input
                id="admin-email"
                name="email"
                type="email"
                placeholder="admin@veylix.com"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
              />
            </div>
          </div>

          <div className="admin-form-field">
            <label htmlFor="admin-password">
              Password
            </label>

            <div className="admin-input-wrapper">
              <LockKeyhole size={18} />

              <input
                id="admin-password"
                name="password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                autoComplete="current-password"
              />
            </div>
          </div>

          {error && (
            <div className="admin-login-error">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="admin-login-button"
            disabled={loading}
          >
            {loading ? (
              "Signing in..."
            ) : (
              <>
                Sign in
                <ArrowRight size={17} />
              </>
            )}
          </button>
        </form>

        <div className="admin-login-footer">
          <span>
            Veylix Management System
          </span>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;