"use client";
import { BASEURL } from "@lib/config";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";

const CategoryForm = ({ initialData = {} }) => {
  const router = useRouter();
  const isEdit = Boolean(initialData?._id);
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    description: initialData?.description || "",
    image: initialData?.image || "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || formData.title.trim().length < 2) {
      setErrors({ title: "Title must be at least 2 characters." });
      return;
    }
    setLoading(true);
    try {
      const url = isEdit ? `${BASEURL}/api/category/${initialData._id}` : `${BASEURL}/api/category`;
      const result = await fetch(url, {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await result.json();
      if (!result.ok) {
        if (data.errors) setErrors(data.errors);
        throw new Error(data.message || "Failed to save category.");
      }
      toast.success(isEdit ? "Category updated." : "Category created.");
      router.push("/admin/categories");
      router.refresh();
    } catch (err) {
      toast.error(err.message || "Failed to save category.");
    } finally {
      setLoading(false);
    }
  };

  const field = "input-field";
  const label = "input-label";

  return (
    <form onSubmit={handleSubmit} noValidate className="max-w-2xl rounded-xl border border-slate-200 bg-white p-6">
      <div className="space-y-5">
        <div>
          <label className={label}>Title</label>
          <input name="title" className={field} value={formData.title} onChange={handleChange} placeholder="e.g. Dresses" />
          {errors.title && <p className="field-error">{errors.title}</p>}
        </div>
        <div>
          <label className={label}>Description</label>
          <textarea name="description" className={field} rows={4} value={formData.description} onChange={handleChange} placeholder="Optional short description" />
        </div>
        <div>
          <label className={label}>Image URL</label>
          <input name="image" className={field} value={formData.image} onChange={handleChange} placeholder="https://… (optional)" />
        </div>
      </div>
      <div className="mt-6 flex gap-3">
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? "Saving…" : isEdit ? "Update category" : "Create category"}
        </button>
        <button type="button" onClick={() => router.push("/admin/categories")} className="btn-secondary">
          Cancel
        </button>
      </div>
    </form>
  );
};

export default CategoryForm;
