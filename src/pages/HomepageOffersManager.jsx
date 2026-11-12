import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import { Check, LoaderCircle, Save, Search, Sparkles, X } from "lucide-react";

const inputClass =
  "w-full rounded-xl border border-[#e9dedb] bg-white px-4 py-3 text-sm text-gray-800 outline-none focus:border-[#a65c70] focus:ring-2 focus:ring-[#76233a]/10";

export default function HomepageOffersManager({ onClose }) {
  const [products, setProducts] = useState([]);
  const [settings, setSettings] = useState({
    title: "Exciting Offers",
    subtitle: "Discover amazing deals on your favourite products.",
    mode: "automatic",
    is_enabled: true,
    product_ids: [],
    view_all_link: "/categories",
  });
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setError("");

      const [productResult, settingsResult] = await Promise.all([
        supabase
          .from("products")
          .select("id, name, price, original_price, category, image_url")
          .order("created_at", { ascending: false }),
        supabase
          .from("homepage_offer_settings")
          .select("title, subtitle, mode, is_enabled, product_ids, view_all_link")
          .eq("id", 1)
          .maybeSingle(),
      ]);

      if (!active) return;

      if (productResult.error) {
        setError(productResult.error.message);
      } else {
        setProducts(productResult.data || []);
      }

      if (settingsResult.error) {
        setError((previous) => previous || settingsResult.error.message);
      } else if (settingsResult.data) {
        const row = settingsResult.data;
        setSettings({
          title: row.title || "Exciting Offers",
          subtitle: row.subtitle || "",
          mode: row.mode === "manual" ? "manual" : "automatic",
          is_enabled: row.is_enabled !== false,
          product_ids: Array.isArray(row.product_ids) ? row.product_ids.map(String) : [],
          view_all_link: row.view_all_link || "/categories",
        });
      }

      setLoading(false);
    }

    load();
    return () => {
      active = false;
    };
  }, []);

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((product) =>
      !q ||
      String(product.name || "").toLowerCase().includes(q) ||
      String(product.category || "").toLowerCase().includes(q)
    );
  }, [products, search]);

  function update(field, value) {
    setSettings((current) => ({ ...current, [field]: value }));
  }

  function toggleProduct(id) {
    const key = String(id);
    setSettings((current) => ({
      ...current,
      product_ids: current.product_ids.includes(key)
        ? current.product_ids.filter((item) => item !== key)
        : [...current.product_ids, key],
    }));
  }

  async function save() {
    setSaving(true);
    setError("");
    setMessage("");

    const payload = {
      id: 1,
      title: settings.title.trim() || "Exciting Offers",
      subtitle: settings.subtitle.trim(),
      mode: settings.mode,
      is_enabled: settings.is_enabled,
      product_ids: settings.product_ids,
      view_all_link: settings.view_all_link.trim() || "/categories",
      updated_at: new Date().toISOString(),
    };

    const { error: saveError } = await supabase
      .from("homepage_offer_settings")
      .upsert(payload, { onConflict: "id" });

    if (saveError) {
      setError(saveError.message);
    } else {
      setMessage("Homepage offers settings saved successfully.");
    }

    setSaving(false);
  }

  return (
    <section className="mb-7 overflow-hidden rounded-3xl border border-[#eadbd7] bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#f1e8e5] bg-gradient-to-r from-[#fffaf8] to-white px-5 py-5 sm:px-7">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#f8e8e5] text-[#76233a]">
            <Sparkles size={21} />
          </span>
          <div>
            <h2 className="font-serif text-xl font-bold text-[#421521]">Homepage offers</h2>
            <p className="text-xs text-gray-500">Control the Exciting Offers section on your storefront.</p>
          </div>
        </div>
        <button type="button" onClick={onClose} className="rounded-xl border border-gray-200 p-2 text-gray-500 hover:bg-gray-50" aria-label="Close homepage offers manager">
          <X size={18} />
        </button>
      </div>

      <div className="space-y-5 p-4 sm:p-7">
        {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        {message && <p role="status" className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">{message}</p>}

        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-sm font-semibold text-gray-700">
            Section heading
            <input className={`${inputClass} mt-2`} value={settings.title} onChange={(e) => update("title", e.target.value)} placeholder="Exciting Offers" />
          </label>
          <label className="text-sm font-semibold text-gray-700">
            Subtitle
            <input className={`${inputClass} mt-2`} value={settings.subtitle} onChange={(e) => update("subtitle", e.target.value)} placeholder="Discover amazing deals..." />
          </label>
          <label className="text-sm font-semibold text-gray-700">
            View All destination
            <input className={`${inputClass} mt-2`} value={settings.view_all_link} onChange={(e) => update("view_all_link", e.target.value)} placeholder="/categories" />
          </label>
          <div className="flex items-center justify-between rounded-xl border border-[#eee5e2] px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-gray-800">Show section on homepage</p>
              <p className="text-xs text-gray-500">Turn this off to hide the whole section.</p>
            </div>
            <input type="checkbox" checked={settings.is_enabled} onChange={(e) => update("is_enabled", e.target.checked)} className="h-5 w-5 accent-[#76233a]" />
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-semibold text-gray-700">Product selection mode</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <button type="button" onClick={() => update("mode", "automatic")} className={`rounded-2xl border p-4 text-left transition ${settings.mode === "automatic" ? "border-[#76233a] bg-[#fff5f5] ring-2 ring-[#76233a]/10" : "border-gray-200 hover:bg-gray-50"}`}>
              <span className="font-bold text-[#421521]">Automatic offers</span>
              <span className="mt-1 block text-xs leading-5 text-gray-500">Automatically display products where original price is higher than selling price.</span>
            </button>
            <button type="button" onClick={() => update("mode", "manual")} className={`rounded-2xl border p-4 text-left transition ${settings.mode === "manual" ? "border-[#76233a] bg-[#fff5f5] ring-2 ring-[#76233a]/10" : "border-gray-200 hover:bg-gray-50"}`}>
              <span className="font-bold text-[#421521]">Manual selection</span>
              <span className="mt-1 block text-xs leading-5 text-gray-500">Choose exactly which products appear, including products without a discount.</span>
            </button>
          </div>
        </div>

        {settings.mode === "automatic" ? (
          <div className="rounded-xl bg-[#fff8ed] p-4 text-sm text-[#805b28]">
            Automatic mode is active. The homepage will show up to 6 discounted products, sorted by highest discount. Set an original price greater than the selling price in product management.
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="font-semibold text-[#421521]">Choose homepage products</h3>
                <p className="text-xs text-gray-500">{settings.product_ids.length} selected · The first 6 selected products will appear.</p>
              </div>
              <div className="relative w-full sm:w-64">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input value={search} onChange={(e) => setSearch(e.target.value)} className={`${inputClass} py-2 pl-9`} placeholder="Search products..." />
              </div>
            </div>

            {loading ? (
              <div className="flex items-center gap-2 py-6 text-sm text-gray-500"><LoaderCircle className="animate-spin" size={18} /> Loading products...</div>
            ) : (
              <div className="grid max-h-[420px] gap-2 overflow-y-auto sm:grid-cols-2">
                {filteredProducts.map((product) => {
                  const selected = settings.product_ids.includes(String(product.id));
                  return (
                    <label key={product.id} className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition ${selected ? "border-[#76233a] bg-[#fff7f7]" : "border-gray-200 hover:bg-gray-50"}`}>
                      <input type="checkbox" checked={selected} onChange={() => toggleProduct(product.id)} className="h-4 w-4 accent-[#76233a]" />
                      {product.image_url ? <img src={product.image_url} alt="" className="h-12 w-12 rounded-lg border object-cover" /> : <span className="grid h-12 w-12 place-items-center rounded-lg bg-[#f8e8e5] text-xs font-bold text-[#76233a]">PURV</span>}
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-gray-800">{product.name}</span>
                        <span className="block text-xs text-gray-500">{product.category || "Uncategorised"} · ₹{Number(product.price || 0).toLocaleString("en-IN")}</span>
                      </span>
                      {selected && <Check size={17} className="text-[#76233a]" />}
                    </label>
                  );
                })}
                {filteredProducts.length === 0 && <p className="py-5 text-center text-sm text-gray-500">No products found.</p>}
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col-reverse gap-2 border-t border-gray-100 pt-4 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50">Close</button>
          <button type="button" disabled={saving || loading} onClick={save} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#76233a] px-5 py-3 text-sm font-semibold text-white hover:bg-[#5d1b2d] disabled:opacity-50">
            {saving ? <LoaderCircle size={17} className="animate-spin" /> : <Save size={17} />}
            {saving ? "Saving..." : "Save homepage settings"}
          </button>
        </div>
      </div>
    </section>
  );
}
