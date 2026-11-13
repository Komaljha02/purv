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
  ArrowRight,
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

  const isWishlisted = wishlist.some(
    (id) => String(id) === String(product.id),
  );

  const cartItem = cart.find((item) => String(item.id) === String(product.id));
  const quantity = Number(cartItem?.quantity || 0);

  const productImage =
    product.image || product.image_url || product.imageUrl || "";
  const originalPrice = Number(
    product.originalPrice ?? product.original_price ?? 0,
  );
  const price = Number(product.price || 0);

  const stock =
    product.stock == null || product.stock === ""
      ? null
      : Number(product.stock);

  const isOutOfStock = stock !== null && Number.isFinite(stock) && stock <= 0;
  const isAtStockLimit = false;

  const discount =
    originalPrice > price && originalPrice > 0
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : 0;

  const savings = originalPrice > price ? originalPrice - price : 0;

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

  function handleWishlist() {
    toggleWishlist(product.id);
  }

  return (
    <article className="group relative flex h-full min-w-0 flex-col overflow-hidden rounded-xl border border-[#f0e3d3] bg-white transition-all duration-300 hover:-translate-y-1 hover:border-[#e8c9a8] hover:shadow-[0_8px_22px_rgba(100,45,25,0.10)] sm:rounded-2xl">
      {/* Product image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-[#fffaf3] via-[#fff5e9] to-[#f9e8d9]">
        <Link
          to={`/product/${product.id}`}
          className="block h-full w-full"
          aria-label={`View ${product.name}`}
        >
          {!imageError && productImage ? (
            <img
              src={productImage}
              alt={product.name}
              loading="lazy"
              onError={() => setImageError(true)}
              className="h-full w-full object-contain p-2 transition-transform duration-500 group-hover:scale-105 sm:p-3"
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-[#a05238]">
              <ShoppingBag size={30} strokeWidth={1.2} />
              <span className="px-3 text-center text-xs font-medium">
                {product.name}
              </span>
            </div>
          )}
        </Link>

        {/* Discount label */}
        {discount > 0 && (
          <span className="absolute left-1.5 top-1.5 rounded-md bg-[#8b2635] px-1.5 py-1 text-[8px] font-extrabold tracking-wide text-white shadow-sm sm:left-2 sm:top-2 sm:text-[9px]">
            {discount}% OFF
          </span>
        )}

        {/* Festive label */}
        {discount === 0 && (
          <span className="absolute left-1.5 top-1.5 flex items-center gap-1 rounded-md bg-[#fff0cf] px-1.5 py-1 text-[8px] font-bold text-[#8b4a22] sm:left-2 sm:top-2 sm:text-[9px]">
            <Sparkles size={11} />
            PURV PICK
          </span>
        )}

        {/* Wishlist button */}
        <button
          type="button"
          onClick={handleWishlist}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          aria-pressed={isWishlisted}
          className={`absolute right-1.5 top-1.5 grid h-7 w-7 place-items-center rounded-full border shadow-sm transition-all duration-200 sm:right-2 sm:top-2 sm:h-8 sm:w-8 ${
            isWishlisted
              ? "border-red-200 bg-red-50 text-red-600"
              : "border-white/80 bg-white/95 text-stone-500 hover:border-red-200 hover:text-red-600"
          }`}
        >
          <Heart
            size={15}
            fill={isWishlisted ? "currentColor" : "none"}
            strokeWidth={isWishlisted ? 2.5 : 1.8}
          />
        </button>

        {/* Quantity in cart indicator */}
        {quantity > 0 && (
          <span className="absolute bottom-1.5 left-1.5 flex items-center gap-1 rounded-full border border-[#d5ead7] bg-white/95 px-2 py-1 text-[9px] font-bold text-[#16802a] shadow-sm sm:bottom-2 sm:left-2 sm:text-[10px]">
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
      <div className="flex flex-1 flex-col p-1.5">
        {/* Category */}
        <p className="mb-0.5 truncate text-[8px] font-extrabold uppercase tracking-[0.1em] text-[#a05238]">
          {product.category || "Festive Collection"}
        </p>

        {/* Product name */}
        <Link
          to={`/product/${product.id}`}
          className="block"
          aria-label={`View ${product.name}`}
        >
          <h3 className="line-clamp-1 min-h-4 text-[11px] font-bold leading-4 text-[#382722] transition-colors group-hover:text-[#8b2635]">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="mt-0.5 flex min-w-0 items-center gap-1">
          <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-[#edf7ed] px-1.5 py-0.5 text-[9px] font-bold text-[#237a35] sm:text-[10px]">
            <Star size={10} fill="currentColor" />
            {Number(product.rating || 0).toFixed(1)}
          </span>

          <span className="truncate text-[9px] text-stone-500 sm:text-[10px]">
            Customer rating
          </span>
        </div>

        {/* Price and savings */}
        <div className="mt-1 pt-0">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <span className="text-[13px] font-extrabold tracking-tight text-[#382722]">
              ₹{price.toLocaleString("en-IN")}
            </span>

            {originalPrice > price && (
              <del className="text-[9px] font-medium text-stone-400 sm:text-[10px]">
                ₹{originalPrice.toLocaleString("en-IN")}
              </del>
            )}
          </div>

          {savings > 0 && (
            <p className="mt-0.5 text-[9px] font-semibold text-[#27813a]">
              You save ₹{savings.toLocaleString("en-IN")}
            </p>
          )}

          {/* Add button or quantity controls */}
          {quantity === 0 ? (
            <button
              type="button"
              onClick={increaseQuantity}
              disabled={isOutOfStock}
              className="mt-1.5 flex min-h-7 w-full items-center justify-center gap-1 rounded-lg border border-[#76233a] bg-[#76233a] px-1 py-1 text-[9px] font-extrabold tracking-wide text-white transition-all duration-200 hover:bg-[#5c192c] active:scale-[0.98] disabled:cursor-not-allowed disabled:border-stone-300 disabled:bg-stone-100 disabled:text-stone-400"
            >
              <Plus size={14} strokeWidth={2.5} />
              ADD TO CART
            </button>
          ) : (
            <div className="mt-1.5 flex min-h-7 items-center justify-between overflow-hidden rounded-lg border border-[#76233a] bg-[#76233a] text-white">
              <button
                type="button"
                onClick={decreaseQuantity}
                aria-label={`Remove one ${product.name}`}
                className="grid h-7 w-7 shrink-0 place-items-center transition hover:bg-[#5c192c] active:scale-95"
              >
                <Minus size={14} strokeWidth={2.5} />
              </button>

              <span
                className="min-w-0 flex-1 text-center text-[11px] font-extrabold tabular-nums"
                aria-live="polite"
              >
                {quantity}
              </span>

              <button
                type="button"
                onClick={increaseQuantity}
                disabled={isAtStockLimit}
                aria-label={`Add one ${product.name}`}
                className="grid h-7 w-7 shrink-0 place-items-center transition hover:bg-[#5c192c] active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Plus size={14} strokeWidth={2.5} />
              </button>
            </div>
          )}

          {quantity > 0 && isAtStockLimit && !isOutOfStock && (
            <p className="mt-1 text-center text-[9px] font-medium text-[#a05238]">
              Maximum available quantity added
            </p>
          )}
          {quantity > 0 && (
            <Link
              to="/cart"
              className="mt-1 flex min-h-7 w-full items-center justify-center gap-1 rounded-lg bg-[#fff4e5] px-1.5 py-1 text-[9px] font-bold text-[#76233a] transition-all duration-200 hover:bg-[#76233a] hover:text-white active:scale-[0.98]"
            >
              <ShoppingBag size={13} />
              Go to Cart
              <ArrowRight size={13} />
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
