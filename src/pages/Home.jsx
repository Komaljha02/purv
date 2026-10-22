import { Link } from "react-router-dom";
import {
  ArrowRight,
  ChevronRight,
  Sparkles,
  Gift,
  Flame,
  ShoppingBasket,
  Heart,
  Flower2,
  Star,
  PartyPopper,
  ShieldCheck,
  PackageCheck,
  CircleCheck,
  WandSparkles,
  Gem,
  ShoppingBag,
} from "lucide-react";

import Header from "../components/Header";
import ProductCard from "../components/ProductCard";
import { categories } from "../data/categories";
import { products } from "../data/products";

const beautySlugs = [
  "makeup",
  "skincare",
  "haircare",
  "fragrances",
  "nail-studio",
  "bath-body",
];

const festiveSlugs = [
  "rakhi",
  "diwali-decor",
  "pooja-items",
  "gift-hampers",
  "jewellery",
  "ethnic-accessories",
];

const categoryColors = [
  "#f9e3e7",
  "#fce9d2",
  "#eee5f7",
  "#e5efdf",
  "#f9e5d9",
  "#e3edf7",
];

function SectionHeading({
  eyebrow,
  title,
  subtitle,
  link = "/categories",
  linkText = "Explore all",
}) {
  return (
    <div className="mb-6 flex items-end justify-between gap-3 sm:mb-8">
      <div className="min-w-0">
        {eyebrow && (
          <p className="mb-2 flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[2.5px] text-[#b45a36] sm:text-xs">
            <span className="h-px w-5 bg-[#d9a24c]" />
            {eyebrow}
          </p>
        )}

        <h2 className="font-serif text-2xl font-bold leading-tight tracking-tight text-[#421521] sm:text-3xl lg:text-4xl">
          {title}
        </h2>

        {subtitle && (
          <p className="mt-2 max-w-2xl text-xs leading-6 text-[#81716e] sm:text-sm">
            {subtitle}
          </p>
        )}
      </div>

      <Link
        to={link}
        className="group flex shrink-0 items-center gap-1.5 rounded-full border border-[#ead9d3] bg-white px-3 py-2 text-[10px] font-extrabold text-[#76233a] transition hover:border-[#76233a] hover:bg-[#fff5f3] sm:px-4 sm:text-xs"
      >
        {linkText}
        <ChevronRight
          size={15}
          className="transition-transform group-hover:translate-x-0.5"
        />
      </Link>
    </div>
  );
}

function CategorySection({
  title,
  subtitle,
  items,
  festive = false,
}) {
  if (!items.length) return null;

  return (
    <section className="mx-auto max-w-[1440px] px-4 py-9 sm:px-6 sm:py-12 lg:px-8 lg:py-14">
      <SectionHeading
        eyebrow={festive ? "Made for celebrations" : "Explore the collection"}
        title={title}
        subtitle={subtitle}
      />

      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 sm:gap-5 md:grid-cols-6 lg:grid-cols-8">
        {items.map((category, index) => (
          <Link
            key={category.id ?? category.slug}
            to={`/category/${category.slug}`}
            className="group min-w-0 text-center"
          >
            <div
              className="relative mx-auto aspect-[4/4.5] w-full overflow-hidden rounded-[20px] border border-black/[0.025] sm:rounded-[26px]"
              style={{
                backgroundColor:
                  categoryColors[index % categoryColors.length],
              }}
            >
              {category.image ? (
                <img
                  src={category.image}
                  alt={category.name}
                  loading="lazy"
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <Sparkles
                    size={30}
                    className="text-[#76233a]"
                  />
                </div>
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-[#421521]/20 via-transparent to-white/10 opacity-60 transition group-hover:opacity-30" />

              <div className="absolute bottom-2 right-2 grid h-7 w-7 translate-y-2 place-items-center rounded-full bg-white/95 text-[#76233a] opacity-0 shadow-sm transition duration-300 group-hover:translate-y-0 group-hover:opacity-100 sm:bottom-3 sm:right-3 sm:h-8 sm:w-8">
                <ArrowRight size={15} />
              </div>
            </div>

            <p className="mt-3 line-clamp-2 min-h-8 text-[11px] font-bold leading-4 text-[#49252d] transition group-hover:text-[#b34c48] sm:text-sm">
              {category.name}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}

function ProductShelf({
  title,
  subtitle,
  items,
  eyebrow,
  link = "/categories",
  background = false,
}) {
  return (
    <section
      className={
        background
          ? "border-y border-[#f0ded6] bg-gradient-to-b from-[#fff0e9] via-[#fff8f3] to-[#fffaf5]"
          : ""
      }
    >
      <div className="mx-auto max-w-[1440px] px-4 py-9 sm:px-6 sm:py-12 lg:px-8 lg:py-14">
        <SectionHeading
          eyebrow={eyebrow}
          title={title}
          subtitle={subtitle}
          link={link}
        />

        {items.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {items.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-[#e7d2cb] bg-white p-8 text-center">
            <Gift
              size={30}
              className="mx-auto text-[#a34852]"
            />
            <p className="mt-3 font-bold text-[#421521]">
              Something lovely is on its way
            </p>
            <p className="mt-1 text-sm text-[#81716e]">
              Add more products to your collection to see them here.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

function QuickShopCard({
  to,
  title,
  subtitle,
  icon: Icon,
  background,
  iconColor,
}) {
  return (
    <Link
      to={to}
      className={`group relative isolate min-w-0 overflow-hidden rounded-[22px] border border-white/80 ${background} p-4 shadow-[0_5px_20px_rgba(66,21,33,0.04)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_15px_32px_rgba(66,21,33,0.10)] sm:rounded-[26px] sm:p-6`}
    >
      <div className="absolute -right-7 -top-7 -z-10 h-24 w-24 rounded-full bg-white/50 transition duration-500 group-hover:scale-150 sm:h-32 sm:w-32" />

      <div className="flex items-start justify-between gap-2">
        <div
          className={`grid h-10 w-10 place-items-center rounded-2xl bg-white/80 ${iconColor} shadow-sm sm:h-12 sm:w-12`}
        >
          <Icon size={22} />
        </div>

        <ArrowRight
          size={17}
          className="mt-1 text-[#6b4549] transition duration-300 group-hover:translate-x-1"
        />
      </div>

      <h3 className="mt-4 text-sm font-extrabold leading-5 text-[#421521] sm:text-lg">
        {title}
      </h3>

      <p className="mt-1 hidden text-xs leading-5 text-[#79666a] sm:block">
        {subtitle}
      </p>
    </Link>
  );
}

export default function Home() {
  const beautyCategories = categories.filter((category) =>
    beautySlugs.includes(category.slug)
  );

  const festiveCategories = categories.filter((category) =>
    festiveSlugs.includes(category.slug)
  );

  const featuredProducts = products.slice(0, 6);

  const topDeals = [...products]
    .filter(
      (product) =>
        Number(product.originalPrice) > Number(product.price) &&
        Number(product.originalPrice) > 0
    )
    .sort((a, b) => {
      const discountA =
        (Number(a.originalPrice) - Number(a.price)) /
        Number(a.originalPrice);

      const discountB =
        (Number(b.originalPrice) - Number(b.price)) /
        Number(b.originalPrice);

      return discountB - discountA;
    })
    .slice(0, 6);

  const beautyProducts = products
    .filter((product) => beautySlugs.includes(product.categorySlug))
    .slice(0, 6);

  const festiveProducts = products
    .filter((product) => festiveSlugs.includes(product.categorySlug))
    .slice(0, 6);

  return (
    <div className="min-h-screen overflow-x-clip bg-[#fffaf5] text-[#29201f]">
      <Header />

      <main className="pt-36 sm:pt-40">
        {/* TOP SHOPPING STRIP */}
        <section className="border-b border-[#f0e3dc] bg-white">
          <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#f9e8e6] text-[#76233a]">
                <ShoppingBasket size={19} />
              </div>

              <div className="min-w-0">
                <p className="text-xs font-extrabold text-[#421521] sm:text-sm">
                  Your celebrations, all in one place
                </p>
                <p className="mt-0.5 text-[10px] text-[#81716e] sm:text-xs">
                  Beauty · Rituals · Décor · Gifting
                </p>
              </div>
            </div>

            <Link
              to="/categories"
              className="flex shrink-0 items-center gap-1 text-xs font-extrabold text-[#76233a] transition hover:text-[#c05a48]"
            >
              Shop all
              <ArrowRight size={14} />
            </Link>
          </div>
        </section>

        {/* PREMIUM HERO */}
        <section className="mx-auto max-w-[1440px] px-3 pt-4 sm:px-6 sm:pt-6 lg:px-8">
          <div className="relative isolate overflow-hidden rounded-[26px] bg-[#421521] shadow-[0_18px_55px_rgba(66,21,33,0.14)] sm:rounded-[34px]">
            <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full border border-[#f4d19b]/20 sm:h-96 sm:w-96" />
            <div className="absolute -left-12 -top-12 h-52 w-52 rounded-full border border-[#f4d19b]/20 sm:h-72 sm:w-72" />
            <div className="absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-[#b54b4d]/30 blur-3xl" />
            <div className="absolute right-0 top-0 -z-10 h-full w-full bg-gradient-to-br from-[#421521] via-[#672039] to-[#8b3543]" />

            <div className="relative grid min-h-[470px] items-center md:min-h-[470px] md:grid-cols-[1fr_0.88fr] lg:min-h-[540px]">
              <div className="relative z-10 px-6 py-10 sm:px-10 sm:py-12 lg:px-14 lg:py-16">
                <div className="inline-flex items-center gap-2 rounded-full border border-[#f3d5a2]/30 bg-white/[0.08] px-3.5 py-2 text-[10px] font-bold uppercase tracking-[1.8px] text-[#f8d9a2] sm:text-xs">
                  <Sparkles size={14} />
                  A little more festive
                </div>

                <h1 className="mt-6 max-w-2xl font-serif text-4xl font-bold leading-[1.12] tracking-[-1.5px] text-[#fffaf5] sm:text-5xl lg:text-[64px]">
                  Make every
                  <br />
                  moment feel
                  <br />
                  <span className="text-[#f5c66f]">extra special.</span>
                </h1>

                <p className="mt-5 max-w-md text-sm leading-7 text-white/75 sm:text-base">
                  Discover beauty favourites, festive décor,
                  traditional treasures and thoughtful gifts
                  for all the moments worth celebrating.
                </p>

                <div className="mt-7 flex flex-wrap gap-3">
                  <Link
                    to="/categories"
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#f5c66f] px-6 py-3 text-xs font-extrabold text-[#421521] shadow-lg shadow-black/10 transition hover:-translate-y-0.5 hover:bg-[#ffdc93] sm:text-sm"
                  >
                    Explore the collection
                    <ArrowRight size={16} />
                  </Link>

                  <Link
                    to="/gift-finder"
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/25 bg-white/[0.08] px-5 py-3 text-xs font-bold text-white transition hover:bg-white/[0.15] sm:text-sm"
                  >
                    <WandSparkles size={16} />
                    Find a gift
                  </Link>
                </div>

                <div className="mt-8 flex flex-wrap gap-x-5 gap-y-3 text-[10px] font-semibold text-white/70 sm:text-xs">
                  <span className="flex items-center gap-2">
                    <Flower2 size={15} className="text-[#f5c66f]" />
                    Inspired by traditions
                  </span>
                  <span className="flex items-center gap-2">
                    <Heart size={15} className="text-[#f5c66f]" />
                    Picked with care
                  </span>
                </div>
              </div>

              <div className="relative min-h-[240px] overflow-hidden md:absolute md:inset-y-0 md:right-0 md:h-full md:w-[47%]">
                <img
                  src="https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=1100&q=85"
                  alt="Beautifully wrapped gifts for a special celebration"
                  fetchPriority="high"
                  className="absolute inset-0 h-full w-full object-cover object-center"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-[#421521]/65 via-[#421521]/10 to-transparent md:bg-gradient-to-r md:from-[#672039]/50 md:via-transparent md:to-transparent" />

                <div className="absolute bottom-5 left-5 rounded-2xl border border-white/30 bg-white/90 px-4 py-3 shadow-xl backdrop-blur-md sm:bottom-7 sm:left-7">
                  <div className="flex items-center gap-2 text-[#76233a]">
                    <Star size={15} fill="currentColor" />
                    <span className="text-[10px] font-extrabold uppercase tracking-wider">
                      The gifting edit
                    </span>
                  </div>
                  <p className="mt-1 text-xs font-bold text-[#421521] sm:text-sm">
                    Little things. Lasting memories.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* QUICK COLLECTIONS */}
        <section className="mx-auto max-w-[1440px] px-4 pt-6 sm:px-6 sm:pt-8 lg:px-8">
          <div className="grid grid-cols-3 gap-3 sm:gap-5">
            <QuickShopCard
              to="/category/gift-hampers"
              title="Gift hampers"
              subtitle="Thoughtful surprises for your favourite people."
              icon={Gift}
              background="bg-[#fff0d8]"
              iconColor="text-[#9c5927]"
            />

            <QuickShopCard
              to="/category/diwali-decor"
              title="Festive décor"
              subtitle="Bring a little more glow into your home."
              icon={Flame}
              background="bg-[#fbe5e3]"
              iconColor="text-[#a43d46]"
            />

            <QuickShopCard
              to="/category/makeup"
              title="Beauty finds"
              subtitle="Your little moment of everyday luxury."
              icon={Sparkles}
              background="bg-[#f0e8f8]"
              iconColor="text-[#7c478f]"
            />
          </div>
        </section>

        {/* CATEGORIES */}
        <CategorySection
          title="Find your kind of lovely"
          subtitle="A little something for every mood, ritual and celebration."
          items={categories}
        />

        {/* DEALS */}
        <ProductShelf
          eyebrow="A little treat for less"
          title="Lovely finds, better prices"
          subtitle="Explore selected favourites at special prices."
          items={topDeals}
          background
        />

        {/* BEAUTY */}
        <CategorySection
          title="Your beauty ritual"
          subtitle="From everyday essentials to your festive-glam favourites."
          items={beautyCategories}
        />

        {beautyProducts.length > 0 && (
          <ProductShelf
            eyebrow="Your beauty shelf"
            title="Glow in your own way"
            subtitle="Beauty and self-care picks for your everyday rituals."
            items={beautyProducts}
          />
        )}

        {/* GIFT FINDER PROMO */}
        <section className="mx-auto max-w-[1440px] px-3 py-5 sm:px-6 sm:py-8 lg:px-8">
          <div className="relative isolate overflow-hidden rounded-[28px] bg-[#f5e8e4] sm:rounded-[34px]">
            <div className="absolute -right-12 -top-16 -z-10 h-56 w-56 rounded-full bg-[#e7c0b9]/60 blur-2xl sm:h-80 sm:w-80" />
            <div className="absolute -bottom-24 left-1/3 -z-10 h-56 w-56 rounded-full bg-[#f5c66f]/30 blur-2xl" />

            <div className="grid items-center gap-7 p-6 sm:p-10 md:grid-cols-[1fr_auto] md:p-12 lg:p-14">
              <div className="max-w-2xl">
                <p className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[2.5px] text-[#a14a4c] sm:text-xs">
                  <WandSparkles size={16} />
                  Meet your gifting sidekick
                </p>

                <h2 className="mt-4 font-serif text-3xl font-bold leading-tight text-[#421521] sm:text-4xl lg:text-5xl">
                  Not sure what to gift?
                  <br />
                  <span className="text-[#a34852]">
                    We’ll help you find it.
                  </span>
                </h2>

                <p className="mt-4 max-w-xl text-sm leading-6 text-[#765d5d] sm:text-base sm:leading-7">
                  Tell us the occasion, who you’re shopping for
                  and your budget. Discover thoughtful ideas
                  tailored to your celebration.
                </p>

                <Link
                  to="/gift-finder"
                  className="mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#76233a] px-6 py-3 text-xs font-extrabold text-white shadow-lg shadow-[#76233a]/15 transition hover:-translate-y-0.5 hover:bg-[#421521] sm:text-sm"
                >
                  Find my perfect gift
                  <ArrowRight size={16} />
                </Link>
              </div>

              <div className="hidden md:flex md:justify-center">
                <div className="relative grid h-48 w-48 place-items-center rounded-full border border-[#d6aaa3] bg-white/60 sm:h-56 sm:w-56">
                  <div className="absolute inset-4 rounded-full border border-dashed border-[#c88c86]" />
                  <div className="grid h-28 w-28 place-items-center rounded-[30px] bg-[#76233a] text-[#f5c66f] shadow-xl shadow-[#76233a]/20 sm:h-32 sm:w-32">
                    <Gift size={56} strokeWidth={1.4} />
                  </div>
                  <div className="absolute right-2 top-5 grid h-10 w-10 place-items-center rounded-full bg-[#f5c66f] text-[#76233a] shadow-md">
                    <Sparkles size={19} />
                  </div>
                  <div className="absolute bottom-5 left-1 grid h-10 w-10 place-items-center rounded-full bg-white text-[#a34852] shadow-md">
                    <Heart size={19} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FESTIVE COLLECTION */}
        <div className="border-y border-[#f0ded6] bg-white">
          <CategorySection
            title="Celebrate the Indian way"
            subtitle="Traditional touches, glowing décor and gifts made for sharing joy."
            items={festiveCategories}
            festive
          />
        </div>

        {festiveProducts.length > 0 && (
          <ProductShelf
            eyebrow="Made for special moments"
            title="Festive favourites"
            subtitle="Thoughtful little details to make your celebrations feel complete."
            items={festiveProducts}
          />
        )}

        {/* POPULAR PICKS */}
        <ProductShelf
          eyebrow="A few things we love"
          title="Your next favourite might be here"
          subtitle="Explore more picks for yourself, your home and your loved ones."
          items={featuredProducts}
        />

        {/* BRAND STORY */}
        <section className="mx-auto max-w-[1440px] px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
          <div className="mb-8 text-center">
            <p className="text-[10px] font-extrabold uppercase tracking-[2.5px] text-[#b45a36] sm:text-xs">
              The Purv feeling
            </p>

            <h2 className="mt-3 font-serif text-3xl font-bold text-[#421521] sm:text-4xl">
              Little details. Lots of joy.
            </h2>

            <p className="mx-auto mt-3 max-w-xl text-xs leading-6 text-[#81716e] sm:text-sm">
              A thoughtful collection for your beauty rituals,
              meaningful traditions and the people who make
              every moment special.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-[24px] border border-[#f0e3dc] bg-white p-5 transition hover:-translate-y-1 hover:shadow-lg hover:shadow-[#421521]/5 sm:p-6">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#f9e7e6] text-[#76233a]">
                <ShoppingBag size={23} />
              </div>
              <h3 className="mt-5 text-sm font-extrabold text-[#421521] sm:text-base">
                Your favourites, together
              </h3>
              <p className="mt-2 text-xs leading-6 text-[#81716e] sm:text-sm">
                Browse beauty, décor, jewellery and gifting
                collections in one place.
              </p>
            </div>

            <div className="rounded-[24px] border border-[#f0e3dc] bg-white p-5 transition hover:-translate-y-1 hover:shadow-lg hover:shadow-[#421521]/5 sm:p-6">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#fff0d8] text-[#a65b27]">
                <ShieldCheck size={23} />
              </div>
              <h3 className="mt-5 text-sm font-extrabold text-[#421521] sm:text-base">
                Simple shopping
              </h3>
              <p className="mt-2 text-xs leading-6 text-[#81716e] sm:text-sm">
                Explore products, save favourites and move
                through your shopping journey with ease.
              </p>
            </div>

            <div className="rounded-[24px] border border-[#f0e3dc] bg-white p-5 transition hover:-translate-y-1 hover:shadow-lg hover:shadow-[#421521]/5 sm:p-6">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#eee7f8] text-[#7b4c91]">
                <Gem size={23} />
              </div>
              <h3 className="mt-5 text-sm font-extrabold text-[#421521] sm:text-base">
                Made for meaningful moments
              </h3>
              <p className="mt-2 text-xs leading-6 text-[#81716e] sm:text-sm">
                Find little luxuries and thoughtful surprises
                for the people you care about.
              </p>
            </div>
          </div>
        </section>

        {/* SHOPPING BENEFITS */}
        <section className="border-y border-[#f0ded6] bg-[#fff3ed]">
          <div className="mx-auto grid max-w-[1440px] grid-cols-1 gap-5 px-4 py-6 sm:grid-cols-3 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center gap-3 sm:justify-start">
              <PackageCheck
                size={23}
                className="shrink-0 text-[#76233a]"
              />
              <div>
                <p className="text-xs font-extrabold text-[#421521] sm:text-sm">
                  Easy order management
                </p>
                <p className="mt-1 text-[10px] text-[#81716e] sm:text-xs">
                  Keep track of your orders
                </p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3">
              <Heart
                size={23}
                className="shrink-0 text-[#76233a]"
              />
              <div>
                <p className="text-xs font-extrabold text-[#421521] sm:text-sm">
                  Keep your favourites close
                </p>
                <p className="mt-1 text-[10px] text-[#81716e] sm:text-xs">
                  Save products to your wishlist
                </p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 sm:justify-end">
              <CircleCheck
                size={23}
                className="shrink-0 text-[#76233a]"
              />
              <div>
                <p className="text-xs font-extrabold text-[#421521] sm:text-sm">
                  A simple shopping journey
                </p>
                <p className="mt-1 text-[10px] text-[#81716e] sm:text-xs">
                  From browsing to checkout
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-[#ead9d3] bg-[#421521] text-white">
        <div className="mx-auto max-w-[1440px] px-4 py-9 sm:px-6 sm:py-12 lg:px-8">
          <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <Link
                to="/"
                className="font-serif text-4xl font-bold tracking-[-2px] text-white"
              >
                purv<span className="text-[#f5c66f]">.</span>
              </Link>

              <p className="mt-2 text-xs font-semibold text-white/70">
                Beauty · Rituals · Gifting
              </p>

              <p className="mt-3 text-xs text-white/50">
                A little joy for every celebration.
              </p>
            </div>

            <div>
              <h3 className="mb-4 text-xs font-extrabold uppercase tracking-[1.8px] text-[#f5c66f]">
                Explore Purv
              </h3>

              <div className="grid grid-cols-2 gap-x-10 gap-y-3 text-xs text-white/75">
                <Link to="/categories" className="transition hover:text-[#f5c66f]">
                  All categories
                </Link>
                <Link to="/gift-finder" className="transition hover:text-[#f5c66f]">
                  Gift Finder
                </Link>
                <Link to="/wishlist" className="transition hover:text-[#f5c66f]">
                  Wishlist
                </Link>
                <Link to="/orders" className="transition hover:text-[#f5c66f]">
                  My orders
                </Link>
                <Link to="/profile" className="transition hover:text-[#f5c66f]">
                  My profile
                </Link>
                <Link to="/cart" className="transition hover:text-[#f5c66f]">
                  Shopping cart
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-2 border-t border-white/15 pt-5 text-[10px] text-white/45 sm:flex-row sm:items-center sm:justify-between">
            <p>© {new Date().getFullYear()} Purv. All rights reserved.</p>
            <p>Celebrating life’s little moments.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}