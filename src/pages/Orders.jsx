
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Package,
  RefreshCw,
  CalendarDays,
} from "lucide-react";

import Header from "../components/Header";
import { useShop } from "../context/ShopContext";
import { supabase } from "../lib/supabase";

function money(value) {
  return `₹${Number(value || 0).toLocaleString("en-IN")}`;
}

export default function Orders() {
  const { orders } = useShop();
  const [liveOrders, setLiveOrders] = useState(orders);
  const [refreshing, setRefreshing] = useState(false);

  const refreshOrders = useCallback(async () => {
    if (!orders.length) {
      setLiveOrders([]);
      return;
    }

    setRefreshing(true);

    try {
      const updatedOrders = await Promise.all(
        orders.map(async (localOrder) => {
          try {
            const { data, error } = await supabase.rpc(
              "get_customer_order",
              { p_order_id: localOrder.id }
            );

            if (error) throw error;

            // Use the latest Supabase order when available.
            return data
              ? { ...localOrder, ...data }
              : localOrder;
          } catch (error) {
            console.error(
              "Could not refresh order:",
              localOrder.id,
              error
            );

            return localOrder;
          }
        })
      );

      setLiveOrders(updatedOrders);
    } finally {
      setRefreshing(false);
    }
  }, [orders]);

  useEffect(() => {
    refreshOrders();

    const interval = setInterval(refreshOrders, 15000);

    return () => clearInterval(interval);
  }, [refreshOrders]);

  return (
    <>
      <Header />

      <main className="min-h-screen bg-[#fffaf4] px-4 py-8 md:px-10">
        <div className="mx-auto max-w-5xl">

          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-[#8b3a2b]"
          >
            <ArrowLeft size={18} />
            Back to Home
          </Link>

          <div className="my-8 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="flex items-center gap-3 text-3xl font-bold text-[#54251f]">
                <Package size={30} />
                My Orders
              </h1>

              <p className="mt-2 text-sm text-gray-500">
                View your orders and check their latest status.
              </p>
            </div>

            <button
              type="button"
              onClick={refreshOrders}
              disabled={refreshing}
              className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-white px-4 py-2.5 text-sm font-semibold text-[#76233a] hover:bg-rose-50 disabled:opacity-50"
            >
              <RefreshCw
                size={16}
                className={refreshing ? "animate-spin" : ""}
              />
              Refresh
            </button>
          </div>

          {liveOrders.length === 0 ? (
            <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
              <Package
                size={45}
                className="mx-auto text-[#b45324]"
              />

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
            <div className="space-y-4">
              {[...liveOrders].reverse().map((order) => {
                const items = Array.isArray(order.items)
                  ? order.items
                  : [];

                const status = order.status || "Order placed";

                return (
                  <article
                    key={order.id}
                    className="rounded-2xl border border-rose-100 bg-white p-5 shadow-sm transition hover:shadow-md sm:p-6"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-xs text-gray-500">
                          Order number
                        </p>

                        <h2 className="mt-1 font-bold text-[#54251f]">
                          {order.order_number || order.orderNumber || order.id}
                        </h2>

                        <p className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                          <CalendarDays size={14} />
                          {order.created_at || order.createdAt
                            ? new Date(
                                order.created_at || order.createdAt
                              ).toLocaleString("en-IN")
                            : "Date unavailable"}
                        </p>
                      </div>

                      <span className="rounded-full bg-rose-50 px-3 py-1.5 text-sm font-semibold text-[#76233a]">
                        {status}
                      </span>
                    </div>

                    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4">
                      <div>
                        <p className="text-sm text-gray-500">
                          {items.length} product(s)
                        </p>

                        <p className="mt-1 text-lg font-bold text-[#8b3a2b]">
                          {money(order.total ?? order.subtotal)}
                        </p>
                      </div>

                      <Link
                        to={`/orders/${order.id}`}
                        className="rounded-xl bg-[#76233a] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#421521]"
                      >
                        Track Order
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          <p className="mt-5 text-center text-xs text-gray-400">
            Order status refreshes automatically while this page is open.
          </p>
        </div>
      </main>
    </>
  );
}
