import React from "react";

import {
  ArrowLeft,
  ArrowRight,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  ShieldCheck,
  Truck,
} from "lucide-react";

import { Link } from "react-router-dom";

import { useCart } from "../context/CartContext";

function Cart() {
  const {
    cartItems,
    cartCount,
    cartSubtotal,
    shipping,
    cartTotal,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
  } = useCart();

  return (
    <div className="cart-page">
      {/* NAVBAR */}

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
        </div>
      </header>

      {/* MAIN */}

      <main>
        <section className="cart-section">
          <div className="container">
            <div className="cart-heading">
              <div>
                <p className="section-label">
                  VEYLIX SHOPPING BAG
                </p>

                <h1>
                  Your Cart
                </h1>

                <p>
                  {cartCount === 0
                    ? "Your shopping bag is currently empty."
                    : `${cartCount} ${
                        cartCount === 1
                          ? "item"
                          : "items"
                      } ready for checkout`}
                </p>
              </div>
            </div>

            {cartItems.length === 0 ? (
              <div className="empty-cart">
                <div className="empty-cart-icon">
                  <ShoppingBag
                    size={34}
                  />
                </div>

                <p className="section-label">
                  YOUR BAG IS WAITING
                </p>

                <h2>
                  Your cart is empty
                </h2>

                <p>
                  Discover the latest
                  Veylix fashion and
                  lifestyle collection.
                </p>

                <Link
                  to="/shop"
                  className="primary-button"
                >
                  Continue Shopping
                  <ArrowRight
                    size={17}
                  />
                </Link>
              </div>
            ) : (
              <div className="cart-layout">
                {/* ITEMS */}

                <div className="cart-items-section">
                  <div className="cart-section-heading">
                    <div>
                      <p className="section-label">
                        SELECTED ITEMS
                      </p>

                      <h2>
                        Your Items
                      </h2>
                    </div>

                    <span className="cart-item-count">
                      {cartCount}{" "}
                      {cartCount === 1
                        ? "item"
                        : "items"}
                    </span>
                  </div>

                  <div className="cart-items">
                    {cartItems.map(
                      (item) => (
                        <article
                          className="cart-item"
                          key={item.id}
                        >
                          <Link
                            to={`/product/${item.id}`}
                            className="cart-item-image"
                          >
                            <img
                              src={
                                item.image
                              }
                              alt={
                                item.name
                              }
                              loading="lazy"
                              onError={(
                                event
                              ) => {
                                event.currentTarget.src =
                                  "/assets/mark.svg";
                              }}
                            />
                          </Link>

                          <div className="cart-item-details">
                            <p className="cart-item-category">
                              {
                                item.category
                              }
                            </p>

                            <Link
                              to={`/product/${item.id}`}
                              className="cart-item-name"
                            >
                              {
                                item.name
                              }
                            </Link>

                            <p className="cart-item-price">
                              ৳{" "}
                              {Number(
                                item.price ||
                                  0
                              ).toLocaleString(
                                "en-BD"
                              )}
                            </p>

                            <div className="cart-item-bottom">
                              <div className="cart-quantity">
                                <button
                                  type="button"
                                  onClick={() =>
                                    decreaseQuantity(
                                      item.id
                                    )
                                  }
                                  aria-label="Decrease quantity"
                                >
                                  <Minus
                                    size={
                                      15
                                    }
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
                                  aria-label="Increase quantity"
                                >
                                  <Plus
                                    size={
                                      15
                                    }
                                  />
                                </button>
                              </div>

                              <button
                                type="button"
                                className="remove-item"
                                onClick={() =>
                                  removeFromCart(
                                    item.id
                                  )
                                }
                              >
                                <Trash2
                                  size={
                                    15
                                  }
                                />

                                Remove
                              </button>
                            </div>
                          </div>

                          <div className="cart-item-total">
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
                          </div>
                        </article>
                      )
                    )}
                  </div>

                  <Link
                    to="/shop"
                    className="continue-shopping"
                  >
                    <ArrowLeft
                      size={16}
                    />

                    Continue Shopping
                  </Link>
                </div>

                {/* SUMMARY */}

                <aside className="order-summary">
                  <div className="summary-top">
                    <p className="section-label">
                      VEYLIX CHECKOUT
                    </p>

                    <h2>
                      Order Summary
                    </h2>
                  </div>

                  <div className="summary-lines">
                    <div className="summary-line">
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

                    <div className="summary-line">
                      <span>
                        Delivery
                      </span>

                      <strong>
                        ৳{" "}
                        {Number(
                          shipping || 0
                        ).toLocaleString(
                          "en-BD"
                        )}
                      </strong>
                    </div>
                  </div>

                  <div className="summary-total">
                    <span>
                      Total
                    </span>

                    <strong>
                      ৳{" "}
                      {Number(
                        cartTotal || 0
                      ).toLocaleString(
                        "en-BD"
                      )}
                    </strong>
                  </div>

                  <Link
                    to="/checkout"
                    className="checkout-button"
                  >
                    Proceed to Checkout
                    <ArrowRight
                      size={17}
                    />
                  </Link>

                  <div className="secure-checkout">
                    <ShieldCheck
                      size={17}
                    />

                    <span>
                      Secure checkout
                    </span>
                  </div>

                  <div className="checkout-note">
                    <Truck
                      size={17}
                    />

                    <span>
                      Standard delivery ৳100
                    </span>
                  </div>

                  <div
                    style={{
                      marginTop:
                        "20px",
                      paddingTop:
                        "18px",
                      borderTop:
                        "1px solid #e8e8e8",
                      fontSize:
                        "12px",
                      color:
                        "#777",
                      lineHeight:
                        "1.7",
                    }}
                  >
                    Free shipping on
                    orders over ৳2,000.
                    Easy returns
                    available on
                    eligible products.
                  </div>
                </aside>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* FOOTER */}

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

export default Cart;