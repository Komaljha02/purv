import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  Filter,
  Heart,
  RotateCcw,
  Search,
  ShoppingBag,
  SlidersHorizontal,
  Sparkles,
  X,
} from "lucide-react";

import Header from "../components/Header";
import ProductCard from "../components/ProductCard";
import { categories } from "../data/categories";
import { products } from "../data/products";

const priceRanges = [
  { label: "All prices", value: "all" },
  { label: "Under ₹299", value: "299" },
  { label: "₹300–₹599", value: "599" },
  { label: "₹600–₹999", value: "999" },
  { label: "₹1,000+", value: "1000+" },
];

export default function CategoryProducts() {
  const { slug } = useParams();

  const [sortBy, setSortBy] = useState("recommended");
  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState("all");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const category = categories.find((item) => item.slug === slug);

  const categoryProducts = useMemo(() => {
    let filtered = products.filter(
      (product) => product.categorySlug === slug
    );

    const query = searchQuery.trim().toLowerCase();

    if (query) {
      filtered = filtered.filter((product) =>
        [
          product.name,
          product.category,
          product.description,
          ...(Array.isArray(product.tags) ? product.tags : []),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(query)
      );
    }

    if (priceRange === "299") {
      filtered = filtered.filter(
        (product) => Number(product.price) < 300
      );
    } else if (priceRange === "599") {
      filtered = filtered.filter(
        (product) =>
          Number(product.price) >= 300 &&
          Number(product.price) <= 599
      );
    } else if (priceRange === "999") {
      filtered = filtered.filter(
        (product) =>
          Number(product.price) >= 600 &&
          Number(product.price) <= 999
      );
    } else if (priceRange === "1000+") {
      filtered = filtered.filter(
        (product) => Number(product.price) >= 1000
      );
    }

    if (inStockOnly) {
      filtered = filtered.filter(
        (product) => Number(product.stock ?? 0) > 0
      );
    }

    switch (sortBy) {
      case "price-low":
        filtered.sort(
          (a, b) => Number(a.price) - Number(b.price)
        );
        break;

      case "price-high":
        filtered.sort(
          (a, b) => Number(b.price) - Number(a.price)
        );
        break;

      case "discount":
        filtered.sort((a, b) => {
          const discountA =
            Number(a.originalPrice) > 0
              ? (Number(a.originalPrice) - Number(a.price)) /
                Number(a.originalPrice)
              : 0;

          const discountB =
            Number(b.originalPrice) > 0
              ? (Number(b.originalPrice) - Number(b.price)) /
                Number(b.originalPrice)
              : 0;

          return discountB - discountA;
        });
        break;

      case "rating":
        filtered.sort(
          (a, b) => Number(b.rating ?? 0) - Number(a.rating ?? 0)
        );
        break;

      default:
        break;
    }

    return filtered;
  }, [slug, searchQuery, priceRange, inStockOnly, sortBy]);

  const resetFilters = () => {
    setSearchQuery("");
    setPriceRange("all");
    setInStockOnly(false);
    setSortBy("recommended");
  };

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    priceRange !== "all" ||
    inStockOnly;

  if (!category) {
    return (
      <>
        <Header />

        <main className="flex min-h-[65vh] flex-col items-center justify-center bg-[#fffaf5] px-5 pt-40 text-center">
          <div className="grid h-20 w-20 place-items-center rounded-[28px] bg-[#f8e8e5] text-[#76233a]">
            <ShoppingBag size={34} />
          </div>

          <h1 className="mt-5 font-serif text-3xl font-bold text-[#421521]">
            Category not found
          </h1>

          <p className="mt-2 max-w-sm text-sm leading-6 text-[#81716e]">
            This collection may have moved. Explore our other
            collections to find something lovely.
          </p>

          <Link
            to="/categories"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#76233a] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#421521]"
          >
            Browse categories
            <ArrowRight size={16} />
          </Link>
        </main>
      </>
    );
  }

  return (
    <div className="min-h-screen overflow-x-clip bg-[#fffaf5] text-[#29201f]">
      <Header />

      <main className="min-h-screen pb-14 pt-36 sm:pt-40">
        {/* Breadcrumb */}
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
          <Link
            to="/categories"
            className="inline-flex items-center gap-2 text-xs font-bold text-[#81716e] transition hover:text-[#76233a] sm:text-sm"
          >
            <ArrowLeft size={15} />
            All collections
          </Link>

          <div className="mt-3 flex flex-wrap items-center gap-2 text-[10px] text-[#958580] sm:text-xs">
            <Link to="/" className="hover:text-[#76233a]">
              Home
            </Link>
            <span>/</span>
            <Link
              to="/categories"
              className="hover:text-[#76233a]"
            >
              Categories
            </Link>
            <span>/</span>
            <span className="font-bold text-[#421521]">
              {category.name}
            </span>
          </div>
        </div>

        {/* Category hero */}
        <section className="mx-auto max-w-[1440px] px-3 pt-5 sm:px-6 sm:pt-7 lg:px-8">
          <div className="relative isolate overflow-hidden rounded-[26px] bg-[#421521] sm:rounded-[34px]">
            <div className="absolute -left-16 -top-24 -z-10 h-64 w-64 rounded-full border border-[#f5c66f]/20 sm:h-80 sm:w-80" />
            <div className="absolute -bottom-28 left-1/3 -z-10 h-64 w-64 rounded-full bg-[#a34852]/35 blur-3xl" />
            <div className="absolute inset-0 -z-20 bg-gradient-to-br from-[#421521] via-[#76233a] to-[#9b4149]" />

            <div className="grid min-h-[260px] items-stretch sm:grid-cols-[1fr_260px] md:grid-cols-[1fr_340px] lg:min-h-[320px]">
              <div className="flex flex-col items-start justify-center px-6 py-8 sm:px-8 md:px-10 lg:px-14">
                <span className="inline-flex items-center gap-2 rounded-full border border-[#f5c66f]/30 bg-white/[0.08] px-3 py-2 text-[9px] font-extrabold uppercase tracking-[2px] text-[#f5c66f] sm:text-[10px]">
                  <Sparkles size={13} />
                  The Purv collection
                </span>

                <h1 className="mt-4 font-serif text-3xl font-bold leading-tight text-[#fffaf5] sm:text-4xl lg:text-5xl">
                  {category.name}
                  <span className="ml-2 text-[#f5c66f]">.</span>
                </h1>

                <p className="mt-3 max-w-xl text-xs leading-6 text-white/75 sm:text-sm sm:leading-7">
                  {category.description ||
                    `Discover handpicked favourites from our ${category.name} collection, chosen to make your everyday moments and special celebrations feel beautiful.`}
                </p>

                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <span className="rounded-full bg-white/10 px-3 py-2 text-[10px] font-bold text-white sm:text-xs">
                    {products.filter(
                      (product) => product.categorySlug === slug
                    ).length}{" "}
                    products in this collection
                  </span>

                  <span className="flex items-center gap-1.5 text-[10px] font-semibold text-[#f5d8b1] sm:text-xs">
                    <Sparkles size={13} />
                    Curated with care
                  </span>
                </div>
              </div>

              <div className="relative hidden min-h-full overflow-hidden sm:block">
                {category.image ? (
                  <img
                    src={category.image}
                    alt={category.name}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-[#e8b77e] to-[#b85c58]" />
                )}

                <div className="absolute inset-0 bg-gradient-to-r from-[#76233a]/65 via-[#76233a]/10 to-transparent" />

                <div className="absolute bottom-5 right-5 rounded-2xl border border-white/30 bg-white/90 px-4 py-3 shadow-xl backdrop-blur-md">
                  <p className="text-[9px] font-extrabold uppercase tracking-[1.5px] text-[#a34852]">
                    Discover something
                  </p>
                  <p className="mt-1 text-sm font-bold text-[#421521]">
                    Made for your moments
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Shopping controls */}
        <section className="mx-auto max-w-[1440px] px-4 pt-8 sm:px-6 sm:pt-10 lg:px-8">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="mb-2 text-[10px] font-extrabold uppercase tracking-[2px] text-[#b45a36]">
                Find your favourite
              </p>

              <h2 className="font-serif text-2xl font-bold text-[#421521] sm:text-3xl">
                The collection edit
              </h2>

              <p className="mt-2 text-xs text-[#81716e] sm:text-sm">
                {categoryProducts.length}{" "}
                {categoryProducts.length === 1 ? "item" : "items"}
                {searchQuery.trim()
                  ? ` matching "${searchQuery.trim()}"`
                  : " ready to explore"}
              </p>
            </div>

            <div className="flex w-full flex-col gap-3 sm:flex-row md:w-auto">
              {/* Search */}
              <label className="flex min-h-11 flex-1 items-center gap-2 rounded-full border border-[#eadbd3] bg-white px-4 transition focus-within:border-[#b45a67] focus-within:ring-2 focus-within:ring-[#76233a]/10 md:w-64 md:flex-none">
                <Search size={16} className="shrink-0 text-[#9b8580]" />

                <input
                  type="search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder={`Search ${category.name.toLowerCase()}...`}
                  aria-label={`Search ${category.name}`}
                  className="min-w-0 flex-1 bg-transparent text-xs text-[#421521] outline-none placeholder:text-[#a69893] sm:text-sm"
                />

                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    aria-label="Clear search"
                    className="text-[#958580] hover:text-[#76233a]"
                  >
                    <X size={15} />
                  </button>
                )}
              </label>

              {/* Sort */}
              <label className="flex min-h-11 items-center gap-2 rounded-full border border-[#eadbd3] bg-white px-4 text-xs text-[#81716e] sm:text-sm">
                <SlidersHorizontal size={15} />

                <span className="whitespace-nowrap">Sort:</span>

                <select
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value)}
                  className="min-w-0 flex-1 cursor-pointer bg-transparent font-bold text-[#421521] outline-none sm:flex-none"
                  aria-label="Sort products"
                >
                  <option value="recommended">Recommended</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="discount">Biggest Discount</option>
                  <option value="rating">Top Rated</option>
                </select>

                <ChevronDown size={14} />
              </label>
            </div>
          </div>

          {/* Filter row */}
          <div className="mt-5 rounded-[22px] border border-[#f0e3dc] bg-white p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="grid h-8 w-8 place-items-center rounded-xl bg-[#f8e8e5] text-[#76233a]">
                  <Filter size={15} />
                </div>

                <span className="text-xs font-extrabold text-[#421521] sm:text-sm">
                  Refine your picks
                </span>
              </div>

              <button
                type="button"
                onClick={() => setFiltersOpen((open) => !open)}
                className="inline-flex items-center gap-1.5 rounded-full border border-[#eadbd3] px-3 py-2 text-[10px] font-bold text-[#76233a] transition hover:bg-[#fff5f2] sm:text-xs"
              >
                {filtersOpen ? "Hide filters" : "More filters"}
                <ChevronDown
                  size={14}
                  className={`transition-transform ${
                    filtersOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
            </div>

            <div className="mt-4">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[1.5px] text-[#958580]">
                Shop by budget
              </p>

              <div className="flex flex-wrap gap-2">
                {priceRanges.map((range) => {
                  const selected = priceRange === range.value;

                  return (
                    <button
                      key={range.value}
                      type="button"
                      onClick={() => setPriceRange(range.value)}
                      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-2 text-[10px] font-bold transition sm:text-xs ${
                        selected
                          ? "border-[#76233a] bg-[#76233a] text-white shadow-sm"
                          : "border-[#eadbd3] bg-[#fffaf7] text-[#765f5c] hover:border-[#c99ba0] hover:bg-[#fff3ef]"
                      }`}
                    >
                      {selected && <Check size={12} />}
                      {range.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {filtersOpen && (
              <div className="mt-4 border-t border-[#f0e3dc] pt-4">
                <label className="flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(event) =>
                      setInStockOnly(event.target.checked)
                    }
                    className="h-4 w-4 accent-[#76233a]"
                  />

                  <span className="text-xs font-semibold text-[#421521] sm:text-sm">
                    Show in-stock products only
                  </span>
                </label>
              </div>
            )}

            {hasActiveFilters && (
              <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-[#f0e3dc] pt-4">
                <span className="text-[10px] font-bold text-[#958580]">
                  Active filters:
                </span>

                {searchQuery.trim() && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#f8e8e5] px-3 py-1.5 text-[10px] font-bold text-[#76233a]">
                    Search: {searchQuery.trim()}
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      aria-label="Remove search filter"
                    >
                      <X size={12} />
                    </button>
                  </span>
                )}

                {priceRange !== "all" && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#f8e8e5] px-3 py-1.5 text-[10px] font-bold text-[#76233a]">
                    {priceRanges.find(
                      (range) => range.value === priceRange
                    )?.label}
                    <button
                      type="button"
                      onClick={() => setPriceRange("all")}
                      aria-label="Remove price filter"
                    >
                      <X size={12} />
                    </button>
                  </span>
                )}

                {inStockOnly && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#f8e8e5] px-3 py-1.5 text-[10px] font-bold text-[#76233a]">
                    In stock
                    <button
                      type="button"
                      onClick={() => setInStockOnly(false)}
                      aria-label="Remove stock filter"
                    >
                      <X size={12} />
                    </button>
                  </span>
                )}

                <button
                  type="button"
                  onClick={resetFilters}
                  className="inline-flex items-center gap-1 text-[10px] font-extrabold text-[#a34852] hover:text-[#421521]"
                >
                  <RotateCcw size={12} />
                  Clear all
                </button>
              </div>
            )}
          </div>

          {/* Product grid */}
          <div className="mt-7">
            {categoryProducts.length > 0 ? (
              <>
                <div className="mb-4 flex items-center justify-between gap-3">
                  <p className="text-[11px] text-[#81716e] sm:text-xs">
                    Showing{" "}
                    <span className="font-extrabold text-[#421521]">
                      {categoryProducts.length}
                    </span>{" "}
                    products
                  </p>

                  {sortBy !== "recommended" && (
                    <span className="rounded-full bg-[#f8e8e5] px-3 py-1.5 text-[10px] font-bold text-[#76233a]">
                      Sorted by{" "}
                      {sortBy === "price-low"
                        ? "price: low to high"
                        : sortBy === "price-high"
                          ? "price: high to low"
                          : sortBy === "discount"
                            ? "discount"
                            : "rating"}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 lg:gap-5 xl:grid-cols-5">
                  {categoryProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                    />
                  ))}
                </div>
              </>
            ) : (
              <div className="rounded-[28px] border border-dashed border-[#e7d2cb] bg-white px-5 py-14 text-center sm:py-20">
                <div className="mx-auto grid h-20 w-20 place-items-center rounded-[26px] bg-[#f8e8e5] text-[#76233a]">
                  {searchQuery ? (
                    <Search size={32} />
                  ) : (
                    <ShoppingBag size={32} />
                  )}
                </div>

                <h2 className="mt-5 font-serif text-2xl font-bold text-[#421521] sm:text-3xl">
                  {searchQuery || hasActiveFilters
                    ? "No matching favourites"
                    : "Something lovely is on its way"}
                </h2>

                <p className="mx-auto mt-3 max-w-md text-xs leading-6 text-[#81716e] sm:text-sm">
                  {searchQuery || hasActiveFilters
                    ? "Try another search or adjust your filters to discover more products in this collection."
                    : "We're preparing this collection. Explore our other categories while you wait."}
                </p>

                {hasActiveFilters ? (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#76233a] px-6 py-3 text-xs font-bold text-white transition hover:bg-[#421521] sm:text-sm"
                  >
                    <RotateCcw size={15} />
                    Clear filters
                  </button>
                ) : (
                  <Link
                    to="/categories"
                    className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#76233a] px-6 py-3 text-xs font-bold text-white transition hover:bg-[#421521] sm:text-sm"
                  >
                    Explore categories
                    <ArrowRight size={15} />
                  </Link>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Bottom discovery banner */}
        <section className="mx-auto max-w-[1440px] px-3 pt-10 sm:px-6 sm:pt-14 lg:px-8">
          <div className="flex flex-col justify-between gap-5 rounded-[24px] border border-[#f0ded6] bg-gradient-to-r from-[#fff0e8] to-[#fff8ed] p-5 sm:flex-row sm:items-center sm:rounded-[28px] sm:p-8">
            <div>
              <p className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[2px] text-[#a34852]">
                <Heart size={14} />
                Still exploring?
              </p>

              <h2 className="mt-2 font-serif text-xl font-bold text-[#421521] sm:text-2xl">
                There’s more to discover at Purv.
              </h2>

              <p className="mt-2 text-xs leading-5 text-[#81716e] sm:text-sm">
                Find another collection or get help choosing a thoughtful gift.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/categories"
                className="inline-flex items-center gap-2 rounded-full border border-[#e5c9c1] bg-white px-5 py-3 text-xs font-bold text-[#76233a] transition hover:border-[#76233a]"
              >
                All categories
                <ArrowRight size={14} />
              </Link>

              <Link
                to="/gift-finder"
                className="inline-flex items-center gap-2 rounded-full bg-[#76233a] px-5 py-3 text-xs font-bold text-white transition hover:bg-[#421521]"
              >
                <Sparkles size={14} />
                Gift Finder
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}