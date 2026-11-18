
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Sparkles,
  Grid2X2,
  RefreshCw,
  Flower2,
} from "lucide-react";

import Header from "../components/Header";
import { supabase } from "../lib/supabase";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Always fetch the latest category order from Supabase.
  const loadCategories = useCallback(async () => {
    setError("");

    const { data, error: fetchError } = await supabase
      .from("store_categories")
      .select("*")
      .is("parent_id", null)
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true });

    if (fetchError) {
      console.error("Category loading error:", fetchError);
      setError("We couldn't load the categories. Please try again.");
      setLoading(false);
      return;
    }

    // Keep the database order, with name as a fallback for equal sort_order.
    const sortedCategories = [...(data || [])].sort((a, b) => {
      const orderDifference =
        Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0);

      return orderDifference || a.name.localeCompare(b.name);
    });

    setCategories(sortedCategories);
    setLoading(false);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchCategories = async () => {
      setError("");

      const { data, error: fetchError } = await supabase
        .from("store_categories")
        .select("*")
        .is("parent_id", null)
        .eq("is_active", true)
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true });

      if (!isMounted) return;

      if (fetchError) {
        console.error("Category loading error:", fetchError);
        setError("We couldn't load the categories. Please try again.");
      } else {
        const sortedCategories = [...(data || [])].sort((a, b) => {
          const orderDifference =
            Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0);

          return orderDifference || a.name.localeCompare(b.name);
        });

        setCategories(sortedCategories);
      }

      setLoading(false);
    };

    fetchCategories();

    // Refresh when admin changes category data in Supabase.
    const channel = supabase
      .channel("customer-store-categories")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "store_categories",
        },
        () => {
          if (isMounted) loadCategories();
        }
      )
      .subscribe();

    // Refresh when the customer returns to this browser tab.
    const handleFocus = () => {
      if (isMounted) loadCategories();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && isMounted) {
        loadCategories();
      }
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      isMounted = false;
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );
      supabase.removeChannel(channel);
    };
  }, [loadCategories]);

  const getCategoryStyle = (name = "") => {
    const value = name.toLowerCase();

    if (value.includes("jewellery") || value.includes("jewelry")) {
      return {
        icon: "✦",
        subtitle: "Little golden details",
        background: "from-[#f8e8dc] to-[#f4d5c4]",
      };
    }

    if (value.includes("beauty") || value.includes("makeup")) {
      return {
        icon: "✿",
        subtitle: "A little beauty, every day",
        background: "from-[#f8e0e7] to-[#f4cbd7]",
      };
    }

    if (value.includes("pooja") || value.includes("puja")) {
      return {
        icon: "ॐ",
        subtitle: "Bring home the blessings",
        background: "from-[#f9e9c9] to-[#f3d6a4]",
      };
    }

    if (value.includes("diwali") || value.includes("decor")) {
      return {
        icon: "✧",
        subtitle: "Bring home the festive glow",
        background: "from-[#f8dfc6] to-[#efc49f]",
      };
    }

    if (value.includes("gift") || value.includes("combo")) {
      return {
        icon: "🎁",
        subtitle: "Thoughtful gifts, beautifully wrapped",
        background: "from-[#f3dfe5] to-[#e9c6d2]",
      };
    }

    if (value.includes("havan")) {
      return {
        icon: "✺",
        subtitle: "Sacred essentials for every ritual",
        background: "from-[#f6e4c9] to-[#ebc99e]",
      };
    }

    return {
      icon: "✧",
      subtitle: "Explore something beautiful",
      background: "from-[#f7e8e5] to-[#edd5d0]",
    };
  };

  return (
    <div className="min-h-screen bg-[#fffaf5]">
      <Header />

      <main className="mx-auto max-w-[1440px] px-4 pb-16 pt-8 sm:px-6 lg:px-10">
        {/* Page heading */}
        <section className="mb-8">
          <div className="mb-3 flex items-center gap-2 text-sm text-[#927b76]">
            <Link to="/" className="transition hover:text-[#76233a]">
              Home
            </Link>
            <span>/</span>
            <span className="font-medium text-[#76233a]">Categories</span>
          </div>

          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-[#b47752]">
                <Sparkles size={15} />
                The Purv collection
              </div>

              <h1 className="font-serif text-3xl font-semibold text-[#421521] sm:text-4xl lg:text-5xl">
                Shop by category<span className="text-[#ed9b28]">.</span>
              </h1>

             <p className="mt-3 w-full text-sm leading-6 text-[#806e69] whitespace-normal lg:whitespace-nowrap">
  Discover thoughtful essentials, festive favourites and beautiful little details for every occasion.
</p>
            </div>

            {!loading && !error && (
              <div className="flex items-center gap-2 text-sm text-[#806e69]">
                <Grid2X2 size={17} className="text-[#a56a50]" />
                <span>
                  {categories.length}{" "}
                  {categories.length === 1 ? "category" : "categories"}
                </span>
              </div>
            )}
          </div>
        </section>


        {/* Loading state */}
        {loading && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="animate-pulse overflow-hidden rounded-2xl border border-[#f0e4df] bg-white"
              >
                <div className="aspect-[1.25/1] bg-[#f2e8e4]" />
                <div className="space-y-2 p-4">
                  <div className="h-4 w-3/4 rounded bg-[#f2e8e4]" />
                  <div className="h-3 w-1/2 rounded bg-[#f2e8e4]" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div className="rounded-2xl border border-[#f0d8d5] bg-white px-5 py-12 text-center">
            <p className="text-base font-semibold text-[#421521]">{error}</p>
            <button
              onClick={loadCategories}
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#76233a] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#421521]"
            >
              <RefreshCw size={15} />
              Try again
            </button>
          </div>
        )}

        {/* Category grid */}
        {!loading && !error && categories.length > 0 && (
          <section>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 xl:grid-cols-5">
              {categories.map((category) => {
                const style = getCategoryStyle(category.name);

                return (
                  <Link
                    key={category.id}
                    to={`/category/${category.slug}`}
                    className="group overflow-hidden rounded-2xl border border-[#f0e4df] bg-white shadow-[0_5px_20px_rgba(75,35,35,0.04)] transition duration-300 hover:-translate-y-1 hover:border-[#e8c8c1] hover:shadow-[0_14px_30px_rgba(75,35,35,0.10)]"
                  >
                    <div
                      className={`relative aspect-[1.25/1] overflow-hidden bg-gradient-to-br ${style.background}`}
                    >
                      {category.image_url ? (
                        <img
                          src={category.image_url}
                          alt={category.name}
                          loading="lazy"
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <div className="flex h-20 w-20 items-center justify-center rounded-full border border-white/60 bg-white/40 text-4xl text-[#76233a] shadow-sm backdrop-blur-sm transition duration-300 group-hover:scale-110">
                            {style.icon}
                          </div>
                        </div>
                      )}

        

                      <div className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#76233a] shadow-md transition duration-300 group-hover:bg-[#76233a] group-hover:text-white">
                        <ArrowRight size={17} />
                      </div>
                    </div>

                    <div className="p-4 sm:p-5">
                      <h3 className="line-clamp-1 font-serif text-lg font-semibold text-[#421521] transition group-hover:text-[#9a4359] sm:text-xl">
                        {category.name}
                      </h3>

                      <p className="mt-1 line-clamp-2 min-h-10 text-xs leading-5 text-[#927b76] sm:text-sm">
                        {category.description || style.subtitle}
                      </p>

                      <div className="mt-3 flex items-center gap-1.5 text-xs font-bold text-[#a45d4c]">
                        Explore collection
                        <ArrowRight
                          size={13}
                          className="transition-transform group-hover:translate-x-1"
                        />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* Empty state */}
        {!loading && !error && categories.length === 0 && (
          <div className="rounded-2xl border border-dashed border-[#e8d5ce] bg-white px-5 py-16 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#f8e8e5] text-[#76233a]">
              <Grid2X2 size={27} />
            </div>

            <h3 className="font-serif text-xl font-semibold text-[#421521]">
              Categories are coming soon
            </h3>

            <p className="mt-2 text-sm text-[#927b76]">
              Please check back soon for our latest collections.
            </p>

            <button
              onClick={loadCategories}
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#76233a] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#421521]"
            >
              <RefreshCw size={15} />
              Refresh categories
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
