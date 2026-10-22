
import { useState } from "react";
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
import { products } from "../data/products";
import { useShop } from "../context/ShopContext";

export default function ProductDetails() {
  const { id } = useParams();

  const product = products.find(
    (item) => String(item.id) === String(id)
  );

  const {
    addToCart,
    wishlist,
    toggleWishlist,
    cart,
    changeQuantity,
  } = useShop();

  const [addedMessage, setAddedMessage] = useState(false);

  if (!product) {
    return (
      <>
        <Header />
        <main className="min-h-screen px-4 pb-16 pt-36 sm:pt-40">
          <div className="mx-auto max-w-lg rounded-[28px] border border-[#f0e3d9] bg-white p-8 text-center shadow-sm sm:p-12">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#f8e8e5] text-[#76233a]">
              <ShoppingBag size={28} />
            </div>
            <p className="purv-eyebrow mt-5">PURV COLLECTION</p>
            <h1 className="mt-3 text-3xl font-bold text-[#421521]">
              Product not found
            </h1>
            <p className="mt-3 text-sm leading-6 text-[#82736f]">
              This product may have been removed. Explore our collection
              to discover something special.
            </p>
            <Link to="/categories" className="purv-button mt-7">
              <ArrowLeft size={17} />
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
  const availableToAdd = Math.max(0, stock - quantityInCart);
  const isOutOfStock = stock === 0;

  const price = Number(product.price) || 0;
  const originalPrice = Number(product.originalPrice) || price;

  const discount =
    originalPrice > price
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : 0;

  const savings = Math.max(0, originalPrice - price);

  const relatedProducts = products
    .filter(
      (item) =>
        String(item.id) !== String(product.id) &&
        item.categorySlug === product.categorySlug
    )
    .slice(0, 4);

  function handleAddToCart() {
    if (availableToAdd <= 0) return;

    addToCart(product);
    setAddedMessage(true);
  }

  function formatPrice(value) {
    return `₹${Number(value).toLocaleString("en-IN")}`;
  }

  return (
    <>
      <Header />

      <main className="min-h-screen px-4 pb-16 pt-36 sm:px-6 sm:pt-40 lg:px-10">
        <div className="mx-auto max-w-[1320px]">

          {/* Breadcrumb */}
          <nav
            aria-label="Breadcrumb"
            className="mb-6 flex flex-wrap items-center gap-2 text-xs text-[#82736f] sm:text-sm"
          >
            <Link to="/" className="transition hover:text-[#76233a]">
              Home
            </Link>
            <ChevronRight size={14} />
            <Link
              to="/categories"
              className="transition hover:text-[#76233a]"
            >
              Categories
            </Link>
            <ChevronRight size={14} />
            <Link
              to={`/category/${product.categorySlug}`}
              className="transition hover:text-[#76233a]"
            >
              {product.category}
            </Link>
            <ChevronRight size={14} />
            <span className="max-w-[180px] truncate font-semibold text-[#421521]">
              {product.name}
            </span>
          </nav>

          {/* Product layout */}
          <section className="grid items-start gap-7 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">

            {/* Image panel */}
            <div className="lg:sticky lg:top-36">
              <div className="relative overflow-hidden rounded-[28px] border border-[#f0e3d9] bg-white shadow-[0_12px_45px_rgba(66,21,33,0.045)] sm:rounded-[34px]">
                <div className="absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-[#fbf0e7] to-transparent" />

                <div className="absolute left-4 top-4 z-10 flex flex-wrap gap-2 sm:left-6 sm:top-6">
                  {discount > 0 && (
                    <span className="rounded-full bg-[#76233a] px-4 py-2 text-xs font-extrabold tracking-wide text-white shadow-md">
                      {discount}% OFF
                    </span>
                  )}

                  {stock > 0 && stock <= 5 && (
                    <span className="rounded-full bg-[#fff0d7] px-3 py-2 text-xs font-bold text-[#94501d]">
                      Almost sold out
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => toggleWishlist(product.id)}
                  aria-label={
                    isWishlisted
                      ? "Remove from wishlist"
                      : "Add to wishlist"
                  }
                  className={`absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full border shadow-sm transition hover:scale-105 sm:right-6 sm:top-6 ${
                    isWishlisted
                      ? "border-rose-200 bg-rose-50 text-rose-600"
                      : "border-white bg-white/95 text-[#421521] hover:text-rose-600"
                  }`}
                >
                  <Heart
                    size={20}
                    className={isWishlisted ? "fill-current" : ""}
                  />
                </button>

                <div className="relative flex min-h-[330px] items-center justify-center p-5 sm:min-h-[500px] sm:p-10 lg:min-h-[560px]">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="max-h-[440px] w-full object-contain transition duration-500 hover:scale-[1.035] sm:max-h-[500px]"
                    onError={(event) => {
                      event.currentTarget.style.display = "none";
                    }}
                  />

                  {isOutOfStock && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/75 backdrop-blur-[2px]">
                      <span className="rounded-full bg-[#421521] px-5 py-3 text-sm font-bold text-white">
                        Currently unavailable
                      </span>
                    </div>
                  )}
                </div>

                <div className="relative border-t border-[#f0e3d9] bg-[#fffaf5] px-5 py-4 sm:px-7">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f8e8e5] text-[#76233a]">
                      <Sparkles size={19} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#421521]">
                        A little something special
                      </p>
                      <p className="mt-0.5 text-xs text-[#82736f]">
                        Thoughtful finds for everyday moments and celebrations.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Trust points */}
              <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-3">
                <div className="rounded-2xl border border-[#f0e3d9] bg-white p-3 text-center sm:p-4">
                  <PackageCheck className="mx-auto text-[#a34b3d]" size={21} />
                  <p className="mt-2 text-[10px] font-bold text-[#54251f] sm:text-xs">
                    Careful packing
                  </p>
                </div>
                <div className="rounded-2xl border border-[#f0e3d9] bg-white p-3 text-center sm:p-4">
                  <BadgeCheck className="mx-auto text-[#a34b3d]" size={21} />
                  <p className="mt-2 text-[10px] font-bold text-[#54251f] sm:text-xs">
                    Quality focused
                  </p>
                </div>
                <div className="rounded-2xl border border-[#f0e3d9] bg-white p-3 text-center sm:p-4">
                  <Truck className="mx-auto text-[#a34b3d]" size={21} />
                  <p className="mt-2 text-[10px] font-bold text-[#54251f] sm:text-xs">
                    Easy ordering
                  </p>
                </div>
              </div>
            </div>

            {/* Product information */}
            <div className="lg:py-3">

              <Link
                to={`/category/${product.categorySlug}`}
                className="inline-flex items-center gap-2 rounded-full border border-[#efd9ca] bg-[#fff0e5] px-3.5 py-2 text-[11px] font-extrabold uppercase tracking-[0.13em] text-[#9b4827] transition hover:bg-[#fbe1d0]"
              >
                <Sparkles size={14} />
                {product.category}
                <ArrowRight size={13} />
              </Link>

              <h1 className="mt-5 text-3xl font-extrabold leading-[1.15] tracking-tight text-[#421521] sm:text-4xl lg:text-[46px]">
                {product.name}
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-7 text-[#82736f] sm:text-base">
                {product.description ||
                  `Meet ${product.name} — a lovely ${product.category?.toLowerCase() || "festive"} pick for your everyday routine, thoughtful gifting, and special celebrations.`}
              </p>

              {/* Rating and availability */}
              <div className="mt-5 flex flex-wrap items-center gap-3">
                {product.rating ? (
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#edf6e9] px-3 py-2 text-sm font-extrabold text-[#376b32]">
                    <Star size={16} className="fill-current" />
                    {product.rating}
                  </span>
                ) : (
                  <span className="rounded-lg bg-[#fff0d7] px-3 py-2 text-xs font-bold text-[#94501d]">
                    New arrival
                  </span>
                )}

                <span className="text-xs text-[#82736f] sm:text-sm">
                  {product.rating ? "Customer rating" : "Discover a new favourite"}
                </span>

                <span className="hidden h-4 w-px bg-[#e5d7cd] sm:block" />

                <span className={`inline-flex items-center gap-2 text-xs font-bold ${
                  isOutOfStock ? "text-red-600" : "text-green-700"
                }`}>
                  <span className={`h-2 w-2 rounded-full ${
                    isOutOfStock ? "bg-red-500" : "bg-green-500"
                  }`} />
                  {isOutOfStock ? "Out of stock" : "Available to order"}
                </span>
              </div>

              {/* Price card */}
              <div className="mt-7 rounded-[24px] border border-[#f0e3d9] bg-white p-5 shadow-[0_8px_28px_rgba(66,21,33,0.035)] sm:p-6">
                <div className="flex flex-wrap items-end gap-x-3 gap-y-2">
                  <span className="text-4xl font-extrabold tracking-tight text-[#421521] sm:text-[42px]">
                    {formatPrice(price)}
                  </span>

                  {discount > 0 && (
                    <>
                      <span className="pb-1 text-base text-[#a99a94] line-through">
                        {formatPrice(originalPrice)}
                      </span>
                      <span className="mb-1 rounded-lg bg-[#edf6e9] px-2.5 py-1.5 text-xs font-extrabold text-[#376b32]">
                        Save {discount}%
                      </span>
                    </>
                  )}
                </div>

                <p className="mt-2 text-xs text-[#82736f]">
                  Inclusive of applicable taxes, where applicable.
                </p>

                {discount > 0 && (
                  <div className="mt-4 flex items-center gap-2 rounded-xl bg-[#f1f8ed] px-3.5 py-3 text-sm font-semibold text-[#376b32]">
                    <CheckCircle2 size={18} />
                    You save {formatPrice(savings)} on this product
                  </div>
                )}

                <div className="mt-5 border-t border-dashed border-[#e8d9ce] pt-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#fff0e5] text-[#a34b3d]">
                      <Clock3 size={19} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#421521]">
                        Ready for your next celebration
                      </p>
                      <p className="mt-1 text-xs leading-5 text-[#82736f]">
                        Add this favourite to your cart and review your order before checkout.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* About product */}
              <div className="mt-7">
                <h2 className="text-lg font-extrabold text-[#421521]">
                  About this product
                </h2>
                <p className="mt-3 text-sm leading-7 text-[#71615b] sm:text-base">
                  {product.description ||
                    `Discover ${product.name}, a lovely ${product.category?.toLowerCase() || "festive"} pick from Purv. Explore more favourites in this collection to complete your look, celebration, or gift.`}
                </p>
              </div>

              {/* Stock message */}
              <div className="mt-5">
                {isOutOfStock ? (
                  <p className="flex items-center gap-2 text-sm font-bold text-red-600">
                    <span className="h-2 w-2 rounded-full bg-red-500" />
                    This product is currently out of stock.
                  </p>
                ) : availableToAdd === 0 ? (
                  <p className="flex items-center gap-2 text-sm font-bold text-orange-700">
                    <span className="h-2 w-2 rounded-full bg-orange-500" />
                    You have reached the available stock limit.
                  </p>
                ) : stock <= 5 ? (
                  <p className="flex items-center gap-2 text-sm font-bold text-orange-700">
                    <span className="h-2 w-2 rounded-full bg-orange-500" />
                    Only {availableToAdd} more can be added to your cart.
                  </p>
                ) : (
                  <p className="flex items-center gap-2 text-sm font-semibold text-green-700">
                    <span className="h-2 w-2 rounded-full bg-green-500" />
                    In stock and ready to add.
                  </p>
                )}
              </div>

              {/* Cart and wishlist actions */}
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                {quantityInCart > 0 ? (
                  <div className="flex min-h-[54px] items-center justify-between rounded-2xl border border-[#e8d9ce] bg-white px-3 sm:w-[210px]">
                    <button
                      type="button"
                      onClick={() => changeQuantity(product.id, -1)}
                      aria-label="Decrease quantity"
                      className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f8e8e5] text-[#76233a] transition hover:bg-[#efd5d7]"
                    >
                      <Minus size={17} />
                    </button>

                    <div className="text-center">
                      <p className="text-sm font-extrabold text-[#421521]">
                        {quantityInCart}
                      </p>
                      <p className="text-[10px] text-[#82736f]">in cart</p>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddToCart}
                      disabled={availableToAdd <= 0}
                      aria-label="Increase quantity"
                      className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f8e8e5] text-[#76233a] transition hover:bg-[#efd5d7] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Plus size={17} />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={isOutOfStock || availableToAdd <= 0}
                    className="purv-button min-h-[54px] flex-1 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <ShoppingBag size={19} />
                    {isOutOfStock ? "Out of Stock" : "Add to Cart"}
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => toggleWishlist(product.id)}
                  className={`flex min-h-[54px] items-center justify-center gap-2 rounded-full border px-6 font-bold transition ${
                    isWishlisted
                      ? "border-rose-200 bg-rose-50 text-rose-600"
                      : "border-[#e8d9ce] bg-white text-[#76233a] hover:border-[#d8a5a1] hover:bg-[#fff4f0]"
                  }`}
                >
                  <Heart
                    size={19}
                    className={isWishlisted ? "fill-current" : ""}
                  />
                  {isWishlisted ? "Wishlisted" : "Add to wishlist"}
                </button>
              </div>

              {addedMessage && (
                <div className="mt-4 flex flex-wrap items-center gap-2 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-800">
                  <CheckCircle2 size={18} />
                  Added to your cart successfully!
                  <Link
                    to="/cart"
                    className="ml-auto inline-flex items-center gap-1 font-extrabold underline underline-offset-4"
                  >
                    View cart
                    <ArrowRight size={15} />
                  </Link>
                </div>
              )}

              {/* Trust information */}
              <div className="mt-7 grid gap-3 border-t border-[#eadfd2] pt-6 sm:grid-cols-2">
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
                      Made for thoughtful gifting
                    </p>
                    <p className="mt-1 text-xs leading-5 text-[#82736f]">
                      Explore more festive finds for friends and family.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Related products */}
          {relatedProducts.length > 0 && (
            <section className="mt-16 border-t border-[#eadfd2] pt-10 sm:mt-20">
              <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="purv-eyebrow">Complete your collection</p>
                  <h2 className="purv-section-title mt-2 text-3xl sm:text-4xl">
                    You may also like
                  </h2>
                  <p className="mt-2 text-sm text-[#82736f]">
                    More favourites from {product.category}.
                  </p>
                </div>

                <Link
                  to={`/category/${product.categorySlug}`}
                  className="inline-flex items-center gap-2 text-sm font-bold text-[#76233a] transition hover:text-[#b45324]"
                >
                  View category
                  <ArrowRight size={16} />
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
                {relatedProducts.map((relatedProduct) => (
                  <ProductCard
                    key={relatedProduct.id}
                    product={relatedProduct}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Continue shopping */}
          <div className="mt-12">
            <Link
              to={`/category/${product.categorySlug}`}
              className="inline-flex items-center gap-2 text-sm font-bold text-[#76233a] transition hover:text-[#b45324]"
            >
              <ArrowLeft size={17} />
              Continue shopping in {product.category}
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
