import React, { useEffect, useState } from "react";

import {
  ArrowRight,
  Heart,
  Search,
  ShoppingBag,
  UserRound,
  ChevronDown,
  LogOut,
  Package,
  Shirt,
  Watch,
  Wallet,
  Tag,
  Sparkles,
  ShieldCheck,
  RefreshCcw,
  Users,
} from "lucide-react";

import {
  Link,
  useNavigate,
} from "react-router-dom";


import {
  useCart,
} from "./context/CartContext";

import SearchOverlay from "./components/SearchOverlay";


function App() {
  const navigate = useNavigate();

  const {
    cartCount,
    wishlistItems,
    toggleWishlist,
    isInWishlist,
  } = useCart();

  const [searchOpen, setSearchOpen] =
    useState(false);

  const [accountOpen, setAccountOpen] =
    useState(false);

  const [products, setProducts] =
    useState([]);

  const [productsLoading, setProductsLoading] =
    useState(true);

  const customer = (() => {
    try {
      const savedCustomer =
        localStorage.getItem(
          "veylix_customer"
        );

      return savedCustomer
        ? JSON.parse(savedCustomer)
        : null;
    } catch {
      return null;
    }
  })();

  const isLoggedIn =
    Boolean(
      localStorage.getItem(
        "veylix_customer_token"
      )
    ) && Boolean(customer);

  const handleLogout = () => {
    localStorage.removeItem(
      "veylix_customer_token"
    );

    localStorage.removeItem(
      "veylix_customer"
    );

    setAccountOpen(false);

    navigate("/");
  };

  const categories = [
    {
      name: "Men",
      slug: "men",
      icon: UserRound,
    },
    {
      name: "Women",
      slug: "women",
      icon: UserRound,
    },
    {
      name: "Shirts",
      slug: "shirts",
      icon: Shirt,
    },
    {
      name: "T-Shirts",
      slug: "t-shirts",
      icon: Shirt,
    },
    {
      name: "Pants",
      slug: "pants",
      icon: Tag,
    },
    {
      name: "Panjabi",
      slug: "panjabi",
      icon: Sparkles,
    },
    {
      name: "Shoes",
      slug: "shoes",
      icon: ShoppingBag,
    },
    {
      name: "Watches",
      slug: "watches",
      icon: Watch,
    },
    {
      name: "Wallets",
      slug: "wallets",
      icon: Wallet,
    },
    {
      name: "Ladies Bags",
      slug: "ladies-bags",
      icon: ShoppingBag,
    },
    {
      name: "Accessories",
      slug: "accessories",
      icon: Tag,
    },
    {
      name: "Deals",
      slug: "deals",
      icon: Tag,
    },
  ];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setProductsLoading(true);

        const response = await fetch(
          "http://localhost:5000/api/products"
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message ||
              "Failed to load products."
          );
        }

        const formattedProducts =
          Array.isArray(data.products)
            ? data.products.map((product) => ({
                ...product,
                id: Number(product.id),
                price: Number(product.price || 0),
                stock_quantity: Number(
                  product.stock_quantity || 0
                ),
              }))
            : [];

        setProducts(formattedProducts);
      } catch (error) {
        console.error(
          "Homepage products error:",
          error
        );
        setProducts([]);
      } finally {
        setProductsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const featuredProducts = products.slice(0, 8);

  const categoryImageFallbacks = {
    shirts:
      "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=900&q=80",
    "t-shirts":
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80",
    pants:
      "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=900&q=80",
    panjabi:
      "https://images.unsplash.com/photo-1583391733956-6c78276477e2?auto=format&fit=crop&w=900&q=80",
    shoes:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80",
    watches:
      "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=900&q=80",
    wallets:
      "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=900&q=80",
    "ladies-bags":
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=900&q=80",
    accessories:
      "https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=900&q=80",
    men:
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=900&q=80",
    women:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=900&q=80",
    deals:
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=900&q=80",
  };

  const getCategoryProducts = (slug) => {
    const categoryName = slug
      .replace(/-/g, " ")
      .toLowerCase();

    return products.filter(
      (product) =>
        String(product.category || "")
          .toLowerCase()
          .replace(/-/g, " ") === categoryName
    );
  };

  const getCategoryImage = (category) => {
    const categoryProducts = getCategoryProducts(
      category.slug
    );

    return (
      categoryProducts[0]?.image ||
      categoryImageFallbacks[category.slug] ||
      "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=900&q=80"
    );
  };

  const getCategoryCount = (category) => {
    if (category.slug === "deals") {
      return products.filter(
        (product) => Number(product.price || 0) < 2000
      ).length;
    }

    return getCategoryProducts(category).length;
  };

  return (
    <div
      className="app"
      style={{
        background: "#faf9f6",
        minHeight: "100vh",
      }}
    >
      <style>{`

        .veylix-fashion-topbar {
          height: 34px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #0b0b0b;
          color: #ffffff;
          font-size: 10px;
          letter-spacing: .3px;
        }

        .veylix-fashion-topbar strong {
          color: #d4af37;
        }

        .veylix-main-header {
          background: #ffffff;
          border-bottom: 1px solid #eceae5;
          position: relative;
          z-index: 60;
        }

        .veylix-header-main {
          min-height: 76px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
        }

        .veylix-brand-logo {
          display: inline-flex;
          align-items: center;
          text-decoration: none;
          flex-shrink: 0;
        }

        .veylix-brand-logo img {
          width: 142px;
          height: auto;
          display: block;
        }

        .veylix-search-box {
          flex: 1;
          max-width: 530px;
          height: 44px;
          display: flex;
          align-items: center;
          border: 1px solid #dfddd7;
          border-radius: 4px;
          background: #fafafa;
          overflow: hidden;
          cursor: text;
        }

        .veylix-search-box span {
          flex: 1;
          color: #99958c;
          font-size: 11px;
          padding-left: 15px;
        }

        .veylix-search-button {
          width: 50px;
          height: 44px;
          border: 0;
          background: #0b0b0b;
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .veylix-header-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .veylix-action-link {
          position: relative;
          width: 42px;
          height: 42px;
          border: 1px solid #e4e2dc;
          border-radius: 50%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: #111111;
          text-decoration: none;
          background: #ffffff;
        }

        .veylix-action-count {
          position: absolute;
          top: -3px;
          right: -2px;
          min-width: 17px;
          height: 17px;
          padding: 0 4px;
          border-radius: 999px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #0b0b0b;
          color: #ffffff;
          font-size: 8px;
          font-weight: 700;
        }

        .veylix-login-link {
          min-height: 42px;
          padding: 0 14px;
          display: inline-flex;
          align-items: center;
          gap: 7px;
          border: 1px solid #111111;
          border-radius: 4px;
          background: #ffffff;
          color: #111111;
          text-decoration: none;
          font-size: 10px;
          font-weight: 700;
          cursor: pointer;
        }

        .veylix-category-nav {
          border-top: 1px solid #f0eee9;
          background: #ffffff;
        }

        .veylix-category-nav-inner {
          min-height: 48px;
          display: flex;
          align-items: center;
          gap: 5px;
          overflow-x: auto;
        }

        .veylix-all-category {
          min-height: 34px;
          padding: 0 14px;
          display: inline-flex;
          align-items: center;
          gap: 7px;
          background: #d4af37;
          color: #111111;
          border-radius: 4px;
          text-decoration: none;
          font-size: 10px;
          font-weight: 800;
          white-space: nowrap;
        }

        .veylix-nav-category {
          min-height: 34px;
          padding: 0 13px;
          display: inline-flex;
          align-items: center;
          border-radius: 4px;
          text-decoration: none;
          color: #2a2926;
          font-size: 10px;
          font-weight: 600;
          white-space: nowrap;
          transition: .2s ease;
        }

        .veylix-nav-category:hover {
          background: #f5f3ee;
          color: #111111;
        }

        .veylix-fashion-hero {
          margin-top: 16px;
        }

        .veylix-hero-grid {
          display: grid;
          grid-template-columns: 1.05fr 1.55fr;
          min-height: 450px;
          overflow: hidden;
          border-radius: 8px;
          background:
            linear-gradient(
              135deg,
              #f6f0e5 0%,
              #ede4d2 100%
            );
        }

        .veylix-hero-content {
          padding: 60px 45px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .veylix-eyebrow {
          margin: 0 0 13px;
          color: #8a7750;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 3px;
          text-transform: uppercase;
        }

        .veylix-hero-title {
          margin: 0;
          max-width: 460px;
          font-size: clamp(38px, 5vw, 67px);
          line-height: .96;
          letter-spacing: -2.8px;
          color: #111111;
          font-weight: 800;
        }

        .veylix-hero-title span {
          color: #a57d25;
        }

        .veylix-hero-description {
          max-width: 440px;
          margin: 22px 0 0;
          color: #5e5b55;
          font-size: 13px;
          line-height: 1.7;
        }

        .veylix-hero-buttons {
          margin-top: 28px;
          display: flex;
          align-items: center;
          gap: 9px;
          flex-wrap: wrap;
        }

        .veylix-primary-btn,
        .veylix-secondary-btn {
          min-height: 44px;
          padding: 0 17px;
          border-radius: 4px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          text-decoration: none;
          font-size: 10px;
          font-weight: 800;
        }

        .veylix-primary-btn {
          background: #0b0b0b;
          color: #ffffff;
        }

        .veylix-secondary-btn {
          border: 1px solid #bdb6aa;
          color: #111111;
          background: rgba(255,255,255,.35);
        }

        .veylix-hero-image {
          position: relative;
          min-height: 450px;
          background: #e7ddcd;
          overflow: hidden;
        }

        .veylix-hero-image img {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: cover;
        }

        .veylix-hero-overlay {
          position: absolute;
          right: 28px;
          bottom: 25px;
          padding: 11px 13px;
          background: rgba(255,255,255,.88);
          backdrop-filter: blur(8px);
          border-radius: 4px;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: .8px;
          color: #222222;
        }

        .veylix-benefits {
          margin-top: 12px;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          border: 1px solid #e4e1db;
          background: #ffffff;
          border-radius: 7px;
          overflow: hidden;
        }

        .veylix-benefit {
          padding: 17px 18px;
          display: flex;
          align-items: center;
          gap: 11px;
          border-right: 1px solid #ece9e3;
        }

        .veylix-benefit:last-child {
          border-right: 0;
        }

        .veylix-benefit-icon {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: #f3eee3;
          color: #8f6d2a;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .veylix-benefit strong {
          display: block;
          font-size: 10px;
          color: #111111;
        }

        .veylix-benefit span {
          display: block;
          margin-top: 3px;
          font-size: 8px;
          color: #858179;
        }

        .veylix-section {
          padding-top: 42px;
        }

        .veylix-section-head {
          display: flex;
          justify-content: space-between;
          align-items: end;
          gap: 20px;
          margin-bottom: 17px;
        }

        .veylix-section-label {
          margin: 0 0 5px;
          color: #9a7b38;
          font-size: 9px;
          letter-spacing: 2px;
          font-weight: 800;
          text-transform: uppercase;
        }

        .veylix-section-title {
          margin: 0;
          font-size: 27px;
          line-height: 1.1;
          color: #111111;
          letter-spacing: -.8px;
        }

        .veylix-view-all {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: #111111;
          text-decoration: none;
          font-size: 10px;
          font-weight: 800;
        }

        .veylix-category-grid {
          display: grid;
          grid-template-columns: repeat(8, 1fr);
          gap: 10px;
        }

        .veylix-category-card {
          min-height: 118px;
          background: #ffffff;
          border: 1px solid #e7e4de;
          border-radius: 7px;
          text-decoration: none;
          color: #111111;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 10px;
          transition: .2s ease;
        }

        .veylix-category-card:hover {
          transform: translateY(-2px);
          border-color: #d4af37;
          box-shadow: 0 10px 25px rgba(0,0,0,.06);
        }

        .veylix-category-icon {
          width: 46px;
          height: 46px;
          border-radius: 50%;
          background: #f6f1e7;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #80611e;
        }

        .veylix-category-card strong {
          font-size: 10px;
          text-align: center;
        }

        .veylix-promo-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }

        .veylix-promo-card {
          min-height: 175px;
          border-radius: 7px;
          overflow: hidden;
          position: relative;
          padding: 24px;
          display: flex;
          flex-direction: column;
          justify-content: end;
          text-decoration: none;
          color: #ffffff;
        }

        .veylix-promo-card:nth-child(1) {
          background:
            linear-gradient(
              120deg,
              #d9c3a2,
              #8e7653
            );
        }

        .veylix-promo-card:nth-child(2) {
          background:
            linear-gradient(
              120deg,
              #272624,
              #111111
            );
        }

        .veylix-promo-card:nth-child(3) {
          background:
            linear-gradient(
              120deg,
              #d7ccba,
              #9e8c69
            );
        }

        .veylix-promo-card::after {
          content: "";
          position: absolute;
          inset: 0;
          background:
            linear-gradient(
              180deg,
              transparent,
              rgba(0,0,0,.32)
            );
        }

        .veylix-promo-content {
          position: relative;
          z-index: 2;
        }

        .veylix-promo-card small {
          font-size: 8px;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          opacity: .88;
        }

        .veylix-promo-card h3 {
          margin: 6px 0 10px;
          font-size: 24px;
          letter-spacing: -.7px;
        }

        .veylix-promo-card span {
          font-size: 9px;
          font-weight: 800;
        }

        .veylix-products-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 13px;
        }

        .veylix-product-card {
          background: #ffffff;
          border: 1px solid #e7e4de;
          border-radius: 7px;
          overflow: hidden;
          transition: .2s ease;
        }

        .veylix-product-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(0,0,0,.06);
        }

        .veylix-product-image {
          height: 270px;
          background: #f4f3f0;
          position: relative;
          overflow: hidden;
        }

        .veylix-product-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .veylix-product-wishlist {
          position: absolute;
          top: 11px;
          right: 11px;
          width: 34px;
          height: 34px;
          border: 1px solid #e1ded7;
          background: rgba(255,255,255,.92);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .veylix-product-info {
          padding: 14px;
        }

        .veylix-product-category {
          margin: 0;
          color: #978a72;
          font-size: 8px;
          text-transform: uppercase;
          letter-spacing: 1px;
          font-weight: 800;
        }

        .veylix-product-info h3 {
          margin: 6px 0 8px;
          font-size: 13px;
          color: #111111;
        }

        .veylix-product-price {
          margin: 0;
          font-size: 14px;
          font-weight: 800;
          color: #111111;
        }

        .veylix-brand-story {
          margin-top: 45px;
          min-height: 230px;
          border-radius: 8px;
          background:
            linear-gradient(
              120deg,
              #111111,
              #292825
            );
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 40px;
        }

        .veylix-brand-story-inner {
          max-width: 690px;
        }

        .veylix-brand-story small {
          color: #d4af37;
          letter-spacing: 3px;
          font-size: 9px;
          font-weight: 800;
        }

        .veylix-brand-story h2 {
          margin: 12px 0;
          font-size: clamp(28px, 4vw, 45px);
          line-height: 1;
          letter-spacing: -1.5px;
        }

        .veylix-brand-story p {
          margin: 0;
          color: #c9c5bd;
          font-size: 12px;
          line-height: 1.7;
        }

        .veylix-footer {
          margin-top: 50px;
          background: #0b0b0b;
          color: #ffffff;
        }

        .veylix-footer-inner {
          min-height: 190px;
          display: grid;
          grid-template-columns: 1.5fr 1fr 1fr 1fr;
          gap: 25px;
          padding: 38px 0;
        }

        .veylix-footer-logo {
          width: 120px;
          height: auto;
          display: block;
        }

        .veylix-footer p {
          max-width: 270px;
          margin: 13px 0 0;
          color: #92908b;
          font-size: 10px;
          line-height: 1.7;
        }

        .veylix-footer h4 {
          margin: 0 0 12px;
          font-size: 10px;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        .veylix-footer a {
          display: block;
          margin-top: 8px;
          color: #a8a59f;
          text-decoration: none;
          font-size: 9px;
        }

        .veylix-footer-bottom {
          border-top: 1px solid #222222;
          min-height: 45px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          color: #77746f;
          font-size: 8px;
        }

        /* =====================================================
           PREMIUM FASHION HOMEPAGE
        ===================================================== */

        .veylix-main-header {
          position: sticky;
          top: 0;
          background: #ffffff;
          box-shadow: 0 1px 0 rgba(0,0,0,.05);
        }

        .veylix-category-nav-inner {
          min-height: 48px;
          gap: 0;
        }

        .veylix-category-nav-inner .veylix-all-category {
          margin-right: 18px;
          min-width: 190px;
          justify-content: space-between;
          background: #f2c24b;
          color: #111111;
        }

        .veylix-nav-category {
          padding: 0 15px;
          font-size: 11px;
        }

        .veylix-fashion-hero {
          margin-top: 10px;
        }

        .veylix-home-grid {
          display: grid;
          grid-template-columns: minmax(0, 3.2fr) minmax(260px, 1.08fr);
          gap: 12px;
          min-height: 470px;
        }

        .veylix-home-main-hero {
          position: relative;
          overflow: hidden;
          border-radius: 10px;
          min-height: 470px;
          background:
            linear-gradient(90deg,
              rgba(245,237,222,.96) 0%,
              rgba(245,237,222,.80) 35%,
              rgba(245,237,222,.04) 63%,
              rgba(245,237,222,0) 100%),
            url("https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1800&q=85")
            center/cover;
        }

        .veylix-home-main-copy {
          position: relative;
          z-index: 2;
          width: 48%;
          min-width: 360px;
          padding: 56px 42px;
        }

        .veylix-home-main-copy h1 {
          margin: 0;
          font-size: clamp(42px, 5vw, 66px);
          line-height: .94;
          letter-spacing: -3px;
          max-width: 520px;
        }

        .veylix-home-main-copy h1 span {
          color: #b68a19;
        }

        .veylix-home-main-copy p {
          margin: 20px 0 0;
          max-width: 390px;
          font-size: 14px;
          line-height: 1.65;
          color: #46423b;
        }

        .veylix-side-promos {
          display: grid;
          grid-template-rows: 1fr 1fr;
          gap: 12px;
        }

        .veylix-side-promo {
          position: relative;
          overflow: hidden;
          border-radius: 10px;
          min-height: 225px;
          padding: 24px;
          display: flex;
          align-items: flex-end;
          text-decoration: none;
          color: #111111;
          background-size: cover;
          background-position: center;
        }

        .veylix-side-promo::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(
            180deg,
            rgba(255,255,255,0.02) 25%,
            rgba(255,255,255,0.90) 100%
          );
        }

        .veylix-side-promo-content {
          position: relative;
          z-index: 2;
          max-width: 220px;
        }

        .veylix-side-promo h3 {
          margin: 0;
          font-size: 22px;
          line-height: 1.02;
          letter-spacing: -.8px;
        }

        .veylix-side-promo p {
          margin: 8px 0 13px;
          font-size: 11px;
        }

        .veylix-side-promo .veylix-primary-btn,
        .veylix-side-promo .veylix-secondary-btn {
          min-height: 38px;
          padding: 0 14px;
        }

        .veylix-benefits {
          margin-top: 0;
          border-radius: 0 0 8px 8px;
        }

        .veylix-category-strip {
          display: grid;
          grid-template-columns: repeat(12, minmax(80px, 1fr));
          gap: 10px;
          overflow-x: auto;
          padding-bottom: 4px;
        }

        .veylix-category-tile {
          min-width: 92px;
          text-decoration: none;
          color: #111111;
          text-align: center;
        }

        .veylix-category-tile-image {
          width: 76px;
          height: 76px;
          margin: 0 auto 8px;
          border-radius: 50%;
          overflow: hidden;
          background: #f5f2ec;
          border: 1px solid #eee8dc;
        }

        .veylix-category-tile-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .veylix-category-tile strong {
          display: block;
          font-size: 10px;
          line-height: 1.2;
        }

        .veylix-section-compact {
          padding-top: 28px;
        }

        .veylix-home-promo-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }

        .veylix-home-promo-wide {
          min-height: 130px;
          padding: 22px;
          border-radius: 8px;
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          text-decoration: none;
          color: #111111;
          background: #f1e2ca;
        }

        .veylix-home-promo-wide:nth-child(2) {
          background:
            linear-gradient(90deg, rgba(17,17,17,.98), rgba(17,17,17,.30)),
            url("https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1000&q=80")
            center/cover;
          color: #ffffff;
        }

        .veylix-home-promo-wide:nth-child(3) {
          background:
            linear-gradient(90deg, rgba(237,226,204,.94), rgba(237,226,204,.28)),
            url("https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=1000&q=80")
            center/cover;
        }

        .veylix-home-promo-wide h3 {
          margin: 0 0 3px;
          font-size: 22px;
        }

        .veylix-home-promo-wide p {
          margin: 0 0 12px;
          font-size: 11px;
        }

        .veylix-trending-tabs {
          display: flex;
          gap: 28px;
          align-items: center;
          flex-wrap: wrap;
        }

        .veylix-trending-tab {
          color: #1d1d1a;
          text-decoration: none;
          font-size: 10px;
          font-weight: 700;
        }

        .veylix-trending-tab.active {
          padding: 9px 18px;
          background: #111111;
          color: #ffffff;
          border-radius: 999px;
        }

        .veylix-category-nav-inner .veylix-nav-category:nth-last-child(1) {
          color: #111111;
        }

        @media (max-width: 1050px) {
          .veylix-header-main {
            flex-wrap: wrap;
            padding: 13px 0;
            row-gap: 12px;
          }

          .veylix-search-box {
            order: 3;
            max-width: none;
            flex-basis: 100%;
          }

          .veylix-home-grid {
            grid-template-columns: minmax(0, 2.2fr) minmax(220px, 1fr);
          }

          .veylix-home-main-copy {
            width: 58%;
            min-width: 0;
            padding: 48px 34px;
          }

          .veylix-category-grid {
            grid-template-columns: repeat(4, 1fr);
          }

          .veylix-products-grid {
            grid-template-columns: repeat(3, 1fr);
          }

          .veylix-benefits {
            grid-template-columns: repeat(2, 1fr);
          }

          .veylix-benefit:nth-child(2) {
            border-right: 0;
          }

          .veylix-benefit:nth-child(-n+2) {
            border-bottom: 1px solid #ece9e3;
          }

          .veylix-home-promo-row {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }

          .veylix-footer-inner {
            grid-template-columns: 2fr 1fr 1fr;
          }
        }

        @media (max-width: 760px) {
          .veylix-main-header {
            position: sticky;
            top: 0;
            z-index: 60;
          }

          .veylix-header-main {
            display: grid;
            grid-template-columns: minmax(0, 1fr) auto;
            align-items: center;
            gap: 12px;
            padding: 12px 0;
          }

          .veylix-brand-logo {
            min-width: 0;
          }

          .veylix-brand-logo img {
            width: 120px;
            max-width: 100%;
          }

          .veylix-header-actions {
            width: auto;
            justify-content: flex-end;
            flex-wrap: nowrap;
            gap: 6px;
          }

          .veylix-action-link {
            width: 40px;
            height: 40px;
          }

          .veylix-login-link {
            min-height: 40px;
            padding: 0 11px;
            white-space: nowrap;
          }

          .veylix-search-box {
            grid-column: 1 / -1;
            width: 100%;
            max-width: none;
            order: 0;
            flex-basis: auto;
            height: 44px;
          }

          .veylix-category-nav-inner {
            width: 100%;
            min-height: 46px;
            padding-bottom: 2px;
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: none;
          }

          .veylix-category-nav-inner::-webkit-scrollbar,
          .veylix-category-strip::-webkit-scrollbar {
            display: none;
          }

          .veylix-all-category {
            flex: 0 0 auto;
            min-width: auto;
            margin-right: 4px;
          }

          .veylix-nav-category {
            flex: 0 0 auto;
            padding: 0 12px;
          }

          .veylix-fashion-hero {
            margin-top: 8px;
          }

          .veylix-home-grid {
            grid-template-columns: 1fr;
            min-height: 0;
            gap: 10px;
          }

          .veylix-home-main-hero {
            min-height: 470px;
          }

          .veylix-home-main-copy {
            width: min(100%, 430px);
            min-width: 0;
            padding: 42px 24px;
          }

          .veylix-home-main-copy h1 {
            font-size: clamp(40px, 11vw, 58px);
            letter-spacing: -2.3px;
          }

          .veylix-home-main-copy p {
            max-width: 330px;
            font-size: 13px;
          }

          .veylix-side-promos {
            grid-template-columns: 1fr;
            grid-template-rows: none;
            gap: 10px;
          }

          .veylix-side-promo {
            min-height: 240px;
          }

          .veylix-benefits {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .veylix-benefit {
            min-width: 0;
            padding: 14px 12px;
            border-right: 1px solid #ece9e3;
          }

          .veylix-benefit:nth-child(even) {
            border-right: 0;
          }

          .veylix-benefit:nth-child(n + 3) {
            border-top: 1px solid #ece9e3;
            border-bottom: 0;
          }

          .veylix-category-strip {
            display: flex;
            width: 100%;
            gap: 12px;
            overflow-x: auto;
            padding: 2px 0 8px;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: none;
          }

          .veylix-category-tile {
            flex: 0 0 86px;
          }

          .veylix-category-tile-image {
            width: 70px;
            height: 70px;
          }

          .veylix-home-promo-row {
            grid-template-columns: 1fr;
          }

          .veylix-home-promo-wide {
            min-height: 150px;
            padding: 20px;
          }

          .veylix-products-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 12px;
          }

          .veylix-product-image {
            height: 240px;
          }

          .veylix-product-info {
            padding: 12px;
          }

          .veylix-footer-inner {
            grid-template-columns: 1fr 1fr;
          }
        }

        @media (max-width: 520px) {
          .veylix-fashion-topbar {
            min-height: 34px;
            height: auto;
            padding: 7px 12px;
            text-align: center;
            line-height: 1.4;
            font-size: 9px;
          }

          .veylix-header-main {
            grid-template-columns: minmax(0, 1fr) auto;
            gap: 9px;
            padding: 11px 0 12px;
          }

          .veylix-brand-logo img {
            width: 108px;
          }

          .veylix-header-actions {
            gap: 4px;
          }

          .veylix-action-link {
            width: 36px;
            height: 36px;
          }

          .veylix-action-link svg {
            width: 17px;
            height: 17px;
          }

          .veylix-login-link {
            min-height: 36px;
            padding: 0 9px;
            font-size: 9px;
            gap: 5px;
          }

          .veylix-login-link svg {
            width: 15px;
            height: 15px;
          }

          .veylix-search-box,
          .veylix-search-button {
            height: 42px;
          }

          .veylix-search-box span {
            font-size: 10px;
            padding-left: 12px;
          }

          .veylix-search-button {
            width: 45px;
          }

          .veylix-category-nav-inner {
            gap: 0;
            padding-left: 0;
            padding-right: 0;
          }

          .veylix-all-category {
            padding: 0 13px;
            font-size: 9px;
          }

          .veylix-nav-category {
            padding: 0 11px;
            font-size: 9px;
          }

          .veylix-home-main-hero {
            min-height: 420px;
            border-radius: 8px;
          }

          .veylix-home-main-copy {
            padding: 34px 20px;
          }

          .veylix-home-main-copy h1 {
            font-size: 42px;
            letter-spacing: -2px;
          }

          .veylix-home-main-copy p {
            margin-top: 16px;
            font-size: 12px;
          }

          .veylix-hero-buttons {
            margin-top: 22px;
            flex-direction: column;
            align-items: flex-start;
          }

          .veylix-primary-btn,
          .veylix-secondary-btn {
            width: auto;
            min-height: 42px;
            padding: 0 14px;
          }

          .veylix-home-main-hero .veylix-hero-overlay {
            right: 14px;
            bottom: 14px;
            font-size: 8px;
            padding: 8px 10px;
          }

          .veylix-side-promo {
            min-height: 215px;
            padding: 18px;
          }

          .veylix-side-promo h3 {
            font-size: 20px;
          }

          .veylix-benefits {
            grid-template-columns: 1fr;
          }

          .veylix-benefit,
          .veylix-benefit:nth-child(even),
          .veylix-benefit:nth-child(n + 3) {
            border-right: 0;
            border-bottom: 1px solid #ece9e3;
            border-top: 0;
          }

          .veylix-benefit:last-child {
            border-bottom: 0;
          }

          .veylix-section {
            padding-top: 32px;
          }

          .veylix-section-head {
            align-items: flex-start;
            gap: 12px;
          }

          .veylix-section-title {
            font-size: 24px;
          }

          .veylix-category-tile {
            flex-basis: 80px;
          }

          .veylix-category-tile-image {
            width: 64px;
            height: 64px;
          }

          .veylix-category-tile strong {
            font-size: 9px;
          }

          .veylix-home-promo-wide {
            min-height: 140px;
            padding: 18px;
          }

          .veylix-home-promo-wide h3 {
            font-size: 20px;
          }

          .veylix-products-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 22px 10px;
          }

          .veylix-product-image {
            height: 205px;
          }

          .veylix-product-wishlist {
            width: 32px;
            height: 32px;
            top: 8px;
            right: 8px;
          }

          .veylix-product-wishlist svg {
            width: 15px;
            height: 15px;
          }

          .veylix-product-info {
            padding: 10px;
          }

          .veylix-product-info h3 {
            font-size: 12px;
            line-height: 1.3;
          }

          .veylix-product-price {
            font-size: 13px;
          }

          .veylix-footer-inner {
            grid-template-columns: 1fr;
            gap: 24px;
          }

          .veylix-footer-bottom {
            flex-direction: column;
            justify-content: center;
            gap: 5px;
            padding: 10px 0;
            text-align: center;
          }
        }

        @media (max-width: 390px) {
          .veylix-login-link span {
            display: none;
          }

          .veylix-login-link {
            width: 36px;
            justify-content: center;
            padding: 0;
          }

          .veylix-brand-logo img {
            width: 98px;
          }

          .veylix-home-main-copy h1 {
            font-size: 38px;
          }

          .veylix-home-main-hero {
            min-height: 400px;
          }

          .veylix-product-image {
            height: 185px;
          }
        }
        @media (max-width: 760px) {
          html,
          body,
          #root {
            max-width: 100%;
            overflow-x: hidden;
          }

          .container {
            width: min(1200px, calc(100% - 24px));
          }

          .veylix-main-header,
          .veylix-fashion-topbar,
          .veylix-category-nav,
          .veylix-fashion-hero,
          .veylix-section,
          .veylix-footer {
            max-width: 100%;
          }
        }

        @media (max-width: 520px) {
          .veylix-header-main {
            grid-template-columns: minmax(0, 1fr) auto;
            width: calc(100% - 20px);
            max-width: none;
            gap: 8px;
            padding: 10px 0 11px;
          }

          .veylix-brand-logo {
            min-width: 0;
            max-width: 118px;
            overflow: hidden;
          }

          .veylix-brand-logo img {
            width: 104px;
            max-width: 100%;
          }

          .veylix-header-actions {
            width: auto;
            min-width: 0;
            max-width: 100%;
            justify-self: end;
            flex-shrink: 0;
            overflow: visible;
          }

          .veylix-login-link {
            width: 38px;
            min-width: 38px;
            max-width: 38px;
            height: 38px;
            min-height: 38px;
            padding: 0;
            justify-content: center;
            gap: 0;
            overflow: hidden;
          }

          .veylix-login-link span {
            display: none !important;
          }

          .veylix-action-link {
            width: 36px;
            min-width: 36px;
            height: 36px;
          }

          .veylix-search-box {
            min-width: 0;
            width: 100%;
            grid-column: 1 / -1;
          }

          .veylix-footer-logo {
            width: 118px;
            filter: invert(1) grayscale(1);
          }
        }

      `}</style>

      <SearchOverlay
        isOpen={searchOpen}
        onClose={() =>
          setSearchOpen(false)
        }
      />

      <div className="veylix-fashion-topbar">
        Free Shipping on Orders Over{" "}
        <strong>&nbsp;৳2,000</strong>
        &nbsp;&nbsp; • &nbsp;&nbsp;
        Easy Returns &nbsp;&nbsp; • &nbsp;&nbsp;
        Genuine Veylix Products
      </div>

      <header className="veylix-main-header">

        <div className="container veylix-header-main">

          <Link
            to="/"
            className="veylix-brand-logo"
            aria-label="Veylix Home"
          >
            <img
              src="/assets/logo.svg"
              alt="Veylix"
            />
          </Link>

          <div
            className="veylix-search-box"
            role="button"
            tabIndex={0}
            onClick={() =>
              setSearchOpen(true)
            }
            onKeyDown={(event) => {
              if (
                event.key === "Enter" ||
                event.key === " "
              ) {
                setSearchOpen(true);
              }
            }}
          >
            <span>
              Search for shirts, pants,
              panjabi, shoes, watches...
            </span>

            <button
              type="button"
              className="veylix-search-button"
              aria-label="Search"
              onClick={(event) => {
                event.stopPropagation();
                setSearchOpen(true);
              }}
            >
              <Search size={18} />
            </button>
          </div>

          <div className="veylix-header-actions">

            <Link
              to="/wishlist"
              className="veylix-action-link"
              aria-label="Wishlist"
            >
              <Heart
                size={18}
                fill={
                  wishlistItems.length > 0
                    ? "currentColor"
                    : "none"
                }
              />

              {wishlistItems.length > 0 && (
                <span className="veylix-action-count">
                  {wishlistItems.length}
                </span>
              )}
            </Link>

            <Link
              to="/cart"
              className="veylix-action-link"
              aria-label="Shopping Cart"
            >
              <ShoppingBag size={18} />

              {cartCount > 0 && (
                <span className="veylix-action-count">
                  {cartCount}
                </span>
              )}
            </Link>

            {isLoggedIn ? (
              <div
                style={{
                  position: "relative",
                }}
              >

                <button
                  type="button"
                  className="veylix-login-link"
                  onClick={() =>
                    setAccountOpen(
                      (current) =>
                        !current
                    )
                  }
                >
                  <UserRound size={16} />

                  <span>
                    {customer?.name ||
                      "Account"}
                  </span>

                  <ChevronDown
                    size={13}
                    style={{
                      transform:
                        accountOpen
                          ? "rotate(180deg)"
                          : "rotate(0deg)",
                      transition:
                        ".2s ease",
                    }}
                  />
                </button>

                {accountOpen && (
                  <div
                    style={{
                      position: "absolute",
                      top: "calc(100% + 9px)",
                      right: 0,
                      width: 215,
                      background: "#ffffff",
                      border:
                        "1px solid #e3e1db",
                      boxShadow:
                        "0 15px 35px rgba(0,0,0,.12)",
                      borderRadius: 5,
                      padding: 8,
                      zIndex: 100,
                    }}
                  >

                    <div
                      style={{
                        padding: "11px",
                        borderBottom:
                          "1px solid #eeeeea",
                        marginBottom: 4,
                      }}
                    >

                      <strong
                        style={{
                          display: "block",
                          fontSize: 12,
                        }}
                      >
                        {customer?.name ||
                          "My Account"}
                      </strong>

                      <span
                        style={{
                          display: "block",
                          marginTop: 4,
                          color: "#858179",
                          fontSize: 9,
                        }}
                      >
                        {customer?.email || ""}
                      </span>

                    </div>

                    <Link
                      to="/orders"
                      onClick={() =>
                        setAccountOpen(false)
                      }
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "10px 11px",
                        textDecoration: "none",
                        color: "#222222",
                        fontSize: 10,
                        fontWeight: 700,
                      }}
                    >
                      <Package size={15} />
                      My Orders
                    </Link>

                    <button
                      type="button"
                      onClick={handleLogout}
                      style={{
                        width: "100%",
                        border: 0,
                        background: "transparent",
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "10px 11px",
                        cursor: "pointer",
                        textAlign: "left",
                        color: "#222222",
                        fontSize: 10,
                        fontWeight: 700,
                      }}
                    >
                      <LogOut size={15} />
                      Logout
                    </button>

                  </div>
                )}

              </div>
            ) : (
              <Link
                to="/customer/login"
                className="veylix-login-link"
              >
                <UserRound size={16} />
                Login / Register
              </Link>
            )}

          </div>

        </div>

        <div className="veylix-category-nav">

          <div className="container veylix-category-nav-inner">

            <Link
              to="/shop"
              className="veylix-all-category"
            >
              All Categories
            </Link>

            <Link
              to="/"
              className="veylix-nav-category"
            >
              Home
            </Link>

            {categories.map(
              (category) => (
                <Link
                  key={category.slug}
                  to={`/shop/${category.slug}`}
                  className="veylix-nav-category"
                >
                  {category.name}
                </Link>
              )
            )}

          </div>

        </div>

      </header>

      <main>

        <section className="veylix-fashion-hero">
          <div className="container">

            <div className="veylix-home-grid">

              <div className="veylix-home-main-hero">
                <div className="veylix-home-main-copy">
                  <p className="veylix-eyebrow">
                    NEW COLLECTION
                  </p>

                  <h1>
                    Style
                    <br />
                    For <span>Every You</span>
                  </h1>

                  <p>
                    Discover premium fashion and lifestyle
                    essentials for modern men and women.
                  </p>

                  <div className="veylix-hero-buttons">
                    <Link
                      to="/shop"
                      className="veylix-primary-btn"
                    >
                      Shop Now
                      <ArrowRight size={15} />
                    </Link>

                    <Link
                      to="/shop/women"
                      className="veylix-secondary-btn"
                    >
                      Explore Collection
                    </Link>
                  </div>
                </div>

                <div className="veylix-hero-overlay">
                  MORE THAN PRODUCTS
                  <br />
                  A BETTER YOU
                </div>
              </div>

              <div className="veylix-side-promos">

                <Link
                  to="/shop/men"
                  className="veylix-side-promo"
                  style={{
                    backgroundImage:
                      'url("https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1000&q=85")',
                  }}
                >
                  <div className="veylix-side-promo-content">
                    <h3>
                      Modern Looks
                      <br />
                      for Modern Men
                    </h3>
                    <p>
                      Shirts • Pants • Shoes • Watches
                    </p>
                    <span className="veylix-primary-btn">
                      Shop Men
                      <ArrowRight size={14} />
                    </span>
                  </div>
                </Link>

                <Link
                  to="/shop/women"
                  className="veylix-side-promo"
                  style={{
                    backgroundImage:
                      'url("https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1000&q=85")',
                  }}
                >
                  <div className="veylix-side-promo-content">
                    <h3>
                      Elegance
                      <br />
                      for Every Her
                    </h3>
                    <p>
                      Clothing • Bags • Accessories
                    </p>
                    <span className="veylix-secondary-btn">
                      Shop Women
                      <ArrowRight size={14} />
                    </span>
                  </div>
                </Link>

              </div>

            </div>

            <div className="veylix-benefits">
              <div className="veylix-benefit">
                <div className="veylix-benefit-icon">
                  <ShoppingBag size={16} />
                </div>
                <div>
                  <strong>Free Shipping</strong>
                  <span>On orders over ৳2,000</span>
                </div>
              </div>

              <div className="veylix-benefit">
                <div className="veylix-benefit-icon">
                  <ShieldCheck size={16} />
                </div>
                <div>
                  <strong>Secure Payment</strong>
                  <span>100% safe & protected</span>
                </div>
              </div>

              <div className="veylix-benefit">
                <div className="veylix-benefit-icon">
                  <RefreshCcw size={16} />
                </div>
                <div>
                  <strong>Easy Returns</strong>
                  <span>Hassle-free return process</span>
                </div>
              </div>

              <div className="veylix-benefit">
                <div className="veylix-benefit-icon">
                  <Users size={16} />
                </div>
                <div>
                  <strong>24/7 Support</strong>
                  <span>We are here for you</span>
                </div>
              </div>
            </div>

          </div>
        </section>

        <section className="veylix-section veylix-section-compact">
          <div className="container">

            <div className="veylix-section-head">
              <div>
                <p className="veylix-section-label">
                  EXPLORE
                </p>
                <h2 className="veylix-section-title">
                  Shop by category
                </h2>
              </div>

              <Link
                to="/shop"
                className="veylix-view-all"
              >
                View All
                <ArrowRight size={14} />
              </Link>
            </div>

            <div className="veylix-category-strip">
              {[
                { name: "All Products", slug: "shop" },
                ...categories,
                { name: "Deals", slug: "deals" },
              ].map((category) => {
                const href =
                  category.slug === "shop"
                    ? "/shop"
                    : `/shop/${category.slug}`;

                const image =
                  category.slug === "shop"
                    ? (
                        featuredProducts[0]?.image ||
                        categoryImageFallbacks.shirts
                      )
                    : getCategoryImage(category);

                return (
                  <Link
                    key={`${category.name}-${category.slug}`}
                    to={href}
                    className="veylix-category-tile"
                  >
                    <div className="veylix-category-tile-image">
                      <img
                        src={image}
                        alt={category.name}
                        onError={(event) => {
                          event.currentTarget.src =
                            categoryImageFallbacks[
                              category.slug
                            ] ||
                            categoryImageFallbacks.shirts;
                        }}
                      />
                    </div>

                    <strong>
                      {category.name}
                    </strong>
                  </Link>
                );
              })}
            </div>

          </div>
        </section>



        <section className="veylix-section veylix-section-compact">
          <div className="container">
            <div className="veylix-home-promo-row">

              <Link
                to="/shop/shirts"
                className="veylix-home-promo-wide"
              >
                <div>
                  <h3>Classic Shirts</h3>
                  <p>For Every Occasion</p>
                  <span className="veylix-primary-btn">
                    Shop Shirts
                    <ArrowRight size={13} />
                  </span>
                </div>
              </Link>

              <Link
                to="/shop/shoes"
                className="veylix-home-promo-wide"
              >
                <div>
                  <h3>Trendy Sneakers</h3>
                  <p>Step Into Style</p>
                  <span className="veylix-secondary-btn">
                    Shop Shoes
                    <ArrowRight size={13} />
                  </span>
                </div>
              </Link>

              <Link
                to="/shop/watches"
                className="veylix-home-promo-wide"
              >
                <div>
                  <h3>Premium Watches</h3>
                  <p>Timeless Elegance</p>
                  <span className="veylix-primary-btn">
                    Shop Watches
                    <ArrowRight size={13} />
                  </span>
                </div>
              </Link>

            </div>
          </div>
        </section>

        <section className="veylix-section">

          <div className="container">

            <div className="veylix-section-head">

              <div>
                <p className="veylix-section-label">
                  OUR PICKS
                </p>

                <h2 className="veylix-section-title">
                  Trending products
                </h2>
              </div>

              <Link
                to="/shop"
                className="veylix-view-all"
              >
                View All
                <ArrowRight size={14} />
              </Link>

            </div>

            <div className="veylix-products-grid">

              {productsLoading ? (
                Array.from({ length: 4 }).map((_, index) => (
                  <article
                    key={`loading-${index}`}
                    className="veylix-product-card"
                    style={{
                      minHeight: "340px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#888",
                      fontSize: "11px",
                    }}
                  >
                    Loading product...
                  </article>
                ))
              ) : featuredProducts.length === 0 ? (
                <div
                  style={{
                    gridColumn: "1 / -1",
                    padding: "50px 20px",
                    textAlign: "center",
                    color: "#777",
                  }}
                >
                  No products available yet.
                </div>
              ) : featuredProducts.map(
                (product) => {

                  const wishlisted =
                    isInWishlist(
                      product.id
                    );

                  return (
                    <article
                      key={product.id}
                      className="veylix-product-card"
                    >

                      <Link
                        to={`/product/${product.id}`}
                        style={{
                          textDecoration:
                            "none",
                          color: "inherit",
                        }}
                      >

                        <div className="veylix-product-image">

                          <img
                            src={
                              product.image
                            }
                            alt={
                              product.name
                            }
                          />

                          <button
                            type="button"
                            className="veylix-product-wishlist"
                            onClick={(event) => {
                              event.preventDefault();
                              event.stopPropagation();
                              toggleWishlist(product);
                            }}
                            aria-label="Wishlist"
                          >
                            <Heart
                              size={16}
                              fill={
                                wishlisted
                                  ? "currentColor"
                                  : "none"
                              }
                            />
                          </button>

                        </div>

                        <div className="veylix-product-info">

                          <p className="veylix-product-category">
                            {product.category}
                          </p>

                          <h3>
                            {product.name}
                          </h3>

                          <p className="veylix-product-price">
                            ৳{" "}
                            {Number(
                              product.price || 0
                            ).toLocaleString()}
                          </p>

                        </div>

                      </Link>

                    </article>
                  );
                }
              )}

            </div>

          </div>

        </section>

        <section className="container">

          <div className="veylix-brand-story">

            <div className="veylix-brand-story-inner">

              <small>
                VEYLIX
              </small>

              <h2>
                More Than Fashion.
                <br />
                A Better Style.
              </h2>

              <p>
                Veylix brings together
                clothing, confidence and
                everyday lifestyle essentials
                for both men and women.
              </p>

            </div>

          </div>

        </section>

      </main>

      <footer className="veylix-footer">

        <div className="container">

          <div className="veylix-footer-inner">

            <div>

              <Link to="/">
                <img
                  src="/assets/logo.svg"
                  alt="Veylix"
                  className="veylix-footer-logo"
                />
              </Link>

              <p>
                Premium fashion and
                lifestyle essentials for
                every style, every day.
              </p>

            </div>

            <div>

              <h4>
                Shop
              </h4>

              <Link to="/shop/shirts">
                Shirts
              </Link>

              <Link to="/shop/t-shirts">
                T-Shirts
              </Link>

              <Link to="/shop/pants">
                Pants
              </Link>

              <Link to="/shop/panjabi">
                Panjabi
              </Link>

            </div>

            <div>

              <h4>
                Lifestyle
              </h4>

              <Link to="/shop/shoes">
                Shoes
              </Link>

              <Link to="/shop/watches">
                Watches
              </Link>

              <Link to="/shop/wallets">
                Wallets
              </Link>

              <Link to="/shop/ladies-bags">
                Ladies Bags
              </Link>

            </div>

            <div>

              <h4>
                Veylix
              </h4>

              <Link to="/orders">
                My Orders
              </Link>

              <Link to="/wishlist">
                Wishlist
              </Link>

              <Link to="/cart">
                Cart
              </Link>

              <Link to="/shop">
                All Products
              </Link>

            </div>

          </div>

          <div className="veylix-footer-bottom">

            <span>
              © 2026 Veylix. All rights reserved.
            </span>

            <span>
              STYLE FOR EVERY YOU
            </span>

          </div>

        </div>

      </footer>

    </div>
  );
}

export default App;
