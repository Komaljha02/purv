
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const ShopContext = createContext(null);

// Read saved data safely from localStorage
function readStorage(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch (error) {
    console.error(`Error reading ${key}:`, error);
    return fallback;
  }
}

// Save data safely to localStorage
function writeStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving ${key}:`, error);
  }
}

export function ShopProvider({ children }) {
  // Shopping data
  const [cart, setCart] = useState(() =>
    readStorage("purv-cart", [])
  );

  const [wishlist, setWishlist] = useState(() =>
    readStorage("purv-wishlist", [])
  );

  const [addresses, setAddresses] = useState(() =>
    readStorage("purv-addresses", [])
  );

  const [orders, setOrders] = useState(() =>
    readStorage("purv-orders", [])
  );

  // Persist data automatically
  useEffect(() => {
    writeStorage("purv-cart", cart);
  }, [cart]);

  useEffect(() => {
    writeStorage("purv-wishlist", wishlist);
  }, [wishlist]);

  useEffect(() => {
    writeStorage("purv-addresses", addresses);
  }, [addresses]);

  useEffect(() => {
    writeStorage("purv-orders", orders);
  }, [orders]);

  // Add a product to the cart
  function addToCart(product) {
    if (!product?.id) return;

    const stock = Number(product.stock);

    // Do not add products that are out of stock
    if (Number.isFinite(stock) && stock <= 0) return;

    setCart((previous) => {
      const existingProduct = previous.find(
        (item) => item.id === product.id
      );

      if (existingProduct) {
        const currentQuantity = Number(existingProduct.quantity) || 0;

        // Respect the stock limit when stock is provided
        if (
          Number.isFinite(stock) &&
          currentQuantity >= stock
        ) {
          return previous;
        }

        return previous.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity: currentQuantity + 1,
              }
            : item
        );
      }

      return [
        ...previous,
        {
          ...product,
          quantity: 1,
        },
      ];
    });
  }

  // Change quantity by +1 or -1
  function changeQuantity(productId, change) {
    const amount = Number(change);

    if (!Number.isFinite(amount) || amount === 0) return;

    setCart((previous) =>
      previous
        .map((item) => {
          if (item.id !== productId) return item;

          const currentQuantity = Number(item.quantity) || 0;
          const nextQuantity = currentQuantity + amount;

          if (nextQuantity <= 0) {
            return {
              ...item,
              quantity: 0,
            };
          }

          const stock = Number(item.stock);

          // Enforce the available stock limit
          if (
            Number.isFinite(stock) &&
            stock >= 0
          ) {
            return {
              ...item,
              quantity: Math.min(nextQuantity, stock),
            };
          }

          return {
            ...item,
            quantity: nextQuantity,
          };
        })
        .filter((item) => item.quantity > 0)
    );
  }

  // Remove a product completely from the cart
  function removeFromCart(productId) {
    setCart((previous) =>
      previous.filter((item) => item.id !== productId)
    );
  }

  // Add or remove a product from the wishlist
  function toggleWishlist(productId) {
    setWishlist((previous) =>
      previous.includes(productId)
        ? previous.filter((id) => id !== productId)
        : [...previous, productId]
    );
  }

  // Save a delivery address
  function saveAddress(address) {
    const newAddress = {
      ...address,
      id:
        typeof crypto !== "undefined" &&
        typeof crypto.randomUUID === "function"
          ? crypto.randomUUID()
          : `address-${Date.now()}-${Math.random()
              .toString(36)
              .slice(2, 9)}`,
    };

    setAddresses((previous) => [...previous, newAddress]);

    return newAddress;
  }

  // Place an order
  function placeOrder(addressId, paymentMethod) {
    if (cart.length === 0) return null;

    const selectedAddress = addresses.find(
      (address) => address.id === addressId
    );

    if (!selectedAddress) return null;

    const subtotal = cart.reduce(
      (total, item) =>
        total + Number(item.price || 0) * Number(item.quantity || 0),
      0
    );

    const newOrder = {
      id: `PURV-${Date.now()}`,
      items: cart.map((item) => ({ ...item })),
      address: { ...selectedAddress },
      paymentMethod,
      subtotal,
      status: "Order placed",
      createdAt: new Date().toISOString(),
    };

    setOrders((previous) => [newOrder, ...previous]);
    setCart([]);

    return newOrder;
  }

  // Total quantity of items in the cart
  const cartCount = useMemo(
    () =>
      cart.reduce(
        (total, item) =>
          total + (Number(item.quantity) || 0),
        0
      ),
    [cart]
  );

  // Total price of all cart items
  const cartTotal = useMemo(
    () =>
      cart.reduce(
        (total, item) =>
          total +
          (Number(item.price) || 0) *
            (Number(item.quantity) || 0),
        0
      ),
    [cart]
  );

  // Expose shopping state and functions to components
  const value = useMemo(
    () => ({
      cart,
      wishlist,
      addresses,
      orders,
      cartCount,
      cartTotal,
      addToCart,
      changeQuantity,
      removeFromCart,
      toggleWishlist,
      saveAddress,
      placeOrder,
    }),
    [
      cart,
      wishlist,
      addresses,
      orders,
      cartCount,
      cartTotal,
    ]
  );

  return (
    <ShopContext.Provider value={value}>
      {children}
    </ShopContext.Provider>
  );
}

// Shared shopping hook
export function useShop() {
  const context = useContext(ShopContext);

  if (!context) {
    throw new Error(
      "useShop must be used inside ShopProvider"
    );
  }

  return context;
}
