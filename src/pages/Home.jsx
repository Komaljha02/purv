import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Truck,
  ShieldCheck,
  Headset,
  Sparkles,
  PackageCheck,
  Plus,
  Minus,
} from "lucide-react";

import Header from "../components/Header";
import HeroSlideshow from "../components/HeroSlideshow";
import { supabase } from "../lib/supabase";
import ProductCard from "../components/ProductCard";
import { useShop } from "../context/ShopContext";

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
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3 border-b border-[#ead9bd] pb-3">
      <div>
        <div className="mb-1 flex items-center gap-2">
          <Sparkles size={15} className="text-[#c18b42]" />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#a47743]">
            Handpicked for you
          </span>
        </div>

        <h2 className="font-serif text-2xl font-bold tracking-tight text-[#701d30] sm:text-3xl">
          {title}
        </h2>

        {subtitle && (
          <p className="mt-1 text-xs text-stone-500 sm:text-sm">{subtitle}</p>
        )}
      </div>

      <Link
        to={link}
        className="mb-1 inline-flex items-center gap-2 rounded-full border border-[#e7c995] bg-white px-4 py-2 text-xs font-bold text-[#791d30] shadow-sm transition hover:-translate-y-0.5 hover:bg-[#fff3df] hover:shadow-md sm:text-sm"
      >
        View All
        <ArrowRight size={15} />
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
      <div className="relative aspect-[5/4] overflow-hidden rounded-xl border border-[#eee0d0] bg-[#f8ead9] sm:rounded-2xl">
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

      <h3 className="mt-2 text-center text-[11px] font-bold leading-4 text-[#39252a] transition group-hover:text-[#8b2939] sm:text-sm lg:text-base lg:leading-5">
        {category.name}
      </h3>
    </Link>
  );
}

function DiscountCircle({ product }) {
  const [imageFailed, setImageFailed] = useState(false);

  const { cart, addToCart, changeQuantity, removeFromCart } = useShop();

  const price = Number(product.price || 0);
  const originalPrice = Number(
    product.original_price ?? product.originalPrice ?? 0,
  );

  const discount =
    originalPrice > price && originalPrice > 0
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : 0;

  const image = product.image_url || product.image || product.imageUrl || "";

  const cartItem = cart.find((item) => String(item.id) === String(product.id));

  const quantity = Number(cartItem?.quantity || 0);

  const stock =
    product.stock == null || product.stock === ""
      ? null
      : Number(product.stock);

  const isOutOfStock = stock !== null && Number.isFinite(stock) && stock <= 0;

  function increaseQuantity() {
    if (isOutOfStock) return;

    if (quantity === 0) {
      addToCart(product);
    } else {
      changeQuantity(product.id, 1);
    }
  }

  function decreaseQuantity() {
    if (quantity <= 0) return;

    if (quantity === 1) {
      removeFromCart(product.id);
    } else {
      changeQuantity(product.id, -1);
    }
  }

  return (
    <div className="group w-[105px] shrink-0 text-center sm:w-[130px]">
      {/* Circular Image with Floating Cart Control */}
      <div className="relative mx-auto h-[85px] w-[85px] sm:h-[100px] sm:w-[100px]">
        {/* Product Circle */}
        <div className="relative h-full w-full overflow-hidden rounded-full border-[3px] border-[#e5c783] bg-gradient-to-br from-[#fff7e7] to-[#f1dfbd] shadow-md transition duration-300 group-hover:-translate-y-1 group-hover:shadow-xl">
          <Link to={`/product/${product.id}`} className="block h-full w-full">
            {image && !imageFailed ? (
              <img
                src={image}
                alt={product.name}
                loading="lazy"
                onError={() => setImageFailed(true)}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <LotusMark size={40} />
              </div>
            )}
          </Link>

          {/* Discount Ribbon */}
          {discount > 0 && (
            <span className="absolute bottom-0 left-0 right-0 z-[1] bg-[#791d30] py-1 text-[10px] font-extrabold tracking-wide text-white sm:text-xs">
              {discount}% OFF
            </span>
          )}

          {/* Out of Stock Overlay */}
          {isOutOfStock && (
            <div className="absolute inset-0 z-[2] flex items-center justify-center bg-white/65">
              <span className="rounded-full bg-stone-800 px-2 py-1 text-[8px] font-bold text-white">
                Sold Out
              </span>
            </div>
          )}
        </div>

        {/* Floating Plus / Quantity Button - OUTSIDE CIRCLE */}
        <div className="absolute -right-1 -top-1 z-10">
          {quantity === 0 ? (
            <button
              type="button"
              onClick={increaseQuantity}
              disabled={isOutOfStock}
              aria-label={`Add ${product.name} to cart`}
              className="grid h-9 w-9 place-items-center rounded-xl border-2 border-[#76233a] bg-white text-[#76233a] shadow-lg transition hover:scale-110 hover:bg-[#76233a] hover:text-white active:scale-95 disabled:opacity-40 sm:h-10 sm:w-10"
            >
              <Plus size={22} strokeWidth={2.8} />
            </button>
          ) : (
            <div className="flex h-8 items-center overflow-hidden rounded-lg border-2 border-[#76233a] bg-white text-[#76233a] shadow-lg sm:h-9">
              <button
                type="button"
                onClick={decreaseQuantity}
                aria-label={`Remove one ${product.name}`}
                className="grid h-7 w-6 place-items-center sm:h-8 sm:w-7"
              >
                <Minus size={13} strokeWidth={2.5} />
              </button>

              <span className="min-w-4 text-center text-[11px] font-extrabold">
                {quantity}
              </span>

              <button
                type="button"
                onClick={increaseQuantity}
                aria-label={`Add one ${product.name}`}
                disabled={stock !== null && quantity >= stock}
                className="grid h-7 w-6 place-items-center disabled:opacity-40 sm:h-8 sm:w-7"
              >
                <Plus size={13} strokeWidth={2.5} />
              </button>
            </div>
          )}
        </div>

        {/* Added Indicator */}
        {quantity > 0 && (
          <span className="absolute bottom-1 left-1 z-[3] flex items-center gap-0.5 rounded-full bg-white/95 px-1.5 py-0.5 text-[8px] font-bold text-green-700 shadow-sm">
            ✓ Added
          </span>
        )}
      </div>

      {/* Product Name */}
      <Link to={`/product/${product.id}`}>
        <h3 className="mt-2 line-clamp-2 min-h-8 text-[11px] font-bold leading-4 text-[#492b2d] transition group-hover:text-[#8b2938] sm:text-sm">
          {product.name}
        </h3>
      </Link>

      {/* Price */}
      <div className="mt-1 flex flex-wrap items-center justify-center gap-1.5">
        <span className="text-xs font-extrabold text-[#791d30] sm:text-sm">
          {money(price)}
        </span>

        {originalPrice > price && (
          <span className="text-[10px] text-stone-400 line-through">
            {money(originalPrice)}
          </span>
        )}
      </div>
    </div>
  );
}
export default function Home() {
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoryError, setCategoryError] = useState("");

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productError, setProductError] = useState("");

  // Existing Exciting Offers settings.
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

  // Extra Discount Offers settings
  const [discountSettings, setDiscountSettings] = useState({
    title: "Extra Exciting Offers",
    subtitle: "Special prices on handpicked puja essentials.",
    is_enabled: true,
    product_ids: [],
  });

  const [discountSettingsLoading, setDiscountSettingsLoading] = useState(true);

  // Load categories from Supabase.
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

    const channel = supabase
      .channel("homepage-store-categories")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "store_categories",
        },
        loadCategories,
      )
      .subscribe();

    const handleFocus = () => loadCategories();

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

  // Load all products.
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

  // Load existing Exciting Offers configuration.
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

        if (active) {
          setOffersError("Offers are using the default homepage settings.");
        }
      } finally {
        if (active) {
          setOffersLoading(false);
        }
      }
    }

    loadOfferSettings();

    const channel = supabase
      .channel("homepage-offer-settings")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "homepage_offer_settings",
        },
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

  // Load new Extra Discount Offers configuration.
  useEffect(() => {
    let active = true;

    async function loadDiscountSettings() {
      try {
        const { data, error } = await supabase
          .from("homepage_discount_settings")
          .select("title, subtitle, is_enabled, product_ids")
          .eq("id", 1)
          .maybeSingle();

        if (error) throw error;

        if (active && data) {
          setDiscountSettings({
            title: data.title || "Extra Discount Offers",
            subtitle: data.subtitle || "",
            is_enabled: data.is_enabled !== false,
            product_ids: Array.isArray(data.product_ids)
              ? data.product_ids
              : [],
          });
        }
      } catch (error) {
        console.error("Error loading extra discount offers:", error);
      } finally {
        if (active) {
          setDiscountSettingsLoading(false);
        }
      }
    }

    loadDiscountSettings();

    const channel = supabase
      .channel("homepage-discount-settings")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "homepage_discount_settings",
        },
        loadDiscountSettings,
      )
      .subscribe();

    const handleFocus = () => loadDiscountSettings();
    window.addEventListener("focus", handleFocus);

    return () => {
      active = false;
      window.removeEventListener("focus", handleFocus);
      supabase.removeChannel(channel);
    };
  }, []);

  // Existing Exciting Offers products.
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
        const originalA = Number(a.original_price ?? a.originalPrice ?? 0);
        const originalB = Number(b.original_price ?? b.originalPrice ?? 0);

        const discountA =
          (originalA - Number(a.price || 0)) / Math.max(originalA, 1);

        const discountB =
          (originalB - Number(b.price || 0)) / Math.max(originalB, 1);

        return discountB - discountA;
      })
      .slice(0, 6);
  })();

  // New Extra Discount Offers products.
  // Only products selected by the admin and genuinely discounted appear here.
  const extraDiscountProducts = (() => {
    const productsById = new Map(
      products.map((product) => [String(product.id), product]),
    );

    return discountSettings.product_ids
      .map((id) => productsById.get(String(id)))
      .filter((product) => {
        if (!product) return false;

        const price = Number(product.price || 0);
        const originalPrice = Number(
          product.original_price ?? product.originalPrice ?? 0,
        );

        return originalPrice > price && originalPrice > 0;
      });
  })();

  return (
    <div className="min-h-screen overflow-x-clip bg-[#fffaf3] text-[#332326]">
      <Header />

      <main className="pt-0">
        {/* DYNAMIC HERO BANNERS FROM ADMIN PANEL */}
        <HeroSlideshow />

        {/* EXTRA DISCOUNT OFFERS - ADMIN SELECTED */}
        {discountSettings.is_enabled && (
          <section className="mx-auto max-w-[1500px] px-4 py-2 sm:px-6 sm:py-3">
            <div className="mb-2 flex items-center justify-center gap-3">
              <span className="h-px flex-1 bg-[#d8b96f]" />

              <LotusMark size={21} className="shrink-0" />

              <div className="text-center">
                <h2 className="whitespace-nowrap font-serif text-xl font-bold text-[#701d30] sm:text-2xl lg:text-3xl">
                  {discountSettings.title}
                </h2>

                <p className="mt-1 text-[10px] text-stone-500 sm:text-xs">
                  {discountSettings.subtitle}
                </p>
              </div>

              <LotusMark size={21} className="shrink-0" />

              <span className="h-px flex-1 bg-[#d8b96f]" />
            </div>

            {loading || discountSettingsLoading ? (
              <div className="flex justify-center gap-5 overflow-hidden py-2">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="shrink-0 text-center">
                    <div className="h-[100px] w-[100px] animate-pulse rounded-full bg-[#f0e5d8] sm:h-[125px] sm:w-[125px]" />
                    <div className="mx-auto mt-2 h-3 w-16 animate-pulse rounded bg-[#f0e5d8]" />
                  </div>
                ))}
              </div>
            ) : extraDiscountProducts.length > 0 ? (
              <div className="flex gap-4 overflow-x-auto px-1 pb-1 sm:justify-center sm:gap-6">
                {extraDiscountProducts.map((product) => (
                  <DiscountCircle key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="py-4 text-center">
                <p className="font-serif text-base font-semibold text-[#701d30]">
                  Special discounts are coming soon!
                </p>
                <p className="mt-1 text-xs text-stone-500">
                  Check back for handpicked offers on puja essentials.
                </p>
              </div>
            )}
          </section>
        )}

        {/* CATEGORY GRID - DYNAMIC FROM SUPABASE */}
        <section className="mx-auto w-full max-w-[1750px] px-3 py-2 sm:px-5 sm:py-3 lg:px-8">
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
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-6 lg:gap-5">
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

        {/* EXISTING EXCITING OFFERS - KEPT SEPARATE */}
        {offerSettings.is_enabled && (
          <section className="mx-auto w-full max-w-[1750px] px-3 pb-6 pt-4 sm:px-5 sm:pb-8 lg:px-8">
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
              <LotusMark size={25} />
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
                <PackageCheck size={16} />
                Carefully packed orders
              </p>
              <p className="flex items-center gap-2">
                <ShieldCheck size={16} />
                Secure shopping experience
              </p>
              <p className="flex items-center gap-2">
                <Sparkles size={16} />
                Tradition in every detail
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
