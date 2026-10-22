
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  CreditCard,
  LockKeyhole,
  MapPin,
  PackageCheck,
  ShieldCheck,
  ShoppingBag,
  Wallet,
  Sparkles,
} from "lucide-react";

import Header from "../components/Header";
import { useShop } from "../context/ShopContext";

export default function Payment() {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    cart,
    cartTotal,
    addresses,
    placeOrder,
  } = useShop();

  const [paymentMethod, setPaymentMethod] = useState("Cash on Delivery");
  const [error, setError] = useState("");
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const addressId = location.state?.addressId;

  const address = addresses.find(
    (item) => item.id === addressId
  );

  const itemCount = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const subtotal = cartTotal;
  const deliveryCharge = 0;
  const grandTotal = subtotal + deliveryCharge;

  function handlePlaceOrder() {
    if (isPlacingOrder) return;

    setError("");

    if (cart.length === 0) {
      setError("Your cart is empty. Please add products before placing an order.");
      return;
    }

    if (!address) {
      setError("Please select your delivery address before continuing.");
      return;
    }

    setIsPlacingOrder(true);

    try {
      const order = placeOrder(addressId, paymentMethod);

      if (order) {
        navigate(`/order-success/${order.id}`, {
          replace: true,
        });
      } else {
        setError("We couldn't place your order. Please try again.");
        setIsPlacingOrder(false);
      }
    } catch (err) {
      console.error("Order placement failed:", err);
      setError("Something went wrong while placing your order. Please try again.");
      setIsPlacingOrder(false);
    }
  }

  return (
    <>
      <Header />

      <main className="min-h-screen bg-[#fffaf4] px-4 pb-16 pt-36 sm:px-6 sm:pt-40 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <Link
            to="/checkout/address"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#8b3026] transition hover:text-[#54251f]"
          >
            <ArrowLeft size={17} />
            Back to delivery address
          </Link>

          {/* Page heading */}
          <div className="mt-7">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-[#b45324]">
              <Sparkles size={16} />
              Almost there
            </div>

            <h1 className="font-serif text-3xl font-bold text-[#54251f] sm:text-4xl">
              Payment & Review
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#806b61] sm:text-base">
              Review your delivery details, choose how you want to pay,
              and get your festive favourites delivered to your door.
            </p>
          </div>

          {/* Checkout progress */}
          <div className="mt-8 flex max-w-2xl items-center gap-3 sm:gap-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-green-700">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                <Check size={16} />
              </span>
              <span>Address</span>
            </div>

            <div className="h-px flex-1 bg-[#e8d8c8]" />

            <div className="flex items-center gap-2 text-sm font-semibold text-[#8b3026]">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#8b3026] text-white">
                2
              </span>
              <span>Payment</span>
            </div>

            <div className="h-px flex-1 bg-[#e8d8c8]" />

            <div className="flex items-center gap-2 text-sm text-[#a8998f]">
              <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#e8d8c8]">
                3
              </span>
              <span className="hidden sm:inline">Confirmation</span>
            </div>
          </div>

          {/* Empty cart */}
          {cart.length === 0 ? (
            <div className="mt-10 rounded-3xl border border-[#f0dfca] bg-white p-8 text-center shadow-sm sm:p-12">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#fff0dc] text-[#8b3026]">
                <ShoppingBag size={30} />
              </div>

              <h2 className="mt-5 text-2xl font-bold text-[#54251f]">
                Your cart is empty
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                Add something beautiful to your cart before proceeding
                to checkout.
              </p>

              <Link
                to="/"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#8b3026] px-7 py-3 font-semibold text-white transition hover:bg-[#68271f]"
              >
                Explore Purv
                <ArrowRight size={17} />
              </Link>
            </div>
          ) : !address ? (
            <div className="mt-10 max-w-xl rounded-3xl border border-[#f0dfca] bg-white p-7 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#fff0dc] text-[#8b3026]">
                <MapPin size={23} />
              </div>

              <h2 className="mt-4 text-xl font-bold text-[#54251f]">
                Delivery address required
              </h2>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                Please select a saved address or add a new address
                before reviewing your order.
              </p>

              <button
                type="button"
                onClick={() => navigate("/checkout/address")}
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#8b3026] px-6 py-3 font-semibold text-white transition hover:bg-[#68271f]"
              >
                Select Address
                <ArrowRight size={17} />
              </button>
            </div>
          ) : (
            <div className="mt-9 grid items-start gap-7 lg:grid-cols-[1fr_370px] xl:grid-cols-[1fr_400px]">
              {/* Left column */}
              <section className="space-y-6">
                {/* Delivery address */}
                <div className="rounded-3xl border border-[#f0dfca] bg-white p-5 shadow-sm sm:p-7">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#fff0dc] text-[#8b3026]">
                        <MapPin size={21} />
                      </div>

                      <div>
                        <h2 className="text-lg font-bold text-[#54251f]">
                          Delivery address
                        </h2>
                        <p className="mt-1 text-sm text-gray-500">
                          Your order will be delivered here
                        </p>
                      </div>
                    </div>

                    <Link
                      to="/checkout/address"
                      className="shrink-0 text-sm font-semibold text-[#b45324] hover:text-[#8b3026]"
                    >
                      Change
                    </Link>
                  </div>

                  <div className="mt-5 rounded-2xl border border-[#f0dfca] bg-[#fffaf4] p-4 sm:p-5">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-[#54251f]">
                        {address.fullName}
                      </h3>
                      <span className="rounded-full bg-[#f5e7d5] px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#8b3026]">
                        Deliver to
                      </span>
                    </div>

                    <p className="mt-2 text-sm leading-6 text-gray-600">
                      {address.house}, {address.area}, {address.city},{" "}
                      {address.state} - {address.pincode}
                    </p>

                    <p className="mt-2 text-sm font-medium text-gray-600">
                      Phone: {address.phone}
                    </p>
                  </div>
                </div>

                {/* Payment method */}
                <div className="rounded-3xl border border-[#f0dfca] bg-white p-5 shadow-sm sm:p-7">
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#fff0dc] text-[#8b3026]">
                      <CreditCard size={21} />
                    </div>

                    <div>
                      <h2 className="text-lg font-bold text-[#54251f]">
                        Payment method
                      </h2>
                      <p className="mt-1 text-sm text-gray-500">
                        Choose your preferred payment option
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 space-y-3">
                    {/* Cash on delivery */}
                    <label
                      className={`flex cursor-pointer items-start gap-4 rounded-2xl border p-4 transition sm:p-5 ${
                        paymentMethod === "Cash on Delivery"
                          ? "border-[#8b3026] bg-[#fff8ef] ring-1 ring-[#8b3026]"
                          : "border-[#eee3d8] hover:border-[#d8b9a3]"
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value="Cash on Delivery"
                        checked={paymentMethod === "Cash on Delivery"}
                        onChange={() => setPaymentMethod("Cash on Delivery")}
                        className="mt-1 h-4 w-4 accent-[#8b3026]"
                      />

                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#f8eadb] text-[#8b3026]">
                        <Wallet size={22} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-[#54251f]">
                            Cash on Delivery
                          </span>
                          {paymentMethod === "Cash on Delivery" && (
                            <CheckCircle2
                              size={17}
                              className="text-green-600"
                            />
                          )}
                        </div>

                        <p className="mt-1 text-sm leading-5 text-gray-500">
                          Pay when your order arrives at your doorstep.
                        </p>
                      </div>
                    </label>

                    {/* Demo online payment */}
                    <label
                      className={`flex cursor-pointer items-start gap-4 rounded-2xl border p-4 transition sm:p-5 ${
                        paymentMethod === "Demo Online Payment"
                          ? "border-[#8b3026] bg-[#fff8ef] ring-1 ring-[#8b3026]"
                          : "border-[#eee3d8] hover:border-[#d8b9a3]"
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value="Demo Online Payment"
                        checked={paymentMethod === "Demo Online Payment"}
                        onChange={() => setPaymentMethod("Demo Online Payment")}
                        className="mt-1 h-4 w-4 accent-[#8b3026]"
                      />

                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#f8eadb] text-[#8b3026]">
                        <CreditCard size={22} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-[#54251f]">
                            Online Payment
                          </span>
                          {paymentMethod === "Demo Online Payment" && (
                            <CheckCircle2
                              size={17}
                              className="text-green-600"
                            />
                          )}
                        </div>

                        <p className="mt-1 text-sm leading-5 text-gray-500">
                          Demo checkout only. No real payment will be processed.
                        </p>

                        <div className="mt-3 flex flex-wrap gap-2">
                          <span className="rounded-md border border-[#eee3d8] px-2 py-1 text-xs font-medium text-gray-500">
                            UPI demo
                          </span>
                          <span className="rounded-md border border-[#eee3d8] px-2 py-1 text-xs font-medium text-gray-500">
                            Card demo
                          </span>
                          <span className="rounded-md border border-[#eee3d8] px-2 py-1 text-xs font-medium text-gray-500">
                            Net banking demo
                          </span>
                        </div>
                      </div>
                    </label>
                  </div>

                  <div className="mt-5 flex items-start gap-3 rounded-xl bg-[#f7f5ed] p-4">
                    <ShieldCheck
                      size={20}
                      className="mt-0.5 shrink-0 text-green-700"
                    />
                    <p className="text-xs leading-5 text-gray-600">
                      This is a frontend-only shopping demo. Online payment
                      options do not connect to a bank or payment provider.
                    </p>
                  </div>
                </div>

                {/* Items in order */}
                <div className="rounded-3xl border border-[#f0dfca] bg-white p-5 shadow-sm sm:p-7">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-bold text-[#54251f]">
                        Items in your order
                      </h2>
                      <p className="mt-1 text-sm text-gray-500">
                        {itemCount} {itemCount === 1 ? "item" : "items"} ready
                        for checkout
                      </p>
                    </div>

                    <PackageCheck
                      size={25}
                      className="text-[#b45324]"
                    />
                  </div>

                  <div className="mt-5 divide-y divide-[#f1e7dc]">
                    {cart.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-4 py-4 first:pt-0 last:pb-0"
                      >
                        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-[#fff5e9]">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        </div>

                        <div className="min-w-0 flex-1">
                          <h3 className="line-clamp-2 text-sm font-semibold text-[#54251f]">
                            {item.name}
                          </h3>

                          <p className="mt-1 text-sm text-gray-500">
                            Quantity: {item.quantity}
                          </p>

                          <p className="mt-2 text-sm font-bold text-[#8b3026]">
                            ₹{Number(item.price * item.quantity).toLocaleString("en-IN")}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Right column: Order summary */}
              <aside className="lg:sticky lg:top-40">
                <div className="overflow-hidden rounded-3xl border border-[#f0dfca] bg-white shadow-sm">
                  <div className="bg-[#54251f] px-6 py-5 text-white">
                    <div className="flex items-center gap-2">
                      <ShoppingBag size={20} />
                      <h2 className="text-lg font-bold">Order summary</h2>
                    </div>

                    <p className="mt-1 text-sm text-[#f1d9ca]">
                      Your Purv collection, all in one place.
                    </p>
                  </div>

                  <div className="p-6">
                    <div className="space-y-4 text-sm">
                      <div className="flex justify-between gap-4">
                        <span className="text-gray-500">
                          Item subtotal ({itemCount} items)
                        </span>
                        <span className="font-semibold text-[#54251f]">
                          ₹{Number(subtotal).toLocaleString("en-IN")}
                        </span>
                      </div>

                      <div className="flex justify-between gap-4">
                        <span className="text-gray-500">
                          Delivery fee
                        </span>
                        <span className="font-semibold text-green-700">
                          {deliveryCharge === 0
                            ? "FREE"
                            : `₹${deliveryCharge}`}
                        </span>
                      </div>
                    </div>

                    <div className="my-5 border-t border-dashed border-[#e8d8c8]" />

                    <div className="flex items-center justify-between gap-4">
                      <span className="text-base font-bold text-[#54251f]">
                        Total payable
                      </span>
                      <span className="text-2xl font-bold text-[#8b3026]">
                        ₹{Number(grandTotal).toLocaleString("en-IN")}
                      </span>
                    </div>

                    <p className="mt-2 text-xs leading-5 text-gray-500">
                      {paymentMethod === "Cash on Delivery"
                        ? "Pay this amount when your order is delivered."
                        : "Demo payment selected. No money will be charged."}
                    </p>

                    {error && (
                      <div
                        role="alert"
                        className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm leading-5 text-red-700"
                      >
                        {error}
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={handlePlaceOrder}
                      disabled={isPlacingOrder}
                      className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-[#8b3026] px-5 py-4 font-bold text-white shadow-sm transition hover:bg-[#68271f] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isPlacingOrder ? (
                        "Placing your order..."
                      ) : (
                        <>
                          Place Order
                          <ArrowRight size={18} />
                        </>
                      )}
                    </button>

                    <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500">
                      <LockKeyhole size={14} />
                      <span>Checkout demo · No real payment processing</span>
                    </div>

                    <Link
                      to="/cart"
                      className="mt-5 flex items-center justify-center gap-2 text-sm font-semibold text-[#8b3026] hover:text-[#54251f]"
                    >
                      <ArrowLeft size={15} />
                      Return to cart
                    </Link>
                  </div>
                </div>

                <div className="mt-4 flex items-start gap-3 rounded-2xl border border-[#f0dfca] bg-white/70 p-4">
                  <ShieldCheck
                    size={21}
                    className="mt-0.5 shrink-0 text-green-700"
                  />
                  <p className="text-xs leading-5 text-gray-500">
                    Your order details are managed by the Purv frontend demo.
                    Connect a backend and a payment provider before accepting
                    real customer payments.
                  </p>
                </div>
              </aside>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
