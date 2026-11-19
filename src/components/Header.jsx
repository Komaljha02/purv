import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Search,
  ShoppingCart,
  UserRound,
  Menu,
  X,
  Headset,
  Home as HomeIcon,
  Flame,
  Flower2,
  Sparkles,
  Heart,
  PackageCheck,
  MapPin,
  Grid2X2,
  ChevronRight,
  MessageCircle,
  ArrowUpRight,
  Gift,
} from "lucide-react";

import { useShop } from "../context/ShopContext";
import { useAuth } from "../context/AuthContext";
const navItems = [
  { label: "Daily Puja", slug: "daily-puja", icon: Flame },
  {
    label: "Puja Thali & Accessories",
    slug: "puja-thali-accessories",
    icon: Sparkles,
  },
  {
    label: "Bhagwan Shringar",
    slug: "bhagwan-shringar",
    icon: Flower2,
  },
  { label: "Festival Kits", slug: "festival-kits", icon: Flame },
  { label: "Havan Samagri", slug: "havan-samagri", icon: Sparkles },
  { label: "Combos", slug: "combos-kits", icon: Gift },
];

const quickLinks = [
  {
    label: "Wishlist",
    subtitle: "Your saved picks",
    path: "/wishlist",
    icon: Heart,
  },
  {
    label: "My Orders",
    subtitle: "Track your orders",
    path: "/orders",
    icon: PackageCheck,
  },
  {
    label: "Delivery Address",
    subtitle: "Manage addresses",
    path: "/checkout/address",
    icon: MapPin,
  },
  {
    label: "My Profile",
    subtitle: "Your account",
    path: "/profile",
    icon: UserRound,
  },
];

const categoryBackgrounds = [
  "from-[#fff0d9] to-[#fff8e9]",
  "from-[#f7e6ec] to-[#fff4f4]",
  "from-[#eee9f8] to-[#faf5ff]",
  "from-[#fce9dc] to-[#fff6ec]",
  "from-[#e9eee2] to-[#f7f9ee]",
  "from-[#f8e6e4] to-[#fff5ed]",
];

export default function Header() {
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  const categoryScrollRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();
  const { cartCount } = useShop();
  const { user, loading: authLoading } = useAuth();

  const customerName =
    user?.user_metadata?.full_name?.trim().split(/\s+/)[0] ||
    user?.email?.split("@")[0] ||
    "";

  // Close the drawer whenever the customer changes pages.
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  // Prevent the page behind the drawer from scrolling.
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const handleSearch = (event) => {
    event.preventDefault();

    const query = search.trim();
    if (!query) return;

    navigate(`/search?q=${encodeURIComponent(query)}`);
    setSearch("");
    setMenuOpen(false);
  };

  const isActive = (path) =>
    path === "/"
      ? location.pathname === "/"
      : location.pathname.startsWith(path);

  const scrollCategories = () => {
    categoryScrollRef.current?.scrollBy({
      left: 220,
      behavior: "smooth",
    });
  };

  return (
    <>
      <header className="purv-header sticky top-0 z-[100] w-full bg-white shadow-md">
        {/* TOP HEADER */}
        <div className="purv-header-top border-b border-[#f0e3d9] bg-white">
          <div className="mx-auto flex min-h-[62px] max-w-[1500px] items-center gap-2 px-3 py-2 sm:min-h-[76px] sm:gap-4 sm:px-6 lg:gap-6 lg:px-8">
            {/* MOBILE MENU BUTTON */}
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              aria-expanded={menuOpen}
              className="grid h-9 w-8 shrink-0 place-items-center text-[#76233a] md:hidden"
            >
              <Menu size={23} />
            </button>

            {/* LOGO */}
            <Link
              to="/"
              onClick={() => setMenuOpen(false)}
              className="group flex shrink-0 items-center gap-1.5 sm:gap-3"
              aria-label="Purv Puja Samagri home"
            >
              <svg
                viewBox="0 0 80 62"
                aria-hidden="true"
                className="h-8 w-9 shrink-0 sm:h-12 sm:w-[58px]"
              >
                <g
                  fill="#edcc7c"
                  stroke="#76233a"
                  strokeWidth="2.2"
                  strokeLinejoin="round"
                >
                  <path d="M40 54C22 48 16 34 20 17C31 22 39 35 40 54Z" />
                  <path d="M40 54C58 48 64 34 60 17C49 22 41 35 40 54Z" />
                  <path d="M40 54C28 39 30 19 40 5C50 19 52 39 40 54Z" />
                  <path d="M40 54C18 55 7 45 4 33C19 33 31 40 40 54Z" />
                  <path d="M40 54C62 55 73 45 76 33C61 33 49 40 40 54Z" />
                </g>
                <path
                  d="M20 57H60"
                  stroke="#a77a32"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>

              <span className="flex flex-col leading-none">
                <span className="font-serif text-[24px] font-bold tracking-[-1.4px] text-[#541522] sm:text-[37px] sm:tracking-[-2px]">
                  PURV
                </span>
                <span className="mt-0.5 text-[6px] font-bold tracking-[1.2px] text-[#6b4936] sm:text-[10px] sm:tracking-[2.1px]">
                  PUJA SAMAGRI
                </span>
              </span>
            </Link>

            {/* TAGLINE */}
            <div className="hidden h-12 shrink-0 items-center border-l border-[#d4ad5e] pl-4 lg:flex">
              <p className="font-serif text-[12px] font-semibold italic leading-5 text-[#76233a]">
                || Bhakti Ka Har Pal ||
                <br />
                || Purv Ke Sang ||
              </p>
            </div>

            {/* SEARCH */}
            <form
              onSubmit={handleSearch}
              role="search"
              className="purv-header-search ml-auto flex h-9 min-w-0 max-w-[460px] flex-1 items-center rounded-full border border-[#eadcc7] bg-white pl-3 pr-1 shadow-sm transition focus-within:border-[#c79a55] sm:h-11 sm:pl-4"
            >
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search puja items..."
                aria-label="Search puja items"
                className="min-w-0 flex-1 bg-transparent text-[10px] text-[#3f2927] outline-none placeholder:text-[#93837a] sm:text-sm"
              />

              <button
                type="submit"
                aria-label="Search"
                className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#76233a] text-white transition hover:bg-[#421521] sm:h-9 sm:w-9"
              >
                <Search size={16} />
              </button>
            </form>

            {/* PROFILE - DESKTOP */}
            <Link
              to={user ? "/profile" : "/login"}
              className="hidden shrink-0 flex-col items-center gap-1 px-1 text-[#a77a32] transition hover:text-[#76233a] sm:flex"
            >
              <UserRound size={22} strokeWidth={1.7} />

              <span className="max-w-[110px] truncate whitespace-nowrap text-[9px] font-medium text-[#624438] sm:text-[10px]">
                {authLoading
                  ? "My Account"
                  : user
                    ? `Hello, ${customerName}`
                    : "Login / Sign Up"}
              </span>
            </Link>

            {/* CART */}
            <Link
              to="/cart"
              className="relative flex shrink-0 flex-col items-center gap-1 px-1 text-[#a77a32] transition hover:text-[#76233a]"
              aria-label={`Cart with ${cartCount} items`}
            >
              <span className="relative">
                <ShoppingCart size={21} strokeWidth={1.8} />
                <span className="absolute -right-2 -top-2 grid h-4 min-w-4 place-items-center rounded-full bg-[#76233a] px-1 text-[9px] font-bold text-white">
                  {cartCount}
                </span>
              </span>
              <span className="text-[9px] font-medium text-[#624438] sm:text-[10px]">
                Cart
              </span>
            </Link>
          </div>
        </div>

        {/* HORIZONTAL CATEGORY NAVIGATION */}
        <nav
          aria-label="Shop categories"
          className="w-full border-b border-[#76233a] bg-[#76233a]"
        >
          <div className="relative mx-auto max-w-[1500px]">
            <div
              ref={categoryScrollRef}
              className="flex items-center gap-7 overflow-x-auto scroll-smooth px-4 py-3 pr-12 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:gap-9 sm:px-6 md:w-full md:gap-6 md:px-5 md:pr-5 lg:gap-9"
            >
              {/* HOME */}
              <Link
                to="/"
                className={`relative flex shrink-0 flex-col items-center gap-1.5 px-1 pb-1 text-[11px] font-bold text-white transition ${
                  isActive("/")
                    ? "text-white"
                    : "text-white/90 hover:text-[#f5d68e]"
                }`}
              >
                <HomeIcon size={20} />
                Home
                {isActive("/") && (
                  <span className="absolute -bottom-3 left-0 h-[3px] w-full rounded-full bg-white" />
                )}
              </Link>

              {/* CATEGORY LINKS */}
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = location.pathname === `/category/${item.slug}`;

                return (
                  <Link
                    key={item.slug}
                    to={`/category/${item.slug}`}
                    className={`relative flex shrink-0 flex-col items-center gap-1.5 px-1 pb-1 text-[11px] font-bold text-white transition ${
                      active
                        ? "text-white"
                        : "text-white/90 hover:text-[#f5d68e]"
                    }`}
                  >
                    <Icon size={20} strokeWidth={1.8} />
                    <span className="whitespace-nowrap">{item.label}</span>

                    {active && (
                      <span className="absolute -bottom-3 left-0 h-[3px] w-full rounded-full bg-white" />
                    )}
                  </Link>
                );
              })}

              {/* CONTACT */}
              <Link
                to="/contact"
                className={`relative flex shrink-0 flex-col items-center gap-1.5 px-1 pb-1 text-[11px] font-bold text-white transition md:ml-auto md:mr-3 ${
                  isActive("/contact")
                    ? "text-white"
                    : "text-white/90 hover:text-[#f5d68e]"
                }`}
              >
                <Headset size={20} />
                Contact
                {isActive("/contact") && (
                  <span className="absolute -bottom-3 left-0 h-[3px] w-full rounded-full bg-white" />
                )}
              </Link>
            </div>

            {/* SCROLL RIGHT BUTTON */}
            <button
              type="button"
              aria-label="Scroll categories right"
              onClick={scrollCategories}
              className="absolute right-1 top-1/2 z-10 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full border border-[#eadcc7] bg-white text-[#76233a] shadow-md transition hover:bg-[#fff0e4] md:hidden"
            >
              <ChevronRight size={19} />
            </button>
          </div>
        </nav>
      </header>

      {/* MOBILE SLIDE-IN MENU */}
      <div
        className={`fixed inset-0 z-[200] md:hidden ${
          menuOpen
            ? "pointer-events-auto visible"
            : "pointer-events-none invisible"
        }`}
        aria-hidden={!menuOpen}
      >
        {/* BACKDROP */}
        <button
          type="button"
          aria-label="Close menu"
          onClick={() => setMenuOpen(false)}
          className={`absolute inset-0 h-full w-full bg-[#241015]/50 transition-opacity duration-300 ${
            menuOpen ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* DRAWER */}
        <aside
          role="dialog"
          aria-modal="true"
          aria-label="Purv shopping menu"
          className={`absolute left-0 top-0 flex h-[100dvh] w-[min(88vw,390px)] flex-col overflow-hidden bg-[#fffaf5] shadow-2xl transition-transform duration-300 ease-out ${
            menuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {/* DRAWER CONTENT */}
          <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-4 pb-5 pt-5">
            {/* QUICK ACCESS */}
            <section>
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[1.7px] text-[#a77a32]">
                    Your shortcuts
                  </p>
                  <h3 className="mt-1 font-serif text-lg font-bold text-[#421521]">
                    Everything in one place
                  </h3>
                </div>
                <Sparkles size={20} className="text-[#c28b3e]" />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {quickLinks.map((item, index) => {
                  const Icon = item.icon;
                  const isProfileLink = item.path === "/profile";

                  const quickLinkPath = isProfileLink
                    ? user
                      ? "/profile"
                      : "/login"
                    : item.path;

                  const quickLinkLabel = isProfileLink
                    ? authLoading
                      ? "My Account"
                      : user
                        ? `Hello, ${customerName}`
                        : "Login / Sign Up"
                    : item.label;

                  const quickLinkSubtitle = isProfileLink
                    ? user
                      ? "Your account"
                      : "Sign in to your account"
                    : item.subtitle;

                  return (
                    <Link
                      key={item.path}
                      to={quickLinkPath}
                      onClick={() => setMenuOpen(false)}
                      className="group flex min-w-0 items-center gap-3 rounded-2xl border border-[#efdfcc] bg-white p-3 shadow-[0_2px_8px_rgba(91,45,35,0.04)] transition duration-200 hover:-translate-y-0.5 hover:border-[#d8b77b] hover:shadow-md"
                    >
                      <span
                        className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${
                          index === 0
                            ? "bg-[#f9e7ed] text-[#76233a]"
                            : index === 1
                              ? "bg-[#fff0d9] text-[#a66a22]"
                              : index === 2
                                ? "bg-[#eaf0e4] text-[#59734b]"
                                : "bg-[#f1eafb] text-[#795b9d]"
                        }`}
                      >
                        <Icon size={19} />
                      </span>

                      <span className="min-w-0">
                        <span className="block truncate text-xs font-bold text-[#421521]">
                          {quickLinkLabel}
                        </span>
                        <span className="mt-1 block truncate text-[9px] text-[#99857b]">
                          {quickLinkSubtitle}
                        </span>
                      </span>
                    </Link>
                  );
                })}
              </div>
            </section>
            {/* SHOP BY CATEGORY */}
            <section>
              <div className="mb-3 flex items-end justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[1.7px] text-[#a77a32]">
                    Discover Purv
                  </p>
                  <h3 className="mt-1 font-serif text-lg font-bold text-[#421521]">
                    Shop by category
                  </h3>
                </div>

                <Link
                  to="/categories"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-1 text-[10px] font-bold text-[#76233a]"
                >
                  View all
                  <ArrowUpRight size={13} />
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {navItems.map((item, index) => {
                  const Icon = item.icon;
                  const active = location.pathname === `/category/${item.slug}`;

                  return (
                    <Link
                      key={item.slug}
                      to={`/category/${item.slug}`}
                      onClick={() => setMenuOpen(false)}
                      className={`group relative flex min-h-[83px] items-center gap-2.5 overflow-hidden rounded-2xl border p-3 transition duration-200 hover:-translate-y-0.5 hover:shadow-md ${
                        active
                          ? "border-[#76233a] bg-[#f8e8ed]"
                          : "border-[#efdfcc] bg-white"
                      }`}
                    >
                      <span
                        className={`grid h-11 w-11 shrink-0 place-items-center rounded-[14px] bg-gradient-to-br ${categoryBackgrounds[index]} text-[#76233a]`}
                      >
                        <Icon size={21} strokeWidth={1.8} />
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className="block text-[11px] font-bold leading-4 text-[#54202b]">
                          {item.label}
                        </span>
                        <span className="mt-1 flex items-center gap-1 text-[9px] font-medium text-[#a77a32]">
                          Explore
                          <ChevronRight size={11} />
                        </span>
                      </span>
                    </Link>
                  );
                })}
              </div>
            </section>

            {/* CONTACT CARD */}
            <Link
              to="/contact"
              onClick={() => setMenuOpen(false)}
              className="flex items-center justify-between rounded-2xl border border-[#ead5bd] bg-gradient-to-r from-[#fff0d6] via-[#fff7e9] to-[#fbe9e7] p-3.5 transition hover:shadow-md"
            >
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-white text-[#76233a] shadow-sm">
                  <Headset size={19} />
                </span>
                <span>
                  <span className="block text-xs font-bold text-[#54202b]">
                    Need a little help?
                  </span>
                  <span className="mt-1 block text-[10px] text-[#8d7166]">
                    We're happy to assist you
                  </span>
                </span>
              </div>
              <ChevronRight size={18} className="text-[#76233a]" />
            </Link>
          </div>

          {/* FIXED WHATSAPP FOOTER */}
          <div className="shrink-0 border-t border-[#efdfcc] bg-white px-4 py-3 pb-[max(12px,env(safe-area-inset-bottom))]">
            <a
              href="https://wa.me/918810628225"
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#76233a] px-4 py-3 text-xs font-bold text-white shadow-md transition hover:bg-[#421521]"
            >
              <MessageCircle size={17} />
              Chat with us on WhatsApp
              <ArrowUpRight size={14} />
            </a>
          </div>
        </aside>
      </div>
    </>
  );
}
