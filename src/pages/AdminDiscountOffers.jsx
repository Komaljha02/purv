import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Tag,
  Save,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Search,
  Eye,
  EyeOff,
  Package,
  Image as ImageIcon,
} from "lucide-react";

import { supabase } from "../lib/supabase";
import AdminLayout from "../pages/AdminLayout";

const SETTINGS_TABLE = "homepage_discount_settings";

const defaultSettings = {
  title: "Extra Discount Offers",
  subtitle: "Little treats, special prices",
  is_enabled: true,
  product_ids: [],
};

const money = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`;

export default function AdminDiscountOffers() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [products, setProducts] = useState([]);
  const [existingSetting, setExistingSetting] = useState(null);

  const [settings, setSettings] = useState(defaultSettings);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Check admin access and load data
  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        navigate("/admin/login", { replace: true });
        return;
      }

      const { data: admin, error: adminError } = await supabase
        .from("admin_users")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (adminError || !admin) {
        await supabase.auth.signOut();
        navigate("/admin/login", { replace: true });
        return;
      }

      // Fetch products
      const { data: productData, error: productError } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (productError) throw productError;

      setProducts(productData || []);

      // Fetch saved discount settings
      const { data: settingData, error: settingError } = await supabase
        .from(SETTINGS_TABLE)
        .select("*")
        .limit(1)
        .maybeSingle();

      if (settingError) throw settingError;

      setExistingSetting(settingData || null);

      if (settingData) {
        setSettings({
          title: settingData.title || defaultSettings.title,
          subtitle: settingData.subtitle || defaultSettings.subtitle,
          is_enabled: settingData.is_enabled ?? true,
          product_ids: Array.isArray(settingData.product_ids)
            ? settingData.product_ids
            : [],
        });
      } else {
        setSettings(defaultSettings);
      }
    } catch (err) {
      console.error("Discount offers loading error:", err);
      setError(err.message || "Unable to load discount offers.");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Only products with an actual discount
  const discountedProducts = useMemo(() => {
    return products.filter((product) => {
      const price = Number(product.price);
      const originalPrice = Number(product.original_price);

      return (
        product.id != null &&
        Number.isFinite(price) &&
        Number.isFinite(originalPrice) &&
        originalPrice > price
      );
    });
  }, [products]);

  const selectedProducts = useMemo(() => {
    return discountedProducts.filter((product) =>
      settings.product_ids.some((id) => String(id) === String(product.id)),
    );
  }, [discountedProducts, settings.product_ids]);

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return discountedProducts;

    return discountedProducts.filter((product) =>
      String(product.name || "")
        .toLowerCase()
        .includes(term),
    );
  }, [discountedProducts, search]);

  const updateSetting = (field, value) => {
    setSettings((previous) => ({
      ...previous,
      [field]: value,
    }));
    setMessage("");
    setError("");
  };

  const toggleProduct = (productId) => {
    setSettings((previous) => {
      const alreadySelected = previous.product_ids.some(
        (id) => String(id) === String(productId),
      );

      return {
        ...previous,
        product_ids: alreadySelected
          ? previous.product_ids.filter(
              (id) => String(id) !== String(productId),
            )
          : [...previous.product_ids, productId],
      };
    });

    setMessage("");
    setError("");
  };

  const selectAll = () => {
    const visibleIds = filteredProducts.map((product) => product.id);

    setSettings((previous) => ({
      ...previous,
      product_ids: [
        ...previous.product_ids.filter(
          (id) =>
            !visibleIds.some((visibleId) => String(visibleId) === String(id)),
        ),
        ...visibleIds,
      ],
    }));
  };

  const clearSelection = () => {
    const visibleIds = filteredProducts.map((product) => String(product.id));

    setSettings((previous) => ({
      ...previous,
      product_ids: previous.product_ids.filter(
        (id) => !visibleIds.includes(String(id)),
      ),
    }));
  };

  // Save settings to Supabase
  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        navigate("/admin/login", { replace: true });
        return;
      }

      const { data: admin, error: adminError } = await supabase
        .from("admin_users")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (adminError || !admin) {
        navigate("/admin/login", { replace: true });
        return;
      }

      const payload = {
        title: settings.title.trim() || defaultSettings.title,
        subtitle: settings.subtitle.trim(),
        is_enabled: settings.is_enabled,
        product_ids: settings.product_ids,
        updated_at: new Date().toISOString(),
      };

      let result;

      if (existingSetting?.id != null) {
        result = await supabase
          .from(SETTINGS_TABLE)
          .update(payload)
          .eq("id", existingSetting.id)
          .select("*")
          .single();
      } else {
        result = await supabase
          .from(SETTINGS_TABLE)
          .insert(payload)
          .select("*")
          .single();
      }

      if (result.error) throw result.error;

      setExistingSetting(result.data);
      setMessage("Discount offers settings saved successfully!");
    } catch (err) {
      console.error("Discount offers save error:", err);
      setError(err.message || "Unable to save discount offers.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fffaf5]">
        <div className="text-center">
          <RefreshCw
            size={30}
            className="mx-auto animate-spin text-[#76233a]"
          />
          <p className="mt-3 text-sm font-medium text-[#76233a]">
            Loading discount offers...
          </p>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout
      title="Discount Offers"
      subtitle="Manage the circular discount section on your homepage."
      active="discount-offers"
    >
      <div className="mx-auto max-w-7xl">
        {/* Notifications */}
        {message && (
          <div className="mb-5 flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
            <CheckCircle2 size={19} />
            {message}
          </div>
        )}

        {error && (
          <div className="mb-5 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle size={19} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          {/* Main Settings */}
          <div className="space-y-6">
            {/* Section Details */}
            <section className="rounded-2xl border border-[#f0e3dd] bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-5">
                <h2 className="text-lg font-bold text-[#29201f]">
                  Section Details
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Choose the heading displayed above your discount circles.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#29201f]">
                    Section Title
                  </label>
                  <input
                    type="text"
                    value={settings.title}
                    onChange={(e) => updateSetting("title", e.target.value)}
                    placeholder="Extra Discount Offers"
                    className="w-full rounded-xl border border-[#eadbd5] px-4 py-3 text-sm outline-none transition focus:border-[#76233a] focus:ring-2 focus:ring-[#76233a]/10"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#29201f]">
                    Subtitle
                  </label>
                  <input
                    type="text"
                    value={settings.subtitle}
                    onChange={(e) => updateSetting("subtitle", e.target.value)}
                    placeholder="Little treats, special prices"
                    className="w-full rounded-xl border border-[#eadbd5] px-4 py-3 text-sm outline-none transition focus:border-[#76233a] focus:ring-2 focus:ring-[#76233a]/10"
                  />
                </div>
              </div>

              {/* Enable / Disable */}
              <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-xl bg-[#fff8f4] p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#76233a]">
                    {settings.is_enabled ? (
                      <Eye size={19} />
                    ) : (
                      <EyeOff size={19} />
                    )}
                  </div>

                  <div>
                    <p className="text-sm font-bold text-[#29201f]">
                      Show Discount Offers
                    </p>
                    <p className="text-xs text-gray-500">
                      Control visibility on the homepage.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    updateSetting("is_enabled", !settings.is_enabled)
                  }
                  className={`relative h-7 w-12 rounded-full transition ${
                    settings.is_enabled ? "bg-[#76233a]" : "bg-gray-300"
                  }`}
                  aria-label="Toggle discount offers visibility"
                  aria-pressed={settings.is_enabled}
                >
                  <span
                    className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${
                      settings.is_enabled ? "left-6" : "left-1"
                    }`}
                  />
                </button>
              </div>
            </section>

            {/* Product Selection */}
            <section className="rounded-2xl border border-[#f0e3dd] bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-[#29201f]">
                    Select Discount Products
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Choose the products you want to show in the circular
                    section.
                  </p>
                </div>

                <span className="rounded-full bg-[#fff0e9] px-3 py-1.5 text-xs font-bold text-[#76233a]">
                  {settings.product_ids.length} Selected
                </span>
              </div>

              {/* Search */}
              <div className="relative mb-4">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search discounted products..."
                  className="w-full rounded-xl border border-[#eadbd5] py-3 pl-10 pr-4 text-sm outline-none focus:border-[#76233a]"
                />
              </div>

              {/* Selection Actions */}
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={selectAll}
                  disabled={!filteredProducts.length}
                  className="rounded-lg bg-[#76233a] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#421521] disabled:opacity-40"
                >
                  Select All
                </button>

                <button
                  type="button"
                  onClick={clearSelection}
                  disabled={!filteredProducts.length}
                  className="rounded-lg border border-[#eadbd5] px-3 py-2 text-xs font-semibold text-[#76233a] transition hover:bg-[#fff5f0] disabled:opacity-40"
                >
                  Clear Visible Selection
                </button>
              </div>

              {discountedProducts.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[#eadbd5] px-5 py-12 text-center">
                  <Package size={35} className="mx-auto text-[#c9a9a0]" />
                  <h3 className="mt-3 font-semibold text-[#29201f]">
                    No discounted products found
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Add products with an original price greater than their
                    selling price.
                  </p>
                </div>
              ) : filteredProducts.length === 0 ? (
                <p className="py-10 text-center text-sm text-gray-500">
                  No products match your search.
                </p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {filteredProducts.map((product) => {
                    const selected = settings.product_ids.some(
                      (id) => String(id) === String(product.id),
                    );

                    const discount = Math.round(
                      ((Number(product.original_price) -
                        Number(product.price)) /
                        Number(product.original_price)) *
                        100,
                    );

                    return (
                      <label
                        key={product.id}
                        className={`flex cursor-pointer gap-3 rounded-xl border p-3 transition ${
                          selected
                            ? "border-[#76233a] bg-[#fff8f5] ring-1 ring-[#76233a]/10"
                            : "border-[#eee4df] hover:border-[#d8b9ae]"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() => toggleProduct(product.id)}
                          className="mt-1 h-4 w-4 shrink-0 accent-[#76233a]"
                        />

                        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-[#fff4ee]">
                          {product.image_url ? (
                            <img
                              src={product.image_url}
                              alt={product.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-[#c9a9a0]">
                              <ImageIcon size={25} />
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="line-clamp-2 text-sm font-bold text-[#29201f]">
                            {product.name}
                          </p>

                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            <span className="text-sm font-bold text-[#76233a]">
                              {money(product.price)}
                            </span>
                            <span className="text-xs text-gray-400 line-through">
                              {money(product.original_price)}
                            </span>
                          </div>

                          <span className="mt-2 inline-block rounded-md bg-green-50 px-2 py-1 text-[10px] font-bold text-green-700">
                            {discount}% OFF
                          </span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}
            </section>
          </div>

          {/* Preview */}
          <aside className="space-y-5">
            <section className="rounded-2xl border border-[#f0e3dd] bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <Eye size={19} className="text-[#76233a]" />
                <h2 className="font-bold text-[#29201f]">Homepage Preview</h2>
              </div>

              <div className="rounded-xl bg-[#fffaf5] p-4">
                <p className="text-center text-lg font-bold text-[#76233a]">
                  {settings.title || "Extra Discount Offers"}
                </p>

                {settings.subtitle && (
                  <p className="mt-1 text-center text-xs text-gray-500">
                    {settings.subtitle}
                  </p>
                )}

                {!settings.is_enabled && (
                  <p className="mt-3 text-center text-xs font-semibold text-red-600">
                    Section is currently disabled
                  </p>
                )}

                <div className="mt-5 grid grid-cols-3 gap-3">
                  {selectedProducts.slice(0, 6).map((product) => (
                    <div key={product.id} className="text-center">
                      <div className="mx-auto aspect-square w-full overflow-hidden rounded-full border-2 border-[#edc18d] bg-white p-1">
                        {product.image_url ? (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="h-full w-full rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center rounded-full text-[#c9a9a0]">
                            <ImageIcon size={22} />
                          </div>
                        )}
                      </div>

                      <p className="mt-2 line-clamp-2 text-[10px] font-semibold text-[#29201f]">
                        {product.name}
                      </p>

                      <p className="mt-1 text-[10px] font-bold text-[#76233a]">
                        {Math.round(
                          ((Number(product.original_price) -
                            Number(product.price)) /
                            Number(product.original_price)) *
                            100,
                        )}
                        % OFF
                      </p>
                    </div>
                  ))}
                </div>

                {selectedProducts.length === 0 && (
                  <div className="py-8 text-center">
                    <Tag size={27} className="mx-auto text-[#c9a9a0]" />
                    <p className="mt-2 text-xs text-gray-500">
                      Select products to see your preview.
                    </p>
                  </div>
                )}

                {selectedProducts.length > 6 && (
                  <p className="mt-4 text-center text-xs text-gray-500">
                    +{selectedProducts.length - 6} more products
                  </p>
                )}
              </div>

              <div className="mt-4 rounded-xl bg-[#fff5ef] p-3 text-xs leading-5 text-gray-600">
                This is an approximate preview of the products selected for your
                homepage.
              </div>
            </section>

            {/* Summary */}
            <section className="rounded-2xl border border-[#f0e3dd] bg-white p-5 shadow-sm">
              <h3 className="mb-4 font-bold text-[#29201f]">
                Selection Summary
              </h3>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between gap-3">
                  <span className="text-gray-500">Discounted products</span>
                  <strong className="text-[#29201f]">
                    {discountedProducts.length}
                  </strong>
                </div>

                <div className="flex justify-between gap-3">
                  <span className="text-gray-500">Selected products</span>
                  <strong className="text-[#76233a]">
                    {settings.product_ids.length}
                  </strong>
                </div>

                <div className="flex justify-between gap-3">
                  <span className="text-gray-500">Section status</span>
                  <strong
                    className={
                      settings.is_enabled ? "text-green-600" : "text-red-500"
                    }
                  >
                    {settings.is_enabled ? "Enabled" : "Disabled"}
                  </strong>
                </div>
              </div>
            </section>

            {/* Save */}
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#76233a] px-5 py-4 text-sm font-bold text-white shadow-lg shadow-[#76233a]/15 transition hover:bg-[#421521] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <>
                  <RefreshCw size={18} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Save Discount Offers
                </>
              )}
            </button>
          </aside>
        </div>
      </div>
    </AdminLayout>
  );
}
