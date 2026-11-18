import { Link, useLocation } from "react-router-dom";
import { CheckCircle2, ShoppingBag, X, ArrowRight } from "lucide-react";
import { supabase } from "../lib/supabase";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
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
function normalizeAddress(address) {
  return [
    address.fullName,
    address.phone,
    address.house,
    address.area,
    address.city,
    address.state,
    address.pincode,
  ]
    .map((value) =>
      String(value || "")
        .trim()
        .toLowerCase(),
    )
    .join("|");
}

function getAddressFromOrder(order) {
  return order?.delivery_address || order?.address || null;
}

function mergeAddresses(savedAddresses = [], previousOrders = []) {
  const combined = [...savedAddresses];

  previousOrders.forEach((order) => {
    const address = getAddressFromOrder(order);
    if (!address) return;

    const exists = combined.some(
      (saved) => normalizeAddress(saved) === normalizeAddress(address),
    );

    if (!exists) {
      combined.push({
        ...address,
        id:
          address.id ||
          `recovered-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      });
    }
  });

  return combined;
}

export function ShopProvider({ children }) {
  const [cart, setCart] = useState(() => readStorage("purv-cart", []));
  const location = useLocation();

  const [wishlist, setWishlist] = useState(() =>
    readStorage("purv-wishlist", []),
  );

  const [orders, setOrders] = useState(() => readStorage("purv-orders", []));

  const [addresses, setAddresses] = useState(() =>
    mergeAddresses(
      readStorage("purv-addresses", []),
      readStorage("purv-orders", []),
    ),
  );

  useEffect(() => writeStorage("purv-cart", cart), [cart]);
  useEffect(() => writeStorage("purv-wishlist", wishlist), [wishlist]);
  useEffect(() => writeStorage("purv-addresses", addresses), [addresses]);
  useEffect(() => writeStorage("purv-orders", orders), [orders]);
  const [cartToast, setCartToast] = useState(null);
  const toastTimer = useRef(null);

  function showCartToast(count) {
    setCartToast({ count });

    if (toastTimer.current) {
      clearTimeout(toastTimer.current);
    }

    toastTimer.current = setTimeout(() => {
      setCartToast(null);
    }, 3500);
  }

  function closeCartToast() {
    if (toastTimer.current) {
      clearTimeout(toastTimer.current);
    }

    setCartToast(null);
  }

  useEffect(() => {
    return () => {
      if (toastTimer.current) {
        clearTimeout(toastTimer.current);
      }
    };
  }, []);
  // Add product to cart
  function addToCart(product) {
    if (!product || product.id == null) return;

    const stock =
      product.stock == null || product.stock === ""
        ? null
        : Number(product.stock);

    if (stock !== null && Number.isFinite(stock) && stock <= 0) {
      return;
    }

    const existingProduct = cart.find(
      (item) => String(item.id) === String(product.id),
    );

    const updatedCart = existingProduct
      ? cart.map((item) =>
          String(item.id) === String(product.id)
            ? {
                ...item,
                quantity: (Number(item.quantity) || 0) + 1,
              }
            : item,
        )
      : [...cart, { ...product, quantity: 1 }];

    setCart(updatedCart);

    const totalItems = updatedCart.reduce(
      (total, item) => total + (Number(item.quantity) || 0),
      0,
    );

    showCartToast(totalItems);
  }

  // Change product quantity
  function changeQuantity(productId, change) {
    const amount = Number(change);

    if (!Number.isFinite(amount) || amount === 0) return;

    const updatedCart = cart
      .map((item) => {
        if (String(item.id) !== String(productId)) return item;

        const currentQuantity = Number(item.quantity) || 0;
        const nextQuantity = currentQuantity + amount;

        return {
          ...item,
          quantity: Math.max(0, nextQuantity),
        };
      })
      .filter((item) => item.quantity > 0);

    setCart(updatedCart);

    // Show popup only when adding quantity
    if (amount > 0) {
      const totalItems = updatedCart.reduce(
        (total, item) => total + (Number(item.quantity) || 0),
        0,
      );

      showCartToast(totalItems);
    }
  }

  // Remove product from cart
  function removeFromCart(productId) {
    setCart((previous) =>
      previous.filter((item) => String(item.id) !== String(productId)),
    );
  }

  // Add or remove product from wishlist
  function toggleWishlist(productId) {
    setWishlist((previous) =>
      previous.includes(productId)
        ? previous.filter((id) => id !== productId)
        : [...previous, productId],
    );
  }

  // Save delivery address
  function saveAddress(address) {
    const addressKey = normalizeAddress(address);

    const existingAddress = addresses.find(
      (saved) => normalizeAddress(saved) === addressKey,
    );

    // If this address is already saved, reuse it
    if (existingAddress) {
      return existingAddress;
    }

    const newAddress = {
      ...address,
      id:
        typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
          ? crypto.randomUUID()
          : `address-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    };

    setAddresses((previous) => {
      const alreadyExists = previous.some(
        (saved) => normalizeAddress(saved) === addressKey,
      );

      if (alreadyExists) return previous;

      return [...previous, newAddress];
    });

    return newAddress;
  }

  // Place order with delivery and payment details
  async function placeOrder(
    addressId,
    paymentMethod,
    deliverySchedule = {},
    paymentDetails = {},
  ) {
    if (cart.length === 0) {
      throw new Error("Your cart is empty.");
    }

    const selectedAddress = addresses.find(
      (address) => String(address.id) === String(addressId),
    );

    if (!selectedAddress) {
      throw new Error("Please select a delivery address.");
    }

    // Delivery type
    const deliveryType =
      deliverySchedule.deliveryType === "fast" ? "fast" : "scheduled";

    const deliveryDate =
      deliveryType === "scheduled"
        ? deliverySchedule.deliveryDate || null
        : null;

    const deliveryTimeSlot =
      deliveryType === "scheduled"
        ? deliverySchedule.deliveryTimeSlot || null
        : "Fast delivery - within 1 hour";

    // Validate scheduled delivery
    if (deliveryType === "scheduled" && (!deliveryDate || !deliveryTimeSlot)) {
      throw new Error("Please select a delivery date and time slot.");
    }

    const deliveryEstimate = deliveryType === "fast" ? "Within 1 hour" : null;

    // Calculate cart subtotal
    const subtotal = cart.reduce(
      (total, item) =>
        total + Number(item.price || 0) * Number(item.quantity || 0),
      0,
    );

    const deliveryCharge = 0;

    const orderId =
      typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `order-${Date.now()}`;

    const orderNumber = `PURV-${Date.now()}`;

    // Prepare order items
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

    // Gift voucher details (redemption is not implemented here)
    const giftVoucherCode =
      paymentDetails.giftVoucherCode?.trim().toUpperCase() || null;

    const giftVoucherDiscount = 0;

    // Payment status
    const paymentStatus =
      paymentMethod === "Cash on Delivery" ? "Pending" : "Pending verification";

    // Prepare order for Supabase
    const newOrder = {
      id: orderId,
      order_number: orderNumber,

      items: orderItems,

      delivery_address: {
        ...selectedAddress,
      },

      payment_method: paymentMethod,

      payment_status: paymentStatus,

      // Kept as null for compatibility with an existing
      // Supabase column. No UTR is requested or stored.
      payment_reference: null,

      gift_voucher_code: giftVoucherCode,

      gift_voucher_discount: giftVoucherDiscount,

      delivery_type: deliveryType,
      delivery_estimate: deliveryEstimate,
      delivery_date: deliveryDate,
      delivery_time_slot: deliveryTimeSlot,

      subtotal,
      delivery_charge: deliveryCharge,
      total: subtotal + deliveryCharge,

      status: "Order placed",
    };

    try {
      const { error } = await supabase.from("orders").insert([newOrder]);

      if (error) throw error;
      // Automatically keep this delivery address in saved addresses
      saveAddress(selectedAddress);

      // Save order locally
      const customerOrder = {
        ...newOrder,

        orderNumber,

        paymentMethod,

        giftVoucherCode,

        giftVoucherDiscount,

        createdAt: new Date().toISOString(),

        address: {
          ...selectedAddress,
        },
      };

      setOrders((previous) => [customerOrder, ...previous]);

      // Clear cart only after successful Supabase insertion
      setCart([]);

      return customerOrder;
    } catch (error) {
      console.error("Supabase order error:", error);
      throw error;
    }
  }

  // Total number of cart items
  const cartCount = useMemo(
    () => cart.reduce((total, item) => total + (Number(item.quantity) || 0), 0),
    [cart],
  );

  // Cart subtotal
  const cartTotal = useMemo(
    () =>
      cart.reduce(
        (total, item) =>
          total + (Number(item.price) || 0) * (Number(item.quantity) || 0),
        0,
      ),
    [cart],
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
    [cart, wishlist, addresses, orders, cartCount, cartTotal],
  );

  return (
    <ShopContext.Provider value={value}>
      {children}

      {/* Persistent floating cart bar */}
    {cartCount > 0 &&
  (
    location.pathname === "/" ||
    location.pathname === "/categories" ||
    location.pathname.startsWith("/category/")
  ) && (
          <div className="purv-floating-cart">
            {/* Left: Items and total */}
            <div className="flex min-w-0 flex-1 flex-col justify-center">
              <p className="text-sm font-bold text-white">
                {cartCount} {cartCount === 1 ? "item" : "items"}
              </p>

              <p className="mt-1 text-lg font-extrabold text-white">
                ₹{cartTotal.toLocaleString("en-IN")}
              </p>

              <p className="text-[10px] text-white/70">
                Your cart is waiting for you
              </p>
            </div>

            {/* Right: Cart button */}
            <Link to="/cart" className="purv-floating-cart-button">
              <ShoppingBag size={19} />
              <span>Cart</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        )}
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
