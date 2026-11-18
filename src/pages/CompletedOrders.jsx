
import { useCallback, useEffect, useState } from "react";
import {
  ArrowLeft,
  RefreshCw,
  Download,
  CheckCircle,
  Package,
  IndianRupee,
  CalendarDays,
  AlertCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import AdminLayout from "../pages/AdminLayout";

function money(value) {
  return `₹${Number(value || 0).toLocaleString("en-IN")}`;
}

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

function formatDate(value) {
  if (!value) return "Date unavailable";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Date unavailable";

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getOrderNumber(order) {
  return order?.order_number || order?.id || "Order";
}

function exportCompletedOrders(orders) {
  if (!orders.length) return;

  const rows = orders.map((order) => {
    const address = getAddress(order);
    const items = Array.isArray(order.items) ? order.items : [];

    return {
      orderNumber: getOrderNumber(order),
      customer: address.fullName || "Customer",
      phone: address.phone || "",
      address: [
        address.house,
        address.area,
        address.city,
        address.state,
        address.pincode,
      ].filter(Boolean).join(", "),
      products: items.map((item) =>
        `${item.name || "Product"} x ${item.quantity || 0}`
      ).join(", "),
      total: money(order.total),
      payment: order.payment_method || "",
      paymentStatus: order.payment_status || "Pending",
      date: formatDate(order.created_at),
    };
  });

  const escapeHTML = (value) =>
    String(value ?? "").replace(/[&<>"']/g, (char) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    })[char]);

  const tableRows = rows.map((order) => `
    <tr>
      <td>${escapeHTML(order.orderNumber)}</td>
      <td>${escapeHTML(order.customer)}</td>
      <td>${escapeHTML(order.phone)}</td>
      <td>${escapeHTML(order.address)}</td>
      <td>${escapeHTML(order.products)}</td>
      <td>${escapeHTML(order.total)}</td>
      <td>${escapeHTML(order.payment)}</td>
      <td>${escapeHTML(order.paymentStatus)}</td>
      <td>${escapeHTML(order.date)}</td>
    </tr>
  `).join("");

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>PURV Completed Orders</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 24px;
            color: #421521;
          }

          h1 {
            margin-bottom: 5px;
          }

          p {
            color: #666;
            font-size: 13px;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 25px;
            font-size: 10px;
          }

          th {
            background: #76233a;
            color: white;
            text-align: left;
          }

          th, td {
            border: 1px solid #e5d8d2;
            padding: 8px;
            vertical-align: top;
          }

          tr:nth-child(even) {
            background: #fff8f4;
          }

          .total {
            margin-top: 20px;
            font-weight: bold;
          }

          @page {
            size: landscape;
            margin: 12mm;
          }

          @media print {
            body {
              padding: 0;
            }
          }
        </style>
      </head>

      <body>
        <h1>PURV — Completed Orders Report</h1>
        <p>Delivered customer orders</p>
        <p>Total completed orders: ${orders.length}</p>

        <table>
          <thead>
            <tr>
              <th>Order Number</th>
              <th>Customer</th>
              <th>Phone</th>
              <th>Address</th>
              <th>Products</th>
              <th>Total</th>
              <th>Payment</th>
              <th>Payment Status</th>
              <th>Order Date</th>
            </tr>
          </thead>

          <tbody>${tableRows}</tbody>
        </table>

        <p class="total">
          Total delivered order value:
          ${money(orders.reduce((sum, order) => sum + Number(order.total || 0), 0))}
        </p>

        <script>
          window.onload = function () {
            window.print();
          };
        </script>
      </body>
    </html>
  `;

  const printWindow = window.open("", "_blank");

  if (!printWindow) {
    alert("Please allow pop-ups to export the PDF.");
    return;
  }

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}

export default function CompletedOrders() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const verifyAdmin = useCallback(async () => {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      window.location.replace("/admin/login");
      return false;
    }

    const { data: admin, error: adminError } = await supabase
      .from("admin_users")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (adminError) throw adminError;

    if (!admin) {
      await supabase.auth.signOut();
      window.location.replace("/admin/login");
      return false;
    }

    return true;
  }, []);

  const loadCompletedOrders = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const isAdmin = await verifyAdmin();

      if (!isAdmin) return;

      const { data, error: queryError } = await supabase
        .from("orders")
        .select("*")
        .eq("status", "Delivered")
        .order("created_at", { ascending: false });

      if (queryError) throw queryError;

      setOrders(data || []);
    } catch (err) {
      console.error("Loading completed orders failed:", err);
      setError(err.message || "Unable to load completed orders.");
    } finally {
      setLoading(false);
    }
  }, [verifyAdmin]);

  useEffect(() => {
    loadCompletedOrders();
  }, [loadCompletedOrders]);

  const totalValue = orders.reduce(
    (sum, order) => sum + Number(order.total || 0),
    0
  );

  return (
    <AdminLayout
      title="Completed Orders"
      subtitle="View and export all successfully delivered orders."
      active="orders"
      actions={
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={loadCompletedOrders}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:border-[#76233a] disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>

          <button
            type="button"
            onClick={() => exportCompletedOrders(orders)}
            disabled={!orders.length}
            className="inline-flex items-center gap-2 rounded-xl bg-[#76233a] px-4 py-2 text-sm font-semibold text-white hover:bg-[#421521] disabled:opacity-50"
          >
            <Download size={16} />
            Export PDF
          </button>
        </div>
      }
    >
      <button
        type="button"
        onClick={() => navigate("/admin/orders")}
        className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-[#76233a] hover:underline"
      >
        <ArrowLeft size={17} />
        Back to active orders
      </button>

      {error && (
        <div className="mb-5 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-green-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Delivered orders</p>
              <h2 className="mt-2 text-3xl font-bold text-[#76233a]">
                {orders.length}
              </h2>
              <p className="mt-1 text-xs text-gray-400">Successfully completed</p>
            </div>
            <div className="rounded-xl bg-green-50 p-3 text-green-700">
              <CheckCircle size={24} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-amber-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Delivered order value</p>
              <h2 className="mt-2 text-3xl font-bold text-[#76233a]">
                {money(totalValue)}
              </h2>
              <p className="mt-1 text-xs text-gray-400">Total value of delivered orders</p>
            </div>
            <div className="rounded-xl bg-amber-50 p-3 text-amber-700">
              <IndianRupee size={24} />
            </div>
          </div>
        </div>
      </div>

      <section className="overflow-hidden rounded-2xl border border-[#eee2dc] bg-white shadow-sm">
        <div className="border-b border-gray-100 p-5">
          <h3 className="text-xl font-bold text-[#421521]">
            All completed orders
          </h3>
          <p className="mt-1 text-xs text-gray-500">
            {orders.length} delivered orders
          </p>
        </div>

        {loading ? (
          <div className="flex min-h-60 flex-col items-center justify-center gap-3 text-gray-500">
            <RefreshCw size={30} className="animate-spin text-[#76233a]" />
            <p className="text-sm">Loading completed orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="flex min-h-60 flex-col items-center justify-center p-6 text-center">
            <Package size={40} className="text-gray-300" />
            <h4 className="mt-3 font-semibold text-gray-800">
              No completed orders yet
            </h4>
            <p className="mt-1 text-sm text-gray-500">
              Orders will appear here after their status is changed to Delivered.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-[#faf7f4] text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-5 py-4">Order</th>
                  <th className="px-5 py-4">Customer</th>
                  <th className="px-5 py-4">Phone</th>
                  <th className="px-5 py-4">Delivered value</th>
                  <th className="px-5 py-4">Payment</th>
                  <th className="px-5 py-4">Order date</th>
                  <th className="px-5 py-4">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {orders.map((order) => {
                  const address = getAddress(order);

                  return (
                    <tr key={order.id} className="hover:bg-[#fffdfa]">
                      <td className="px-5 py-4 font-bold text-[#76233a]">
                        {getOrderNumber(order)}
                      </td>
                      <td className="px-5 py-4 font-medium text-gray-800">
                        {address.fullName || "Customer"}
                      </td>
                      <td className="px-5 py-4 text-gray-500">
                        {address.phone || "Unavailable"}
                      </td>
                      <td className="px-5 py-4 font-bold text-gray-800">
                        {money(order.total)}
                      </td>
                      <td className="px-5 py-4 text-gray-600">
                        {order.payment_method || "Unavailable"}
                        <p className="mt-1 text-xs text-gray-400">
                          {order.payment_status || "Pending"}
                        </p>
                      </td>
                      <td className="px-5 py-4 text-gray-500">
                        {formatDate(order.created_at)}
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1 rounded-full border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700">
                          <CheckCircle size={13} />
                          Delivered
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
    </AdminLayout>
  );
}
