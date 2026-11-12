
import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Package,
  CheckCircle2,
  Clock,
  Truck,
  ImageOff,
  RefreshCw,
} from "lucide-react";

import Header from "../components/Header";
import { useShop } from "../context/ShopContext";
import { supabase } from "../lib/supabase";

const statuses = [
  "Order placed",
  "Confirmed",
  "Packed",
  "Shipped",
  "Delivered",
];

function money(value) {
  return `₹${Number(value || 0).toLocaleString("en-IN")}`;
}

function OrderTracking() {
  const { id } = useParams();
  const { orders } = useShop();

  const localOrder = orders.find((item) => String(item.id) === id);

  const [order, setOrder] = useState(localOrder || null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const refreshOrder = useCallback(async (showLoading = false) => {
    if (showLoading) setLoading(true);
    else setRefreshing(true);

    setError("");

    try {
      const { data, error: queryError } = await supabase.rpc(
        "get_customer_order",
        { p_order_id: id }
      );

      if (queryError) throw queryError;

      if (data) {
        setOrder(data);
      } else {
        setOrder(localOrder || null);
      }
    } catch (err) {
      console.error("Order refresh failed:", err);

      // Keep locally saved details visible if the request fails.
      setOrder((previous) => previous || localOrder || null);

      setError(
        "We couldn't refresh your order status. Please try again."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id, localOrder]);

  useEffect(() => {
    refreshOrder(true);

    const interval = setInterval(() => {
      refreshOrder(false);
    }, 10000);

    return () => clearInterval(interval);
  }, [refreshOrder]);

  const items = Array.isArray(order?.items) ? order.items : [];
  const address = order?.delivery_address || order?.address || {};
  const currentStatus = order?.status || "Order placed";
  const cancelled = currentStatus === "Cancelled";
  const currentIndex = statuses.indexOf(currentStatus);

  return (
    <>
      <Header />

      <main className="min-h-screen bg-[#fffaf4] px-4 py-8 md:px-10">
        <div className="mx-auto max-w-3xl">

          <Link
            to="/orders"
            className="inline-flex items-center gap-2 text-sm text-[#8b3a2b]"
          >
            <ArrowLeft size={18} />
            Back to My Orders
          </Link>

          {loading && !order ? (
            <div className="mt-8 rounded-2xl bg-white p-10 text-center">
              <RefreshCw
                size={28}
                className="mx-auto animate-spin text-[#76233a]"
              />
              <p className="mt-3 text-sm text-gray-500">
                Loading your order...
              </p>
            </div>
          ) : !order ? (
            <div className="mt-8 rounded-2xl bg-white p-8 text-center">
              <Package
                size={40}
                className="mx-auto text-gray-400"
              />

              <h1 className="mt-4 text-2xl font-bold text-[#54251f]">
                Order not found
              </h1>

              <p className="mt-2 text-gray-600">
                This order may not be available in this browser.
              </p>

              <Link
                to="/orders"
                className="mt-5 inline-block font-semibold text-[#8b3a2b] underline"
              >
                Go to My Orders
              </Link>
            </div>
          ) : (
            <div className="mt-8 rounded-3xl border border-rose-100 bg-white p-5 shadow-sm sm:p-8">

              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold tracking-wider text-[#a36b25]">
                    PURV ORDER TRACKING
                  </p>

                  <h1 className="mt-2 text-2xl font-bold text-[#54251f] sm:text-3xl">
                    Order Details
                  </h1>

                  <p className="mt-2 break-all text-sm text-gray-500">
                    Order: {order.order_number || order.orderNumber || order.id}
                  </p>

                  <p className="mt-1 text-xs text-gray-400">
                    {order.created_at || order.createdAt
                      ? new Date(
                          order.created_at || order.createdAt
                        ).toLocaleString("en-IN")
                      : ""}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => refreshOrder(false)}
                  disabled={refreshing}
                  className="inline-flex items-center gap-2 rounded-xl border border-rose-200 px-3 py-2 text-sm font-semibold text-[#76233a] hover:bg-rose-50 disabled:opacity-50"
                >
                  <RefreshCw
                    size={15}
                    className={refreshing ? "animate-spin" : ""}
                  />
                  Refresh
                </button>
              </div>

              {error && (
                <div className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
                  {error}
                </div>
              )}

              {/* CURRENT STATUS */}
              <div className="mt-7 rounded-2xl bg-[#fff8ef] p-5">
                <p className="text-sm text-gray-500">
                  Current order status
                </p>

                <h2 className="mt-2 text-xl font-bold text-[#76233a]">
                  {currentStatus}
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  This status is updated by the Purv admin team.
                </p>
              </div>

              {/* ORDER TIMELINE */}
              <section className="mt-7">
                <h2 className="font-bold text-[#54251f]">
                  Order progress
                </h2>

                {cancelled ? (
                  <div className="mt-4 rounded-xl border border-red-100 bg-red-50 p-4">
                    <p className="font-semibold text-red-700">
                      This order has been cancelled.
                    </p>
                  </div>
                ) : (
                  <div className="mt-5 space-y-0">
                    {statuses.map((status, index) => {
                      const completed = currentIndex >= index;
                      const isCurrent = currentIndex === index;

                      return (
                        <div
                          key={status}
                          className="flex gap-4"
                        >
                          <div className="flex flex-col items-center">
                            <div
                              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                                completed
                                  ? "bg-[#76233a] text-white"
                                  : "bg-gray-100 text-gray-400"
                              }`}
                            >
                              {completed ? (
                                <CheckCircle2 size={19} />
                              ) : (
                                <Clock size={18} />
                              )}
                            </div>

                            {index !== statuses.length - 1 && (
                              <div
                                className={`h-10 w-0.5 ${
                                  currentIndex > index
                                    ? "bg-[#76233a]"
                                    : "bg-gray-200"
                                }`}
                              />
                            )}
                          </div>

                          <div className="pt-1">
                            <p
                              className={`font-semibold ${
                                completed
                                  ? "text-[#54251f]"
                                  : "text-gray-400"
                              }`}
                            >
                              {status}
                            </p>

                            {isCurrent && (
                              <p className="mt-1 text-xs text-[#a36b25]">
                                Your current order status
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>

              {/* PRODUCTS */}
              <div className="my-7 border-t border-gray-100" />

              <h2 className="font-bold text-[#54251f]">
                Items ordered
              </h2>

              <div className="mt-4 space-y-4">
                {items.map((item, index) => {
                  const image =
                    item.image ||
                    item.image_url ||
                    item.product_image ||
                    "";

                  return (
                    <div
                      key={`${item.id || item.name}-${index}`}
                      className="flex items-center gap-3"
                    >
                      {image ? (
                        <img
                          src={image}
                          alt={item.name || "Product"}
                          className="h-16 w-16 shrink-0 rounded-xl border border-gray-100 object-cover"
                          onError={(event) => {
                            event.currentTarget.style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-[#fff4e9] text-[#b58a62]">
                          <ImageOff size={23} />
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-gray-800">
                          {item.name || "Product"}
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                          {money(item.price)} × {item.quantity}
                        </p>
                      </div>

                      <p className="shrink-0 font-bold text-[#76233a]">
                        {money(
                          Number(item.price || 0) *
                          Number(item.quantity || 0)
                        )}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* PAYMENT AND TOTAL */}
              <div className="my-7 border-t border-gray-100" />

              <div className="space-y-3 text-sm">
                <div className="flex justify-between gap-3">
                  <span className="text-gray-500">Payment method</span>
                  <strong>{order.payment_method || "Not available"}</strong>
                </div>

                <div className="flex justify-between gap-3">
                  <span className="text-gray-500">Payment status</span>
                  <strong>{order.payment_status || "Pending"}</strong>
                </div>

                <div className="flex justify-between gap-3">
                  <span className="text-gray-500">Subtotal</span>
                  <strong>{money(order.subtotal)}</strong>
                </div>

                <div className="flex justify-between gap-3">
                  <span className="text-gray-500">Delivery</span>
                  <strong>{money(order.delivery_charge)}</strong>
                </div>

                <div className="flex justify-between border-t border-gray-100 pt-3 text-base">
                  <span className="font-bold text-[#54251f]">
                    Order total
                  </span>
                  <strong className="text-[#76233a]">
                    {money(order.total ?? order.subtotal)}
                  </strong>
                </div>
              </div>

              {/* DELIVERY ADDRESS */}
              <div className="mt-7 rounded-2xl bg-[#fff8ef] p-5">
                <div className="flex items-center gap-2">
                  <Truck size={19} className="text-[#76233a]" />
                  <h2 className="font-bold text-[#54251f]">
                    Delivery address
                  </h2>
                </div>

                <p className="mt-3 text-sm font-semibold text-gray-800">
                  {address.fullName || "Customer"}
                </p>

                <p className="mt-1 text-sm leading-6 text-gray-600">
                  {[
                    address.house,
                    address.area,
                    address.city,
                    address.state,
                    address.pincode,
                  ].filter(Boolean).join(", ")}
                </p>

                {address.phone && (
                  <p className="mt-2 text-sm text-gray-600">
                    Phone: {address.phone}
                  </p>
                )}
              </div>

              <p className="mt-6 text-center text-xs text-gray-400">
                Your order status refreshes automatically every 10 seconds.
              </p>
            </div>
          )}
        </div>
      </main>
    </>
  );
}

export default OrderTracking;
