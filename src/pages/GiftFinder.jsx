
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Gift,
  Heart,
  Sparkles,
  Wallet,
  PartyPopper,
  ShoppingBag,
  RotateCcw,
} from "lucide-react";

import Header from "../components/Header";
import ProductCard from "../components/ProductCard";
import { products } from "../data/products";
import { useShop } from "../context/ShopContext";

const occasions = [
  { label: "Diwali", emoji: "🪔", keywords: ["diwali", "festive", "pooja", "gift"] },
  { label: "Rakhi", emoji: "🎀", keywords: ["rakhi", "sister", "gift", "jewellery"] },
  { label: "Birthday", emoji: "🎂", keywords: ["birthday", "gift", "beauty", "makeup"] },
  { label: "Wedding", emoji: "💍", keywords: ["wedding", "jewellery", "beauty", "luxury"] },
  { label: "Housewarming", emoji: "🏡", keywords: ["housewarming", "pooja", "decor", "gift"] },
  { label: "Just Because", emoji: "💝", keywords: ["gift", "beauty", "skincare", "jewellery"] },
];

const recipients = [
  { label: "Mom", emoji: "🌷", keywords: ["skincare", "beauty", "pooja", "gift"] },
  { label: "Sister", emoji: "👭", keywords: ["makeup", "jewellery", "beauty", "rakhi"] },
  { label: "Friend", emoji: "🫶", keywords: ["makeup", "skincare", "gift", "beauty"] },
  { label: "Partner", emoji: "❤️", keywords: ["beauty", "jewellery", "luxury", "gift"] },
  { label: "Colleague", emoji: "🎁", keywords: ["gift", "festive", "decor", "pooja"] },
  { label: "Myself", emoji: "✨", keywords: ["makeup", "skincare", "beauty", "jewellery"] },
];

const budgets = [
  { label: "Under ₹500", value: 500, description: "Little joys" },
  { label: "Under ₹1,000", value: 1000, description: "Something special" },
  { label: "Under ₹2,000", value: 2000, description: "Extra special" },
  { label: "Any budget", value: Infinity, description: "Show me everything" },
];

const styles = [
  { label: "Beauty & Makeup", emoji: "💄", keywords: ["makeup", "beauty", "skincare"] },
  { label: "Jewellery", emoji: "💎", keywords: ["jewellery", "jewelry", "earring", "necklace"] },
  { label: "Traditional", emoji: "🪔", keywords: ["traditional", "pooja", "festive", "decor"] },
  { label: "Surprise me", emoji: "🎁", keywords: [] },
];

function searchableText(product) {
  return [
    product.name,
    product.category,
    product.categorySlug,
    product.description,
    product.tags?.join(" "),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export default function GiftFinder() {
  const { addToCart } = useShop();

  const [occasion, setOccasion] = useState("");
  const [recipient, setRecipient] = useState("");
  const [budget, setBudget] = useState(1000);
  const [style, setStyle] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [addedId, setAddedId] = useState("");

  const recommendations = useMemo(() => {
    if (!showResults) return [];

    const selectedOccasion = occasions.find((item) => item.label === occasion);
    const selectedRecipient = recipients.find((item) => item.label === recipient);
    const selectedStyle = styles.find((item) => item.label === style);

    const eligibleProducts = products.filter((product) => {
      const price = Number(product.price) || 0;
      return price <= budget && price > 0;
    });

    const scoredProducts = eligibleProducts.map((product) => {
      const text = searchableText(product);
      let score = 0;

      selectedOccasion?.keywords.forEach((keyword) => {
        if (text.includes(keyword)) score += 2;
      });

      selectedRecipient?.keywords.forEach((keyword) => {
        if (text.includes(keyword)) score += 1;
      });

      selectedStyle?.keywords.forEach((keyword) => {
        if (text.includes(keyword)) score += 4;
      });

      if (product.rating >= 4.5) score += 1;

      return { product, score };
    });

    return scoredProducts
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
      .map((item) => item.product);
  }, [occasion, recipient, budget, style, showResults]);

  function resetFinder() {
    setOccasion("");
    setRecipient("");
    setBudget(1000);
    setStyle("");
    setShowResults(false);
    setAddedId("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleFindGifts() {
    setShowResults(true);
    setAddedId("");

    window.setTimeout(() => {
      document.getElementById("gift-results")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  }

  function handleAddToCart(product) {
    addToCart(product);
    setAddedId(product.id);
  }

  const canFindGifts = Boolean(occasion && recipient && style);

  return (
    <>
      <Header />

      <main className="min-h-screen bg-[#fffaf4] px-4 pb-20 pt-36 sm:px-6 sm:pt-40 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#8b3026] hover:text-[#54251f]"
          >
            <ArrowLeft size={17} />
            Back to Purv
          </Link>

          {/* Hero */}
          <section className="relative mt-6 overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#54251f] via-[#762c25] to-[#a7472d] px-6 py-10 text-white sm:px-10 sm:py-14 lg:px-14 lg:py-16">
            <div className="pointer-events-none absolute -right-10 -top-12 text-[150px] opacity-10 sm:text-[220px]">
              🎁
            </div>

            <div className="relative max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium">
                <Sparkles size={16} />
                Your personal gifting assistant
              </div>

              <h1 className="mt-6 font-serif text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
                The perfect gift?
                <br />
                <span className="text-[#ffd79a]">We've got a feeling.</span>
              </h1>

              <p className="mt-5 max-w-xl text-sm leading-7 text-white/80 sm:text-base">
                Tell us who you're shopping for and what you're celebrating.
                We'll find thoughtful picks from the Purv collection.
              </p>

              <div className="mt-7 flex flex-wrap gap-4 text-sm text-white/85">
                <span className="flex items-center gap-2">
                  <Heart size={16} />
                  Thoughtful picks
                </span>
                <span className="flex items-center gap-2">
                  <Wallet size={16} />
                  Your budget
                </span>
                <span className="flex items-center gap-2">
                  <Sparkles size={16} />
                  Made for the moment
                </span>
              </div>
            </div>
          </section>

          {/* Quiz */}
          <section className="mt-10 grid items-start gap-8 lg:grid-cols-[1fr_300px]">
            <div className="space-y-8">
              {/* Occasion */}
              <div className="rounded-3xl border border-[#f0dfca] bg-white p-5 shadow-sm sm:p-7">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#fff0dc] font-bold text-[#8b3026]">
                    01
                  </span>
                  <div>
                    <h2 className="text-xl font-bold text-[#54251f]">
                      What's the occasion?
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                      Every celebration deserves a little magic.
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {occasions.map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => setOccasion(item.label)}
                      className={`rounded-2xl border p-4 text-left transition ${
                        occasion === item.label
                          ? "border-[#8b3026] bg-[#fff5e9] ring-1 ring-[#8b3026]"
                          : "border-[#eee3d8] hover:border-[#d8b9a3]"
                      }`}
                    >
                      <span className="text-2xl">{item.emoji}</span>
                      <span className="mt-3 block text-sm font-semibold text-[#54251f]">
                        {item.label}
                      </span>
                      {occasion === item.label && (
                        <Check size={15} className="mt-2 text-[#8b3026]" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Recipient */}
              <div className="rounded-3xl border border-[#f0dfca] bg-white p-5 shadow-sm sm:p-7">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#fff0dc] font-bold text-[#8b3026]">
                    02
                  </span>
                  <div>
                    <h2 className="text-xl font-bold text-[#54251f]">
                      Who are you gifting?
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                      We'll help you find something they'll love.
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {recipients.map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => setRecipient(item.label)}
                      className={`rounded-2xl border p-4 text-left transition ${
                        recipient === item.label
                          ? "border-[#8b3026] bg-[#fff5e9] ring-1 ring-[#8b3026]"
                          : "border-[#eee3d8] hover:border-[#d8b9a3]"
                      }`}
                    >
                      <span className="text-2xl">{item.emoji}</span>
                      <span className="mt-3 block text-sm font-semibold text-[#54251f]">
                        {item.label}
                      </span>
                      {recipient === item.label && (
                        <Check size={15} className="mt-2 text-[#8b3026]" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Budget */}
              <div className="rounded-3xl border border-[#f0dfca] bg-white p-5 shadow-sm sm:p-7">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#fff0dc] font-bold text-[#8b3026]">
                    03
                  </span>
                  <div>
                    <h2 className="text-xl font-bold text-[#54251f]">
                      What's your budget?
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                      Beautiful gifts for every budget.
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {budgets.map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => setBudget(item.value)}
                      className={`rounded-2xl border p-4 text-left transition ${
                        budget === item.value
                          ? "border-[#8b3026] bg-[#fff5e9] ring-1 ring-[#8b3026]"
                          : "border-[#eee3d8] hover:border-[#d8b9a3]"
                      }`}
                    >
                      <span className="block text-sm font-bold text-[#54251f]">
                        {item.label}
                      </span>
                      <span className="mt-2 block text-xs text-gray-500">
                        {item.description}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Style */}
              <div className="rounded-3xl border border-[#f0dfca] bg-white p-5 shadow-sm sm:p-7">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#fff0dc] font-bold text-[#8b3026]">
                    04
                  </span>
                  <div>
                    <h2 className="text-xl font-bold text-[#54251f]">
                      Pick their vibe
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                      What kind of gift feels just right?
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {styles.map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => setStyle(item.label)}
                      className={`rounded-2xl border p-4 text-left transition ${
                        style === item.label
                          ? "border-[#8b3026] bg-[#fff5e9] ring-1 ring-[#8b3026]"
                          : "border-[#eee3d8] hover:border-[#d8b9a3]"
                      }`}
                    >
                      <span className="text-2xl">{item.emoji}</span>
                      <span className="mt-3 block text-sm font-semibold text-[#54251f]">
                        {item.label}
                      </span>
                      {style === item.label && (
                        <Check size={15} className="mt-2 text-[#8b3026]" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={handleFindGifts}
                disabled={!canFindGifts}
                className="flex w-full items-center justify-center gap-3 rounded-full bg-[#8b3026] px-6 py-4 text-base font-bold text-white shadow-md transition hover:bg-[#68271f] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:min-w-64"
              >
                <Sparkles size={19} />
                Find My Perfect Gifts
                <ArrowRight size={18} />
              </button>

              {!canFindGifts && (
                <p className="text-sm text-gray-500">
                  Choose an occasion, recipient, and gift style to see your recommendations.
                </p>
              )}
            </div>

            {/* Side card */}
            <aside className="space-y-4 lg:sticky lg:top-40">
              <div className="rounded-3xl border border-[#f0dfca] bg-[#fff0dc] p-6">
                <span className="text-4xl">🎀</span>
                <h3 className="mt-4 text-xl font-bold text-[#54251f]">
                  The thought counts.
                </h3>
                <p className="mt-2 text-sm leading-6 text-[#806b61]">
                  A little something chosen with love can make an ordinary day unforgettable.
                </p>
              </div>

              <div className="rounded-3xl border border-[#f0dfca] bg-white p-6">
                <h3 className="font-bold text-[#54251f]">
                  Your gift preferences
                </h3>

                <div className="mt-4 space-y-4 text-sm">
                  <div className="flex justify-between gap-3">
                    <span className="text-gray-500">Occasion</span>
                    <span className="text-right font-semibold text-[#54251f]">
                      {occasion || "Not selected"}
                    </span>
                  </div>

                  <div className="flex justify-between gap-3">
                    <span className="text-gray-500">For</span>
                    <span className="font-semibold text-[#54251f]">
                      {recipient || "Not selected"}
                    </span>
                  </div>

                  <div className="flex justify-between gap-3">
                    <span className="text-gray-500">Budget</span>
                    <span className="font-semibold text-[#54251f]">
                      {budget === Infinity
                        ? "Any budget"
                        : `₹${budget.toLocaleString("en-IN")}`}
                    </span>
                  </div>

                  <div className="flex justify-between gap-3">
                    <span className="text-gray-500">Style</span>
                    <span className="text-right font-semibold text-[#54251f]">
                      {style || "Not selected"}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={resetFinder}
                  className="mt-6 flex items-center gap-2 text-sm font-semibold text-[#8b3026] hover:text-[#54251f]"
                >
                  <RotateCcw size={15} />
                  Start over
                </button>
              </div>
            </aside>
          </section>

          {/* Results */}
          {showResults && (
            <section
              id="gift-results"
              className="mt-16 scroll-mt-36"
            >
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-sm font-semibold text-[#b45324]">
                    <Sparkles size={16} />
                    Curated for you
                  </div>

                  <h2 className="mt-2 font-serif text-3xl font-bold text-[#54251f]">
                    Gifts picked with love
                  </h2>

                  <p className="mt-2 text-sm text-gray-500">
                    {occasion} · For {recipient} ·{" "}
                    {budget === Infinity
                      ? "Any budget"
                      : `Up to ₹${budget.toLocaleString("en-IN")}`}{" "}
                    · {style}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={resetFinder}
                  className="text-sm font-semibold text-[#8b3026] hover:text-[#54251f]"
                >
                  Change preferences
                </button>
              </div>

              {recommendations.length > 0 ? (
                <>
                  <p className="mt-4 text-sm text-gray-500">
                    Here are up to {recommendations.length} suggestions from the current Purv collection.
                  </p>

                  <div className="mt-7 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                    {recommendations.map((product) => (
                      <div key={product.id} className="relative">
                        <ProductCard product={product} />

                        <button
                          type="button"
                          onClick={() => handleAddToCart(product)}
                          className="mt-3 flex w-full items-center justify-center gap-2 rounded-full border border-[#8b3026] px-3 py-3 text-sm font-bold text-[#8b3026] transition hover:bg-[#8b3026] hover:text-white"
                        >
                          <ShoppingBag size={16} />
                          {addedId === product.id ? "Add again" : "Add to Cart"}
                        </button>

                        {addedId === product.id && (
                          <p className="mt-2 text-center text-xs font-semibold text-green-700">
                            Added to your cart
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="mt-7 rounded-3xl border border-[#f0dfca] bg-white p-8 text-center">
                  <span className="text-4xl">💝</span>
                  <h3 className="mt-4 text-xl font-bold text-[#54251f]">
                    No gifts found within this budget
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">
                    Try a higher budget or explore the complete collection.
                  </p>

                  <div className="mt-5 flex flex-wrap justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => setBudget(Infinity)}
                      className="rounded-full bg-[#8b3026] px-6 py-3 text-sm font-semibold text-white hover:bg-[#68271f]"
                    >
                      Show all budgets
                    </button>

                    <Link
                      to="/categories"
                      className="rounded-full border border-[#8b3026] px-6 py-3 text-sm font-semibold text-[#8b3026]"
                    >
                      Browse categories
                    </Link>
                  </div>
                </div>
              )}
            </section>
          )}
        </div>
      </main>
    </>
  );
}
