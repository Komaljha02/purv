
import { Link, useNavigate } from "react-router-dom";
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowLeft,
  Tag,
  ShieldCheck,
  PackageCheck,
  Sparkles,
  ShoppingCart,
  ArrowRight,
  Gift,
  ChevronRight,
  Heart,
  ShoppingBasket,
} from "lucide-react";

import Header from "../components/Header";
import { useShop } from "../context/ShopContext";
import { products } from "../data/products";

export default function Cart() {
  const {
    cart,
    cartTotal,
    changeQuantity,
    removeFromCart,
  } = useShop();

  const navigate = useNavigate();

  const totalQuantity = cart.reduce(
    (total, item) => total + Math.max(0, Number(item.quantity) || 0),
    0
  );

  const originalTotal = cart.reduce((total, item) => {
    const originalPrice =
      Number(item.originalPrice) || Number(item.price) || 0;
    const quantity = Math.max(0, Number(item.quantity) || 0);

    return total + originalPrice * quantity;
  }, 0);

  const savings = Math.max(
    0,
    originalTotal - (Number(cartTotal) || 0)
  );

  const formatPrice = (price) =>
    `₹${Number(price || 0).toLocaleString("en-IN")}`;

  function getAvailableStock(item) {
    const product = products.find(
      (product) => String(product.id) === String(item.id)
    );

    return Math.max(
      0,
      Number(product?.stock ?? item.stock) || 0
    );
  }

  function canIncrease(item) {
    const stock = getAvailableStock(item);
    const quantity = Number(item.quantity) || 0;

    // A stock value of zero means unavailable.
    return stock > 0 && quantity < stock;
  }

  return (
    <>
      <Header />

      <main className="min-h-screen px-4 pb-16 pt-36 sm:px-6 sm:pt-40 lg:px-10">
        <div className="mx-auto max-w-[1320px]">

          {/* Breadcrumb */}
          <nav
            aria-label="Breadcrumb"
            className="mb-7 flex items-center gap-2 text-xs text-[#82736f] sm:text-sm"
          >
            <Link to="/" className="transition hover:text-[#76233a]">
              Home
            </Link>
            <ChevronRight size={14} />
            <span className="font-semibold text-[#421521]">
              My Cart
            </span>
          </nav>

          {/* Heading */}
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="purv-eyebrow mb-3 flex items-center gap-2">
                <Sparkles size={15} />
                Your Purv favourites
              </p>

              <h1 className="flex flex-wrap items-center gap-3 text-3xl font-extrabold tracking-tight text-[#421521] sm:text-4xl lg:text-5xl">
                <ShoppingBag
                  size={32}
                  className="text-[#76233a]"
                />
                My Cart

                <span className="rounded-full bg-[#f8e8e5] px-3 py-1.5 text-base font-bold text-[#76233a]">
                  {totalQuantity}
                </span>
              </h1>

              <p className="mt-3 text-sm text-[#82736f] sm:text-base">
                Your favourite finds, gathered in one place.
              </p>
            </div>

            {cart.length > 0 && (
              <Link
                to="/categories"
                className="inline-flex items-center gap-2 rounded-full border border-[#ead9ce] bg-white px-5 py-3 text-sm font-bold text-[#76233a] transition hover:border-[#d9b2a8] hover:bg-[#fff4f0]"
              >
                Continue shopping
                <ArrowRight size={16} />
              </Link>
            )}
          </div>

          {/* Empty cart */}
          {cart.length === 0 ? (
            <section className="overflow-hidden rounded-[30px] border border-[#f0e3d9] bg-white shadow-[0_12px_40px_rgba(66,21,33,0.04)]">
              <div className="relative overflow-hidden bg-gradient-to-br from-[#fff0d7] via-[#fff8ef] to-[#f8e2dc] px-5 py-14 text-center sm:px-10 sm:py-20">
                <div className="pointer-events-none absolute -right-10 -top-12 h-48 w-48 rounded-full border-[28px] border-white/30" />
                <div className="pointer-events-none absolute -bottom-20 -left-10 h-48 w-48 rounded-full border-[25px] border-white/30" />

                <div className="relative mx-auto flex h-24 w-24 items-center justify-center rounded-[30px] border border-white bg-white/85 text-[#76233a] shadow-[0_12px_35px_rgba(118,35,58,0.1)]">
                  <ShoppingCart size={42} strokeWidth={1.5} />
                </div>

                <p className="purv-eyebrow relative mt-7">
                  A little room for something lovely
                </p>

                <h2 className="relative mt-3 text-2xl font-extrabold leading-tight text-[#421521] sm:text-4xl">
                  Your cart is waiting for a little magic
                </h2>

                <p className="relative mx-auto mt-4 max-w-lg text-sm leading-7 text-[#765c50] sm:text-base">
                  Explore beauty essentials, festive decorations,
                  jewellery, pooja favourites, and thoughtful gifts
                  for every celebration.
                </p>

                <Link
                  to="/categories"
                  className="purv-button relative mt-8"
                >
                  <ShoppingBag size={18} />
                  Start shopping
                  <ArrowRight size={17} />
                </Link>
              </div>

              <div className="grid gap-5 border-t border-[#f0e3d9] px-5 py-6 sm:grid-cols-3 sm:px-8">
                <div className="flex items-center justify-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f8e8e5] text-[#76233a]">
                    <Gift size={20} />
                  </div>
                  <span className="text-sm font-semibold text-[#654b40]">
                    Festive favourites
                  </span>
                </div>

                <div className="flex items-center justify-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fff0d7] text-[#a34b3d]">
                    <PackageCheck size={20} />
                  </div>
                  <span className="text-sm font-semibold text-[#654b40]">
                    Easy order review
                  </span>
                </div>

                <div className="flex items-center justify-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#edf6e9] text-[#376b32]">
                    <ShieldCheck size={20} />
                  </div>
                  <span className="text-sm font-semibold text-[#654b40]">
                    Checkout with care
                  </span>
                </div>
              </div>
            </section>
          ) : (
            <div className="grid items-start gap-6 lg:grid-cols-[1fr_380px] lg:gap-8">

              {/* Cart items */}
              <section className="min-w-0 space-y-4">
                <div className="flex items-center justify-between rounded-[22px] border border-[#f0e3d9] bg-white px-5 py-4">
                  <div>
                    <h2 className="font-extrabold text-[#421521]">
                      Your items
                    </h2>
                    <p className="mt-1 text-xs text-[#82736f]">
                      {cart.length} {cart.length === 1 ? "product" : "products"}
                      {" · "}
                      {totalQuantity} {totalQuantity === 1 ? "item" : "items"}
                    </p>
                  </div>

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f8e8e5] text-[#76233a]">
                    <ShoppingBasket size={22} />
                  </div>
                </div>

                {cart.map((item) => {
                  const quantity = Math.max(
                    0,
                    Number(item.quantity) || 0
                  );

                  const price = Number(item.price) || 0;

                  const originalPrice =
                    Number(item.originalPrice) || price;

                  const discount =
                    originalPrice > price
                      ? Math.round(
                          ((originalPrice - price) / originalPrice) * 100
                        )
                      : 0;

                  const itemTotal = price * quantity;
                  const stock = getAvailableStock(item);
                  const canAddMore = canIncrease(item);

                  return (
                    <article
                      key={item.id}
                      className="group rounded-[24px] border border-[#f0e3d9] bg-white p-3.5 shadow-[0_5px_20px_rgba(66,21,33,0.025)] transition duration-200 hover:border-[#e2c8b9] hover:shadow-[0_12px_30px_rgba(66,21,33,0.06)] sm:p-5"
                    >
                      <div className="flex gap-3.5 sm:gap-5">

                        {/* Product image */}
                        <Link
                          to={`/product/${item.id}`}
                          className="relative h-28 w-28 shrink-0 overflow-hidden rounded-2xl bg-[#fff7ef] sm:h-36 sm:w-36"
                        >
                          <img
                            src={item.image}
                            alt={item.name}
                            loading="lazy"
                            className="h-full w-full object-contain p-2.5 transition duration-300 group-hover:scale-105 sm:p-3"
                            onError={(event) => {
                              event.currentTarget.style.display = "none";
                            }}
                          />

                          {discount > 0 && (
                            <span className="absolute left-1.5 top-1.5 rounded-md bg-[#76233a] px-1.5 py-1 text-[9px] font-extrabold text-white sm:text-[10px]">
                              {discount}% OFF
                            </span>
                          )}
                        </Link>

                        {/* Product information */}
                        <div className="flex min-w-0 flex-1 flex-col">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <Link
                                to={`/product/${item.id}`}
                                className="line-clamp-2 text-sm font-extrabold leading-5 text-[#421521] transition hover:text-[#a34b3d] sm:text-base sm:leading-6"
                              >
                                {item.name}
                              </Link>

                              <p className="mt-1.5 text-xs text-[#82736f]">
                                {item.category || "Purv collection"}
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() => removeFromCart(item.id)}
                              aria-label={`Remove ${item.name} from cart`}
                              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[#a99a94] transition hover:bg-red-50 hover:text-red-600"
                            >
                              <Trash2 size={17} />
                            </button>
                          </div>

                          <div className="mt-3 flex flex-wrap items-center gap-2">
                            <span className="text-lg font-extrabold text-[#421521]">
                              {formatPrice(price)}
                            </span>

                            {originalPrice > price && (
                              <span className="text-xs text-[#a99a94] line-through sm:text-sm">
                                {formatPrice(originalPrice)}
                              </span>
                            )}
                          </div>

                          <div className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-4">
                            {/* Quantity selector */}
                            <div className="inline-flex items-center gap-2 rounded-xl border border-[#ead9ce] bg-[#fffaf5] p-1">
                              <button
                                type="button"
                                onClick={() => changeQuantity(item.id, -1)}
                                aria-label={`Decrease quantity of ${item.name}`}
                                className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-[#76233a] shadow-sm transition hover:bg-[#f8e8e5]"
                              >
                                <Minus size={15} />
                              </button>

                              <span className="min-w-5 text-center text-sm font-extrabold text-[#421521]">
                                {quantity}
                              </span>

                              <button
                                type="button"
                                onClick={() => changeQuantity(item.id, 1)}
                                disabled={!canAddMore}
                                aria-label={`Increase quantity of ${item.name}`}
                                className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#76233a] text-white transition hover:bg-[#421521] disabled:cursor-not-allowed disabled:opacity-35"
                              >
                                <Plus size={15} />
                              </button>
                            </div>

                            <div className="text-right">
                              <p className="text-[10px] font-medium text-[#82736f] sm:text-xs">
                                Item total
                              </p>
                              <p className="mt-0.5 text-sm font-extrabold text-[#421521] sm:text-base">
                                {formatPrice(itemTotal)}
                              </p>
                            </div>
                          </div>

                          {stock > 0 && stock <= 5 && (
                            <p className="mt-2 text-[11px] font-semibold text-orange-700">
                              Limited stock · {stock} available
                            </p>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })}

                {/* Continue shopping */}
                <Link
                  to="/categories"
                  className="flex items-center justify-center gap-2 rounded-[20px] border border-dashed border-[#dfc8b5] bg-white/70 px-5 py-4 text-sm font-bold text-[#76233a] transition hover:border-[#b45324] hover:bg-white"
                >
                  <ArrowLeft size={17} />
                  Add more festive favourites
                </Link>
              </section>

              {/* Order summary */}
              <aside className="min-w-0 lg:sticky lg:top-40">
                <div className="overflow-hidden rounded-[26px] border border-[#f0e3d9] bg-white shadow-[0_12px_35px_rgba(66,21,33,0.05)]">

                  <div className="purv-gradient px-5 py-6 text-white sm:px-6">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/20 bg-white/10">
                        <ShoppingBag size={23} />
                      </div>
                      <div>
                        <h2 className="text-xl font-extrabold">
                          Order summary
                        </h2>
                        <p className="mt-1 text-xs text-white/75">
                          Your Purv collection
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 sm:p-6">
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <span className="text-[#82736f]">
                        Subtotal ({totalQuantity} {totalQuantity === 1 ? "item" : "items"})
                      </span>
                      <span className="font-bold text-[#421521]">
                        {formatPrice(cartTotal)}
                      </span>
                    </div>

                    {savings > 0 && (
                      <div className="mt-4 flex items-center justify-between gap-3 text-sm">
                        <span className="flex items-center gap-2 text-green-700">
                          <Tag size={16} />
                          Product savings
                        </span>
                        <span className="font-extrabold text-green-700">
                          −{formatPrice(savings)}
                        </span>
                      </div>
                    )}

                    <div className="mt-4 flex items-start justify-between gap-3 text-sm">
                      <span className="text-[#82736f]">Delivery fee</span>
                      <span className="max-w-[150px] text-right text-xs font-semibold leading-5 text-[#a34b3d]">
                        Calculated at checkout
                      </span>
                    </div>

                    <div className="my-5 border-t border-dashed border-[#e6d6c7]" />

                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-extrabold text-[#421521]">
                          Items total
                        </p>
                        <p className="mt-1 text-[11px] leading-5 text-[#82736f]">
                          Final charges shown before payment
                        </p>
                      </div>

                      <span className="text-2xl font-extrabold tracking-tight text-[#421521]">
                        {formatPrice(cartTotal)}
                      </span>
                    </div>

                    {savings > 0 && (
                      <div className="mt-5 flex items-start gap-2.5 rounded-2xl border border-green-100 bg-[#f1f8ed] p-3.5">
                        <Sparkles
                          size={18}
                          className="mt-0.5 shrink-0 text-green-700"
                        />
                        <p className="text-xs leading-5 text-green-800">
                          Lovely choice! You're saving{" "}
                          <strong>{formatPrice(savings)}</strong>{" "}
                          on these products.
                        </p>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => navigate("/checkout/address")}
                      className="purv-button mt-6 min-h-[54px] w-full"
                    >
                      Proceed to checkout
                      <ArrowRight size={18} />
                    </button>

                    <div className="mt-4 flex items-start gap-2.5 text-xs leading-5 text-[#82736f]">
                      <ShieldCheck
                        size={17}
                        className="mt-0.5 shrink-0 text-[#a34b3d]"
                      />
                      <p>
                        Review your address and final charges before placing
                        your order.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Reassurance card */}
                <div className="mt-4 flex items-center gap-3 rounded-[22px] border border-[#f0e3d9] bg-white p-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#fff0e5] text-[#a34b3d]">
                    <Heart size={21} />
                  </div>
                  <div>
                    <p className="text-sm font-extrabold text-[#421521]">
                      Thoughtfully picked
                    </p>
                    <p className="mt-1 text-xs leading-5 text-[#82736f]">
                      Your selected products are ready for order review.
                    </p>
                  </div>
                </div>
              </aside>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
