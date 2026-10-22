
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Header from "../components/Header";
import { categories } from "../data/categories";

export default function Categories() {
  return (
    <>
      <Header />

      <main className="min-h-screen bg-[#fffaf4] px-4 py-8 md:px-10">
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-2 text-sm text-[#8b3a2b]"
        >
          <ArrowLeft size={18} />
          Back to Home
        </Link>

        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#c46b32]">
            Explore Purv
          </p>

          <h1 className="mt-2 text-3xl font-bold text-[#54251f] md:text-5xl">
            Shop All Categories
          </h1>

          <p className="mt-3 text-gray-600">
            Find everything you need for your festive celebrations.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/category/${category.slug}`}
              className="group overflow-hidden rounded-2xl border border-orange-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <img
                src={category.image}
                alt={category.name}
                className="h-36 w-full object-cover sm:h-48"
              />

              <div className="p-4">
                <h2 className="font-semibold text-[#54251f]">
                  {category.name}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  {category.description}
                </p>

                <span className="mt-3 inline-block text-sm font-semibold text-[#b45324]">
                  Explore →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </>
  );
}
