import { Link } from "react-router-dom";
import {
  Phone,
  Mail,
  MessageCircle,
  MapPin,  
  PackageCheck,
  Heart,
  CircleCheck,
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full">

      {/* =====================================
          SHOPPING BENEFITS STRIP
      ====================================== */}

      <section className="border-y border-[#f0ddd2] bg-[#fff3ed]">
        <div className="mx-auto grid max-w-[1720px] grid-cols-1 gap-6 px-5 py-7 sm:grid-cols-3 sm:px-8 lg:px-12">

          {/* Order management */}
          <div className="flex items-center gap-4">
            <PackageCheck
              size={29}
              strokeWidth={1.8}
              className="shrink-0 text-[#8b243d]"
            />

            <div>
              <h3 className="text-sm font-bold text-[#54251f]">
                Easy order management
              </h3>

              <p className="mt-1 text-sm text-stone-500">
                Keep track of your orders
              </p>
            </div>
          </div>

          {/* Wishlist */}
          <div className="flex items-center gap-4">
            <Heart
              size={29}
              strokeWidth={1.8}
              className="shrink-0 text-[#8b243d]"
            />

            <div>
              <h3 className="text-sm font-bold text-[#54251f]">
                Keep your favourites close
              </h3>

              <p className="mt-1 text-sm text-stone-500">
                Save products to your wishlist
              </p>
            </div>
          </div>

          {/* Shopping journey */}
          <div className="flex items-center gap-4">
            <CircleCheck
              size={29}
              strokeWidth={1.8}
              className="shrink-0 text-[#8b243d]"
            />

            <div>
              <h3 className="text-sm font-bold text-[#54251f]">
                A simple shopping journey
              </h3>

              <p className="mt-1 text-sm text-stone-500">
                From browsing to checkout
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* =====================================
          MAIN FOOTER
      ====================================== */}

      <section className="bg-[#421521] text-white">
        <div className="mx-auto flex max-w-[1720px] flex-col gap-10 px-5 py-12 sm:px-8 md:flex-row md:items-start md:justify-between lg:px-12">

          {/* Brand */}
          <div>
            <Link
              to="/"
              aria-label="Purv home"
              className="inline-block font-serif text-5xl font-bold tracking-tight text-white transition hover:opacity-80"
            >
              purv<span className="text-[#f2b74d]">.</span>
            </Link>

            <p className="mt-2 text-sm font-semibold text-white/75">
              Beauty · Rituals · Gifting
            </p>

            <p className="mt-4 text-sm leading-6 text-white/60">
              A little joy for every celebration.
            </p>
          </div>

          {/* Navigation */}
          <div className="min-w-[280px]">
            <h3 className="mb-5 font-serif text-sm font-bold uppercase tracking-wide text-[#f2b74d]">
              Explore Purv
            </h3>

            <div className="grid grid-cols-2 gap-x-10 gap-y-4 text-sm text-white/80">

              <Link
                to="/categories"
                className="transition hover:text-[#f2b74d]"
              >
                All categories
              </Link>

              <Link
                to="/gift-finder"
                className="transition hover:text-[#f2b74d]"
              >
                Gift Finder
              </Link>

              <Link
                to="/wishlist"
                className="transition hover:text-[#f2b74d]"
              >
                Wishlist
              </Link>

              <Link
                to="/orders"
                className="transition hover:text-[#f2b74d]"
              >
                My orders
              </Link>

              <Link
                to="/profile"
                className="transition hover:text-[#f2b74d]"
              >
                My profile
              </Link>

              <Link
                to="/cart"
                className="transition hover:text-[#f2b74d]"
              >
                Shopping cart
              </Link>

              <Link
                to="/contact"
                className="transition hover:text-[#f2b74d]"
              >
                Contact us
              </Link>

            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-white/10">
          <div className="mx-auto flex max-w-[1720px] flex-col gap-2 px-5 py-5 text-xs text-white/50 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12">
            <p>
              © {new Date().getFullYear()} Purv. All rights reserved.
            </p>

            <p>Beauty · Rituals · Gifting</p>
          </div>
          
        </div>

        
      </section>

    </footer>
  );
}