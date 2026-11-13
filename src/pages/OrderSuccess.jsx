
import { Link, useParams } from "react-router-dom";
import {
  CheckCircle2,
  Package,
  Clock,
  CalendarDays,
  Truck,
} from "lucide-react";
import Header from "../components/Header";
import { useShop } from "../context/ShopContext";

export default function OrderSuccess() {
  const { id } = useParams();
  const { orders } = useShop();

  const order = orders.find((item) => String(item.id) === String(id));

  const deliveryType =
    order?.delivery_type || order?.deliveryType || "scheduled";

  const isFastDelivery = deliveryType === "fast";

  const deliveryDate =
    order?.delivery_date || order?.deliveryDate;

  const deliveryTimeSlot =
    order?.delivery_time_slot || order?.deliveryTimeSlot;

  const orderTotal = Number(
    order?.total ?? order?.subtotal ?? 0
  );

  return (
    <>
      <Header />

      <main className="flex min-h-[70vh] items-center justify-center bg-[#fffaf4] px-4 py-12">
        <div className="w-full max-w-xl rounded-3xl bg-white p-6 text-center shadow-sm sm:p-8">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-50">
            <CheckCircle2 size={54} className="text-green-600" />
          </div>

          <h1 className="mt-5 text-3xl font-bold text-[#54251f]">
            Thank You for Your Order!
          </h1>

          <p className="mt-3 text-gray-600">
            Your festive favourites are on their way.
          </p>

          {order ? (
            <div className="mt-7 space-y-4 text-left">
              {/* Order Summary */}
              <div className="rounded-2xl bg-[#fffaf4] p-5">
                <p className="text-sm text-gray-500">Order ID</p>

                <p className="mt-1 break-all font-semibold text-[#54251f]">
                  {order.id}
                </p>

                <p className="mt-4 text-sm text-gray-500">
                  Order Total
                </p>

                <p className="mt-1 text-2xl font-bold text-[#8b3a2b]">
                  ₹{orderTotal.toFixed(2)}
                </p>

                <p className="mt-3 text-sm text-gray-600">
                  Payment: {order.paymentMethod || order.payment_method || "N/A"}
                </p>
              </div>

              {/* Delivery Information */}
              <div className="rounded-2xl border border-[#f0ded5] p-5">
                <div className="flex items-center gap-2">
                  <Truck size={21} className="text-[#8b3a2b]" />

                  <h2 className="font-bold text-[#54251f]">
                    Delivery Details
                  </h2>
                </div>

                {isFastDelivery ? (
                  <div className="mt-4 rounded-xl bg-green-50 p-4">
                    <div className="flex items-center gap-2 font-semibold text-green-800">
                      <Clock size={19} />
                      Fast Delivery
                    </div>

                    <p className="mt-2 text-sm text-green-700">
                      Your order is expected to arrive within 1 hour.
                    </p>
                  </div>
                ) : (
                  <div className="mt-4 rounded-xl bg-[#fffaf4] p-4">
                    <div className="flex items-center gap-2 font-semibold text-[#8b3a2b]">
                      <CalendarDays size={19} />
                      Scheduled Delivery
                    </div>

                    <p className="mt-2 text-sm text-gray-600">
                      Date: {deliveryDate || "As scheduled"}
                    </p>

                    <p className="mt-1 text-sm text-gray-600">
                      Time: {deliveryTimeSlot || "Selected time slot"}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <p className="mt-6 rounded-xl bg-[#fffaf4] p-4 text-sm text-gray-600">
              Your order was placed successfully. You can check its details
              in My Orders.
            </p>
          )}

          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              to="/orders"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#8b3a2b] px-6 py-3 font-semibold text-white transition hover:bg-[#54251f]"
            >
              <Package size={18} />
              View My Orders
            </Link>

            <Link
              to="/"
              className="rounded-full border border-[#8b3a2b] px-6 py-3 font-semibold text-[#8b3a2b] transition hover:bg-[#fff4ed]"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
