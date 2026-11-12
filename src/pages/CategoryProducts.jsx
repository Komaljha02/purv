import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowRight,
  ChevronRight,
  Search,
  SlidersHorizontal,
  X,
  Sparkles,
  Flame,
  Flower2,
  Droplets,
  Leaf,
  Bell,
  Package,
  Gift,
  Crown,
  Shirt,
  Music,
  Gem,
  CircleDot,
  Lamp,
  CookingPot,
  Wheat,
  HandHeart,
  Moon,
} from "lucide-react";

import { supabase } from "../lib/supabase";
import ProductCard from "../components/ProductCard";
import Header from "../components/Header";
import Footer from "../components/Footer";

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
   SUBCATEGORY ICONS
========================================= */

function getSubcategoryIcon(name = "") {
  const value = name.toLowerCase();

  if (value.includes("thali")) return CookingPot;
  if (value.includes("diya") || value.includes("batti")) return Flame;
  if (value.includes("roli") || value.includes("kumkum")) return CircleDot;
  if (value.includes("chandan")) return Flower2;
  if (value.includes("akshat") || value.includes("chawal")) return Wheat;
  if (value.includes("kapoor") || value.includes("camphor")) return Flame;
  if (value.includes("agarbatti") || value.includes("dhoop")) return Flame;
  if (value.includes("ghanti") || value.includes("bell")) return Bell;
  if (value.includes("kalash") || value.includes("lota")) return Droplets;
  if (value.includes("gangajal")) return Droplets;
  if (value.includes("mauli") || value.includes("kalawa")) return HandHeart;
  if (value.includes("sindoor")) return CircleDot;
  if (value.includes("tulsi") || value.includes("mala")) return Leaf;
  if (value.includes("katori")) return CookingPot;
  if (value.includes("phool") || value.includes("garland")) return Flower2;
  if (value.includes("poshak") || value.includes("dress")) return Shirt;
  if (value.includes("mukut") || value.includes("crown")) return Crown;
  if (value.includes("jewellery") || value.includes("ornament")) return Gem;
  if (value.includes("flute")) return Music;
  if (value.includes("singhasan") || value.includes("aasan")) return Crown;
  if (value.includes("diwali")) return Lamp;
  if (value.includes("ganesh")) return Flower2;
  if (value.includes("navratri")) return Sparkles;
  if (value.includes("janmashtami")) return Music;
  if (value.includes("shivratri")) return Flame;
  if (value.includes("karwa")) return Moon;
  if (value.includes("satyanarayan")) return Sparkles;
  if (value.includes("havan kund")) return CookingPot;
  if (value.includes("wood")) return Leaf;
  if (value.includes("ghee") || value.includes("offering")) return Droplets;
  if (value.includes("kit") || value.includes("combo")) return Package;
  if (value.includes("gift")) return Gift;

  return Flower2;
}

/* =========================================
   SUBCATEGORY NAVIGATION
========================================= */

function CategoryNavigation({
  category,
  subcategories,
  selectedSubcategory,
  onSelect,
}) {
  const items = [
    {
      id: "all",
      name: `All ${category.name}`,
      slug: "all",
    },
    ...subcategories.map((item) => ({
      id: item.id,
      name: item.name,
      slug: item.slug,
    })),
  ];

  return (
    <>
      {/* Mobile vertical subcategory sidebar */}
      <div className="w-[76px] shrink-0 sm:w-[88px] lg:hidden">
        <div className="sticky top-24 flex max-h-[calc(100vh-120px)] flex-col gap-2 overflow-y-auto bg-[#fffaf5] pb-3">
          {items.map((item) => {
            const Icon =
              item.slug === "all" ? Sparkles : getSubcategoryIcon(item.name);

            const selected = selectedSubcategory === item.slug;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelect(item.slug)}
                aria-pressed={selected}
                className={`flex min-h-[82px] w-full flex-col items-center justify-center gap-2 rounded-r-xl px-1.5 py-2 text-center transition ${
                  selected
                    ? "border-l-4 border-[#76233a] bg-[#f5e0e9] text-[#76233a]"
                    : "border-l-4 border-transparent bg-transparent text-[#806f70] hover:bg-[#fff0e7]"
                }`}
              >
                <span
                  className={`grid h-10 w-10 place-items-center rounded-xl ${
                    selected ? "bg-white" : "bg-[#f5eee7]"
                  }`}
                >
                  <Icon size={22} />
                </span>

                <span className="w-full text-[9px] font-semibold leading-3">
                  {item.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden w-[210px] shrink-0 lg:block xl:w-[230px]">
        <div className="sticky top-28 overflow-hidden rounded-2xl border border-[#eadcc7] bg-white shadow-sm">
          <div className="border-b border-[#eadcc7] bg-gradient-to-r from-[#fff4df] to-[#fffaf1] p-4">
            <Link
              to="/categories"
              className="mb-3 flex items-center gap-1.5 text-xs font-semibold text-[#956c35] transition hover:text-[#76233a]"
            >
              <ChevronRight size={13} className="rotate-180" />
              All Categories
            </Link>

            <div className="flex items-center gap-2">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#76233a] text-[#f4d58e]">
                <Sparkles size={15} />
              </span>

              <h2 className="text-sm font-bold text-[#421521]">
                {category.name}
              </h2>
            </div>
          </div>

          <div className="max-h-[calc(100vh-250px)] space-y-1 overflow-y-auto p-2.5">
            {items.map((item) => {
              const selected = selectedSubcategory === item.slug;
              const Icon =
                item.slug === "all" ? Sparkles : getSubcategoryIcon(item.name);

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelect(item.slug)}
                  aria-pressed={selected}
                  className={`group flex w-full items-center gap-2.5 rounded-xl px-3 py-3 text-left transition-all duration-200 ${
                    selected
                      ? "border border-[#e7c77e] bg-[#fff3d8] font-bold text-[#76233a]"
                      : "border border-transparent text-[#79665d] hover:border-[#f0e2ca] hover:bg-[#fffaf2] hover:text-[#76233a]"
                  }`}
                >
                  <Icon
                    size={15}
                    className="shrink-0 text-[#a77a32] group-hover:text-[#76233a]"
                  />

                  <span className="min-w-0 flex-1 text-xs leading-snug">
                    {item.name}
                  </span>

                  {selected && (
                    <ChevronRight
                      size={14}
                      className="shrink-0 text-[#a77a32]"
                    />
                  )}
                </button>
              );
            })}
          </div>

          <div className="border-t border-[#f0e3d3] bg-[#fffaf1] p-3.5">
            <p className="text-xs font-bold text-[#76233a]">
              Made with devotion
            </p>
            <p className="mt-1 text-[10px] leading-4 text-[#987c6a]">
              Thoughtfully selected puja essentials from Purv.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}

/* =========================================
   LOADING SKELETON
========================================= */

function ProductSkeleton() {
  return (
    <div
      className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 xl:grid-cols-4"
      aria-label="Loading products"
    >
      {Array.from({ length: 8 }).map((_, index) => (
        <div
          key={index}
          className="animate-pulse overflow-hidden rounded-xl border border-[#f0e3d9] bg-white p-2.5 sm:p-3"
        >
          <div className="aspect-square rounded-lg bg-[#f4eae3]" />
          <div className="mt-3 h-3 w-3/4 rounded bg-[#f4eae3]" />
          <div className="mt-2 h-3 w-1/2 rounded bg-[#f4eae3]" />
          <div className="mt-3 h-8 rounded-lg bg-[#f4eae3]" />
        </div>
      ))}
    </div>
  );
}

/* =========================================
   CATEGORY PRODUCTS PAGE
========================================= */

export default function CategoryProducts() {
  const { slug } = useParams();

  const [category, setCategory] = useState(null);
  const [subcategories, setSubcategories] = useState([]);
  const [categoryLoading, setCategoryLoading] = useState(true);
  const [categoryError, setCategoryError] = useState("");

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedSubcategory, setSelectedSubcategory] = useState("all");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("recommended");

  /* =========================================
     LOAD CATEGORY AND SUBCATEGORIES
  ========================================= */

  const loadCategory = useCallback(async () => {
    if (!slug) {
      setCategory(null);
      setSubcategories([]);
      setCategoryLoading(false);
      return;
    }

    setCategoryLoading(true);
    setCategoryError("");

    try {
      const { data: categoryData, error: categoryQueryError } = await supabase
        .from("store_categories")
        .select("*")
        .eq("slug", slug)
        .is("parent_id", null)
        .eq("is_active", true)
        .maybeSingle();

      if (categoryQueryError) throw categoryQueryError;

      if (!categoryData) {
        setCategory(null);
        setSubcategories([]);
        return;
      }

      const { data: subcategoryData, error: subcategoryQueryError } =
        await supabase
          .from("store_categories")
          .select("*")
          .eq("parent_id", categoryData.id)
          .eq("is_active", true)
          .order("sort_order", { ascending: true });

      if (subcategoryQueryError) throw subcategoryQueryError;

      setCategory(categoryData);
      setSubcategories(subcategoryData || []);
    } catch (err) {
      console.error("Category loading error:", err);
      setCategory(null);
      setSubcategories([]);
      setCategoryError(err.message || "Unable to load this category.");
    } finally {
      setCategoryLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    let active = true;

    const run = async () => {
      if (!active) return;
      await loadCategory();
    };

    run();

    const channel = supabase
      .channel(`customer-category-${slug || "none"}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "store_categories",
        },
        run,
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [slug, loadCategory]);

  /* =========================================
     RESET FILTERS WHEN CATEGORY CHANGES
  ========================================= */

  useEffect(() => {
    setSelectedSubcategory("all");
    setSearch("");
    setSortBy("recommended");
  }, [slug]);

  /* =========================================
     LOAD PRODUCTS
     Includes parent + subcategory products
  ========================================= */

  const loadProducts = useCallback(async () => {
    if (!slug || categoryLoading) return;

    if (!category) {
      setProducts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const categorySlugs = [slug, ...subcategories.map((item) => item.slug)];

      const uniqueSlugs = [...new Set(categorySlugs.filter(Boolean))];

      const { data, error: queryError } = await supabase
        .from("products")
        .select("*")
        .in("category_slug", uniqueSlugs)
        .order("created_at", { ascending: false });

      if (queryError) throw queryError;

      const formattedProducts = (data || []).map((product) => {
        const productCategorySlug = product.category_slug || "";

        /*
          Supports both product structures:
          1. Parent category + subcategory_slug
          2. category_slug directly set to subcategory slug
        */

        const derivedSubcategorySlug =
          product.subcategory_slug ||
          (productCategorySlug !== slug ? productCategorySlug : "") ||
          toSlug(product.subcategory || "");

        return {
          ...product,
          categorySlug: product.category_slug,
          subcategorySlug: derivedSubcategorySlug,
          originalPrice: product.original_price,
          image: product.image_url,
        };
      });

      setProducts(formattedProducts);
    } catch (err) {
      console.error("Product loading error:", err);
      setError(err.message || "Unable to load products.");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [slug, category, categoryLoading, subcategories]);

  useEffect(() => {
    let active = true;

    const run = async () => {
      if (active) await loadProducts();
    };

    run();

    const channel = supabase
      .channel(`customer-products-${slug || "none"}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "products",
        },
        run,
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [slug, loadProducts]);

  /* =========================================
     SEARCH, FILTER AND SORT
  ========================================= */

  const visibleProducts = useMemo(() => {
    let result = [...products];

    if (selectedSubcategory !== "all") {
      result = result.filter((product) => {
        return product.subcategorySlug === selectedSubcategory;
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
          .some((value) => String(value).toLowerCase().includes(query)),
      );
    }

    if (sortBy === "price-low") {
      result.sort((a, b) => formatPrice(a.price) - formatPrice(b.price));
    }

    if (sortBy === "price-high") {
      result.sort((a, b) => formatPrice(b.price) - formatPrice(a.price));
    }

    if (sortBy === "newest") {
      result.sort(
        (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0),
      );
    }

    return result;
  }, [products, selectedSubcategory, search, sortBy]);

  const selectedLabel =
    subcategories.find((item) => item.slug === selectedSubcategory)?.name ||
    category?.name;

  /* =========================================
     CATEGORY LOADING
  ========================================= */

  if (categoryLoading) {
    return (
      <div className="min-h-screen bg-[#fffaf3]">
        <Header />

        <main className="mx-auto max-w-[1500px] px-4 py-10 sm:px-6">
          <div className="animate-pulse">
            <div className="h-4 w-32 rounded bg-[#f0e3d9]" />
            <div className="mt-5 h-36 rounded-2xl bg-[#f0e3d9]" />
            <div className="mt-6 h-10 rounded-xl bg-[#f0e3d9]" />
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <div
                  key={index}
                  className="aspect-[3/4] rounded-xl bg-[#f0e3d9]"
                />
              ))}
            </div>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  /* =========================================
     CATEGORY NOT FOUND
  ========================================= */

  if (!category) {
    return (
      <div className="min-h-screen bg-[#fffaf5]">
        <Header />

        <main className="flex min-h-[60vh] items-center justify-center px-5 py-16 text-center">
          <div className="max-w-md">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-[#fff1d7] text-[#a77a32]">
              <Flower2 size={30} />
            </div>

            <h1 className="mt-5 text-2xl font-bold text-[#421521]">
              {categoryError ? "Unable to load category" : "Category not found"}
            </h1>

            <p className="mt-2 text-sm leading-6 text-stone-500">
              {categoryError || "This collection may have moved."}
            </p>

            <div className="mt-5 flex flex-wrap justify-center gap-3">
              {categoryError && (
                <button
                  type="button"
                  onClick={loadCategory}
                  className="rounded-full border border-[#eadcc7] bg-white px-5 py-3 text-sm font-bold text-[#76233a] transition hover:bg-[#fff4e5]"
                >
                  Try again
                </button>
              )}

              <Link
                to="/categories"
                className="inline-flex items-center gap-2 rounded-full bg-[#76233a] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#421521]"
              >
                Browse all categories
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  /* =========================================
     MAIN PAGE
  ========================================= */

  return (
    <div className="min-h-screen bg-[#fffaf3]">
      <Header />

      <main className="mx-auto w-full max-w-[1500px] overflow-hidden px-2 pb-12 pt-4 sm:px-5 sm:pt-5 lg:px-7">
        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="mb-4 flex items-center gap-2 overflow-hidden text-[10px] text-stone-500 sm:text-xs"
        >
          <Link to="/" className="shrink-0 transition hover:text-[#76233a]">
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
        {/* Main layout - sidebar left, products right */}
        <div className="flex w-full min-w-0 flex-row items-start gap-2 sm:gap-4 lg:gap-6">
          <CategoryNavigation
            category={category}
            subcategories={subcategories}
            selectedSubcategory={selectedSubcategory}
            onSelect={setSelectedSubcategory}
          />

          <section className="min-w-0 flex-1">
            {/* Selected category heading */}
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#a77a32] sm:text-[10px]">
                  Explore the collection
                </p>

                <h2 className="mt-1 text-lg font-bold text-[#421521] sm:text-xl">
                  {selectedSubcategory === "all"
                    ? `All ${category.name}`
                    : selectedLabel}
                </h2>

                <p className="mt-1 text-[10px] text-stone-500 sm:text-xs">
                  {loading
                    ? "Finding products for you..."
                    : `${visibleProducts.length} ${
                        visibleProducts.length === 1 ? "item" : "items"
                      } available`}
                </p>
              </div>

              {selectedSubcategory !== "all" && (
                <button
                  type="button"
                  onClick={() => setSelectedSubcategory("all")}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#eadcc7] bg-white px-3 py-2 text-[10px] font-semibold text-[#76233a] transition hover:bg-[#fff4e5] sm:text-xs"
                >
                  <X size={13} />
                  Clear filter
                </button>
              )}
            </div>

            {/* Search and sorting */}
            <div className="mb-5 flex flex-col gap-2 sm:flex-row">
              <form
                onSubmit={(event) => event.preventDefault()}
                className="flex h-11 min-w-0 flex-1 items-center gap-2 rounded-xl border border-[#eadcc7] bg-white px-3 transition focus-within:border-[#c79a55] focus-within:shadow-sm"
              >
                <Search size={16} className="shrink-0 text-[#a77a32]" />

                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder={`Search ${category.name.toLowerCase()}...`}
                  aria-label={`Search ${category.name}`}
                  className="h-full w-full min-w-0 border-0 bg-transparent text-xs outline-none placeholder:text-stone-400 focus:ring-0 sm:text-sm"
                />

                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    aria-label="Clear search"
                    className="rounded-full p-1 text-stone-400 transition hover:bg-stone-100"
                  >
                    <X size={14} />
                  </button>
                )}
              </form>

              <label className="flex h-11 shrink-0 items-center gap-2 rounded-xl border border-[#eadcc7] bg-white px-3 text-xs text-stone-600 sm:min-w-[190px]">
                <SlidersHorizontal
                  size={15}
                  className="shrink-0 text-[#a77a32]"
                />

                <span className="whitespace-nowrap">Sort by</span>

                <select
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value)}
                  aria-label="Sort products"
                  className="min-w-0 flex-1 cursor-pointer border-0 bg-transparent text-xs font-semibold text-[#421521] outline-none focus:ring-0"
                >
                  <option value="recommended">Recommended</option>
                  <option value="newest">Newest first</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
              </label>
            </div>

            {/* Products */}
            {loading ? (
              <ProductSkeleton />
            ) : error ? (
              <div className="rounded-2xl border border-red-100 bg-white px-4 py-12 text-center">
                <h2 className="text-lg font-bold text-[#421521]">
                  Unable to load products
                </h2>

                <p className="mt-2 break-words text-xs text-red-600 sm:text-sm">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={loadProducts}
                  className="mt-5 rounded-full bg-[#76233a] px-5 py-2.5 text-xs font-bold text-white transition hover:bg-[#421521]"
                >
                  Try again
                </button>
              </div>
            ) : visibleProducts.length > 0 ? (
              <div className="grid grid-cols-1 gap-2 min-[420px]:grid-cols-2 sm:gap-3 xl:grid-cols-3 2xl:grid-cols-4">
                {visibleProducts.map((product) => (
                  <div
                    key={product.id}
                    className="min-w-0 animate-[fadeInUp_0.4s_ease_both]"
                  >
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-[#eadcc7] bg-white px-4 py-14 text-center sm:py-16">
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#fff1d7] text-[#a77a32]">
                  <Search size={23} />
                </div>

                <h2 className="mt-4 text-base font-bold text-[#421521] sm:text-lg">
                  {search || selectedSubcategory !== "all"
                    ? "No matching products found"
                    : "Your collection is coming soon"}
                </h2>

                <p className="mx-auto mt-2 max-w-md text-xs leading-6 text-stone-500 sm:text-sm">
                  {search || selectedSubcategory !== "all"
                    ? "Try another search or explore the full collection."
                    : "Products added to this category will automatically appear here."}
                </p>

                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setSelectedSubcategory("all");
                    setSortBy("recommended");
                  }}
                  className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#76233a] px-5 py-2.5 text-xs font-bold text-white transition hover:bg-[#421521]"
                >
                  View all {category.name}
                  <ArrowRight size={14} />
                </button>
              </div>
            )}
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
