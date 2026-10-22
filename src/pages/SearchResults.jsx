
import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Search,
  SlidersHorizontal,
  X,
  ArrowLeft,
  ArrowUpDown,
  Sparkles,
  PackageSearch,
} from "lucide-react";

import Header from "../components/Header";
import ProductCard from "../components/ProductCard";
import { products } from "../data/products";
import { categories } from "../data/categories";

export default function SearchResults() {
  const [searchParams, setSearchParams] = useSearchParams();

  const query = searchParams.get("q") || "";

  const [searchInput, setSearchInput] = useState(query);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("relevance");
  const [maxPrice, setMaxPrice] = useState(5000);
  const [showFilters, setShowFilters] = useState(false);

  const searchTerm = query.trim().toLowerCase();

  const maxAvailablePrice = Math.max(
    5000,
    ...products.map((product) => Number(product.price) || 0)
  );

  const matchingProducts = useMemo(() => {
    return products.filter((product) => {
      const searchableText = [
        product.name,
        product.category,
        product.categorySlug,
        product.description,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !searchTerm || searchableText.includes(searchTerm);

      const matchesCategory =
        selectedCategory === "all" ||
        product.categorySlug === selectedCategory;

      const matchesPrice =
        Number(product.price) <= maxPrice;

      return matchesSearch && matchesCategory && matchesPrice;
    });
  }, [searchTerm, selectedCategory, maxPrice]);

  const filteredProducts = useMemo(() => {
    const result = [...matchingProducts];

    switch (sortBy) {
      case "price-low":
        result.sort((a, b) => a.price - b.price);
        break;

      case "price-high":
        result.sort((a, b) => b.price - a.price);
        break;

      case "rating":
        result.sort((a, b) => b.rating - a.rating);
        break;

      case "discount":
        result.sort((a, b) => {
          const discountA =
            a.originalPrice > a.price
              ? ((a.originalPrice - a.price) / a.originalPrice) * 100
              : 0;

          const discountB =
            b.originalPrice > b.price
              ? ((b.originalPrice - b.price) / b.originalPrice) * 100
              : 0;

          return discountB - discountA;
        });
        break;

      default:
        break;
    }

    return result;
  }, [matchingProducts, sortBy]);

  function handleSearch(event) {
    event.preventDefault();

    const trimmedSearch = searchInput.trim();

    if (trimmedSearch) {
      setSearchParams({ q: trimmedSearch });
    } else {
      setSearchParams({});
    }
  }

  function clearFilters() {
    setSelectedCategory("all");
    setSortBy("relevance");
    setMaxPrice(maxAvailablePrice);
  }

  const filtersActive =
    selectedCategory !== "all" ||
    maxPrice < maxAvailablePrice;

  return (
    <>
      <Header />

      <main className="min-h-screen bg-[#fffaf4] px-4 pb-16 pt-36 sm:px-6 sm:pt-40 lg:px-10">
        <div className="mx-auto max-w-[1440px]">
          {/* Breadcrumb */}
          <div className="mb-6 flex items-center gap-2 text-sm text-gray-500">
            <Link
              to="/"
              className="transition hover:text-[#8b3026]"
            >
              Home
            </Link>
            <span>/</span>
            <span className="font-medium text-[#54251f]">
              Search
            </span>
          </div>

          {/* Search heading */}
          <section className="relative overflow-hidden rounded-[28px] border border-[#f0dfca] bg-gradient-to-r from-[#fff0cf] via-[#fff8e9] to-[#fbe4d7] p-6 sm:p-9">
            <div className="relative z-10 max-w-3xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-[#9b4827]">
                <Sparkles size={14} />
                Find your festive favourites
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-[#54251f] sm:text-4xl lg:text-5xl">
                Search Purv
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-6 text-[#765c50] sm:text-base">
                Discover beauty essentials, festive decorations,
                jewellery, gifts, and little things that make
                every celebration special.
              </p>

              <form
                onSubmit={handleSearch}
                className="mt-6 flex max-w-2xl items-center gap-2 rounded-2xl border border-[#ead8c5] bg-white p-2 shadow-sm focus-within:border-[#b45324] focus-within:ring-4 focus-within:ring-[#b45324]/10"
              >
                <Search
                  size={21}
                  className="ml-2 shrink-0 text-[#b45324]"
                />

                <input
                  type="search"
                  value={searchInput}
                  onChange={(event) =>
                    setSearchInput(event.target.value)
                  }
                  placeholder="Search lipstick, skincare, gifts..."
                  className="min-w-0 flex-1 bg-transparent px-2 py-3 text-sm text-[#54251f] outline-none placeholder:text-gray-400 sm:text-base"
                  aria-label="Search products"
                />

                {searchInput && (
                  <button
                    type="button"
                    onClick={() => setSearchInput("")}
                    className="rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                    aria-label="Clear search text"
                  >
                    <X size={17} />
                  </button>
                )}

                <button
                  type="submit"
                  className="shrink-0 rounded-xl bg-[#8b3026] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#70251f] sm:px-6"
                >
                  Search
                </button>
              </form>
            </div>

            <div className="pointer-events-none absolute -right-10 -top-12 hidden h-56 w-56 rounded-full border-[28px] border-white/30 lg:block" />
            <div className="pointer-events-none absolute -bottom-20 right-36 hidden h-44 w-44 rounded-full bg-[#e8a15b]/20 lg:block" />
          </section>

          {/* Results toolbar */}
          <section className="mt-8">
            <div className="flex flex-col justify-between gap-4 border-b border-[#eadfd2] pb-5 sm:flex-row sm:items-end">
              <div>
                <h2 className="text-2xl font-bold text-[#54251f]">
                  {searchTerm
                    ? `Results for "${query}"`
                    : "Explore all products"}
                </h2>

                <p className="mt-2 text-sm text-gray-500">
                  {filteredProducts.length}{" "}
                  {filteredProducts.length === 1
                    ? "product"
                    : "products"}{" "}
                  found
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowFilters(!showFilters)}
                  className={`inline-flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                    showFilters || filtersActive
                      ? "border-[#8b3026] bg-[#fff0e5] text-[#8b3026]"
                      : "border-[#eadfd2] bg-white text-[#54251f] hover:border-[#c99c7b]"
                  }`}
                >
                  <SlidersHorizontal size={17} />
                  Filters
                  {filtersActive && (
                    <span className="h-2 w-2 rounded-full bg-[#b45324]" />
                  )}
                </button>

                <label className="flex items-center gap-2 rounded-xl border border-[#eadfd2] bg-white px-3 py-3 text-sm text-[#54251f]">
                  <ArrowUpDown size={16} className="text-[#b45324]" />

                  <span className="hidden sm:inline">Sort:</span>

                  <select
                    value={sortBy}
                    onChange={(event) => setSortBy(event.target.value)}
                    className="max-w-[155px] bg-transparent font-semibold outline-none"
                    aria-label="Sort products"
                  >
                    <option value="relevance">Relevance</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Top Rated</option>
                    <option value="discount">Biggest Discount</option>
                  </select>
                </label>
              </div>
            </div>

            {/* Filters */}
            {showFilters && (
              <div className="mt-5 rounded-2xl border border-[#eadfd2] bg-white p-5 sm:p-6">
                <div className="mb-5 flex items-center justify-between gap-3">
                  <h3 className="font-bold text-[#54251f]">
                    Refine your search
                  </h3>

                  <button
                    type="button"
                    onClick={clearFilters}
                    className="text-sm font-semibold text-[#a4472b] underline underline-offset-4 hover:text-[#70251f]"
                  >
                    Clear filters
                  </button>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  {/* Category filter */}
                  <div>
                    <h4 className="mb-3 text-sm font-semibold text-[#54251f]">
                      Category
                    </h4>

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedCategory("all")}
                        className={`rounded-full border px-4 py-2 text-sm transition ${
                          selectedCategory === "all"
                            ? "border-[#8b3026] bg-[#8b3026] text-white"
                            : "border-[#eadfd2] bg-[#fffaf4] text-[#6e5147] hover:border-[#b45324]"
                        }`}
                      >
                        All categories
                      </button>

                      {categories.map((category) => (
                        <button
                          type="button"
                          key={category.id || category.slug}
                          onClick={() =>
                            setSelectedCategory(category.slug)
                          }
                          className={`rounded-full border px-4 py-2 text-sm transition ${
                            selectedCategory === category.slug
                              ? "border-[#8b3026] bg-[#8b3026] text-white"
                              : "border-[#eadfd2] bg-[#fffaf4] text-[#6e5147] hover:border-[#b45324]"
                          }`}
                        >
                          {category.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Price filter */}
                  <div>
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <h4 className="text-sm font-semibold text-[#54251f]">
                        Maximum price
                      </h4>

                      <span className="rounded-lg bg-[#fff0e5] px-3 py-1.5 text-sm font-bold text-[#8b3026]">
                        ₹{maxPrice.toLocaleString("en-IN")}
                      </span>
                    </div>

                    <input
                      type="range"
                      min="0"
                      max={maxAvailablePrice}
                      step="50"
                      value={Math.min(maxPrice, maxAvailablePrice)}
                      onChange={(event) =>
                        setMaxPrice(Number(event.target.value))
                      }
                      className="w-full cursor-pointer accent-[#8b3026]"
                      aria-label="Maximum product price"
                    />

                    <div className="mt-2 flex justify-between text-xs text-gray-500">
                      <span>₹0</span>
                      <span>
                        ₹{maxAvailablePrice.toLocaleString("en-IN")}+
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Active filter chips */}
            {(selectedCategory !== "all" ||
              maxPrice < maxAvailablePrice) && (
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="mr-1 text-xs font-medium text-gray-500">
                  Active filters:
                </span>

                {selectedCategory !== "all" && (
                  <button
                    type="button"
                    onClick={() => setSelectedCategory("all")}
                    className="inline-flex items-center gap-1.5 rounded-full bg-[#f5e5d8] px-3 py-1.5 text-xs font-semibold text-[#7b3427]"
                  >
                    {categories.find(
                      (category) => category.slug === selectedCategory
                    )?.name || selectedCategory}
                    <X size={13} />
                  </button>
                )}

                {maxPrice < maxAvailablePrice && (
                  <button
                    type="button"
                    onClick={() => setMaxPrice(maxAvailablePrice)}
                    className="inline-flex items-center gap-1.5 rounded-full bg-[#f5e5d8] px-3 py-1.5 text-xs font-semibold text-[#7b3427]"
                  >
                    Up to ₹{maxPrice.toLocaleString("en-IN")}
                    <X size={13} />
                  </button>
                )}
              </div>
            )}

            {/* Product grid */}
            {filteredProducts.length > 0 ? (
              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 xl:grid-cols-5">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                  />
                ))}
              </div>
            ) : (
              <div className="mt-8 rounded-3xl border border-dashed border-[#dfc8b5] bg-white px-5 py-14 text-center sm:px-10">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#fff0e5] text-[#a4472b]">
                  <PackageSearch size={30} />
                </div>

                <h3 className="mt-5 text-xl font-bold text-[#54251f]">
                  No products found
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                  We couldn't find products matching your search
                  and filters. Try a different keyword or clear
                  your filters to explore more of Purv.
                </p>

                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setSearchInput("");
                      setSearchParams({});
                      clearFilters();
                    }}
                    className="rounded-xl bg-[#8b3026] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#70251f]"
                  >
                    Clear search and filters
                  </button>

                  <Link
                    to="/categories"
                    className="rounded-xl border border-[#eadfd2] bg-[#fffaf4] px-5 py-3 text-sm font-semibold text-[#54251f] transition hover:border-[#b45324]"
                  >
                    Browse categories
                  </Link>
                </div>
              </div>
            )}
          </section>

          {/* Bottom navigation */}
          <div className="mt-12 border-t border-[#eadfd2] pt-6">
            <Link
              to="/categories"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#8b3026] transition hover:text-[#b45324]"
            >
              <ArrowLeft size={16} />
              Explore all categories
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
