"use client";
import React, { useEffect, useState } from "react";
import { BASEURL } from "@lib/config";
import Link from "next/link";
import Image from "next/image";
import { MultiSelect } from "react-multi-select-component";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
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

const EditProduct = ({ productId }) => {
  const router = useRouter();
  const [options, setOptions] = useState([]);
  const [brandOptions, setBrandOptions] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [brand, setBrand] = useState("");
  const [stock, setStock] = useState("");
  const [price, setPrice] = useState("");
  const [cost, setCost] = useState("");
  const [media, setMedia] = useState([]);
  const [selected, setSelected] = useState([]);
  const [selectedSize, setSelectedSize] = useState([]);
  const [selectedColor, setSelectedColor] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);

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

  const getProduct = async (id) => {
    setPageLoading(true);
    try {
      const result = await fetch(`${BASEURL}/api/product/${id}`, {
        method: "GET",
        cache: "no-store",
      });
      if (!result.ok) throw new Error("Failed to fetch data");
      const data = await result.json();
      const product = data?.data;
      setTitle(product?.title || "");
      setDescription(product?.description || "");
      setCategory(product?.category || "");
      setBrand(product?.brand || "");
      setStock(product?.stock != null ? String(product.stock) : "");
      setPrice(product?.price != null ? product.price : "");
      setCost(product?.cost || "");
      setMedia(product?.media || []);
      setSelected(
        (product?.collections || []).map((collection) => ({
          label: collection.title || collection,
          value: collection._id || collection,
        }))
      );
      setSelectedSize(
        (product?.sizes || []).map((size) => ({ label: size, value: size }))
      );
      setSelectedColor(
        (product?.colors || []).map((color) => ({ label: color, value: color }))
      );
      setSelectedTags(product?.tags || []);
    } catch (error) {
      console.log(error);
      toast.error("Failed to load product.");
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    getCollections();
    getBrands();
    getCategories();
    getProduct(productId);
  }, [productId]);

  const handleSubmit = async (event) => {
    event.preventDefault();
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
      media,
    };

    try {
      const response = await fetch(`${BASEURL}/api/product/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const payload = await response.json();
      if (response.ok) {
        toast.success("Product updated successfully.");
        router.push("/admin/products");
      } else {
        toast.error(payload?.message || "Failed to update product.");
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to update product.");
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="flex items-center justify-center p-16">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-100 border-t-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      {media.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-3">
          {media.map((url, index) => (
            <Image
              key={index}
              src={url}
              alt="Product image"
              width={80}
              height={80}
              className="h-20 w-20 rounded-lg border border-slate-200 object-cover"
            />
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
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
              onChange={(e) => setPrice(e.target.value)}
              className="input-field"
            />
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
            {loading ? "Saving..." : "Save changes"}
          </button>
          <Link href="/admin/products" className="btn-secondary">
            Discard
          </Link>
        </div>
      </form>
    </div>
  );
};

export default EditProduct;
