import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  MapPin,
  PackageCheck,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  CalendarDays,
  Clock,
} from "lucide-react";

import Header from "../components/Header";
import { useShop } from "../context/ShopContext";

export default function Payment() {
  const navigate = useNavigate();
  const location = useLocation();

  const { cart, cartTotal, addresses } = useShop();

  const [deliveryType, setDeliveryType] = useState("scheduled");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [deliveryTimeSlot, setDeliveryTimeSlot] = useState("");
  const [error, setError] = useState("");

  const addressId = location.state?.addressId;
  const address = addresses.find(
    (item) => String(item.id) === String(addressId),
  );

  const itemCount = cart.reduce(
    (total, item) => total + (Number(item.quantity) || 0),
    0,
  );

  const subtotal = cartTotal;
  const deliveryCharge = 0;
  const grandTotal = subtotal + deliveryCharge;

  // Minimum selectable delivery date: today
  const today = new Date();

  const minDeliveryDate = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("-");

  // Available delivery time slots
  const deliveryTimeSlots = [
    "9:00 AM - 12:00 PM",
    "12:00 PM - 3:00 PM",
    "3:00 PM - 6:00 PM",
    "6:00 PM - 9:00 PM",
  ];

  // Continue to payment method selection
  function handlePlaceOrder() {
    setError("");

    if (cart.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    if (!address) {
      setError("Please select your delivery address.");
      return;
    }

    if (deliveryType === "scheduled" && (!deliveryDate || !deliveryTimeSlot)) {
      setError("Please select your preferred delivery date and time slot.");
      return;
    }

    navigate("/checkout/payment-method", {
      state: {
        addressId,
        deliverySchedule: {
          deliveryType,
          deliveryDate: deliveryType === "scheduled" ? deliveryDate : null,
          deliveryTimeSlot:
            deliveryType === "scheduled" ? deliveryTimeSlot : null,
        },
      },
    });
  }

  return (
    <>
      <Header />

      <main className="!mt-0 !pt-0 min-h-screen bg-[#fffaf4] px-4 pb-16 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-7xl">
          {/* Back button */}
          <Link
            to="/checkout/address"
            state={{ addressId }}
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
              Delivery & Review
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#806b61] sm:text-base">
              Review your delivery details, choose when you would like your
              festive favourites delivered, and continue to select your payment
              method.
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
              <span>Delivery</span>
            </div>

            <div className="h-px flex-1 bg-[#e8d8c8]" />

            <div className="flex items-center gap-2 text-sm text-[#a8998f]">
              <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#e8d8c8]">
                3
              </span>
              <span className="hidden sm:inline">Payment</span>
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
                Add something beautiful to your cart before proceeding to
                checkout.
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
                Please select a saved address or add a new address before
                reviewing your order.
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

                {/* Delivery options */}
                <div className="rounded-3xl border border-[#f0dfca] bg-white p-5 shadow-sm sm:p-7">
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#fff0dc] text-[#8b3026]">
                      <CalendarDays size={21} />
                    </div>

                    <div>
                      <h2 className="text-lg font-bold text-[#54251f]">
                        Choose your delivery option
                      </h2>

                      <p className="mt-1 text-sm text-gray-500">
                        Select how quickly you would like to receive your order.
                      </p>
                    </div>
                  </div>

                  {/* Delivery type selection */}
                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    {/* Fast delivery */}
                    <button
                      type="button"
                      onClick={() => {
                        setDeliveryType("fast");
                        setDeliveryDate("");
                        setDeliveryTimeSlot("");
                        setError("");
                      }}
                      aria-pressed={deliveryType === "fast"}
                      className={`rounded-2xl border p-4 text-left transition duration-200 ${
                        deliveryType === "fast"
                          ? "border-[#8b3026] bg-[#fff8ef] ring-1 ring-[#8b3026]"
                          : "border-[#eee3d8] hover:border-[#d8b9a3]"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2 font-bold text-[#54251f]">
                          <Sparkles size={19} className="text-[#b45324]" />
                          Fast Delivery
                        </span>

                        {deliveryType === "fast" && (
                          <CheckCircle2 size={19} className="text-green-600" />
                        )}
                      </div>

                      <p className="mt-3 text-xl font-extrabold text-[#8b3026]">
                        Within 1 hour
                      </p>

                      <p className="mt-1 text-xs leading-5 text-gray-500">
                        Get your order delivered quickly. Subject to location
                        and availability.
                      </p>
                    </button>

                    {/* Scheduled delivery */}
                    <button
                      type="button"
                      onClick={() => {
                        setDeliveryType("scheduled");
                        setError("");
                      }}
                      aria-pressed={deliveryType === "scheduled"}
                      className={`rounded-2xl border p-4 text-left transition duration-200 ${
                        deliveryType === "scheduled"
                          ? "border-[#8b3026] bg-[#fff8ef] ring-1 ring-[#8b3026]"
                          : "border-[#eee3d8] hover:border-[#d8b9a3]"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2 font-bold text-[#54251f]">
                          <CalendarDays size={19} className="text-[#b45324]" />
                          Scheduled Delivery
                        </span>

                        {deliveryType === "scheduled" && (
                          <CheckCircle2 size={19} className="text-green-600" />
                        )}
                      </div>

                      <p className="mt-3 text-xl font-extrabold text-[#8b3026]">
                        Choose your time
                      </p>

                      <p className="mt-1 text-xs leading-5 text-gray-500">
                        Select the delivery date and time that suits you.
                      </p>
                    </button>
                  </div>

                  {/* Scheduled delivery fields */}
                  {deliveryType === "scheduled" && (
                    <div className="mt-7 border-t border-[#f1e7dc] pt-6">
                      {/* Date selection */}
                      <div>
                        <label
                          htmlFor="delivery-date"
                          className="mb-2 block text-sm font-semibold text-[#54251f]"
                        >
                          Preferred delivery date
                        </label>

                        <input
                          id="delivery-date"
                          type="date"
                          min={minDeliveryDate}
                          value={deliveryDate}
                          onChange={(e) => {
                            setDeliveryDate(e.target.value);
                            setError("");
                          }}
                          className="w-full rounded-xl border border-[#e8d8c8] bg-[#fffaf4] px-4 py-3 text-sm text-[#54251f] outline-none transition focus:border-[#8b3026] focus:ring-2 focus:ring-[#8b3026]/10"
                        />
                      </div>

                      {/* Time slot selection */}
                      <div className="mt-6">
                        <div className="mb-3 flex items-center gap-2">
                          <Clock size={17} className="text-[#8b3026]" />

                          <h3 className="text-sm font-semibold text-[#54251f]">
                            Choose a delivery time slot
                          </h3>
                        </div>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                          {deliveryTimeSlots.map((slot) => (
                            <label
                              key={slot}
                              className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition ${
                                deliveryTimeSlot === slot
                                  ? "border-[#8b3026] bg-[#fff8ef] ring-1 ring-[#8b3026]"
                                  : "border-[#eee3d8] hover:border-[#d8b9a3]"
                              }`}
                            >
                              <input
                                type="radio"
                                name="deliveryTimeSlot"
                                value={slot}
                                checked={deliveryTimeSlot === slot}
                                onChange={() => {
                                  setDeliveryTimeSlot(slot);
                                  setError("");
                                }}
                                className="h-4 w-4 accent-[#8b3026]"
                              />

                              <span className="text-sm font-semibold text-[#54251f]">
                                {slot}
                              </span>

                              {deliveryTimeSlot === slot && (
                                <CheckCircle2
                                  size={17}
                                  className="ml-auto shrink-0 text-green-600"
                                />
                              )}
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Delivery selection preview */}
                  {deliveryType === "fast" ? (
                    <div className="mt-6 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4">
                      <CheckCircle2
                        size={20}
                        className="mt-0.5 shrink-0 text-green-700"
                      />

                      <div>
                        <p className="text-sm font-bold text-green-800">
                          Fast delivery selected
                        </p>

                        <p className="mt-1 text-sm text-green-700">
                          Estimated delivery within 1 hour, subject to location
                          and availability.
                        </p>
                      </div>
                    </div>
                  ) : deliveryDate && deliveryTimeSlot ? (
                    <div className="mt-6 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4">
                      <CheckCircle2
                        size={20}
                        className="mt-0.5 shrink-0 text-green-700"
                      />

                      <div>
                        <p className="text-sm font-bold text-green-800">
                          Delivery schedule selected
                        </p>

                        <p className="mt-1 text-sm text-green-700">
                          {new Date(
                            `${deliveryDate}T00:00:00`,
                          ).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </p>

                        <p className="mt-1 text-sm text-green-700">
                          {deliveryTimeSlot}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-5 text-xs leading-5 text-gray-500">
                      Please select both a delivery date and time slot to
                      continue.
                    </p>
                  )}
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

                    <PackageCheck size={25} className="text-[#b45324]" />
                  </div>

                  <div className="mt-5 divide-y divide-[#f1e7dc]">
                    {cart.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-4 py-4 first:pt-0 last:pb-0"
                      >
                        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-[#fff5e9]">
                          <img
                            src={
                              item.image || item.image_url || item.product_image
                            }
                            alt={item.name}
                            className="h-full w-full object-cover"
                            loading="lazy"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
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
                            ₹
                            {Number(item.price * item.quantity).toLocaleString(
                              "en-IN",
                            )}
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
                        <span className="text-gray-500">Delivery fee</span>

                        <span className="font-semibold text-green-700">
                          {deliveryCharge === 0 ? "FREE" : `₹${deliveryCharge}`}
                        </span>
                      </div>
                    </div>

                    {/* Selected delivery option */}
                    <div className="mt-5 rounded-xl bg-[#fff8ef] p-3">
                      <p className="text-xs font-bold uppercase tracking-wide text-[#8b3026]">
                        Delivery option
                      </p>

                      {deliveryType === "fast" ? (
                        <>
                          <p className="mt-2 text-sm font-bold text-[#54251f]">
                            Fast Delivery
                          </p>

                          <p className="mt-1 text-xs text-gray-600">
                            Estimated within 1 hour
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="mt-2 text-sm font-semibold text-[#54251f]">
                            {deliveryDate
                              ? new Date(
                                  `${deliveryDate}T00:00:00`,
                                ).toLocaleDateString("en-IN", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })
                              : "Date not selected"}
                          </p>

                          <p className="mt-1 text-xs text-gray-600">
                            {deliveryTimeSlot || "Time slot not selected"}
                          </p>
                        </>
                      )}
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
                      Choose your preferred payment method on the next page.
                    </p>

                    {/* Validation error */}
                    {error && (
                      <div
                        role="alert"
                        className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm leading-5 text-red-700"
                      >
                        {error}
                      </div>
                    )}

                    {/* Continue button */}
                    <button
                      type="button"
                      onClick={handlePlaceOrder}
                      className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-[#8b3026] px-5 py-4 font-bold text-white shadow-sm transition hover:bg-[#68271f]"
                    >
                      Continue to Payment
                      <ArrowRight size={18} />
                    </button>

                    <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500">
                      <ShieldCheck size={15} />
                      <span>Secure checkout experience</span>
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
                    Your delivery details are saved for the next payment step.
                    Select your payment method before placing your order.
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
