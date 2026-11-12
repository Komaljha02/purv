
import { useNavigate } from "react-router-dom";
import AdminLayout from "./AdminLayout";
import HomepageOffersManager from "./HomepageOffersManager";

export default function AdminHomepageOffers() {
  const navigate = useNavigate();

  return (
    <AdminLayout
      title="Homepage Offers"
      subtitle="Manage promotional offers displayed on your storefront."
      active="offers"
    >
      <HomepageOffersManager
        onClose={() => navigate("/admin/products")}
      />
    </AdminLayout>
  );
}
