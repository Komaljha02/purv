
import { Link } from "react-router-dom";
import { ArrowLeft, UserRound, MapPin, Package } from "lucide-react";
import Header from "../components/Header";
import { useShop } from "../context/ShopContext";

export default function Profile() {
  const { addresses, orders } = useShop();

  return (
    <>
      <Header />

      <main className="min-h-screen bg-[#fffaf4] px-4 py-8 md:px-10">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-[#8b3a2b]">
          <ArrowLeft size={18} />
          Back to Home
        </Link>

        <h1 className="my-8 flex items-center gap-3 text-3xl font-bold text-[#54251f]">
          <UserRound size={30} />
          My Profile
        </h1>

        <div className="grid max-w-4xl gap-5 md:grid-cols-2">
          <section className="rounded-2xl bg-white p-6 shadow-sm">
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

          <section className="rounded-2xl bg-white p-6 shadow-sm">
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
                  <p className="font-medium">{address.fullName}</p>
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
      </main>
    </>
  );
}
