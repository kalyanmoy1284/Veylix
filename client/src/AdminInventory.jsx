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
} from "lucide-react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

function AdminInventory() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] = useState("");

  /* =====================================================
     LOAD INVENTORY
  ===================================================== */

  const loadInventory = async (
    showRefreshing = false
  ) => {
    try {
      if (showRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await fetch(
        "http://localhost:5000/api/products"
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Failed to load inventory."
        );
      }

      setProducts(
        Array.isArray(data.products)
          ? data.products
          : []
      );
    } catch (inventoryError) {
      console.error(
        "Inventory error:",
        inventoryError
      );

      setError(
        inventoryError.message ||
          "Unable to load inventory."
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

    loadInventory();
  }, [navigate]);

  /* =====================================================
     FILTER
  ===================================================== */

  const filteredProducts = useMemo(() => {
    const query =
      searchTerm.trim().toLowerCase();

    if (!query) {
      return products;
    }

    return products.filter(
      (product) => {
        const name = String(
          product.name || ""
        ).toLowerCase();

        const sku = String(
          product.sku || ""
        ).toLowerCase();

        const category = String(
          product.category || ""
        ).toLowerCase();

        return (
          name.includes(query) ||
          sku.includes(query) ||
          category.includes(query)
        );
      }
    );
  }, [
    products,
    searchTerm,
  ]);

  /* =====================================================
     INVENTORY STATISTICS
  ===================================================== */

  const inventoryStats = useMemo(() => {
    const totalProducts =
      products.length;

    const totalUnits =
      products.reduce(
        (total, product) =>
          total +
          Number(
            product.stock_quantity || 0
          ),
        0
      );

    const lowStock =
      products.filter((product) => {
        const stock = Number(
          product.stock_quantity || 0
        );

        const threshold = Number(
          product.low_stock_threshold || 0
        );

        return (
          stock > 0 &&
          stock <= threshold
        );
      }).length;

    const outOfStock =
      products.filter(
        (product) =>
          Number(
            product.stock_quantity || 0
          ) <= 0
      ).length;

    const healthyStock =
      products.filter((product) => {
        const stock = Number(
          product.stock_quantity || 0
        );

        const threshold = Number(
          product.low_stock_threshold || 0
        );

        return stock > threshold;
      }).length;

    return {
      totalProducts,
      totalUnits,
      lowStock,
      outOfStock,
      healthyStock,
    };
  }, [products]);

  /* =====================================================
     STOCK STATUS
  ===================================================== */

  const getStockStatus = (
    product
  ) => {
    const stock = Number(
      product.stock_quantity || 0
    );

    const threshold = Number(
      product.low_stock_threshold || 0
    );

    if (stock <= 0) {
      return {
        label: "Out of stock",
        className: "out",
      };
    }

    if (stock <= threshold) {
      return {
        label: "Low stock",
        className: "low",
      };
    }

    return {
      label: "Healthy stock",
      className: "healthy",
    };
  };

  /* =====================================================
     PRODUCT VALUE
  ===================================================== */

  const getStockValue = (
    product
  ) => {
    const stock = Number(
      product.stock_quantity || 0
    );

    const cost = Number(
      product.cost_price || 0
    );

    return stock * cost;
  };

  const totalInventoryValue =
    products.reduce(
      (total, product) =>
        total +
        getStockValue(product),
      0
    );

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <div className="admin-dashboard-page">
        <div className="admin-dashboard-loading">
          <div className="admin-loading-spinner" />

          <h2>
            Loading inventory...
          </h2>

          <p>
            Checking current stock levels.
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
            className="admin-nav-item active"
          >
            <Box size={18} />

            Inventory
          </button>

          <button
            type="button"
            className="admin-nav-item"
            onClick={() =>
              navigate("/admin/pos")
            }
          >
            <Package size={18} />

            New Sale
          </button>

          <button
            type="button"
            className="admin-nav-item"
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
              navigate(
                "/admin/customers"
              )
            }
          >
            <Package size={18} />

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
              STOCK CONTROL
            </p>

            <h2>
              Inventory
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
            STATS
        ================================================= */}

        <section className="admin-stats-grid">

          <div className="admin-stat-card">
            <div className="admin-stat-icon">
              <Package size={20} />
            </div>

            <div>
              <span>
                Products
              </span>

              <strong>
                {
                  inventoryStats.totalProducts
                }
              </strong>
            </div>
          </div>

          <div className="admin-stat-card">
            <div className="admin-stat-icon">
              <Box size={20} />
            </div>

            <div>
              <span>
                Total Units
              </span>

              <strong>
                {
                  inventoryStats.totalUnits
                }
              </strong>
            </div>
          </div>

          <div
            className={`admin-stat-card ${
              inventoryStats.lowStock > 0
                ? "warning"
                : ""
            }`}
          >
            <div className="admin-stat-icon">
              <AlertTriangle size={20} />
            </div>

            <div>
              <span>
                Low Stock
              </span>

              <strong>
                {
                  inventoryStats.lowStock
                }
              </strong>
            </div>
          </div>

          <div
            className={`admin-stat-card ${
              inventoryStats.outOfStock > 0
                ? "warning"
                : ""
            }`}
          >
            <div className="admin-stat-icon">
              <Package size={20} />
            </div>

            <div>
              <span>
                Out of Stock
              </span>

              <strong>
                {
                  inventoryStats.outOfStock
                }
              </strong>
            </div>
          </div>

        </section>

        {/* =================================================
            INVENTORY PANEL
        ================================================= */}

        <section
          className="admin-panel"
          style={{
            marginTop: "18px",
          }}
        >

          <div className="admin-products-toolbar">

            <div>
              <p className="section-label">
                STOCK OVERVIEW
              </p>

              <h3>
                Current Inventory
              </h3>
            </div>

            <div className="admin-products-tools">

              <div className="admin-products-search">

                <Search size={16} />

                <input
                  type="text"
                  placeholder="Search product, SKU or category..."
                  value={searchTerm}
                  onChange={(event) =>
                    setSearchTerm(
                      event.target.value
                    )
                  }
                />

              </div>

              <button
                type="button"
                className="admin-refresh-button"
                onClick={() =>
                  loadInventory(true)
                }
                disabled={refreshing}
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

          {/* =================================================
              INVENTORY SUMMARY
          ================================================= */}

          <div className="admin-inventory-summary">

            <div>
              <span>
                Healthy
              </span>

              <strong>
                {
                  inventoryStats.healthyStock
                }
              </strong>
            </div>

            <div>
              <span>
                Low Stock
              </span>

              <strong>
                {
                  inventoryStats.lowStock
                }
              </strong>
            </div>

            <div>
              <span>
                Out of Stock
              </span>

              <strong>
                {
                  inventoryStats.outOfStock
                }
              </strong>
            </div>

            <div>
              <span>
                Inventory Cost Value
              </span>

              <strong>
                ৳{" "}
                {totalInventoryValue.toLocaleString()}
              </strong>
            </div>

          </div>

          {/* =================================================
              INVENTORY TABLE
          ================================================= */}

          {filteredProducts.length === 0 ? (

            <div className="admin-empty-state">

              <Package size={30} />

              <p>
                No inventory items found.
              </p>

            </div>

          ) : (

            <div className="admin-table-wrapper">

              <table className="admin-table admin-products-table">

                <thead>
                  <tr>

                    <th>
                      Product
                    </th>

                    <th>
                      SKU
                    </th>

                    <th>
                      Category
                    </th>

                    <th>
                      Stock
                    </th>

                    <th>
                      Threshold
                    </th>

                    <th>
                      Stock Value
                    </th>

                    <th>
                      Status
                    </th>

                  </tr>
                </thead>

                <tbody>

                  {filteredProducts.map(
                    (product) => {

                      const stockStatus =
                        getStockStatus(
                          product
                        );

                      return (
                        <tr
                          key={
                            product.id
                          }
                        >

                          {/* PRODUCT */}

                          <td>

                            <div className="admin-product-cell">

                              <div className="admin-product-image">

                                <img
                                  src={
                                    product.image
                                  }
                                  alt={
                                    product.name
                                  }
                                />

                              </div>

                              <div className="admin-product-cell-info">

                                <strong>
                                  {
                                    product.name
                                  }
                                </strong>

                                <span>
                                  ID:{" "}
                                  {
                                    product.id
                                  }
                                </span>

                              </div>

                            </div>

                          </td>

                          {/* SKU */}

                          <td>

                            <span className="admin-sku">
                              {
                                product.sku ||
                                "N/A"
                              }
                            </span>

                          </td>

                          {/* CATEGORY */}

                          <td>

                            <span>
                              {
                                product.category ||
                                "Uncategorized"
                              }
                            </span>

                          </td>

                          {/* STOCK */}

                          <td>

                            <div className="admin-stock-cell">

                              <strong>
                                {
                                  product.stock_quantity
                                }
                              </strong>

                              <span>
                                units
                              </span>

                            </div>

                          </td>

                          {/* THRESHOLD */}

                          <td>

                            <span>
                              {
                                product.low_stock_threshold ||
                                0
                              }{" "}
                              units
                            </span>

                          </td>

                          {/* STOCK VALUE */}

                          <td>

                            <strong>
                              ৳{" "}
                              {getStockValue(
                                product
                              ).toLocaleString()}
                            </strong>

                          </td>

                          {/* STATUS */}

                          <td>

                            <span
                              className={`admin-stock-status ${stockStatus.className}`}
                            >
                              {
                                stockStatus.label
                              }
                            </span>

                          </td>

                        </tr>
                      );
                    }
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

export default AdminInventory;