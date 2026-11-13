
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Heart,
  ShoppingBag,
  Star,
  Minus,
  Plus,
  CheckCircle2,
  ShieldCheck,
  PackageCheck,
  Sparkles,
  Truck,
  Clock3,
  BadgeCheck,
  Gift,
  ChevronRight,
} from "lucide-react";

import Header from "../components/Header";
import ProductCard from "../components/ProductCard";
import { supabase } from "../lib/supabase";
import { useShop } from "../context/ShopContext";

function formatPrice(value) {
  return `₹${Number(value || 0).toLocaleString("en-IN")}`;
}

function normalizeProduct(item) {
  if (!item) return null;

  return {
    ...item,
    image: item.image || item.image_url || item.imageUrl || "",
    originalPrice:
      item.originalPrice ?? item.original_price ?? item.price ?? 0,
    categorySlug:
      item.categorySlug || item.category_slug || "",
    category: item.category || "Puja Essentials",
  };
}

export default function ProductDetails() {
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [addedMessage, setAddedMessage] = useState(false);

  const {
    addToCart,
    wishlist,
    toggleWishlist,
    cart,
    changeQuantity,
  } = useShop();

  useEffect(() => {
    let active = true;

    async function loadProduct() {
      setLoading(true);
      setFetchError("");
      setProduct(null);
      setRelatedProducts([]);

      try {
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("id", id)
          .maybeSingle();

        if (error) throw error;

        if (!data) {
          if (active) {
            setProduct(null);
            setFetchError("This product could not be found.");
          }
          return;
        }

        const currentProduct = normalizeProduct(data);

        if (active) {
          setProduct(currentProduct);
        }

        // Load related products from the same category.
        if (currentProduct.categorySlug) {
          const { data: related, error: relatedError } = await supabase
            .from("products")
            .select("*")
            .eq("category_slug", currentProduct.categorySlug)
            .neq("id", id)
            .limit(4);

          if (relatedError) throw relatedError;

          if (active) {
            setRelatedProducts((related || []).map(normalizeProduct));
          }
        }
      } catch (error) {
        console.error("Error loading product details:", error);

        if (active) {
          setFetchError("Unable to load this product. Please try again.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadProduct();

    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return (
      <>
        <Header />
        <main className="min-h-screen px-4 pb-12 pt-5 sm:px-6 sm:pt-6">
          <div className="mx-auto grid max-w-[1200px] gap-6 lg:grid-cols-2">
            <div className="aspect-square animate-pulse rounded-2xl bg-[#f0e5d8]" />
            <div className="space-y-4">
              <div className="h-6 w-2/3 animate-pulse rounded bg-[#f0e5d8]" />
              <div className="h-10 w-full animate-pulse rounded bg-[#f0e5d8]" />
              <div className="h-24 w-full animate-pulse rounded bg-[#f0e5d8]" />
              <div className="h-12 w-1/2 animate-pulse rounded bg-[#f0e5d8]" />
            </div>
          </div>
        </main>
      </>
    );
  }

  if (!product) {
    return (
      <>
        <Header />
        <main className="min-h-screen px-4 pb-12 pt-5 sm:px-6 sm:pt-6 lg:px-8">
          <div className="mx-auto max-w-lg rounded-2xl border border-[#f0e3d9] bg-white p-8 text-center shadow-sm">
            <ShoppingBag size={35} className="mx-auto text-[#76233a]" />
            <h1 className="mt-4 text-2xl font-bold text-[#421521]">
              Product not found
            </h1>
            <p className="mt-2 text-sm text-[#82736f]">
              {fetchError || "This product may have been removed."}
            </p>
            <Link
              to="/categories"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#76233a] px-6 py-3 text-sm font-bold text-white"
            >
              <ArrowLeft size={16} />
              Browse categories
            </Link>
          </div>
        </main>
      </>
    );
  }

  const isWishlisted = wishlist.some(
    (item) => String(item) === String(product.id)
  );

  const cartItem = cart.find(
    (item) => String(item.id) === String(product.id)
  );

  const quantityInCart = cartItem?.quantity || 0;

  const stock = Math.max(0, Number(product.stock) || 0);
  const isOutOfStock = stock === 0;

  const price = Number(product.price) || 0;
  const originalPrice = Number(product.originalPrice) || price;

  const discount =
    originalPrice > price
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : 0;

  const savings = Math.max(0, originalPrice - price);

  function handleAddToCart() {
    if (isOutOfStock) return;

    addToCart(product);
    setAddedMessage(true);

    window.setTimeout(() => {
      setAddedMessage(false);
    }, 2000);
  }

  return (
    <>
      <Header />

      {/* Reduced top padding to remove extra blank space */}
     <main className="min-h-screen px-4 pb-12 pt-4 sm:px-6 sm:pt-5 lg:px-8">
        <div className="mx-auto max-w-[1250px]">

          {/* Breadcrumb */}
          <nav className="mb-5 flex flex-wrap items-center gap-2 text-xs text-[#82736f] sm:text-sm">
            <Link to="/" className="hover:text-[#76233a]">
              Home
            </Link>
            <ChevronRight size={14} />
            <Link to="/categories" className="hover:text-[#76233a]">
              Categories
            </Link>
            <ChevronRight size={14} />
            <Link
              to={
                product.categorySlug
                  ? `/category/${product.categorySlug}`
                  : "/categories"
              }
              className="hover:text-[#76233a]"
            >
              {product.category}
            </Link>
            <ChevronRight size={14} />
            <span className="max-w-[180px] truncate font-semibold text-[#421521]">
              {product.name}
            </span>
          </nav>

          {/* Product layout */}
          <section className="grid items-start gap-6 lg:grid-cols-[1fr_0.95fr] lg:gap-9">

            {/* Product image */}
            <div className="lg:sticky lg:top-24">
              <div className="relative overflow-hidden rounded-2xl border border-[#f0e3d9] bg-white">
                {discount > 0 && (
                  <span className="absolute left-3 top-3 z-10 rounded-full bg-[#76233a] px-3 py-1.5 text-xs font-bold text-white">
                    {discount}% OFF
                  </span>
                )}

                <button
                  type="button"
                  onClick={() => toggleWishlist(product.id)}
                  aria-label="Toggle wishlist"
                  className={`absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm ${
                    isWishlisted ? "text-rose-600" : "text-[#421521]"
                  }`}
                >
                  <Heart
                    size={19}
                    className={isWishlisted ? "fill-current" : ""}
                  />
                </button>

                <div className="flex min-h-[300px] items-center justify-center bg-[#fbf8f4] p-5 sm:min-h-[440px]">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="max-h-[420px] w-full object-contain"
                    />
                  ) : (
                    <div className="text-center text-sm text-stone-400">
                      Product image unavailable
                    </div>
                  )}

                  {isOutOfStock && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/75">
                      <span className="rounded-full bg-[#421521] px-5 py-3 text-sm font-bold text-white">
                        Currently unavailable
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Trust points */}
              <div className="mt-3 grid grid-cols-3 gap-2">
                <div className="rounded-xl border border-[#f0e3d9] bg-white p-3 text-center">
                  <PackageCheck size={20} className="mx-auto text-[#a34b3d]" />
                  <p className="mt-1.5 text-[10px] font-bold text-[#54251f] sm:text-xs">
                    Careful packing
                  </p>
                </div>

                <div className="rounded-xl border border-[#f0e3d9] bg-white p-3 text-center">
                  <BadgeCheck size={20} className="mx-auto text-[#a34b3d]" />
                  <p className="mt-1.5 text-[10px] font-bold text-[#54251f] sm:text-xs">
                    Quality focused
                  </p>
                </div>

                <div className="rounded-xl border border-[#f0e3d9] bg-white p-3 text-center">
                  <Truck size={20} className="mx-auto text-[#a34b3d]" />
                  <p className="mt-1.5 text-[10px] font-bold text-[#54251f] sm:text-xs">
                    Easy ordering
                  </p>
                </div>
              </div>
            </div>

            {/* Product information */}
            <div>
              <Link
                to={
                  product.categorySlug
                    ? `/category/${product.categorySlug}`
                    : "/categories"
                }
                className="inline-flex items-center gap-2 rounded-full bg-[#fff0e5] px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-[#9b4827]"
              >
                <Sparkles size={14} />
                {product.category}
              </Link>

              <h1 className="mt-3 text-2xl font-extrabold leading-tight text-[#421521] sm:text-3xl lg:text-4xl">
                {product.name}
              </h1>

              <p className="mt-3 text-sm leading-6 text-[#82736f]">
                {product.description ||
                  `Discover ${product.name}, a lovely pick from Purv.`}
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                {product.rating ? (
                  <span className="inline-flex items-center gap-1 rounded-lg bg-[#edf6e9] px-3 py-2 text-sm font-bold text-[#376b32]">
                    <Star size={15} className="fill-current" />
                    {product.rating}
                  </span>
                ) : (
                  <span className="rounded-lg bg-[#fff0d7] px-3 py-2 text-xs font-bold text-[#94501d]">
                    New arrival
                  </span>
                )}

                <span className={`text-xs font-bold ${
                  isOutOfStock ? "text-red-600" : "text-green-700"
                }`}>
                  {isOutOfStock ? "Out of stock" : "Available to order"}
                </span>
              </div>

              {/* Price */}
              <div className="mt-5 rounded-2xl border border-[#f0e3d9] bg-white p-4 sm:p-5">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-3xl font-extrabold text-[#421521] sm:text-4xl">
                    {formatPrice(price)}
                  </span>

                  {discount > 0 && (
                    <>
                      <span className="text-sm text-stone-400 line-through">
                        {formatPrice(originalPrice)}
                      </span>
                      <span className="rounded-lg bg-[#edf6e9] px-2 py-1 text-xs font-bold text-green-700">
                        Save {discount}%
                      </span>
                    </>
                  )}
                </div>

                {discount > 0 && (
                  <p className="mt-2 flex items-center gap-2 text-xs font-semibold text-green-700">
                    <CheckCircle2 size={15} />
                    You save {formatPrice(savings)}
                  </p>
                )}

                <div className="mt-4 flex items-center gap-3 border-t border-dashed border-[#e8d9ce] pt-4">
                  <Clock3 size={20} className="shrink-0 text-[#a34b3d]" />
                  <div>
                    <p className="text-sm font-bold text-[#421521]">
                      Ready for your next celebration
                    </p>
                    <p className="mt-1 text-xs text-[#82736f]">
                      Add this product to your cart and review your order before checkout.
                    </p>
                  </div>
                </div>
              </div>

              {/* About */}
              <div className="mt-5">
                <h2 className="text-lg font-bold text-[#421521]">
                  About this product
                </h2>
                <p className="mt-2 text-sm leading-6 text-[#71615b]">
                  {product.description ||
                    `Discover ${product.name} from Purv and explore more products in this collection.`}
                </p>
              </div>

              {/* Cart actions */}
              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                {quantityInCart > 0 ? (
                  <div className="flex min-h-[50px] items-center justify-between rounded-xl border border-[#e8d9ce] bg-white px-3 sm:w-[190px]">
                    <button
                      type="button"
                      onClick={() => changeQuantity(product.id, -1)}
                      aria-label="Decrease quantity"
                      className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f8e8e5] text-[#76233a]"
                    >
                      <Minus size={17} />
                    </button>

                    <div className="text-center">
                      <p className="text-sm font-bold text-[#421521]">
                        {quantityInCart}
                      </p>
                      <p className="text-[10px] text-[#82736f]">in cart</p>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddToCart}
                      disabled={isOutOfStock}
                      aria-label="Increase quantity"
                      className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f8e8e5] text-[#76233a] disabled:opacity-40"
                    >
                      <Plus size={17} />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={isOutOfStock}
                    className="flex min-h-[50px] flex-1 items-center justify-center gap-2 rounded-full bg-[#76233a] px-6 text-sm font-bold text-white transition hover:bg-[#421521] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <ShoppingBag size={18} />
                    {isOutOfStock ? "Out of Stock" : "Add to Cart"}
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => toggleWishlist(product.id)}
                  className={`flex min-h-[50px] items-center justify-center gap-2 rounded-full border px-5 text-sm font-bold ${
                    isWishlisted
                      ? "border-rose-200 bg-rose-50 text-rose-600"
                      : "border-[#e8d9ce] bg-white text-[#76233a]"
                  }`}
                >
                  <Heart
                    size={18}
                    className={isWishlisted ? "fill-current" : ""}
                  />
                  {isWishlisted ? "Wishlisted" : "Wishlist"}
                </button>
              </div>

              {addedMessage && (
                <div className="mt-3 flex flex-wrap items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-800">
                  <CheckCircle2 size={17} />
                  Added to your cart successfully!
                  <Link
                    to="/cart"
                    className="ml-auto inline-flex items-center gap-1 underline"
                  >
                    Go to Cart <ArrowRight size={14} />
                  </Link>
                </div>
              )}

              {/* Additional information */}
              <div className="mt-6 grid gap-3 border-t border-[#eadfd2] pt-5 sm:grid-cols-2">
                <div className="flex items-start gap-3">
                  <ShieldCheck size={20} className="mt-0.5 shrink-0 text-[#a34b3d]" />
                  <div>
                    <p className="text-sm font-bold text-[#421521]">
                      Shop with confidence
                    </p>
                    <p className="mt-1 text-xs leading-5 text-[#82736f]">
                      Review your cart and delivery details before placing an order.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Gift size={20} className="mt-0.5 shrink-0 text-[#a34b3d]" />
                  <div>
                    <p className="text-sm font-bold text-[#421521]">
                      Thoughtful gifting
                    </p>
                    <p className="mt-1 text-xs leading-5 text-[#82736f]">
                      Explore more finds for friends and family.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Related products */}
          {relatedProducts.length > 0 && (
            <section className="mt-12 border-t border-[#eadfd2] pt-8">
              <div className="mb-5">
                <p className="text-xs font-bold uppercase tracking-widest text-[#a34b3d]">
                  Complete your collection
                </p>
                <h2 className="mt-2 font-serif text-2xl font-bold text-[#421521] sm:text-3xl">
                  You may also like
                </h2>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4">
                {relatedProducts.map((item) => (
                  <ProductCard key={item.id} product={item} />
                ))}
              </div>
            </section>
          )}

          {/* Continue shopping */}
          <div className="mt-8">
            <Link
              to={
                product.categorySlug
                  ? `/category/${product.categorySlug}`
                  : "/categories"
              }
              className="inline-flex items-center gap-2 text-sm font-bold text-[#76233a] hover:text-[#b45324]"
            >
              <ArrowLeft size={17} />
              Continue shopping
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
