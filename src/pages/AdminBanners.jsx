
import { useCallback, useEffect, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  RefreshCw,
  Upload,
  Image as ImageIcon,
  ArrowUp,
  ArrowDown,
  X,
  Eye,
  EyeOff,
  Save,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import AdminLayout from "./AdminLayout";

const BUCKET = "purv-products";

const emptyForm = {
  title: "",
  subtitle: "",
  button_text: "Shop Now",
  button_link: "/categories",
  image_url: "",
  sort_order: 0,
  is_active: true,
};

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

export default function AdminBanners() {
  const [banners, setBanners] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);

  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadBanners = useCallback(async () => {
    setLoading(true);
    setError("");

    const { data, error: fetchError } = await supabase
      .from("homepage_banners")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (fetchError) {
      setError(fetchError.message);
      setLoading(false);
      return;
    }

    setBanners(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadBanners();
  }, [loadBanners]);

  function openNewForm() {
    setEditing(null);
    setForm({
      ...emptyForm,
      sort_order: banners.length,
    });
    setError("");
    setNotice("");
    setFormOpen(true);
  }

  function openEditForm(banner) {
    setEditing(banner);
    setForm({
      title: banner.title || "",
      subtitle: banner.subtitle || "",
      button_text: banner.button_text || "Shop Now",
      button_link: banner.button_link || "/categories",
      image_url: banner.image_url || "",
      sort_order: banner.sort_order ?? 0,
      is_active: banner.is_active ?? true,
    });
    setError("");
    setNotice("");
    setFormOpen(true);
  }

  function closeForm() {
    if (saving || uploading) return;
    setFormOpen(false);
    setEditing(null);
    setForm(emptyForm);
    setError("");
  }

  function updateField(event) {
    const { name, value, type, checked } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function uploadBannerImage(event) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Please select a JPG, PNG, WEBP or GIF image.");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError("Image size must be 5 MB or less.");
      return;
    }

    setUploading(true);
    setError("");
    setNotice("");

    try {
      const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "-");
      const filePath = `homepage-banners/${Date.now()}-${crypto.randomUUID()}-${safeName}`;

      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from(BUCKET)
        .getPublicUrl(filePath);

      setForm((previous) => ({
        ...previous,
        image_url: data.publicUrl,
      }));

      setNotice("Banner image uploaded successfully.");
    } catch (uploadError) {
      setError(uploadError.message || "Image upload failed.");
    } finally {
      setUploading(false);
    }
  }

  async function handleSave(event) {
    event.preventDefault();

    if (saving || uploading) return;

    if (!form.title.trim()) {
      setError("Please enter a banner heading.");
      return;
    }

    if (!form.image_url.trim()) {
      setError("Please upload a banner image.");
      return;
    }

    setSaving(true);
    setError("");
    setNotice("");

    const payload = {
      title: form.title.trim(),
      subtitle: form.subtitle.trim(),
      button_text: form.button_text.trim() || "Shop Now",
      button_link: form.button_link.trim() || "/categories",
      image_url: form.image_url.trim(),
      sort_order: Number(form.sort_order) || 0,
      is_active: form.is_active,
      updated_at: new Date().toISOString(),
    };

    let result;

    if (editing) {
      result = await supabase
        .from("homepage_banners")
        .update(payload)
        .eq("id", editing.id);
    } else {
      result = await supabase
        .from("homepage_banners")
        .insert([payload]);
    }

    if (result.error) {
      setError(result.error.message);
      setSaving(false);
      return;
    }

    setSaving(false);
    setFormOpen(false);
    setEditing(null);
    setForm(emptyForm);
    setNotice(editing ? "Banner updated." : "Banner created.");

    await loadBanners();
  }

  async function toggleActive(banner) {
    const { error: updateError } = await supabase
      .from("homepage_banners")
      .update({
        is_active: !banner.is_active,
        updated_at: new Date().toISOString(),
      })
      .eq("id", banner.id);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setNotice(
      banner.is_active
        ? "Banner deactivated."
        : "Banner activated."
    );

    await loadBanners();
  }

  async function deleteBanner(banner) {
    const confirmed = window.confirm(
      `Delete "${banner.title}"? This cannot be undone.`
    );

    if (!confirmed) return;

    const { error: deleteError } = await supabase
      .from("homepage_banners")
      .delete()
      .eq("id", banner.id);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    setNotice("Banner deleted.");
    await loadBanners();
  }

  async function changeOrder(banner, direction) {
    const currentIndex = banners.findIndex(
      (item) => item.id === banner.id
    );

    const targetIndex = currentIndex + direction;

    if (
      currentIndex < 0 ||
      targetIndex < 0 ||
      targetIndex >= banners.length
    ) {
      return;
    }

    const current = banners[currentIndex];
    const target = banners[targetIndex];

    const updates = await Promise.all([
      supabase
        .from("homepage_banners")
        .update({ sort_order: target.sort_order })
        .eq("id", current.id),

      supabase
        .from("homepage_banners")
        .update({ sort_order: current.sort_order })
        .eq("id", target.id),
    ]);

    const failed = updates.find((result) => result.error);

    if (failed) {
      setError(failed.error.message);
      return;
    }

    await loadBanners();
  }

  return (
    <AdminLayout
      title="Homepage Banners"
      subtitle="Manage the promotional slides displayed on your homepage."
      active="banners"
      actions={
        <button
          type="button"
          onClick={openNewForm}
          className="inline-flex items-center gap-2 rounded-xl bg-[#76233a] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#421521]"
        >
          <Plus size={17} />
          Add Banner
        </button>
      }
    >
      <div className="space-y-5">

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-[#eee3df] bg-white p-4">
            <p className="text-xs text-gray-500">Total banners</p>
            <p className="mt-2 text-2xl font-bold text-[#421521]">
              {banners.length}
            </p>
          </div>

          <div className="rounded-2xl border border-[#eee3df] bg-white p-4">
            <p className="text-xs text-gray-500">Active banners</p>
            <p className="mt-2 text-2xl font-bold text-green-700">
              {banners.filter((item) => item.is_active).length}
            </p>
          </div>

          <div className="col-span-2 rounded-2xl border border-[#eee3df] bg-white p-4 sm:col-span-1">
            <p className="text-xs text-gray-500">Inactive banners</p>
            <p className="mt-2 text-2xl font-bold text-gray-500">
              {banners.filter((item) => !item.is_active).length}
            </p>
          </div>
        </div>

        {notice && (
          <div className="rounded-xl border border-green-100 bg-green-50 px-4 py-3 text-sm text-green-700">
            {notice}
          </div>
        )}

        {error && !formOpen && (
          <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center rounded-2xl bg-white p-12">
            <RefreshCw className="animate-spin text-[#76233a]" />
          </div>
        ) : banners.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#ddc9c1] bg-white px-5 py-14 text-center">
            <ImageIcon
              size={38}
              className="mx-auto text-[#b58c8b]"
            />
            <h3 className="mt-4 font-bold text-[#421521]">
              No homepage banners yet
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Add your first banner to start building your homepage slider.
            </p>
            <button
              type="button"
              onClick={openNewForm}
              className="mt-5 rounded-xl bg-[#76233a] px-5 py-3 text-sm font-bold text-white"
            >
              Add your first banner
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {banners.map((banner, index) => (
              <div
                key={banner.id}
                className="overflow-hidden rounded-2xl border border-[#eee3df] bg-white shadow-sm"
              >
                <div className="grid md:grid-cols-[260px_1fr]">
                  <div className="relative min-h-[170px] bg-[#f7eee9]">
                    <img
                      src={banner.image_url}
                      alt={banner.title}
                      className="h-full min-h-[170px] w-full object-cover"
                    />
                    <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-[#76233a]">
                      Slide {index + 1}
                    </span>
                  </div>

                  <div className="min-w-0 p-4 sm:p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="font-bold text-[#421521]">
                          {banner.title}
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                          {banner.subtitle || "No subtitle"}
                        </p>
                      </div>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                          banner.is_active
                            ? "bg-green-50 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {banner.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>

                    <p className="mt-3 text-xs text-gray-400">
                      Button: {banner.button_text} · Link: {banner.button_link}
                    </p>

                    <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-[#f1e8e4] pt-4">
                      <button
                        type="button"
                        onClick={() => changeOrder(banner, -1)}
                        disabled={index === 0}
                        title="Move up"
                        className="rounded-lg border border-[#eee3df] p-2 text-gray-600 disabled:opacity-30"
                      >
                        <ArrowUp size={17} />
                      </button>

                      <button
                        type="button"
                        onClick={() => changeOrder(banner, 1)}
                        disabled={index === banners.length - 1}
                        title="Move down"
                        className="rounded-lg border border-[#eee3df] p-2 text-gray-600 disabled:opacity-30"
                      >
                        <ArrowDown size={17} />
                      </button>

                      <button
                        type="button"
                        onClick={() => toggleActive(banner)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-[#eee3df] px-3 py-2 text-xs font-semibold text-gray-600"
                      >
                        {banner.is_active ? (
                          <EyeOff size={15} />
                        ) : (
                          <Eye size={15} />
                        )}
                        {banner.is_active ? "Deactivate" : "Activate"}
                      </button>

                      <button
                        type="button"
                        onClick={() => openEditForm(banner)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-[#fff3ed] px-3 py-2 text-xs font-bold text-[#76233a]"
                      >
                        <Pencil size={15} />
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => deleteBanner(banner)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-2 text-xs font-bold text-red-600"
                      >
                        <Trash2 size={15} />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {formOpen && (
          <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/50 p-3 py-8 backdrop-blur-sm sm:items-center">
            <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-[#eee3df] px-5 py-4">
                <div>
                  <h2 className="font-bold text-[#421521]">
                    {editing ? "Edit Banner" : "Create Banner"}
                  </h2>
                  <p className="mt-1 text-xs text-gray-500">
                    Add the image and content for your homepage slide.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeForm}
                  disabled={saving || uploading}
                  className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-5 p-5">

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Banner image
                  </label>

                  <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#ddc9c1] bg-[#fffaf7] p-6 text-center transition hover:bg-[#fff3ed]">
                    <Upload size={25} className="text-[#76233a]" />
                    <span className="mt-2 text-sm font-bold text-[#76233a]">
                      {uploading ? "Uploading..." : "Upload from device"}
                    </span>
                    <span className="mt-1 text-xs text-gray-500">
                      JPG, PNG, WEBP or GIF · Maximum 5 MB
                    </span>

                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      onChange={uploadBannerImage}
                      disabled={uploading || saving}
                      className="hidden"
                    />
                  </label>

                  {form.image_url && (
                    <div className="mt-3 overflow-hidden rounded-xl border border-[#eee3df] p-2">
                      <img
                        src={form.image_url}
                        alt="Banner preview"
                        className="max-h-64 w-full rounded-lg object-cover"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setForm((previous) => ({
                            ...previous,
                            image_url: "",
                          }))
                        }
                        disabled={saving || uploading}
                        className="mt-2 text-xs font-semibold text-red-600"
                      >
                        Remove image
                      </button>
                    </div>
                  )}
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                    Heading
                  </label>
                  <input
                    name="title"
                    value={form.title}
                    onChange={updateField}
                    placeholder="Example: Celebrate Every Little Moment"
                    className="w-full rounded-xl border border-[#e8ddd8] px-4 py-3 text-sm outline-none focus:border-[#76233a]"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                    Subtitle
                  </label>
                  <textarea
                    name="subtitle"
                    value={form.subtitle}
                    onChange={updateField}
                    rows={3}
                    placeholder="Write a short description for your banner..."
                    className="w-full rounded-xl border border-[#e8ddd8] px-4 py-3 text-sm outline-none focus:border-[#76233a]"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                      Button text
                    </label>
                    <input
                      name="button_text"
                      value={form.button_text}
                      onChange={updateField}
                      placeholder="Shop Now"
                      className="w-full rounded-xl border border-[#e8ddd8] px-4 py-3 text-sm outline-none focus:border-[#76233a]"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                      Button destination
                    </label>
                    <input
                      name="button_link"
                      value={form.button_link}
                      onChange={updateField}
                      placeholder="/categories"
                      className="w-full rounded-xl border border-[#e8ddd8] px-4 py-3 text-sm outline-none focus:border-[#76233a]"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                      Slide order
                    </label>
                    <input
                      name="sort_order"
                      type="number"
                      min="0"
                      value={form.sort_order}
                      onChange={updateField}
                      className="w-full rounded-xl border border-[#e8ddd8] px-4 py-3 text-sm outline-none focus:border-[#76233a]"
                    />
                  </div>

                  <label className="flex items-center gap-3 self-end rounded-xl border border-[#e8ddd8] p-3">
                    <input
                      type="checkbox"
                      name="is_active"
                      checked={form.is_active}
                      onChange={updateField}
                      className="h-4 w-4 accent-[#76233a]"
                    />
                    <span className="text-sm font-semibold text-gray-700">
                      Show on homepage
                    </span>
                  </label>
                </div>

                {error && (
                  <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                )}

                <div className="flex flex-col-reverse gap-2 border-t border-[#eee3df] pt-4 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={closeForm}
                    disabled={saving || uploading}
                    className="rounded-xl border border-[#e8ddd8] px-5 py-3 text-sm font-semibold text-gray-600"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={saving || uploading}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#76233a] px-6 py-3 text-sm font-bold text-white disabled:opacity-50"
                  >
                    {saving ? (
                      <RefreshCw size={16} className="animate-spin" />
                    ) : (
                      <Save size={16} />
                    )}
                    {saving
                      ? "Saving..."
                      : editing
                        ? "Save changes"
                        : "Create banner"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
