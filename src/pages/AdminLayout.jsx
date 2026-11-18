import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  Package,
  ShoppingBag,
  Store,
  LogOut,
  Menu,
  X,
  ChevronRight,
  ShieldCheck,
  Layers,
  Headset,
  Tag,
  Image,
} from "lucide-react";
import { supabase } from "../lib/supabase";

const navigation = [
  {
    label: "Products",
    path: "/admin/products",
    key: "products",
    icon: Package,
  },
  {
    label: "Categories",
    path: "/admin/categories",
    key: "categories",
    icon: Layers,
  },
  {
    label: "Homepage Banners",
    path: "/admin/banners",
    key: "banners",
    icon: Image,
  },
  {
    label: "Orders",
    path: "/admin/orders",
    key: "orders",
    icon: ShoppingBag,
  },
  {
    label: "Discount Offers",
    path: "/admin/discount-offers",
    key: "discount-offers",
    icon: Tag,
  },
];

export default function AdminLayout({
  title,
  subtitle,
  active = "products",
  actions,
  children,
}) {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    function handleEscape(event) {
      if (event.key === "Escape") setMobileOpen(false);
    }

    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = mobileOpen ? "hidden" : "";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  async function handleLogout() {
    if (loggingOut) return;

    setLoggingOut(true);

    const { error } = await supabase.auth.signOut();

    if (error) {
      setLoggingOut(false);
      window.alert(error.message);
      return;
    }

    navigate("/admin/login", { replace: true });
  }

  function SidebarContent() {
    return (
      <>
        <Link
          to="/admin/products"
          onClick={() => setMobileOpen(false)}
          className="flex items-center gap-3 border-b border-white/10 px-6 py-6"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-[#ffe2c7]">
            <Package size={24} />
          </div>

          <div>
            <p className="font-serif text-2xl font-bold tracking-wide">PURV</p>
            <p className="mt-0.5 text-[10px] font-semibold tracking-[0.22em] text-white/50">
              STORE MANAGEMENT
            </p>
          </div>
        </Link>

        <div className="px-4 pt-8">
          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
            Workspace
          </p>

          <nav className="space-y-1.5">
            {navigation.map((item) => {
              const Icon = item.icon;
              const selected = active === item.key;

              return (
                <NavLink
                  key={item.key}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={`group flex items-center gap-3 rounded-xl px-3.5 py-3.5 text-sm font-semibold transition-all duration-200 ${
                    selected
                      ? "bg-[#fff8f2] text-[#76233a] shadow-md"
                      : "text-white/65 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icon size={19} />
                  <span>{item.label}</span>

                  {selected && <ChevronRight size={16} className="ml-auto" />}
                </NavLink>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto p-4">
          <div className="mb-4 rounded-2xl border border-white/10 bg-white/[0.06] p-4">
            <div className="flex items-center gap-2">
              <ShieldCheck size={18} className="text-[#f4c77b]" />
              <span className="text-xs font-semibold text-white">
                Secure admin access
              </span>
            </div>

            <p className="mt-2 text-[11px] leading-5 text-white/45">
              Your store management is protected and connected to Supabase.
            </p>
          </div>

          <Link
            to="/"
            onClick={() => setMobileOpen(false)}
            className="mb-1 flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium text-white/65 transition hover:bg-white/10 hover:text-white"
          >
            <Store size={18} />
            View storefront
          </Link>

          <Link
            to="/contact"
            onClick={() => setMobileOpen(false)}
            className="mb-1 flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium text-white/65 transition hover:bg-white/10 hover:text-white"
          >
            <Headset size={18} />
            Contact page
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium text-white/65 transition hover:bg-red-400/10 hover:text-red-200 disabled:opacity-50"
          >
            <LogOut size={18} />
            {loggingOut ? "Logging out..." : "Log out"}
          </button>
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#faf7f4] text-[#30272a]">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[258px] flex-col bg-gradient-to-b from-[#421521] to-[#581d30] text-white lg:flex">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      <div
        className={`fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          mobileOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
        onClick={() => setMobileOpen(false)}
        aria-hidden={!mobileOpen}
      >
        <aside
          className={`flex h-full w-[min(285px,85vw)] flex-col bg-gradient-to-b from-[#421521] to-[#581d30] text-white shadow-2xl transition-transform duration-300 ease-out ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
          onClick={(event) => event.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-label="Admin navigation"
        >
          <div className="flex justify-end px-4 pt-3">
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
              className="rounded-xl p-2.5 text-white/70 transition hover:bg-white/10 hover:text-white"
            >
              <X size={21} />
            </button>
          </div>

          <SidebarContent />
        </aside>
      </div>

      {/* Main content */}
      <div className="min-h-screen min-w-0 lg:pl-[258px]">
        <header className="sticky top-0 z-30 border-b border-[#eee5e0] bg-white/95 backdrop-blur-xl">
          <div className="flex min-h-[72px] items-center justify-between gap-3 px-3 py-3 sm:px-6 lg:min-h-[78px] lg:px-9">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                aria-label="Open navigation"
                aria-expanded={mobileOpen}
                className="shrink-0 rounded-xl border border-[#eee3df] bg-white p-2.5 text-[#76233a] shadow-sm transition hover:bg-[#fff8f4] lg:hidden"
              >
                <Menu size={21} />
              </button>

              <div className="min-w-0">
                <div className="mb-1 flex items-center gap-1.5 text-[10px] font-medium text-gray-400 sm:text-[11px]">
                  <span className="shrink-0">Purv Admin</span>
                  <ChevronRight size={12} className="shrink-0" />
                  <span className="truncate capitalize">{title}</span>
                </div>

                <h1 className="truncate text-base font-bold tracking-tight text-[#421521] sm:text-xl">
                  {title}
                </h1>

                {subtitle && (
                  <p className="mt-0.5 hidden text-xs text-gray-500 sm:block">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>

            {actions && (
              <div className="flex max-w-[55%] shrink-0 items-center gap-2 overflow-x-auto">
                {actions}
              </div>
            )}
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1550px] min-w-0 px-3 py-5 sm:px-6 sm:py-7 lg:px-9">
          {children}
        </main>
      </div>
    </div>
  );
}
