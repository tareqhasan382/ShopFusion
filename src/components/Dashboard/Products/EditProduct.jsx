"use client"
import React, { useEffect, useState } from "react";
import { BASEURL } from "@/app/(home)/page";
import Link from "next/link";

import { MultiSelect } from "react-multi-select-component";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

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

const EditProduct = ({ productId }) => {
  const router = useRouter();
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState([]);
  const [selectedColor, setSelectedColor] = useState([]);
  const [product, setProduct] = useState({ collections: [], colors: [] });

  const getCollection = async () => {
    try {
      const result = await fetch(`${BASEURL}/api/collection`, {
        method: "GET",
        cache: "no-store",
      });
      if (!result.ok) {
        throw new Error("Failed to fetch data");
      }
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

  const getProduct = async (productId) => {
    try {
      const result = await fetch(`${BASEURL}/api/product/${productId}`, {
        method: "GET",
        cache: "no-store",
      });
      if (!result.ok) {
        throw new Error("Failed to fetch data");
      }
      const data = await result.json();
      setProduct(data?.data);
      setSelected(data?.data.collections.map((collection) => ({ label: collection.title, value:collection})));
      setSelectedColor(data?.data.colors.map((color) => ({ label: color, value: color })));
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getCollection();
    getProduct(productId);
  }, [productId]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const collectionIds = selected.map((item) => item.value);
    const selectedColorValues = selectedColor.map((tag) => tag.value);
    const data = {
      collections: collectionIds,
      colors: selectedColorValues,
    };

    try {
      const response = await fetch(`${BASEURL}/api/product/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setLoading(false);
        toast.success("Product Updated Successfully");
        router.push("/admin/products");
      } else {
        setLoading(false);
        toast.error("Product Update Failed");
      }
    } catch (error) {
      console.log(error);
      setLoading(false);
      toast.error("Product Update Failed");
    }
  };

  return (
    <div className="mb-20">
      <form onSubmit={handleSubmit} className="flex flex-col">
        <div className="lg:grid lg:grid-cols-3 md:grid md:grid-cols-1 w-full gap-5 py-5">
          <div className="flex flex-col py-2">
            <label htmlFor="collection">Collections</label>
            <MultiSelect
              options={options}
              value={selected}
              onChange={setSelected}
              labelledBy="Select"
              hasSelectAll={false}
              disableSearch={false}
            />
          </div>
          <div className="flex flex-col py-2">
            <label htmlFor="colors">Colors</label>
            <MultiSelect
              options={colorOptions}
              value={selectedColor}
              onChange={setSelectedColor}
              labelledBy="Select"
              hasSelectAll={false}
              disableSearch={false}
            />
          </div>
        </div>
        <div className="flex items-center gap-8 py-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white font-semibold rounded-lg px-4 py-2"
          >
            Submit
          </button>
          <Link href="/admin/products">
            <button className="bg-blue-800 text-white font-semibold rounded-lg px-4 py-2">
              Discard
            </button>
          </Link>
        </div>
      </form>
    </div>
  );
};

export default EditProduct;