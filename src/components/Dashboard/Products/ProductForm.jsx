"use client";
import { BASEURL } from "@lib/config";
import UploadForm from "@/components/Upload/UploadForm";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { MultiSelect } from "react-multi-select-component";
import { toast } from "react-toastify";
import SelectTags from "./SelectTags";
import SearchableSelect from "@/components/SearchableSelect";

const colorOptions = [
  { label: "White", value: "white" },
  { label: "Blue", value: "blue" },
  { label: "Orange", value: "orange" },
  { label: "Black", value: "black" },
  { label: "Red", value: "red" },
  { label: "Green", value: "green" },
  { label: "Yellow", value: "yellow" },
  { label: "Gold", value: "gold" },
  { label: "Silver", value: "silver" },
  { label: "Pink", value: "pink" },
];
const sizeOptions = [
  { label: "Small", value: "small" },
  { label: "Medium", value: "medium" },
  { label: "Large", value: "large" },
  { label: "Extra-Large", value: "extra-large" },
];

const initialErrors = {
  title: "",
  description: "",
  category: "",
  price: "",
  media: "",
};

const ProductForm = () => {
  const router = useRouter();
  const [options, setOptions] = useState([]);
  const [brandOptions, setBrandOptions] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState(initialErrors);
  const [photos, setPhotos] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selected, setSelected] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedSize, setSelectedSize] = useState([]);
  const [selectedColor, setSelectedColor] = useState([]);
  const [price, setPrice] = useState("");
  const [cost, setCost] = useState("");
  const [category, setCategory] = useState("");
  const [brand, setBrand] = useState("");
  const [stock, setStock] = useState("");

  const getCollections = async () => {
    try {
      const result = await fetch(`${BASEURL}/api/collection?limit=100`, {
        method: "GET",
        cache: "no-store",
      });
      if (!result.ok) throw new Error("Failed to fetch data");
      const data = await result.json();
      setOptions(
        data?.data.map((collection) => ({
          label: collection.title,
          value: collection._id,
        }))
      );
    } catch (error) {
      console.log(error);
    }
  };

  const getCategories = async () => {
    try {
      const result = await fetch(`${BASEURL}/api/category?limit=100`, {
        method: "GET",
        cache: "no-store",
      });
      if (!result.ok) throw new Error("Failed to fetch data");
      const data = await result.json();
      setCategoryOptions(
        data?.data.map((category) => ({
          label: category.title,
          value: category.title,
        })) || []
      );
    } catch (error) {
      console.log(error);
    }
  };

  const getBrands = async () => {
    try {
      const result = await fetch(`${BASEURL}/api/brand?limit=100`, {
        method: "GET",
        cache: "no-store",
      });
      if (!result.ok) throw new Error("Failed to fetch data");
      const data = await result.json();
      setBrandOptions(data?.data || []);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getCollections();
    getBrands();
    getCategories();
  }, []);

  const validate = () => {
    const nextErrors = { ...initialErrors };
    if (!title.trim()) nextErrors.title = "Title is required.";
    else if (title.trim().length < 2)
      nextErrors.title = "Title must be at least 2 characters.";
    if (!category.trim()) nextErrors.category = "Category is required.";
    if (!price || Number(price) < 0 || isNaN(Number(price)))
      nextErrors.price = "A valid price is required.";
    if (photos.length === 0) nextErrors.media = "At least one image is required.";
    setErrors(nextErrors);
    return !Object.values(nextErrors).some(Boolean);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return toast.error("Please fix the highlighted fields.");

    setLoading(true);
    const data = {
      title: title.trim(),
      description: description.trim(),
      category: category.trim(),
      brand: brand.trim(),
      stock: stock !== "" ? Number(stock) : 0,
      collections: selected.map((item) => item.value),
      tags: selectedTags,
      sizes: selectedSize.map((tag) => tag.value),
      colors: selectedColor.map((tag) => tag.value),
      price: Number(price),
      cost: cost ? Number(cost) : 0,
      media: photos,
    };

    try {
      const response = await fetch(`${BASEURL}/api/product`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const payload = await response.json();
      if (response.ok) {
        toast.success("Product created successfully.");
        router.push("/admin/products");
      } else {
        toast.error(payload?.message || "Failed to create product.");
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to create product.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl">
      <UploadForm setPhotos={setPhotos} />
      {errors.media && (
        <p className="mt-2 text-sm text-rose-600">{errors.media}</p>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        <div>
          <label htmlFor="title" className="input-label">
            Title
          </label>
          <input
            id="title"
            type="text"
            value={title}
            placeholder="Product title"
            onChange={(e) => setTitle(e.target.value)}
            className="input-field"
          />
          {errors.title && <p className="field-error">{errors.title}</p>}
        </div>

        <div>
          <label htmlFor="description" className="input-label">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            placeholder="Product description"
            onChange={(e) => setDescription(e.target.value)}
            className="input-field h-28 resize-none"
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label htmlFor="price" className="input-label">
              Price
            </label>
            <input
              id="price"
              type="number"
              step="0.01"
              min="0"
              value={price}
              placeholder="0.00"
              onChange={(e) => setPrice(e.target.value)}
              className="input-field"
            />
            {errors.price && <p className="field-error">{errors.price}</p>}
          </div>

          <div>
            <label htmlFor="cost" className="input-label">
              Cost
            </label>
            <input
              id="cost"
              type="number"
              step="0.01"
              min="0"
              value={cost}
              placeholder="0.00"
              onChange={(e) => setCost(e.target.value)}
              className="input-field"
            />
          </div>

          <div>
            <label htmlFor="category" className="input-label">
              Category
            </label>
            <SearchableSelect
              id="category"
              value={category}
              onChange={setCategory}
              placeholder="Select a category"
              options={categoryOptions}
              className="input-field"
            />
            {errors.category && <p className="field-error">{errors.category}</p>}
          </div>

          <div>
            <label htmlFor="brand" className="input-label">
              Brand
            </label>
            <SearchableSelect
              id="brand"
              value={brand}
              onChange={setBrand}
              placeholder="Select a brand"
              options={brandOptions.map((item) => ({
                value: item.name,
                label: item.name,
              }))}
              className="input-field"
            />
          </div>

          <div>
            <label htmlFor="stock" className="input-label">
              Stock
            </label>
            <input
              id="stock"
              type="number"
              step="1"
              min="0"
              value={stock}
              placeholder="0"
              onChange={(e) => setStock(e.target.value)}
              className="input-field"
            />
          </div>

          <div>
            <label htmlFor="collections" className="input-label">
              Collections
            </label>
            <MultiSelect
              options={options}
              value={selected}
              onChange={setSelected}
              labelledBy="Select collections"
              hasSelectAll={false}
            />
          </div>

          <div>
            <label htmlFor="sizes" className="input-label">
              Sizes
            </label>
            <MultiSelect
              options={sizeOptions}
              value={selectedSize}
              onChange={setSelectedSize}
              labelledBy="Select sizes"
              hasSelectAll={false}
            />
          </div>

          <div>
            <label htmlFor="colors" className="input-label">
              Colors
            </label>
            <MultiSelect
              options={colorOptions}
              value={selectedColor}
              onChange={setSelectedColor}
              labelledBy="Select colors"
              hasSelectAll={false}
            />
          </div>
        </div>

        <div>
          <label htmlFor="tags" className="input-label">
            Tags
          </label>
          <SelectTags
            selectedTags={selectedTags}
            setSelectedTags={setSelectedTags}
          />
        </div>

        <div className="flex items-center gap-4 border-t border-slate-200 pt-5">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Creating..." : "Create product"}
          </button>
          <Link href="/admin/products" className="btn-secondary">
            Discard
          </Link>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
