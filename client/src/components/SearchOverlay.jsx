import React, { useEffect, useMemo, useState } from "react";

import {
  ArrowRight,
  Search,
  X,
} from "lucide-react";

import { Link } from "react-router-dom";

function SearchOverlay({ isOpen, onClose }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("http://localhost:5000/api/products");

        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }

        const data = await response.json();

        if (!data.success || !Array.isArray(data.products)) {
          throw new Error("Invalid product data received");
        }

        setProducts(data.products);
      } catch (fetchError) {
        console.error("Search products error:", fetchError);
        setError("Unable to load products. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [isOpen]);

  const results = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) {
      return [];
    }

    return products.filter((product) => {
      const name = String(product.name || "").toLowerCase();
      const category = String(product.category || "").toLowerCase();

      return (
        name.includes(query) ||
        category.includes(query)
      );
    });
  }, [searchTerm, products]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="search-overlay">
      {/* ================= BACKDROP ================= */}

      <button
        type="button"
        className="search-overlay-backdrop"
        onClick={onClose}
        aria-label="Close search"
      />

      {/* ================= SEARCH PANEL ================= */}

      <div className="search-panel">
        <div className="container search-panel-inner">
          {/* Search Header */}

          <div className="search-panel-header">
            <div className="search-input-wrapper">
              <Search
                size={21}
                strokeWidth={1.8}
              />

              <input
                autoFocus
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(event.target.value)
                }
              />
            </div>

            <button
              type="button"
              className="search-close"
              onClick={onClose}
              aria-label="Close search"
            >
              <X size={22} />
            </button>
          </div>

          {/* Search Content */}

          <div className="search-results">
            {loading ? (
              <div className="search-empty">
                <Search
                  size={34}
                  strokeWidth={1.3}
                />

                <h2>Loading products...</h2>

                <p>
                  Please wait while we load the latest products.
                </p>
              </div>
            ) : error ? (
              <div className="search-empty">
                <Search
                  size={34}
                  strokeWidth={1.3}
                />

                <h2>Unable to load products</h2>

                <p>{error}</p>
              </div>
            ) : !searchTerm.trim() ? (
              <div className="search-empty">
                <Search
                  size={34}
                  strokeWidth={1.3}
                />

                <h2>Search Veylix</h2>

                <p>
                  Find products by name or category.
                </p>
              </div>
            ) : results.length > 0 ? (
              <>
                <div className="search-results-heading">
                  <span>
                    Search results
                  </span>

                  <span>
                    {results.length}{" "}
                    {results.length === 1
                      ? "product"
                      : "products"}
                  </span>
                </div>

                <div className="search-result-list">
                  {results.map((product) => (
                    <Link
                      key={product.id}
                      to={`/product/${product.id}`}
                      className="search-result"
                      onClick={onClose}
                    >
                      <div className="search-result-image">
                        <img
                          src={product.image}
                          alt={product.name}
                        />
                      </div>

                      <div className="search-result-info">
                        <p>
                          {product.category}
                        </p>

                        <h3>
                          {product.name}
                        </h3>

                        <strong>
                          ৳{" "}
                          {Number(product.price || 0).toLocaleString()}
                        </strong>
                      </div>

                      <ArrowRight
                        size={17}
                        className="search-result-arrow"
                      />
                    </Link>
                  ))}
                </div>
              </>
            ) : (
              <div className="search-empty">
                <Search
                  size={34}
                  strokeWidth={1.3}
                />

                <h2>No products found</h2>

                <p>
                  Try another product name or category.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SearchOverlay;