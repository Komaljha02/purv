import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Minus, Star, Check, ShoppingBag, Sparkles } from "lucide-react";
import { useShop } from "../context/ShopContext";

export default function ProductCard({ product }) {
  const { addToCart, cart, changeQuantity, removeFromCart } = useShop();

  const [imageError, setImageError] = useState(false);

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

  return (
    <article className="group relative flex h-full min-w-0 flex-col overflow-hidden rounded-lg border border-[#f0e3d3] bg-white">
      {/* Product image */}
      <div className="relative aspect-square w-full overflow-hidden bg-white">
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
              className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-1 text-[#a05238]">
              <ShoppingBag size={22} strokeWidth={1.2} />
              <span className="px-2 text-center text-[9px]">
                {product.name}
              </span>
            </div>
          )}
        </Link>

        {/* Discount */}
        {discount > 0 && (
          <span className="absolute left-1 top-1 rounded-md bg-[#8b2635] px-1.5 py-0.5 text-[8px] font-extrabold text-white shadow-sm">
            {discount}% OFF
          </span>
        )}

        {discount === 0 && (
          <span className="absolute left-1 top-1 flex items-center gap-0.5 rounded bg-[#fff0cf] px-1 py-0.5 text-[7px] font-bold text-[#8b4a22]">
            <Sparkles size={9} />
            PICK
          </span>
        )}

        {/* Add button / Quantity control */}
        <div className="absolute right-1 top-1">
          {quantity === 0 ? (
            <button
              type="button"
              onClick={increaseQuantity}
              disabled={isOutOfStock}
              aria-label={`Add ${product.name} to cart`}
              className="grid h-8 w-8 place-items-center rounded-lg border border-[#76233a] bg-white text-[#76233a] shadow-md transition hover:bg-[#76233a] hover:text-white active:scale-95 disabled:opacity-40"
            >
              <Plus size={22} strokeWidth={2.8} />
            </button>
          ) : (
            <div className="flex h-8 items-center overflow-hidden rounded-lg border border-[#76233a] bg-white text-[#76233a] shadow-md">
              <button
                type="button"
                onClick={decreaseQuantity}
                aria-label={`Remove one ${product.name}`}
                className="grid h-7 w-6 place-items-center"
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
                className="grid h-7 w-6 place-items-center"
              >
                <Plus size={13} strokeWidth={2.5} />
              </button>
            </div>
          )}
        </div>

        {/* Out of stock */}
        {isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70">
            <span className="rounded-full bg-stone-800 px-2 py-1 text-[8px] font-bold text-white">
              Out of stock
            </span>
          </div>
        )}

        {/* Added indicator */}
        {quantity > 0 && (
          <span className="absolute bottom-1 left-1 flex items-center gap-0.5 rounded-full bg-white/95 px-1.5 py-0.5 text-[8px] font-bold text-green-700 shadow-sm">
            <Check size={10} />
            Added
          </span>
        )}
      </div>

      {/* Product information */}
      <div className="flex flex-1 flex-col p-1.5">
        <p className="mb-0.5 truncate text-[7px] font-extrabold uppercase tracking-wider text-[#a05238]">
          {product.category || "Festive Collection"}
        </p>

        <Link to={`/product/${product.id}`}>
          <h3 className="line-clamp-2 min-h-[36px] text-[13px] font-bold leading-[18px] text-[#382722] transition group-hover:text-[#8b2635] sm:text-[15px] sm:leading-5">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="mt-1 flex items-center gap-1">
          <span className="inline-flex shrink-0 items-center gap-0.5 rounded bg-[#edf7ed] px-1 py-0.5 text-[8px] font-bold text-[#237a35]">
            <Star size={9} fill="currentColor" />
            {Number(product.rating || 0).toFixed(1)}
          </span>

          <span className="truncate text-[8px] text-stone-500">Rating</span>
        </div>

        {/* Price */}
        <div className="mt-1 flex flex-wrap items-baseline gap-x-1.5">
          <span className="text-[12px] font-extrabold text-[#382722]">
            ₹{price.toLocaleString("en-IN")}
          </span>

          {originalPrice > price && (
            <del className="text-[8px] text-stone-400">
              ₹{originalPrice.toLocaleString("en-IN")}
            </del>
          )}
        </div>

        {savings > 0 && (
          <p className="mt-0.5 text-[8px] font-semibold text-[#27813a]">
            Save ₹{savings.toLocaleString("en-IN")}
          </p>
        )}
      </div>
    </article>
  );
}
