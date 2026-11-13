import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ShoppingCart,
  Truck,
  ShieldCheck,
  Heart,
  Headset,
  Sparkles,
  PackageCheck,
  ChevronRight,
} from "lucide-react";

import Header from "../components/Header";
import { supabase } from "../lib/supabase";
import { useShop } from "../context/ShopContext";
import ProductCard from "../components/ProductCard";

// Fallback images are used only when a category has no image_url in Supabase.
const categoryFallbackImages = {
  "daily-puja":
    "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=500&q=80",
  "puja-thali-accessories":
    "https://images.unsplash.com/photo-1606293926075-69a00dbfde81?auto=format&fit=crop&w=500&q=80",
  "bhagwan-shringar":
    "https://images.unsplash.com/photo-1604608672516-8c1f7d2d6f8b?auto=format&fit=crop&w=500&q=80",
  "festival-kits":
    "https://images.unsplash.com/photo-1606293926075-69a00dbfde81?auto=format&fit=crop&w=500&q=80",
  "havan-samagri":
    "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=500&q=80",
  "combos-kits":
    "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=500&q=80",
  "dhanteras-essentials":
    "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=500&q=80",
};

function LotusMark({ className = "", size = 24 }) {
  return (
    <svg
      viewBox="0 0 80 62"
      aria-hidden="true"
      className={className}
      width={size}
      height={Math.round(size * 0.775)}
      fill="none"
    >
      <g
        fill="#f2d48d"
        stroke="#8b2938"
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
        stroke="#8b2938"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

const money = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`;

function SectionTitle({ title, subtitle, link = "/categories" }) {
  return (
    <div className="mb-3 flex items-end justify-between gap-3">
      <div>
        <h2 className="font-serif text-xl font-bold text-[#641a2b] sm:text-2xl lg:text-3xl">
          {title}
        </h2>

        {subtitle && (
          <p className="mt-1 text-xs text-stone-500 sm:text-sm">{subtitle}</p>
        )}
      </div>

      <Link
        to={link}
        className="flex shrink-0 items-center gap-1 text-xs font-bold text-[#7c2032] transition hover:text-[#b17a38]"
      >
        View All <ArrowRight size={15} />
      </Link>
    </div>
  );
}

function CategoryCard({ category }) {
  const [imageFailed, setImageFailed] = useState(false);

  const image =
    category.image_url || categoryFallbackImages[category.slug] || "";

  return (
    <Link to={`/category/${category.slug}`} className="group min-w-0">
      <div className="relative aspect-square overflow-hidden rounded-xl border border-[#eee0d0] bg-[#f8ead9] sm:rounded-2xl">
        {image && !imageFailed ? (
          <img
            src={image}
            alt={category.name}
            loading="lazy"
            onError={() => setImageFailed(true)}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-[#fff8e8] to-[#f4dfb6]">
            <LotusMark size={42} />
            <span className="px-2 text-center text-xs font-semibold text-[#6c2932]">
              {category.name}
            </span>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-[#37141a]/35 via-transparent to-transparent" />

        <span className="absolute bottom-2 right-2 grid h-7 w-7 place-items-center rounded-full bg-white/95 text-[#76233a] shadow-sm transition group-hover:translate-x-1 sm:bottom-3 sm:right-3">
          <ArrowRight size={15} />
        </span>
      </div>

      <h3 className="mt-2 text-center text-[11px] font-bold leading-4 text-[#39252a] group-hover:text-[#8b2939] sm:text-sm">
        {category.name}
      </h3>
    </Link>
  );
}

function ProductTile({ product, onAdd }) {
  const [added, setAdded] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);

  const image = product.image_url || product.image || product.imageUrl || "";

  const price = Number(product.price || 0);

  const originalPrice = Number(
    product.original_price ?? product.originalPrice ?? 0,
  );

  const discount =
    originalPrice > price && originalPrice > 0
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : 0;

  function handleAdd() {
    onAdd(product);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1500);
  }

  return (
    <article className="group min-w-0 overflow-hidden rounded-xl border border-[#eee4d9] bg-white p-1.5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg sm:rounded-2xl sm:p-2">
      <Link
        to={`/product/${product.id}`}
        className="relative block aspect-square overflow-hidden rounded-lg bg-[#fbf3e9]"
      >
        {image && !imageFailed ? (
          <img
            src={image}
            alt={product.name}
            loading="lazy"
            onError={() => setImageFailed(true)}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-[#fff8e8] via-[#f8e8c9] to-[#f4dfb6] text-[#8b2938]">
            <LotusMark size={42} />
            <span className="px-2 text-center text-[10px] font-semibold tracking-wide text-[#6c2932]">
              PURV PUJA SAMAGRI
            </span>
          </div>
        )}

        {discount > 0 && (
          <span className="absolute left-1 top-1 rounded bg-[#8b2638] px-1.5 py-1 text-[9px] font-bold text-white sm:left-2 sm:top-2 sm:text-[10px]">
            {discount}% OFF
          </span>
        )}

        <button
          type="button"
          aria-label="Add to wishlist"
          onClick={(event) => event.preventDefault()}
          className="absolute right-1 top-1 grid h-7 w-7 place-items-center rounded-full bg-white/90 text-[#8b2638] shadow-sm sm:right-2 sm:top-2 sm:h-8 sm:w-8"
        >
          <Heart size={15} />
        </button>
      </Link>

      <div className="px-1 pb-1 pt-2">
        <Link to={`/product/${product.id}`}>
          <h3 className="line-clamp-2 min-h-8 text-[11px] font-bold leading-4 text-[#3d292b] hover:text-[#8b2638] sm:text-sm">
            {product.name}
          </h3>
        </Link>

        {product.description && (
          <p className="mt-0.5 line-clamp-1 text-[9px] text-stone-500 sm:text-[11px]">
            {product.description}
          </p>
        )}

        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-extrabold text-[#722033] sm:text-sm">
            {money(price)}
          </span>

          {originalPrice > price && (
            <span className="text-[10px] text-stone-400 line-through">
              {money(originalPrice)}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={handleAdd}
          className={`mt-2 flex min-h-8 w-full items-center justify-center gap-1 rounded-md px-1.5 py-2 text-[10px] font-bold text-white transition sm:min-h-9 sm:text-xs ${
            added ? "bg-green-700" : "bg-[#791d30] hover:bg-[#531421]"
          }`}
        >
          <ShoppingCart size={13} />
          {added ? "Added!" : "Add to Cart"}
        </button>
      </div>
    </article>
  );
}

export default function Home() {
  const { addToCart } = useShop();

  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoryError, setCategoryError] = useState("");

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productError, setProductError] = useState("");

  const [offerSettings, setOfferSettings] = useState({
    title: "Exciting Offers",
    subtitle: "Discover amazing deals on your favourite products.",
    mode: "automatic",
    is_enabled: true,
    product_ids: [],
    view_all_link: "/categories",
  });
  const [offersLoading, setOffersLoading] = useState(true);
  const [offersError, setOffersError] = useState("");

  // Load categories directly from Supabase in admin-defined order.
  useEffect(() => {
    let active = true;

    async function loadCategories() {
      try {
        setCategoryError("");

        const { data, error } = await supabase
          .from("store_categories")
          .select("*")
          .is("parent_id", null)
          .eq("is_active", true)
          .order("sort_order", { ascending: true });

        if (error) throw error;

        if (active) {
          setCategories(data || []);
        }
      } catch (error) {
        console.error("Error loading homepage categories:", error);

        if (active) {
          setCategoryError("Unable to load categories. Please refresh.");
        }
      } finally {
        if (active) {
          setCategoriesLoading(false);
        }
      }
    }

    loadCategories();

    // Refresh category order when the admin changes it in another tab.
    const channel = supabase
      .channel("homepage-store-categories")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "store_categories",
        },
        () => {
          loadCategories();
        },
      )
      .subscribe();

    // Refresh when the customer returns to the homepage tab.
    const handleFocus = () => {
      loadCategories();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        loadCategories();
      }
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      active = false;
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      supabase.removeChannel(channel);
    };
  }, []);

  // Load products.
  useEffect(() => {
    let active = true;

    async function loadProducts() {
      setLoading(true);
      setProductError("");

      try {
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;

        if (active) {
          setProducts(data || []);
        }
      } catch (error) {
        console.error("Error loading homepage products:", error);

        if (active) {
          setProductError("We couldn't load products right now.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadProducts();

    return () => {
      active = false;
    };
  }, []);

  // Load the homepage offers configuration managed from the admin dashboard.
  useEffect(() => {
    let active = true;

    async function loadOfferSettings() {
      try {
        const { data, error } = await supabase
          .from("homepage_offer_settings")
          .select(
            "title, subtitle, mode, is_enabled, product_ids, view_all_link",
          )
          .eq("id", 1)
          .maybeSingle();

        if (error) throw error;

        if (active && data) {
          setOfferSettings({
            title: data.title || "Exciting Offers",
            subtitle: data.subtitle || "",
            mode: data.mode === "manual" ? "manual" : "automatic",
            is_enabled: data.is_enabled !== false,
            product_ids: Array.isArray(data.product_ids)
              ? data.product_ids
              : [],
            view_all_link: data.view_all_link || "/categories",
          });
        }
      } catch (error) {
        console.error("Error loading homepage offer settings:", error);
        if (active)
          setOffersError("Offers are using the default homepage settings.");
      } finally {
        if (active) setOffersLoading(false);
      }
    }

    loadOfferSettings();

    const channel = supabase
      .channel("homepage-offer-settings")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "homepage_offer_settings" },
        loadOfferSettings,
      )
      .subscribe();

    const handleFocus = () => loadOfferSettings();
    window.addEventListener("focus", handleFocus);

    return () => {
      active = false;
      window.removeEventListener("focus", handleFocus);
      supabase.removeChannel(channel);
    };
  }, []);

  const excitingOfferProducts = (() => {
    if (offerSettings.mode === "manual") {
      const productsById = new Map(
        products.map((product) => [String(product.id), product]),
      );
      return (offerSettings.product_ids || [])
        .map((id) => productsById.get(String(id)))
        .filter(Boolean)
        .slice(0, 6);
    }

    return products
      .filter((product) => {
        const price = Number(product.price || 0);
        const original = Number(
          product.original_price ?? product.originalPrice ?? 0,
        );
        return original > price && original > 0;
      })
      .sort((a, b) => {
        const discountA =
          (Number(a.original_price ?? a.originalPrice ?? 0) -
            Number(a.price || 0)) /
          Math.max(Number(a.original_price ?? a.originalPrice ?? 0), 1);
        const discountB =
          (Number(b.original_price ?? b.originalPrice ?? 0) -
            Number(b.price || 0)) /
          Math.max(Number(b.original_price ?? b.originalPrice ?? 0), 1);
        return discountB - discountA;
      })
      .slice(0, 6);
  })();

  const dailyProducts = products
    .filter((product) =>
      ["daily-puja", "daily-puja-essentials", "pooja-items", "pooja"].includes(
        String(product.category_slug || product.categorySlug || "")
          .toLowerCase()
          .trim(),
      ),
    )
    .slice(0, 6);

  const comboProducts = products
    .filter((product) => {
      const slug = String(
        product.category_slug || product.categorySlug || "",
      ).toLowerCase();

      const category = String(product.category || "").toLowerCase();

      return (
        slug.includes("combo") ||
        slug.includes("kit") ||
        category.includes("combo") ||
        category.includes("kit")
      );
    })
    .slice(0, 5);

  const featuredProducts =
    dailyProducts.length > 0 ? dailyProducts : products.slice(0, 6);

  const festivalProducts =
    comboProducts.length > 0 ? comboProducts : products.slice(0, 5);

  return (
    <div className="min-h-screen overflow-x-clip bg-[#fffaf3] text-[#332326]">
      <Header />

      <main className="pt-0">
        {/* HERO BANNER */}
        <section className="w-full">
          <div className="purv-home-hero relative isolate min-h-[190px] overflow-hidden bg-[#f9e8bd] sm:min-h-[225px] lg:min-h-[260px]">
            <img
              src="https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=1800&q=85"
              alt="Traditional puja essentials"
              fetchPriority="high"
              className="absolute inset-0 h-full w-full object-cover"
            />

            <div className="absolute inset-0 bg-gradient-to-r from-[#fff6df]/95 via-[#ffe9b9]/75 to-[#e8b84f]/15" />

            <div className="relative flex min-h-[190px] items-center px-5 py-5 sm:min-h-[255px] sm:px-10 lg:min-h-[260px] lg:px-16">
              <div className="max-w-xl">
                <p className="font-serif text-xs italic tracking-wider text-[#8c5634] sm:text-sm">
                  || Om Shree Ganeshaya Namah ||
                </p>

                <div className="my-2 flex items-center gap-2 text-[#b07a28]">
                  <span className="h-px w-8 bg-[#d5a94f]" />
                  <LotusMark size={23} className="shrink-0" />
                  <span className="h-px w-8 bg-[#d5a94f]" />
                </div>

                <h1 className="font-serif text-4xl font-bold leading-[1.08] tracking-tight text-[#671b2c] sm:text-5xl lg:text-7xl">
                  PURV
                  <span className="mt-1 block text-2xl tracking-[0.17em] sm:text-3xl">
                    PUJA SAMAGRI
                  </span>
                </h1>

                <h2 className="mt-4 font-serif text-lg font-semibold text-[#4b3028] sm:text-2xl">
                  Everything You Need for Your Puja
                </h2>

                <p className="mt-2 text-xs font-medium tracking-wide text-[#765342] sm:text-sm">
                  Pure <span className="mx-2">•</span>
                  Traditional <span className="mx-2">•</span>
                  Trusted
                </p>

                <Link
                  to="/categories"
                  className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#721d30] px-6 py-3 text-xs font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-[#4f1421] sm:text-sm"
                >
                  Shop Now <ArrowRight size={16} />
                </Link>
              </div>
            </div>

            <div className="absolute bottom-4 right-4 hidden max-w-[160px] text-right font-serif text-lg italic leading-7 text-[#6e3c32] lg:block">
              Small Items...
              <br />
              Big Blessings...
              <LotusMark className="ml-auto mt-2" size={28} />
            </div>
          </div>
        </section>

        {/* CATEGORY GRID - DYNAMIC FROM SUPABASE */}
        <section className="mx-auto max-w-[1500px] px-4 py-3 sm:px-6 sm:py-4">
          <div className="mb-3 flex items-center justify-center gap-3">
            <span className="h-px flex-1 bg-[#d8b96f]" />
            <LotusMark size={21} className="shrink-0" />

            <h2 className="font-serif text-xl font-bold text-[#701d30] sm:text-2xl">
              Shop by Category
            </h2>

            <LotusMark size={21} className="shrink-0" />
            <span className="h-px flex-1 bg-[#d8b96f]" />
          </div>

          {categoriesLoading ? (
            <div className="grid grid-cols-3 gap-2.5 sm:gap-4 lg:grid-cols-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index}>
                  <div className="aspect-square animate-pulse rounded-xl bg-[#f0e5d8] sm:rounded-2xl" />
                  <div className="mx-auto mt-2 h-4 w-3/4 animate-pulse rounded bg-[#f0e5d8]" />
                </div>
              ))}
            </div>
          ) : categories.length > 0 ? (
            <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6">
              {categories.map((category) => (
                <CategoryCard key={category.id} category={category} />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-[#dfc7ac] bg-white p-6 text-center">
              <LotusMark size={34} className="mx-auto" />
              <p className="mt-2 text-sm font-semibold text-[#701d30]">
                No categories available right now.
              </p>
              {categoryError && (
                <p className="mt-1 text-xs text-red-600">{categoryError}</p>
              )}
            </div>
          )}
        </section>

        {/* EXCITING OFFERS - ADMIN CONFIGURABLE */}
        {offerSettings.is_enabled && (
          <section className="mx-auto max-w-[1500px] px-4 pb-5 sm:px-6 sm:pb-6">
            <SectionTitle
              title={offerSettings.title || "Exciting Offers"}
              subtitle={offerSettings.subtitle}
              link={offerSettings.view_all_link || "/categories"}
            />

            {loading || offersLoading ? (
             <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={index}
                    className="aspect-[4/5] animate-pulse rounded-xl bg-[#f0e5d8]"
                  />
                ))}
              </div>
            ) : excitingOfferProducts.length > 0 ? (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-8">
                {excitingOfferProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={{
                      ...product,
                      image:
                        product.image ||
                        product.image_url ||
                        product.imageUrl ||
                        "",
                      originalPrice:
                        product.originalPrice ?? product.original_price,
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-[#dfc7ac] bg-white p-8 text-center">
                <LotusMark size={34} className="mx-auto" />
                <h3 className="mt-3 font-serif text-lg font-bold text-[#701d30]">
                  {offerSettings.mode === "manual"
                    ? "Offers are being curated"
                    : "Exciting offers coming soon"}
                </h3>
                <p className="mt-1 text-sm text-stone-500">
                  {offerSettings.mode === "manual"
                    ? "The admin will select products for this collection."
                    : "Add discounted products with an original price to show them here."}
                </p>
                {(productError || offersError) && (
                  <p className="mt-2 text-xs text-red-600">
                    {productError || offersError}
                  </p>
                )}
              </div>
            )}
          </section>
        )}

        {/* SHOPPING BENEFITS */}
        <section className="border-y border-[#e6cc91] bg-gradient-to-r from-[#fff4dc] via-[#f8ead9] to-[#fff0ce]">
          <div className="mx-auto grid max-w-[1500px] grid-cols-2 gap-5 px-4 py-6 sm:grid-cols-4 sm:px-6">
            <div className="flex items-center justify-center gap-3">
              <Truck size={25} className="shrink-0 text-[#701d30]" />
              <div>
                <p className="text-xs font-bold text-[#4a2a2b]">
                  Fast & Safe Delivery
                </p>
                <p className="mt-1 text-[10px] text-stone-500">Across India</p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3">
              <ShieldCheck size={25} className="shrink-0 text-[#701d30]" />
              <div>
                <p className="text-xs font-bold text-[#4a2a2b]">
                  Secure Payments
                </p>
                <p className="mt-1 text-[10px] text-stone-500">Safe checkout</p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3">
              <LotusMark size={25} className="shrink-0" />
              <div>
                <p className="text-xs font-bold text-[#4a2a2b]">
                  Pure & Authentic
                </p>
                <p className="mt-1 text-[10px] text-stone-500">Puja Samagri</p>
              </div>
            </div>

            <Link
              to="/contact"
              className="flex items-center justify-center gap-3"
            >
              <Headset size={25} className="shrink-0 text-[#701d30]" />
              <div>
                <p className="text-xs font-bold text-[#4a2a2b]">
                  Customer Support
                </p>
                <p className="mt-1 text-[10px] text-stone-500">
                  We're here to help
                </p>
              </div>
            </Link>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="bg-[#531522] text-white">
        <div className="mx-auto grid max-w-[1500px] gap-8 px-5 py-9 sm:grid-cols-3 sm:px-8 sm:py-12">
          <div>
            <Link to="/" className="flex items-center gap-3">
              <LotusMark size={42} className="shrink-0" />
              <div>
                <p className="font-serif text-3xl font-bold tracking-wide">
                  PURV
                </p>
                <p className="text-[9px] tracking-[3px] text-[#e4bd7c]">
                  PUJA SAMAGRI
                </p>
              </div>
            </Link>

            <p className="mt-4 max-w-xs text-xs leading-6 text-white/70">
              Bringing devotion home with thoughtfully selected puja essentials
              for every prayer, festival and sacred occasion.
            </p>
          </div>

          <div>
            <h3 className="mb-4 font-serif text-lg font-bold text-[#e4bd7c]">
              Quick Links
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs text-white/75">
              <Link to="/" className="hover:text-white">
                Home
              </Link>
              <Link to="/categories" className="hover:text-white">
                All Categories
              </Link>
              <Link to="/wishlist" className="hover:text-white">
                Wishlist
              </Link>
              <Link to="/cart" className="hover:text-white">
                My Cart
              </Link>
              <Link to="/orders" className="hover:text-white">
                My Orders
              </Link>
              <Link to="/contact" className="hover:text-white">
                Contact Us
              </Link>
            </div>
          </div>

          <div>
            <h3 className="mb-4 font-serif text-lg font-bold text-[#e4bd7c]">
              Shop with Confidence
            </h3>

            <div className="space-y-3 text-xs text-white/75">
              <p className="flex items-center gap-2">
                <PackageCheck size={16} /> Carefully packed orders
              </p>
              <p className="flex items-center gap-2">
                <ShieldCheck size={16} /> Secure shopping experience
              </p>
              <p className="flex items-center gap-2">
                <Sparkles size={16} /> Tradition in every detail
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-white/15 px-4 py-4 text-center text-[10px] text-white/55">
          © {new Date().getFullYear()} Purv Puja Samagri. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
