
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { supabase } from "../lib/supabase";

const fallbackImage =
  "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=1200&q=85";

const fallbackBanners = [
  {
    id: "default-1",
    title: "Celebrate Every Tradition",
    subtitle: "Beautiful essentials for every sacred occasion.",
    button_text: "SHOP NOW",
    button_link: "/categories",
    image_url:
      "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=1200&q=85",
  },
  {
    id: "default-2",
    title: "Make Every Puja Special",
    subtitle: "Discover thoughtfully selected puja essentials.",
    button_text: "EXPLORE NOW",
    button_link: "/categories",
    image_url:
      "https://images.unsplash.com/photo-1606293926075-69a00dbfde81?auto=format&fit=crop&w=1200&q=85",
  },
  {
    id: "default-3",
    title: "Little Rituals, Big Blessings",
    subtitle: "Bring home the beauty of devotion.",
    button_text: "SHOP NOW",
    button_link: "/categories",
    image_url:
      "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=1200&q=85",
  },
  {
    id: "default-4",
    title: "Thoughtful Gifts, Happy Moments",
    subtitle: "Find beautiful gifts for your loved ones.",
    button_text: "EXPLORE GIFTS",
    button_link: "/category/gift-hampers",
    image_url:
      "https://images.unsplash.com/photo-1513201099705-a9746e1e201f?auto=format&fit=crop&w=1200&q=85",
  },
  {
    id: "default-5",
    title: "Bring Home Festive Magic",
    subtitle: "Add warmth and beauty to every celebration.",
    button_text: "DISCOVER MORE",
    button_link: "/categories",
    image_url:
      "https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?auto=format&fit=crop&w=1200&q=85",
  },
];

export default function HeroSlideshow() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activePage, setActivePage] = useState(0);
  const [visibleCards, setVisibleCards] = useState(3);
  const [paused, setPaused] = useState(false);

  const sliderRef = useRef(null);

  // Use Supabase banners, or fallback banners if none exist.
  const slides = banners.length > 0 ? banners : fallbackBanners;

  // Calculate how many cards should be visible.
  useEffect(() => {
    function updateVisibleCards() {
      if (window.innerWidth < 640) {
        setVisibleCards(1);
      } else if (window.innerWidth < 1024) {
        setVisibleCards(2);
      } else {
        setVisibleCards(3);
      }
    }

    updateVisibleCards();

    window.addEventListener("resize", updateVisibleCards);

    return () => {
      window.removeEventListener("resize", updateVisibleCards);
    };
  }, []);

  // Load active banners from Supabase.
  useEffect(() => {
    let mounted = true;

    async function loadBanners() {
      try {
        const { data, error } = await supabase
          .from("homepage_banners")
          .select(
            "id, title, subtitle, button_text, button_link, image_url, sort_order"
          )
          .eq("is_active", true)
          .order("sort_order", { ascending: true });

        if (error) throw error;

        if (mounted) {
          setBanners(data || []);
        }
      } catch (error) {
        console.error("Error loading homepage banners:", error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadBanners();

    const channel = supabase
      .channel("purv-homepage-banners")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "homepage_banners",
        },
        loadBanners
      )
      .subscribe();

    const handleFocus = () => loadBanners();

    window.addEventListener("focus", handleFocus);

    return () => {
      mounted = false;
      window.removeEventListener("focus", handleFocus);
      supabase.removeChannel(channel);
    };
  }, []);

  const totalPages = Math.max(
    1,
    Math.ceil(slides.length / visibleCards)
  );

  // Update active pagination when the slider moves.
  function handleScroll() {
    const slider = sliderRef.current;
    if (!slider) return;

    const page = Math.round(
      slider.scrollLeft / slider.clientWidth
    );

    setActivePage(Math.min(page, totalPages - 1));
  }

  // Move to a particular group of banners.
  function goToPage(page) {
    const slider = sliderRef.current;
    if (!slider) return;

    const nextPage = Math.max(
      0,
      Math.min(page, totalPages - 1)
    );

    slider.scrollTo({
      left: nextPage * slider.clientWidth,
      behavior: "smooth",
    });

    setActivePage(nextPage);
  }

  function previousSlide() {
    const nextPage =
      activePage === 0 ? totalPages - 1 : activePage - 1;

    goToPage(nextPage);
  }

  function nextSlide() {
    const nextPage =
      activePage >= totalPages - 1 ? 0 : activePage + 1;

    goToPage(nextPage);
  }

  // Automatic slideshow: changes banner group every 4 seconds.
  useEffect(() => {
    if (paused || totalPages <= 1) return;

    const timer = window.setInterval(() => {
      setActivePage((current) => {
        const next = current >= totalPages - 1 ? 0 : current + 1;

        const slider = sliderRef.current;

        if (slider) {
          slider.scrollTo({
            left: next * slider.clientWidth,
            behavior: "smooth",
          });
        }

        return next;
      });
    }, 4000);

    return () => window.clearInterval(timer);
  }, [paused, totalPages]);

  if (loading && banners.length === 0) {
    return (
      <section className="mx-auto max-w-[1720px] px-4 pt-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-[210px] animate-pulse rounded-2xl bg-[#f1e6d9]"
            />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section
      className="mx-auto max-w-[1720px] px-4 pb-5 pt-4 sm:px-6 lg:px-8"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setPaused(false);
        }
      }}
    >
      {/* Promotional banner slider */}
      <div
        ref={sliderRef}
        onScroll={handleScroll}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {slides.map((slide) => (
          <article
            key={slide.id}
            className="group relative h-[210px] min-w-full snap-start overflow-hidden rounded-2xl bg-[#f4e7d7] shadow-[0_7px_22px_rgba(65,26,35,0.09)] sm:h-[225px] sm:min-w-[calc(50%-8px)] lg:h-[245px] lg:min-w-[calc(33.333%-11px)]"
          >
            {/* Background image */}
            <img
              src={slide.image_url || fallbackImage}
              alt={slide.title || "Purv collection"}
              loading="lazy"
              onError={(event) => {
                event.currentTarget.src = fallbackImage;
              }}
              className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
            />

            {/* Image overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/30 to-transparent" />

            {/* Banner content */}
            <div className="relative z-10 flex h-full max-w-[85%] flex-col items-start justify-center px-5 py-5 sm:px-6 lg:px-7">
              <span className="mb-2 text-[9px] font-bold uppercase tracking-[0.18em] text-[#ffdc91] sm:text-[10px]">
                ✦ THE PURV COLLECTION
              </span>

              <h2 className="line-clamp-2 font-serif text-[25px] font-bold leading-[1.12] text-white sm:text-[27px] lg:text-[30px]">
                {slide.title}
              </h2>

              {slide.subtitle && (
                <p className="mt-2 line-clamp-2 max-w-[260px] text-[11px] leading-5 text-white/90 sm:text-xs">
                  {slide.subtitle}
                </p>
              )}

              <Link
                to={slide.button_link || "/categories"}
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-[10px] font-extrabold text-[#571a2c] shadow-md transition hover:-translate-y-0.5 hover:bg-[#ffda91] sm:text-[11px]"
              >
                {slide.button_text || "SHOP NOW"}
                <ArrowRight size={14} />
              </Link>
            </div>
          </article>
        ))}
      </div>

      {/* Navigation and pagination */}
      {totalPages > 1 && (
        <div className="mt-3 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={previousSlide}
            aria-label="Previous banners"
            className="grid h-8 w-8 place-items-center rounded-full border border-[#e8d9c9] bg-white text-[#76233a] shadow-sm transition hover:bg-[#76233a] hover:text-white"
          >
            <ArrowLeft size={15} />
          </button>

          <div className="flex items-center gap-1.5">
            <span className="rounded-full bg-[#4a4a4a] px-2.5 py-1 text-[10px] font-bold text-white">
              {activePage + 1}/{totalPages}
            </span>

            {Array.from({ length: totalPages }).map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => goToPage(index)}
                aria-label={`Show banner group ${index + 1}`}
                className={`h-2 rounded-full transition-all ${
                  activePage === index
                    ? "w-5 bg-[#76233a]"
                    : "w-2 bg-[#c8bdb5]"
                }`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={nextSlide}
            aria-label="Next banners"
            className="grid h-8 w-8 place-items-center rounded-full border border-[#e8d9c9] bg-white text-[#76233a] shadow-sm transition hover:bg-[#76233a] hover:text-white"
          >
            <ArrowRight size={15} />
          </button>
        </div>
      )}
    </section>
  );
}
