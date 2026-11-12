
import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  RefreshCw,
  FolderTree,
  CheckCircle,
  AlertCircle,
  LoaderCircle,
  Power,
} from "lucide-react";

const inputClass =
  "w-full rounded-xl border border-[#e9dedb] bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-[#a65c70] focus:ring-2 focus:ring-[#76233a]/10";

function createSlug(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const emptyForm = {
  name: "",
  type: "main",
  parent_id: "",
};

export default function CategoryManager({ onClose, onChanged }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const mainCategories = categories.filter(
    (category) => !category.parent_id
  );

  const loadCategories = useCallback(async () => {
    setLoading(true);
    setError("");

    const { data, error: fetchError } = await supabase
      .from("store_categories")
      .select("id, name, slug, parent_id, is_active, sort_order")
      .order("sort_order", { ascending: true });

    if (fetchError) {
      setError(fetchError.message);
    } else {
      setCategories(data || []);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  function openNewForm(type = "main", parentId = "") {
    setError("");
    setSuccess("");
    setEditingId(null);
    setForm({
      name: "",
      type,
      parent_id: parentId,
    });
    setShowForm(true);
  }

  function openEditForm(category) {
    setError("");
    setSuccess("");
    setEditingId(category.id);
    setForm({
      name: category.name,
      type: category.parent_id ? "subcategory" : "main",
      parent_id: category.parent_id || "",
    });
    setShowForm(true);
  }

  async function handleSave(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    const name = form.name.trim();

    if (!name) {
      setError("Please enter a category name.");
      return;
    }

    if (form.type === "subcategory" && !form.parent_id) {
      setError("Please select a main category.");
      return;
    }

    setSaving(true);

    try {
      if (editingId) {
        // Keep the existing slug so existing products remain connected.
        const { error: updateError } = await supabase
          .from("store_categories")
          .update({ name })
          .eq("id", editingId);

        if (updateError) throw updateError;

        setSuccess("Category name updated successfully.");
      } else {
        let slug = createSlug(name);

        if (!slug) {
          throw new Error("Please enter a valid category name.");
        }

        // Make sure the new slug is unique.
        const { data: existingCategories, error: slugError } =
          await supabase
            .from("store_categories")
            .select("slug");

        if (slugError) throw slugError;

        const usedSlugs = new Set(
          (existingCategories || []).map((item) => item.slug)
        );

        const baseSlug = slug;
        let count = 2;

        while (usedSlugs.has(slug)) {
          slug = `${baseSlug}-${count}`;
          count += 1;
        }

        const nextSortOrder =
          categories.length > 0
            ? Math.max(
                ...categories.map((item) => Number(item.sort_order) || 0)
              ) + 1
            : 1;

        const { error: insertError } = await supabase
          .from("store_categories")
          .insert({
            name,
            slug,
            parent_id:
              form.type === "subcategory" ? form.parent_id : null,
            is_active: true,
            sort_order: nextSortOrder,
          });

        if (insertError) throw insertError;

        setSuccess(
          form.type === "subcategory"
            ? "Subcategory added successfully."
            : "Main category added successfully."
        );
      }

      setShowForm(false);
      setForm(emptyForm);
      setEditingId(null);

      await loadCategories();

      if (onChanged) await onChanged();
    } catch (err) {
      console.error("CATEGORY SAVE ERROR:", err);
      setError(err.message || "Could not save this category.");
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleActive(category) {
    setError("");
    setSuccess("");

    const { error: updateError } = await supabase
      .from("store_categories")
      .update({ is_active: !category.is_active })
      .eq("id", category.id);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setSuccess(
      category.is_active
        ? "Category deactivated."
        : "Category activated."
    );

    await loadCategories();

    if (onChanged) await onChanged();
  }

  async function handleDelete(category) {
    const hasChildren = categories.some(
      (item) => item.parent_id === category.id
    );

    if (hasChildren) {
      setError(
        "This main category has subcategories. Delete or move those subcategories first."
      );
      return;
    }

    // Do not delete categories that are already assigned to products.
    const { count, error: productError } = await supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("category_slug", category.slug);

    if (productError) {
      setError(productError.message);
      return;
    }

    if (count > 0) {
      setError(
        `This category is used by ${count} product(s). Deactivate it instead of deleting it.`
      );
      return;
    }

    const confirmed = window.confirm(
      `Delete "${category.name}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    const { error: deleteError } = await supabase
      .from("store_categories")
      .delete()
      .eq("id", category.id);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    setSuccess("Category deleted successfully.");
    await loadCategories();

    if (onChanged) await onChanged();
  }

  return (
    <section className="mb-7 overflow-hidden rounded-3xl border border-[#eadbd7] bg-white shadow-[0_12px_40px_rgba(66,21,33,0.06)]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#f1e8e5] bg-gradient-to-r from-[#fffaf8] to-white p-5 sm:px-7">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f8e8e5] text-[#76233a]">
            <FolderTree size={22} />
          </div>

          <div>
            <h2 className="font-serif text-xl font-bold text-[#421521]">
              Manage categories
            </h2>
            <p className="mt-1 text-xs text-gray-500">
              Create and organise your store collections.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadCategories}
            disabled={loading}
            title="Refresh categories"
            className="rounded-xl border border-gray-200 bg-white p-2.5 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw
              size={17}
              className={loading ? "animate-spin" : ""}
            />
          </button>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-gray-200 bg-white p-2.5 text-gray-500 hover:bg-gray-50"
            aria-label="Close category manager"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      <div className="space-y-4 p-4 sm:p-6">
        {error && (
          <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            <AlertCircle size={17} className="mt-0.5 shrink-0" />
            <span>{error}</span>
            <button
              type="button"
              onClick={() => setError("")}
              className="ml-auto"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {success && (
          <div className="flex items-start gap-2 rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-700">
            <CheckCircle size={17} className="mt-0.5 shrink-0" />
            <span>{success}</span>
            <button
              type="button"
              onClick={() => setSuccess("")}
              className="ml-auto"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {showForm && (
          <form
            onSubmit={handleSave}
            className="rounded-2xl border border-[#eadbd7] bg-[#fffaf8] p-4 sm:p-5"
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="font-bold text-[#421521]">
                {editingId
                  ? "Rename category"
                  : form.type === "subcategory"
                    ? "Add subcategory"
                    : "Add main category"}
              </h3>

              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="text-gray-400 hover:text-gray-700"
              >
                <X size={18} />
              </button>
            </div>

            {!editingId && (
              <div className="mb-4">
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Category type
                </label>

                <select
                  value={form.type}
                  onChange={(event) =>
                    setForm((previous) => ({
                      ...previous,
                      type: event.target.value,
                      parent_id: "",
                    }))
                  }
                  className={inputClass}
                >
                  <option value="main">Main category</option>
                  <option value="subcategory">Subcategory</option>
                </select>
              </div>
            )}

            {!editingId && form.type === "subcategory" && (
              <div className="mb-4">
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Select main category
                </label>

                <select
                  value={form.parent_id}
                  onChange={(event) =>
                    setForm((previous) => ({
                      ...previous,
                      parent_id: event.target.value,
                    }))
                  }
                  className={inputClass}
                  required
                >
                  <option value="">Choose a main category</option>
                  {mainCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="mb-4">
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Category name
              </label>

              <input
                value={form.name}
                onChange={(event) =>
                  setForm((previous) => ({
                    ...previous,
                    name: event.target.value,
                  }))
                }
                placeholder={
                  form.type === "subcategory"
                    ? "e.g. Diya"
                    : "e.g. Daily Puja"
                }
                className={inputClass}
                maxLength={80}
                required
              />

              {editingId && (
                <p className="mt-1.5 text-xs text-gray-400">
                  The category URL slug will remain unchanged so existing
                  products keep their category association.
                </p>
              )}
            </div>

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-600"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#76233a] px-5 py-3 text-sm font-semibold text-white hover:bg-[#5d1b2d] disabled:opacity-50"
              >
                {saving ? (
                  <LoaderCircle size={17} className="animate-spin" />
                ) : (
                  <CheckCircle size={17} />
                )}
                {saving ? "Saving..." : editingId ? "Save changes" : "Add category"}
              </button>
            </div>
          </form>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-[#421521]">Your category list</h3>
            <p className="mt-1 text-xs text-gray-500">
              {mainCategories.length} main categories ·{" "}
              {categories.length - mainCategories.length} subcategories
            </p>
          </div>

          <button
            type="button"
            onClick={() => openNewForm("main")}
            className="inline-flex items-center gap-2 rounded-xl bg-[#76233a] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#5d1b2d]"
          >
            <Plus size={16} />
            Add category
          </button>
        </div>

        {loading ? (
          <div className="flex min-h-32 items-center justify-center gap-2 text-sm text-gray-500">
            <LoaderCircle size={20} className="animate-spin" />
            Loading categories...
          </div>
        ) : mainCategories.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#e8d7d4] p-8 text-center">
            <FolderTree size={30} className="mx-auto mb-2 text-gray-300" />
            <p className="font-semibold text-gray-700">
              No categories found
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Add your first main category to get started.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {mainCategories.map((main) => {
              const children = categories.filter(
                (item) => item.parent_id === main.id
              );

              return (
                <div
                  key={main.id}
                  className="overflow-hidden rounded-2xl border border-[#eee3df]"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 bg-[#fffaf8] p-4">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-bold text-[#421521]">
                          {main.name}
                        </h4>
                        <span
                          className={`rounded-full px-2 py-1 text-[10px] font-semibold ${
                            main.is_active
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {main.is_active ? "Active" : "Inactive"}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-gray-400">
                        {main.slug}
                      </p>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => openNewForm("subcategory", main.id)}
                        title="Add subcategory"
                        className="inline-flex items-center gap-1 rounded-lg px-2.5 py-2 text-xs font-semibold text-[#76233a] hover:bg-[#f8e8e5]"
                      >
                        <Plus size={15} />
                        <span className="hidden sm:inline">Subcategory</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => openEditForm(main)}
                        title="Rename category"
                        className="rounded-lg p-2 text-gray-500 hover:bg-white hover:text-[#76233a]"
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleToggleActive(main)}
                        title={main.is_active ? "Deactivate" : "Activate"}
                        className="rounded-lg p-2 text-gray-500 hover:bg-white hover:text-[#76233a]"
                      >
                        <Power size={16} />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(main)}
                        title="Delete category"
                        className="rounded-lg p-2 text-gray-500 hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 p-3 sm:p-4">
                    {children.length === 0 ? (
                      <p className="px-2 py-2 text-xs text-gray-400">
                        No subcategories yet. Use the Subcategory button to
                        add one.
                      </p>
                    ) : (
                      children.map((child) => (
                        <div
                          key={child.id}
                          className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-gray-100 px-3 py-3"
                        >
                          <div className="flex min-w-0 items-center gap-2">
                            <span className="text-gray-300">↳</span>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-gray-700">
                                {child.name}
                              </p>
                              <p className="truncate text-[11px] text-gray-400">
                                {child.slug}
                              </p>
                            </div>
                            <span
                              className={`rounded-full px-2 py-1 text-[10px] font-semibold ${
                                child.is_active
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-gray-100 text-gray-500"
                              }`}
                            >
                              {child.is_active ? "Active" : "Inactive"}
                            </span>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => openEditForm(child)}
                              title="Rename subcategory"
                              className="rounded-lg p-2 text-gray-500 hover:bg-[#fff4f5] hover:text-[#76233a]"
                            >
                              <Pencil size={15} />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleToggleActive(child)}
                              title={child.is_active ? "Deactivate" : "Activate"}
                              className="rounded-lg p-2 text-gray-500 hover:bg-[#fff4f5] hover:text-[#76233a]"
                            >
                              <Power size={15} />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDelete(child)}
                              title="Delete subcategory"
                              className="rounded-lg p-2 text-gray-500 hover:bg-red-50 hover:text-red-600"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
