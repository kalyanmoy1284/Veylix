import React from "react";

import {
  Heart,
  ShoppingBag,
  ArrowRight,
  Trash2,
} from "lucide-react";

import { Link } from "react-router-dom";

import { useCart } from "./context/CartContext";

function Wishlist() {
  const {
    wishlistItems,
    toggleWishlist,
    addToCart,
    cartCount,
  } = useCart();

  const handleAddToCart = (product) => {
    addToCart(product, 1);
  };

  return (
    <div className="store-page">

      {/* ================= NAVBAR ================= */}

      <header className="navbar">

        <div className="container navbar-content">

          <Link
            to="/"
            className="logo"
          >
            Veylix
          </Link>


          <nav className="nav-links">

            <Link to="/">
              Home
            </Link>

            <Link to="/shop">
              Shop
            </Link>

            <Link to="/categories">
              Categories
            </Link>

            <Link to="/about">
              About
            </Link>

            <Link to="/contact">
              Contact
            </Link>

          </nav>


          <div className="nav-actions">

            <Link
              to="/wishlist"
              className="nav-icon active-cart"
              aria-label="Wishlist"
            >

              <Heart
                size={19}
                fill="currentColor"
              />

            </Link>


            <Link
              to="/cart"
              className="nav-icon cart-icon"
              aria-label="Cart"
            >

              <ShoppingBag
                size={19}
              />

              {cartCount > 0 && (
                <span className="cart-count">
                  {cartCount}
                </span>
              )}

            </Link>

          </div>

        </div>

      </header>


      {/* ================= MAIN ================= */}

      <main className="wishlist-page">

        <div className="container">

          <div className="wishlist-header">

            <div>

              <p className="section-label">
                SAVED FOR LATER
              </p>

              <h1>
                My Wishlist
              </h1>

              <p>
                Products you want to keep an eye on.
              </p>

            </div>

            {wishlistItems.length > 0 && (
              <span className="wishlist-count">
                {wishlistItems.length}
                {" "}
                {wishlistItems.length === 1
                  ? "item"
                  : "items"}
              </span>
            )}

          </div>


          {wishlistItems.length === 0 ? (

            <div className="empty-wishlist">

              <div className="empty-wishlist-icon">

                <Heart size={35} />

              </div>

              <h2>
                Your wishlist is empty
              </h2>

              <p>
                Save products you love and
                come back to them later.
              </p>

              <Link
                to="/shop"
                className="primary-button"
              >

                Explore Products

                <ArrowRight size={17} />

              </Link>

            </div>

          ) : (

            <div className="wishlist-grid">

              {wishlistItems.map((product) => (

                <article
                  className="wishlist-card"
                  key={product.id}
                >

                  <Link
                    to={`/product/${product.id}`}
                    className="wishlist-image"
                  >

                    <img
                      src={product.image}
                      alt={product.name}
                    />

                  </Link>


                  <div className="wishlist-info">

                    <p className="product-category">
                      {product.category}
                    </p>

                    <Link
                      to={`/product/${product.id}`}
                      className="wishlist-name"
                    >
                      {product.name}
                    </Link>

                    <p className="wishlist-price">
                      ৳{" "}
                      {product.price.toLocaleString()}
                    </p>


                    <div className="wishlist-actions">

                      <button
                        type="button"
                        className="wishlist-cart-button"
                        onClick={() =>
                          handleAddToCart(product)
                        }
                      >

                        <ShoppingBag size={16} />

                        Add to Cart

                      </button>


                      <button
                        type="button"
                        className="wishlist-remove-button"
                        aria-label="Remove from wishlist"
                        onClick={() =>
                          toggleWishlist(product)
                        }
                      >

                        <Trash2 size={16} />

                      </button>

                    </div>

                  </div>

                </article>

              ))}

            </div>

          )}

        </div>

      </main>


      {/* ================= FOOTER ================= */}

      <footer className="footer">

        <div className="container footer-content">

          <div>

            <h3 className="footer-logo">
              Veylix
            </h3>

            <p>
              Discover products made for you.
            </p>

          </div>


          <p className="copyright">
            © 2026 Veylix. All rights reserved.
          </p>

        </div>

      </footer>

    </div>
  );
}

export default Wishlist;