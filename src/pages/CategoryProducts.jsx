import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  ChevronRight,
  Search,
  SlidersHorizontal,
  Sparkles,
  X,
} from "lucide-react";

import { supabase } from "../lib/supabase";
import { categories } from "../data/categories";
import ProductCard from "../components/ProductCard";
import Header from "../components/Header";
import Footer from "../components/Footer";

/* =========================================
   CATEGORY CONFIGURATION
========================================= */

const categoryConfig = {
  haircare: {
    subtitle: "Love every strand.",
    description: "Find your perfect haircare routine.",
    editTitle: "The haircare edit",
    badge: "Healthy hair, happy you",
    subcategories: [
      "All Haircare",
      "Shampoo",
      "Conditioner",
      "Hair Serum",
      "Hair Oil",
      "Hair Masks",
      "Hair Styling",
    ],
  },

  skincare: {
    subtitle: "A little care, every day.",
    description: "Discover essentials for your daily skincare ritual.",
    editTitle: "The skincare edit",
    badge: "Glowing skin, always",
    subcategories: [
      "All Skincare",
      "Face Wash",
      "Moisturizers",
      "Serums",
      "Sunscreen",
      "Face Masks",
      "Toners",
    ],
  },

  makeup: {
    subtitle: "Your everyday beauty edit.",
    description: "Your favourite beauty essentials, all in one place.",
    editTitle: "The makeup edit",
    badge: "Beauty in every detail",
    subcategories: [
      "All Makeup",
      "Face Makeup",
      "Lipsticks",
      "Eye Makeup",
      "Foundation & Concealer",
      "Blush & Highlighter",
      "Makeup Brushes",
    ],
  },

  jewellery: {
    subtitle: "Little golden details.",
    description: "Discover beautiful finishing touches for every look.",
    editTitle: "The jewellery edit",
    badge: "Made for your moments",
    subcategories: [
      "All Jewellery",
      "Earrings",
      "Necklaces",
      "Neckpieces",
      "Bangles",
      "Rings",
      "Bracelets",
      "Jewellery Sets",
    ],
  },

  "diwali-decor": {
    subtitle: "Bring home the festive glow.",
    description: "Make every corner feel a little more magical.",
    editTitle: "The Diwali décor edit",
    badge: "Light up your home",
    subcategories: [
      "All Diwali Décor",
      "Diyas",
      "Decorative Lights",
      "Rangoli",
      "Torans",
      "Candles",
      "Home Decoration",
    ],
  },

  "gift-hampers": {
    subtitle: "Thoughtful gifts, beautifully wrapped.",
    description: "Find something special for someone special.",
    editTitle: "The gift hampers edit",
    badge: "Give a little happiness",
    subcategories: [
      "All Gift Hampers",
      "Beauty Hampers",
      "Festive Hampers",
      "Jewellery Gifts",
      "Personalized Gifts",
      "Gifts for Her",
      "Gifts for Him",
    ],
  },

  "pooja-items": {
    subtitle: "Traditions made beautiful.",
    description: "Thoughtful essentials for your sacred rituals.",
    editTitle: "The pooja essentials edit",
    badge: "Celebrate every ritual",
    subcategories: [
      "All Pooja Essentials",
      "Pooja Thalis",
      "Diyas",
      "Incense & Dhoop",
      "Pooja Accessories",
      "Pooja Decoration",
      "Festive Pooja Sets",
    ],
  },

  rakhi: {
    subtitle: "Little threads, endless love.",
    description: "Celebrate the beautiful bond between siblings.",
    editTitle: "The Rakhi edit",
    badge: "Made with love",
    subcategories: [
      "All Rakhi",
      "Traditional Rakhi",
      "Designer Rakhi",
      "Kids Rakhi",
      "Rakhi Sets",
      "Rakhi Hampers",
      "Rakhi Gifts",
    ],
  },

  fragrances: {
    subtitle: "Leave a little magic behind.",
    description: "Discover fragrances for every mood and moment.",
    editTitle: "The fragrance edit",
    badge: "Find your signature scent",
    subcategories: [
      "All Fragrances",
      "Perfumes",
      "Body Mists",
      "Attars",
      "Roll-On Fragrances",
      "Gift Sets",
    ],
  },

  "bath-body": {
    subtitle: "Make everyday feel special.",
    description: "Small self-care rituals, big feel-good moments.",
    editTitle: "The bath & body edit",
    badge: "Your daily dose of care",
    subcategories: [
      "All Bath & Body",
      "Body Wash",
      "Body Lotion",
      "Body Scrubs",
      "Hand & Foot Care",
      "Bath Essentials",
    ],
  },

  "nail-studio": {
    subtitle: "A little colour goes a long way.",
    description: "Find your next favourite nail look.",
    editTitle: "The nail studio edit",
    badge: "Colour your world",
    subcategories: [
      "All Nail Studio",
      "Nail Polish",
      "Nail Art",
      "Nail Care",
      "Nail Extensions",
      "Nail Tools",
    ],
  },

  "ethnic-accessories": {
    subtitle: "Celebrate your own kind of beautiful.",
    description: "Finishing touches for your favourite ethnic looks.",
    editTitle: "The ethnic accessories edit",
    badge: "Tradition meets style",
    subcategories: [
      "All Ethnic Accessories",
      "Bangles",
      "Bindis",
      "Hair Accessories",
      "Dupatta Accessories",
      "Traditional Jewellery",
    ],
  },
};

/* =========================================
   HELPERS
========================================= */

function toSlug(value = "") {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function formatPrice(value) {
  return Number(value || 0);
}

/* =========================================
   CATEGORY SIDEBAR
========================================= */

function CategorySidebar({
  category,
  config,
  selectedSubcategory,
  onSelect,
}) {
  const subcategories = config.subcategories;

  return (
    <aside className="hidden w-[205px] shrink-0 lg:block">
      <div className="sticky top-[150px] rounded-2xl border border-[#f0e3d9] bg-white p-3">
        <Link
          to="/categories"
          className="mb-4 flex items-center gap-2 rounded-lg px-2 py-2 text-xs font-semibold text-[#8b3026] transition hover:bg-[#fff4ee]"
        >
          <ArrowLeft size={14} />
          All Categories
        </Link>

        <div className="mb-3 flex items-center gap-2 px-2">
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-[#f8e8e5] text-[#76233a]">
            <Sparkles size={16} />
          </span>

          <h2 className="text-sm font-bold text-[#421521]">
            {category.name}
          </h2>
        </div>

        <div className="space-y-1">
          {subcategories.map((subcategory, index) => {
            const subcategorySlug =
              index === 0
                ? "all"
                : toSlug(subcategory);

            const isSelected =
              selectedSubcategory === subcategorySlug;

            return (
              <button
                key={subcategory}
                type="button"
                onClick={() => onSelect(subcategorySlug)}
                className={`flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-2.5 text-left text-xs transition duration-200 ${
                  isSelected
                    ? "bg-[#fbe9ec] font-bold text-[#8b3026]"
                    : "text-[#79665d] hover:bg-[#fff6f0] hover:text-[#76233a]"
                }`}
              >
                <span className="min-w-0">{subcategory}</span>

                {isSelected && (
                  <ChevronRight
                    size={14}
                    className="shrink-0"
                  />
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-4 rounded-xl bg-[#fff7ec] p-3">
          <p className="text-xs font-bold text-[#7c3828]">
            A little something special
          </p>

          <p className="mt-1 text-[10px] leading-5 text-[#987c6a]">
            Explore thoughtfully selected finds from Purv.
          </p>
        </div>
      </div>
    </aside>
  );
}

/* =========================================
   CATEGORY HERO BANNER
========================================= */

function CategoryHero({ category, config, image, productCount }) {
  return (
    <section className="purv-content-enter relative isolate mb-6 min-h-[150px] overflow-hidden rounded-[22px] bg-gradient-to-r from-[#421521] via-[#76233a] to-[#b15b5b] sm:min-h-[172px]">
      {/* Decorative background */}
      <div className="pointer-events-none absolute -right-8 -top-16 h-48 w-48 rounded-full border border-white/10 sm:h-64 sm:w-64" />

      <div className="pointer-events-none absolute -right-4 -bottom-24 h-44 w-44 rounded-full bg-white/[0.06] sm:h-60 sm:w-60" />

      {/* Text */}
      <div className="relative z-10 flex min-h-[150px] items-center sm:min-h-[172px]">
        <div className="max-w-[68%] px-5 py-5 sm:max-w-[62%] sm:px-8 sm:py-6">
          <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-[#f7d4b4] sm:text-[10px]">
            The Purv Collection
          </p>

          <h1 className="mt-2 text-2xl font-semibold leading-tight tracking-tight text-white sm:text-3xl lg:text-[38px]">
            {category.name}.
          </h1>

          <p className="mt-1 text-xs text-white/85 sm:text-sm">
            {config.subtitle}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[9px] font-medium text-white/95 sm:text-[10px]">
              {productCount} products in this collection
            </span>

            <span className="hidden items-center gap-1.5 text-[9px] text-white/80 sm:inline-flex sm:text-[10px]">
              <Sparkles size={12} />
              Curated with care
            </span>
          </div>
        </div>

        {/* Category image */}
        {image && (
          <div className="absolute inset-y-0 right-0 w-[35%] overflow-hidden sm:w-[37%]">
            <img
              src={image}
              alt={category.name}
              className="h-full w-full object-cover object-center"
            />

            <div className="absolute inset-0 bg-gradient-to-r from-[#76233a] via-[#76233a]/30 to-transparent" />

            <div className="absolute bottom-3 right-3 hidden max-w-[150px] rounded-xl border border-white/70 bg-white/95 px-3 py-2 shadow-lg sm:block">
              <p className="text-[9px] font-bold text-[#76233a]">
                DISCOVER SOMETHING LOVELY
              </p>

              <p className="mt-0.5 text-[10px] text-stone-600">
                {config.badge}
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

/* =========================================
   CATEGORY PRODUCTS PAGE
========================================= */

export default function CategoryProducts() {
  const { slug } = useParams();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedSubcategory, setSelectedSubcategory] =
    useState("all");

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("recommended");

  const category = categories.find(
    (item) => item.slug === slug,
  );

  const config = categoryConfig[slug] || {
    subtitle: "Discover something beautiful.",
    description: "Explore our thoughtfully selected collection.",
    editTitle: `The ${category?.name || "collection"} edit`,
    badge: "Selected with care",
    subcategories: [
      `All ${category?.name || "Products"}`,
    ],
  };

  /* Reset filters when the main category changes */
  useEffect(() => {
    setSelectedSubcategory("all");
    setSearch("");
    setSortBy("recommended");
  }, [slug]);

  /* Load products from Supabase */
  useEffect(() => {
    let active = true;

    async function loadProducts() {
      setLoading(true);
      setError("");

      try {
        const { data, error: queryError } = await supabase
          .from("products")
          .select("*")
          .eq("category_slug", slug)
          .order("created_at", { ascending: false });

        if (queryError) {
          throw queryError;
        }

        if (active) {
          const formattedProducts = (data || []).map(
            (product) => ({
              ...product,
              categorySlug: product.category_slug,
              originalPrice: product.original_price,
              image: product.image_url,

              // Supports either subcategory column name.
              subcategorySlug:
                product.subcategory_slug ||
                toSlug(product.subcategory || ""),
            }),
          );

          setProducts(formattedProducts);
        }
      } catch (err) {
        if (active) {
          setError(
            err.message || "Unable to load products.",
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    if (slug) {
      loadProducts();
    }

    return () => {
      active = false;
    };
  }, [slug]);

  /* Search, filter and sort */
  const visibleProducts = useMemo(() => {
    let result = [...products];

    if (selectedSubcategory !== "all") {
      result = result.filter((product) => {
        const productSubcategory =
          product.subcategorySlug ||
          toSlug(product.subcategory || "");

        return productSubcategory === selectedSubcategory;
      });
    }

    if (search.trim()) {
      const query = search.toLowerCase().trim();

      result = result.filter((product) =>
        [
          product.name,
          product.description,
          product.category,
          product.subcategory,
        ]
          .filter(Boolean)
          .some((value) =>
            String(value).toLowerCase().includes(query),
          ),
      );
    }

    if (sortBy === "price-low") {
      result.sort(
        (a, b) =>
          formatPrice(a.price) - formatPrice(b.price),
      );
    }

    if (sortBy === "price-high") {
      result.sort(
        (a, b) =>
          formatPrice(b.price) - formatPrice(a.price),
      );
    }

    if (sortBy === "newest") {
      result.sort(
        (a, b) =>
          new Date(b.created_at || 0) -
          new Date(a.created_at || 0),
      );
    }

    return result;
  }, [products, selectedSubcategory, search, sortBy]);

  const categoryImage =
    category?.image ||
    products.find((product) => product.image)?.image ||
    "";

  const selectedLabel =
    config.subcategories.find(
      (item, index) =>
        (index === 0 ? "all" : toSlug(item)) ===
        selectedSubcategory,
    ) || category?.name;

  if (!category) {
    return (
      <>
        <Header />

        <main className="min-h-[60vh] bg-[#fffaf5] px-5 py-16 text-center">
          <h1 className="text-2xl font-bold text-[#421521]">
            Category not found
          </h1>

          <p className="mt-2 text-sm text-stone-500">
            This collection may have moved.
          </p>

          <Link
            to="/categories"
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#76233a] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#421521]"
          >
            Browse all categories
            <ArrowRight size={16} />
          </Link>
        </main>

        <Footer />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#fffaf6]">
      {/* Keeps the shared header visible on category pages */}
      <Header />

      <main className="purv-page-enter mx-auto max-w-[1500px] px-3 pb-10 pt-5 sm:px-5 lg:px-8">
        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="mb-4 flex items-center gap-1.5 overflow-hidden text-[11px] text-stone-500"
        >
          <Link
            to="/"
            className="shrink-0 transition hover:text-[#76233a]"
          >
            Home
          </Link>

          <ChevronRight size={13} className="shrink-0" />

          <Link
            to="/categories"
            className="shrink-0 transition hover:text-[#76233a]"
          >
            Categories
          </Link>

          <ChevronRight size={13} className="shrink-0" />

          <span className="truncate font-semibold text-[#76233a]">
            {category.name}
          </span>
        </nav>

        {/* Main layout */}
        <div className="flex items-start gap-5 xl:gap-7">
          {/* Left sidebar */}
          <CategorySidebar
            category={category}
            config={config}
            selectedSubcategory={selectedSubcategory}
            onSelect={setSelectedSubcategory}
          />

          {/* Main collection */}
          <div className="min-w-0 flex-1">
            {/* Compact banner */}
            <CategoryHero
              category={category}
              config={config}
              image={categoryImage}
              productCount={products.length}
            />

            {/* Mobile subcategory navigation */}
            <section className="mb-6 lg:hidden">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-bold text-[#421521]">
                  Explore {category.name}
                </h2>

                <span className="text-[10px] text-stone-500">
                  {config.subcategories.length} collections
                </span>
              </div>

              <div className="flex gap-2 overflow-x-auto pb-2">
                {config.subcategories.map(
                  (subcategory, index) => {
                    const subcategorySlug =
                      index === 0
                        ? "all"
                        : toSlug(subcategory);

                    const isSelected =
                      selectedSubcategory ===
                      subcategorySlug;

                    return (
                      <button
                        key={subcategory}
                        type="button"
                        onClick={() =>
                          setSelectedSubcategory(
                            subcategorySlug,
                          )
                        }
                        className={`shrink-0 whitespace-nowrap rounded-full border px-4 py-2.5 text-xs font-semibold transition ${
                          isSelected
                            ? "border-[#76233a] bg-[#76233a] text-white"
                            : "border-[#eee1d7] bg-white text-[#705a50] hover:border-[#d8b3a7]"
                        }`}
                      >
                        {subcategory}
                      </button>
                    );
                  },
                )}
              </div>
            </section>

            {/* Collection heading */}
            <section className="mb-4">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#b15b43]">
                    Find your favourites
                  </p>

                  <h2 className="mt-1 text-xl font-bold text-[#421521] sm:text-2xl">
                    {selectedSubcategory === "all"
                      ? config.editTitle
                      : selectedLabel}
                  </h2>

                  <p className="mt-1 text-xs text-stone-500">
                    {loading
                      ? "Finding products for you..."
                      : `${visibleProducts.length} ${
                          visibleProducts.length === 1
                            ? "item"
                            : "items"
                        } ready to explore`}
                  </p>
                </div>

                {selectedSubcategory !== "all" && (
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedSubcategory("all")
                    }
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#8b3026] transition hover:text-[#421521]"
                  >
                    <X size={14} />
                    Clear filter
                  </button>
                )}
              </div>
            </section>

            {/* Search and sorting */}
            <section className="mb-5 flex flex-col gap-3 sm:flex-row">
              <form
                onSubmit={(event) => event.preventDefault()}
                className="flex h-11 min-w-0 flex-1 items-center gap-2 rounded-xl border border-[#eee1d7] bg-white px-3 transition focus-within:border-[#c79a8b] focus-within:shadow-sm"
              >
                <Search
                  size={17}
                  className="shrink-0 text-stone-400"
                />

                <input
                  type="search"
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder={`Search ${category.name.toLowerCase()}...`}
                  aria-label={`Search ${category.name}`}
                  className="h-full w-full min-w-0 border-0 bg-transparent text-xs outline-none placeholder:text-stone-400 focus:ring-0 sm:text-sm"
                />

                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    aria-label="Clear search"
                    className="rounded-full p-1 text-stone-400 hover:bg-stone-100"
                  >
                    <X size={15} />
                  </button>
                )}
              </form>

              <label className="flex h-11 shrink-0 items-center gap-2 rounded-xl border border-[#eee1d7] bg-white px-3 text-xs text-stone-600 sm:min-w-[180px]">
                <SlidersHorizontal
                  size={15}
                  className="text-[#8b3026]"
                />

                <span className="whitespace-nowrap">
                  Sort by
                </span>

                <select
                  value={sortBy}
                  onChange={(event) =>
                    setSortBy(event.target.value)
                  }
                  aria-label="Sort products"
                  className="min-w-0 flex-1 cursor-pointer border-0 bg-transparent text-xs font-semibold text-[#421521] outline-none focus:ring-0"
                >
                  <option value="recommended">
                    Recommended
                  </option>
                  <option value="newest">
                    Newest first
                  </option>
                  <option value="price-low">
                    Price: Low to High
                  </option>
                  <option value="price-high">
                    Price: High to Low
                  </option>
                </select>

                <ChevronDown
                  size={14}
                  className="shrink-0 text-stone-400"
                />
              </label>
            </section>

            {/* Products */}
            {loading ? (
              <div
                className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 xl:grid-cols-4"
                aria-label="Loading products"
              >
                {Array.from({ length: 8 }).map((_, index) => (
                  <div
                    key={index}
                    className="animate-pulse overflow-hidden rounded-2xl border border-[#f0e3d9] bg-white p-3"
                  >
                    <div className="aspect-square rounded-xl bg-[#f4eae3]" />

                    <div className="mt-4 h-3 w-3/4 rounded bg-[#f4eae3]" />

                    <div className="mt-2 h-3 w-1/2 rounded bg-[#f4eae3]" />

                    <div className="mt-4 h-9 rounded-lg bg-[#f4eae3]" />
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="rounded-2xl border border-red-100 bg-white px-5 py-12 text-center">
                <h2 className="text-lg font-bold text-[#421521]">
                  Unable to load products
                </h2>

                <p className="mt-2 break-words text-sm text-red-600">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="mt-5 rounded-full bg-[#76233a] px-5 py-2.5 text-xs font-bold text-white transition hover:bg-[#421521]"
                >
                  Try again
                </button>
              </div>
            ) : visibleProducts.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 xl:grid-cols-4">
                {visibleProducts.map((product) => (
                  <div
                    key={product.id}
                    className="purv-stagger-item min-w-0"
                  >
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-[#f0e3d9] bg-white px-5 py-14 text-center sm:py-16">
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#f8e8e5] text-[#76233a]">
                  <Search size={24} />
                </div>

                <h2 className="mt-4 text-lg font-bold text-[#421521]">
                  {search || selectedSubcategory !== "all"
                    ? "No matching products found"
                    : "Your collection is coming soon"}
                </h2>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-stone-500">
                  {search || selectedSubcategory !== "all"
                    ? "Try another search or explore the full collection."
                    : "Products added to this category will appear here."}
                </p>

                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setSelectedSubcategory("all");
                  }}
                  className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#76233a] px-5 py-3 text-xs font-bold text-white transition hover:bg-[#421521]"
                >
                  View all {category.name}
                  <ArrowRight size={15} />
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}