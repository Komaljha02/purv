import { Link } from "react-router-dom";
import {
  ArrowRight,
  ChevronRight,
  Gift,
  Sparkles,
  Tag,
  Heart,
  Flame,
  ShoppingBag,
  ShieldCheck,
  Gem,
} from "lucide-react";

import Header from "../components/Header";
import Footer from "../components/Footer";
import HeroSlideshow from "../components/HeroSlideshow";
import ProductCard from "../components/ProductCard";

import { categories } from "../data/categories";
import { products } from "../data/products";

const featuredProducts = products.slice(0, 8);

const topDeals = [...products]
  .filter(
    (product) =>
      Number(product.originalPrice) > Number(product.price)
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
  .slice(0, 8);

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

/* =========================================
   SECTION HEADING
========================================= */

function SectionHeading({
  title,
  subtitle,
  link = "/categories",
}) {
  return (
    <div className="mb-5 flex items-end justify-between gap-3">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-[#40252a] sm:text-2xl">
          {title}
        </h2>

        {subtitle && (
          <p className="mt-1 text-sm text-stone-500">
            {subtitle}
          </p>
        )}
      </div>

      <Link
        to={link}
        className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-[#791c2d] transition hover:text-[#a02b42]"
      >
        View all
        <ChevronRight size={17} />
      </Link>
    </div>
  );
}

/* =========================================
   CATEGORY SECTION
========================================= */

function CategorySection({ title, subtitle, items }) {
  if (!items.length) return null;

  return (
    <section className="mb-12">
      <SectionHeading
        title={title}
        subtitle={subtitle}
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6">
        {items.map((category) => (
          <Link
            key={category.id}
            to={`/category/${category.slug}`}
            className="group overflow-hidden rounded-2xl border border-[#eee5dc] bg-white transition duration-300 hover:-translate-y-1 hover:border-[#e5c9ad] hover:shadow-lg"
          >
            <div className="aspect-square overflow-hidden bg-[#f7eee5]">
              <img
                src={category.image}
                alt={category.name}
                loading="lazy"
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              />
            </div>

            <div className="px-2 py-3 text-center sm:px-3">
              <h3 className="text-xs font-bold leading-5 text-stone-800 sm:text-sm">
                {category.name}
              </h3>

              <span className="mt-1 inline-flex items-center text-[10px] font-semibold text-[#8b3026] sm:text-xs">
                Explore
                <ArrowRight size={12} className="ml-1" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

/* =========================================
   PRODUCT SECTION
========================================= */

function ProductSection({
  title,
  subtitle,
  items,
  link = "/categories",
}) {
  if (!items.length) return null;

  return (
    <section className="mb-12">
      <SectionHeading
        title={title}
        subtitle={subtitle}
        link={link}
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
        {items.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
          />
        ))}
      </div>
    </section>
  );
}

/* =========================================
   FEATURED CATEGORY CARDS
========================================= */

function FeaturedCategoryCards() {
  const featuredCategories = [
    {
      title: "Gift hampers",
      description:
        "Thoughtful surprises for your favourite people.",
      slug: "gift-hampers",
      icon: Gift,
      background: "bg-[#fff0d9]",
      iconColor: "text-[#a75b25]",
    },
    {
      title: "Festive décor",
      description:
        "Bring a little more glow into your home.",
      slug: "diwali-decor",
      icon: Flame,
      background: "bg-[#fbe6e5]",
      iconColor: "text-[#bd3542]",
    },
    {
      title: "Beauty finds",
      description:
        "Your little moment of everyday luxury.",
      slug: "makeup",
      icon: Sparkles,
      background: "bg-[#f0e8f8]",
      iconColor: "text-[#8748a0]",
    },
  ];

  return (
    <section className="mb-14">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {featuredCategories.map((category) => {
          const Icon = category.icon;

          return (
            <Link
              key={category.slug}
              to={`/category/${category.slug}`}
              className={`group relative min-h-[196px] overflow-hidden rounded-[30px] border border-white p-6 transition duration-300 hover:-translate-y-1 hover:shadow-xl sm:p-7 ${category.background}`}
            >
              {/* Decorative circle */}
              <div className="absolute -right-3 -top-8 h-40 w-40 rounded-full bg-white/50 transition-transform duration-500 group-hover:scale-110" />

              <div className="relative z-10 flex items-start justify-between">
                <div
                  className={`grid h-[62px] w-[62px] place-items-center rounded-[21px] bg-white/85 shadow-sm ${category.iconColor}`}
                >
                  <Icon size={27} strokeWidth={1.9} />
                </div>

                <ArrowRight
                  size={21}
                  className="mt-2 text-[#754a3c] transition-transform duration-300 group-hover:translate-x-1"
                />
              </div>

              <div className="relative z-10 mt-5">
                <h3 className="text-xl font-bold tracking-tight text-[#54251f]">
                  {category.title}
                </h3>

                <p className="mt-1 max-w-xs text-sm leading-6 text-stone-600">
                  {category.description}
                </p>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="mt-16 flex items-center gap-3">
        <span className="h-px w-7 bg-[#e9a05d]" />

        <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#bd5838]">
          Explore the collection
        </p>
      </div>
    </section>
  );
}

/* =========================================
   HOME PAGE
========================================= */

export default function Home() {
  const beautyCategories = categories.filter((category) =>
    beautySlugs.includes(category.slug)
  );

  const festiveCategories = categories.filter((category) =>
    festiveSlugs.includes(category.slug)
  );

  return (
    <div className="min-h-screen bg-[#fffaf6]">
      <Header />

      {/* Festive slideshow */}
      <HeroSlideshow />

      <main className="mx-auto max-w-[1720px] px-4 py-8 sm:px-6 lg:px-8">

        {/* Shopping benefits */}
        <section className="mb-10 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="flex items-center gap-3 rounded-2xl border border-[#f0e3d4] bg-white p-4">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#fff0d8] text-[#9a4a22]">
              <Gift size={21} />
            </div>

            <div>
              <h3 className="text-sm font-bold text-stone-800">
                Gifts for every moment
              </h3>

              <p className="mt-1 text-xs text-stone-500">
                Thoughtful picks for every occasion
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-[#f0e3d4] bg-white p-4">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#fbe7e9] text-[#8b3026]">
              <Sparkles size={21} />
            </div>

            <div>
              <h3 className="text-sm font-bold text-stone-800">
                Beauty & festive finds
              </h3>

              <p className="mt-1 text-xs text-stone-500">
                Little luxuries to love
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-[#f0e3d4] bg-white p-4">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#f2e8f5] text-[#714273]">
              <Heart size={21} />
            </div>

            <div>
              <h3 className="text-sm font-bold text-stone-800">
                Selected with care
              </h3>

              <p className="mt-1 text-xs text-stone-500">
                Discover something special
              </p>
            </div>
          </div>
        </section>

        {/* New large pastel category cards */}
        <FeaturedCategoryCards />

        {/* Deals */}
        <section className="mb-12 rounded-3xl border border-[#f0dfc9] bg-gradient-to-r from-[#fff0d8] via-[#fff8ed] to-[#fbe7e9] p-4 sm:p-6 lg:p-8">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#791c2d] text-white">
                <Tag size={21} />
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#8b3026]">
                  The Purv edit
                </p>

                <h2 className="mt-1 text-xl font-bold text-[#54251f] sm:text-2xl">
                  Offers worth discovering
                </h2>
              </div>
            </div>

            <Link
              to="/categories"
              className="hidden items-center gap-1 text-sm font-semibold text-[#791c2d] sm:inline-flex"
            >
              Shop all
              <ArrowRight size={16} />
            </Link>
          </div>

          {topDeals.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
              {topDeals.slice(0, 4).map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-stone-600">
              New offers are being prepared. Explore our latest collections.
            </p>
          )}
        </section>

        {/* Beauty categories */}
        <CategorySection
          title="Your beauty shelf"
          subtitle="Beauty, skincare and everyday self-care essentials."
          items={beautyCategories}
        />

        {/* Festive categories */}
        <CategorySection
          title="Celebrate beautifully"
          subtitle="Traditional treasures and festive favourites for every season."
          items={festiveCategories}
        />

        {/* Featured products */}
        <ProductSection
          title="Favourites to fall for"
          subtitle="Discover a few of our featured picks."
          items={featuredProducts}
        />

        {/* More products */}
        <ProductSection
          title="More to love"
          subtitle="Explore more finds from the Purv collection."
          items={products.slice(8, 16)}
        />

        {/* Brand promise */}
        <section className="mb-10 rounded-3xl border border-[#eee1d5] bg-white px-5 py-8 text-center sm:px-10 sm:py-10">
          <Sparkles
            className="mx-auto text-[#a45a35]"
            size={28}
          />

          <h2 className="mt-3 text-2xl font-bold text-[#54251f] sm:text-3xl">
            Little moments. Beautifully celebrated.
          </h2>

          <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-stone-500">
            From everyday beauty to meaningful gifts and festive traditions,
            discover collections made to bring a little joy to every occasion.
          </p>

          <Link
            to="/categories"
            className="mt-5 inline-flex items-center gap-2 font-bold text-[#791c2d] hover:text-[#a02b42]"
          >
            Explore all collections
            <ArrowRight size={17} />
          </Link>
        </section>
      </main>

      {/* Footer is maintained in its own component */}
      <Footer />
    </div>
  );
}