import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Heart,
  Plus,
  Minus,
  Star,
  Check,
  ShoppingBag,
  Sparkles,
} from "lucide-react";
import { useShop } from "../context/ShopContext";

export default function ProductCard({ product }) {
  const {
    addToCart,
    wishlist,
    toggleWishlist,
    cart,
    changeQuantity,
    removeFromCart,
  } = useShop();

  const [imageError, setImageError] = useState(false);

  const isWishlisted = wishlist.includes(product.id);

  const cartItem = cart.find((item) => item.id === product.id);
  const quantity = cartItem?.quantity || 0;

  const stock = Math.max(0, Number(product.stock) || 0);
  const isOutOfStock = stock <= 0;
  const isAtStockLimit = quantity >= stock;

  const discount =
    Number(product.originalPrice) > Number(product.price)
      ? Math.round(
          ((Number(product.originalPrice) - Number(product.price)) /
            Number(product.originalPrice)) *
            100
        )
      : 0;

  const savings =
    Number(product.originalPrice) > Number(product.price)
      ? Number(product.originalPrice) - Number(product.price)
      : 0;

  function increaseQuantity() {
    if (isOutOfStock || isAtStockLimit) return;

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

  function handleWishlist() {
    toggleWishlist(product.id);
  }

  return (
    <article className="group relative flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-[#f0e3d3] bg-white transition-all duration-300 hover:-translate-y-1 hover:border-[#e8c9a8] hover:shadow-[0_12px_35px_rgba(100,45,25,0.10)]">
      {/* Product image */}
      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-[#fffaf3] via-[#fff5e9] to-[#f9e8d9]">
        <Link
          to={`/product/${product.id}`}
          className="block h-full w-full"
          aria-label={`View ${product.name}`}
        >
          {!imageError && product.image ? (
            <img
              src={product.image}
              alt={product.name}
              loading="lazy"
              onError={() => setImageError(true)}
              className="h-full w-full object-contain p-3 transition-transform duration-500 group-hover:scale-110 sm:p-5"
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-[#a05238]">
              <ShoppingBag size={42} strokeWidth={1.2} />
              <span className="px-3 text-center text-xs font-medium">
                {product.name}
              </span>
            </div>
          )}
        </Link>

        {/* Discount label */}
        {discount > 0 && (
          <span className="absolute left-2.5 top-2.5 rounded-md bg-[#8b2635] px-2 py-1 text-[9px] font-extrabold tracking-wide text-white shadow-sm sm:left-3 sm:top-3 sm:text-[10px]">
            {discount}% OFF
          </span>
        )}

        {/* Festive label */}
        {discount === 0 && (
          <span className="absolute left-2.5 top-2.5 flex items-center gap-1 rounded-md bg-[#fff0cf] px-2 py-1 text-[9px] font-bold text-[#8b4a22] sm:left-3 sm:top-3 sm:text-[10px]">
            <Sparkles size={11} />
            PURV PICK
          </span>
        )}

        {/* Wishlist button */}
        <button
          type="button"
          onClick={handleWishlist}
          aria-label={
            isWishlisted ? "Remove from wishlist" : "Add to wishlist"
          }
          aria-pressed={isWishlisted}
          className={`absolute right-2.5 top-2.5 grid h-8 w-8 place-items-center rounded-full border shadow-sm transition-all duration-200 sm:right-3 sm:top-3 sm:h-9 sm:w-9 ${
            isWishlisted
              ? "border-red-200 bg-red-50 text-red-600"
              : "border-white/80 bg-white/95 text-stone-500 hover:border-red-200 hover:text-red-600"
          }`}
        >
          <Heart
            size={17}
            fill={isWishlisted ? "currentColor" : "none"}
            strokeWidth={isWishlisted ? 2.5 : 1.8}
          />
        </button>

        {/* Quantity in cart indicator */}
        {quantity > 0 && (
          <span className="absolute bottom-2.5 left-2.5 flex items-center gap-1 rounded-full border border-[#d5ead7] bg-white/95 px-2.5 py-1 text-[10px] font-bold text-[#16802a] shadow-sm sm:bottom-3 sm:left-3 sm:text-xs">
            <Check size={12} strokeWidth={3} />
            {quantity} in cart
          </span>
        )}

        {/* Out-of-stock overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/65">
            <span className="rounded-full bg-stone-800 px-4 py-2 text-xs font-bold text-white">
              Currently unavailable
            </span>
          </div>
        )}
      </div>

      {/* Product details */}
      <div className="flex flex-1 flex-col p-3 sm:p-4">
        {/* Category */}
        <p className="mb-1.5 truncate text-[9px] font-extrabold uppercase tracking-[0.15em] text-[#a05238] sm:text-[10px]">
          {product.category || "Festive Collection"}
        </p>

        {/* Product name */}
        <Link
          to={`/product/${product.id}`}
          className="block"
          aria-label={`View ${product.name}`}
        >
          <h3 className="line-clamp-2 min-h-10 text-xs font-bold leading-5 text-[#382722] transition-colors group-hover:text-[#8b2635] sm:min-h-11 sm:text-sm">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="mt-2 flex min-w-0 items-center gap-1.5">
          <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-[#edf7ed] px-1.5 py-1 text-[10px] font-bold text-[#237a35] sm:text-xs">
            <Star size={11} fill="currentColor" />
            {Number(product.rating || 0).toFixed(1)}
          </span>

          <span className="truncate text-[10px] text-stone-500 sm:text-xs">
            Customer rating
          </span>
        </div>

        {/* Price and savings */}
        <div className="mt-auto pt-4">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <span className="text-base font-extrabold tracking-tight text-[#382722] sm:text-lg">
              ₹{Number(product.price || 0).toLocaleString("en-IN")}
            </span>

            {Number(product.originalPrice) > Number(product.price) && (
              <del className="text-[10px] font-medium text-stone-400 sm:text-xs">
                ₹{Number(product.originalPrice).toLocaleString("en-IN")}
              </del>
            )}
          </div>

          {savings > 0 && (
            <p className="mt-1 text-[10px] font-semibold text-[#27813a] sm:text-[11px]">
              You save ₹{savings.toLocaleString("en-IN")}
            </p>
          )}

          {/* Add button or quantity controls */}
          {quantity === 0 ? (
            <button
              type="button"
              onClick={increaseQuantity}
              disabled={isOutOfStock}
              className="mt-3 flex min-h-10 w-full items-center justify-center gap-2 rounded-xl border border-[#198b36] bg-white px-2 py-2 text-xs font-extrabold tracking-wide text-[#198b36] transition-all duration-200 hover:bg-[#198b36] hover:text-white active:scale-[0.98] disabled:cursor-not-allowed disabled:border-stone-300 disabled:bg-stone-100 disabled:text-stone-400 sm:text-sm"
            >
              <Plus size={16} strokeWidth={2.5} />
              ADD TO CART
            </button>
          ) : (
            <div className="mt-3 flex min-h-10 items-center justify-between overflow-hidden rounded-xl border border-[#198b36] bg-[#198b36] text-white">
              <button
                type="button"
                onClick={decreaseQuantity}
                aria-label={`Remove one ${product.name}`}
                className="grid h-10 w-10 shrink-0 place-items-center transition hover:bg-[#116d29] active:scale-95"
              >
                <Minus size={16} strokeWidth={2.5} />
              </button>

              <span
                className="min-w-0 flex-1 text-center text-sm font-extrabold tabular-nums"
                aria-live="polite"
              >
                {quantity}
              </span>

              <button
                type="button"
                onClick={increaseQuantity}
                disabled={isAtStockLimit}
                aria-label={`Add one ${product.name}`}
                className="grid h-10 w-10 shrink-0 place-items-center transition hover:bg-[#116d29] active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Plus size={16} strokeWidth={2.5} />
              </button>
            </div>
          )}

          {quantity > 0 && isAtStockLimit && !isOutOfStock && (
            <p className="mt-1.5 text-center text-[10px] font-medium text-[#a05238]">
              Maximum available quantity added
            </p>
          )}
        </div>
      </div>
    </article>
  );
}