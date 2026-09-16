import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  Heart,
  Minus,
  Plus,
  Search,
  ShieldCheck,
  ShoppingBag,
  Star,
  Truck,
  UserRound,
} from "lucide-react";

import {
  Link,
  useParams,
} from "react-router-dom";

import { useCart } from "./context/CartContext";
import SearchOverlay from "./components/SearchOverlay";

function ProductDetails() {
  const { id } = useParams();

  const {
    cartItems,
    wishlistItems,
    addToCart,
    toggleWishlist,
    isInWishlist,
  } = useCart();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] =
    useState(true);
  const [error, setError] =
    useState("");

  const [quantity, setQuantity] =
    useState(1);

  const [addedToCart, setAddedToCart] =
    useState(false);

  const [searchOpen, setSearchOpen] =
    useState(false);

  const cartCount = cartItems.reduce(
    (total, item) =>
      total +
      Number(item.quantity || 0),
    0
  );

  useEffect(() => {
    const fetchProducts =
      async () => {
        try {
          setLoading(true);
          setError("");

          const response =
            await fetch(
              "http://localhost:5000/api/products"
            );

          if (!response.ok) {
            throw new Error(
              "Failed to fetch product data"
            );
          }

          const data =
            await response.json();

          if (
            !data.success ||
            !Array.isArray(
              data.products
            )
          ) {
            throw new Error(
              "Invalid product data received"
            );
          }

          const formattedProducts =
            data.products.map(
              (product) => ({
                ...product,
                id: Number(
                  product.id
                ),
                price: Number(
                  product.price || 0
                ),
                stock_quantity:
                  Number(
                    product.stock_quantity ||
                      0
                  ),
                low_stock_threshold:
                  Number(
                    product.low_stock_threshold ||
                      0
                  ),
              })
            );

          setProducts(
            formattedProducts
          );
        } catch (fetchError) {
          console.error(
            "Product details error:",
            fetchError
          );

          setError(
            "Unable to load product information. Please try again."
          );
        } finally {
          setLoading(false);
        }
      };

    fetchProducts();
  }, []);

  const product = useMemo(() => {
    return products.find(
      (item) =>
        item.id === Number(id)
    );
  }, [products, id]);

  const wishlisted = product
    ? isInWishlist(product.id)
    : false;

  const stockQuantity = Number(
    product?.stock_quantity || 0
  );

  const maximumQuantity =
    Math.min(
      10,
      Math.max(
        1,
        stockQuantity
      )
    );

  const isOutOfStock =
    stockQuantity <= 0;

  const isLowStock =
    stockQuantity > 0 &&
    stockQuantity <=
      Number(
        product?.low_stock_threshold ||
          0
      );

  useEffect(() => {
    if (!product) {
      return;
    }

    if (stockQuantity <= 0) {
      setQuantity(1);
      return;
    }

    setQuantity(
      (currentQuantity) =>
        Math.min(
          Math.max(
            1,
            currentQuantity
          ),
          maximumQuantity
        )
    );
  }, [
    product,
    stockQuantity,
    maximumQuantity,
  ]);

  const decreaseQuantity =
    () => {
      setQuantity(
        (currentQuantity) =>
          Math.max(
            1,
            currentQuantity - 1
          )
      );
    };

  const increaseQuantity =
    () => {
      setQuantity(
        (currentQuantity) =>
          Math.min(
            maximumQuantity,
            currentQuantity + 1
          )
      );
    };

  const handleAddToCart =
    () => {
      if (isOutOfStock) {
        return;
      }

      if (
        quantity > stockQuantity
      ) {
        setQuantity(
          maximumQuantity
        );
        return;
      }

      addToCart(
        product,
        quantity
      );

      setAddedToCart(true);

      setTimeout(() => {
        setAddedToCart(false);
      }, 1800);
    };

  const handleWishlist =
    () => {
      toggleWishlist(product);
    };

  const relatedProducts =
    useMemo(() => {
      if (!product) {
        return [];
      }

      const sameCategory =
        products.filter(
          (item) =>
            item.id !==
              product.id &&
            String(
              item.category || ""
            ).toLowerCase() ===
              String(
                product.category || ""
              ).toLowerCase()
        );

      const otherProducts =
        products.filter(
          (item) =>
            item.id !==
              product.id &&
            String(
              item.category || ""
            ).toLowerCase() !==
              String(
                product.category || ""
              ).toLowerCase()
        );

      return [
        ...sameCategory,
        ...otherProducts,
      ].slice(0, 4);
    }, [products, product]);

  if (loading) {
    return (
      <div className="product-not-found">
        <h1>
          Loading product...
        </h1>

        <p>
          Please wait while we
          load the product details.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="product-not-found">
        <h1>
          Unable to load product
        </h1>

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
          Try Again
        </button>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-not-found">
        <h1>
          Product not found
        </h1>

        <Link
          to="/shop"
          className="primary-button"
        >
          Back to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="store-page">
      <SearchOverlay
        isOpen={searchOpen}
        onClose={() =>
          setSearchOpen(false)
        }
      />

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

            <Link to="/shop">
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
            <button
              type="button"
              className="nav-icon"
              onClick={() =>
                setSearchOpen(true)
              }
              aria-label="Search"
            >
              <Search
                size={19}
                strokeWidth={1.8}
              />
            </button>

            <Link
              to="/wishlist"
              className="nav-icon cart-icon"
              aria-label="Wishlist"
            >
              <Heart
                size={19}
                strokeWidth={1.8}
                fill={
                  wishlistItems.length >
                  0
                    ? "currentColor"
                    : "none"
                }
              />

              {wishlistItems.length >
                0 && (
                <span className="cart-count">
                  {
                    wishlistItems.length
                  }
                </span>
              )}
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

      <main className="product-details-page">
        <div className="container">
          <div className="product-breadcrumb">
            <Link to="/">
              Home
            </Link>

            <span>/</span>

            <Link to="/shop">
              Shop
            </Link>

            <span>/</span>

            <span>
              {product.name}
            </span>
          </div>

          <Link
            to="/shop"
            className="back-button"
          >
            <ArrowLeft size={16} />
            Back to Shop
          </Link>

          <section className="product-details">
            <div className="product-details-media">
              <div className="product-details-image">
                <img
                  src={product.image}
                  alt={product.name}
                  onError={(
                    event
                  ) => {
                    event.currentTarget.src =
                      "/assets/mark.svg";
                  }}
                />

                <button
                  type="button"
                  className={`details-wishlist ${
                    wishlisted
                      ? "active"
                      : ""
                  }`}
                  onClick={
                    handleWishlist
                  }
                  aria-label={
                    wishlisted
                      ? "Remove from wishlist"
                      : "Add to wishlist"
                  }
                >
                  <Heart
                    size={21}
                    fill={
                      wishlisted
                        ? "currentColor"
                        : "none"
                    }
                  />
                </button>

                <span className="image-badge">
                  VEYLIX
                </span>
              </div>

              <div className="image-note">
                <ShieldCheck
                  size={17}
                />

                <span>
                  Authentic Veylix
                  selection
                </span>
              </div>
            </div>

            <div className="product-details-info">
              <p className="product-details-category">
                {product.category}
              </p>

              <h1>
                {product.name}
              </h1>

              <div className="product-rating">
                <div className="stars">
                  {[
                    1,
                    2,
                    3,
                    4,
                    5,
                  ].map(
                    (star) => (
                      <Star
                        key={star}
                        size={15}
                        fill="currentColor"
                      />
                    )
                  )}
                </div>

                <span>
                  4.8
                </span>

                <span className="rating-separator">
                  |
                </span>

                <span className="review-count">
                  24 reviews
                </span>
              </div>

              <div className="product-details-price">
                ৳{" "}
                {Number(
                  product.price ||
                    0
                ).toLocaleString(
                  "en-BD"
                )}
              </div>

              <p className="product-details-description">
                {product.description ||
                  "A carefully selected product from the Veylix collection. Designed with quality, style and everyday usability in mind."}
              </p>

              <div className="stock-status">
                {isOutOfStock ? (
                  <>
                    <span className="stock-dot" />

                    <strong>
                      Out of Stock
                    </strong>

                    <span>
                      Currently
                      unavailable
                    </span>
                  </>
                ) : isLowStock ? (
                  <>
                    <span className="stock-dot" />

                    <strong>
                      Low Stock
                    </strong>

                    <span>
                      Only{" "}
                      {
                        stockQuantity
                      }{" "}
                      left
                    </span>
                  </>
                ) : (
                  <>
                    <span className="stock-dot" />

                    <strong>
                      In Stock
                    </strong>

                    <span>
                      {
                        stockQuantity
                      }{" "}
                      available
                    </span>
                  </>
                )}
              </div>

              <div className="product-divider" />

              <div className="quantity-section">
                <div>
                  <span className="quantity-label">
                    Quantity
                  </span>

                  <span className="quantity-help">
                    Maximum{" "}
                    {
                      maximumQuantity
                    }{" "}
                    items
                  </span>
                </div>

                <div className="quantity-control">
                  <button
                    type="button"
                    onClick={
                      decreaseQuantity
                    }
                    disabled={
                      quantity ===
                        1 ||
                      isOutOfStock
                    }
                  >
                    <Minus
                      size={16}
                    />
                  </button>

                  <span>
                    {quantity}
                  </span>

                  <button
                    type="button"
                    onClick={
                      increaseQuantity
                    }
                    disabled={
                      isOutOfStock ||
                      quantity >=
                        maximumQuantity
                    }
                  >
                    <Plus
                      size={16}
                    />
                  </button>
                </div>
              </div>

              <button
                type="button"
                className={`add-cart-button ${
                  addedToCart
                    ? "added"
                    : ""
                }`}
                onClick={
                  handleAddToCart
                }
                disabled={
                  isOutOfStock
                }
              >
                {addedToCart ? (
                  <>
                    <Check size={19} />
                    Added to Cart
                  </>
                ) : isOutOfStock ? (
                  <>
                    <ShoppingBag
                      size={19}
                    />
                    Out of Stock
                  </>
                ) : (
                  <>
                    <ShoppingBag
                      size={19}
                    />
                    Add to Cart
                  </>
                )}
              </button>

              <button
                type="button"
                className={`details-wishlist-button ${
                  wishlisted
                    ? "active"
                    : ""
                }`}
                onClick={
                  handleWishlist
                }
              >
                <Heart
                  size={18}
                  fill={
                    wishlisted
                      ? "currentColor"
                      : "none"
                  }
                />

                {wishlisted
                  ? "Remove from Wishlist"
                  : "Add to Wishlist"}
              </button>

              <div className="product-services">
                <div className="service-item">
                  <div className="service-icon">
                    <Truck
                      size={19}
                    />
                  </div>

                  <div>
                    <strong>
                      Fast Delivery
                    </strong>

                    <span>
                      Safe delivery to
                      your doorstep
                    </span>
                  </div>
                </div>

                <div className="service-item">
                  <div className="service-icon">
                    <RotateIcon />
                  </div>

                  <div>
                    <strong>
                      Easy Returns
                    </strong>

                    <span>
                      Simple return
                      support
                    </span>
                  </div>
                </div>

                <div className="service-item">
                  <div className="service-icon">
                    <ShieldCheck
                      size={19}
                    />
                  </div>

                  <div>
                    <strong>
                      Secure Purchase
                    </strong>

                    <span>
                      Protected
                      shopping
                      experience
                    </span>
                  </div>
                </div>
              </div>

              <div className="product-extra-info">
                <div>
                  <span>
                    Category
                  </span>

                  <strong>
                    {product.category}
                  </strong>
                </div>

                <div>
                  <span>
                    Availability
                  </span>

                  <strong
                    className={
                      isOutOfStock
                        ? ""
                        : "available"
                    }
                  >
                    {isOutOfStock
                      ? "Out of Stock"
                      : "In Stock"}
                  </strong>
                </div>

                <div>
                  <span>
                    SKU
                  </span>

                  <strong>
                    {product.sku}
                  </strong>
                </div>
              </div>
            </div>
          </section>

          <section className="product-information-section">
            <div className="information-header">
              <p className="section-label">
                WHY VEYLIX
              </p>

              <h2>
                Fashion made simple.
              </h2>

              <p>
                Quality products and a
                smooth shopping
                experience.
              </p>
            </div>

            <div className="information-grid">
              <div className="information-card">
                <div className="information-card-icon">
                  <ShieldCheck
                    size={20}
                  />
                </div>

                <h3>
                  Quality focused
                </h3>

                <p>
                  Products selected
                  with style,
                  quality and
                  everyday usability
                  in mind.
                </p>
              </div>

              <div className="information-card">
                <div className="information-card-icon">
                  <Truck
                    size={20}
                  />
                </div>

                <h3>
                  Reliable delivery
                </h3>

                <p>
                  We aim to keep
                  your delivery
                  experience simple
                  and dependable.
                </p>
              </div>

              <div className="information-card">
                <div className="information-card-icon">
                  <Heart
                    size={20}
                  />
                </div>

                <h3>
                  Curated for you
                </h3>

                <p>
                  A selected
                  collection built
                  around modern
                  fashion and
                  lifestyle.
                </p>
              </div>
            </div>
          </section>

          <section className="related-products-section">
            <div className="section-header">
              <div>
                <p className="section-label">
                  YOU MAY ALSO LIKE
                </p>

                <h2>
                  More products
                </h2>
              </div>

              <Link
                to="/shop"
                className="view-all"
              >
                View all
                <ArrowRight
                  size={17}
                />
              </Link>
            </div>

            <div className="product-grid">
              {relatedProducts.map(
                (item) => (
                  <Link
                    key={item.id}
                    to={`/product/${item.id}`}
                    className="product-card"
                  >
                    <div className="product-image">
                      <img
                        src={item.image}
                        alt={item.name}
                        loading="lazy"
                        onError={(
                          event
                        ) => {
                          event.currentTarget.src =
                            "/assets/mark.svg";
                        }}
                      />
                    </div>

                    <div className="product-info">
                      <p className="product-category">
                        {
                          item.category
                        }
                      </p>

                      <h3>
                        {item.name}
                      </h3>

                      <p className="product-price">
                        ৳{" "}
                        {Number(
                          item.price ||
                            0
                        ).toLocaleString(
                          "en-BD"
                        )}
                      </p>
                    </div>
                  </Link>
                )
              )}
            </div>
          </section>
        </div>
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
                marginBottom:
                  "12px",
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

function RotateIcon() {
  return (
    <span
      style={{
        fontSize: "21px",
        lineHeight: 1,
      }}
      aria-hidden="true"
    >
      ↻
    </span>
  );
}

export default ProductDetails;