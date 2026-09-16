import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ArrowLeft,
  Box,
  Package,
  RefreshCw,
  Search,
  AlertTriangle,
  Plus,
  Pencil,
  Power,
  X,
  Save,
  Upload,
  Image as ImageIcon,
} from "lucide-react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

function AdminProducts() {
  const navigate = useNavigate();

  const [products, setProducts] =
    useState([]);

  const [categories, setCategories] =
    useState([]);

  const [searchTerm, setSearchTerm] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [showModal, setShowModal] =
    useState(false);

  const [editingProduct, setEditingProduct] =
    useState(null);

  const [imageFile, setImageFile] =
    useState(null);

  const [imagePreview, setImagePreview] =
    useState("");

  const [imageUploading, setImageUploading] =
    useState(false);

  const emptyForm = {
    name: "",
    sku: "",
    description: "",
    price: "",
    cost_price: "",
    stock_quantity: "",
    low_stock_threshold: "5",
    image: "",
    category_id: "",
    is_active: true,
  };

  const [form, setForm] =
    useState(emptyForm);

  /*
  =========================================================
  AUTH
  =========================================================
  */

  const getToken = () => {
    return localStorage.getItem(
      "veylix_admin_token"
    );
  };

  const handleUnauthorized = () => {
    localStorage.removeItem(
      "veylix_admin_token"
    );

    localStorage.removeItem(
      "veylix_admin_user"
    );

    navigate("/admin/login", {
      replace: true,
    });
  };

  /*
  =========================================================
  LOAD PRODUCTS
  =========================================================
  */

  const loadProducts = async (
    showRefreshing = false
  ) => {
    try {
      if (showRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const token = getToken();

      if (!token) {
        handleUnauthorized();
        return;
      }

      const response = await fetch(
        "http://localhost:5000/api/products/admin",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data =
        await response.json();

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            "Failed to load products."
        );
      }

      setProducts(
        Array.isArray(
          data.products
        )
          ? data.products
          : []
      );
    } catch (productError) {
      console.error(
        "Admin products error:",
        productError
      );

      setError(
        productError.message ||
          "Unable to load products."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /*
  =========================================================
  LOAD CATEGORIES
  =========================================================
  */

  const loadCategories =
    async () => {
      try {
        const token =
          getToken();

        if (!token) {
          handleUnauthorized();
          return;
        }

        const response =
          await fetch(
            "http://localhost:5000/api/products/categories",
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

        const data =
          await response.json();

        if (
          response.status ===
          401
        ) {
          handleUnauthorized();
          return;
        }

        if (
          !response.ok ||
          !data.success
        ) {
          throw new Error(
            data.message ||
              "Failed to load categories."
          );
        }

        setCategories(
          Array.isArray(
            data.categories
          )
            ? data.categories
            : []
        );
      } catch (categoryError) {
        console.error(
          "Categories error:",
          categoryError
        );

        setError(
          categoryError.message ||
            "Unable to load categories."
        );
      }
    };

  /*
  =========================================================
  INITIAL LOAD
  =========================================================
  */

  useEffect(() => {
    const token =
      localStorage.getItem(
        "veylix_admin_token"
      );

    const savedUser =
      localStorage.getItem(
        "veylix_admin_user"
      );

    if (
      !token ||
      !savedUser
    ) {
      navigate(
        "/admin/login",
        {
          replace: true,
        }
      );

      return;
    }

    loadProducts();
    loadCategories();
  }, [navigate]);

  /*
  =========================================================
  FILTER
  =========================================================
  */

  const filteredProducts =
    useMemo(() => {
      const query =
        searchTerm
          .trim()
          .toLowerCase();

      if (!query) {
        return products;
      }

      return products.filter(
        (product) => {
          const name =
            String(
              product.name || ""
            ).toLowerCase();

          const sku =
            String(
              product.sku || ""
            ).toLowerCase();

          const category =
            String(
              product.category ||
                ""
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

  /*
  =========================================================
  STATISTICS
  =========================================================
  */

  const totalProducts =
    products.length;

  const totalStock =
    products.reduce(
      (total, product) =>
        total +
        Number(
          product.stock_quantity ||
            0
        ),
      0
    );

  const lowStockProducts =
    products.filter(
      (product) =>
        Number(
          product.stock_quantity ||
            0
        ) <=
        Number(
          product.low_stock_threshold ||
            0
        )
    ).length;

  const activeProducts =
    products.filter(
      (product) =>
        Boolean(
          product.is_active
        )
    ).length;

  /*
  =========================================================
  FORM HELPERS
  =========================================================
  */

  const formatPrice = (
    value
  ) => {
    return `৳ ${Number(
      value || 0
    ).toLocaleString(
      "en-BD"
    )}`;
  };

  const getStockStatus = (
    product
  ) => {
    const stock =
      Number(
        product.stock_quantity ||
          0
      );

    const threshold =
      Number(
        product.low_stock_threshold ||
          0
      );

    if (stock <= 0) {
      return {
        label:
          "Out of stock",
        className:
          "out",
      };
    }

    if (
      stock <= threshold
    ) {
      return {
        label:
          "Low stock",
        className:
          "low",
      };
    }

    return {
      label:
        "In stock",
      className:
        "healthy",
    };
  };

  /*
  =========================================================
  OPEN ADD MODAL
  =========================================================
  */

  const openAddModal = () => {
    setEditingProduct(
      null
    );

    setForm(
      emptyForm
    );
    setImageFile(null);
    setImagePreview("");

    setError("");
    setSuccess("");

    setShowModal(true);
  };

  /*
  =========================================================
  OPEN EDIT MODAL
  =========================================================
  */

  const openEditModal = (
    product
  ) => {
    setEditingProduct(
      product
    );

    setForm({
      name:
        product.name || "",
      sku:
        product.sku || "",
      description:
        product.description ||
        "",
      price:
        product.price ?? "",
      cost_price:
        product.cost_price ??
        "",
      stock_quantity:
        product.stock_quantity ??
        "",
      low_stock_threshold:
        product.low_stock_threshold ??
        5,
      image:
        product.image || "",
      category_id:
        product.category_id ??
        "",
      is_active:
        Boolean(
          product.is_active
        ),
    });

    setImageFile(null);
    setImagePreview(product.image || "");

    setError("");
    setSuccess("");

    setShowModal(true);
  };

  /*
  =========================================================
  CLOSE MODAL
  =========================================================
  */

  const closeModal = () => {
    if (saving) {
      return;
    }

    setShowModal(false);
    setEditingProduct(
      null
    );

    setForm(
      emptyForm
    );
    setImageFile(null);
    setImagePreview("");
  };

  /*
  =========================================================
  FORM INPUT
  =========================================================
  */

  const handleFormChange = (
    event
  ) => {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setForm(
      (current) => ({
        ...current,
        [name]:
          type === "checkbox"
            ? checked
            : value,
      })
    );
  };

  /*
  =========================================================
  IMAGE UPLOAD
  =========================================================
  */

  const handleImageChange = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be 5 MB or smaller.");
      event.target.value = "";
      return;
    }

    const localPreview = URL.createObjectURL(file);
    setImageFile(file);
    setImagePreview(localPreview);
    setError("");

    try {
      setImageUploading(true);

      const token = getToken();

      if (!token) {
        handleUnauthorized();
        return;
      }

      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch(
        "http://localhost:5000/api/uploads/product-image",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      if (!response.ok || !data.success || !data.url) {
        throw new Error(
          data.message || "Image upload failed."
        );
      }

      setForm((current) => ({
        ...current,
        image: data.url,
      }));
      setImagePreview(data.url);
    } catch (uploadError) {
      console.error("Product image upload error:", uploadError);
      setImageFile(null);
      setImagePreview(form.image || "");
      setError(
        uploadError.message ||
          "Unable to upload product image."
      );
    } finally {
      setImageUploading(false);
      event.target.value = "";
    }
  };

  /*
  =========================================================
  SAVE PRODUCT
  =========================================================
  */

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    if (imageUploading) {
      setError("Please wait for the image upload to finish.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const token =
        getToken();

      if (!token) {
        handleUnauthorized();
        return;
      }

      const payload = {
        name:
          form.name.trim(),
        sku:
          form.sku.trim(),
        description:
          form.description.trim(),
        price:
          Number(form.price),
        cost_price:
          Number(
            form.cost_price || 0
          ),
        stock_quantity:
          Number(
            form.stock_quantity
          ),
        low_stock_threshold:
          Number(
            form.low_stock_threshold
          ),
        image:
          form.image.trim(),
        category_id:
          Number(
            form.category_id
          ),
        is_active:
          Boolean(
            form.is_active
          ),
      };

      const editing =
        Boolean(
          editingProduct
        );

      const url = editing
        ? `http://localhost:5000/api/products/${editingProduct.id}`
        : "http://localhost:5000/api/products";

      const response =
        await fetch(url, {
          method: editing
            ? "PUT"
            : "POST",
          headers: {
            "Content-Type":
              "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(
            payload
          ),
        });

      const data =
        await response.json();

      if (
        response.status ===
        401
      ) {
        handleUnauthorized();
        return;
      }

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            "Failed to save product."
        );
      }

      setSuccess(
        editing
          ? "Product updated successfully."
          : "Product added successfully."
      );

      setShowModal(false);
      setEditingProduct(
        null
      );
      setForm(
        emptyForm
      );
      setImageFile(null);
      setImagePreview("");

      await loadProducts(
        true
      );
    } catch (saveError) {
      console.error(
        "Save product error:",
        saveError
      );

      setError(
        saveError.message ||
          "Unable to save product."
      );
    } finally {
      setSaving(false);
    }
  };

  /*
  =========================================================
  CHANGE ACTIVE STATUS
  =========================================================
  */

  const handleStatusChange =
    async (product) => {
      const nextStatus =
        !Boolean(
          product.is_active
        );

      const message =
        nextStatus
          ? `Reactivate "${product.name}"?`
          : `Deactivate "${product.name}"?`;

      const confirmed =
        window.confirm(
          message
        );

      if (!confirmed) {
        return;
      }

      try {
        setError("");
        setSuccess("");

        const token =
          getToken();

        if (!token) {
          handleUnauthorized();
          return;
        }

        const response =
          await fetch(
            `http://localhost:5000/api/products/${product.id}/status`,
            {
              method:
                "PATCH",
              headers: {
                "Content-Type":
                  "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify(
                {
                  is_active:
                    nextStatus,
                }
              ),
            }
          );

        const data =
          await response.json();

        if (
          response.status ===
          401
        ) {
          handleUnauthorized();
          return;
        }

        if (
          !response.ok ||
          !data.success
        ) {
          throw new Error(
            data.message ||
              "Failed to update product status."
          );
        }

        setSuccess(
          nextStatus
            ? "Product reactivated successfully."
            : "Product deactivated successfully."
        );

        await loadProducts(
          true
        );
      } catch (statusError) {
        console.error(
          "Product status error:",
          statusError
        );

        setError(
          statusError.message ||
            "Unable to update product status."
        );
      }
    };

  /*
  =========================================================
  LOADING
  =========================================================
  */

  if (loading) {
    return (
      <div className="admin-dashboard-page">
        <div className="admin-dashboard-loading">
          <div className="admin-loading-spinner" />

          <h2>
            Loading products...
          </h2>

          <p>
            Fetching product
            inventory from Veylix.
          </p>
        </div>
      </div>
    );
  }

  /*
  =========================================================
  RENDER
  =========================================================
  */

  return (
    <div className="admin-dashboard-page">
      {/* SIDEBAR */}

      <aside className="admin-sidebar">
        <div className="admin-sidebar-brand">
          <div>
            <img
              src="/assets/logo-dark.svg"
              alt="Veylix"
              style={{
                width:
                  "120px",
                height:
                  "auto",
                marginBottom:
                  "8px",
              }}
            />

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
              navigate(
                "/admin"
              )
            }
          >
            <Box size={18} />

            Dashboard
          </button>

          <button
            type="button"
            className="admin-nav-item active"
          >
            <Package
              size={18}
            />

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
            <Box size={18} />

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
            <Package
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
            <Package
              size={18}
            />

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
            <Package
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
                  replace:
                    true,
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

      {/* MAIN */}

      <main className="admin-main">
        <header className="admin-topbar">
          <div>
            <p className="admin-topbar-label">
              INVENTORY CATALOG
            </p>

            <h2>
              Products
            </h2>
          </div>

          <div
            style={{
              display:
                "flex",
              gap: "10px",
            }}
          >
            <button
              type="button"
              className="primary-button"
              onClick={
                openAddModal
              }
            >
              <Plus
                size={16}
              />
              Add Product
            </button>

            <Link
              to="/admin"
              className="secondary-button"
            >
              <ArrowLeft
                size={15}
              />

              Dashboard
            </Link>
          </div>
        </header>

        {error && (
          <div className="admin-error-box">
            <AlertTriangle
              size={18}
            />

            <span>
              {error}
            </span>

            <button
              type="button"
              onClick={() =>
                setError("")
              }
              style={{
                marginLeft:
                  "auto",
                border:
                  "none",
                background:
                  "transparent",
                cursor:
                  "pointer",
              }}
            >
              <X size={16} />
            </button>
          </div>
        )}

        {success && (
          <div
            style={{
              marginTop:
                "14px",
              padding:
                "12px 16px",
              border:
                "1px solid #cfe7d5",
              background:
                "#f2faf4",
              color:
                "#26733b",
              display:
                "flex",
              alignItems:
                "center",
              borderRadius:
                "10px",
              fontSize:
                "14px",
            }}
          >
            <span>
              {success}
            </span>

            <button
              type="button"
              onClick={() =>
                setSuccess("")
              }
              style={{
                marginLeft:
                  "auto",
                border:
                  "none",
                background:
                  "transparent",
                cursor:
                  "pointer",
                color:
                  "inherit",
              }}
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* STATS */}

        <section className="admin-stats-grid">
          <div className="admin-stat-card">
            <div className="admin-stat-icon">
              <Package
                size={20}
              />
            </div>

            <div>
              <span>
                Total Products
              </span>

              <strong>
                {totalProducts}
              </strong>
            </div>
          </div>

          <div className="admin-stat-card">
            <div className="admin-stat-icon">
              <Box
                size={20}
              />
            </div>

            <div>
              <span>
                Total Stock Units
              </span>

              <strong>
                {totalStock}
              </strong>
            </div>
          </div>

          <div className="admin-stat-card">
            <div className="admin-stat-icon">
              <AlertTriangle
                size={20}
              />
            </div>

            <div>
              <span>
                Low Stock
              </span>

              <strong>
                {lowStockProducts}
              </strong>
            </div>
          </div>

          <div className="admin-stat-card">
            <div className="admin-stat-icon">
              <Package
                size={20}
              />
            </div>

            <div>
              <span>
                Active Products
              </span>

              <strong>
                {activeProducts}
              </strong>
            </div>
          </div>
        </section>

        {/* PRODUCT PANEL */}

        <section
          className="admin-panel"
          style={{
            marginTop:
              "18px",
          }}
        >
          <div className="admin-products-toolbar">
            <div>
              <p className="section-label">
                PRODUCT CATALOG
              </p>

              <h3>
                All Products
              </h3>
            </div>

            <div className="admin-products-tools">
              <div className="admin-products-search">
                <Search size={16} />

                <input
                  type="text"
                  placeholder="Search product, SKU or category..."
                  value={
                    searchTerm
                  }
                  onChange={(
                    event
                  ) =>
                    setSearchTerm(
                      event.target
                        .value
                    )
                  }
                />
              </div>

              <button
                type="button"
                className="admin-refresh-button"
                onClick={() =>
                  loadProducts(
                    true
                  )
                }
                disabled={
                  refreshing
                }
                title="Refresh products"
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

          {filteredProducts.length ===
          0 ? (
            <div className="admin-empty-state">
              <Package
                size={30}
              />

              <p>
                No products
                found.
              </p>

              <button
                type="button"
                className="primary-button"
                onClick={
                  openAddModal
                }
              >
                <Plus
                  size={16}
                />
                Add Product
              </button>
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
                      Selling Price
                    </th>

                    <th>
                      Cost Price
                    </th>

                    <th>
                      Stock
                    </th>

                    <th>
                      Status
                    </th>

                    <th>
                      Actions
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
                                  onError={(
                                    event
                                  ) => {
                                    event.currentTarget.src =
                                      "/assets/mark.svg";
                                  }}
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

                          <td>
                            <span className="admin-sku">
                              {product.sku ||
                                "N/A"}
                            </span>
                          </td>

                          <td>
                            <span>
                              {product.category ||
                                "Uncategorized"}
                            </span>
                          </td>

                          <td>
                            <strong>
                              {formatPrice(
                                product.price
                              )}
                            </strong>
                          </td>

                          <td>
                            <span>
                              {formatPrice(
                                product.cost_price
                              )}
                            </span>
                          </td>

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

                          <td>
                            <div className="admin-product-status">
                              <span
                                className={`admin-stock-status ${stockStatus.className}`}
                              >
                                {
                                  stockStatus.label
                                }
                              </span>

                              <span
                                className={`admin-active-status ${
                                  product.is_active
                                    ? "active"
                                    : "inactive"
                                }`}
                              >
                                {product.is_active
                                  ? "Active"
                                  : "Inactive"}
                              </span>
                            </div>
                          </td>

                          <td>
                            <div
                              style={{
                                display:
                                  "flex",
                                gap:
                                  "7px",
                                alignItems:
                                  "center",
                              }}
                            >
                              <button
                                type="button"
                                title="Edit product"
                                onClick={() =>
                                  openEditModal(
                                    product
                                  )
                                }
                                style={{
                                  width:
                                    "34px",
                                  height:
                                    "34px",
                                  display:
                                    "flex",
                                  alignItems:
                                    "center",
                                  justifyContent:
                                    "center",
                                  border:
                                    "1px solid #ddd",
                                  background:
                                    "#fff",
                                  cursor:
                                    "pointer",
                                  borderRadius:
                                    "8px",
                                }}
                              >
                                <Pencil
                                  size={
                                    15
                                  }
                                />
                              </button>

                              <button
                                type="button"
                                title={
                                  product.is_active
                                    ? "Deactivate product"
                                    : "Reactivate product"
                                }
                                onClick={() =>
                                  handleStatusChange(
                                    product
                                  )
                                }
                                style={{
                                  width:
                                    "34px",
                                  height:
                                    "34px",
                                  display:
                                    "flex",
                                  alignItems:
                                    "center",
                                  justifyContent:
                                    "center",
                                  border:
                                    "1px solid #ddd",
                                  background:
                                    "#fff",
                                  cursor:
                                    "pointer",
                                  borderRadius:
                                    "8px",
                                }}
                              >
                                <Power
                                  size={
                                    15
                                  }
                                />
                              </button>
                            </div>
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

      {/* PRODUCT MODAL */}

      {showModal && (
        <div
          style={{
            position:
              "fixed",
            inset: 0,
            background:
              "rgba(0,0,0,0.58)",
            display:
              "flex",
            alignItems:
              "center",
            justifyContent:
              "center",
            padding:
              "24px",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              width:
                "min(760px, 100%)",
              maxHeight:
                "90vh",
              overflowY:
                "auto",
              background:
                "#fff",
              borderRadius:
                "16px",
              padding:
                "28px",
              boxShadow:
                "0 25px 70px rgba(0,0,0,0.2)",
            }}
          >
            <div
              style={{
                display:
                  "flex",
                alignItems:
                  "center",
                justifyContent:
                  "space-between",
                marginBottom:
                  "24px",
              }}
            >
              <div>
                <p className="section-label">
                  VEYLIX PRODUCT
                </p>

                <h2
                  style={{
                    margin:
                      0,
                  }}
                >
                  {editingProduct
                    ? "Edit Product"
                    : "Add Product"}
                </h2>
              </div>

              <button
                type="button"
                onClick={
                  closeModal
                }
                disabled={
                  saving
                }
                style={{
                  width:
                    "36px",
                  height:
                    "36px",
                  border:
                    "1px solid #ddd",
                  background:
                    "#fff",
                  borderRadius:
                    "8px",
                  cursor:
                    saving
                      ? "not-allowed"
                      : "pointer",
                  display:
                    "flex",
                  alignItems:
                    "center",
                  justifyContent:
                    "center",
                }}
              >
                <X
                  size={18}
                />
              </button>
            </div>

            <form
              onSubmit={
                handleSubmit
              }
            >
              <div
                style={{
                  display:
                    "grid",
                  gridTemplateColumns:
                    "1fr 1fr",
                  gap:
                    "16px",
                }}
              >
                <div
                  style={{
                    gridColumn:
                      "1 / -1",
                  }}
                >
                  <label>
                    Product Name
                  </label>

                  <input
                    name="name"
                    value={
                      form.name
                    }
                    onChange={
                      handleFormChange
                    }
                    placeholder="Example: Premium Casual Shirt"
                    required
                    style={
                      inputStyle
                    }
                  />
                </div>

                <div>
                  <label>
                    SKU
                  </label>

                  <input
                    name="sku"
                    value={
                      form.sku
                    }
                    onChange={
                      handleFormChange
                    }
                    placeholder="VLX-SHIRT-003"
                    required
                    style={
                      inputStyle
                    }
                  />
                </div>

                <div>
                  <label>
                    Category
                  </label>

                  <select
                    name="category_id"
                    value={
                      form.category_id
                    }
                    onChange={
                      handleFormChange
                    }
                    required
                    style={
                      inputStyle
                    }
                  >
                    <option value="">
                      Select category
                    </option>

                    {categories.map(
                      (
                        category
                      ) => (
                        <option
                          key={
                            category.id
                          }
                          value={
                            category.id
                          }
                        >
                          {
                            category.name
                          }
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div>
                  <label>
                    Selling Price
                  </label>

                  <input
                    type="number"
                    name="price"
                    value={
                      form.price
                    }
                    onChange={
                      handleFormChange
                    }
                    min="1"
                    step="0.01"
                    placeholder="1990"
                    required
                    style={
                      inputStyle
                    }
                  />
                </div>

                <div>
                  <label>
                    Cost Price
                  </label>

                  <input
                    type="number"
                    name="cost_price"
                    value={
                      form.cost_price
                    }
                    onChange={
                      handleFormChange
                    }
                    min="0"
                    step="0.01"
                    placeholder="1100"
                    style={
                      inputStyle
                    }
                  />
                </div>

                <div>
                  <label>
                    Stock Quantity
                  </label>

                  <input
                    type="number"
                    name="stock_quantity"
                    value={
                      form.stock_quantity
                    }
                    onChange={
                      handleFormChange
                    }
                    min="0"
                    step="1"
                    placeholder="25"
                    required
                    style={
                      inputStyle
                    }
                  />
                </div>

                <div>
                  <label>
                    Low Stock Threshold
                  </label>

                  <input
                    type="number"
                    name="low_stock_threshold"
                    value={
                      form.low_stock_threshold
                    }
                    onChange={
                      handleFormChange
                    }
                    min="0"
                    step="1"
                    placeholder="5"
                    required
                    style={
                      inputStyle
                    }
                  />
                </div>

                <div
                  style={{
                    gridColumn:
                      "1 / -1",
                  }}
                >
                  <label>
                    Product Image
                  </label>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: imagePreview ? "180px 1fr" : "1fr",
                      gap: "16px",
                      alignItems: "start",
                      marginTop: "8px",
                    }}
                  >
                    {imagePreview && (
                      <div
                        style={{
                          width: "180px",
                          aspectRatio: "1 / 1",
                          borderRadius: "12px",
                          overflow: "hidden",
                          border: "1px solid #e5e5e5",
                          background: "#f7f7f7",
                        }}
                      >
                        <img
                          src={imagePreview}
                          alt="Product preview"
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                          onError={(event) => {
                            event.currentTarget.src = "/assets/mark.svg";
                          }}
                        />
                      </div>
                    )}

                    <div>
                      <label
                        htmlFor="product-image-file"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "8px",
                          padding: "11px 14px",
                          border: "1px solid #d8d8d8",
                          borderRadius: "8px",
                          background: "#fff",
                          cursor: imageUploading ? "wait" : "pointer",
                          fontSize: "13px",
                          fontWeight: 600,
                        }}
                      >
                        <Upload size={15} />
                        {imageUploading ? "Uploading image..." : "Upload Image"}
                      </label>

                      <input
                        id="product-image-file"
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/gif"
                        onChange={handleImageChange}
                        disabled={imageUploading || saving}
                        style={{
                          display: "none",
                        }}
                      />

                      <div
                        style={{
                          marginTop: "10px",
                          color: "#777",
                          fontSize: "12px",
                          lineHeight: 1.5,
                        }}
                      >
                        JPG, PNG, WEBP or GIF. Maximum 5 MB.
                      </div>

                      <input
                        type="url"
                        name="image"
                        value={form.image}
                        onChange={handleFormChange}
                        placeholder="Or paste an image URL: https://..."
                        style={inputStyle}
                      />

                      {imageFile && (
                        <div
                          style={{
                            marginTop: "8px",
                            display: "flex",
                            alignItems: "center",
                            gap: "7px",
                            fontSize: "12px",
                            color: "#555",
                          }}
                        >
                          <ImageIcon size={14} />
                          {imageFile.name}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    gridColumn:
                      "1 / -1",
                  }}
                >
                  <label>
                    Description
                  </label>

                  <textarea
                    name="description"
                    value={
                      form.description
                    }
                    onChange={
                      handleFormChange
                    }
                    placeholder="Write product description..."
                    rows="5"
                    style={{
                      ...inputStyle,
                      resize:
                        "vertical",
                    }}
                  />
                </div>

                <div
                  style={{
                    gridColumn:
                      "1 / -1",
                  }}
                >
                  <label
                    style={{
                      display:
                        "flex",
                      alignItems:
                        "center",
                      gap:
                        "10px",
                      cursor:
                        "pointer",
                    }}
                  >
                    <input
                      type="checkbox"
                      name="is_active"
                      checked={
                        form.is_active
                      }
                      onChange={
                        handleFormChange
                      }
                    />

                    Product Active
                  </label>
                </div>
              </div>

              <div
                style={{
                  display:
                    "flex",
                  justifyContent:
                    "flex-end",
                  gap:
                    "10px",
                  marginTop:
                    "24px",
                  paddingTop:
                    "20px",
                  borderTop:
                    "1px solid #eee",
                }}
              >
                <button
                  type="button"
                  className="secondary-button"
                  onClick={
                    closeModal
                  }
                  disabled={
                    saving
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-button"
                  disabled={
                    saving || imageUploading
                  }
                >
                  {saving ? (
                    <>
                      <RefreshCw
                        size={
                          16
                        }
                        className="admin-refresh-spinning"
                      />

                      Saving...
                    </>
                  ) : (
                    <>
                      <Save
                        size={
                          16
                        }
                      />

                      {editingProduct
                        ? "Save Changes"
                        : "Create Product"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const inputStyle = {
  width:
    "100%",
  marginTop:
    "7px",
  padding:
    "11px 12px",
  border:
    "1px solid #dcdcdc",
  borderRadius:
    "8px",
  outline:
    "none",
  fontSize:
    "14px",
  background:
    "#fff",
  boxSizing:
    "border-box",
};

export default AdminProducts;