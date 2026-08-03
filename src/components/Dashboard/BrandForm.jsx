"use client";
import { BASEURL } from "@lib/config";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";

const BrandForm = ({ initialData = {} }) => {
  const router = useRouter();
  const isEdit = Boolean(initialData?._id);
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    logo: initialData?.logo || "",
    description: initialData?.description || "",
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
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      setErrors({ name: "Name must be at least 2 characters." });
      return;
    }
    setLoading(true);
    try {
      const url = isEdit ? `${BASEURL}/api/brand/${initialData._id}` : `${BASEURL}/api/brand`;
      const result = await fetch(url, {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await result.json();
      if (!result.ok) {
        if (data.errors) setErrors(data.errors);
        throw new Error(data.message || "Failed to save brand.");
      }
      toast.success(isEdit ? "Brand updated." : "Brand created.");
      router.push("/admin/brands");
      router.refresh();
    } catch (err) {
      toast.error(err.message || "Failed to save brand.");
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
          <label className={label}>Name</label>
          <input name="name" className={field} value={formData.name} onChange={handleChange} placeholder="e.g. Adidas" />
          {errors.name && <p className="field-error">{errors.name}</p>}
        </div>
        <div>
          <label className={label}>Logo URL</label>
          <input name="logo" className={field} value={formData.logo} onChange={handleChange} placeholder="https://… (optional)" />
        </div>
        <div>
          <label className={label}>Description</label>
          <textarea name="description" className={field} rows={4} value={formData.description} onChange={handleChange} placeholder="Optional short description" />
        </div>
      </div>
      <div className="mt-6 flex gap-3">
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? "Saving…" : isEdit ? "Update brand" : "Create brand"}
        </button>
        <button type="button" onClick={() => router.push("/admin/brands")} className="btn-secondary">
          Cancel
        </button>
      </div>
    </form>
  );
};

export default BrandForm;
