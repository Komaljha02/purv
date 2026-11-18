
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  CheckCircle2,
  Package,
  Clock,
  CalendarDays,
  Truck,
  Sparkles,
} from "lucide-react";

import Header from "../components/Header";
import ProductCard from "../components/ProductCard";
import { useShop } from "../context/ShopContext";
import { supabase } from "../lib/supabase";

export default function OrderSuccess() {
  const { id } = useParams();
  const { orders } = useShop();

  const [recommended, setRecommended] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const order = orders.find(
    (item) => String(item.id) === String(id)
  );

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

  const orderItems = order?.items || [];

  // Load recommended products
  useEffect(() => {
    async function fetchRecommendations() {
      try {
        const purchasedIds = orderItems.map((item) => String(item.id));

        const { data, error } = await supabase
          .from("products")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(12);

        if (error) throw error;

        const filtered = (data || [])
          .filter(
            (product) =>
              !purchasedIds.includes(String(product.id))
          )
          .slice(0, 8);

        setRecommended(filtered);
      } catch (error) {
        console.error("Recommendations error:", error);
      } finally {
        setLoadingProducts(false);
      }
    }

    fetchRecommendations();
  }, [id]);

  const formattedDeliveryDate = deliveryDate
    ? new Date(`${deliveryDate}T00:00:00`).toLocaleDateString(
        "en-IN",
        {
          day: "numeric",
          month: "long",
          year: "numeric",
        }
      )
    : "";

  return (
    <>
      <Header />

      <main className="min-h-screen bg-[#fffaf4] px-4 py-8 sm:px-6 sm:py-12">
        <div className="mx-auto max-w-6xl">

          {/* Success section */}
          <section className="mx-auto max-w-3xl overflow-hidden rounded-3xl border border-[#f0dfca] bg-white text-center shadow-sm">

            <div className="bg-gradient-to-br from-[#fff8ed] to-[#f8e8e5] px-5 py-9 sm:px-10 sm:py-12">

              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-sm">
                <CheckCircle2
                  size={52}
                  className="text-green-600"
                />
              </div>

              <p className="mt-5 text-xs font-bold uppercase tracking-[0.22em] text-[#b45324]">
                Order confirmed
              </p>

              <h1 className="mt-2 font-serif text-3xl font-bold text-[#54251f] sm:text-4xl">
                Thank You for Your Order!
              </h1>

              <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[#806b61] sm:text-base">
                Your order has been placed successfully.
                Thank you for choosing Purv. Please be patient
                while we prepare your order with care.
              </p>
            </div>

            {/* Delivery message */}
            <div className="px-5 pb-6 sm:px-8 sm:pb-8">
              <div className="rounded-2xl bg-[#76233a] p-5 text-left text-white sm:p-6">

                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10">
                    <Truck size={23} />
                  </div>

                  <div>
                    <p className="text-xs font-medium text-white/70">
                      Your delivery
                    </p>

                    <h2 className="text-lg font-bold">
                      {isFastDelivery
                          ? "Arriving within 1 hour"
                          : "Scheduled delivery"}
                    </h2>
                  </div>
                </div>

                {isFastDelivery ? (
                  <div className="mt-4 flex items-start gap-2 rounded-xl bg-white/10 p-3">
                    <Clock size={18} className="mt-0.5 shrink-0" />

                    <p className="text-sm leading-6">
                      Please be patient. Your order is expected
                      to arrive within 1 hour.
                    </p>
                  </div>
                ) : (
                  <div className="mt-4 flex items-start gap-2 rounded-xl bg-white/10 p-3">
                    <CalendarDays size={18} className="mt-0.5 shrink-0" />

                    <div className="text-sm leading-6">
                      <p>
                        <strong>{formattedDeliveryDate || "Your selected date"}</strong>
                      </p>
                      <p>
                        {deliveryTimeSlot || "Your selected time slot"}
                      </p>
                      <p className="mt-1 text-white/75">
                        We will deliver your order during your
                        selected schedule. Please be patient.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Order details */}
              {order && (
                <div className="mt-4 rounded-2xl border border-[#f0dfca] bg-[#fffaf4] p-4 text-left sm:p-5">
                  <div className="flex items-center gap-2">
                    <Package size={18} className="text-[#8b3026]" />
                    <h3 className="font-bold text-[#54251f]">
                      Order details
                    </h3>
                  </div>

                  <p className="mt-3 text-xs text-gray-500">
                    Order number
                  </p>

                  <p className="break-all text-sm font-semibold text-[#54251f]">
                    {order.order_number || order.orderNumber || order.id}
                  </p>

                  <div className="mt-3 flex items-center justify-between border-t border-[#eadbc9] pt-3">
                    <span className="text-sm text-gray-500">
                      Total paid / payable
                    </span>

                    <span className="text-xl font-extrabold text-[#8b3026]">
                      ₹{orderTotal.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              )}

              {/* Buttons */}
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <Link
                  to="/orders"
                  className="flex items-center justify-center gap-2 rounded-xl bg-[#76233a] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#421521]"
                >
                  <Package size={17} />
                  View My Orders
                </Link>

                <Link
                  to="/categories"
                  className="flex items-center justify-center gap-2 rounded-xl border border-[#76233a] bg-white px-5 py-3 text-sm font-bold text-[#76233a] transition hover:bg-[#fff4ed]"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </section>

          {/* Recommendations */}
          <section className="mt-12 sm:mt-16">
            <div className="mb-6 flex items-end justify-between gap-3">
              <div>
                <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.18em] text-[#b45324]">
                  <Sparkles size={14} />
                  Curated for you
                </p>

                <h2 className="mt-2 font-serif text-2xl font-bold text-[#54251f] sm:text-3xl">
                  You may also like
                </h2>

                <p className="mt-1 text-sm text-[#806b61]">
                  Discover a little more from Purv.
                </p>
              </div>

              <Link
                to="/categories"
                className="hidden shrink-0 text-sm font-semibold text-[#8b3026] hover:underline sm:block"
              >
                Explore all
              </Link>
            </div>

            {loadingProducts ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {[1, 2, 3, 4].map((item) => (
                  <div
                    key={item}
                    className="aspect-[3/4] animate-pulse rounded-xl bg-[#f1e7dc]"
                  />
                ))}
              </div>
            ) : recommended.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
                {recommended.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-[#f0dfca] bg-white p-8 text-center text-sm text-gray-500">
                Explore our collections to discover more festive favourites.
              </div>
            )}

            <Link
              to="/categories"
              className="mt-6 flex w-full items-center justify-center rounded-xl border border-[#76233a] px-5 py-3 text-sm font-bold text-[#76233a] sm:hidden"
            >
              Explore All Products
            </Link>
          </section>
        </div>
      </main>
    </>
  );
}
