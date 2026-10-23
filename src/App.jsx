import { Routes, Route } from "react-router-dom";
import { ShopProvider } from "./context/ShopContext";

import Home from "./pages/Home";
import Categories from "./pages/Categories";
import CategoryProducts from "./pages/CategoryProducts";
import SearchResults from "./pages/SearchResults";
import ProductDetails from "./pages/ProductDetails";
import Wishlist from "./pages/Wishlist";
import Cart from "./pages/Cart";
import Address from "./pages/Address";
import Payment from "./pages/Payment";
import OrderSuccess from "./pages/OrderSuccess";
import Orders from "./pages/Orders";
import OrderTracking from "./pages/OrderTracking";
import Profile from "./pages/Profile";
import GiftFinder from "./pages/GiftFinder";
import Contact from "./pages/Contact";

function ComingSoon({ title }) {
  return (
    <main className="mx-auto max-w-5xl px-5 py-20 text-center">
      <p className="text-sm uppercase tracking-widest text-red-800">
        Purv festive shopping
      </p>
      <h1 className="mt-3 text-4xl font-semibold">{title}</h1>
      <p className="mt-4 text-stone-600">
        This page will be connected in the next development step.
      </p>
    </main>
  );
}

function NotFound() {
  return (
    <main className="px-5 py-20 text-center">
      <h1 className="text-4xl font-semibold">Page not found</h1>
      <a href="/" className="mt-5 inline-block text-red-800 underline">
        Return to Purv home
      </a>
    </main>
  );
}

export default function App() {
  return (
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/categories" element={<Categories />} />
          <Route
            path="/category/:slug"
            element={<CategoryProducts />}
          />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout/address" element={<Address />} />
          <Route path="/checkout/payment" element={<Payment />} />
          <Route path="/order-success/:id" element={<OrderSuccess />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/orders/:id" element={<OrderTracking />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/gift-finder" element={<GiftFinder />} />
          <Route path="/contact" element={<Contact />} />
          <Route
            path="/admin"
            element={<ComingSoon title="Admin dashboard" />}
          />
          <Route
            path="/admin/login"
            element={<ComingSoon title="Admin login" />}
          />
          <Route
            path="/admin/products"
            element={<ComingSoon title="Manage products" />}
          />

          <Route path="*" element={<NotFound />} />
        </Routes>
  );
}