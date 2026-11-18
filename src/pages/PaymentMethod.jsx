import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  CreditCard,
  Gift,
  LoaderCircle,
  ShieldCheck,
  Smartphone,
  Wallet,
  Banknote,
} from "lucide-react";

import Header from "../components/Header";
import { useShop } from "../context/ShopContext";
import { supabase } from "../lib/supabase";

function formatPrice(value) {
  return `₹${Number(value || 0).toLocaleString("en-IN")}`;
}

export default function PaymentMethod() {
  const location = useLocation();
  const navigate = useNavigate();

  const { cart, placeOrder } = useShop();

  const addressId = location.state?.addressId;
  const deliverySchedule = location.state?.deliverySchedule || {
    deliveryType: location.state?.deliveryType,
    deliveryDate: location.state?.deliveryDate,
    deliveryTimeSlot: location.state?.deliveryTimeSlot,
  };

  const [selectedMethod, setSelectedMethod] = useState("");
  const [voucherCode, setVoucherCode] = useState("");
  const [voucherBalance, setVoucherBalance] = useState(null);
  const [voucherMessage, setVoucherMessage] = useState("");
  const [voucherLoading, setVoucherLoading] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [error, setError] = useState("");

  const subtotal = cart.reduce(
    (total, item) =>
      total + Number(item.price || 0) * Number(item.quantity || 0),
    0,
  );

  const itemCount = cart.reduce(
    (total, item) => total + Number(item.quantity || 0),
    0,
  );

  async function validateVoucher() {
    const code = voucherCode.trim().toUpperCase();

    if (!code) {
      setVoucherMessage("Please enter your voucher code.");
      setVoucherBalance(null);
      return;
    }

    setVoucherLoading(true);
    setVoucherMessage("");
    setVoucherBalance(null);

    try {
      const { data, error: voucherError } = await supabase.rpc(
        "get_purv_gift_voucher",
        { p_code: code },
      );

      if (voucherError) throw voucherError;

      const balance = Number(data);

      if (data === null || !Number.isFinite(balance) || balance <= 0) {
        setVoucherMessage(
          "This voucher is invalid, expired, inactive, or has no balance.",
        );
        return;
      }

      setVoucherBalance(balance);
      setVoucherCode(code);
      setVoucherMessage(
        `Voucher verified. Available balance: ${formatPrice(balance)}.`,
      );
    } catch (err) {
      console.error("Voucher validation error:", err);
      setVoucherMessage(
        "Unable to verify this voucher right now. Please try again.",
      );
    } finally {
      setVoucherLoading(false);
    }
  }

  async function handlePayOnDelivery() {
    if (!addressId) {
      setError("Please go back and select your delivery address.");
      return;
    }

    if (!cart.length) {
      setError("Your cart is empty.");
      return;
    }

    setPlacingOrder(true);
    setError("");

    try {
      const order = await placeOrder(
        addressId,
        "Cash on Delivery",
        deliverySchedule,
        {},
      );

      if (!order) {
        throw new Error("Your order could not be created.");
      }

      navigate(`/order-success/${order.id}`, {
        replace: true,
        state: { order },
      });
    } catch (err) {
      console.error("Order placement error:", err);
      setError(err.message || "Unable to place your order. Please try again.");
    } finally {
      setPlacingOrder(false);
    }
  }

  if (!addressId || !cart.length) {
    return (
      <>
        <Header />
        <main className="min-h-[65vh] px-4 py-12">
          <div className="mx-auto max-w-lg rounded-2xl border border-[#f0e3d9] bg-white p-8 text-center">
            <Wallet size={36} className="mx-auto text-[#76233a]" />
            <h1 className="mt-4 text-xl font-bold text-[#421521]">
              Checkout details missing
            </h1>
            <p className="mt-2 text-sm text-[#82736f]">
              Please return to delivery and review your order before choosing a
              payment method.
            </p>
            <Link
              to="/checkout/payment"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#76233a] px-6 py-3 text-sm font-bold text-white"
            >
              <ArrowLeft size={16} />
              Back to delivery review
            </Link>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />

      <main className="min-h-screen bg-[#fffaf5] px-4 pb-12 pt-5 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1100px]">
          <Link
            to="/checkout/payment"
            state={{ addressId, deliverySchedule }}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#76233a]"
          >
            <ArrowLeft size={17} />
            Back to delivery review
          </Link>

          <div className="mt-5">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#a34b3d]">
              Almost there
            </p>
            <h1 className="mt-2 font-serif text-3xl font-bold text-[#421521] sm:text-4xl">
              Choose your payment
            </h1>
            <p className="mt-2 text-sm text-[#82736f]">
              Select how you would like to pay for your Purv order.
            </p>
          </div>

          <div className="mt-7 grid items-start gap-6 lg:grid-cols-[1fr_340px]">
            <section className="space-y-4">
              {/* UPI */}
              <button
                type="button"
                onClick={() => {
                  setSelectedMethod("UPI");
                  navigate("/checkout/upi", {
                    state: { addressId, deliverySchedule },
                  });
                }}
                className={`flex w-full items-center gap-4 rounded-2xl border bg-white p-5 text-left transition hover:border-[#76233a] hover:shadow-md ${
                  selectedMethod === "UPI"
                    ? "border-[#76233a] ring-2 ring-[#76233a]/10"
                    : "border-[#f0e3d9]"
                }`}
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#f8e8e5] text-[#76233a]">
                  <Smartphone size={24} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-bold text-[#421521]">
                    UPI Payment
                  </span>
                  <span className="mt-1 block text-xs leading-5 text-[#82736f]">
                    Google Pay, PhonePe, Paytm or any UPI app
                  </span>
                </span>
                <ArrowRight size={20} className="shrink-0 text-[#76233a]" />
              </button>

              {/* Gift voucher */}
              <div
                className={`rounded-2xl border bg-white p-5 transition ${
                  selectedMethod === "Gift Voucher"
                    ? "border-[#76233a] ring-2 ring-[#76233a]/10"
                    : "border-[#f0e3d9]"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setSelectedMethod("Gift Voucher")}
                  className="flex w-full items-center gap-4 text-left"
                >
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#fff0d7] text-[#a34b3d]">
                    <Gift size={24} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-bold text-[#421521]">
                      Gift Voucher
                    </span>
                    <span className="mt-1 block text-xs text-[#82736f]">
                      Check your Purv gift voucher balance
                    </span>
                  </span>
                  <ArrowRight size={20} className="shrink-0 text-[#76233a]" />
                </button>

                {selectedMethod === "Gift Voucher" && (
                  <div className="mt-5 border-t border-dashed border-[#eadfd2] pt-5">
                    <label className="mb-2 block text-sm font-bold text-[#421521]">
                      Enter voucher code
                    </label>

                    <div className="flex flex-col gap-2 sm:flex-row">
                      <input
                        value={voucherCode}
                        onChange={(event) => {
                          setVoucherCode(event.target.value.toUpperCase());
                          setVoucherBalance(null);
                          setVoucherMessage("");
                        }}
                        placeholder="e.g. PURV500"
                        className="min-h-12 min-w-0 flex-1 rounded-xl border border-[#e8d9ce] bg-[#fffaf5] px-4 text-sm font-semibold uppercase text-[#421521] outline-none focus:border-[#76233a]"
                      />

                      <button
                        type="button"
                        onClick={validateVoucher}
                        disabled={voucherLoading}
                        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#76233a] px-5 text-sm font-bold text-white disabled:opacity-60"
                      >
                        {voucherLoading ? (
                          <LoaderCircle size={17} className="animate-spin" />
                        ) : (
                          "Verify"
                        )}
                      </button>
                    </div>

                    {voucherMessage && (
                      <p className="mt-3 text-sm font-medium text-[#76233a]">
                        {voucherMessage}
                      </p>
                    )}

                    {voucherBalance !== null && (
                      <div className="mt-3 rounded-xl border border-green-200 bg-green-50 p-3">
                        <div className="flex items-center gap-2 text-sm font-bold text-green-800">
                          <CheckCircle2 size={17} />
                          Voucher verified
                        </div>
                        <p className="mt-1 text-sm text-green-800">
                          Available balance: {formatPrice(voucherBalance)}
                        </p>
                        <p className="mt-2 text-xs leading-5 text-green-800">
                          Voucher verification is working. Secure redemption and
                          balance deduction must be connected before this
                          voucher can be used to pay for an order.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Pay on delivery */}
              <button
                type="button"
                onClick={() => setSelectedMethod("Pay on Delivery")}
                className={`flex w-full items-center gap-4 rounded-2xl border bg-white p-5 text-left transition hover:border-[#76233a] hover:shadow-md ${
                  selectedMethod === "Pay on Delivery"
                    ? "border-[#76233a] ring-2 ring-[#76233a]/10"
                    : "border-[#f0e3d9]"
                }`}
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#edf6e9] text-green-700">
                  <Banknote size={24} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-bold text-[#421521]">
                    Pay on Delivery
                  </span>
                  <span className="mt-1 block text-xs text-[#82736f]">
                    Pay when your order arrives
                  </span>
                </span>
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                    selectedMethod === "Pay on Delivery"
                      ? "border-[#76233a] bg-[#76233a] text-white"
                      : "border-[#d7c7bd]"
                  }`}
                >
                  {selectedMethod === "Pay on Delivery" && (
                    <CheckCircle2 size={15} />
                  )}
                </span>
              </button>

              {selectedMethod === "Pay on Delivery" && (
                <div className="rounded-xl border border-[#f0e3d9] bg-white p-4">
                  <p className="text-sm leading-6 text-[#71615b]">
                    You can pay when your order is delivered. Your order will be
                    placed now.
                  </p>
                </div>
              )}

              {error && (
                <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
                  {error}
                </p>
              )}

              <div className="flex items-start gap-3 rounded-xl bg-[#f8e8e5] p-4">
                <ShieldCheck
                  size={20}
                  className="mt-0.5 shrink-0 text-[#76233a]"
                />
                <p className="text-xs leading-5 text-[#6f4b49]">
                  Your order details are handled securely. UPI payments remain
                  subject to payment verification.
                </p>
              </div>
            </section>

            {/* Order summary */}
            <aside className="rounded-2xl border border-[#f0e3d9] bg-white p-5 lg:sticky lg:top-24">
              <h2 className="text-lg font-bold text-[#421521]">
                Order summary
              </h2>

              <div className="mt-4 space-y-3">
                <div className="flex justify-between text-sm text-[#82736f]">
                  <span>Items ({itemCount})</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm text-[#82736f]">
                  <span>Delivery</span>
                  <span className="font-semibold text-green-700">FREE</span>
                </div>
                <div className="border-t border-dashed border-[#eadfd2] pt-3">
                  <div className="flex justify-between font-bold text-[#421521]">
                    <span>Total payable</span>
                    <span className="text-xl">{formatPrice(subtotal)}</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handlePayOnDelivery}
                disabled={selectedMethod !== "Pay on Delivery" || placingOrder}
                className="mt-6 flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#76233a] px-5 text-sm font-bold text-white transition hover:bg-[#421521] disabled:cursor-not-allowed disabled:opacity-40"
              >
                {placingOrder ? (
                  <>
                    <LoaderCircle size={18} className="animate-spin" />
                    Placing order...
                  </>
                ) : (
                  <>
                    Confirm Pay on Delivery
                    <ArrowRight size={17} />
                  </>
                )}
              </button>

              <p className="mt-3 text-center text-[11px] leading-5 text-[#9a8982]">
                UPI continues on the next page. Voucher redemption will be
                enabled after secure balance deduction is connected.
              </p>
            </aside>
          </div>
        </div>
      </main>
    </>
  );
}
