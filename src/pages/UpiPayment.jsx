
import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  Copy,
  ExternalLink,
  ShieldCheck,
  Smartphone,
  QrCode,
  LoaderCircle,
} from "lucide-react";

import Header from "../components/Header";
import { useShop } from "../context/ShopContext";

const PURV_UPI_ID = "8810628225@ptsbi";
const PURV_UPI_NAME = "Purv";

export default function UpiPayment() {
  const navigate = useNavigate();
  const location = useLocation();

  const { cart, cartTotal, placeOrder } = useShop();

  const addressId = location.state?.addressId;
  const deliverySchedule = location.state?.deliverySchedule || {};

  const [placingOrder, setPlacingOrder] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const amount = Number(cartTotal || 0);

  const upiLink = useMemo(() => {
    const params = new URLSearchParams({
      pa: PURV_UPI_ID,
      pn: PURV_UPI_NAME,
      am: amount.toFixed(2),
      cu: "INR",
      tn: "Purv Store Order Payment",
    });

    return `upi://pay?${params.toString()}`;
  }, [amount]);

  const qrCodeUrl = useMemo(() => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(
      upiLink
    )}`;
  }, [upiLink]);

  const handleOpenUpi = () => {
    if (!upiLink || amount <= 0) {
      setError("Unable to generate payment link. Please check your cart.");
      return;
    }

    window.location.href = upiLink;
  };

  const handleCopyUpi = async () => {
    try {
      await navigator.clipboard.writeText(PURV_UPI_ID);
      setCopied(true);

      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Unable to copy UPI ID. Please copy it manually.");
    }
  };

  const handleConfirmPayment = async () => {
    if (!cart || cart.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    if (!addressId) {
      setError("Delivery address is missing. Please select your address again.");
      return;
    }

    if (amount <= 0) {
      setError("Invalid payment amount.");
      return;
    }

    try {
      setError("");
      setPlacingOrder(true);

      const order = await placeOrder(
        addressId,
        "UPI",
        deliverySchedule,
        {
          paymentStatus: "Pending verification",
        }
      );

      if (!order?.id) {
        throw new Error("Order could not be created. Please try again.");
      }

      navigate(`/order-success/${order.id}`, {
        state: { order },
        replace: true,
      });
    } catch (err) {
      console.error("Order placement failed:", err);
      setError(err?.message || "Unable to place your order. Please try again.");
    } finally {
      setPlacingOrder(false);
    }
  };

  return (
    <>
      <Header />

      <main className="min-h-screen bg-[#fffaf5] px-4 pb-12 pt-6 sm:px-6">
        <div className="mx-auto max-w-3xl">

          {/* Back button */}
          <Link
            to="/checkout/payment-method"
            state={{ addressId, deliverySchedule }}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#76233a] hover:text-[#421521]"
          >
            <ArrowLeft size={17} />
            Back to payment methods
          </Link>

          {/* Heading */}
          <div className="mt-7 text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#eadbc9] bg-white px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#76233a]">
              <ShieldCheck size={15} />
              Secure UPI payment
            </span>

            <h1 className="mt-4 font-serif text-3xl font-bold text-[#421521] sm:text-4xl">
              Complete Your Payment
            </h1>

            <p className="mt-2 text-sm text-[#82736f]">
              Scan the QR code or pay using your UPI app.
            </p>
          </div>

          {/* Centered payment card */}
          <section className="mx-auto mt-7 max-w-xl overflow-hidden rounded-3xl border border-[#eadbc9] bg-white shadow-[0_15px_45px_rgba(66,21,33,0.08)]">

            {/* Amount header */}
            <div className="bg-gradient-to-r from-[#76233a] to-[#421521] px-6 py-7 text-center text-white">
              <p className="text-sm text-white/75">
                Total amount to pay
              </p>

              <h2 className="mt-2 text-4xl font-extrabold tracking-tight">
                ₹{amount.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </h2>

              <p className="mt-2 text-xs text-white/65">
                Purv order payment
              </p>
            </div>

            <div className="p-5 sm:p-8">

              {/* QR code centered */}
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 text-[#421521]">
                  <QrCode size={19} />
                  <h3 className="font-bold">Scan & Pay</h3>
                </div>

                <p className="mt-2 text-sm text-[#82736f]">
                  Scan with any UPI app on your phone
                </p>

                <div className="mx-auto mt-5 flex w-fit items-center justify-center rounded-2xl border border-[#eadbc9] bg-white p-3 shadow-sm">
                  <img
                    src={qrCodeUrl}
                    alt="Purv UPI payment QR code"
                    className="h-56 w-56 object-contain sm:h-64 sm:w-64"
                  />
                </div>

                <p className="mt-3 text-xs text-[#a08d83]">
                  Open Google Pay, PhonePe, Paytm or another UPI app
                </p>
              </div>

              {/* Divider */}
              <div className="my-6 flex items-center gap-3">
                <div className="h-px flex-1 bg-[#eadbc9]" />
                <span className="text-xs font-medium text-[#a08d83]">
                  OR PAY USING UPI ID
                </span>
                <div className="h-px flex-1 bg-[#eadbc9]" />
              </div>

              {/* UPI ID */}
              <div className="rounded-xl border border-[#eadbc9] bg-[#fffaf5] p-4">
                <p className="text-xs font-medium text-[#82736f]">
                  UPI ID
                </p>

                <div className="mt-2 flex items-center justify-between gap-3">
                  <span className="break-all text-sm font-bold text-[#421521]">
                    {PURV_UPI_ID}
                  </span>

                  <button
                    type="button"
                    onClick={handleCopyUpi}
                    className="flex shrink-0 items-center gap-2 rounded-lg bg-white px-3 py-2 text-xs font-bold text-[#76233a] shadow-sm transition hover:bg-[#f8e8e5]"
                  >
                    {copied ? (
                      <CheckCircle2 size={15} />
                    ) : (
                      <Copy size={15} />
                    )}
                    {copied ? "Copied" : "Copy"}
                  </button>
                </div>
              </div>

              {/* Open UPI */}
              <button
                type="button"
                onClick={handleOpenUpi}
                className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#76233a] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#421521]"
              >
                <Smartphone size={18} />
                Open UPI App
                <ExternalLink size={15} />
              </button>

              {/* Error */}
              {error && (
                <p className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {error}
                </p>
              )}

              {/* Confirm order */}
              <button
                type="button"
                onClick={handleConfirmPayment}
                disabled={placingOrder || amount <= 0}
                className="mt-3 flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-[#d8c4ad] bg-[#fffaf5] px-6 py-3 text-sm font-bold text-[#76233a] transition hover:bg-[#f8e8e5] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {placingOrder ? (
                  <>
                    <LoaderCircle size={18} className="animate-spin" />
                    Placing order...
                  </>
                ) : (
                  <>
                    I have completed payment
                    <CheckCircle2 size={17} />
                  </>
                )}
              </button>

              <p className="mt-4 text-center text-xs leading-5 text-[#a08d83]">
                Your order will be placed with payment pending verification.
              </p>
            </div>
          </section>

          {/* Trust note */}
          <div className="mx-auto mt-5 flex max-w-xl items-start justify-center gap-2 text-center">
            <ShieldCheck size={16} className="mt-0.5 shrink-0 text-[#76233a]" />
            <p className="text-xs leading-5 text-[#82736f]">
              Please ensure you pay the exact amount before confirming your order.
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
