
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Search,
  ShoppingBag,
  Heart,
  Menu,
  X,
  MapPin,
  ChevronDown,
  UserRound,
  Sparkles,
  Gift,
  ArrowRight,
  Clock3,
  Flower2,
} from "lucide-react";

import { useShop } from "../context/ShopContext";
import { categories } from "../data/categories";

export default function Header() {
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);

  const navigate = useNavigate();
  const currentLocation = useLocation();

  const { cartCount, addresses, wishlist } = useShop();

  const savedAddress =
    addresses.length > 0 ? addresses[addresses.length - 1] : null;

  const navLinks = [
    { label: "Home", path: "/" },
    { label: "Categories", path: "/categories" },
    { label: "Beauty", path: "/category/makeup" },
    { label: "Jewellery", path: "/category/jewellery" },
    { label: "Pooja essentials", path: "/category/pooja-items" },
    { label: "Festive decor", path: "/category/diwali-decor" },
    { label: "Gift hampers", path: "/category/gift-hampers" },
  ];

  const addressLabel = savedAddress
    ? [
        savedAddress.house,
        savedAddress.area,
        savedAddress.city,
        savedAddress.pincode,
      ]
        .filter(Boolean)
        .join(", ")
    : "Add your delivery address";

  function handleSearch(event) {
    event.preventDefault();

    const query = search.trim();

    if (!query) return;

    navigate(`/search?q=${encodeURIComponent(query)}`);
    setMenuOpen(false);
    setLocationOpen(false);
  }

  function closeMenu() {
    setMenuOpen(false);
  }

  function toggleLocation() {
    setLocationOpen((previous) => !previous);
    setMenuOpen(false);
  }

  function isActive(path) {
    if (path === "/") return currentLocation.pathname === "/";
    if (path === "/categories") return currentLocation.pathname === path;

    return (
      currentLocation.pathname === path ||
      currentLocation.pathname.startsWith(`${path}/`)
    );
  }

  return (
    <>
      <div className="fixed inset-x-0 top-0 z-50">
        {/* FESTIVE ANNOUNCEMENT */}
        <div className="relative overflow-hidden bg-[#421521] text-[#fff4df]">
          <div className="pointer-events-none absolute -left-6 -top-10 h-24 w-24 rounded-full border border-[#f6c86c]/20" />
          <div className="pointer-events-none absolute -right-4 -top-10 h-24 w-24 rounded-full border border-[#f6c86c]/20" />

          <div className="relative mx-auto flex min-h-9 max-w-[1500px] items-center justify-center gap-2 px-3 py-2 text-center">
            <Sparkles size={13} className="shrink-0 text-[#f6bd65]" />

            <p className="text-[10px] font-semibold tracking-wide sm:text-xs">
              A little more joy, a little more{" "}
              <span className="font-extrabold text-[#ffd48c]">Purv</span>
              <span className="hidden sm:inline">
                {" "}· Thoughtful finds for every celebration
              </span>
            </p>

            <Sparkles size={13} className="shrink-0 text-[#f6bd65]" />
          </div>
        </div>

        {/* MAIN HEADER */}
        <header className="border-b border-[#eee1d7] bg-[#fffdf9]/95 shadow-[0_5px_24px_rgba(66,21,33,0.055)] backdrop-blur-xl">
          <div className="mx-auto flex max-w-[1500px] items-center gap-2 px-3 py-3 sm:gap-4 sm:px-5 lg:gap-6 lg:px-8">
            {/* MOBILE MENU */}
            <button
              type="button"
              onClick={() => {
                setMenuOpen((previous) => !previous);
                setLocationOpen(false);
              }}
              className="flex h-10 w-9 shrink-0 items-center justify-center rounded-xl text-[#54251f] transition hover:bg-[#f8eae3] md:hidden"
              aria-label={menuOpen ? "Close navigation" : "Open navigation"}
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

            {/* BRAND */}
            <Link
              to="/"
              onClick={closeMenu}
              className="group flex shrink-0 items-center gap-2.5"
              aria-label="Purv home"
            >
              <span className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#76233a] to-[#421521] text-[#ffe0a4] shadow-[0_5px_14px_rgba(118,35,58,0.18)] transition duration-300 group-hover:-rotate-6 group-hover:scale-105 sm:h-12 sm:w-12">
                <Flower2 size={25} strokeWidth={1.7} />
                <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-[#fffdf9] bg-[#ed9b28]" />
              </span>

              <span className="flex flex-col leading-none">
                <span className="font-serif text-[29px] font-bold tracking-[-1.8px] text-[#54251f] transition group-hover:text-[#8b3026] sm:text-4xl">
                  purv<span className="text-[#e99535]">.</span>
                </span>

                <span className="mt-1 hidden text-[8px] font-extrabold tracking-[1.8px] text-[#947c70] sm:block">
                  BEAUTY · RITUALS · GIFTING
                </span>
              </span>
            </Link>

            {/* DELIVERY LOCATION */}
            <button
              type="button"
              onClick={toggleLocation}
              className="hidden min-w-[125px] max-w-[185px] shrink-0 items-center gap-2 rounded-2xl px-3 py-2 text-left transition hover:bg-[#f9eee5] lg:flex"
              aria-expanded={locationOpen}
              aria-label="View delivery address"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#f8e8df] text-[#8b3026]">
                <MapPin size={19} />
              </span>

              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1 text-[11px] font-extrabold text-[#54251f]">
                  Deliver to
                  <ChevronDown
                    size={13}
                    className={`transition-transform ${
                      locationOpen ? "rotate-180" : ""
                    }`}
                  />
                </span>

                <span className="mt-1 block truncate text-xs text-[#927d71]">
                  {savedAddress
                    ? savedAddress.city ||
                      savedAddress.pincode ||
                      "Saved address"
                    : "Add your location"}
                </span>
              </span>
            </button>

            {/* SEARCH */}
            <form
              onSubmit={handleSearch}
              role="search"
              className="group flex h-11 min-w-0 flex-1 items-center gap-2.5 rounded-2xl border border-[#eadfd5] bg-[#f8f5f0] px-3 transition duration-200 focus-within:border-[#bb7967] focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(139,48,38,0.07)] sm:h-12 sm:px-4"
            >
              <Search
                size={19}
                className="shrink-0 text-[#947d70] transition group-focus-within:text-[#8b3026]"
              />

              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search beauty, jewellery, gifts..."
                aria-label="Search products"
                className="h-full w-full min-w-0 border-0 bg-transparent p-0 text-xs text-[#422b27] outline-none placeholder:text-[#a39287] focus:outline-none focus:ring-0 sm:text-sm"
              />

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="shrink-0 rounded-full p-1 text-[#8b766b] transition hover:bg-[#f1e6dd]"
                  aria-label="Clear search"
                >
                  <X size={15} />
                </button>
              )}

              <button
                type="submit"
                aria-label="Submit search"
                className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#76233a] text-white transition hover:bg-[#421521] sm:flex"
              >
                <ArrowRight size={16} />
              </button>
            </form>

            {/* GIFT FINDER */}
            <Link
              to="/gift-finder"
              className={`hidden shrink-0 items-center gap-2 rounded-2xl px-3 py-2.5 transition xl:flex ${
                isActive("/gift-finder")
                  ? "bg-[#76233a] text-white"
                  : "bg-[#fff0d9] text-[#843d2d] hover:bg-[#ffe4b6]"
              }`}
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/70">
                <Gift size={18} />
              </span>
              <span>
                <span className="block text-xs font-extrabold">Find a Gift</span>
                <span className="mt-0.5 block text-[9px] opacity-75">
                  Made personal
                </span>
              </span>
            </Link>

            {/* PROFILE */}
            <Link
              to="/profile"
              aria-label="My profile"
              className="hidden shrink-0 flex-col items-center gap-1 rounded-xl px-2 py-2 text-[#6b554b] transition hover:bg-[#f9eee5] hover:text-[#8b3026] sm:flex"
            >
              <UserRound size={21} />
              <span className="text-[10px] font-semibold">Profile</span>
            </Link>

            {/* WISHLIST */}
            <Link
              to="/wishlist"
              aria-label={`Wishlist, ${wishlist.length} saved products`}
              className="relative hidden shrink-0 flex-col items-center gap-1 rounded-xl px-2 py-2 text-[#6b554b] transition hover:bg-[#f9eee5] hover:text-[#8b3026] sm:flex"
            >
              <Heart size={21} />

              {wishlist.length > 0 && (
                <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#c4434b] px-1 text-[9px] font-extrabold text-white">
                  {wishlist.length}
                </span>
              )}

              <span className="text-[10px] font-semibold">Wishlist</span>
            </Link>

            {/* CART */}
            <Link
              to="/cart"
              aria-label={`Shopping cart, ${cartCount} items`}
              className="relative flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-2xl bg-gradient-to-r from-[#76233a] to-[#9e3546] px-2.5 text-white shadow-[0_5px_14px_rgba(118,35,58,0.18)] transition hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(118,35,58,0.24)] sm:h-12 sm:gap-2 sm:px-4"
            >
              <ShoppingBag size={19} />

              <span className="hidden text-sm font-bold sm:inline">Cart</span>

              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#ffd88e] px-1 text-[10px] font-extrabold text-[#54251f]">
                {cartCount}
              </span>
            </Link>
          </div>

          {/* ADDRESS PANEL */}
          {locationOpen && (
            <div className="border-t border-[#eee1d7] bg-white px-4 py-5 shadow-lg">
              <div className="mx-auto flex max-w-[1450px] flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#f8e8df] text-[#8b3026]">
                    <MapPin size={21} />
                  </span>

                  <div>
                    <p className="text-sm font-extrabold text-[#54251f]">
                      Your delivery address
                    </p>

                    <p className="mt-1 max-w-xl text-xs leading-5 text-[#927d71]">
                      {addressLabel}
                    </p>

                    <p className="mt-1 text-[10px] text-[#a39287]">
                      Manage your saved addresses for checkout.
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 sm:shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setLocationOpen(false);
                      navigate("/checkout/address");
                    }}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#76233a] px-4 py-3 text-xs font-bold text-white transition hover:bg-[#421521]"
                  >
                    {savedAddress ? "Manage addresses" : "Add address"}
                    <ArrowRight size={14} />
                  </button>

                  <button
                    type="button"
                    onClick={() => setLocationOpen(false)}
                    className="rounded-xl border border-[#eadfd5] px-4 py-3 text-xs font-semibold text-[#6b554b] transition hover:bg-[#fff8f1]"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* DESKTOP CATEGORY NAVIGATION */}
          <nav
            aria-label="Main navigation"
            className="hidden border-t border-[#f1e8df] md:block"
          >
            <div className="mx-auto flex max-w-[1500px] items-center gap-6 overflow-x-auto px-5 py-3 lg:gap-8 lg:px-8">
              {navLinks.map((item) => {
                const active = isActive(item.path);

                return (
                  <Link
                    key={item.label}
                    to={item.path}
                    className={`relative shrink-0 whitespace-nowrap py-1 text-xs font-bold transition ${
                      active
                        ? "text-[#8b3026]"
                        : "text-[#78645a] hover:text-[#8b3026]"
                    }`}
                  >
                    {item.label}

                    {active && (
                      <span className="absolute -bottom-3 left-0 right-0 h-[3px] rounded-full bg-gradient-to-r from-[#76233a] to-[#ed9b28]" />
                    )}
                  </Link>
                );
              })}

              <Link
                to="/gift-finder"
                className="ml-auto flex shrink-0 items-center gap-1.5 rounded-full border border-[#f1d4a7] bg-[#fff3de] px-3.5 py-2 text-[10px] font-extrabold text-[#843d2d] transition hover:border-[#e6b96f] hover:bg-[#ffe6b9]"
              >
                <Sparkles size={13} />
                DISCOVER YOUR GIFT
                <ArrowRight size={12} />
              </Link>
            </div>
          </nav>

          {/* MOBILE MENU */}
          {menuOpen && (
            <nav
              aria-label="Mobile navigation"
              className="max-h-[70vh] overflow-y-auto border-t border-[#eee1d7] bg-[#fffdf9] p-4 shadow-xl md:hidden"
            >
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="font-serif text-xl font-bold text-[#54251f]">
                    Explore Purv
                  </p>
                  <p className="mt-1 text-[11px] text-[#927d71]">
                    Little joys for every celebration
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeMenu}
                  className="rounded-xl p-2 text-[#76594b] hover:bg-[#f8eae3]"
                  aria-label="Close navigation"
                >
                  <X size={20} />
                </button>
              </div>

              <Link
                to="/gift-finder"
                onClick={closeMenu}
                className="mb-4 flex items-center gap-3 rounded-2xl bg-gradient-to-r from-[#76233a] to-[#a44348] p-4 text-white shadow-sm"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15">
                  <Gift size={23} />
                </span>

                <span className="flex-1">
                  <span className="block text-sm font-extrabold">
                    Find the perfect gift
                  </span>
                  <span className="mt-1 block text-[11px] text-white/75">
                    Personalised festive recommendations
                  </span>
                </span>

                <ArrowRight size={18} />
              </Link>

              <div className="grid grid-cols-2 gap-2">
                {navLinks.map((item) => (
                  <Link
                    key={item.label}
                    to={item.path}
                    onClick={closeMenu}
                    className={`rounded-xl border p-3 text-xs font-bold transition ${
                      isActive(item.path)
                        ? "border-[#e8c8b8] bg-[#f8e8df] text-[#8b3026]"
                        : "border-[#f0e5db] bg-white text-[#674b3c] hover:bg-[#fff4e8]"
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}

                {categories
                  .filter(
                    (category) =>
                      !navLinks.some(
                        (item) => item.path === `/category/${category.slug}`
                      )
                  )
                  .map((category) => (
                    <Link
                      key={category.id}
                      to={`/category/${category.slug}`}
                      onClick={closeMenu}
                      className="rounded-xl border border-[#f0e5db] bg-white p-3 text-xs font-semibold text-[#674b3c] transition hover:bg-[#fff4e8]"
                    >
                      {category.name}
                    </Link>
                  ))}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <Link
                  to="/wishlist"
                  onClick={closeMenu}
                  className="flex items-center justify-center gap-2 rounded-xl bg-[#fbe9e8] p-3 text-xs font-bold text-[#92372e]"
                >
                  <Heart size={16} />
                  Wishlist ({wishlist.length})
                </Link>

                <Link
                  to="/orders"
                  onClick={closeMenu}
                  className="flex items-center justify-center gap-2 rounded-xl bg-[#fff0dc] p-3 text-xs font-bold text-[#8a4c24]"
                >
                  <ShoppingBag size={16} />
                  My orders
                </Link>

                <Link
                  to="/profile"
                  onClick={closeMenu}
                  className="col-span-2 flex items-center justify-center gap-2 rounded-xl border border-[#eee1d7] p-3 text-xs font-bold text-[#674b3c]"
                >
                  <UserRound size={16} />
                  My profile
                </Link>
              </div>

              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  setLocationOpen(true);
                }}
                className="mt-3 flex w-full items-center gap-3 rounded-xl bg-[#f8e8df] p-3 text-left text-xs font-bold text-[#8c3328]"
              >
                <MapPin size={17} />

                <span className="min-w-0 flex-1 truncate">
                  {savedAddress
                    ? `Deliver to ${savedAddress.city || "saved address"}`
                    : "Add your delivery address"}
                </span>

                <ChevronDown size={15} />
              </button>
            </nav>
          )}
        </header>
      </div>
    </>
  );
}
