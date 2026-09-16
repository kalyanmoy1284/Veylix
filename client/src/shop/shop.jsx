import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Heart,
  Search,
  ShoppingBag,
  UserRound,
  SlidersHorizontal,
  ChevronDown,
  ArrowRight,
} from "lucide-react";

import {
  Link,
  useParams,
} from "react-router-dom";

import { useCart } from "../context/CartContext";

function Shop() {
  const { category } = useParams();
  const { cartItems } = useCart();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");

  const [selectedCategory, setSelectedCategory] = useState(
    category ? category.toLowerCase() : "all"
  );

  const [sortBy, setSortBy] = useState("featured");
  const [showSortMenu, setShowSortMenu] = useState(false);

  const cartCount = cartItems.reduce(
    (total, item) =>
      total + Number(item.quantity || 0),
    0
  );

  const categories = [
    { key: "all", label: "All Products" },
    { key: "men", label: "Men" },
    { key: "women", label: "Women" },
    { key: "shirts", label: "Shirts" },
    { key: "t-shirts", label: "T-Shirts" },
    { key: "pants", label: "Pants" },
    { key: "panjabi", label: "Panjabi" },
    { key: "shoes", label: "Shoes" },
    { key: "watches", label: "Watches" },
    { key: "wallets", label: "Wallets" },
    { key: "ladies-bags", label: "Ladies Bags" },
    { key: "accessories", label: "Accessories" },
    { key: "deals", label: "Deals" },
  ];

  useEffect(() => {
    setSelectedCategory(
      category
        ? category.toLowerCase()
        : "all"
    );
  }, [category]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          "http://localhost:5000/api/products"
        );

        if (!response.ok) {
          throw new Error(
            "Failed to fetch products"
          );
        }

        const data =
          await response.json();

        if (
          !data.success ||
          !Array.isArray(data.products)
        ) {
          throw new Error(
            "Invalid product data received"
          );
        }

        const formattedProducts =
          data.products.map(
            (product) => ({
              ...product,
              id: Number(product.id),
              price: Number(
                product.price || 0
              ),
              stock_quantity: Number(
                product.stock_quantity || 0
              ),
              low_stock_threshold: Number(
                product.low_stock_threshold || 0
              ),
            })
          );

        setProducts(
          formattedProducts
        );
      } catch (fetchError) {
        console.error(
          "Shop products error:",
          fetchError
        );

        setError(
          "Unable to load products. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (
      selectedCategory !== "all"
    ) {
      result = result.filter(
        (product) => {
          const productCategory =
            String(
              product.category || ""
            )
              .toLowerCase()
              .trim();

          if (
            productCategory ===
            selectedCategory
          ) {
            return true;
          }

          if (
            selectedCategory ===
              "shoes" &&
            productCategory ===
              "footwear"
          ) {
            return true;
          }

          if (
            selectedCategory ===
              "ladies-bags" &&
            productCategory ===
              "bags"
          ) {
            return true;
          }

          return false;
        }
      );
    }

    if (
      searchTerm.trim() !== ""
    ) {
      const query =
        searchTerm
          .trim()
          .toLowerCase();

      result = result.filter(
        (product) => {
          const name =
            String(
              product.name || ""
            ).toLowerCase();

          const productCategory =
            String(
              product.category || ""
            ).toLowerCase();

          const sku =
            String(
              product.sku || ""
            ).toLowerCase();

          return (
            name.includes(query) ||
            productCategory.includes(
              query
            ) ||
            sku.includes(query)
          );
        }
      );
    }

    if (
      sortBy ===
      "price-low"
    ) {
      result.sort(
        (a, b) =>
          Number(
            a.price || 0
          ) -
          Number(
            b.price || 0
          )
      );
    }

    if (
      sortBy ===
      "price-high"
    ) {
      result.sort(
        (a, b) =>
          Number(
            b.price || 0
          ) -
          Number(
            a.price || 0
          )
      );
    }

    if (
      sortBy === "name"
    ) {
      result.sort(
        (a, b) =>
          String(
            a.name || ""
          ).localeCompare(
            String(
              b.name || ""
            )
          )
      );
    }

    return result;
  }, [
    products,
    selectedCategory,
    searchTerm,
    sortBy,
  ]);

  const handleCategoryChange = (
    value
  ) => {
    setSelectedCategory(value);
  };

  const selectedCategoryLabel =
    categories.find(
      (item) =>
        item.key ===
        selectedCategory
    )?.label ||
    "All Products";

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
                height: "38px",
                width: "auto",
                display: "block",
              }}
            />
          </Link>

          <nav className="nav-links">
            <Link to="/">
              Home
            </Link>

            <Link
              to="/shop"
              className="active-nav-link"
            >
              Shop
            </Link>

            <Link to="/shop/men">
              Men
            </Link>

            <Link to="/shop/women">
              Women
            </Link>

            <Link to="/shop/accessories">
              Accessories
            </Link>
          </nav>

          <div className="nav-actions">
            <div
              className="shop-search"
              style={{
                maxWidth: "260px",
              }}
            >
              <Search
                size={17}
                strokeWidth={1.7}
              />

              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(
                    event.target.value
                  )
                }
              />
            </div>

            <Link
              to="/wishlist"
              className="nav-icon"
              aria-label="Wishlist"
            >
              <Heart
                size={19}
                strokeWidth={1.8}
              />
            </Link>

            <Link
              to="/cart"
              className="nav-icon cart-icon"
              aria-label="Shopping Cart"
            >
              <ShoppingBag
                size={19}
                strokeWidth={1.8}
              />

              {cartCount > 0 && (
                <span className="cart-count">
                  {cartCount}
                </span>
              )}
            </Link>

            <Link
              to="/orders"
              className="login-button"
              style={{
                textDecoration:
                  "none",
              }}
            >
              <UserRound
                size={17}
                strokeWidth={1.8}
              />

              <span>
                Account
              </span>
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="shop-hero">
          <div className="container">
            <p className="section-label">
              VEYLIX COLLECTION
            </p>

            <h1>
              Fashion made for you.
            </h1>

            <p className="shop-hero-description">
              Discover premium shirts,
              t-shirts, pants,
              panjabi, shoes,
              watches, wallets,
              ladies bags and
              everyday fashion
              essentials.
            </p>
          </div>
        </section>

        <section className="shop-section">
          <div className="container">
            <div className="shop-toolbar">
              <div
                className="shop-categories"
                style={{
                  display: "flex",
                  gap: "8px",
                  flexWrap: "wrap",
                }}
              >
                {categories.map(
                  (item) => (
                    <button
                      key={item.key}
                      type="button"
                      className={
                        selectedCategory ===
                        item.key
                          ? "category-filter active"
                          : "category-filter"
                      }
                      onClick={() =>
                        handleCategoryChange(
                          item.key
                        )
                      }
                    >
                      {item.label}
                    </button>
                  )
                )}
              </div>

              <div className="shop-tools">
                <div className="sort-wrapper">
                  <button
                    type="button"
                    className="sort-button"
                    onClick={() =>
                      setShowSortMenu(
                        (current) =>
                          !current
                      )
                    }
                  >
                    <SlidersHorizontal
                      size={16}
                    />

                    <span>
                      Sort
                    </span>

                    <ChevronDown
                      size={15}
                    />
                  </button>

                  {showSortMenu && (
                    <div className="sort-menu">
                      <button
                        type="button"
                        onClick={() => {
                          setSortBy(
                            "featured"
                          );
                          setShowSortMenu(
                            false
                          );
                        }}
                      >
                        Featured
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setSortBy(
                            "price-low"
                          );
                          setShowSortMenu(
                            false
                          );
                        }}
                      >
                        Price: Low to High
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setSortBy(
                            "price-high"
                          );
                          setShowSortMenu(
                            false
                          );
                        }}
                      >
                        Price: High to Low
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setSortBy(
                            "name"
                          );
                          setShowSortMenu(
                            false
                          );
                        }}
                      >
                        Name
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="shop-product-header">
              <div>
                <p className="section-label">
                  COLLECTION
                </p>

                <h2>
                  {
                    selectedCategoryLabel
                  }
                </h2>
              </div>

              <span className="product-result-count">
                {
                  filteredProducts.length
                }{" "}
                {filteredProducts.length ===
                1
                  ? "product"
                  : "products"}
              </span>
            </div>

            {loading ? (
              <div className="no-products">
                <div className="no-products-icon">
                  <Search
                    size={27}
                  />
                </div>

                <h2>
                  Loading products...
                </h2>

                <p>
                  Please wait while
                  we load the Veylix
                  collection.
                </p>
              </div>
            ) : error ? (
              <div className="no-products">
                <div className="no-products-icon">
                  <Search
                    size={27}
                  />
                </div>

                <h2>
                  Unable to load
                  products
                </h2>

                <p>
                  {error}
                </p>

                <button
                  type="button"
                  className="primary-button"
                  onClick={() =>
                    window.location.reload()
                  }
                >
                  Try again
                </button>
              </div>
            ) : filteredProducts.length >
              0 ? (
              <div className="shop-product-grid">
                {filteredProducts.map(
                  (product) => (
                    <article
                      className="shop-product-card"
                      key={product.id}
                    >
                      <Link
                        to={`/product/${product.id}`}
                        className="shop-product-link"
                      >
                        <div className="shop-product-image">
                          <img
                            src={
                              product.image
                            }
                            alt={
                              product.name
                            }
                            loading="lazy"
                            onError={(
                              event
                            ) => {
                              event.currentTarget.src =
                                "/assets/mark.svg";
                            }}
                          />

                          <span className="shop-product-badge">
                            VEYLIX
                          </span>

                          <button
                            type="button"
                            className="shop-wishlist"
                            aria-label={`Add ${product.name} to wishlist`}
                            onClick={(
                              event
                            ) => {
                              event.preventDefault();
                              event.stopPropagation();
                            }}
                          >
                            <Heart
                              size={18}
                              strokeWidth={
                                1.7
                              }
                            />
                          </button>
                        </div>

                        <div className="shop-product-info">
                          <p className="product-category">
                            {
                              product.category
                            }
                          </p>

                          <h3>
                            {
                              product.name
                            }
                          </h3>

                          <div className="shop-product-bottom">
                            <p className="product-price">
                              ৳{" "}
                              {Number(
                                product.price ||
                                  0
                              ).toLocaleString(
                                "en-BD"
                              )}
                            </p>

                            <span className="quick-view">
                              View
                              <ArrowRight
                                size={14}
                              />
                            </span>
                          </div>
                        </div>
                      </Link>
                    </article>
                  )
                )}
              </div>
            ) : (
              <div className="no-products">
                <div className="no-products-icon">
                  <Search
                    size={27}
                  />
                </div>

                <h2>
                  No products found
                </h2>

                <p>
                  Try another search
                  term or choose a
                  different category.
                </p>

                <button
                  type="button"
                  className="primary-button"
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCategory(
                      "all"
                    );
                  }}
                >
                  View all products
                </button>
              </div>
            )}
          </div>
        </section>

        <section className="shop-benefits">
          <div className="container shop-benefits-grid">
            <div>
              <div className="benefit-number">
                01
              </div>

              <h3>
                Curated fashion
              </h3>

              <p>
                Carefully selected
                products for modern
                everyday style.
              </p>
            </div>

            <div>
              <div className="benefit-number">
                02
              </div>

              <h3>
                Easy shopping
              </h3>

              <p>
                Find your favourite
                pieces and add them
                to your cart easily.
              </p>
            </div>

            <div>
              <div className="benefit-number">
                03
              </div>

              <h3>
                Secure checkout
              </h3>

              <p>
                A smooth shopping
                experience from
                discovery to delivery.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="container footer-content">
          <div>
            <img
              src="/assets/logo-dark.svg"
              alt="Veylix"
              style={{
                width: "130px",
                height: "auto",
                marginBottom: "12px",
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

export default Shop;