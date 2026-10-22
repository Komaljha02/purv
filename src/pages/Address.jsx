
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  UserRound,
  Phone,
  Home,
  CheckCircle2,
  ShieldCheck,
  ShoppingBag,
  ArrowRight,
  Plus,
  MapPinned,
  Sparkles,
} from "lucide-react";

import Header from "../components/Header";
import { useShop } from "../context/ShopContext";

const initialForm = {
  fullName: "",
  phone: "",
  house: "",
  area: "",
  city: "",
  state: "",
  pincode: "",
};

export default function Address() {
  const navigate = useNavigate();
  const { addresses, saveAddress, cart, cartTotal } = useShop();

  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const totalQuantity = cart.reduce(
    (total, item) => total + (Number(item.quantity) || 0),
    0
  );

  const formatPrice = (price) =>
    `₹${Number(price || 0).toLocaleString("en-IN")}`;

  function handleChange(event) {
    const { name, value } = event.target;

    let nextValue = value;

    if (name === "phone") {
      nextValue = value.replace(/\D/g, "").slice(0, 10);
    }

    if (name === "pincode") {
      nextValue = value.replace(/\D/g, "").slice(0, 6);
    }

    setForm((previous) => ({
      ...previous,
      [name]: nextValue,
    }));

    setError("");
  }

  function handleSavedAddress(address) {
    if (cart.length === 0) {
      setError("Your cart is empty. Add products before checkout.");
      return;
    }

    setSelectedAddressId(address.id);

    navigate("/checkout/payment", {
      state: { addressId: address.id },
    });
  }

  function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (cart.length === 0) {
      setError("Your cart is empty. Add products before checkout.");
      return;
    }

    const requiredFields = [
      ["fullName", "Enter your full name."],
      ["phone", "Enter your phone number."],
      ["house", "Enter your house, flat, or building."],
      ["area", "Enter your street or locality."],
      ["city", "Enter your city."],
      ["state", "Enter your state."],
      ["pincode", "Enter your PIN code."],
    ];

    for (const [field, message] of requiredFields) {
      if (!form[field].trim()) {
        setError(message);
        return;
      }
    }

    if (!/^\d{10}$/.test(form.phone)) {
      setError("Enter a valid 10-digit phone number.");
      return;
    }

    if (!/^\d{6}$/.test(form.pincode)) {
      setError("Enter a valid 6-digit PIN code.");
      return;
    }

    setIsSaving(true);

    try {
      const address = saveAddress({
        ...form,
        fullName: form.fullName.trim(),
        house: form.house.trim(),
        area: form.area.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        phone: form.phone,
        pincode: form.pincode,
      });

      if (!address?.id) {
        setError("Could not save the address. Please try again.");
        return;
      }

      navigate("/checkout/payment", {
        state: { addressId: address.id },
      });
    } catch {
      setError("Something went wrong while saving your address.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
      <Header />

      <main className="min-h-screen bg-[#fffaf4] px-4 pb-16 pt-36 sm:px-6 sm:pt-40 lg:px-10">
        <div className="mx-auto max-w-[1200px]">
          {/* Breadcrumb */}
          <div className="mb-6 flex items-center gap-2 text-sm text-gray-500">
            <Link to="/" className="transition hover:text-[#8b3026]">
              Home
            </Link>
            <span>/</span>
            <Link to="/cart" className="transition hover:text-[#8b3026]">
              Cart
            </Link>
            <span>/</span>
            <span className="font-medium text-[#54251f]">
              Delivery Address
            </span>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[#b45324]">
              <Sparkles size={15} />
              Almost there
            </p>

            <h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight text-[#54251f] sm:text-4xl">
              <MapPin size={32} className="text-[#8b3026]" />
              Delivery Address
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-gray-500 sm:text-base">
              Where should we deliver your Purv favourites?
              Choose a saved address or add a new one.
            </p>
          </div>

          {/* Checkout progress */}
          <div className="mb-8 rounded-2xl border border-[#f0dfca] bg-white p-4 sm:p-5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-[#8b3026]">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#edf6e9] text-green-700">
                  <CheckCircle2 size={18} />
                </span>
                <span className="text-xs font-semibold sm:text-sm">
                  Cart
                </span>
              </div>

              <div className="h-px flex-1 bg-[#d9b79e]" />

              <div className="flex items-center gap-2 text-[#8b3026]">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#8b3026] text-sm font-bold text-white">
                  2
                </span>
                <span className="text-xs font-bold sm:text-sm">
                  Address
                </span>
              </div>

              <div className="h-px flex-1 bg-[#eadfd2]" />

              <div className="flex items-center gap-2 text-gray-400">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f5eee8] text-sm font-bold">
                  3
                </span>
                <span className="text-xs font-medium sm:text-sm">
                  Payment
                </span>
              </div>
            </div>
          </div>

          {cart.length === 0 ? (
            <div className="rounded-3xl border border-[#f0dfca] bg-white p-8 text-center sm:p-12">
              <ShoppingBag
                size={42}
                className="mx-auto text-[#a4472b]"
              />

              <h2 className="mt-4 text-xl font-bold text-[#54251f]">
                Your cart is empty
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                Add some products before entering your delivery details.
              </p>

              <Link
                to="/categories"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#8b3026] px-6 py-3 font-semibold text-white transition hover:bg-[#70251f]"
              >
                Browse products
                <ArrowRight size={17} />
              </Link>
            </div>
          ) : (
            <div className="grid items-start gap-6 lg:grid-cols-3 lg:gap-8">
              {/* Address form and saved addresses */}
              <div className="space-y-6 lg:col-span-2">
                {/* Saved addresses */}
                {addresses.length > 0 && (
                  <section className="rounded-2xl border border-[#f0dfca] bg-white p-5 sm:p-6">
                    <div className="mb-5 flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#fff0e5] text-[#a4472b]">
                        <MapPinned size={22} />
                      </div>

                      <div>
                        <h2 className="text-lg font-bold text-[#54251f]">
                          Saved addresses
                        </h2>
                        <p className="mt-1 text-xs text-gray-500">
                          Choose where you want your order delivered.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {addresses.map((address) => {
                        const isSelected =
                          selectedAddressId === address.id;

                        return (
                          <button
                            key={address.id}
                            type="button"
                            onClick={() => handleSavedAddress(address)}
                            className={`w-full rounded-xl border p-4 text-left transition ${
                              isSelected
                                ? "border-[#8b3026] bg-[#fff8f1]"
                                : "border-[#eadfd2] bg-white hover:border-[#c58c69]"
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <span
                                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                                  isSelected
                                    ? "border-[#8b3026] bg-[#8b3026] text-white"
                                    : "border-[#d8c4b5] text-transparent"
                                }`}
                              >
                                <CheckCircle2 size={15} />
                              </span>

                              <div className="min-w-0 flex-1">
                                <p className="font-bold text-[#54251f]">
                                  {address.fullName}
                                </p>

                                <p className="mt-1 text-sm leading-6 text-gray-600">
                                  {address.house}, {address.area},{" "}
                                  {address.city}, {address.state} -{" "}
                                  {address.pincode}
                                </p>

                                <p className="mt-1 text-sm text-gray-500">
                                  {address.phone}
                                </p>

                                <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-[#a4472b]">
                                  Deliver here
                                  <ArrowRight size={15} />
                                </span>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </section>
                )}

                {/* New address form */}
                <form
                  onSubmit={handleSubmit}
                  className="rounded-2xl border border-[#f0dfca] bg-white p-5 sm:p-7"
                >
                  <div className="mb-6 flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#fff0e5] text-[#a4472b]">
                      <Plus size={23} />
                    </div>

                    <div>
                      <h2 className="text-lg font-bold text-[#54251f]">
                        Add a new address
                      </h2>
                      <p className="mt-1 text-xs text-gray-500">
                        Enter your delivery details below.
                      </p>
                    </div>
                  </div>

                  {/* Contact details */}
                  <div className="mb-6">
                    <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-[#54251f]">
                      <UserRound size={17} className="text-[#a4472b]" />
                      Contact information
                    </h3>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="sm:col-span-2">
                        <label
                          htmlFor="fullName"
                          className="mb-2 block text-sm font-medium text-[#654b40]"
                        >
                          Full name *
                        </label>

                        <input
                          id="fullName"
                          name="fullName"
                          value={form.fullName}
                          onChange={handleChange}
                          placeholder="Enter recipient's full name"
                          autoComplete="name"
                          maxLength={80}
                          required
                          className="w-full rounded-xl border border-[#eadfd2] bg-[#fffdf9] px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#b45324] focus:ring-4 focus:ring-[#b45324]/10"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label
                          htmlFor="phone"
                          className="mb-2 flex items-center gap-2 text-sm font-medium text-[#654b40]"
                        >
                          <Phone size={15} />
                          10-digit mobile number *
                        </label>

                        <input
                          id="phone"
                          name="phone"
                          type="tel"
                          inputMode="numeric"
                          value={form.phone}
                          onChange={handleChange}
                          placeholder="Enter mobile number"
                          autoComplete="tel"
                          maxLength={10}
                          required
                          className="w-full rounded-xl border border-[#eadfd2] bg-[#fffdf9] px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#b45324] focus:ring-4 focus:ring-[#b45324]/10"
                        />

                        <p className="mt-1.5 text-xs text-gray-400">
                          Enter 10 digits without the country code.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mb-6 border-t border-[#f0e5da]" />

                  {/* Address details */}
                  <div>
                    <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-[#54251f]">
                      <Home size={17} className="text-[#a4472b]" />
                      Delivery details
                    </h3>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="sm:col-span-2">
                        <label
                          htmlFor="house"
                          className="mb-2 block text-sm font-medium text-[#654b40]"
                        >
                          House / Flat / Building *
                        </label>

                        <input
                          id="house"
                          name="house"
                          value={form.house}
                          onChange={handleChange}
                          placeholder="House number, flat, building name"
                          autoComplete="address-line1"
                          maxLength={120}
                          required
                          className="w-full rounded-xl border border-[#eadfd2] bg-[#fffdf9] px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#b45324] focus:ring-4 focus:ring-[#b45324]/10"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label
                          htmlFor="area"
                          className="mb-2 block text-sm font-medium text-[#654b40]"
                        >
                          Street / Area / Locality *
                        </label>

                        <input
                          id="area"
                          name="area"
                          value={form.area}
                          onChange={handleChange}
                          placeholder="Street, area, or nearby locality"
                          autoComplete="address-line2"
                          maxLength={120}
                          required
                          className="w-full rounded-xl border border-[#eadfd2] bg-[#fffdf9] px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#b45324] focus:ring-4 focus:ring-[#b45324]/10"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="city"
                          className="mb-2 block text-sm font-medium text-[#654b40]"
                        >
                          City *
                        </label>

                        <input
                          id="city"
                          name="city"
                          value={form.city}
                          onChange={handleChange}
                          placeholder="Enter city"
                          autoComplete="address-level2"
                          maxLength={60}
                          required
                          className="w-full rounded-xl border border-[#eadfd2] bg-[#fffdf9] px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#b45324] focus:ring-4 focus:ring-[#b45324]/10"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="state"
                          className="mb-2 block text-sm font-medium text-[#654b40]"
                        >
                          State *
                        </label>

                        <input
                          id="state"
                          name="state"
                          value={form.state}
                          onChange={handleChange}
                          placeholder="Enter state"
                          autoComplete="address-level1"
                          maxLength={60}
                          required
                          className="w-full rounded-xl border border-[#eadfd2] bg-[#fffdf9] px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#b45324] focus:ring-4 focus:ring-[#b45324]/10"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label
                          htmlFor="pincode"
                          className="mb-2 block text-sm font-medium text-[#654b40]"
                        >
                          6-digit PIN code *
                        </label>

                        <input
                          id="pincode"
                          name="pincode"
                          type="text"
                          inputMode="numeric"
                          value={form.pincode}
                          onChange={handleChange}
                          placeholder="Enter delivery PIN code"
                          autoComplete="postal-code"
                          maxLength={6}
                          required
                          className="w-full rounded-xl border border-[#eadfd2] bg-[#fffdf9] px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#b45324] focus:ring-4 focus:ring-[#b45324]/10"
                        />
                      </div>
                    </div>
                  </div>

                  {error && (
                    <div
                      role="alert"
                      className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700"
                    >
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSaving}
                    className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-[#8b3026] px-5 py-4 font-bold text-white transition hover:bg-[#70251f] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSaving ? "Saving address..." : "Save Address & Continue"}
                    {!isSaving && <ArrowRight size={18} />}
                  </button>

                  <p className="mt-4 flex items-center justify-center gap-2 text-center text-xs text-gray-500">
                    <ShieldCheck size={15} className="text-[#a4472b]" />
                    Your address is used for this order and saved in your store.
                  </p>
                </form>
              </div>

              {/* Order summary */}
              <aside className="lg:sticky lg:top-44">
                <div className="overflow-hidden rounded-2xl border border-[#f0dfca] bg-white">
                  <div className="bg-gradient-to-r from-[#fff0cf] to-[#fbe4d7] p-5">
                    <h2 className="text-lg font-bold text-[#54251f]">
                      Your order
                    </h2>
                    <p className="mt-1 text-sm text-[#765c50]">
                      Your favourites, ready for checkout.
                    </p>
                  </div>

                  <div className="p-5">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>Products</span>
                      <span className="font-semibold text-[#54251f]">
                        {totalQuantity} items
                      </span>
                    </div>

                    <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
                      <span>Subtotal</span>
                      <span className="font-semibold text-[#54251f]">
                        {formatPrice(cartTotal)}
                      </span>
                    </div>

                    <div className="my-5 border-t border-dashed border-[#e6d6c7]" />

                    <div className="flex items-center justify-between gap-3">
                      <span className="font-bold text-[#54251f]">
                        Items total
                      </span>
                      <span className="text-xl font-bold text-[#54251f]">
                        {formatPrice(cartTotal)}
                      </span>
                    </div>

                    <p className="mt-2 text-xs leading-5 text-gray-500">
                      Delivery charges and final payment details are
                      confirmed during checkout.
                    </p>

                    <Link
                      to="/cart"
                      className="mt-5 flex items-center justify-center gap-2 rounded-xl border border-[#eadfd2] px-4 py-3 text-sm font-semibold text-[#8b3026] transition hover:bg-[#fff8f1]"
                    >
                      <ArrowLeft size={16} />
                      Return to cart
                    </Link>
                  </div>
                </div>

                <div className="mt-4 rounded-2xl border border-[#f0dfca] bg-white p-4">
                  <div className="flex items-start gap-3">
                    <ShieldCheck
                      size={22}
                      className="mt-0.5 shrink-0 text-[#a4472b]"
                    />
                    <div>
                      <p className="text-sm font-semibold text-[#54251f]">
                        Checkout reassurance
                      </p>
                      <p className="mt-1 text-xs leading-5 text-gray-500">
                        Review your address and order total before
                        proceeding to payment.
                      </p>
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
