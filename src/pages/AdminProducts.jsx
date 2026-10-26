import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import {
  Plus,
  Pencil,
  Trash2,
  LogOut,
  Package,
  X,
  RefreshCw,
  Upload,
  ImagePlus,
  LoaderCircle,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

const BUCKET_NAME = "purv-products";
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const emptyForm = {
  name: "",
  description: "",
  price: "",
  original_price: "",
  category: "",
  image_url: "",
  stock: "0",
};

const inputClass =
  "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-100";

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

export default function AdminProducts() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [removeExistingImage, setRemoveExistingImage] = useState(false);

  const [search, setSearch] = useState("");

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

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const isAdmin = await verifyAdmin();

      if (!isAdmin) {
        return;
      }

      const { data, error: productsError } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (productsError) {
        throw productsError;
      }

      setProducts(data || []);
    } catch (err) {
      setError(err.message || "Unable to load products.");
    } finally {
      setLoading(false);
    }
  }, [verifyAdmin]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    if (!selectedImage) {
      setImagePreview("");
      return undefined;
    }

    const previewUrl = URL.createObjectURL(selectedImage);
    setImagePreview(previewUrl);

    return () => {
      URL.revokeObjectURL(previewUrl);
    };
  }, [selectedImage]);

  function clearMessages() {
    setError("");
    setSuccess("");
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
    setSelectedImage(null);
    setImagePreview("");
    setRemoveExistingImage(false);
    setShowForm(false);
  }

  function openAddForm() {
    clearMessages();
    setForm(emptyForm);
    setEditingId(null);
    setSelectedImage(null);
    setImagePreview("");
    setRemoveExistingImage(false);
    setShowForm(true);
  }

  function openEditForm(product) {
    clearMessages();

    setEditingId(product.id);

    setForm({
      name: product.name || "",
      description: product.description || "",
      price: product.price ?? "",
      original_price: product.original_price ?? "",
      category: product.category || "",
      image_url: product.image_url || "",
      stock: product.stock ?? 0,
    });

    setSelectedImage(null);
    setImagePreview("");
    setRemoveExistingImage(false);
    setShowForm(true);

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function handleImageSelect(event) {
    clearMessages();

    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const validTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
    ];

    if (!validTypes.includes(file.type)) {
      setError("Choose a JPG, PNG, WebP, or GIF image.");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setError("Image size must be 5 MB or less.");
      event.target.value = "";
      return;
    }

    setSelectedImage(file);
    setRemoveExistingImage(false);
  }

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

    if (uploadError) {
      throw uploadError;
    }

    const { data: publicData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(data.path);

    if (!publicData?.publicUrl) {
      throw new Error("The image uploaded, but its public URL could not be created.");
    }

    return publicData.publicUrl;
  }

  async function handleSave(event) {
    event.preventDefault();
    clearMessages();

    const name = form.name.trim();
    const category = form.category.trim();
    const categorySlug = createCategorySlug(category);
    const price = Number(form.price);
    const originalPrice =
      form.original_price === "" ? null : Number(form.original_price);
    const stock = Number(form.stock);

    if (!name || !category || !categorySlug) {
      setError("Please enter a product name and category.");
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

    if (
      form.stock === "" ||
      !Number.isInteger(stock) ||
      stock < 0
    ) {
      setError("Stock must be a whole number of zero or more.");
      return;
    }

    setSaving(true);

    try {
      const isAdmin = await verifyAdmin();

      if (!isAdmin) {
        return;
      }

      let imageUrl = removeExistingImage ? "" : form.image_url.trim();

      if (selectedImage) {
        setUploading(true);
        imageUrl = await uploadProductImage(selectedImage);
        setUploading(false);
      }

      const productData = {
        name,
        description: form.description.trim(),
        price,
        original_price: originalPrice,
        category,
        category_slug: categorySlug,
        image_url: imageUrl || null,
        stock,
      };

      let result;

      if (editingId !== null) {
        result = await supabase
          .from("products")
          .update(productData)
          .eq("id", editingId)
          .select()
          .single();
      } else {
        result = await supabase
          .from("products")
          .insert([productData])
          .select()
          .single();
      }

      if (result.error) {
        throw result.error;
      }

      setSuccess(
        editingId !== null
          ? "Product updated successfully!"
          : "Product added successfully!"
      );

      resetForm();
      await loadProducts();
    } catch (err) {
      setError(err.message || "Could not save the product.");
    } finally {
      setSaving(false);
      setUploading(false);
    }
  }

  async function handleDelete(product) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${product.name}"?`
    );

    if (!confirmed) {
      return;
    }

    clearMessages();

    try {
      const isAdmin = await verifyAdmin();

      if (!isAdmin) {
        return;
      }

      const { error: deleteError } = await supabase
        .from("products")
        .delete()
        .eq("id", product.id);

      if (deleteError) {
        throw deleteError;
      }

      setProducts((previous) =>
        previous.filter((item) => item.id !== product.id)
      );

      if (editingId === product.id) {
        resetForm();
      }

      setSuccess("Product deleted successfully!");
    } catch (err) {
      setError(err.message || "Could not delete the product.");
    }
  }

  async function handleLogout() {
    clearMessages();

    const { error: logoutError } = await supabase.auth.signOut();

    if (logoutError) {
      setError(logoutError.message);
      return;
    }

    navigate("/admin/login", { replace: true });
  }

  const filteredProducts = products.filter((product) => {
    const searchText = search.trim().toLowerCase();

    if (!searchText) {
      return true;
    }

    return (
      (product.name || "").toLowerCase().includes(searchText) ||
      (product.category || "").toLowerCase().includes(searchText) ||
      (product.category_slug || "").toLowerCase().includes(searchText)
    );
  });

  const availableProducts = products.filter(
    (product) => Number(product.stock) > 0
  ).length;

  return (
    <div className="min-h-screen bg-[#fffaf5] text-gray-800">
      <header className="sticky top-0 z-30 border-b border-rose-100 bg-white/95 shadow-sm backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-100 text-rose-800">
              <Package size={23} />
            </div>

            <div>
              <h1 className="text-lg font-bold tracking-wide text-[#76233a] sm:text-xl">
                PURV STORE MANAGEMENT
              </h1>
              <p className="text-xs text-gray-500">
                Product dashboard
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700 sm:px-4"
          >
            <LogOut size={17} />
            <span className="hidden sm:inline">Log out</span>
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="mb-1 text-sm font-medium text-rose-700">
              Admin access verified
            </p>

            <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              Manage your products
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Add products, upload images, update prices, and manage stock.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={loadProducts}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold transition hover:bg-gray-50 disabled:opacity-50"
            >
              <RefreshCw
                size={17}
                className={loading ? "animate-spin" : ""}
              />
              Refresh
            </button>

            <button
              type="button"
              onClick={() => {
                if (showForm) {
                  resetForm();
                } else {
                  openAddForm();
                }
              }}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#76233a] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#5d1b2d]"
            >
              {showForm ? <X size={18} /> : <Plus size={18} />}
              {showForm ? "Close form" : "Add product"}
            </button>
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            <AlertCircle size={19} className="mt-0.5 shrink-0" />
            <p className="break-words">{error}</p>
          </div>
        )}

        {success && (
          <div
            role="status"
            className="mb-5 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700"
          >
            <CheckCircle size={19} className="mt-0.5 shrink-0" />
            <p>{success}</p>
          </div>
        )}

        <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-rose-100 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Total products</p>
            <p className="mt-2 text-3xl font-bold text-[#76233a]">
              {products.length}
            </p>
          </div>

          <div className="rounded-2xl border border-rose-100 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">In stock</p>
            <p className="mt-2 text-3xl font-bold text-green-700">
              {availableProducts}
            </p>
          </div>

          <div className="rounded-2xl border border-rose-100 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Out of stock</p>
            <p className="mt-2 text-3xl font-bold text-orange-600">
              {products.length - availableProducts}
            </p>
          </div>
        </section>

        {showForm && (
          <section className="mb-8 overflow-hidden rounded-2xl border border-rose-100 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 sm:px-7">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  {editingId !== null ? "Edit product" : "Add a new product"}
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  Enter product details and select its category.
                </p>
              </div>

              <button
                type="button"
                onClick={resetForm}
                aria-label="Close form"
                className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-6 p-5 sm:p-7">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="name"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Product name *
                  </label>

                  <input
                    id="name"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="e.g. Festive Gift Hamper"
                    className={inputClass}
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="category"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Category *
                  </label>

                  <input
                    id="category"
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    placeholder="e.g. Diwali Decor"
                    className={inputClass}
                    required
                  />

                  <p className="mt-1.5 text-xs text-gray-500">
                    Enter the category slug used by your storefront. For
                    example, use Diwali Decor if your page uses diwali-decor.
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="price"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Selling price (₹) *
                  </label>

                  <input
                    id="price"
                    name="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={handleChange}
                    placeholder="344"
                    className={inputClass}
                    required
                  />
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
                    placeholder="655"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label
                    htmlFor="stock"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Stock quantity *
                  </label>

                  <input
                    id="stock"
                    name="stock"
                    type="number"
                    min="0"
                    step="1"
                    value={form.stock}
                    onChange={handleChange}
                    placeholder="10"
                    className={inputClass}
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="description"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Description
                  </label>

                  <textarea
                    id="description"
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Describe your product..."
                    rows={3}
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Product image
                </label>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-[180px_1fr]">
                  <div className="flex min-h-40 items-center justify-center overflow-hidden rounded-xl border border-dashed border-gray-300 bg-gray-50">
                    {imagePreview || (!removeExistingImage && form.image_url) ? (
                      <img
                        src={imagePreview || form.image_url}
                        alt="Product preview"
                        className="h-40 w-full object-contain p-2"
                        onError={(event) => {
                          event.currentTarget.style.visibility = "hidden";
                        }}
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-gray-400">
                        <ImagePlus size={35} />
                        <span className="text-xs">Image preview</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <label
                      htmlFor="product-image"
                      className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-[#76233a] transition hover:bg-rose-100"
                    >
                      <Upload size={18} />
                      Choose image from computer
                    </label>

                    <input
                      id="product-image"
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      onChange={handleImageSelect}
                      className="sr-only"
                    />

                    <p className="text-xs leading-5 text-gray-500">
                      Supported formats: JPG, PNG, WebP and GIF. Maximum size:
                      5 MB. Your selected image will be uploaded to Supabase
                      Storage when you save the product.
                    </p>

                    <div>
                      <label
                        htmlFor="image_url"
                        className="mb-2 block text-sm font-medium text-gray-700"
                      >
                        Or use an existing image URL
                      </label>

                      <input
                        id="image_url"
                        name="image_url"
                        type="url"
                        value={form.image_url}
                        onChange={(event) => {
                          handleChange(event);
                          setRemoveExistingImage(false);
                        }}
                        placeholder="https://example.com/image.jpg"
                        className={inputClass}
                      />
                    </div>

                    {(selectedImage ||
                      form.image_url ||
                      imagePreview ||
                      (editingId !== null && !removeExistingImage)) && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedImage(null);
                          setForm((previous) => ({
                            ...previous,
                            image_url: "",
                          }));
                          setRemoveExistingImage(true);

                          const fileInput =
                            document.getElementById("product-image");

                          if (fileInput) {
                            fileInput.value = "";
                          }
                        }}
                        className="text-sm font-medium text-red-600 hover:text-red-700"
                      >
                        Remove image
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={saving}
                  className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold transition hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving || uploading}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#76233a] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#5d1b2d] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <>
                      <LoaderCircle size={18} className="animate-spin" />
                      {uploading ? "Uploading image..." : "Saving product..."}
                    </>
                  ) : (
                    <>
                      <CheckCircle size={18} />
                      {editingId !== null ? "Update product" : "Save product"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </section>
        )}

        <section className="overflow-hidden rounded-2xl border border-rose-100 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-gray-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                All products
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                {filteredProducts.length} product
                {filteredProducts.length === 1 ? "" : "s"} displayed
              </p>
            </div>

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name or category..."
              aria-label="Search products"
              className={`${inputClass} sm:max-w-xs`}
            />
          </div>

          {loading ? (
            <div className="flex min-h-56 flex-col items-center justify-center gap-3 text-gray-500">
              <LoaderCircle
                size={30}
                className="animate-spin text-[#76233a]"
              />
              <p className="text-sm">Loading products...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex min-h-56 flex-col items-center justify-center px-5 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-700">
                <Package size={28} />
              </div>

              <h4 className="font-semibold text-gray-800">
                {products.length === 0
                  ? "No products yet"
                  : "No matching products"}
              </h4>

              <p className="mt-2 max-w-sm text-sm text-gray-500">
                {products.length === 0
                  ? "Add your first product to start building your Purv catalogue."
                  : "Try another search term."}
              </p>

              {products.length === 0 && (
                <button
                  type="button"
                  onClick={openAddForm}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#76233a] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#5d1b2d]"
                >
                  <Plus size={18} />
                  Add your first product
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Product</th>
                      <th className="px-6 py-4 font-semibold">Category</th>
                      <th className="px-6 py-4 font-semibold">Price</th>
                      <th className="px-6 py-4 font-semibold">Stock</th>
                      <th className="px-6 py-4 text-right font-semibold">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {filteredProducts.map((product) => (
                      <tr
                        key={product.id}
                        className="transition hover:bg-rose-50/30"
                      >
                        <td className="px-6 py-4">
                          <div className="flex min-w-52 items-center gap-3">
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-gray-100 bg-gray-50">
                              {product.image_url ? (
                                <img
                                  src={product.image_url}
                                  alt={product.name}
                                  className="h-full w-full object-contain"
                                />
                              ) : (
                                <ImagePlus
                                  size={23}
                                  className="text-gray-300"
                                />
                              )}
                            </div>

                            <div>
                              <p className="font-semibold text-gray-800">
                                {product.name}
                              </p>

                              <p className="mt-1 max-w-56 truncate text-xs text-gray-500">
                                {product.description || "No description"}
                              </p>

                              <p className="mt-1 text-xs text-gray-400">
                                ID: {product.id}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <p className="font-medium text-gray-700">
                            {product.category}
                          </p>

                          <p className="mt-1 text-xs text-gray-400">
                            {product.category_slug}
                          </p>
                        </td>

                        <td className="px-6 py-4">
                          <p className="font-semibold text-gray-800">
                            ₹{Number(product.price).toLocaleString("en-IN")}
                          </p>

                          {product.original_price != null &&
                            Number(product.original_price) >
                              Number(product.price) && (
                              <p className="mt-1 text-xs text-gray-400 line-through">
                                ₹
                                {Number(
                                  product.original_price
                                ).toLocaleString("en-IN")}
                              </p>
                            )}
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                              Number(product.stock) > 0
                                ? "bg-green-50 text-green-700"
                                : "bg-red-50 text-red-700"
                            }`}
                          >
                            {Number(product.stock) > 0
                              ? `${product.stock} available`
                              : "Out of stock"}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => openEditForm(product)}
                              aria-label={`Edit ${product.name}`}
                              className="rounded-lg border border-gray-200 p-2 text-gray-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
                            >
                              <Pencil size={17} />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDelete(product)}
                              aria-label={`Delete ${product.name}`}
                              className="rounded-lg border border-gray-200 p-2 text-gray-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                            >
                              <Trash2 size={17} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="space-y-4 p-4 md:hidden">
                {filteredProducts.map((product) => (
                  <article
                    key={product.id}
                    className="rounded-xl border border-gray-100 p-4"
                  >
                    <div className="flex gap-3">
                      <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gray-50">
                        {product.image_url ? (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="h-full w-full object-contain"
                          />
                        ) : (
                          <ImagePlus
                            size={25}
                            className="text-gray-300"
                          />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h4 className="break-words font-semibold text-gray-900">
                          {product.name}
                        </h4>

                        <p className="mt-1 text-xs text-gray-500">
                          {product.category}
                        </p>

                        <p className="mt-2 font-bold text-[#76233a]">
                          ₹{Number(product.price).toLocaleString("en-IN")}
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                          Stock: {product.stock}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex gap-2 border-t border-gray-100 pt-3">
                      <button
                        type="button"
                        onClick={() => openEditForm(product)}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold transition hover:bg-gray-50"
                      >
                        <Pencil size={16} />
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(product)}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-red-100 px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                      >
                        <Trash2 size={16} />
                        Delete
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}
        </section>

        <p className="mt-6 text-center text-xs text-gray-400">
          PURV Store Management · Product changes are saved to Supabase.
        </p>
      </main>
    </div>
  );
}