
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Package, CheckCircle2 } from "lucide-react";
import Header from "../components/Header";
import { useShop } from "../context/ShopContext";

export default function OrderTracking() {
  const { id } = useParams();
  const { orders } = useShop();

  const order = orders.find((item) => item.id === id);

  return (
    <>
      <Header />

      <main className="min-h-screen bg-[#fffaf4] px-4 py-8 md:px-10">
        <Link to="/orders" className="inline-flex items-center gap-2 text-sm text-[#8b3a2b]">
          <ArrowLeft size={18} />
          Back to My Orders
        </Link>

        {!order ? (
          <div className="mt-8 rounded-2xl bg-white p-8 text-center">
            <h1 className="text-2xl font-bold text-[#54251f]">
              Order not found
            </h1>
            <p className="mt-2 text-gray-600">
              This order may not exist in this browser.
            </p>
          </div>
        ) : (
          <div className="mx-auto mt-8 max-w-2xl rounded-3xl bg-white p-6 shadow-sm md:p-8">
            <Package size={40} className="text-[#b45324]" />

            <h1 className="mt-4 text-3xl font-bold text-[#54251f]">
              Order Details
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Order ID: {order.id}
            </p>

            <p className="mt-4 text-lg font-semibold text-green-700">
              {order.status}
            </p>

            <div className="my-6 border-t" />

            <h2 className="font-semibold text-[#54251f]">Items ordered</h2>

            <div className="mt-3 space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-4">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-16 w-16 rounded-xl object-cover"
                  />

                  <div className="flex-1">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-500">
                      Quantity: {item.quantity}
                    </p>
                  </div>

                  <p className="font-semibold">
                    ₹{item.price * item.quantity}
                  </p>
                </div>
              ))}
            </div>

            <div className="my-6 border-t" />

            <div className="flex justify-between font-bold">
              <span>Order Total</span>
              <span>₹{order.subtotal}</span>
            </div>

            {order.address && (
              <div className="mt-6 rounded-xl bg-[#fffaf4] p-4">
                <h2 className="font-semibold">Delivery Address</h2>
                <p className="mt-2 text-sm text-gray-600">
                  {order.address.fullName}<br />
                  {order.address.house}, {order.address.area}<br />
                  {order.address.city}, {order.address.state} - {order.address.pincode}
                </p>
              </div>
            )}

            <div className="mt-6 flex items-center gap-2 text-sm text-gray-500">
              <CheckCircle2 size={18} />
              This is a demo order status.
            </div>
          </div>
        )}
      </main>
    </>
  );
}
