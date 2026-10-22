
import { Link, useParams } from "react-router-dom";
import { CheckCircle2, Package } from "lucide-react";
import Header from "../components/Header";
import { useShop } from "../context/ShopContext";

export default function OrderSuccess() {
  const { id } = useParams();
  const { orders } = useShop();

  const order = orders.find((item) => item.id === id);

  return (
    <>
      <Header />

      <main className="flex min-h-[70vh] items-center justify-center bg-[#fffaf4] px-4 py-12">
        <div className="w-full max-w-xl rounded-3xl bg-white p-8 text-center shadow-sm">
          <CheckCircle2 size={64} className="mx-auto text-green-600" />

          <h1 className="mt-5 text-3xl font-bold text-[#54251f]">
            Thank You for Your Order!
          </h1>

          <p className="mt-3 text-gray-600">
            Your festive favourites are on their way.
          </p>

          {order && (
            <div className="mt-6 rounded-2xl bg-[#fffaf4] p-5 text-left">
              <p className="text-sm text-gray-500">Order ID</p>
              <p className="mt-1 font-semibold">{order.id}</p>

              <p className="mt-4 text-sm text-gray-500">Order Total</p>
              <p className="mt-1 text-xl font-bold text-[#8b3a2b]">
                ₹{order.subtotal}
              </p>

              <p className="mt-3 text-sm text-gray-600">
                Payment: {order.paymentMethod}
              </p>
            </div>
          )}

          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              to="/orders"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#8b3a2b] px-6 py-3 font-semibold text-white"
            >
              <Package size={18} />
              View My Orders
            </Link>

            <Link
              to="/"
              className="rounded-full border border-[#8b3a2b] px-6 py-3 font-semibold text-[#8b3a2b]"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
