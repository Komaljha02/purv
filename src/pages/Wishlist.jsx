import { Link } from "react-router-dom";
import { Heart, ArrowLeft } from "lucide-react";
import Header from "../components/Header";
import ProductCard from "../components/ProductCard";
import { products } from "../data/products";
import { useShop } from "../context/ShopContext";

export default function Wishlist() {
  const { wishlist } = useShop();

  const savedProducts = products.filter((product) =>
    wishlist.includes(product.id)
  );

  return (
    <>
      <Header />

      <main className="min-h-screen bg-[#fffaf4] px-4 py-8 md:px-10">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-[#8b3a2b]">
          <ArrowLeft size={18} />
          Back to Home
        </Link>

        <div className="my-8 flex items-center gap-3">
          <Heart className="text-[#b45324]" size={30} />
          <h1 className="text-3xl font-bold text-[#54251f]">
            My Wishlist
          </h1>
        </div>

        {savedProducts.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {savedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl bg-white p-10 text-center">
            <Heart size={45} className="mx-auto text-[#b45324]" />
            <h2 className="mt-4 text-xl font-semibold text-[#54251f]">
              Your wishlist is empty
            </h2>
            <p className="mt-2 text-gray-500">
              Save your favourite festive products here.
            </p>
            <Link
              to="/categories"
              className="mt-5 inline-block rounded-full bg-[#8b3a2b] px-6 py-3 text-white"
            >
              Explore Products
            </Link>
          </div>
        )}
      </main>
    </>
  );
}