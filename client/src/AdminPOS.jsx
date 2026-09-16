import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AlertTriangle,
  ArrowLeft,
  Box,
  Check,
  LoaderCircle,
  Minus,
  Package,
  Plus,
  Search,
  ShoppingCart,
  Trash2,
  UserRound,
} from "lucide-react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

function AdminPOS() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");

  const [customerName, setCustomerName] =
    useState("");

  const [customerPhone, setCustomerPhone] =
    useState("");

  const [paymentMethod, setPaymentMethod] =
    useState("cash");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] =
    useState("");

  /* =====================================================
     LOAD PRODUCTS
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

    const loadProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          "http://localhost:5000/api/products"
        );

        const data =
          await response.json();

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
          "POS product loading error:",
          productError
        );

        setError(
          productError.message ||
            "Unable to load products."
        );
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [navigate]);

  /* =====================================================
     SEARCH FILTER
  ===================================================== */

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

          return (
            name.includes(query) ||
            sku.includes(query)
          );
        }
      );
    }, [
      products,
      searchTerm,
    ]);

  /* =====================================================
     CART TOTALS
  ===================================================== */

  const subtotal = useMemo(() => {
    return cartItems.reduce(
      (total, item) =>
        total +
        Number(item.price || 0) *
          Number(item.quantity || 0),
      0
    );
  }, [cartItems]);

  const totalItems = useMemo(() => {
    return cartItems.reduce(
      (total, item) =>
        total +
        Number(
          item.quantity || 0
        ),
      0
    );
  }, [cartItems]);

  const total = subtotal;

  /* =====================================================
     ADD TO POS CART
  ===================================================== */

  const addProduct = (product) => {
    if (submitting) {
      return;
    }

    setError("");
    setSuccessMessage("");

    const existingItem =
      cartItems.find(
        (item) =>
          item.id === product.id
      );

    if (existingItem) {
      if (
        existingItem.quantity >=
        Number(
          product.stock_quantity || 0
        )
      ) {
        setError(
          `${product.name} has no more stock available.`
        );

        return;
      }

      setCartItems(
        (currentItems) =>
          currentItems.map(
            (item) =>
              item.id ===
              product.id
                ? {
                    ...item,
                    quantity:
                      item.quantity +
                      1,
                  }
                : item
          )
      );

      return;
    }

    if (
      Number(
        product.stock_quantity || 0
      ) <= 0
    ) {
      setError(
        `${product.name} is out of stock.`
      );

      return;
    }

    setCartItems(
      (currentItems) => [
        ...currentItems,
        {
          ...product,
          quantity: 1,
        },
      ]
    );
  };

  /* =====================================================
     INCREASE POS QUANTITY
  ===================================================== */

  const increaseQuantity = (
    productId
  ) => {
    if (submitting) {
      return;
    }

    setError("");
    setSuccessMessage("");

    setCartItems(
      (currentItems) =>
        currentItems.map(
          (item) => {
            if (
              item.id !==
              productId
            ) {
              return item;
            }

            const stock = Number(
              item.stock_quantity ||
                0
            );

            if (
              item.quantity >=
              stock
            ) {
              setError(
                `${item.name} has no more stock available.`
              );

              return item;
            }

            return {
              ...item,
              quantity:
                item.quantity + 1,
            };
          }
        )
    );
  };

  /* =====================================================
     DECREASE POS QUANTITY
  ===================================================== */

  const decreaseQuantity = (
    productId
  ) => {
    if (submitting) {
      return;
    }

    setError("");
    setSuccessMessage("");

    setCartItems(
      (currentItems) =>
        currentItems
          .map(
            (item) =>
              item.id ===
              productId
                ? {
                    ...item,
                    quantity:
                      item.quantity -
                      1,
                  }
                : item
          )
          .filter(
            (item) =>
              item.quantity > 0
          )
    );
  };

  /* =====================================================
     REMOVE ITEM
  ===================================================== */

  const removeItem = (
    productId
  ) => {
    if (submitting) {
      return;
    }

    setError("");
    setSuccessMessage("");

    setCartItems(
      (currentItems) =>
        currentItems.filter(
          (item) =>
            item.id !== productId
        )
    );
  };

  /* =====================================================
     CLEAR SALE
  ===================================================== */

  const clearSale = () => {
    if (submitting) {
      return;
    }

    setCartItems([]);
    setCustomerName("");
    setCustomerPhone("");
    setPaymentMethod("cash");
    setError("");
    setSuccessMessage("");
  };

  /* =====================================================
     PRODUCT STOCK TEXT
  ===================================================== */

  const getProductStockText =
    (product) => {
      const stock = Number(
        product.stock_quantity ||
          0
      );

      if (stock <= 0) {
        return "Out of stock";
      }

      return `${stock} units available`;
    };

  /* =====================================================
     COMPLETE SALE
  ===================================================== */

  const completeSale = async () => {
    if (submitting) {
      return;
    }

    setError("");
    setSuccessMessage("");

    if (cartItems.length === 0) {
      setError(
        "Please add at least one product."
      );

      return;
    }

    for (const item of cartItems) {
      const stock = Number(
        item.stock_quantity || 0
      );

      const quantity = Number(
        item.quantity || 0
      );

      if (quantity <= 0) {
        setError(
          `Invalid quantity for ${item.name}.`
        );

        return;
      }

      if (quantity > stock) {
        setError(
          `Not enough stock for ${item.name}.`
        );

        return;
      }
    }

    if (
      customerPhone.trim() &&
      !/^[0-9+\-\s]{7,15}$/.test(
        customerPhone.trim()
      )
    ) {
      setError(
        "Please enter a valid customer phone number."
      );

      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        customer: {
          name:
            customerName.trim() ||
            "Walk-in Customer",

          phone:
            customerPhone.trim() ||
            null,
        },

        items: cartItems.map(
          (item) => ({
            productId: item.id,
            quantity: Number(
              item.quantity
            ),
          })
        ),

        orderType: "pos",

        paymentMethod:
          paymentMethod,
      };

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
        "http://localhost:5000/api/orders",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
            Authorization:
              `Bearer ${token}`,
          },

          body: JSON.stringify(
            payload
          ),
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
            "Failed to complete sale."
        );
      }

      const orderNumber =
        data.order?.orderNumber ||
        data.order?.order_number ||
        "";

      /* ===============================================
         REFRESH PRODUCT STOCK
      =============================================== */

      try {
        const productsResponse =
          await fetch(
            "http://localhost:5000/api/products"
          );

        const productsData =
          await productsResponse.json();

        if (
          productsResponse.ok &&
          productsData.success &&
          Array.isArray(
            productsData.products
          )
        ) {
          setProducts(
            productsData.products
          );
        }
      } catch (refreshError) {
        console.warn(
          "Stock refresh failed after sale:",
          refreshError
        );
      }

      /* ===============================================
         SUCCESS
      =============================================== */

      setCartItems([]);

      setCustomerName("");
      setCustomerPhone("");
      setPaymentMethod("cash");

      setSuccessMessage(
        orderNumber
          ? `Sale completed successfully. Order ${orderNumber}`
          : "Sale completed successfully."
      );

      /* ===============================================
         GO TO SUCCESS PAGE
      =============================================== */

      const successUrl =
        orderNumber
          ? `/order-success?order=${encodeURIComponent(
              orderNumber
            )}&source=pos`
          : "/order-success?source=pos";

      setTimeout(() => {
        navigate(successUrl);
      }, 500);
    } catch (saleError) {
      console.error(
        "Complete sale error:",
        saleError
      );

      setError(
        saleError.message ||
          "Unable to complete sale."
      );
    } finally {
      setSubmitting(false);
    }
  };

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <div className="admin-dashboard-page">
        <div className="admin-dashboard-loading">
          <div className="admin-loading-spinner" />

          <h2>
            Loading POS...
          </h2>

          <p>
            Preparing your sales counter.
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
            className="admin-nav-item active"
          >
            <ShoppingCart
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
            <UserRound
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
                  replace: true,
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

      {/* =================================================
          MAIN
      ================================================= */}

      <main className="admin-main">

        {/* HEADER */}

        <header className="admin-topbar">

          <div>
            <p className="admin-topbar-label">
              POINT OF SALE
            </p>

            <h2>
              New Sale
            </h2>
          </div>

          <Link
            to="/admin"
            className="secondary-button"
          >
            <ArrowLeft
              size={15}
            />

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

        {/* SUCCESS */}

        {successMessage && (
          <div
            className="admin-success-box"
            role="status"
          >
            <Check size={18} />

            <span>
              {successMessage}
            </span>
          </div>
        )}

        {/* =================================================
            POS LAYOUT
        ================================================= */}

        <section className="admin-pos-layout">

          {/* =================================================
              LEFT SIDE
          ================================================= */}

          <div className="admin-pos-products-panel">

            <div className="admin-panel">

              <div className="admin-panel-header">

                <div>
                  <p className="section-label">
                    PRODUCT SELECTION
                  </p>

                  <h3>
                    Add Products
                  </h3>
                </div>

                <span className="admin-pos-count">
                  {filteredProducts.length} products
                </span>

              </div>

              {/* SEARCH */}

              <div className="admin-pos-search">

                <Search size={17} />

                <input
                  type="text"
                  placeholder="Search by product name or SKU..."
                  value={searchTerm}
                  onChange={(
                    event
                  ) =>
                    setSearchTerm(
                      event.target.value
                    )
                  }
                  disabled={
                    submitting
                  }
                />

              </div>

              {/* PRODUCTS */}

              <div className="admin-pos-product-list">

                {filteredProducts.length ===
                0 ? (

                  <div className="admin-empty-state">

                    <Package
                      size={30}
                    />

                    <p>
                      No products found.
                    </p>

                  </div>

                ) : (

                  filteredProducts.map(
                    (product) => {
                      const stock =
                        Number(
                          product.stock_quantity ||
                            0
                        );

                      const disabled =
                        stock <= 0 ||
                        submitting;

                      const cartItem =
                        cartItems.find(
                          (item) =>
                            item.id ===
                            product.id
                        );

                      return (
                        <div
                          key={
                            product.id
                          }
                          className={`admin-pos-product-card ${
                            stock <= 0
                              ? "disabled"
                              : ""
                          }`}
                        >

                          <div className="admin-pos-product-image">

                            <img
                              src={
                                product.image
                              }
                              alt={
                                product.name
                              }
                            />

                          </div>

                          <div className="admin-pos-product-info">

                            <span className="admin-pos-product-category">
                              {
                                product.category
                              }
                            </span>

                            <strong>
                              {
                                product.name
                              }
                            </strong>

                            <span className="admin-pos-product-sku">
                              {
                                product.sku
                              }
                            </span>

                            <div className="admin-pos-product-bottom">

                              <span className="admin-pos-price">
                                ৳{" "}
                                {Number(
                                  product.price ||
                                    0
                                ).toLocaleString()}
                              </span>

                              <span className="admin-pos-stock">
                                {getProductStockText(
                                  product
                                )}
                              </span>

                            </div>

                          </div>

                          <button
                            type="button"
                            className="admin-pos-add-button"
                            onClick={() =>
                              addProduct(
                                product
                              )
                            }
                            disabled={
                              disabled ||
                              Boolean(
                                cartItem &&
                                cartItem.quantity >=
                                  stock
                              )
                            }
                          >

                            {cartItem ? (
                              <Check
                                size={16}
                              />
                            ) : (
                              <Plus
                                size={16}
                              />
                            )}

                            {cartItem
                              ? "Added"
                              : "Add"}

                          </button>

                        </div>
                      );
                    }
                  )

                )}

              </div>

            </div>

          </div>

          {/* =================================================
              RIGHT SIDE
          ================================================= */}

          <div className="admin-pos-sale-panel">

            {/* CUSTOMER */}

            <div className="admin-panel">

              <div className="admin-panel-header">

                <div>
                  <p className="section-label">
                    CUSTOMER
                  </p>

                  <h3>
                    Customer Details
                  </h3>
                </div>

              </div>

              <div className="admin-pos-customer-form">

                <div className="admin-pos-field">

                  <label>
                    Customer name
                    <span>
                      Optional
                    </span>
                  </label>

                  <input
                    type="text"
                    placeholder="Walk-in customer"
                    value={
                      customerName
                    }
                    onChange={(
                      event
                    ) =>
                      setCustomerName(
                        event.target
                          .value
                      )
                    }
                    disabled={
                      submitting
                    }
                  />

                </div>

                <div className="admin-pos-field">

                  <label>
                    Phone number
                    <span>
                      Optional
                    </span>
                  </label>

                  <input
                    type="tel"
                    placeholder="01XXXXXXXXX"
                    value={
                      customerPhone
                    }
                    onChange={(
                      event
                    ) =>
                      setCustomerPhone(
                        event.target
                          .value
                      )
                    }
                    disabled={
                      submitting
                    }
                  />

                </div>

              </div>

            </div>

            {/* CART */}

            <div className="admin-panel admin-pos-cart-panel">

              <div className="admin-panel-header">

                <div>
                  <p className="section-label">
                    CURRENT SALE
                  </p>

                  <h3>
                    Sale Items
                  </h3>
                </div>

                {cartItems.length >
                  0 && (
                  <button
                    type="button"
                    className="admin-clear-sale"
                    onClick={
                      clearSale
                    }
                    disabled={
                      submitting
                    }
                  >
                    Clear
                  </button>
                )}

              </div>

              {cartItems.length ===
              0 ? (

                <div className="admin-pos-empty-cart">

                  <ShoppingCart
                    size={34}
                  />

                  <h4>
                    No products added
                  </h4>

                  <p>
                    Select products from
                    the left to start a
                    sale.
                  </p>

                </div>

              ) : (

                <div className="admin-pos-cart-list">

                  {cartItems.map(
                    (item) => (
                      <div
                        key={
                          item.id
                        }
                        className="admin-pos-cart-item"
                      >

                        <div className="admin-pos-cart-image">

                          <img
                            src={
                              item.image
                            }
                            alt={
                              item.name
                            }
                          />

                        </div>

                        <div className="admin-pos-cart-info">

                          <strong>
                            {
                              item.name
                            }
                          </strong>

                          <span>
                            ৳{" "}
                            {Number(
                              item.price ||
                                0
                            ).toLocaleString()}{" "}
                            each
                          </span>

                        </div>

                        <div className="admin-pos-qty-control">

                          <button
                            type="button"
                            onClick={() =>
                              decreaseQuantity(
                                item.id
                              )
                            }
                            disabled={
                              submitting
                            }
                          >
                            <Minus
                              size={13}
                            />
                          </button>

                          <span>
                            {
                              item.quantity
                            }
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              increaseQuantity(
                                item.id
                              )
                            }
                            disabled={
                              submitting
                            }
                          >
                            <Plus
                              size={13}
                            />
                          </button>

                        </div>

                        <strong className="admin-pos-item-total">
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
                          ).toLocaleString()}
                        </strong>

                        <button
                          type="button"
                          className="admin-pos-remove-item"
                          onClick={() =>
                            removeItem(
                              item.id
                            )
                          }
                          title="Remove item"
                          disabled={
                            submitting
                          }
                        >
                          <Trash2
                            size={14}
                          />
                        </button>

                      </div>
                    )
                  )}

                </div>

              )}

            </div>

            {/* PAYMENT */}

            <div className="admin-panel">

              <div className="admin-panel-header">

                <div>
                  <p className="section-label">
                    PAYMENT
                  </p>

                  <h3>
                    Payment Method
                  </h3>
                </div>

              </div>

              <div className="admin-pos-payment-options">

                <label
                  className={
                    paymentMethod ===
                    "cash"
                      ? "selected"
                      : ""
                  }
                >

                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cash"
                    checked={
                      paymentMethod ===
                      "cash"
                    }
                    onChange={(
                      event
                    ) =>
                      setPaymentMethod(
                        event.target
                          .value
                      )
                    }
                    disabled={
                      submitting
                    }
                  />

                  <span>
                    Cash
                  </span>

                </label>

                <label
                  className={
                    paymentMethod ===
                    "bkash"
                      ? "selected"
                      : ""
                  }
                >

                  <input
                    type="radio"
                    name="paymentMethod"
                    value="bkash"
                    checked={
                      paymentMethod ===
                      "bkash"
                    }
                    onChange={(
                      event
                    ) =>
                      setPaymentMethod(
                        event.target
                          .value
                      )
                    }
                    disabled={
                      submitting
                    }
                  />

                  <span>
                    bKash
                  </span>

                </label>

                <label
                  className={
                    paymentMethod ===
                    "nagad"
                      ? "selected"
                      : ""
                  }
                >

                  <input
                    type="radio"
                    name="paymentMethod"
                    value="nagad"
                    checked={
                      paymentMethod ===
                      "nagad"
                    }
                    onChange={(
                      event
                    ) =>
                      setPaymentMethod(
                        event.target
                          .value
                      )
                    }
                    disabled={
                      submitting
                    }
                  />

                  <span>
                    Nagad
                  </span>

                </label>

                <label
                  className={
                    paymentMethod ===
                    "card"
                      ? "selected"
                      : ""
                  }
                >

                  <input
                    type="radio"
                    name="paymentMethod"
                    value="card"
                    checked={
                      paymentMethod ===
                      "card"
                    }
                    onChange={(
                      event
                    ) =>
                      setPaymentMethod(
                        event.target
                          .value
                      )
                    }
                    disabled={
                      submitting
                    }
                  />

                  <span>
                    Card
                  </span>

                </label>

              </div>

            </div>

            {/* SUMMARY */}

            <div className="admin-panel admin-pos-summary">

              <div className="admin-pos-summary-row">

                <span>
                  Items
                </span>

                <strong>
                  {totalItems}
                </strong>

              </div>

              <div className="admin-pos-summary-row">

                <span>
                  Subtotal
                </span>

                <strong>
                  ৳{" "}
                  {subtotal.toLocaleString()}
                </strong>

              </div>

              <div className="admin-pos-summary-total">

                <span>
                  Total
                </span>

                <strong>
                  ৳{" "}
                  {total.toLocaleString()}
                </strong>

              </div>

              <button
                type="button"
                className="admin-pos-complete-button"
                disabled={
                  cartItems.length ===
                    0 ||
                  submitting
                }
                onClick={
                  completeSale
                }
              >

                {submitting ? (
                  <>
                    <LoaderCircle
                      size={17}
                      className="admin-refresh-spinning"
                    />

                    Completing...
                  </>
                ) : (
                  <>
                    <Check size={17} />

                    Complete Sale
                  </>
                )}

              </button>

              <p className="admin-pos-note">
                Completing a sale will
                create the order and
                update inventory.
              </p>

            </div>

          </div>

        </section>

      </main>

    </div>
  );
}

export default AdminPOS;