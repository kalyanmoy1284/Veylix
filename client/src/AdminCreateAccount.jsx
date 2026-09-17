import React, { useState } from "react";
import { ArrowLeft, LockKeyhole, Mail, UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";

function AdminCreateAccount() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "employee",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    setError("");
    setMessage("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (loading) return;

    const name = formData.name.trim();
    const email = formData.email.trim().toLowerCase();

    if (!name || !email || !formData.password || !formData.role) {
      setError("Please fill in all fields.");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setMessage("");

      const token = localStorage.getItem("veylix_admin_token");

      if (!token) {
        navigate("/admin/login", { replace: true });
        return;
      }

      const response = await fetch(
        "https://veylix-backend-production.up.railway.app/api/auth/admin/create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name,
            email,
            password: formData.password,
            role: formData.role,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Account creation failed."
        );
      }

      setMessage("Account created successfully.");

      setFormData({
        name: "",
        email: "",
        password: "",
        role: "employee",
      });
    } catch (createError) {
      console.error("Create account error:", createError);
      setError(
        createError.message || "Account creation failed."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-create-account-page">
      <style>{`
        .admin-create-account-page {
          min-height: 100vh;
          padding: 42px;
          background: #f5f5f2;
          box-sizing: border-box;
        }

        .admin-create-account-shell {
          max-width: 760px;
          margin: 0 auto;
        }

        .admin-create-account-back {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          border: 0;
          background: transparent;
          padding: 0;
          margin-bottom: 28px;
          cursor: pointer;
          color: #555550;
          font-family: inherit;
          font-size: 11px;
          font-weight: 700;
        }

        .admin-create-account-card {
          background: #ffffff;
          border: 1px solid #e1e1dc;
          padding: 34px;
        }

        .admin-create-account-heading {
          margin-bottom: 28px;
        }

        .admin-create-account-heading .section-label {
          margin: 0 0 8px;
          color: #898984;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 1px;
        }

        .admin-create-account-heading h1 {
          margin: 0;
          font-size: 28px;
          line-height: 1.15;
        }

        .admin-create-account-heading p:last-child {
          margin: 10px 0 0;
          color: #777771;
          font-size: 12px;
        }

        .admin-create-account-form {
          display: grid;
          gap: 17px;
        }

        .admin-create-account-row {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 15px;
        }

        .admin-create-account-field label {
          display: block;
          margin-bottom: 7px;
          color: #363632;
          font-size: 10px;
          font-weight: 700;
        }

        .admin-create-account-input {
          width: 100%;
          min-height: 44px;
          box-sizing: border-box;
          padding: 0 12px;
          border: 1px solid #d9d9d4;
          background: #fff;
          color: #111;
          font: inherit;
          outline: none;
        }

        .admin-create-account-input:focus {
          border-color: #111;
        }

        .admin-create-account-message,
        .admin-create-account-error {
          padding: 12px;
          font-size: 11px;
        }

        .admin-create-account-message {
          background: #edf6ef;
          color: #31724a;
        }

        .admin-create-account-error {
          background: #fdebea;
          color: #9a3c32;
        }

        .admin-create-account-submit {
          min-height: 46px;
          border: 0;
          background: #111;
          color: #fff;
          cursor: pointer;
          font-family: inherit;
          font-size: 11px;
          font-weight: 800;
        }

        .admin-create-account-submit:disabled {
          opacity: .6;
          cursor: not-allowed;
        }

        @media (max-width: 650px) {
          .admin-create-account-page {
            padding: 20px;
          }

          .admin-create-account-card {
            padding: 22px;
          }

          .admin-create-account-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="admin-create-account-shell">
        <button
          type="button"
          className="admin-create-account-back"
          onClick={() => navigate("/admin")}
        >
          <ArrowLeft size={15} />
          Back to Dashboard
        </button>

        <div className="admin-create-account-card">
          <div className="admin-create-account-heading">
            <p className="section-label">STAFF MANAGEMENT</p>
            <h1>Create Account</h1>
            <p>
              Create an Admin, Manager or Employee account.
            </p>
          </div>

          {error && (
            <div className="admin-create-account-error">
              {error}
            </div>
          )}

          {message && (
            <div className="admin-create-account-message">
              {message}
            </div>
          )}

          <form
            className="admin-create-account-form"
            onSubmit={handleSubmit}
          >
            <div className="admin-create-account-row">
              <div className="admin-create-account-field">
                <label htmlFor="create-name">Full name</label>
                <input
                  id="create-name"
                  name="name"
                  type="text"
                  placeholder="Enter full name"
                  value={formData.name}
                  onChange={handleChange}
                  className="admin-create-account-input"
                  autoComplete="name"
                />
              </div>

              <div className="admin-create-account-field">
                <label htmlFor="create-email">Email address</label>
                <input
                  id="create-email"
                  name="email"
                  type="email"
                  placeholder="name@veylix.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="admin-create-account-input"
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="admin-create-account-row">
              <div className="admin-create-account-field">
                <label htmlFor="create-password">Password</label>
                <input
                  id="create-password"
                  name="password"
                  type="password"
                  placeholder="Minimum 6 characters"
                  value={formData.password}
                  onChange={handleChange}
                  className="admin-create-account-input"
                  autoComplete="new-password"
                />
              </div>

              <div className="admin-create-account-field">
                <label htmlFor="create-role">Role</label>
                <select
                  id="create-role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="admin-create-account-input"
                >
                  <option value="employee">Employee</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="admin-create-account-submit"
              disabled={loading}
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AdminCreateAccount;
