
import { useCallback, useEffect, useState } from "react";
import {
  ArrowLeft,
  RefreshCw,
  Download,
  XCircle,
  IndianRupee,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import AdminLayout from "../pages/AdminLayout";

function getAddress(order) {
  const address = order?.delivery_address;

  if (!address) return {};

  if (typeof address === "string") {
    try {
      return JSON.parse(address);
    } catch {
      return {};
    }
  }

  return address;
}

function getOrderNumber(order) {
  return order?.order_number || order?.id || "Order";
}

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return entities[character];
  });
}

export default function CancelledOrders() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const verifyAdmin = useCallback(async () => {
    const { data: authData, error: authError } =
      await supabase.auth.getUser();

    if (authError || !authData?.user) {
      navigate("/admin/login");
      return false;
    }

    const { data: admin, error: adminError } = await supabase
      .from("admin_users")
      .select("user_id")
      .eq("user_id", authData.user.id)
      .maybeSingle();

    if (adminError) throw adminError;

    if (!admin) {
      await supabase.auth.signOut();
      navigate("/admin/login");
      return false;
    }

    return true;
  }, [navigate]);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const isAdmin = await verifyAdmin();

      if (!isAdmin) return;

      const { data, error: queryError } = await supabase
        .from("orders")
        .select("*")
        .eq("status", "Cancelled")
        .order("created_at", { ascending: false });

      if (queryError) throw queryError;

      setOrders(data || []);
    } catch (err) {
      console.error("Loading cancelled orders failed:", err);
      setError(err.message || "Unable to load cancelled orders.");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [verifyAdmin]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const totalValue = orders.reduce(
    (sum, order) => sum + Number(order.total || 0),
    0
  );

  const formatDate = (date) => {
    if (!date) return "—";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) return "—";

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const exportPDF = () => {
    if (!orders.length) return;

    const rows = orders
      .map((order) => {
        const address = getAddress(order);

        const customerName = address.fullName || "Customer";
        const phone = address.phone || "—";

        return `
          <tr>
            <td>${escapeHTML(getOrderNumber(order))}</td>
            <td>${escapeHTML(customerName)}</td>
            <td>${escapeHTML(phone)}</td>
            <td>₹${Number(order.total || 0).toFixed(2)}</td>
            <td>${escapeHTML(order.payment_status || "—")}</td>
            <td>${escapeHTML(formatDate(order.created_at))}</td>
          </tr>
        `;
      })
      .join("");

    const report = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Purv Cancelled Orders Report</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 25px;
            color: #29201f;
          }

          h1 {
            color: #76233a;
            margin-bottom: 5px;
          }

          .summary {
            margin: 20px 0;
            padding: 15px;
            background: #fff1f0;
            line-height: 1.8;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }

          th, td {
            border: 1px solid #ddd;
            padding: 10px;
            text-align: left;
          }

          th {
            background: #76233a;
            color: white;
          }

          @media print {
            button {
              display: none;
            }
          }
        </style>
      </head>

      <body>
        <h1>Purv — Cancelled Orders</h1>
        <p>Cancelled orders report</p>

        <div class="summary">
          <strong>Total cancelled orders:</strong> ${orders.length}<br/>
          <strong>Cancelled order value:</strong> ₹${totalValue.toFixed(2)}
        </div>

        <table>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Phone</th>
              <th>Amount</th>
              <th>Payment</th>
              <th>Date</th>
            </tr>
          </thead>

          <tbody>${rows}</tbody>
        </table>

        <script>
          window.onload = () => window.print();
        </script>
      </body>
      </html>
    `;

    const printWindow = window.open("", "_blank");

    if (!printWindow) {
      alert("Please allow pop-ups to export the PDF.");
      return;
    }

    printWindow.document.write(report);
    printWindow.document.close();
  };

  return (
    <AdminLayout
      title="Cancelled Orders"
      subtitle="Review and manage cancelled customer orders."
      active="orders"
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={loadOrders}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-[#76233a] hover:text-[#76233a] disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>

          <button
            type="button"
            onClick={exportPDF}
            disabled={!orders.length || loading}
            className="flex items-center gap-2 rounded-xl bg-[#76233a] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#421521] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Download size={16} />
            Export PDF
          </button>
        </div>
      }
    >
      <div className="space-y-6">

        <button
          type="button"
          onClick={() => navigate("/admin/orders")}
          className="flex items-center gap-2 text-sm font-semibold text-gray-500 transition hover:text-[#76233a]"
        >
          <ArrowLeft size={17} />
          Back to active orders
        </button>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">

          <div className="rounded-2xl border border-rose-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-500">
                Cancelled orders
              </p>
              <div className="rounded-xl bg-red-50 p-3 text-red-600">
                <XCircle size={21} />
              </div>
            </div>

            <p className="mt-3 text-3xl font-bold text-[#54251f]">
              {orders.length}
            </p>

            <p className="mt-1 text-xs text-gray-400">
              Total cancelled orders
            </p>
          </div>

          <div className="rounded-2xl border border-rose-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-500">
                Cancelled order value
              </p>
              <div className="rounded-xl bg-amber-50 p-3 text-amber-700">
                <IndianRupee size={21} />
              </div>
            </div>

            <p className="mt-3 text-3xl font-bold text-[#54251f]">
              ₹{totalValue.toLocaleString("en-IN")}
            </p>

            <p className="mt-1 text-xs text-gray-400">
              Combined value of cancelled orders
            </p>
          </div>

        </div>

        <section className="overflow-hidden rounded-2xl border border-[#eee2dc] bg-white shadow-sm">

          <div className="border-b border-gray-100 p-5">
            <h2 className="font-serif text-xl font-bold text-[#421521]">
              Cancelled orders list
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              {orders.length} cancelled orders found
            </p>
          </div>

          {loading ? (
            <div className="flex min-h-64 flex-col items-center justify-center gap-3 text-gray-500">
              <RefreshCw
                size={30}
                className="animate-spin text-[#76233a]"
              />
              <p className="text-sm">Loading cancelled orders...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="p-12 text-center">
              <XCircle
                className="mx-auto mb-3 text-gray-300"
                size={42}
              />

              <h3 className="font-semibold text-gray-800">
                No cancelled orders yet
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Cancelled orders will appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left text-sm">

                <thead className="bg-[#faf7f4] text-xs uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="p-4 font-semibold">Order ID</th>
                    <th className="p-4 font-semibold">Customer</th>
                    <th className="p-4 font-semibold">Phone</th>
                    <th className="p-4 font-semibold">Amount</th>
                    <th className="p-4 font-semibold">Payment</th>
                    <th className="p-4 font-semibold">Date</th>
                    <th className="p-4 font-semibold">Status</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {orders.map((order) => {
                    const address = getAddress(order);

                    return (
                      <tr
                        key={order.id}
                        className="transition hover:bg-[#fffdfa]"
                      >
                        <td className="p-4 font-bold text-[#76233a]">
                          {getOrderNumber(order)}
                        </td>

                        <td className="p-4 font-medium text-gray-800">
                          {address.fullName || "Customer"}
                        </td>

                        <td className="p-4 text-gray-600">
                          {address.phone || "—"}
                        </td>

                        <td className="p-4 font-bold text-gray-800">
                          ₹{Number(order.total || 0).toLocaleString("en-IN")}
                        </td>

                        <td className="p-4 text-gray-600">
                          {order.payment_status || "Pending"}
                        </td>

                        <td className="p-4 text-gray-600">
                          {formatDate(order.created_at)}
                        </td>

                        <td className="p-4">
                          <span className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
                            Cancelled
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>

              </table>
            </div>
          )}
        </section>

        <p className="text-center text-xs text-gray-400">
          PURV · Cancelled order management
        </p>

      </div>
    </AdminLayout>
  );
}
