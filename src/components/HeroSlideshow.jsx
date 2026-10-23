import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Gift,
  Sparkles,
  Heart,
  Flower2,
} from "lucide-react";

const slides = [
  {
    eyebrow: "THE GIFTING EDIT",
    title: "Make every moment feel",
    highlight: "extra special.",
    description:
      "Discover thoughtful gifts, festive treasures and little luxuries for every occasion.",
    button: "Explore gifting",
    href: "/category/gift-hampers",
    secondary: "Explore collections",
    secondaryHref: "/categories",
    image:
      "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=1400&q=90",
    imageAlt: "Beautifully wrapped gift for a special occasion",
    note: "Little things. Lasting memories.",
    icon: Gift,
    background: "#641d32",
    accent: "#f8cb73",
  },
  {
    eyebrow: "YOUR BEAUTY MOMENT",
    title: "A little glow goes",
    highlight: "a long way.",
    description:
      "Discover beauty favourites, skincare essentials and finishing touches for your next celebration.",
    button: "Shop beauty",
    href: "/category/makeup",
    secondary: "Discover skincare",
    secondaryHref: "/category/skincare",
    image:
      "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=1400&q=90",
    imageAlt: "Beauty and makeup products",
    note: "Your routine. Your radiance.",
    icon: Sparkles,
    background: "#763449",
    accent: "#ffd0cf",
  },
  {
    eyebrow: "CELEBRATE YOUR WAY",
    title: "Traditions made",
    highlight: "beautiful.",
    description:
      "From glowing diyas to statement jewellery, bring a little magic to every celebration.",
    button: "Shop festive finds",
    href: "/category/diwali-decor",
    secondary: "Explore jewellery",
    secondaryHref: "/category/jewellery",
    image:
      "https://images.unsplash.com/photo-1606293926075-69a00dbfde81?auto=format&fit=crop&w=1400&q=90",
    imageAlt: "Traditional festive decoration",
    note: "Rooted in tradition. Made for you.",
    icon: Flower2,
    background: "#782b20",
    accent: "#ffd17a",
  },
  {
    eyebrow: "LITTLE JOYS, BIG LOVE",
    title: "Give them a reason",
    highlight: "to smile.",
    description:
      "Thoughtful surprises for birthdays, weddings, anniversaries and all the just-because moments.",
    button: "Find their gift",
    href: "/category/gift-hampers",
    secondary: "Browse collections",
    secondaryHref: "/categories",
    image:
      "https://images.unsplash.com/photo-1513201099705-a9746e1e201f?auto=format&fit=crop&w=1400&q=90",
    imageAlt: "Thoughtfully arranged gifts",
    note: "Every occasion deserves a little love.",
    icon: Heart,
    background: "#49304d",
    accent: "#f7c9d6",
  },
];

export default function HeroSlideshow() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return undefined;

    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % slides.length);
    }, 3000);

    return () => window.clearInterval(timer);
  }, [paused]);

  function previousSlide() {
    setActive(
      (current) => (current - 1 + slides.length) % slides.length
    );
  }

  function nextSlide() {
    setActive((current) => (current + 1) % slides.length);
  }

  return (
    <section
      aria-label="Purv featured offers"
      className="mx-auto mt-5 max-w-[1720px] px-3 pb-4 pt-1 sm:mt-6 sm:px-5 lg:px-8"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setPaused(false);
        }
      }}
    >
      <div
        className="relative isolate overflow-hidden rounded-[22px] shadow-[0_18px_45px_rgba(65,26,35,0.12)] sm:rounded-[28px]"
        style={{ backgroundColor: slides[active].background }}
      >
        {slides.map((slide, index) => {
          const Icon = slide.icon;
          const isActive = active === index;

          return (
            <div
              key={slide.eyebrow}
              aria-hidden={!isActive}
              className={`grid min-h-[390px] transition-opacity duration-700 md:min-h-[410px] lg:min-h-[430px] lg:grid-cols-[1.04fr_0.96fr] ${
                isActive
                  ? "relative opacity-100"
                  : "pointer-events-none absolute inset-0 opacity-0"
              }`}
            >
              {/* Left content */}
              <div
                className="relative z-10 flex flex-col justify-center overflow-hidden px-5 py-7 sm:px-8 sm:py-8 lg:px-10 lg:py-9 xl:px-12"
                style={{ backgroundColor: slide.background }}
              >
                <div className="pointer-events-none absolute -left-16 -top-16 h-64 w-64 rounded-full border border-white/10" />
                <div className="pointer-events-none absolute -left-8 -top-8 h-48 w-48 rounded-full border border-white/10" />

                <div className="relative max-w-xl">
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[10px] font-bold tracking-[0.16em] text-white sm:text-xs">
                    <Icon size={14} style={{ color: slide.accent }} />
                    {slide.eyebrow}
                  </span>

                  <h2 className="mt-4 text-[34px] font-semibold leading-[1.05] tracking-[-0.045em] text-white sm:text-4xl md:text-5xl xl:text-[54px]">
                    {slide.title}
                    <span
                      className="mt-1 block"
                      style={{
                        color: slide.accent,
                        fontFamily: "'Playfair Display', Georgia, serif",
                        fontStyle: "italic",
                      }}
                    >
                      {slide.highlight}
                    </span>
                  </h2>

                  <p className="mt-3 max-w-lg text-sm leading-6 text-white/80 sm:text-base sm:leading-7">
                    {slide.description}
                  </p>

                  <div className="mt-5 flex flex-wrap items-center gap-3">
                    <Link
                      to={slide.href}
                      tabIndex={isActive ? 0 : -1}
                      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold text-[#39211f] transition hover:-translate-y-0.5 hover:shadow-lg sm:px-6"
                      style={{ backgroundColor: slide.accent }}
                    >
                      {slide.button}
                      <ArrowRight size={16} />
                    </Link>

                    <Link
                      to={slide.secondaryHref}
                      tabIndex={isActive ? 0 : -1}
                      className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/35 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
                    >
                      {slide.secondary}
                    </Link>
                  </div>

                  <div className="mt-5 flex items-center gap-2 text-xs font-semibold text-white/85 sm:mt-6 sm:text-sm">
                    <Sparkles size={15} style={{ color: slide.accent }} />
                    {slide.note}
                  </div>
                </div>
              </div>

              {/* Right image */}
              <div className="relative min-h-[200px] overflow-hidden sm:min-h-[230px] lg:min-h-full">
                <img
                  src={slide.image}
                  alt={slide.imageAlt}
                  loading={index === 0 ? "eager" : "lazy"}
                  className="absolute inset-0 h-full w-full object-cover"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-white/5 lg:bg-gradient-to-r lg:from-black/10 lg:via-transparent lg:to-transparent" />

                <div className="absolute bottom-4 left-4 right-4 max-w-sm rounded-xl border border-white/60 bg-white/90 p-3 shadow-lg backdrop-blur-md sm:bottom-5 sm:left-5 sm:right-auto sm:min-w-[235px]">
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#791c2d]">
                    <Icon size={14} />
                    Purv moments
                  </div>

                  <p className="mt-1 text-sm font-bold text-[#48222b]">
                    {slide.note}
                  </p>
                </div>
              </div>
            </div>
          );
        })}

        {/* Dots and arrows */}
        <div className="absolute bottom-3 right-3 z-20 flex items-center gap-1.5 sm:bottom-4 sm:right-4 sm:gap-2">
          <div className="mr-1 flex items-center gap-1.5 rounded-full bg-black/25 px-2.5 py-2 backdrop-blur-sm">
            {slides.map((slide, index) => (
              <button
                key={slide.eyebrow}
                type="button"
                onClick={() => setActive(index)}
                aria-label={`Show campaign ${index + 1}: ${slide.eyebrow}`}
                aria-current={active === index ? "true" : undefined}
                className={`h-2 rounded-full transition-all duration-300 ${
                  active === index
                    ? "w-6 bg-white"
                    : "w-2 bg-white/55 hover:bg-white"
                }`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={previousSlide}
            aria-label="Previous campaign"
            className="grid h-8 w-8 place-items-center rounded-full border border-white/40 bg-black/20 text-white backdrop-blur-sm transition hover:bg-white hover:text-[#54251f] sm:h-9 sm:w-9"
          >
            <ArrowLeft size={16} />
          </button>

          <button
            type="button"
            onClick={nextSlide}
            aria-label="Next campaign"
            className="grid h-8 w-8 place-items-center rounded-full border border-white/40 bg-black/20 text-white backdrop-blur-sm transition hover:bg-white hover:text-[#54251f] sm:h-9 sm:w-9"
          >
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </section>
  );
}