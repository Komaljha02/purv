
import { Link } from "react-router-dom";
import { ArrowLeft, Package } from "lucide-react";
import Header from "../components/Header";
import { useShop } from "../context/ShopContext";

export default function Orders() {
  const { orders } = useShop();

  return (
    <>
      <Header />

      <main className="min-h-screen bg-[#fffaf4] px-4 py-8 md:px-10">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-[#8b3a2b]">
          <ArrowLeft size={18} />
          Back to Home
        </Link>

        <h1 className="my-8 flex items-center gap-3 text-3xl font-bold text-[#54251f]">
          <Package size={30} />
          My Orders
        </h1>

        {orders.length === 0 ? (
          <div className="rounded-2xl bg-white p-10 text-center">
            <Package size={45} className="mx-auto text-[#b45324]" />
            <h2 className="mt-4 text-xl font-semibold text-[#54251f]">
              No orders yet
            </h2>
            <p className="mt-2 text-gray-500">
              Your placed orders will appear here.
            </p>
            <Link
              to="/categories"
              className="mt-5 inline-block rounded-full bg-[#8b3a2b] px-6 py-3 text-white"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="max-w-3xl space-y-4">
            {[...orders].reverse().map((order) => (
              <article key={order.id} className="rounded-2xl bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm text-gray-500">Order ID</p>
                    <h2 className="font-semibold text-[#54251f]">{order.id}</h2>
                  </div>

                  <span className="rounded-full bg-green-100 px-3 py-1 text-sm text-green-800">
                    {order.status}
                  </span>
                </div>

                <p className="mt-4 text-sm text-gray-600">
                  {order.items.length} different item(s)
                </p>

                <p className="mt-2 font-bold text-[#8b3a2b]">
                  Total: ₹{order.subtotal}
                </p>

                <Link
                  to={`/orders/${order.id}`}
                  className="mt-4 inline-block font-semibold text-[#b45324] underline"
                >
                  View Order Details
                </Link>
              </article>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
