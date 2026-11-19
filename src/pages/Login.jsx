
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Mail,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { sendMagicLink } = useAuth();

  const location = useLocation();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [step, setStep] = useState("details");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleSendLink = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!fullName.trim()) {
      setError("Please enter your name.");
      return;
    }

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    try {
      setLoading(true);

      await sendMagicLink(email, fullName);

      setStep("sent");
      setMessage("Your verification link has been sent successfully.");
    } catch (err) {
      setError(err.message || "Unable to send verification link. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendLink = async () => {
    setError("");
    setMessage("");

    try {
      setLoading(true);
      await sendMagicLink(email, fullName);
      setMessage("A new verification link has been sent to your email.");
    } catch (err) {
      setError(err.message || "Unable to resend the verification link.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#fffaf5] px-4 py-10">
      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-[#eadbd5] bg-white shadow-xl shadow-[#76233a]/10">

        <div className="bg-gradient-to-br from-[#421521] via-[#76233a] to-[#923d4e] px-8 py-10 text-center text-white">
          <Link to="/" className="inline-block">
            <h1 className="font-serif text-4xl font-bold tracking-wide">
              Purv
            </h1>
          </Link>

          <p className="mt-3 text-sm text-white/80">
            A little celebration in every purchase.
          </p>
        </div>

        <div className="px-7 py-9 sm:px-9">

          {step === "details" ? (
            <>
              <div className="mb-7">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f8e8e5] text-[#76233a]">
                  <ShieldCheck size={24} />
                </div>

                <h2 className="font-serif text-3xl font-bold text-[#29201f]">
                  Welcome to Purv
                </h2>

                <p className="mt-2 text-sm leading-6 text-stone-500">
                  Enter your details to log in or create your Purv account.
                  We'll email you a secure verification link.
                </p>
              </div>

              <form onSubmit={handleSendLink}>
                <label className="mb-2 block text-sm font-semibold text-[#29201f]">
                  Your name
                </label>

                <div className="relative mb-5">
                  <UserRound
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400"
                  />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    autoComplete="name"
                    required
                    className="w-full rounded-xl border border-[#e8d8d2] bg-[#fffdfb] py-3.5 pl-11 pr-4 text-sm outline-none transition focus:border-[#76233a] focus:ring-2 focus:ring-[#76233a]/10"
                  />
                </div>

                <label className="mb-2 block text-sm font-semibold text-[#29201f]">
                  Email address
                </label>

                <div className="relative">
                  <Mail
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400"
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    autoComplete="email"
                    required
                    className="w-full rounded-xl border border-[#e8d8d2] bg-[#fffdfb] py-3.5 pl-11 pr-4 text-sm outline-none transition focus:border-[#76233a] focus:ring-2 focus:ring-[#76233a]/10"
                  />
                </div>

                {error && (
                  <p className="mt-3 text-sm text-red-600">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#76233a] px-5 py-4 text-sm font-bold text-white transition hover:bg-[#421521] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Sending verification link..." : "Continue with email"}
                  {!loading && <ArrowRight size={18} />}
                </button>
              </form>
            </>
          ) : (
            <div className="py-3 text-center">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#f8e8e5] text-[#76233a]">
                <Mail size={30} />
              </div>

              <h2 className="font-serif text-3xl font-bold text-[#29201f]">
                Check your inbox!
              </h2>

              <p className="mt-3 text-sm leading-6 text-stone-500">
                We've sent a verification link to
              </p>

              <p className="mt-1 break-all font-semibold text-[#76233a]">
                {email}
              </p>

              <p className="mt-4 text-sm leading-6 text-stone-500">
                Open the email and click the
                <strong> Verify Email & Continue </strong>
                button. You'll be redirected to Purv automatically.
              </p>

              {message && (
                <p className="mt-4 text-sm text-green-700">{message}</p>
              )}

              {error && (
                <p className="mt-3 text-sm text-red-600">{error}</p>
              )}

              <button
                type="button"
                onClick={handleResendLink}
                disabled={loading}
                className="mt-6 font-semibold text-[#76233a] hover:underline disabled:opacity-50"
              >
                {loading ? "Sending..." : "Resend verification link"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep("details");
                  setError("");
                  setMessage("");
                }}
                className="mt-5 flex w-full items-center justify-center gap-2 text-sm text-stone-500 hover:text-[#76233a]"
              >
                <ArrowLeft size={15} />
                Change details
              </button>
            </div>
          )}

          <div className="mt-8 border-t border-[#f0e5df] pt-5 text-center">
            <p className="text-xs leading-5 text-stone-400">
              Your verification link is private. Never share it with anyone.
            </p>
          </div>

          <Link
            to={location.state?.from || "/"}
            className="mt-5 block text-center text-sm font-medium text-[#76233a] hover:underline"
          >
            Continue shopping
          </Link>
        </div>
      </div>
    </main>
  );
}
