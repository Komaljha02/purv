
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  UserRound,
  MapPin,
  Package,
  LogOut,
  Repeat2,
  ShieldCheck,
} from "lucide-react";

import Header from "../components/Header";
import { useShop } from "../context/ShopContext";
import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const { addresses, orders } = useShop();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [loggingOut, setLoggingOut] = useState(false);
  const [error, setError] = useState("");

  const handleLogout = async (destination) => {
    try {
      setLoggingOut(true);
      setError("");

      await logout();

      navigate(destination, { replace: true });
    } catch (err) {
      setError(err.message || "Unable to sign out. Please try again.");
      setLoggingOut(false);
    }
  };

  const customerName =
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "Purv Customer";

  return (
    <>
      <Header />

      <main className="min-h-screen bg-[#fffaf4] px-4 py-8 md:px-10">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-[#8b3a2b] transition hover:text-[#54251f]"
        >
          <ArrowLeft size={18} />
          Back to Home
        </Link>

        <h1 className="my-8 flex items-center gap-3 text-3xl font-bold text-[#54251f]">
          <UserRound size={30} />
          My Profile
        </h1>

        {/* PROFILE DETAILS */}
        <div className="mb-6 max-w-4xl rounded-2xl border border-[#f0e1d4] bg-white p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-[#f8e8ed] text-[#76233a]">
              <UserRound size={27} />
            </div>

            <div className="min-w-0">
              <h2 className="truncate text-lg font-bold text-[#54251f]">
                Hello, {customerName}
              </h2>
              <p className="mt-1 break-all text-sm text-gray-500">
                {user?.email}
              </p>
            </div>
          </div>
        </div>

        {/* ORDERS AND ADDRESSES */}
        <div className="grid max-w-4xl gap-5 md:grid-cols-2">
          {/* MY ORDERS */}
          <section className="rounded-2xl border border-[#f0e1d4] bg-white p-6 shadow-sm transition hover:shadow-md">
            <div className="flex items-center gap-3">
              <Package className="text-[#b45324]" />

              <h2 className="text-xl font-semibold text-[#54251f]">
                My Orders
              </h2>
            </div>

            <p className="mt-3 text-gray-600">
              You have {orders.length} saved order(s).
            </p>

            <Link
              to="/orders"
              className="mt-5 inline-block font-semibold text-[#b45324] underline"
            >
              View Orders
            </Link>
          </section>

          {/* SAVED ADDRESSES */}
          <section className="rounded-2xl border border-[#f0e1d4] bg-white p-6 shadow-sm transition hover:shadow-md">
            <div className="flex items-center gap-3">
              <MapPin className="text-[#b45324]" />

              <h2 className="text-xl font-semibold text-[#54251f]">
                Saved Addresses
              </h2>
            </div>

            {addresses.length === 0 ? (
              <p className="mt-3 text-gray-600">
                No saved addresses yet.
              </p>
            ) : (
              addresses.map((address) => (
                <div key={address.id} className="mt-4 border-t pt-4">
                  <p className="font-medium text-[#54251f]">
                    {address.fullName}
                  </p>

                  <p className="mt-1 text-sm text-gray-600">
                    {address.house}, {address.area}, {address.city},{" "}
                    {address.state} - {address.pincode}
                  </p>
                </div>
              ))
            )}

            <Link
              to="/checkout/address"
              className="mt-5 inline-block font-semibold text-[#b45324] underline"
            >
              Add an Address
            </Link>
          </section>
        </div>

        {/* ACCOUNT AND SECURITY */}
        <section className="mt-7 max-w-4xl overflow-hidden rounded-2xl border border-[#ead8ca] bg-white shadow-sm">
          <div className="border-b border-[#f0e1d4] bg-gradient-to-r from-[#fff4eb] to-[#f9e9ed] p-5">
            <div className="flex items-center gap-3">
              <ShieldCheck className="text-[#76233a]" size={23} />

              <div>
                <h2 className="text-lg font-bold text-[#54251f]">
                  Account & Security
                </h2>

                <p className="mt-1 text-xs text-[#8d7166]">
                  Manage your Purv account and sign-in details.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3 p-5">
            {/* SWITCH ACCOUNT */}
            <button
              type="button"
              disabled={loggingOut}
              onClick={() => handleLogout("/login")}
              className="flex w-full items-center justify-between rounded-xl border border-[#efdfcc] p-4 text-left transition hover:border-[#c99b75] hover:bg-[#fffaf5] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#fff0d9] text-[#a66a22]">
                  <Repeat2 size={19} />
                </span>

                <span>
                  <span className="block text-sm font-bold text-[#54251f]">
                    Switch Account
                  </span>

                  <span className="mt-1 block text-xs text-gray-500">
                    Sign in using a different email address
                  </span>
                </span>
              </span>

              <ArrowLeft
                size={18}
                className="rotate-180 text-[#a66a22]"
              />
            </button>

            {/* SIGN OUT */}
            <button
              type="button"
              disabled={loggingOut}
              onClick={() => handleLogout("/")}
              className="flex w-full items-center justify-between rounded-xl border border-[#f0d9d9] p-4 text-left transition hover:border-[#d9aaaa] hover:bg-[#fff7f7] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#fbe9e7] text-[#a33b35]">
                  <LogOut size={19} />
                </span>

                <span>
                  <span className="block text-sm font-bold text-[#8b302c]">
                    Sign Out
                  </span>

                  <span className="mt-1 block text-xs text-gray-500">
                    Securely sign out of your Purv account
                  </span>
                </span>
              </span>

              <LogOut size={17} className="text-[#a33b35]" />
            </button>

            {loggingOut && (
              <p className="text-center text-xs text-gray-500">
                Signing you out...
              </p>
            )}

            {error && (
              <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                {error}
              </p>
            )}
          </div>
        </section>
      </main>
    </>
  );
}
