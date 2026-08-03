"use client";
import { BASEURL } from "@lib/config";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import SearchableSelect from "@/components/SearchableSelect";

const emptySettings = {
  storeName: "",
  tagline: "",
  supportEmail: "",
  supportPhone: "",
  address: "",
  currency: "usd",
  lowStockThreshold: 5,
  freeShippingThreshold: 0,
  shippingCharge: 0,
  seoTitle: "",
  seoDescription: "",
};

const SettingsForm = () => {
  const [formData, setFormData] = useState(emptySettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const result = await fetch(`${BASEURL}/api/settings`, { method: "GET", cache: "no-store" });
      if (!result.ok) throw new Error("Failed to fetch settings");
      const data = await result.json();
      const s = data.data || {};
      setFormData({
        storeName: s.storeName || "",
        tagline: s.tagline || "",
        supportEmail: s.supportEmail || "",
        supportPhone: s.supportPhone || "",
        address: s.address || "",
        currency: s.currency || "usd",
        lowStockThreshold: s.lowStockThreshold ?? 5,
        freeShippingThreshold: s.freeShippingThreshold ?? 0,
        shippingCharge: s.shippingCharge ?? 0,
        seoTitle: s.seoTitle || "",
        seoDescription: s.seoDescription || "",
      });
    } catch {
      toast.error("Failed to load settings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? (value === "" ? "" : Number(value)) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const result = await fetch(`${BASEURL}/api/settings`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await result.json();
      if (!result.ok) throw new Error(data.message || "Failed to update settings.");
      toast.success("Settings updated.");
    } catch (err) {
      toast.error(err.message || "Failed to update settings.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
      </div>
    );
  }

  const field = "input-field";
  const label = "input-label";

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-8">
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="mb-4 text-base font-semibold text-slate-900">Store details</h2>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className={label}>Store name</label>
            <input name="storeName" className={field} value={formData.storeName} onChange={handleChange} />
          </div>
          <div>
            <label className={label}>Tagline</label>
            <input name="tagline" className={field} value={formData.tagline} onChange={handleChange} />
          </div>
          <div>
            <label className={label}>Support email</label>
            <input name="supportEmail" type="email" className={field} value={formData.supportEmail} onChange={handleChange} />
          </div>
          <div>
            <label className={label}>Support phone</label>
            <input name="supportPhone" className={field} value={formData.supportPhone} onChange={handleChange} />
          </div>
          <div className="sm:col-span-2">
            <label className={label}>Address</label>
            <input name="address" className={field} value={formData.address} onChange={handleChange} />
          </div>
          <div>
            <label className={label}>Currency</label>
            <SearchableSelect
              value={formData.currency}
              onChange={(v) =>
                handleChange({ target: { name: "currency", value: v } })
              }
              options={[
                { value: "usd", label: "USD ($)" },
                { value: "eur", label: "EUR (€)" },
                { value: "gbp", label: "GBP (£)" },
                { value: "bdt", label: "BDT (৳)" },
              ]}
              className={field}
            />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="mb-4 text-base font-semibold text-slate-900">Shipping & inventory</h2>
        <div className="grid gap-5 sm:grid-cols-3">
          <div>
            <label className={label}>Low-stock threshold</label>
            <input name="lowStockThreshold" type="number" min="0" className={field} value={formData.lowStockThreshold} onChange={handleChange} />
          </div>
          <div>
            <label className={label}>Free shipping threshold</label>
            <input name="freeShippingThreshold" type="number" min="0" step="0.01" className={field} value={formData.freeShippingThreshold} onChange={handleChange} />
          </div>
          <div>
            <label className={label}>Shipping charge</label>
            <input name="shippingCharge" type="number" min="0" step="0.01" className={field} value={formData.shippingCharge} onChange={handleChange} />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="mb-4 text-base font-semibold text-slate-900">SEO</h2>
        <div className="space-y-5">
          <div>
            <label className={label}>SEO title</label>
            <input name="seoTitle" className={field} value={formData.seoTitle} onChange={handleChange} />
          </div>
          <div>
            <label className={label}>SEO description</label>
            <textarea name="seoDescription" rows={3} className={field} value={formData.seoDescription} onChange={handleChange} />
          </div>
        </div>
      </div>

      <button type="submit" disabled={saving} className="btn-primary">
        {saving ? "Saving…" : "Save settings"}
      </button>
    </form>
  );
};

export default SettingsForm;
