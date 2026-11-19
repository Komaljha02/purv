import { useCallback, useEffect, useRef, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";
import AdminLayout from "./AdminLayout";
import {
  Plus,
  Pencil,
  Trash2,
  RefreshCw,
  Upload,
  ImagePlus,
  LoaderCircle,
  AlertCircle,
  CheckCircle,
  Search,
  X,
  Package,
  Boxes,
  AlertTriangle,
  FolderTree,
  Sparkles,
} from "lucide-react";
const BUCKET_NAME = "purv-products";
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const emptyForm = {
  name: "",
  description: "",
  price: "",
  original_price: "",
  category: "",
  category_slug: "",
  subcategory_slug: "",
  image_url: "",
  stock: "0",
};

const inputClass =
  "w-full rounded-xl border border-[#e9dedb] bg-white px-4 py-3 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-[#a65c70] focus:ring-2 focus:ring-[#76233a]/10";

const buttonPrimary =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-[#76233a] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#5d1b2d] disabled:cursor-not-allowed disabled:opacity-50";

function createCategorySlug(category) {
  return category
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function getImageExtension(file) {
  const extensions = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
  };

  return extensions[file.type] || null;
}

// NEW HELPER: Gets up to 4 saved product images
function getSavedProductImages(product) {
  let images = product.images || [];

  if (typeof images === "string") {
    try {
      images = JSON.parse(images);
    } catch {
      images = [];
    }
  }

  if (!Array.isArray(images)) images = [];

  return [product.image_url, ...images]
    .filter(
      (url, index, array) =>
        typeof url === "string" && url.trim() && array.indexOf(url) === index,
    )
    .slice(0, 4);
}

function money(value) {
  return `₹${Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;
}

function StatCard({
  label,
  value,
  note,
  icon: Icon,
  tone = "wine",
  onClick,
  active = false,
}) {
  const tones = {
    wine: "bg-[#f8e9ed] text-[#76233a]",
    green: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    red: "bg-red-50 text-red-600",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`group w-full rounded-2xl border bg-white p-4 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#d9b9c0] hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#76233a] focus-visible:ring-offset-2 sm:p-5 ${
        active
          ? "border-[#76233a] ring-2 ring-[#76233a]/10 shadow-md"
          : "border-[#eee3df]"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm text-gray-500 transition group-hover:text-[#76233a]">
            {label}
          </p>

          <p className="mt-2 text-2xl font-bold tracking-tight text-[#421521] sm:text-3xl">
            {value}
          </p>

          <p className="mt-1 text-xs text-gray-400">{note}</p>
        </div>

        <div
          className={`shrink-0 rounded-xl p-3 transition-transform duration-300 group-hover:scale-110 ${tones[tone]}`}
        >
          <Icon size={20} />
        </div>
      </div>

      <p className="mt-3 text-[10px] font-semibold text-[#76233a] opacity-0 transition-opacity duration-200 group-hover:opacity-100">
        View products →
      </p>
    </button>
  );
}

export default function AdminProducts() {
  const navigate = useNavigate();
  const catalogueRef = useRef(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [storeCategories, setStoreCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  const [imageItems, setImageItems] = useState([]);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");

  // Verify admin access
  const verifyAdmin = useCallback(async () => {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      navigate("/admin/login", { replace: true });
      return false;
    }

    const { data: admin, error: adminError } = await supabase
      .from("admin_users")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (adminError) {
      throw new Error(`Could not verify admin access: ${adminError.message}`);
    }

    if (!admin) {
      await supabase.auth.signOut();
      navigate("/admin/login", { replace: true });
      return false;
    }

    return true;
  }, [navigate]);

  // Load products
  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const isAdmin = await verifyAdmin();

      if (!isAdmin) return;

      const { data, error: productsError } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (productsError) throw productsError;

      setProducts(data || []);
    } catch (err) {
      setError(err.message || "Unable to load products.");
    } finally {
      setLoading(false);
    }
  }, [verifyAdmin]);

  // Load main categories and subcategories
  const loadStoreCategories = useCallback(async () => {
    setCategoriesLoading(true);

    try {
      const { data, error } = await supabase
        .from("store_categories")
        .select("id, name, slug, parent_id, is_active, sort_order")
        .order("sort_order", { ascending: true });

      if (error) throw error;

      setStoreCategories(data || []);
    } catch (err) {
      console.error("Category loading error:", err);
      setError("Unable to load categories. Please refresh and try again.");
    } finally {
      setCategoriesLoading(false);
    }
  }, []);

  // Selected category and subcategory values
  const selectedCategoryRecord = storeCategories.find(
    (category) => category.slug === form.category_slug,
  );

  const selectedMainCategoryId = selectedCategoryRecord?.parent_id
    ? selectedCategoryRecord.parent_id
    : selectedCategoryRecord?.id || "";

  const mainCategoryOptions = storeCategories.filter(
    (category) =>
      !category.parent_id &&
      (category.is_active || category.id === selectedMainCategoryId),
  );

  const subcategoryOptions = storeCategories
    .filter(
      (category) =>
        category.parent_id === selectedMainCategoryId &&
        (category.is_active || category.slug === form.category_slug),
    )
    .sort((a, b) => a.sort_order - b.sort_order);

  // Initial loading
  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    loadStoreCategories();
  }, [loadStoreCategories]);

  function clearMessages() {
    setError("");
    setSuccess("");
  }
  function resetForm() {
    imageItems.forEach((item) => {
      if (item.preview) URL.revokeObjectURL(item.preview);
    });

    setForm(emptyForm);
    setEditingId(null);
    setImageItems([]);
    setShowForm(false);
  }

  function openAddForm() {
    clearMessages();
    setForm(emptyForm);
    setEditingId(null);
    setImageItems([]);
    setShowForm(true);

    loadStoreCategories();
  }

  function openEditForm(product) {
    clearMessages();
    setEditingId(product.id);

    const matchedSubcategory = storeCategories.find(
      (category) => category.slug === product.subcategory_slug,
    );

    const matchedCategory =
      storeCategories.find(
        (category) => category.slug === product.category_slug,
      ) ||
      storeCategories.find(
        (category) => !category.parent_id && category.name === product.category,
      );

    const mainCategory = matchedSubcategory
      ? storeCategories.find(
          (category) => category.id === matchedSubcategory.parent_id,
        )
      : matchedCategory?.parent_id
        ? storeCategories.find(
            (category) => category.id === matchedCategory.parent_id,
          )
        : matchedCategory;

    setForm({
      name: product.name || "",
      description: product.description || "",
      price: product.price ?? "",
      original_price: product.original_price ?? "",
      category: mainCategory?.name || product.category || "",
      category_slug: mainCategory?.slug || product.category_slug || "",
      subcategory_slug:
        product.subcategory_slug ||
        (matchedCategory?.parent_id ? matchedCategory.slug : ""),
      image_url: product.image_url || "",
      stock: product.stock ?? 0,
    });

    setImageItems(
      getSavedProductImages(product).map((url) => ({
        url,
        file: null,
        preview: url,
      })),
    );

    setShowForm(true);
    loadStoreCategories();

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      category: selected?.name || "",
      category_slug: selected?.slug || "",
      subcategory_slug: "",
    }));
  }

  // Select product image
  function handleImageSelect(event) {
    clearMessages();

    const files = Array.from(event.target.files || []);

    if (!files.length) return;

    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];

    const remainingSlots = 4 - imageItems.length;

    if (remainingSlots <= 0) {
      setError("You can add a maximum of 4 product images.");
      event.target.value = "";
      return;
    }

    const acceptedFiles = [];

    for (const file of files) {
      if (!validTypes.includes(file.type)) {
        setError("Only JPG, PNG, WebP, or GIF images are allowed.");
        continue;
      }

      if (file.size > MAX_IMAGE_SIZE) {
        setError(`${file.name} is larger than 5 MB.`);
        continue;
      }

      acceptedFiles.push(file);
    }

    const filesToAdd = acceptedFiles.slice(0, remainingSlots);

    if (acceptedFiles.length > remainingSlots) {
      setError("Only 4 images are allowed. Extra images were not added.");
    }

    setImageItems((previous) => [
      ...previous,
      ...filesToAdd.map((file) => ({
        url: "",
        file,
        preview: URL.createObjectURL(file),
      })),
    ]);

    event.target.value = "";
  }
  // Upload image to Supabase Storage
  async function uploadProductImage(file) {
    const extension = getImageExtension(file);

    if (!extension) {
      throw new Error("Unsupported image format.");
    }

    const filePath = `${crypto.randomUUID()}.${extension}`;

    const { data, error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: "3600",
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) throw uploadError;

    const { data: publicData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(data.path);

    if (!publicData?.publicUrl) {
      throw new Error(
        "The image uploaded, but its public URL could not be created.",
      );
    }

    return publicData.publicUrl;
  }

  // Save or update product
  async function handleSave(event) {
    event.preventDefault();

    clearMessages();

    const name = form.name.trim();
    const category = form.category.trim();
    const categorySlug = form.category_slug || createCategorySlug(category);

    const price = Number(form.price);

    const originalPrice =
      form.original_price === "" ? null : Number(form.original_price);

    const stock = Number(form.stock);

    if (!name) {
      setError("Please enter a product name.");
      return;
    }

    if (!selectedMainCategoryId || !category || !categorySlug) {
      setError("Please select a valid main category before saving.");
      return;
    }

    if (form.price === "" || !Number.isFinite(price) || price < 0) {
      setError("Enter a valid product price.");
      return;
    }

    if (
      originalPrice !== null &&
      (!Number.isFinite(originalPrice) || originalPrice < 0)
    ) {
      setError("Enter a valid original price or leave it empty.");
      return;
    }

    if (form.stock === "" || !Number.isInteger(stock) || stock < 0) {
      setError("Stock must be a whole number of zero or more.");
      return;
    }

    if (originalPrice !== null && originalPrice < price) {
      setError(
        "Original price should be greater than or equal to the selling price.",
      );
      return;
    }

    setSaving(true);

    try {
      const isAdmin = await verifyAdmin();

      if (!isAdmin) return;

      setUploading(true);

      const uploadedImages = await Promise.all(
        imageItems.map(async (item) => {
          if (item.file) {
            return await uploadProductImage(item.file);
          }

          return item.url;
        }),
      );

      const finalImages = uploadedImages
        .filter(Boolean)
        .filter((url, index, array) => array.indexOf(url) === index)
        .slice(0, 4);

      // Keep the existing image URL as a fallback if no gallery image exists.
      if (finalImages.length === 0 && form.image_url.trim()) {
        finalImages.push(form.image_url.trim());
      }

      const imageUrl = finalImages[0] || null;

      const productData = {
        name,
        description: form.description.trim(),
        price,
        original_price: originalPrice,
        category,
        category_slug: categorySlug,
        subcategory_slug: form.subcategory_slug || null,
        image_url: imageUrl,
        images: finalImages,
        stock,
      };
      console.log("STEP 4: Sending product data to Supabase:", productData);
      const result =
        editingId !== null
          ? await supabase
              .from("products")
              .update(productData)
              .eq("id", editingId)
              .select()
              .single()
          : await supabase
              .from("products")
              .insert([productData])
              .select()
              .single();

      if (result.error) throw result.error;
      console.log("STEP 5: Supabase response:", result);
      setSuccess(
        editingId !== null
          ? "Product updated successfully."
          : "Product added successfully.",
      );

      resetForm();
      await loadProducts();
    } catch (err) {
      console.error("PRODUCT SAVE ERROR:", err);

      console.error("ERROR DETAILS:", {
        message: err.message,
        code: err.code,
        details: err.details,
        hint: err.hint,
      });

      setError(
        err.message ||
          err.details ||
          "Could not save the product. Check the browser console.",
      );
    } finally {
      setSaving(false);
      setUploading(false);
    }
  } // This closes handleSave — it was missing!

  // Delete product
  async function handleDelete(product) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${product.name}"? This cannot be undone.`,
    );

    if (!confirmed) return;

    clearMessages();

    try {
      console.log("STEP 1: Checking admin access...");

      const isAdmin = await verifyAdmin();

      console.log("STEP 2: Admin verification result:", isAdmin);

      if (!isAdmin) {
        setError("Admin verification failed. Please log in again.");
        return;
      }

      console.log("STEP 3: Admin verified. Preparing product...");

      const { error: deleteError } = await supabase
        .from("products")
        .delete()
        .eq("id", product.id);

      if (deleteError) throw deleteError;

      setProducts((previous) =>
        previous.filter((item) => item.id !== product.id),
      );

      if (editingId === product.id) {
        resetForm();
      }

      setSuccess("Product deleted successfully.");
    } catch (err) {
      setError(err.message || "Could not delete the product.");
    }
  }

  // Product categories for filters
  const categories = useMemo(
    () =>
      [
        ...new Set(products.map((product) => product.category).filter(Boolean)),
      ].sort((a, b) => a.localeCompare(b)),
    [products],
  );

  const lowStockProducts = products.filter(
    (product) => Number(product.stock) > 0 && Number(product.stock) <= 5,
  ).length;

  const outOfStockProducts = products.filter(
    (product) => Number(product.stock) <= 0,
  ).length;

  // Search and filter products
  const filteredProducts = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    return products.filter((product) => {
      const matchesSearch =
        !searchText ||
        (product.name || "").toLowerCase().includes(searchText) ||
        (product.category || "").toLowerCase().includes(searchText) ||
        (product.category_slug || "").toLowerCase().includes(searchText);

      const matchesCategory =
        categoryFilter === "all" || product.category === categoryFilter;

      const stock = Number(product.stock);

      const matchesStock =
        stockFilter === "all" ||
        (stockFilter === "in-stock" && stock > 0) ||
        (stockFilter === "low" && stock > 0 && stock <= 5) ||
        (stockFilter === "out" && stock <= 0);

      return matchesSearch && matchesCategory && matchesStock;
    });
  }, [products, search, categoryFilter, stockFilter]);

  // ADD THIS FUNCTION AFTER THE COMPLETE BLOCK ABOVE
  function handleStatClick(filter) {
    setSearch("");
    setCategoryFilter("all");
    setStockFilter(filter);
    setShowForm(false);

    setTimeout(() => {
      catalogueRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  }

  // Your return starts here
  return (
    <AdminLayout
      title="Products"
      subtitle="Manage your product catalogue and inventory."
      active="products"
      actions={
        <>
          {/* Homepage Offers */}
          <button
            type="button"
            onClick={() => navigate("/admin/offers")}
            title="Manage homepage offers"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#eadbd7] bg-white px-3 py-3 text-sm font-semibold text-[#76233a] shadow-sm transition hover:border-[#d9b9c0] hover:bg-[#fff7f5]"
          >
            <Sparkles size={17} />
            <span className="hidden sm:inline">Homepage offers</span>
            <span className="sm:hidden">Offers</span>
          </button>

          {/* Refresh Products */}
          <button
            type="button"
            onClick={loadProducts}
            disabled={loading}
            title="Refresh products"
            className="rounded-xl border border-gray-200 bg-white p-3 text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          </button>

          {/* Add Product */}
          <button
            type="button"
            onClick={() => (showForm ? resetForm() : openAddForm())}
            className={buttonPrimary}
          >
            {showForm ? <X size={17} /> : <Plus size={17} />}

            <span className="hidden sm:inline">
              {showForm ? "Close" : "Add product"}
            </span>

            <span className="sm:hidden">{showForm ? "Close" : "Add"}</span>
          </button>
        </>
      }
    >
      {/* Error message */}
      {error && (
        <div
          role="alert"
          className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          <AlertCircle size={19} className="mt-0.5 shrink-0" />

          <span className="break-words">{error}</span>

          <button
            type="button"
            onClick={() => setError("")}
            className="ml-auto"
          >
            <X size={17} />
          </button>
        </div>
      )}

      {/* Success message */}
      {success && (
        <div
          role="status"
          className="mb-5 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700"
        >
          <CheckCircle size={19} className="mt-0.5 shrink-0" />

          <span>{success}</span>

          <button
            type="button"
            onClick={() => setSuccess("")}
            className="ml-auto"
          >
            <X size={17} />
          </button>
        </div>
      )}

      {/* Clickable Statistics */}
      <section className="mb-6 grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard
          label="Total products"
          value={products.length}
          note="In your catalogue"
          icon={Package}
          active={stockFilter === "all" && categoryFilter === "all" && !search}
          onClick={() => handleStatClick("all")}
        />

        <StatCard
          label="Available stock"
          value={products.filter((p) => Number(p.stock) > 0).length}
          note="Products with stock"
          icon={Boxes}
          tone="green"
          active={stockFilter === "in-stock"}
          onClick={() => handleStatClick("in-stock")}
        />

        <StatCard
          label="Low stock"
          value={lowStockProducts}
          note="5 units or fewer"
          icon={AlertTriangle}
          tone="amber"
          active={stockFilter === "low"}
          onClick={() => handleStatClick("low")}
        />

        <StatCard
          label="Out of stock"
          value={outOfStockProducts}
          note="Restock required"
          icon={AlertTriangle}
          tone="red"
          active={stockFilter === "out"}
          onClick={() => handleStatClick("out")}
        />
      </section>

      {/* Inventory warning */}
      {lowStockProducts > 0 || outOfStockProducts > 0 ? (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <AlertTriangle size={19} className="mt-0.5 shrink-0" />

          <p>
            Inventory attention needed: {lowStockProducts} low-stock and{" "}
            {outOfStockProducts} out-of-stock product(s).
          </p>
        </div>
      ) : null}

      {/* Add / Edit product form */}
      {showForm && (
        <section className="mb-8 overflow-hidden rounded-3xl border border-[#eadbd7] bg-white shadow-[0_12px_40px_rgba(66,21,33,0.06)]">
          {/* Form header */}
          <div className="border-b border-[#f1e8e5] bg-gradient-to-r from-[#fffaf8] to-white px-5 py-5 sm:px-7">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#f8e8e5] text-[#76233a]">
                  <Package size={21} />
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#a66a78]">
                    Product management
                  </p>
                  <h2 className="mt-1 font-serif text-xl font-bold text-[#421521] sm:text-2xl">
                    {editingId !== null ? "Edit product" : "Add a new product"}
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Add all the details to display your product in the Purv
                    store.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={resetForm}
                aria-label="Close form"
                className="rounded-xl border border-gray-200 bg-white p-2.5 text-gray-500 transition hover:bg-gray-100"
              >
                <X size={19} />
              </button>
            </div>

            <div className="mt-5 grid grid-cols-4 gap-2">
              {["Basic details", "Category", "Pricing & stock", "Image"].map(
                (step, index) => (
                  <div key={step} className="min-w-0">
                    <div className="mb-2 h-1.5 rounded-full bg-[#f1e6e3]">
                      <div className="h-full w-full rounded-full bg-[#76233a]" />
                    </div>
                    <p className="truncate text-[10px] font-semibold text-gray-500 sm:text-xs">
                      {index + 1}. {step}
                    </p>
                  </div>
                ),
              )}
            </div>
          </div>

          <form
            onSubmit={handleSave}
            noValidate
            className="space-y-5 p-4 sm:p-7"
          >
            {/* 1. Basic details */}
            <div className="rounded-2xl border border-[#eee5e2] p-4 sm:p-5">
              <div className="mb-5 flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f8e8e5] font-bold text-[#76233a]">
                  01
                </span>
                <div>
                  <h3 className="font-bold text-[#421521]">Basic details</h3>
                  <p className="text-xs text-gray-400">
                    Give your product a clear name and description.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label
                    htmlFor="name"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Product name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="name"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="e.g. Premium Brass Pooja Thali"
                    className={inputClass}
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label
                    htmlFor="description"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Product description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Describe the product, its material, features, contents, or benefits..."
                    rows={4}
                    className={`${inputClass} resize-y`}
                  />
                  <p className="mt-1.5 text-right text-xs text-gray-400">
                    {form.description.length} characters
                  </p>
                </div>
              </div>
            </div>

            {/* 2. Category */}
            <div className="rounded-2xl border border-[#eee5e2] p-4 sm:p-5">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#fff0d9] font-bold text-[#a76812]">
                    02
                  </span>
                  <div>
                    <h3 className="font-bold text-[#421521]">
                      Product category
                    </h3>
                    <p className="text-xs text-gray-400">
                      Choose the collection where customers will find this
                      product.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={loadStoreCategories}
                  disabled={categoriesLoading}
                  className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-[#76233a] hover:bg-[#fff4f5] disabled:opacity-50"
                >
                  <RefreshCw
                    size={13}
                    className={categoriesLoading ? "animate-spin" : ""}
                  />
                  Refresh
                </button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="main-category"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Main category <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="main-category"
                    value={selectedMainCategoryId}
                    onChange={(event) => {
                      const selected = mainCategoryOptions.find(
                        (category) => category.id === event.target.value,
                      );

                      setForm((previous) => ({
                        ...previous,
                        category: selected?.name || "",
                        category_slug: selected?.slug || "",
                      }));
                    }}
                    className={inputClass}
                    required
                    disabled={categoriesLoading}
                  >
                    <option value="">Choose a main category</option>
                    {mainCategoryOptions.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                        {!category.is_active ? " (Hidden)" : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="product-subcategory"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Subcategory{" "}
                    <span className="font-normal text-gray-400">
                      (optional)
                    </span>
                  </label>
                  <select
                    id="product-subcategory"
                    value={
                      selectedCategoryRecord?.parent_id
                        ? selectedCategoryRecord.slug
                        : ""
                    }
                    onChange={(event) => {
                      const selected = subcategoryOptions.find(
                        (category) => category.slug === event.target.value,
                      );

                      const parent = storeCategories.find(
                        (category) => category.id === selectedMainCategoryId,
                      );

                      setForm((previous) => ({
                        ...previous,
                        category: parent?.name || "",
                        category_slug: parent?.slug || "",
                        subcategory_slug: selected?.slug || "",
                      }));
                    }}
                    disabled={!selectedMainCategoryId || categoriesLoading}
                    className={`${inputClass} disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400`}
                  >
                    <option value="">
                      {!selectedMainCategoryId
                        ? "Choose main category first"
                        : subcategoryOptions.length === 0
                          ? "No subcategories available"
                          : "Choose a subcategory"}
                    </option>

                    {subcategoryOptions.map((category) => (
                      <option key={category.id} value={category.slug}>
                        {category.name}
                        {!category.is_active ? " (Hidden)" : ""}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {selectedMainCategoryId && (
                <div className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                  <CheckCircle size={17} className="shrink-0" />
                  <span>
                    This product will be saved under{" "}
                    <strong>{form.category}</strong>.
                  </span>
                </div>
              )}
            </div>

            {/* 3. Pricing and stock */}
            <div className="rounded-2xl border border-[#eee5e2] p-4 sm:p-5">
              <div className="mb-5 flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 font-bold text-emerald-700">
                  03
                </span>
                <div>
                  <h3 className="font-bold text-[#421521]">
                    Pricing & inventory
                  </h3>
                  <p className="text-xs text-gray-400">
                    Set the selling price, original price, and available
                    quantity.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <label
                    htmlFor="price"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Selling price (₹) <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="price"
                    name="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={handleChange}
                    placeholder="e.g. 499"
                    className={inputClass}
                    required
                  />
                  <p className="mt-1 text-xs text-gray-400">
                    Price customers pay
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="original_price"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Original price (₹)
                  </label>
                  <input
                    id="original_price"
                    name="original_price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.original_price}
                    onChange={handleChange}
                    placeholder="e.g. 699"
                    className={inputClass}
                  />
                  <p className="mt-1 text-xs text-gray-400">
                    Optional MRP for discount display
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="stock"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Stock quantity <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="stock"
                    name="stock"
                    type="number"
                    min="0"
                    step="1"
                    value={form.stock}
                    onChange={handleChange}
                    placeholder="e.g. 25"
                    className={inputClass}
                    required
                  />
                  <p className="mt-1 text-xs text-gray-400">Available units</p>
                </div>
              </div>

              {form.price !== "" &&
                form.original_price !== "" &&
                Number(form.original_price) >= Number(form.price) &&
                Number(form.original_price) > 0 && (
                  <div className="mt-4 rounded-xl bg-[#fff8ed] px-4 py-3 text-sm text-[#946016]">
                    Customer discount:{" "}
                    <strong>
                      {Math.round(
                        ((Number(form.original_price) - Number(form.price)) /
                          Number(form.original_price)) *
                          100,
                      )}
                      % off
                    </strong>
                  </div>
                )}
            </div>

            {/* 4. Product images */}
            <div className="rounded-2xl border border-[#eee5e2] p-4 sm:p-5">
              <div className="mb-5 flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f8e8e5] font-bold text-[#76233a]">
                  04
                </span>

                <div>
                  <h3 className="font-bold text-[#421521]">Product images</h3>
                  <p className="text-xs text-gray-400">
                    Upload up to 4 images. The first image will be your main
                    product image.
                  </p>
                </div>
              </div>

              <div className="space-y-5">
                {/* Image upload */}
                <div>
                  <label
                    htmlFor="product-images"
                    className={`inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#76233a] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#5d1b2d] ${
                      imageItems.length >= 4
                        ? "cursor-not-allowed opacity-50"
                        : ""
                    }`}
                  >
                    <ImagePlus size={17} />
                    Upload product images
                  </label>

                  <input
                    id="product-images"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    multiple
                    onChange={handleImageSelect}
                    disabled={imageItems.length >= 4}
                    className="sr-only"
                  />

                  <p className="mt-2 text-xs text-gray-500">
                    JPG, PNG, WebP or GIF · Maximum 5 MB per image · Up to 4
                    images
                  </p>

                  <p className="mt-1 text-xs font-semibold text-[#76233a]">
                    {imageItems.length}/4 images selected
                  </p>
                </div>

                {/* Image previews */}
                {imageItems.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {imageItems.map((item, index) => (
                      <div
                        key={`${item.url || item.file?.name}-${index}`}
                        className="relative overflow-hidden rounded-2xl border border-[#eadbd7] bg-[#fffaf8] p-2"
                      >
                        <div className="aspect-square overflow-hidden rounded-xl bg-white">
                          <img
                            src={item.preview || item.url}
                            alt={`Product image ${index + 1}`}
                            className="h-full w-full object-contain"
                          />
                        </div>

                        {index === 0 && (
                          <span className="mt-2 block rounded-lg bg-[#76233a] px-2 py-1 text-center text-[10px] font-bold text-white">
                            MAIN IMAGE
                          </span>
                        )}

                        {index !== 0 && (
                          <span className="mt-2 block rounded-lg bg-[#f8e8e5] px-2 py-1 text-center text-[10px] font-semibold text-[#76233a]">
                            IMAGE {index + 1}
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            if (item.preview && item.file) {
                              URL.revokeObjectURL(item.preview);
                            }

                            setImageItems((previous) => {
                              const updated = previous.filter(
                                (_, i) => i !== index,
                              );

                              setForm((oldForm) => ({
                                ...oldForm,
                                image_url: updated[0]?.url || "",
                              }));

                              return updated;
                            });
                          }}
                          aria-label={`Remove image ${index + 1}`}
                          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white text-red-600 shadow-md transition hover:bg-red-50"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex min-h-36 flex-col items-center justify-center rounded-2xl border border-dashed border-[#dfc8ca] bg-[#fffaf8] text-center">
                    <ImagePlus size={35} className="text-[#c7a4a8]" />
                    <p className="mt-2 text-sm font-semibold text-gray-600">
                      No product images added
                    </p>
                    <p className="mt-1 text-xs text-gray-400">
                      Upload up to 4 images to create a product gallery.
                    </p>
                  </div>
                )}

                {/* Optional image URL */}
                <div>
                  <label
                    htmlFor="image_url"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Or use a main image URL
                  </label>

                  <input
                    id="image_url"
                    name="image_url"
                    type="url"
                    value={form.image_url}
                    onChange={(event) => {
                      const value = event.target.value;

                      setForm((previous) => ({
                        ...previous,
                        image_url: value,
                      }));

                      setImageItems((previous) => {
                        if (!value.trim()) {
                          return previous;
                        }

                        if (previous.length === 0) {
                          return [
                            {
                              url: value.trim(),
                              file: null,
                              preview: value.trim(),
                            },
                          ];
                        }

                        const updated = [...previous];

                        updated[0] = {
                          url: value.trim(),
                          file: null,
                          preview: value.trim(),
                        };

                        return updated;
                      });
                    }}
                    placeholder="https://example.com/product-image.jpg"
                    className={inputClass}
                  />

                  <p className="mt-1 text-xs text-gray-400">
                    This URL will be used as the main image.
                  </p>
                </div>
              </div>
            </div>
            {/* Save actions */}
            <div className="flex flex-col-reverse gap-3 rounded-2xl border border-[#eee5e2] bg-[#fffaf8] p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <p className="text-xs text-gray-500">
                <span className="text-red-500">*</span> Required fields
              </p>

              <div className="flex flex-col-reverse gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={saving}
                  className="rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving || uploading}
                  className={`${buttonPrimary} min-w-[160px]`}
                >
                  {saving ? (
                    <>
                      <LoaderCircle size={17} className="animate-spin" />
                      {uploading ? "Uploading image..." : "Saving product..."}
                    </>
                  ) : (
                    <>
                      <CheckCircle size={17} />
                      {editingId !== null ? "Update product" : "Save product"}
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </section>
      )}

      {/* Product catalogue */}
      <section
        ref={catalogueRef}
        id="product-catalogue"
        className="scroll-mt-24 overflow-hidden rounded-2xl border border-[#eee3df] bg-white shadow-sm"
      >
        <div className="border-b border-gray-100 p-4 sm:p-5">
          <div className="mb-4 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
            <div>
              <h2 className="font-serif text-xl font-bold text-[#421521]">
                {stockFilter === "all"
                  ? "All products"
                  : stockFilter === "in-stock"
                    ? "Available products"
                    : stockFilter === "low"
                      ? "Low-stock products"
                      : "Out-of-stock products"}
              </h2>

              <p className="mt-1 text-xs text-gray-500">
                {filteredProducts.length} of {products.length} products shown
              </p>
            </div>

            <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-[#f8e9ed] px-3 py-1.5 text-xs font-semibold text-[#76233a]">
              <Package size={14} />
              {products.length} total
            </span>
          </div>

          {/* Search and filters */}
          <div className="grid gap-3 md:grid-cols-[minmax(220px,1fr)_200px_180px]">
            <div className="relative">
              <Search
                size={17}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search products or categories..."
                aria-label="Search products"
                className={`${inputClass} pl-10`}
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
              aria-label="Filter by category"
              className={inputClass}
            >
              <option value="all">All categories</option>

              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            <select
              value={stockFilter}
              onChange={(event) => setStockFilter(event.target.value)}
              aria-label="Filter by stock"
              className={inputClass}
            >
              <option value="all">All stock levels</option>
              <option value="in-stock">Available (1+)</option>
              <option value="low">Low stock (1–5)</option>
              <option value="out">Out of stock</option>
            </select>
          </div>

          {(search || categoryFilter !== "all" || stockFilter !== "all") && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setCategoryFilter("all");
                setStockFilter("all");
              }}
              className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#76233a] hover:underline"
            >
              <X size={14} />
              Clear filters
            </button>
          )}
        </div>

        {/* Loading state */}
        {loading ? (
          <div className="flex min-h-52 flex-col items-center justify-center gap-3 text-gray-500">
            <LoaderCircle size={28} className="animate-spin text-[#76233a]" />

            <p className="text-sm">Loading your products...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          /* Empty state */
          <div className="flex min-h-52 flex-col items-center justify-center px-5 text-center">
            <Package size={34} className="mb-3 text-gray-300" />

            <h3 className="font-semibold text-gray-800">
              {products.length === 0
                ? "Your catalogue is empty"
                : "No matching products"}
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              {products.length === 0
                ? "Add your first product to get started."
                : "Try changing your search or filters."}
            </p>

            {products.length === 0 && (
              <button
                type="button"
                onClick={openAddForm}
                className={`${buttonPrimary} mt-4`}
              >
                <Plus size={17} />
                Add first product
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#faf7f5] text-[11px] uppercase tracking-wider text-gray-500">
                  <tr>
                    <th className="px-5 py-4 font-semibold">Product</th>

                    <th className="px-5 py-4 font-semibold">Category</th>

                    <th className="px-5 py-4 font-semibold">Price</th>

                    <th className="px-5 py-4 font-semibold">Stock status</th>

                    <th className="px-5 py-4 text-right font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {filteredProducts.map((product) => {
                    const stock = Number(product.stock);

                    const stockTone =
                      stock <= 0
                        ? "bg-red-50 text-red-700"
                        : stock <= 5
                          ? "bg-amber-50 text-amber-700"
                          : "bg-emerald-50 text-emerald-700";

                    return (
                      <tr
                        key={product.id}
                        className="transition hover:bg-[#fffaf8]"
                      >
                        <td className="px-5 py-4">
                          <div className="flex min-w-[240px] items-center gap-3">
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-gray-100 bg-gray-50">
                              {product.image_url ? (
                                <img
                                  src={product.image_url}
                                  alt={product.name}
                                  className="h-full w-full object-contain"
                                />
                              ) : (
                                <ImagePlus
                                  size={22}
                                  className="text-gray-300"
                                />
                              )}
                            </div>

                            <div className="min-w-0">
                              <p className="font-semibold text-gray-800">
                                {product.name}
                              </p>

                              <p className="mt-1 max-w-56 truncate text-xs text-gray-400">
                                {product.description ||
                                  `Product ID: ${product.id}`}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <p className="font-medium text-gray-700">
                            {product.category}
                          </p>

                          <p className="mt-1 text-xs text-gray-400">
                            {product.category_slug}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <p className="font-semibold text-gray-800">
                            {money(product.price)}
                          </p>

                          {product.original_price != null &&
                            Number(product.original_price) >
                              Number(product.price) && (
                              <p className="mt-1 text-xs text-gray-400 line-through">
                                {money(product.original_price)}
                              </p>
                            )}
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${stockTone}`}
                          >
                            {stock <= 0 ? "Out of stock" : `${stock} available`}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => openEditForm(product)}
                              title="Edit product"
                              aria-label={`Edit ${product.name}`}
                              className="rounded-lg border border-gray-200 p-2.5 text-gray-600 hover:border-[#e8cbd2] hover:bg-[#fff4f5] hover:text-[#76233a]"
                            >
                              <Pencil size={16} />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDelete(product)}
                              title="Delete product"
                              aria-label={`Delete ${product.name}`}
                              className="rounded-lg border border-gray-200 p-2.5 text-gray-500 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile product cards */}
            <div className="divide-y divide-gray-100 lg:hidden">
              {filteredProducts.map((product) => {
                const stock = Number(product.stock);

                return (
                  <article
                    key={product.id}
                    className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center"
                  >
                    <div className="flex min-w-0 flex-1 gap-3">
                      <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-gray-100 bg-gray-50">
                        {product.image_url ? (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="h-full w-full object-contain"
                          />
                        ) : (
                          <ImagePlus size={24} className="text-gray-300" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="break-words font-semibold text-gray-900">
                          {product.name}
                        </h3>

                        <p className="mt-1 text-xs text-gray-500">
                          {product.category}
                        </p>

                        <p className="mt-2 font-bold text-[#76233a]">
                          {money(product.price)}
                        </p>

                        <span
                          className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                            stock <= 0
                              ? "bg-red-50 text-red-700"
                              : stock <= 5
                                ? "bg-amber-50 text-amber-700"
                                : "bg-emerald-50 text-emerald-700"
                          }`}
                        >
                          {stock <= 0 ? "Out of stock" : `${stock} available`}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2 sm:flex-col">
                      <button
                        type="button"
                        onClick={() => openEditForm(product)}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold hover:bg-gray-50"
                      >
                        <Pencil size={15} />
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(product)}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-red-100 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
                      >
                        <Trash2 size={15} />
                        Delete
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </>
        )}
      </section>

      <p className="mt-5 text-center text-xs text-gray-400">
        Purv Admin · Product changes are saved to Supabase.
      </p>
    </AdminLayout>
  );
}
