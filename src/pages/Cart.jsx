
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
  AlertCircle,
} from "lucide-react";

import Header from "../components/Header";
import { useShop } from "../context/ShopContext";
import { products } from "../data/products";

export default function Cart() {
  const { cart, cartTotal, changeQuantity, removeFromCart } = useShop();
  const navigate = useNavigate();

  const totalQuantity = cart.reduce(
    (total, item) => total + Math.max(0, Number(item.quantity) || 0),
    0
  );

  const originalTotal = cart.reduce((total, item) => {
    const originalPrice = Number(item.originalPrice) || Number(item.price) || 0;
    const quantity = Math.max(0, Number(item.quantity) || 0);
    return total + originalPrice * quantity;
  }, 0);

  const savings = Math.max(0, originalTotal - (Number(cartTotal) || 0));

  const formatPrice = (price) =>
    `₹${Number(price || 0).toLocaleString("en-IN")}`;

  function getProduct(item) {
    return products.find(
      (product) => String(product.id) === String(item.id)
    );
  }

  function getAvailableStock(item) {
    const product = getProduct(item);
    return Math.max(0, Number(product?.stock ?? item.stock) || 0);
  }

  function canIncrease(item) {
    return (
      getAvailableStock(item) > 0 &&
      Number(item.quantity || 0) < getAvailableStock(item)
    );
  }

  const unavailableItems = cart.filter(
    (item) => getAvailableStock(item) === 0
  );

  return (
    <>
      <Header />

      {/* Keep the content close to the header. Avoid min-height and large
          top padding that can make the page feel unnecessarily empty. */}
      <main className="mx-auto w-full max-w-[1500px] bg-transparent px-4 pb-10 pt-4 sm:px-6 sm:pt-5 lg:px-8">
        <nav
          aria-label="Breadcrumb"
          className="mb-5 flex items-center gap-2 text-xs text-[#82736f] sm:text-sm"
        >
          <Link to="/" className="transition hover:text-[#76233a]">
            Home
          </Link>
          <ChevronRight size={14} />
          <span className="font-semibold text-[#421521]">My Cart</span>
        </nav>

        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>

            <h1 className="flex flex-wrap items-center gap-3 text-3xl font-extrabold tracking-tight text-[#421521] sm:text-4xl">
              <ShoppingBag size={30} className="text-[#76233a]" />
              My Cart
              <span className="rounded-full bg-[#f8e8e5] px-3 py-1 text-sm font-bold text-[#76233a]">
                {totalQuantity}
              </span>
            </h1>

          </div>

          {cart.length > 0 && (
            <Link
              to="/categories"
              className="inline-flex items-center gap-2 rounded-full border border-[#ead9ce] bg-white px-4 py-2.5 text-sm font-bold text-[#76233a] transition hover:border-[#d9b2a8] hover:bg-[#fff4f0]"
            >
              Continue shopping
              <ArrowRight size={16} />
            </Link>
          )}
        </div>

        {cart.length === 0 ? (
          <section className="overflow-hidden rounded-[26px] border border-[#f0e3d9] bg-white shadow-sm">
            <div className="relative overflow-hidden bg-gradient-to-br from-[#fff0d7] via-[#fff8ef] to-[#f8e2dc] px-5 py-12 text-center sm:px-10 sm:py-16">
              <div className="pointer-events-none absolute -right-10 -top-12 h-40 w-40 rounded-full border-[24px] border-white/30" />
              <div className="pointer-events-none absolute -bottom-20 -left-10 h-40 w-40 rounded-full border-[24px] border-white/30" />

              <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-[26px] border border-white bg-white/85 text-[#76233a] shadow-sm">
                <ShoppingCart size={36} strokeWidth={1.5} />
              </div>

              <p className="purv-eyebrow relative mt-6">
                A little room for something lovely
              </p>

              <h2 className="relative mt-3 text-2xl font-extrabold leading-tight text-[#421521] sm:text-3xl">
                Your cart is waiting for a little magic
              </h2>

              <p className="relative mx-auto mt-3 max-w-lg text-sm leading-6 text-[#765c50]">
                Explore beauty essentials, festive decorations, jewellery,
                pooja favourites, and thoughtful gifts for every celebration.
              </p>

              <Link to="/categories" className="purv-button relative mt-6">
                <ShoppingBag size={17} />
                Start shopping
                <ArrowRight size={17} />
              </Link>
            </div>

            <div className="grid gap-4 border-t border-[#f0e3d9] px-5 py-5 sm:grid-cols-3 sm:px-8">
              <div className="flex items-center justify-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f8e8e5] text-[#76233a]">
                  <Gift size={19} />
                </span>
                <span className="text-sm font-semibold text-[#654b40]">
                  Festive favourites
                </span>
              </div>

              <div className="flex items-center justify-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fff0d7] text-[#a34b3d]">
                  <PackageCheck size={19} />
                </span>
                <span className="text-sm font-semibold text-[#654b40]">
                  Easy order review
                </span>
              </div>

              <div className="flex items-center justify-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#edf6e9] text-[#376b32]">
                  <ShieldCheck size={19} />
                </span>
                <span className="text-sm font-semibold text-[#654b40]">
                  Checkout with care
                </span>
              </div>
            </div>
          </section>
        ) : (
          <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_350px] xl:grid-cols-[minmax(0,1fr)_380px] lg:gap-7">
            <section className="min-w-0 space-y-3">
              <div className="flex items-center justify-between rounded-[20px] border border-[#f0e3d9] bg-white px-4 py-3.5">
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

                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f8e8e5] text-[#76233a]">
                  <ShoppingBasket size={21} />
                </span>
              </div>

              {unavailableItems.length > 0 && (
                <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                  <AlertCircle size={19} className="mt-0.5 shrink-0" />
                  <div>
                    <p className="font-bold">Some products are out of stock</p>
                    <p className="mt-1 text-xs leading-5">
                      Remove unavailable products from your cart before
                      proceeding to checkout.
                    </p>
                  </div>
                </div>
              )}

              {cart.map((item) => {
                const quantity = Math.max(0, Number(item.quantity) || 0);
                const price = Number(item.price) || 0;
                const originalPrice = Number(item.originalPrice) || price;
                const stock = getAvailableStock(item);
                const outOfStock = stock === 0;

                const discount =
                  originalPrice > price
                    ? Math.round(((originalPrice - price) / originalPrice) * 100)
                    : 0;

                return (
                  <article
                    key={item.id}
                    className="group rounded-[22px] border border-[#f0e3d9] bg-white p-3 shadow-[0_4px_18px_rgba(66,21,33,0.025)] transition hover:border-[#e2c8b9] sm:p-4"
                  >
                    <div className="flex gap-3 sm:gap-4">
                      <Link
                        to={`/product/${item.id}`}
                        className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-[#fff7ef] sm:h-32 sm:w-32"
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          loading="lazy"
                          className="h-full w-full object-contain p-2 transition duration-300 group-hover:scale-105 sm:p-3"
                          onError={(event) => {
                            event.currentTarget.style.display = "none";
                          }}
                        />

                        {discount > 0 && (
                          <span className="absolute left-1 top-1 rounded-md bg-[#76233a] px-1.5 py-1 text-[9px] font-extrabold text-white">
                            {discount}% OFF
                          </span>
                        )}
                      </Link>

                      <div className="flex min-w-0 flex-1 flex-col">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <Link
                              to={`/product/${item.id}`}
                              className="line-clamp-2 text-sm font-extrabold leading-5 text-[#421521] transition hover:text-[#a34b3d] sm:text-base"
                            >
                              {item.name}
                            </Link>
                            <p className="mt-1 text-xs text-[#82736f]">
                              {item.category || "Purv collection"}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => removeFromCart(item.id)}
                            aria-label={`Remove ${item.name} from cart`}
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#a99a94] transition hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>

                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <span className="text-base font-extrabold text-[#421521]">
                            {formatPrice(price)}
                          </span>
                          {originalPrice > price && (
                            <span className="text-xs text-[#a99a94] line-through">
                              {formatPrice(originalPrice)}
                            </span>
                          )}
                        </div>

                        <div className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-3">
                          <div className="inline-flex items-center gap-2 rounded-xl border border-[#ead9ce] bg-[#fffaf5] p-1">
                            <button
                              type="button"
                              onClick={() => changeQuantity(item.id, -1)}
                              aria-label={`Decrease quantity of ${item.name}`}
                              className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-[#76233a] shadow-sm transition hover:bg-[#f8e8e5]"
                            >
                              <Minus size={14} />
                            </button>

                            <span className="min-w-5 text-center text-sm font-extrabold text-[#421521]">
                              {quantity}
                            </span>

                            <button
                              type="button"
                              onClick={() => changeQuantity(item.id, 1)}
                              disabled={!canIncrease(item)}
                              aria-label={`Increase quantity of ${item.name}`}
                              className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#76233a] text-white transition hover:bg-[#421521] disabled:cursor-not-allowed disabled:opacity-35"
                            >
                              <Plus size={14} />
                            </button>
                          </div>

                          <div className="text-right">
                            <p className="text-[10px] text-[#82736f]">
                              Item total
                            </p>
                            <p className="text-sm font-extrabold text-[#421521]">
                              {formatPrice(price * quantity)}
                            </p>
                          </div>
                        </div>

                        {outOfStock ? (
                          <p className="mt-2 text-xs font-bold text-red-600">
                            Out of stock · Remove this item to continue
                          </p>
                        ) : stock <= 5 ? (
                          <p className="mt-2 text-[11px] font-semibold text-orange-700">
                            Limited stock · {stock} available
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </article>
                );
              })}

              <Link
                to="/categories"
                className="flex items-center justify-center gap-2 rounded-[18px] border border-dashed border-[#dfc8b5] bg-white/70 px-5 py-3.5 text-sm font-bold text-[#76233a] transition hover:border-[#b45324] hover:bg-white"
              >
                <ArrowLeft size={16} />
                Add more festive favourites
              </Link>
            </section>

            <aside className="min-w-0 lg:sticky lg:top-5">
              <div className="overflow-hidden rounded-[24px] border border-[#f0e3d9] bg-white shadow-[0_8px_28px_rgba(66,21,33,0.045)]">
                <div className="purv-gradient px-5 py-5 text-white">
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/20 bg-white/10">
                      <ShoppingBag size={22} />
                    </span>
                    <div>
                      <h2 className="text-lg font-extrabold">Order summary</h2>
                      <p className="mt-1 text-xs text-white/75">
                        Your Purv collection
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-5">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-[#82736f]">
                      Subtotal ({totalQuantity}{" "}
                      {totalQuantity === 1 ? "item" : "items"})
                    </span>
                    <span className="font-bold text-[#421521]">
                      {formatPrice(cartTotal)}
                    </span>
                  </div>

                  {savings > 0 && (
                    <div className="mt-3 flex items-center justify-between gap-3 text-sm">
                      <span className="flex items-center gap-2 text-green-700">
                        <Tag size={15} />
                        Product savings
                      </span>
                      <span className="font-extrabold text-green-700">
                        −{formatPrice(savings)}
                      </span>
                    </div>
                  )}

                  <div className="mt-3 flex items-center justify-between gap-3 text-sm">
                    <span className="text-[#82736f]">Delivery fee</span>
                    <span className="text-right text-xs font-semibold text-[#a34b3d]">
                      Calculated at checkout
                    </span>
                  </div>

                  <div className="my-4 border-t border-dashed border-[#e6d6c7]" />

                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-extrabold text-[#421521]">
                        Items total
                      </p>
                      <p className="mt-1 text-[11px] text-[#82736f]">
                        Before delivery fees
                      </p>
                    </div>
                    <span className="text-xl font-extrabold text-[#421521]">
                      {formatPrice(cartTotal)}
                    </span>
                  </div>

                  {savings > 0 && (
                    <div className="mt-4 flex items-start gap-2 rounded-xl border border-green-100 bg-[#f1f8ed] p-3">
                      <Sparkles size={17} className="mt-0.5 shrink-0 text-green-700" />
                      <p className="text-xs leading-5 text-green-800">
                        You’re saving <strong>{formatPrice(savings)}</strong>{" "}
                        on these products.
                      </p>
                    </div>
                  )}

                  <button
                    type="button"
                    disabled={unavailableItems.length > 0}
                    onClick={() => navigate("/checkout/address")}
                    className="purv-button mt-5 min-h-[50px] w-full disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Proceed to checkout
                    <ArrowRight size={17} />
                  </button>

                  <div className="mt-3 flex items-start gap-2 text-xs leading-5 text-[#82736f]">
                    <ShieldCheck size={16} className="mt-0.5 shrink-0 text-[#a34b3d]" />
                    <p>Review your address and final charges before ordering.</p>
                  </div>
                </div>
              </div>

              <div className="mt-3 flex items-center gap-3 rounded-[20px] border border-[#f0e3d9] bg-white p-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#fff0e5] text-[#a34b3d]">
                  <Heart size={20} />
                </span>
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
      </main>
    </>
  );
}
