import { Routes, Route, useNavigate } from "react-router-dom";
import { useEffect } from "react";
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
import ScrollToTop from "./components/ScrollToTop";
import PaymentMethod from "./pages/PaymentMethod";
import UpiPayment from "./pages/UpiPayment";

import AdminLogin from "./pages/AdminLogin";
import AdminProducts from "./pages/AdminProducts";
import AdminOrders from "./pages/AdminOrders";
import AdminCategories from "./pages/AdminCategories";
import AdminHomepageOffers from "./pages/AdminHomepageOffers";
import AdminDiscountOffers from "./pages/AdminDiscountOffers";
import CompletedOrders from "./pages/CompletedOrders";
import CancelledOrders from "./pages/CancelledOrders";
import AdminBanners from "./pages/AdminBanners";
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
  const navigate = useNavigate();

  useEffect(() => {
    const handleAdminShortcut = (event) => {
      if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === "a") {
        event.preventDefault();
        navigate("/admin/login");
      }
    };

    window.addEventListener("keydown", handleAdminShortcut);

    return () => {
      window.removeEventListener("keydown", handleAdminShortcut);
    };
  }, [navigate]);

  return (
    <>
      <ScrollToTop />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/category/:slug" element={<CategoryProducts />} />
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

        <Route path="/admin" element={<AdminProducts />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/products" element={<AdminProducts />} />
        <Route path="/admin/orders" element={<AdminOrders />} />
        <Route path="*" element={<NotFound />} />
        <Route path="/admin/categories" element={<AdminCategories />} />
        <Route path="/admin/offers" element={<AdminHomepageOffers />} />
        <Route
          path="/admin/discount-offers"
          element={<AdminDiscountOffers />}
        />
        <Route path="/admin/banners" element={<AdminBanners />} />
        <Route path="/checkout/payment-method" element={<PaymentMethod />} />
        <Route path="/checkout/upi" element={<UpiPayment />} />
        <Route path="/admin/completed-orders" element={<CompletedOrders />} />
        <Route path="/admin/cancelled-orders" element={<CancelledOrders />} />
      </Routes>
    </>
  );
}
