"use client";
import { BASEURL } from "@lib/config";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";
import SearchableSelect from "@/components/SearchableSelect";

const CouponForm = ({ initialData = {} }) => {
  const router = useRouter();
  const isEdit = Boolean(initialData?._id);
  const [formData, setFormData] = useState({
    code: initialData?.code || "",
    type: initialData?.type || "percent",
    value: initialData?.value ?? "",
    minOrderAmount: initialData?.minOrderAmount ?? "",
    maxDiscount: initialData?.maxDiscount ?? "",
    expiresAt: initialData?.expiresAt
      ? new Date(initialData.expiresAt).toISOString().slice(0, 16)
      : "",
    usageLimit: initialData?.usageLimit ?? "",
    isActive: initialData?.isActive !== false,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.code.trim()) {
      setErrors({ code: "Code is required." });
      return;
    }
    if (formData.value === "" || Number(formData.value) <= 0) {
      setErrors({ value: "A positive value is required." });
      return;
    }
    setLoading(true);
    try {
      const payload = {
        ...formData,
        code: formData.code.trim().toUpperCase(),
        value: Number(formData.value),
        minOrderAmount: formData.minOrderAmount !== "" ? Number(formData.minOrderAmount) : 0,
        maxDiscount: formData.maxDiscount !== "" ? Number(formData.maxDiscount) : 0,
        usageLimit: formData.usageLimit !== "" ? Number(formData.usageLimit) : 0,
        expiresAt: formData.expiresAt ? new Date(formData.expiresAt).toISOString() : null,
      };
      const url = isEdit ? `${BASEURL}/api/coupon/${initialData._id}` : `${BASEURL}/api/coupon`;
      const result = await fetch(url, {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await result.json();
      if (!result.ok) {
        if (data.errors) setErrors(data.errors);
        throw new Error(data.message || "Failed to save coupon.");
      }
      toast.success(isEdit ? "Coupon updated." : "Coupon created.");
      router.push("/admin/coupons");
      router.refresh();
    } catch (err) {
      toast.error(err.message || "Failed to save coupon.");
    } finally {
      setLoading(false);
    }
  };

  const field = "input-field";
  const label = "input-label";

  return (
    <form onSubmit={handleSubmit} noValidate className="max-w-2xl rounded-xl border border-slate-200 bg-white p-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className={label}>Code</label>
          <input name="code" className={field} value={formData.code} onChange={handleChange} placeholder="e.g. SAVE10" />
          {errors.code && <p className="field-error">{errors.code}</p>}
        </div>
        <div>
          <label className={label}>Type</label>
          <SearchableSelect
            value={formData.type}
            onChange={(v) =>
              handleChange({ target: { name: "type", value: v } })
            }
            options={[
              { value: "percent", label: "Percent (%)" },
              { value: "fixed", label: "Fixed ($)" },
            ]}
            className={field}
          />
        </div>
        <div>
          <label className={label}>{formData.type === "percent" ? "Percent off" : "Amount off"}</label>
          <input name="value" type="number" step="0.01" min="0" className={field} value={formData.value} onChange={handleChange} placeholder={formData.type === "percent" ? "10" : "5.00"} />
          {errors.value && <p className="field-error">{errors.value}</p>}
        </div>
        <div>
          <label className={label}>Minimum order amount</label>
          <input name="minOrderAmount" type="number" step="0.01" min="0" className={field} value={formData.minOrderAmount} onChange={handleChange} placeholder="0" />
        </div>
        <div>
          <label className={label}>Max discount (0 = unlimited)</label>
          <input name="maxDiscount" type="number" step="0.01" min="0" className={field} value={formData.maxDiscount} onChange={handleChange} placeholder="0" />
        </div>
        <div>
          <label className={label}>Usage limit (0 = unlimited)</label>
          <input name="usageLimit" type="number" step="1" min="0" className={field} value={formData.usageLimit} onChange={handleChange} placeholder="0" />
        </div>
        <div>
          <label className={label}>Expires at</label>
          <input name="expiresAt" type="datetime-local" className={field} value={formData.expiresAt} onChange={handleChange} />
        </div>
        <div className="flex items-end pb-2">
          <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-700">
            <input name="isActive" type="checkbox" checked={formData.isActive} onChange={handleChange} className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
            Active
          </label>
        </div>
      </div>
      <div className="mt-6 flex gap-3">
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? "Saving…" : isEdit ? "Update coupon" : "Create coupon"}
        </button>
        <button type="button" onClick={() => router.push("/admin/coupons")} className="btn-secondary">
          Cancel
        </button>
      </div>
    </form>
  );
};

export default CouponForm;
