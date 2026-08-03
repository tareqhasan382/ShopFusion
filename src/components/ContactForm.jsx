"use client";
import { useState } from "react";
import { toast } from "react-toastify";
import { Mail, Phone, MapPin, Loader2 } from "lucide-react";

const initialForm = { name: "", email: "", subject: "", message: "" };

const ContactForm = () => {
  const [formData, setFormData] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.errors) setErrors(data.errors);
        throw new Error(data.message || "Failed to send message.");
      }
      toast.success(data.message || "Message sent.");
      setFormData(initialForm);
    } catch (err) {
      toast.error(err.message || "Failed to send message.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-12 sm:px-6">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold text-slate-900">Contact Us</h1>
        <p className="mx-auto mt-2 max-w-xl text-slate-500">
          Have a question about an order, product, or need support? Send us a
          message and our team will get back to you within 24 hours.
        </p>
      </div>

      <div className="grid gap-10 lg:grid-cols-3">
        <div className="space-y-4">
          <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <Mail className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-900">Email</p>
              <p className="text-sm text-slate-500">support@shopfusion.com</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <Phone className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-900">Phone</p>
              <p className="text-sm text-slate-500">+1 (555) 123-4567</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <MapPin className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-900">Address</p>
              <p className="text-sm text-slate-500">123 Commerce St, ShopFusion HQ</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} noValidate className="rounded-xl border border-slate-200 bg-white p-6 lg:col-span-2">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="input-label">Name</label>
              <input name="name" className="input-field" value={formData.name} onChange={handleChange} placeholder="Your name" />
              {errors.name && <p className="field-error">{errors.name}</p>}
            </div>
            <div>
              <label className="input-label">Email</label>
              <input name="email" type="email" className="input-field" value={formData.email} onChange={handleChange} placeholder="you@example.com" />
              {errors.email && <p className="field-error">{errors.email}</p>}
            </div>
          </div>
          <div className="mt-5">
            <label className="input-label">Subject</label>
            <input name="subject" className="input-field" value={formData.subject} onChange={handleChange} placeholder="How can we help?" />
            {errors.subject && <p className="field-error">{errors.subject}</p>}
          </div>
          <div className="mt-5">
            <label className="input-label">Message</label>
            <textarea name="message" rows={6} className="input-field resize-none" value={formData.message} onChange={handleChange} placeholder="Tell us more…" />
            {errors.message && <p className="field-error">{errors.message}</p>}
          </div>
          <button type="submit" disabled={loading} className="btn-primary mt-6">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send message"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ContactForm;
