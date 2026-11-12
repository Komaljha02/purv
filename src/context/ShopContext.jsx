
import { supabase } from "../lib/supabase";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const ShopContext = createContext(null);

function readStorage(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch (error) {
    console.error(`Error reading ${key}:`, error);
    return fallback;
  }
}

function writeStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving ${key}:`, error);
  }
}

export function ShopProvider({ children }) {
  const [cart, setCart] = useState(() => readStorage("purv-cart", []));
  const [wishlist, setWishlist] = useState(() =>
    readStorage("purv-wishlist", [])
  );
  const [addresses, setAddresses] = useState(() =>
    readStorage("purv-addresses", [])
  );
  const [orders, setOrders] = useState(() =>
    readStorage("purv-orders", [])
  );

  useEffect(() => writeStorage("purv-cart", cart), [cart]);
  useEffect(() => writeStorage("purv-wishlist", wishlist), [wishlist]);
  useEffect(() => writeStorage("purv-addresses", addresses), [addresses]);
  useEffect(() => writeStorage("purv-orders", orders), [orders]);

  function addToCart(product) {
    if (!product?.id) return;

    const stock = Number(product.stock);
    if (Number.isFinite(stock) && stock <= 0) return;

    setCart((previous) => {
      const existingProduct = previous.find(
        (item) => item.id === product.id
      );

      if (existingProduct) {
        const currentQuantity = Number(existingProduct.quantity) || 0;

        if (Number.isFinite(stock) && currentQuantity >= stock) {
          return previous;
        }

        return previous.map((item) =>
          item.id === product.id
            ? { ...item, quantity: currentQuantity + 1 }
            : item
        );
      }

      return [...previous, { ...product, quantity: 1 }];
    });
  }

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
            return { ...item, quantity: 0 };
          }

          const stock = Number(item.stock);

          if (Number.isFinite(stock) && stock >= 0) {
            return {
              ...item,
              quantity: Math.min(nextQuantity, stock),
            };
          }

          return { ...item, quantity: nextQuantity };
        })
        .filter((item) => item.quantity > 0)
    );
  }

  function removeFromCart(productId) {
    setCart((previous) =>
      previous.filter((item) => item.id !== productId)
    );
  }

  function toggleWishlist(productId) {
    setWishlist((previous) =>
      previous.includes(productId)
        ? previous.filter((id) => id !== productId)
        : [...previous, productId]
    );
  }

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

  // Place order and save the selected delivery schedule.
  async function placeOrder(
    addressId,
    paymentMethod,
    deliverySchedule = {}
  ) {
    if (cart.length === 0) return null;

    const selectedAddress = addresses.find(
      (address) => address.id === addressId
    );

    if (!selectedAddress) return null;

    const deliveryDate = deliverySchedule.deliveryDate || null;
    const deliveryTimeSlot =
      deliverySchedule.deliveryTimeSlot || null;

    if (!deliveryDate || !deliveryTimeSlot) {
      throw new Error("Please select a delivery date and time slot.");
    }

    const subtotal = cart.reduce(
      (total, item) =>
        total +
        Number(item.price || 0) * Number(item.quantity || 0),
      0
    );

    const deliveryCharge = 0;

    const orderId =
      typeof crypto !== "undefined" &&
      typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `order-${Date.now()}`;

    const orderNumber = `PURV-${Date.now()}`;

    const orderItems = cart.map((item) => ({
      id: item.id,
      name: item.name || "Product",
      price: Number(item.price || 0),
      quantity: Number(item.quantity || 0),
      image:
        item.image ||
        item.image_url ||
        item.product_image ||
        item.productImage ||
        item.thumbnail ||
        "",
    }));

    const newOrder = {
      id: orderId,
      order_number: orderNumber,
      items: orderItems,
      delivery_address: { ...selectedAddress },
      payment_method: paymentMethod,
      payment_status:
        paymentMethod === "Cash on Delivery"
          ? "Pending"
          : "Demo payment - not processed",
      delivery_date: deliveryDate,
      delivery_time_slot: deliveryTimeSlot,
      subtotal,
      delivery_charge: deliveryCharge,
      total: subtotal + deliveryCharge,
      status: "Order placed",
    };

    try {
      const { error } = await supabase
        .from("orders")
        .insert([newOrder]);

      if (error) throw error;

      const customerOrder = {
        ...newOrder,
        orderNumber,
        paymentMethod,
        createdAt: new Date().toISOString(),
        address: { ...selectedAddress },
      };

      setOrders((previous) => [
        customerOrder,
        ...previous,
      ]);

      setCart([]);
      return customerOrder;
    } catch (error) {
      console.error("Supabase order error:", error);
      throw error;
    }
  }

  const cartCount = useMemo(
    () =>
      cart.reduce(
        (total, item) => total + (Number(item.quantity) || 0),
        0
      ),
    [cart]
  );

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
    [cart, wishlist, addresses, orders, cartCount, cartTotal]
  );

  return (
    <ShopContext.Provider value={value}>
      {children}
    </ShopContext.Provider>
  );
}

export function useShop() {
  const context = useContext(ShopContext);

  if (!context) {
    throw new Error("useShop must be used inside ShopProvider");
  }

  return context;
}
