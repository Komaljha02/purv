import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  RefreshCw,
  MapPin,
  Phone,
  ImageOff,
  X,
  Search,
  Download,
  IndianRupee,
  Clock,
  Truck,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Eye,
  SlidersHorizontal,
  CheckCircle,
  AlertCircle,
  Wallet,
  ShoppingBag,
  Package,
  Bell,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import AdminLayout from "../pages/AdminLayout";

const orderStatuses = [
  "Order placed",
  "Confirmed",
  "Packed",
  "Shipped",
  "Delivered",
  "Cancelled",
];

const paymentStatuses = ["Pending", "Paid", "Failed", "Refunded"];
const PAGE_SIZE = 10;

const inputClass =
  "w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-[#a64d61] focus:ring-2 focus:ring-rose-100";

function money(value) {
  return `₹${Number(value || 0).toLocaleString("en-IN")}`;
}

function getOrderNumber(order) {
  return order?.order_number || order?.id || "Order";
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

function getItems(order) {
  return Array.isArray(order?.items) ? order.items : [];
}

function getImage(item) {
  return (
    item.image ||
    item.image_url ||
    item.product_image ||
    item.imageUrl ||
    item.thumbnail ||
    ""
  );
}

function isCOD(order) {
  const method = String(order?.payment_method || "").toLowerCase();
  return (
    method.includes("cash on delivery") ||
    method === "cod" ||
    method.includes("cash-on-delivery")
  );
}

function getPaymentOptions(order) {
  const options = isCOD(order) ? ["Pending", "Paid"] : paymentStatuses;
  const currentStatus = order?.payment_status;
  return currentStatus && !options.includes(currentStatus)
    ? [...options, currentStatus]
    : options;
}

function getOrderStatusStyle(status) {
  const styles = {
    "Order placed": "bg-amber-50 text-amber-800 border-amber-200",
    Confirmed: "bg-blue-50 text-blue-700 border-blue-200",
    Packed: "bg-purple-50 text-purple-700 border-purple-200",
    Shipped: "bg-indigo-50 text-indigo-700 border-indigo-200",
    Delivered: "bg-green-50 text-green-700 border-green-200",
    Cancelled: "bg-red-50 text-red-700 border-red-200",
  };
  return styles[status] || "bg-gray-100 text-gray-700 border-gray-200";
}

function getPaymentStatusStyle(status) {
  const styles = {
    Pending: "bg-amber-50 text-amber-800 border-amber-200",
    Paid: "bg-green-50 text-green-700 border-green-200",
    Failed: "bg-red-50 text-red-700 border-red-200",
    Refunded: "bg-purple-50 text-purple-700 border-purple-200",
  };
  return styles[status] || "bg-gray-100 text-gray-700 border-gray-200";
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

function formatDeliveryDate(value) {
  if (!value) return "Not scheduled";

  // Parse YYYY-MM-DD as a local date to avoid timezone shifting.
  const parts = String(value).split("-");
  if (parts.length !== 3) return "Not scheduled";

  const [year, month, day] = parts.map(Number);
  const date = new Date(year, month - 1, day);

  if (Number.isNaN(date.getTime())) return "Not scheduled";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getDeliverySchedule(order) {
  return {
    date: formatDeliveryDate(order?.delivery_date),
    time: order?.delivery_time_slot || "Not scheduled",
  };
}

function localDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function downloadCSV(orders) {
  if (!orders.length) return;

  const headers = [
    "Order Number",
    "Customer",
    "Phone",
    "Address",
    "Products",
    "Quantity",
    "Subtotal",
    "Delivery",
    "Total",
    "Payment Method",
    "Payment Status",
    "Order Status",
    "Date",
  ];

  const rows = orders.map((order) => {
    const address = getAddress(order);
    const items = getItems(order);
    return [
      getOrderNumber(order),
      address.fullName || "Customer",
      address.phone || "",
      [
        address.house,
        address.area,
        address.city,
        address.state,
        address.pincode,
      ]
        .filter(Boolean)
        .join(", "),
      items.map((item) => item.name || "Product").join("; "),
      items.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
      order.subtotal || 0,
      order.delivery_charge || 0,
      order.total || 0,
      order.payment_method || "",
      order.payment_status || "Pending",
      order.status || "Order placed",
      formatDate(order.created_at),
    ];
  });

  const escapeCSV = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;
  const csv = [headers, ...rows]
    .map((row) => row.map(escapeCSV).join(","))
    .join("\n");
  const blob = new Blob(["\uFEFF" + csv], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `purv-orders-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function StatCard({ title, value, subtitle, icon: Icon, color }) {
  return (
    <div className="rounded-2xl border border-rose-100 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-gray-500">{title}</p>
          <p className="mt-2 truncate text-2xl font-bold text-[#54251f]">
            {value}
          </p>
          <p className="mt-1 text-xs text-gray-400">{subtitle}</p>
        </div>
        <div className={`rounded-xl p-3 ${color}`}>
          <Icon size={21} />
        </div>
      </div>
    </div>
  );
}

function ProductImage({ item }) {
  const [failed, setFailed] = useState(false);
  const image = getImage(item);

  if (!image || failed) {
    return (
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#fff2e7] text-[#b58a62]">
        <ImageOff size={21} />
      </div>
    );
  }

  return (
    <img
      src={image}
      alt={item.name || "Product"}
      onError={() => setFailed(true)}
      className="h-14 w-14 shrink-0 rounded-xl border border-gray-100 object-cover"
    />
  );
}

function OrderDetails({
  order,
  onClose,
  onUpdateOrder,
  onUpdatePayment,
  updatingOrder,
  updatingPayment,
}) {
  if (!order) return null;

  const address = getAddress(order);
  const items = getItems(order);
  const codOrder = isCOD(order);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-3 sm:p-5"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-detail-title"
        className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl sm:p-7"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-gray-100 pb-4">
          <div>
            <p className="text-xs font-semibold tracking-wider text-[#a36b25]">
              ORDER DETAILS
            </p>
            <h2
              id="order-detail-title"
              className="mt-1 text-xl font-bold text-[#76233a]"
            >
              {getOrderNumber(order)}
            </h2>
            <p className="mt-1 text-xs text-gray-500">
              {formatDate(order.created_at)}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
            aria-label="Close details"
          >
            <X size={21} />
          </button>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl bg-[#fff8ef] p-4">
            <h3 className="font-bold text-gray-800">Customer details</h3>
            <p className="mt-2 text-sm text-gray-700">
              {address.fullName || "Customer"}
            </p>
            <p className="mt-2 flex items-start gap-2 text-sm text-gray-500">
              <MapPin size={15} className="mt-0.5 shrink-0" />
              <span>
                {[
                  address.house,
                  address.area,
                  address.city,
                  address.state,
                  address.pincode,
                ]
                  .filter(Boolean)
                  .join(", ") || "Address unavailable"}
              </span>
            </p>
            {address.phone && (
              <a
                href={`tel:${address.phone}`}
                className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-[#76233a]"
              >
                <Phone size={14} />
                {address.phone}
              </a>
            )}
          </div>

          <div className="rounded-xl bg-[#fff8ef] p-4">
            <h3 className="font-bold text-gray-800">Payment information</h3>
            <p className="mt-2 text-sm text-gray-600">
              Method: {order.payment_method || "Not available"}
            </p>
            <p className="mt-3 text-xl font-bold text-[#76233a]">
              {money(order.total)}
            </p>
            <div className="mt-3">
              <label className="mb-1.5 block text-xs font-semibold text-gray-600">
                {codOrder ? "Cash collection status" : "Payment status"}
              </label>
              <select
                value={order.payment_status || "Pending"}
                disabled={updatingPayment}
                onChange={(event) => onUpdatePayment(order, event.target.value)}
                className={`${inputClass} ${getPaymentStatusStyle(order.payment_status || "Pending")}`}
              >
                {getPaymentOptions(order).map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
              {codOrder && (
                <p className="mt-2 text-xs leading-5 text-gray-500">
                  Keep this as Pending until the customer pays the delivery
                  person. Change it to Paid after receiving the cash.
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-bold text-gray-800">Products ordered</h3>
            <span className="text-xs text-gray-500">
              {items.length} {items.length === 1 ? "item" : "items"}
            </span>
          </div>
          {items.length === 0 ? (
            <p className="rounded-xl bg-gray-50 p-4 text-sm text-gray-500">
              No product information available.
            </p>
          ) : (
            <div className="divide-y divide-gray-100">
              {items.map((item, index) => (
                <div
                  key={`${item.id || item.name || "item"}-${index}`}
                  className="flex items-center gap-3 py-3"
                >
                  <ProductImage item={item} />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-gray-800">
                      {item.name || "Product"}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      {money(item.price)} × {Number(item.quantity || 0)}
                    </p>
                  </div>
                  <p className="shrink-0 font-bold text-[#76233a]">
                    {money(
                      Number(item.price || 0) * Number(item.quantity || 0),
                    )}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-4 space-y-3 border-t border-gray-100 pt-4 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Subtotal</span>
            <strong>{money(order.subtotal)}</strong>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Delivery charge</span>
            <strong>{money(order.delivery_charge)}</strong>
          </div>
          <div className="flex justify-between border-t border-gray-100 pt-3 text-base">
            <strong>Total amount</strong>
            <strong className="text-[#76233a]">{money(order.total)}</strong>
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-rose-100 bg-[#fffaf5] p-4">
          <label className="mb-2 block text-sm font-bold text-gray-800">
            Update order status
          </label>
          <select
            value={order.status || "Order placed"}
            disabled={updatingOrder}
            onChange={(event) => onUpdateOrder(order, event.target.value)}
            className={inputClass}
          >
            {orderStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <p className="mt-2 text-xs text-gray-500">
            The customer's order tracking page will reflect the updated status.
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-5 w-full rounded-xl bg-[#76233a] px-4 py-3 text-sm font-bold text-white hover:bg-[#421521]"
        >
          Close details
        </button>
      </div>
    </div>
  );
}

export default function AdminOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [updatingPaymentId, setUpdatingPaymentId] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newOrderCount, setNewOrderCount] = useState(0);
  const [latestNewOrder, setLatestNewOrder] = useState(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [sortOrder, setSortOrder] = useState("newest");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

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

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const isAdmin = await verifyAdmin();
      if (!isAdmin) return;

      const { data, error: queryError } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (queryError) throw queryError;
      setOrders(data || []);
    } catch (err) {
      console.error("Loading orders failed:", err);
      setError(err.message || "Unable to load orders.");
    } finally {
      setLoading(false);
    }
  }, [verifyAdmin]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  // Listen for new orders in real time
  useEffect(() => {
    let channel = null;
    let cancelled = false;

    async function subscribeToNewOrders() {
      try {
        const isAdmin = await verifyAdmin();

        if (!isAdmin || cancelled) return;

        channel = supabase
          .channel("purv-admin-new-orders")
          .on(
            "postgres_changes",
            {
              event: "INSERT",
              schema: "public",
              table: "orders",
            },
            (payload) => {
              const newOrder = payload.new;

              if (!newOrder?.id) return;

              setOrders((previous) => {
                // Prevent duplicate entries
                if (previous.some((order) => order.id === newOrder.id)) {
                  return previous;
                }

                return [newOrder, ...previous];
              });

              setLatestNewOrder(newOrder);
              setNewOrderCount((previous) => previous + 1);
            },
          )
          .subscribe((status) => {
            if (status === "CHANNEL_ERROR") {
              console.error("Could not connect to live order notifications.");
            }
          });
      } catch (error) {
        console.error("Realtime subscription failed:", error);
      }
    }

    subscribeToNewOrders();

    return () => {
      cancelled = true;

      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [verifyAdmin]);

  async function updateOrderStatus(order, newStatus) {
    if (!newStatus || newStatus === order.status) return;

    const confirmed = window.confirm(
      `Change ${getOrderNumber(order)} from "${order.status || "Order placed"}" to "${newStatus}"?`,
    );
    if (!confirmed) return;

    setError("");
    setSuccess("");
    setUpdatingId(order.id);

    try {
      if (!(await verifyAdmin())) return;

      const { error: updateError } = await supabase
        .from("orders")
        .update({ status: newStatus })
        .eq("id", order.id);
      if (updateError) throw updateError;

      const updatedOrder = { ...order, status: newStatus };
      setOrders((previous) =>
        previous.map((item) => (item.id === order.id ? updatedOrder : item)),
      );
      setSelectedOrder((previous) =>
        previous?.id === order.id ? updatedOrder : previous,
      );
      setSuccess(`Order status updated to ${newStatus}.`);
    } catch (err) {
      console.error("Updating order status failed:", err);
      setError(err.message || "Could not update order status.");
    } finally {
      setUpdatingId(null);
    }
  }

  async function updatePaymentStatus(order, newPaymentStatus) {
    if (!newPaymentStatus || newPaymentStatus === order.payment_status) return;

    const confirmed = window.confirm(
      `Update payment status for ${getOrderNumber(order)} to "${newPaymentStatus}"?`,
    );
    if (!confirmed) return;

    setError("");
    setSuccess("");
    setUpdatingPaymentId(order.id);

    try {
      if (!(await verifyAdmin())) return;

      const { error: updateError } = await supabase
        .from("orders")
        .update({ payment_status: newPaymentStatus })
        .eq("id", order.id);
      if (updateError) throw updateError;

      const updatedOrder = { ...order, payment_status: newPaymentStatus };
      setOrders((previous) =>
        previous.map((item) => (item.id === order.id ? updatedOrder : item)),
      );
      setSelectedOrder((previous) =>
        previous?.id === order.id ? updatedOrder : previous,
      );
      setSuccess(
        isCOD(order)
          ? `Cash collection status updated to ${newPaymentStatus}.`
          : `Payment status updated to ${newPaymentStatus}.`,
      );
    } catch (err) {
      console.error("Updating payment status failed:", err);
      setError(err.message || "Could not update payment status.");
    } finally {
      setUpdatingPaymentId(null);
    }
  }

  function resetFilters() {
    setSearch("");
    setFilter("All");
    setSortOrder("newest");
    setFromDate("");
    setToDate("");
    setPage(1);
  }

  const pendingCount = orders.filter((order) =>
    ["Order placed", "Confirmed"].includes(order.status || "Order placed"),
  ).length;

  const processingCount = orders.filter((order) =>
    ["Packed", "Shipped"].includes(order.status),
  ).length;

  const deliveredCount = orders.filter(
    (order) => order.status === "Delivered",
  ).length;
  const cancelledCount = orders.filter(
    (order) => order.status === "Cancelled",
  ).length;
  const codPendingCount = orders.filter(
    (order) =>
      isCOD(order) && (order.payment_status || "Pending") === "Pending",
  ).length;

  const totalSales = orders.reduce((sum, order) => {
    if (order.status === "Cancelled") return sum;
    return sum + Number(order.total || 0);
  }, 0);

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();

    // Active orders only: delivered and cancelled orders are excluded.
    const activeOrders = orders.filter(
      (order) => !["Delivered", "Cancelled"].includes(order.status),
    );

    const result = activeOrders.filter((order) => {
      const address = getAddress(order);
      const searchableText = [
        getOrderNumber(order),
        address.fullName,
        address.phone,
        address.city,
        address.pincode,
        order.payment_method,
        order.payment_status,
        order.status,
        ...getItems(order).map((item) => item.name),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = !query || searchableText.includes(query);
      const matchesStatus = filter === "All" || order.status === filter;
      const date = localDate(order.created_at);
      const matchesFrom = !fromDate || (date && date >= fromDate);
      const matchesTo = !toDate || (date && date <= toDate);
      return matchesSearch && matchesStatus && matchesFrom && matchesTo;
    });

    result.sort((a, b) => {
      const first = new Date(a.created_at || 0).getTime();
      const second = new Date(b.created_at || 0).getTime();
      return sortOrder === "newest" ? second - first : first - second;
    });

    return result;
  }, [orders, search, filter, fromDate, toDate, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  useEffect(() => {
    setPage(1);
  }, [search, filter, fromDate, toDate, sortOrder]);

  const pageActions = (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={loadOrders}
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 transition hover:border-[#76233a] hover:text-[#76233a] disabled:opacity-50 sm:px-4 sm:text-sm"
      >
        <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
        Refresh
      </button>
      <button
        type="button"
        onClick={() => downloadCSV(filteredOrders)}
        disabled={!filteredOrders.length}
        className="inline-flex items-center gap-2 rounded-xl bg-[#76233a] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#421521] disabled:cursor-not-allowed disabled:opacity-50 sm:px-4 sm:text-sm"
      >
        <Download size={16} />
        Export
      </button>
    </div>
  );

  return (
    <AdminLayout
      title="Orders"
      subtitle="Manage customer orders, payments and deliveries."
      active="orders"
      actions={pageActions}
    >
      {error && (
        <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle size={18} className="shrink-0" />
          <p className="flex-1 break-words">{error}</p>
          <button
            type="button"
            onClick={() => setError("")}
            aria-label="Dismiss error"
          >
            <X size={17} />
          </button>
        </div>
      )}

      {success && (
        <div className="mb-5 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
          <CheckCircle size={18} className="shrink-0" />
          <p className="flex-1">{success}</p>
          <button
            type="button"
            onClick={() => setSuccess("")}
            aria-label="Dismiss message"
          >
            <X size={17} />
          </button>
        </div>
      )}

      {/* Live new-order notification */}
      {latestNewOrder && (
        <section className="mb-6 overflow-hidden rounded-2xl border border-amber-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 bg-gradient-to-r from-[#fff8ed] to-white p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <div className="flex min-w-0 items-start gap-3">
              <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                <Bell size={21} />

                {newOrderCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
                    {newOrderCount}
                  </span>
                )}
              </div>

              <div className="min-w-0">
                <p className="font-bold text-[#54251f]">New order received!</p>

                <p className="mt-1 break-words text-sm text-gray-600">
                  {getOrderNumber(latestNewOrder)} ·{" "}
                  {getAddress(latestNewOrder).fullName || "Customer"} ·{" "}
                  {money(latestNewOrder.total)}
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  {latestNewOrder.payment_method || "Payment unavailable"} ·{" "}
                  {latestNewOrder.payment_status || "Pending"}
                </p>

                {newOrderCount > 1 && (
                  <p className="mt-1 text-xs font-semibold text-amber-700">
                    {newOrderCount} new orders received while you were here.
                  </p>
                )}
              </div>
            </div>

            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedOrder(latestNewOrder);
                  setNewOrderCount(0);
                  setLatestNewOrder(null);
                }}
                className="rounded-xl bg-[#76233a] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#421521]"
              >
                View order
              </button>

              <button
                type="button"
                onClick={() => {
                  setNewOrderCount(0);
                  setLatestNewOrder(null);
                }}
                className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-semibold text-gray-600 hover:bg-gray-50"
              >
                Dismiss
              </button>
            </div>
          </div>
        </section>
      )}
      <section className="mb-7 grid grid-cols-2 gap-3 xl:grid-cols-3 2xl:grid-cols-6">
        <StatCard
          title="Total orders"
          value={orders.length}
          subtitle="All customer orders"
          icon={ShoppingBag}
          color="bg-rose-50 text-[#76233a]"
        />

        <StatCard
          title="Order value"
          value={money(totalSales)}
          subtitle="Excluding cancelled"
          icon={IndianRupee}
          color="bg-amber-50 text-amber-700"
        />

        <StatCard
          title="Pending"
          value={pendingCount}
          subtitle="Placed or confirmed"
          icon={Clock}
          color="bg-orange-50 text-orange-700"
        />

        <StatCard
          title="Processing"
          value={processingCount}
          subtitle="Packed or shipped"
          icon={Truck}
          color="bg-blue-50 text-blue-700"
        />

        {/* Delivered Orders Card */}
        <button
          type="button"
          onClick={() => navigate("/admin/completed-orders")}
          className="text-left transition hover:-translate-y-1"
        >
          <StatCard
            title="Delivered orders"
            value={deliveredCount}
            subtitle="View completed orders"
            icon={CheckCircle}
            color="bg-green-50 text-green-700"
          />
        </button>
        {/* Cancelled Orders Card */}
        <button
          type="button"
          onClick={() => navigate("/admin/cancelled-orders")}
          className="text-left transition hover:-translate-y-1"
        >
          <StatCard
            title="Cancelled orders"
            value={cancelledCount}
            subtitle="View cancelled orders"
            icon={X}
            color="bg-red-50 text-red-700"
          />
        </button>
      </section>

      <section className="overflow-hidden rounded-2xl border border-[#eee2dc] bg-white shadow-sm">
        <div className="border-b border-gray-100 p-4 sm:p-5">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h3 className="font-serif text-xl font-bold text-[#421521]">
                All orders
              </h3>
              <p className="mt-1 text-xs text-gray-500">
                {filteredOrders.length} orders matching your filters
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowFilters((value) => !value)}
              className="flex w-fit items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50"
            >
              <SlidersHorizontal size={16} />
              {showFilters ? "Hide filters" : "Filters"}
            </button>
          </div>

          <div className="relative mt-4">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search order number, customer, phone or product..."
              className={`${inputClass} pl-10`}
            />
          </div>

          {showFilters && (
            <div className="mt-4 rounded-xl bg-[#fffaf5] p-4">
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-gray-500">
                    Order status
                  </label>
                  <select
                    value={filter}
                    onChange={(event) => setFilter(event.target.value)}
                    className={inputClass}
                  >
                    <option value="All">All statuses</option>
                    {orderStatuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-gray-500">
                    From date
                  </label>
                  <input
                    type="date"
                    value={fromDate}
                    max={toDate || undefined}
                    onChange={(event) => setFromDate(event.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-gray-500">
                    To date
                  </label>
                  <input
                    type="date"
                    value={toDate}
                    min={fromDate || undefined}
                    onChange={(event) => setToDate(event.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-gray-500">
                    Sort orders
                  </label>
                  <select
                    value={sortOrder}
                    onChange={(event) => setSortOrder(event.target.value)}
                    className={inputClass}
                  >
                    <option value="newest">Newest first</option>
                    <option value="oldest">Oldest first</option>
                  </select>
                </div>
              </div>
              <button
                type="button"
                onClick={resetFilters}
                className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-[#76233a] hover:underline"
              >
                <RotateCcw size={14} /> Clear all filters
              </button>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex min-h-64 flex-col items-center justify-center gap-3 text-gray-500">
            <RefreshCw size={32} className="animate-spin text-[#76233a]" />
            <p className="text-sm">Loading orders...</p>
          </div>
        ) : paginatedOrders.length === 0 ? (
          <div className="flex min-h-64 flex-col items-center justify-center p-6 text-center">
            <Package size={40} className="text-gray-300" />
            <h4 className="mt-3 font-semibold">No orders found</h4>
            <p className="mt-1 text-sm text-gray-500">
              Try another search or clear your filters.
            </p>
            <button
              type="button"
              onClick={resetFilters}
              className="mt-4 rounded-xl bg-[#76233a] px-4 py-2.5 text-sm font-semibold text-white"
            >
              Show all orders
            </button>
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[1100px] text-left text-sm">
                <thead className="bg-[#faf7f4] text-xs uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-5 py-4 font-semibold">Order</th>
                    <th className="px-5 py-4 font-semibold">Customer</th>
                    <th className="px-5 py-4 font-semibold">Date</th>
                    <th className="px-5 py-4 font-semibold">Total</th>
                    <th className="px-5 py-4 font-semibold">Payment</th>
                    <th className="px-5 py-4 font-semibold">Order status</th>
                    <th className="px-5 py-4 text-right font-semibold">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginatedOrders.map((order) => {
                    const address = getAddress(order);
                    const codOrder = isCOD(order);
                    return (
                      <tr
                        key={order.id}
                        className="transition hover:bg-[#fffdfa]"
                      >
                        <td className="px-5 py-4">
                          <p className="font-bold text-[#76233a]">
                            {getOrderNumber(order)}
                          </p>
                          <p className="mt-1 text-xs text-gray-400">
                            {getItems(order).length} items
                          </p>
                        </td>
                        <td className="px-5 py-4">
                          <p className="font-semibold text-gray-800">
                            {address.fullName || "Customer"}
                          </p>
                          <p className="mt-1 text-xs text-gray-500">
                            {address.phone || "No phone"}
                          </p>
                        </td>
                        <td className="px-5 py-4 text-sm text-gray-500">
                          {formatDate(order.created_at)}
                        </td>
                        <td className="px-5 py-4 font-bold text-gray-800">
                          {money(order.total)}
                        </td>
                        <td className="min-w-52 px-5 py-4">
                          <p className="text-sm text-gray-700">
                            {order.payment_method || "Unavailable"}
                          </p>
                          <select
                            value={order.payment_status || "Pending"}
                            disabled={updatingPaymentId === order.id}
                            onChange={(event) =>
                              updatePaymentStatus(order, event.target.value)
                            }
                            className={`mt-2 w-full max-w-40 rounded-full border px-3 py-2 text-xs font-semibold outline-none disabled:opacity-50 ${getPaymentStatusStyle(order.payment_status || "Pending")}`}
                          >
                            {getPaymentOptions(order).map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
                          {codOrder && (
                            <p className="mt-1 text-[10px] text-gray-400">
                              Cash collection
                            </p>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <select
                            value={order.status || "Order placed"}
                            disabled={updatingId === order.id}
                            onChange={(event) =>
                              updateOrderStatus(order, event.target.value)
                            }
                            className={`max-w-40 rounded-full border px-3 py-2 text-xs font-semibold outline-none disabled:opacity-50 ${getOrderStatusStyle(order.status)}`}
                          >
                            {orderStatuses.map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <button
                            type="button"
                            onClick={() => setSelectedOrder(order)}
                            className="inline-flex items-center gap-2 rounded-lg border border-rose-200 px-3 py-2 text-xs font-semibold text-[#76233a] hover:bg-rose-50"
                          >
                            <Eye size={15} /> View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="divide-y divide-gray-100 md:hidden">
              {paginatedOrders.map((order) => {
                const address = getAddress(order);
                const codOrder = isCOD(order);
                return (
                  <article key={order.id} className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="break-all font-bold text-[#76233a]">
                          {getOrderNumber(order)}
                        </p>
                        <p className="mt-1 text-xs text-gray-400">
                          {formatDate(order.created_at)}
                        </p>
                      </div>
                      <p className="shrink-0 font-bold text-[#76233a]">
                        {money(order.total)}
                      </p>
                    </div>
                    <div className="mt-3">
                      <p className="font-semibold text-gray-800">
                        {address.fullName || "Customer"}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        {address.phone || "No phone number"}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        {getItems(order).length} products ·{" "}
                        {order.payment_method || "Payment unavailable"}
                      </p>
                    </div>
                    <div className="mt-4 rounded-xl bg-[#fffaf5] p-3">
                      <label className="mb-1.5 block text-xs font-semibold text-gray-600">
                        {codOrder ? "Cash collection status" : "Payment status"}
                      </label>
                      <select
                        value={order.payment_status || "Pending"}
                        disabled={updatingPaymentId === order.id}
                        onChange={(event) =>
                          updatePaymentStatus(order, event.target.value)
                        }
                        className={`${inputClass} ${getPaymentStatusStyle(order.payment_status || "Pending")}`}
                      >
                        {getPaymentOptions(order).map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                      <label className="mb-1.5 mt-3 block text-xs font-semibold text-gray-600">
                        Order status
                      </label>
                      <select
                        value={order.status || "Order placed"}
                        disabled={updatingId === order.id}
                        onChange={(event) =>
                          updateOrderStatus(order, event.target.value)
                        }
                        className={`${inputClass} ${getOrderStatusStyle(order.status)}`}
                      >
                        {orderStatuses.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="mt-3 flex justify-end">
                      <button
                        type="button"
                        onClick={() => setSelectedOrder(order)}
                        className="inline-flex items-center gap-2 rounded-lg border border-rose-200 px-3 py-2 text-xs font-semibold text-[#76233a]"
                      >
                        <Eye size={15} /> View details
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </>
        )}

        {!loading && filteredOrders.length > 0 && (
          <div className="flex flex-col justify-between gap-3 border-t border-gray-100 bg-white p-4 sm:flex-row sm:items-center sm:px-5">
            <p className="text-xs text-gray-500">
              Showing {(currentPage - 1) * PAGE_SIZE + 1}–
              {Math.min(currentPage * PAGE_SIZE, filteredOrders.length)} of{" "}
              {filteredOrders.length} orders
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setPage((value) => Math.max(1, value - 1))}
                className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold hover:bg-gray-50 disabled:opacity-40"
              >
                <ChevronLeft size={15} /> Previous
              </button>
              <span className="px-2 text-xs font-semibold text-gray-600">
                {currentPage} / {totalPages}
              </span>
              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() =>
                  setPage((value) => Math.min(totalPages, value + 1))
                }
                className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold hover:bg-gray-50 disabled:opacity-40"
              >
                Next <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </section>

      <p className="mt-6 text-center text-xs text-gray-400">
        PURV · Admin order management
      </p>

      <OrderDetails
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onUpdateOrder={updateOrderStatus}
        onUpdatePayment={updatePaymentStatus}
        updatingOrder={updatingId === selectedOrder?.id}
        updatingPayment={updatingPaymentId === selectedOrder?.id}
      />
    </AdminLayout>
  );
}
