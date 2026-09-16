import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const CartContext = createContext(null);

const CART_STORAGE_KEY = "veylix_cart";
const WISHLIST_STORAGE_KEY = "veylix_wishlist";

export function CartProvider({ children }) {
  /* =====================================================
     CART
  ===================================================== */

  const [cartItems, setCartItems] = useState(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);

      if (!savedCart) {
        return [];
      }

      const parsedCart = JSON.parse(savedCart);

      return Array.isArray(parsedCart)
        ? parsedCart
        : [];
    } catch {
      return [];
    }
  });


  /* =====================================================
     WISHLIST
  ===================================================== */

  const [wishlistItems, setWishlistItems] = useState(() => {
    try {
      const savedWishlist = localStorage.getItem(
        WISHLIST_STORAGE_KEY
      );

      if (!savedWishlist) {
        return [];
      }

      const parsedWishlist =
        JSON.parse(savedWishlist);

      return Array.isArray(parsedWishlist)
        ? parsedWishlist
        : [];
    } catch {
      return [];
    }
  });


  /* =====================================================
     SAVE CART
  ===================================================== */

  useEffect(() => {
    localStorage.setItem(
      CART_STORAGE_KEY,
      JSON.stringify(cartItems)
    );
  }, [cartItems]);


  /* =====================================================
     SAVE WISHLIST
  ===================================================== */

  useEffect(() => {
    localStorage.setItem(
      WISHLIST_STORAGE_KEY,
      JSON.stringify(wishlistItems)
    );
  }, [wishlistItems]);


  /* =====================================================
     ADD TO CART
  ===================================================== */

  const addToCart = (product, quantity = 1) => {
    setCartItems((currentItems) => {
      const existingItem = currentItems.find(
        (item) => item.id === product.id
      );

      if (existingItem) {
        return currentItems.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity:
                  item.quantity + quantity,
              }
            : item
        );
      }

      return [
        ...currentItems,
        {
          ...product,
          quantity,
        },
      ];
    });
  };


  /* =====================================================
     INCREASE QUANTITY
  ===================================================== */

  const increaseQuantity = (id) => {
    setCartItems((currentItems) =>
      currentItems.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity: item.quantity + 1,
            }
          : item
      )
    );
  };


  /* =====================================================
     DECREASE QUANTITY
  ===================================================== */

  const decreaseQuantity = (id) => {
    setCartItems((currentItems) =>
      currentItems
        .map((item) =>
          item.id === id
            ? {
                ...item,
                quantity: item.quantity - 1,
              }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };


  /* =====================================================
     UPDATE QUANTITY
  ===================================================== */

  const updateQuantity = (id, quantity) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }

    setCartItems((currentItems) =>
      currentItems.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity,
            }
          : item
      )
    );
  };


  /* =====================================================
     REMOVE FROM CART
  ===================================================== */

  const removeFromCart = (id) => {
    setCartItems((currentItems) =>
      currentItems.filter(
        (item) => item.id !== id
      )
    );
  };


  /* =====================================================
     CLEAR CART
  ===================================================== */

  const clearCart = () => {
    setCartItems([]);
  };


  /* =====================================================
     CART COUNT
  ===================================================== */

  const cartCount = useMemo(() => {
    return cartItems.reduce(
      (total, item) =>
        total + Number(item.quantity || 0),
      0
    );
  }, [cartItems]);


  /* =====================================================
     SUBTOTAL
  ===================================================== */

  const cartSubtotal = useMemo(() => {
    return cartItems.reduce(
      (total, item) =>
        total +
        Number(item.price || 0) *
          Number(item.quantity || 0),
      0
    );
  }, [cartItems]);


  /* =====================================================
     SHIPPING
  ===================================================== */

  const shipping =
    cartItems.length > 0 ? 100 : 0;


  /* =====================================================
     TOTAL
  ===================================================== */

  const cartTotal =
    cartSubtotal + shipping;


  /* =====================================================
     TOGGLE WISHLIST
  ===================================================== */

  const toggleWishlist = (product) => {
    setWishlistItems((currentItems) => {

      const exists = currentItems.some(
        (item) => item.id === product.id
      );

      if (exists) {
        return currentItems.filter(
          (item) => item.id !== product.id
        );
      }

      return [
        ...currentItems,
        product,
      ];

    });
  };


  /* =====================================================
     REMOVE WISHLIST
  ===================================================== */

  const removeFromWishlist = (id) => {
    setWishlistItems((currentItems) =>
      currentItems.filter(
        (item) => item.id !== id
      )
    );
  };


  /* =====================================================
     CHECK WISHLIST
  ===================================================== */

  const isInWishlist = (id) => {
    return wishlistItems.some(
      (item) => item.id === id
    );
  };


  const value = {
    /* Cart */
    cartItems,
    cartCount,
    cartSubtotal,
    shipping,
    cartTotal,

    addToCart,
    increaseQuantity,
    decreaseQuantity,
    updateQuantity,
    removeFromCart,
    clearCart,

    /* Wishlist */
    wishlistItems,
    toggleWishlist,
    removeFromWishlist,
    isInWishlist,
  };


  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}


export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(
      "useCart must be used inside CartProvider"
    );
  }

  return context;
}


export default CartContext;