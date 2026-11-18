import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Pencil,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  Layers,
  FolderOpen,
  Search,
  RefreshCw,
  X,
  Save,
  Image as ImageIcon,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Check,
  AlertCircle,
  LayoutGrid,
  ListFilter,
  Package,
} from "lucide-react";

import { supabase } from "../lib/supabase";
import AdminLayout from "../pages/AdminLayout";

const emptyForm = {
  name: "",
  description: "",
  image_url: "",
  parent_id: "",
};

const MAX_SLIDES = 5;
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

const slugify = (value) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export default function AdminCategories() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingSlides, setUploadingSlides] = useState(false);
  const [uploadingMainImage, setUploadingMainImage] = useState(false);
  const [loadingSlides, setLoadingSlides] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  const [search, setSearch] = useState("");
  const [visibilityFilter, setVisibilityFilter] = useState("all");
  const [expanded, setExpanded] = useState({});

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const [slideImages, setSlideImages] = useState([]);

  const [notice, setNotice] = useState(null);
  const [formError, setFormError] = useState("");

  const notify = (type, message) => {
    setNotice({ type, message });
    window.setTimeout(() => setNotice(null), 3500);
  };

  // --------------------------------------------------
  // LOAD CATEGORIES
  // --------------------------------------------------

  const loadCategories = useCallback(async () => {
    setLoading(true);

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

      const { data, error } = await supabase
        .from("store_categories")
        .select("*")
        .order("sort_order", { ascending: true });

      if (error) throw error;

      setCategories(data || []);
    } catch (error) {
      console.error("Category loading error:", error);
      notify("error", error.message || "Couldn't load categories.");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  // --------------------------------------------------
  // CATEGORY DATA
  // --------------------------------------------------

  const mainCategories = useMemo(
    () =>
      categories
        .filter((item) => !item.parent_id)
        .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)),
    [categories],
  );

  const getChildren = useCallback(
    (parentId) =>
      categories
        .filter((item) => item.parent_id === parentId)
        .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)),
    [categories],
  );

  const activeCount = categories.filter((item) => item.is_active).length;
  const hiddenCount = categories.length - activeCount;
  const subcategoryCount = categories.filter((item) => item.parent_id).length;

  const filteredCategories = useMemo(() => {
    const term = search.trim().toLowerCase();

    return mainCategories.filter((item) => {
      const children = categories.filter(
        (child) => child.parent_id === item.id,
      );

      const matchesSearch =
        !term ||
        item.name.toLowerCase().includes(term) ||
        children.some((child) => child.name.toLowerCase().includes(term));

      const matchesVisibility =
        visibilityFilter === "all" ||
        (visibilityFilter === "visible" && item.is_active) ||
        (visibilityFilter === "hidden" && !item.is_active);

      return matchesSearch && matchesVisibility;
    });
  }, [search, visibilityFilter, mainCategories, categories]);

  // --------------------------------------------------
  // ADD / EDIT CATEGORY
  // --------------------------------------------------

  const openAdd = (parentId = "") => {
    setEditing(null);
    setForm({
      ...emptyForm,
      parent_id: parentId,
    });
    setSlideImages([]);
    setFormError("");
    setShowForm(true);
  };

  const openEdit = async (category) => {
    setEditing(category);

    setForm({
      name: category.name || "",
      description: category.description || "",
      image_url: category.image_url || "",
      parent_id: category.parent_id || "",
    });

    setSlideImages([]);
    setFormError("");
    setShowForm(true);

    // Main collections do not use subcategory slides.
    if (!category.parent_id) return;

    setLoadingSlides(true);

    try {
      const { data, error } = await supabase
        .from("subcategory_slides")
        .select("*")
        .eq("subcategory_slug", category.slug)
        .order("sort_order", { ascending: true });

      if (error) throw error;

      setSlideImages(
        (data || []).map((item) => ({
          id: item.id,
          image_url: item.image_url,
          is_active: item.is_active,
        })),
      );
    } catch (error) {
      console.error("Slide loading error:", error);
      notify("error", error.message || "Couldn't load subcategory images.");
    } finally {
      setLoadingSlides(false);
    }
  };

  const closeForm = () => {
    if (saving || uploadingSlides || uploadingMainImage) return;

    setShowForm(false);
    setEditing(null);
    setForm(emptyForm);
    setSlideImages([]);
    setFormError("");
  };

  // --------------------------------------------------
  // SLIDESHOW IMAGE UPLOAD
  // --------------------------------------------------

  const uploadSubcategoryImages = async (event) => {
    const input = event.target;
    const files = Array.from(input.files || []);

    if (!files.length) return;

    const remaining = MAX_SLIDES - slideImages.length;

    if (remaining <= 0) {
      notify("error", "You can upload a maximum of 5 images.");
      input.value = "";
      return;
    }

    if (files.length > remaining) {
      notify("error", `You can upload only ${remaining} more image(s).`);
      input.value = "";
      return;
    }

    const validFiles = [];

    for (const file of files) {
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        notify(
          "error",
          `${file.name} is not a supported image. Use JPG, PNG, WEBP or GIF.`,
        );
        continue;
      }

      if (file.size > MAX_FILE_SIZE) {
        notify("error", `${file.name} exceeds the 5 MB file limit.`);
        continue;
      }

      validFiles.push(file);
    }

    if (!validFiles.length) {
      input.value = "";
      return;
    }

    setUploadingSlides(true);
    setFormError("");

    try {
      const uploadedImages = [];

      for (const file of validFiles) {
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");

        const filePath = `subcategory-slides/${Date.now()}-${crypto.randomUUID()}-${safeName}`;

        const { error: uploadError } = await supabase.storage
          .from("purv-products")
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: false,
            contentType: file.type,
          });

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from("purv-products")
          .getPublicUrl(filePath);

        if (!data?.publicUrl) {
          throw new Error("Could not generate the image URL.");
        }

        uploadedImages.push({
          image_url: data.publicUrl,
          is_active: true,
        });
      }

      setSlideImages((previous) => [...previous, ...uploadedImages]);

      notify("success", "Images uploaded successfully!");
    } catch (error) {
      console.error("Subcategory upload error:", error);

      notify(
        "error",
        error.message || "Image upload failed. Please try again.",
      );
    } finally {
      setUploadingSlides(false);
      input.value = "";
    }
  };
  // --------------------------------------------------
  // MAIN COLLECTION IMAGE UPLOAD
  // --------------------------------------------------

  const uploadMainCollectionImage = async (event) => {
    const input = event.target;
    const file = input.files?.[0];

    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      notify("error", "Use JPG, PNG, WEBP or GIF images.");
      input.value = "";
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      notify("error", "Image size must be less than 5 MB.");
      input.value = "";
      return;
    }

    setUploadingMainImage(true);
    setFormError("");

    try {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");

      const filePath = `main-collections/${Date.now()}-${crypto.randomUUID()}-${safeName}`;

      const { error: uploadError } = await supabase.storage
        .from("purv-products")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type,
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from("purv-products")
        .getPublicUrl(filePath);

      if (!data?.publicUrl) {
        throw new Error("Could not generate image URL.");
      }

      setForm((previous) => ({
        ...previous,
        image_url: data.publicUrl,
      }));

      notify("success", "Collection image uploaded successfully!");
    } catch (error) {
      console.error("Main collection image upload error:", error);

      notify(
        "error",
        error.message || "Image upload failed. Please try again.",
      );
    } finally {
      setUploadingMainImage(false);
      input.value = "";
    }
  };

  const moveSlideImage = (index, direction) => {
    setSlideImages((previous) => {
      const next = [...previous];
      const target = index + direction;

      if (target < 0 || target >= next.length) {
        return previous;
      }

      [next[index], next[target]] = [next[target], next[index]];

      return next;
    });
  };

  const removeSlideImage = (index) => {
    setSlideImages((previous) => previous.filter((_, i) => i !== index));
  };

  const toggleSlideImage = (index) => {
    setSlideImages((previous) =>
      previous.map((image, i) =>
        i === index
          ? {
              ...image,
              is_active: !image.is_active,
            }
          : image,
      ),
    );
  };

  // --------------------------------------------------
  // CATEGORY SLUG
  // --------------------------------------------------

  const createSlug = (name) => {
    const base = slugify(name);

    if (!base) return "";

    let candidate = base;
    let count = 2;

    while (categories.some((item) => item.slug === candidate)) {
      candidate = `${base}-${count++}`;
    }

    return candidate;
  };

  // --------------------------------------------------
  // SAVE CATEGORY AND SUBCATEGORY SLIDES
  // --------------------------------------------------

  const saveCategory = async (event) => {
    event.preventDefault();

    const name = form.name.trim();

    if (!name) {
      setFormError("Please enter a name for this collection.");
      return;
    }

    if (!editing && !slugify(name)) {
      setFormError("Please enter a valid category name.");
      return;
    }

    if (uploadingSlides || uploadingMainImage || loadingSlides) {
      setFormError("Please wait until image operations finish.");
      return;
    }

    setSaving(true);
    setFormError("");

    try {
      const commonFields = {
        name,
        description: form.description.trim() || null,
        image_url: form.image_url.trim() || null,
        updated_at: new Date().toISOString(),
      };

      let savedSlug = editing?.slug;
      const isSubcategory = Boolean(form.parent_id || editing?.parent_id);

      if (editing) {
        const { error } = await supabase
          .from("store_categories")
          .update(commonFields)
          .eq("id", editing.id);

        if (error) throw error;
      } else {
        const parentId = form.parent_id || null;

        const siblings = categories.filter(
          (item) => item.parent_id === parentId,
        );

        const newSlug = createSlug(name);

        const { data: createdCategory, error } = await supabase
          .from("store_categories")
          .insert({
            ...commonFields,
            slug: newSlug,
            parent_id: parentId,
            sort_order: siblings.length
              ? Math.max(...siblings.map((item) => item.sort_order || 0)) + 1
              : 1,
            is_active: true,
          })
          .select("slug")
          .single();

        if (error) throw error;

        savedSlug = createdCategory.slug;
      }

      // Save slideshow images only for subcategories.
      if (isSubcategory) {
        if (!savedSlug) {
          throw new Error("Subcategory slug could not be found.");
        }

        // Remove old slide records for this subcategory.
        const { error: deleteError } = await supabase
          .from("subcategory_slides")
          .delete()
          .eq("subcategory_slug", savedSlug);

        if (deleteError) throw deleteError;

        // Insert the current images in their selected order.
        if (slideImages.length > 0) {
          const slideRows = slideImages.map((image, index) => ({
            subcategory_slug: savedSlug,
            image_url: image.image_url,
            sort_order: index + 1,
            is_active: image.is_active,
          }));

          const { error: slideError } = await supabase
            .from("subcategory_slides")
            .insert(slideRows);

          if (slideError) throw slideError;
        }
      }

      notify(
        "success",
        isSubcategory
          ? "Subcategory and slideshow saved successfully."
          : "Collection saved successfully.",
      );

      setShowForm(false);
      setEditing(null);
      setForm(emptyForm);
      setSlideImages([]);

      await loadCategories();
    } catch (error) {
      console.error("Save category error:", error);

      setFormError(
        error.message || "We couldn't save this collection. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  // --------------------------------------------------
  // VISIBILITY
  // --------------------------------------------------

  const toggleVisibility = async (category) => {
    setUpdatingId(category.id);

    try {
      const { error } = await supabase
        .from("store_categories")
        .update({
          is_active: !category.is_active,
          updated_at: new Date().toISOString(),
        })
        .eq("id", category.id);

      if (error) throw error;

      notify(
        "success",
        `${category.name} is now ${category.is_active ? "hidden" : "visible"}.`,
      );

      await loadCategories();
    } catch (error) {
      console.error("Visibility update error:", error);
      notify("error", error.message || "Couldn't update visibility.");
    } finally {
      setUpdatingId(null);
    }
  };

  // --------------------------------------------------
  // CATEGORY ORDER
  // --------------------------------------------------

  const moveItem = async (category, direction) => {
    const siblings = categories
      .filter((item) => item.parent_id === category.parent_id)
      .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

    const currentIndex = siblings.findIndex((item) => item.id === category.id);

    const nextIndex = currentIndex + direction;

    if (nextIndex < 0 || nextIndex >= siblings.length) return;

    const currentItem = siblings[currentIndex];
    const nextItem = siblings[nextIndex];

    setUpdatingId(category.id);

    try {
      const firstOrder = currentItem.sort_order || currentIndex + 1;

      const secondOrder = nextItem.sort_order || nextIndex + 1;

      const { error: firstError } = await supabase
        .from("store_categories")
        .update({
          sort_order: secondOrder,
          updated_at: new Date().toISOString(),
        })
        .eq("id", currentItem.id);

      if (firstError) throw firstError;

      const { error: secondError } = await supabase
        .from("store_categories")
        .update({
          sort_order: firstOrder,
          updated_at: new Date().toISOString(),
        })
        .eq("id", nextItem.id);

      if (secondError) throw secondError;

      await loadCategories();
      notify("success", "Display order updated.");
    } catch (error) {
      console.error("Reorder error:", error);
      notify("error", error.message || "Couldn't change the order.");
      await loadCategories();
    } finally {
      setUpdatingId(null);
    }
  };

  // --------------------------------------------------
  // EXPAND / COLLAPSE
  // --------------------------------------------------

  const toggleExpanded = (id) => {
    setExpanded((previous) => ({
      ...previous,
      [id]: !previous[id],
    }));
  };

  const expandAll = () => {
    const next = {};

    filteredCategories.forEach((item) => {
      next[item.id] = true;
    });

    setExpanded(next);
  };

  const collapseAll = () => setExpanded({});

  // --------------------------------------------------
  // CATEGORY ACTIONS
  // --------------------------------------------------

  const CategoryActions = ({ category, index, total }) => (
    <div className="flex items-center gap-1 sm:gap-1.5">
      <button
        type="button"
        onClick={() => moveItem(category, -1)}
        disabled={index === 0 || updatingId === category.id}
        title="Move up"
        className="rounded-lg border border-[#eee3df] p-1.5 text-gray-500 transition hover:bg-[#fff6f1] hover:text-[#76233a] disabled:opacity-30 sm:p-2"
      >
        <ArrowUp size={14} />
      </button>

      <button
        type="button"
        onClick={() => moveItem(category, 1)}
        disabled={index === total - 1 || updatingId === category.id}
        title="Move down"
        className="rounded-lg border border-[#eee3df] p-1.5 text-gray-500 transition hover:bg-[#fff6f1] hover:text-[#76233a] disabled:opacity-30 sm:p-2"
      >
        <ArrowDown size={14} />
      </button>

      <button
        type="button"
        onClick={() => openEdit(category)}
        title="Edit collection"
        className="rounded-lg border border-[#eee3df] p-1.5 text-[#76233a] transition hover:bg-[#fff6f1] sm:p-2"
      >
        <Pencil size={14} />
      </button>

      <button
        type="button"
        onClick={() => toggleVisibility(category)}
        disabled={updatingId === category.id}
        title={category.is_active ? "Hide collection" : "Show collection"}
        className={`rounded-lg p-1.5 transition disabled:opacity-40 sm:p-2 ${
          category.is_active
            ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
            : "bg-green-50 text-green-700 hover:bg-green-100"
        }`}
      >
        {updatingId === category.id ? (
          <RefreshCw size={14} className="animate-spin" />
        ) : category.is_active ? (
          <EyeOff size={14} />
        ) : (
          <Eye size={14} />
        )}
      </button>
    </div>
  );

  // --------------------------------------------------
  // MAIN PAGE
  // --------------------------------------------------

  return (
    <AdminLayout
      title="Category Studio"
      subtitle="Organise your store collections and subcategories."
      active="categories"
      actions={
        <button
          type="button"
          onClick={() => openAdd()}
          className="inline-flex items-center gap-2 rounded-xl bg-[#76233a] px-3.5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#421521] sm:px-4 sm:text-sm"
        >
          <Plus size={17} />
          <span className="hidden sm:inline">New collection</span>
          <span className="sm:hidden">Add new</span>
        </button>
      }
    >
      <div className="space-y-6">
        {/* STATISTICS */}

        <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            {
              label: "Main collections",
              value: mainCategories.length,
              icon: LayoutGrid,
              color: "bg-[#f8e8e5] text-[#76233a]",
            },
            {
              label: "Subcategories",
              value: subcategoryCount,
              icon: Layers,
              color: "bg-[#fff1dc] text-[#a76812]",
            },
            {
              label: "Visible",
              value: activeCount,
              icon: Eye,
              color: "bg-green-50 text-green-700",
            },
            {
              label: "Hidden",
              value: hiddenCount,
              icon: EyeOff,
              color: "bg-gray-100 text-gray-600",
            },
          ].map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.label}
                className="rounded-2xl border border-[#eee5e0] bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-5"
              >
                <div className="flex items-center justify-between gap-2">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.color}`}
                  >
                    <Icon size={19} />
                  </div>

                  <span className="text-2xl font-bold tabular-nums text-[#421521] sm:text-3xl">
                    {stat.value}
                  </span>
                </div>

                <p className="mt-3 text-xs font-medium text-gray-500 sm:text-sm">
                  {stat.label}
                </p>
              </div>
            );
          })}
        </section>

        {/* CATEGORY TOOLBAR */}

        <section className="rounded-2xl border border-[#eee5e0] bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h3 className="text-lg font-bold text-[#29201f]">
                Your collections
              </h3>

              <p className="mt-1 text-xs text-gray-500 sm:text-sm">
                Manage the collections customers browse in your store.
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative min-w-0 sm:w-64">
                <Search
                  size={17}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search collections..."
                  className="w-full rounded-xl border border-[#eaded9] bg-[#fffdfb] py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-[#76233a] focus:ring-2 focus:ring-[#76233a]/10"
                />
              </div>

              <div className="relative">
                <ListFilter
                  size={16}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <select
                  value={visibilityFilter}
                  onChange={(event) => setVisibilityFilter(event.target.value)}
                  className="w-full appearance-none rounded-xl border border-[#eaded9] bg-white py-2.5 pl-9 pr-8 text-sm text-gray-700 outline-none focus:border-[#76233a] sm:w-36"
                >
                  <option value="all">All status</option>
                  <option value="visible">Visible</option>
                  <option value="hidden">Hidden</option>
                </select>
              </div>

              <button
                type="button"
                onClick={loadCategories}
                disabled={loading}
                title="Refresh collections"
                className="flex items-center justify-center gap-2 rounded-xl border border-[#eaded9] bg-white px-3 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-[#fff8f4] disabled:opacity-50"
              >
                <RefreshCw
                  size={16}
                  className={loading ? "animate-spin" : ""}
                />
                <span className="sm:hidden">Refresh</span>
              </button>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-[#f2ebe7] pt-3">
            <p className="text-xs text-gray-400">
              Showing{" "}
              <span className="font-semibold text-gray-600">
                {filteredCategories.length}
              </span>{" "}
              of {mainCategories.length} collections
            </p>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={expandAll}
                className="text-xs font-semibold text-[#76233a] hover:underline"
              >
                Expand all
              </button>

              <button
                type="button"
                onClick={collapseAll}
                className="text-xs font-semibold text-gray-500 hover:text-[#76233a]"
              >
                Collapse all
              </button>
            </div>
          </div>
        </section>

        {/* NOTIFICATIONS */}

        {notice && (
          <div
            className={`flex items-start gap-2 rounded-xl border px-4 py-3 text-sm ${
              notice.type === "success"
                ? "border-green-200 bg-green-50 text-green-800"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {notice.type === "success" ? (
              <Check size={17} className="mt-0.5 shrink-0" />
            ) : (
              <AlertCircle size={17} className="mt-0.5 shrink-0" />
            )}

            <span>{notice.message}</span>
          </div>
        )}

        {/* CATEGORY CARDS */}

        {loading ? (
          <div className="rounded-2xl border border-[#eee5e0] bg-white p-12 text-center">
            <RefreshCw
              className="mx-auto animate-spin text-[#76233a]"
              size={26}
            />

            <p className="mt-3 text-sm text-gray-500">
              Loading your collections...
            </p>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#e6d4ce] bg-white px-5 py-14 text-center">
            <FolderOpen size={40} className="mx-auto text-[#c5a49c]" />

            <h3 className="mt-4 font-semibold text-[#29201f]">
              No collections found
            </h3>

            <p className="mx-auto mt-1 max-w-sm text-sm text-gray-500">
              Try changing your search or filter, or create a new collection.
            </p>

            <button
              type="button"
              onClick={() => openAdd()}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#76233a] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#421521]"
            >
              <Plus size={16} />
              Create collection
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-2 xl:grid-cols-3 sm:gap-4">
            {filteredCategories.map((category) => {
              const children = getChildren(category.id);
              const isExpanded = Boolean(expanded[category.id]);

              const originalIndex = mainCategories.findIndex(
                (item) => item.id === category.id,
              );

              return (
                <article
                  key={category.id}
                  className="group overflow-hidden rounded-[22px] border border-[#eee5e0] bg-white shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-lg"
                >
                  {/* COLLECTION IMAGE */}

                  <div className="relative h-28 overflow-hidden bg-gradient-to-br from-[#f8e8e5] to-[#fff4e8] sm:h-40">
                    {category.image_url ? (
                      <img
                        src={category.image_url}
                        alt={category.name}
                        className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                        onError={(event) => {
                          event.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <FolderOpen
                          size={38}
                          strokeWidth={1.2}
                          className="text-[#c79c91] sm:h-12 sm:w-12"
                        />
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/5 to-transparent" />

                    <div className="absolute left-2.5 top-2.5 sm:left-3 sm:top-3">
                      <span
                        className={`rounded-full px-2 py-1 text-[9px] font-bold tracking-wide shadow-sm sm:px-3 sm:py-1.5 sm:text-[10px] ${
                          category.is_active
                            ? "bg-white text-green-700"
                            : "bg-black/65 text-white"
                        }`}
                      >
                        {category.is_active ? "● VISIBLE IN STORE" : "HIDDEN"}
                      </span>
                    </div>

                    <div className="absolute bottom-2.5 left-3 right-3 flex items-end justify-between gap-2 sm:bottom-3 sm:left-4 sm:right-4 sm:gap-3">
                      <div className="min-w-0 text-white">
                        <h3 className="truncate font-serif text-lg font-semibold sm:text-2xl">
                          {category.name}
                        </h3>

                        <p className="mt-0.5 text-[11px] text-white/80 sm:mt-1 sm:text-xs">
                          {children.length}{" "}
                          {children.length === 1
                            ? "subcategory"
                            : "subcategories"}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => toggleExpanded(category.id)}
                        aria-label={
                          isExpanded
                            ? "Collapse subcategories"
                            : "Expand subcategories"
                        }
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-[#76233a] shadow-md transition hover:scale-105 sm:h-9 sm:w-9"
                      >
                        {isExpanded ? (
                          <ChevronUp size={17} />
                        ) : (
                          <ChevronDown size={17} />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* COLLECTION INFORMATION */}

                  <div className="p-3 sm:p-4">
                    <p className="mb-3 min-h-[32px] text-[11px] leading-4 text-gray-500 sm:mb-4 sm:min-h-[36px] sm:text-xs sm:leading-5">
                      {category.description ||
                        "Add a short description to introduce this collection to customers."}
                    </p>

                    <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3">
                      <CategoryActions
                        category={category}
                        index={originalIndex}
                        total={mainCategories.length}
                      />

                      <button
                        type="button"
                        onClick={() => openAdd(category.id)}
                        className="inline-flex items-center gap-1 rounded-lg bg-[#fff1eb] px-2.5 py-2 text-[11px] font-bold text-[#76233a] transition hover:bg-[#f8e2da] sm:gap-1.5 sm:px-3 sm:py-2 sm:text-xs"
                      >
                        <Plus size={14} />
                        Add subcategory
                      </button>
                    </div>

                    {/* SUBCATEGORIES */}

                    {isExpanded && (
                      <div className="mt-3 border-t border-[#f0e7e3] pt-3 sm:mt-4 sm:pt-4">
                        <div className="mb-3 flex items-center justify-between">
                          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400 sm:text-[11px]">
                            <Layers size={14} />
                            Subcategories
                          </div>

                          <span className="text-[11px] text-gray-400 sm:text-xs">
                            {children.length} total
                          </span>
                        </div>

                        {children.length === 0 ? (
                          <div className="rounded-xl bg-[#fffaf7] px-3 py-4 text-center sm:px-4 sm:py-5">
                            <Package
                              size={23}
                              className="mx-auto text-[#c9aaa1]"
                            />

                            <p className="mt-2 text-[11px] text-gray-500 sm:text-xs">
                              No subcategories in this collection yet.
                            </p>

                            <button
                              type="button"
                              onClick={() => openAdd(category.id)}
                              className="mt-2 text-[11px] font-bold text-[#76233a] hover:underline sm:text-xs"
                            >
                              + Add your first subcategory
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {children.map((child, childIndex) => (
                              <div
                                key={child.id}
                                className="flex flex-col gap-2 rounded-xl border border-[#f0e8e4] bg-[#fffdfb] p-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:p-3"
                              >
                                <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#f8e8e5] text-[#76233a] sm:h-9 sm:w-9">
                                    <FolderOpen size={15} />
                                  </div>

                                  <div className="min-w-0">
                                    <p className="truncate text-xs font-semibold text-[#29201f] sm:text-sm">
                                      {child.name}
                                    </p>

                                    <p
                                      className={`mt-0.5 text-[10px] font-medium sm:text-[11px] ${
                                        child.is_active
                                          ? "text-green-700"
                                          : "text-gray-400"
                                      }`}
                                    >
                                      {child.is_active ? "Visible" : "Hidden"}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-1 self-end sm:self-auto sm:gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => moveItem(child, -1)}
                                    disabled={
                                      childIndex === 0 ||
                                      updatingId === child.id
                                    }
                                    title="Move up"
                                    className="rounded-lg border border-[#eee3df] p-1.5 text-gray-500 hover:bg-white disabled:opacity-30 sm:p-2"
                                  >
                                    <ArrowUp size={13} />
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => moveItem(child, 1)}
                                    disabled={
                                      childIndex === children.length - 1 ||
                                      updatingId === child.id
                                    }
                                    title="Move down"
                                    className="rounded-lg border border-[#eee3df] p-1.5 text-gray-500 hover:bg-white disabled:opacity-30 sm:p-2"
                                  >
                                    <ArrowDown size={13} />
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => openEdit(child)}
                                    title="Edit subcategory"
                                    className="rounded-lg border border-[#eee3df] p-1.5 text-[#76233a] hover:bg-white sm:p-2"
                                  >
                                    <Pencil size={13} />
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => toggleVisibility(child)}
                                    disabled={updatingId === child.id}
                                    title={child.is_active ? "Hide" : "Show"}
                                    className="rounded-lg border border-[#eee3df] p-1.5 text-gray-500 hover:bg-white disabled:opacity-40 sm:p-2"
                                  >
                                    {updatingId === child.id ? (
                                      <RefreshCw
                                        size={13}
                                        className="animate-spin"
                                      />
                                    ) : child.is_active ? (
                                      <EyeOff size={13} />
                                    ) : (
                                      <Eye size={13} />
                                    )}
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {!loading && hiddenCount > 0 && (
          <p className="pb-2 text-center text-xs text-gray-400">
            {hiddenCount} hidden{" "}
            {hiddenCount === 1
              ? "collection or subcategory"
              : "collections or subcategories"}{" "}
            are not currently visible to customers.
          </p>
        )}
      </div>

      {/* ------------------------------------------------
          ADD / EDIT MODAL
      ------------------------------------------------ */}

      {showForm && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center overflow-y-auto bg-[#211316]/60 p-3 backdrop-blur-sm sm:p-5"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeForm();
          }}
        >
          <div className="my-auto w-full max-w-lg overflow-hidden rounded-[24px] bg-white shadow-2xl">
            {/* MODAL HEADER */}

            <div className="relative overflow-hidden bg-gradient-to-r from-[#421521] to-[#76233a] px-5 py-5 text-white sm:px-6">
              <div className="pointer-events-none absolute -right-8 -top-12 h-36 w-36 rounded-full border-[20px] border-white/5" />

              <div className="relative flex items-start justify-between gap-3">
                <div>
                  <div className="mb-2 flex items-center gap-2 text-[10px] font-bold tracking-[0.15em] text-[#f4cbbd]">
                    <Sparkles size={13} />
                    PURV COLLECTIONS
                  </div>

                  <h2 className="font-serif text-2xl font-semibold">
                    {editing
                      ? editing.parent_id
                        ? "Edit subcategory"
                        : "Edit collection"
                      : form.parent_id
                        ? "Add subcategory"
                        : "Create collection"}
                  </h2>

                  <p className="mt-1 text-xs text-white/65">
                    Add the details for your store collection.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeForm}
                  disabled={saving || uploadingSlides || uploadingMainImage}
                  aria-label="Close form"
                  className="rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20 disabled:opacity-50"
                >
                  <X size={19} />
                </button>
              </div>
            </div>

            {/* MODAL FORM */}

            <form
              onSubmit={saveCategory}
              className="max-h-[75vh] space-y-4 overflow-y-auto p-5 sm:p-6"
            >
              {/* PARENT COLLECTION */}

              {!editing && (
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#29201f]">
                    Collection type
                  </label>

                  <select
                    value={form.parent_id}
                    onChange={(event) => {
                      setForm((previous) => ({
                        ...previous,
                        parent_id: event.target.value,
                      }));
                      setSlideImages([]);
                    }}
                    className="w-full rounded-xl border border-[#eaded9] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#76233a] focus:ring-2 focus:ring-[#76233a]/10"
                  >
                    <option value="">Main collection</option>

                    {mainCategories
                      .filter((item) => item.is_active)
                      .map((item) => (
                        <option key={item.id} value={item.id}>
                          Subcategory under {item.name}
                        </option>
                      ))}
                  </select>
                </div>
              )}

              {/* NAME */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-[#29201f]">
                  {form.parent_id || editing?.parent_id
                    ? "Subcategory name *"
                    : "Collection name *"}
                </label>

                <input
                  autoFocus
                  value={form.name}
                  onChange={(event) =>
                    setForm((previous) => ({
                      ...previous,
                      name: event.target.value,
                    }))
                  }
                  placeholder="e.g. Daily Puja"
                  required
                  className="w-full rounded-xl border border-[#eaded9] px-4 py-3 text-sm outline-none transition focus:border-[#76233a] focus:ring-2 focus:ring-[#76233a]/10"
                />
              </div>

              {/* DESCRIPTION */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-[#29201f]">
                  Short description
                </label>

                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(event) =>
                    setForm((previous) => ({
                      ...previous,
                      description: event.target.value,
                    }))
                  }
                  placeholder="Tell customers what they can find here..."
                  className="w-full resize-none rounded-xl border border-[#eaded9] px-4 py-3 text-sm outline-none transition focus:border-[#76233a] focus:ring-2 focus:ring-[#76233a]/10"
                />
              </div>

              {/* SUBCATEGORY SLIDESHOW UPLOAD */}

              {form.parent_id || editing?.parent_id ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <label className="block text-sm font-semibold text-[#29201f]">
                        Subcategory slideshow
                      </label>

                      <p className="mt-1 text-[11px] text-gray-500">
                        Upload up to 5 images directly from your device.
                      </p>
                    </div>

                    <span className="shrink-0 rounded-full bg-[#f8e8e5] px-3 py-1 text-xs font-bold text-[#76233a]">
                      {slideImages.length}/5
                    </span>
                  </div>

                  {loadingSlides ? (
                    <div className="rounded-xl border border-[#eaded9] p-5 text-center">
                      <RefreshCw
                        size={22}
                        className="mx-auto animate-spin text-[#76233a]"
                      />

                      <p className="mt-2 text-xs text-gray-500">
                        Loading saved slideshow images...
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* UPLOAD BUTTON */}

                      <label
                        className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#cda9a0] bg-[#fffaf7] px-4 py-7 text-center transition hover:bg-[#fff1eb] ${
                          slideImages.length >= MAX_SLIDES || uploadingSlides
                            ? "cursor-not-allowed opacity-60"
                            : "cursor-pointer"
                        }`}
                      >
                        {uploadingSlides ? (
                          <RefreshCw
                            size={30}
                            className="animate-spin text-[#76233a]"
                          />
                        ) : (
                          <ImageIcon size={30} className="text-[#76233a]" />
                        )}

                        <span className="mt-2 text-sm font-bold text-[#76233a]">
                          {uploadingSlides
                            ? "Uploading images..."
                            : "Upload from Device"}
                        </span>

                        <span className="mt-1 text-[11px] text-gray-500">
                          JPG, PNG, WEBP or GIF · Maximum 5 MB each
                        </span>

                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/gif"
                          multiple
                          disabled={
                            uploadingSlides || slideImages.length >= MAX_SLIDES
                          }
                          onChange={uploadSubcategoryImages}
                          className="hidden"
                        />
                      </label>

                      {/* IMAGE LIST */}

                      {slideImages.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-xs font-semibold text-gray-600">
                            Uploaded images · Arrange their display order
                          </p>

                          {slideImages.map((image, index) => (
                            <div
                              key={image.id || image.image_url}
                              className="flex items-center gap-2 rounded-xl border border-[#eee5e0] bg-white p-2 sm:gap-3"
                            >
                              <img
                                src={image.image_url}
                                alt={`Slide ${index + 1}`}
                                className="h-16 w-20 shrink-0 rounded-lg object-cover"
                              />

                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-bold text-[#76233a]">
                                  Image {index + 1}
                                </p>

                                <button
                                  type="button"
                                  onClick={() => toggleSlideImage(index)}
                                  className={`mt-1 text-left text-[11px] font-semibold ${
                                    image.is_active
                                      ? "text-green-700"
                                      : "text-gray-400"
                                  }`}
                                >
                                  {image.is_active
                                    ? "Visible to customers"
                                    : "Hidden from customers"}
                                </button>
                              </div>

                              <div className="flex shrink-0 items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => moveSlideImage(index, -1)}
                                  disabled={index === 0}
                                  className="rounded-lg border border-[#eaded9] p-1.5 text-gray-500 hover:bg-[#fff8f4] disabled:opacity-30"
                                  title="Move up"
                                >
                                  <ArrowUp size={14} />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => moveSlideImage(index, 1)}
                                  disabled={index === slideImages.length - 1}
                                  className="rounded-lg border border-[#eaded9] p-1.5 text-gray-500 hover:bg-[#fff8f4] disabled:opacity-30"
                                  title="Move down"
                                >
                                  <ArrowDown size={14} />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => removeSlideImage(index)}
                                  className="rounded-lg border border-red-100 p-1.5 text-red-500 hover:bg-red-50"
                                  title="Remove image"
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {slideImages.length === 0 && (
                        <p className="rounded-xl bg-[#fffaf7] p-3 text-center text-xs text-gray-500">
                          No slideshow images added yet.
                        </p>
                      )}
                    </>
                  )}
                </div>
              ) : (
                <div>
                  {/* MAIN COLLECTION IMAGE UPLOAD */}

                  <label className="mb-2 block text-sm font-semibold text-[#29201f]">
                    Main collection image
                  </label>

                  <label
                    className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#d9b9ae] bg-[#fffaf7] px-4 py-7 text-center transition hover:border-[#76233a] hover:bg-[#fff1eb] ${
                      uploadingMainImage ? "cursor-not-allowed opacity-60" : ""
                    }`}
                  >
                    {uploadingMainImage ? (
                      <RefreshCw
                        size={30}
                        className="animate-spin text-[#76233a]"
                      />
                    ) : (
                      <ImageIcon size={30} className="text-[#76233a]" />
                    )}

                    <span className="mt-2 text-sm font-bold text-[#76233a]">
                      {uploadingMainImage
                        ? "Uploading image..."
                        : "Upload from Device"}
                    </span>

                    <span className="mt-1 text-xs text-gray-500">
                      Choose an image from your computer or phone
                    </span>

                    <span className="mt-1 text-[11px] text-gray-400">
                      JPG, PNG, WEBP or GIF · Maximum 5 MB
                    </span>

                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      onChange={uploadMainCollectionImage}
                      disabled={uploadingMainImage || saving}
                      className="hidden"
                    />
                  </label>

                  {/* IMAGE PREVIEW */}

                  {form.image_url && (
                    <div className="mt-4 overflow-hidden rounded-xl border border-[#eee3df] bg-white p-3">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-600">
                          Image preview
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            setForm((previous) => ({
                              ...previous,
                              image_url: "",
                            }))
                          }
                          disabled={saving || uploadingMainImage}
                          className="text-xs font-semibold text-red-600 hover:text-red-800 disabled:opacity-50"
                        >
                          Remove image
                        </button>
                      </div>

                      <img
                        src={form.image_url}
                        alt="Main collection preview"
                        className="h-40 w-full rounded-lg object-cover"
                        onError={(event) => {
                          event.currentTarget.style.display = "none";
                        }}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* FORM ERROR */}

              {formError && (
                <div className="flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                  <AlertCircle size={17} className="mt-0.5 shrink-0" />

                  <span>{formError}</span>
                </div>
              )}

              {/* FORM ACTIONS */}

              <div className="flex flex-col-reverse gap-2 border-t border-[#f1e8e4] pt-4 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeForm}
                  disabled={saving || uploadingSlides || uploadingMainImage}
                  className="rounded-xl border border-[#eaded9] px-5 py-3 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    saving ||
                    uploadingSlides ||
                    uploadingMainImage ||
                    loadingSlides
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#76233a] px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#421521] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving || uploadingSlides || uploadingMainImage ? (
                    <RefreshCw size={16} className="animate-spin" />
                  ) : (
                    <Save size={16} />
                  )}

                  {uploadingMainImage
                    ? "Uploading image..."
                    : uploadingSlides
                      ? "Uploading images..."
                      : saving
                        ? "Saving..."
                        : editing
                          ? "Save changes"
                          : "Create collection"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
