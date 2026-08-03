"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";
import { Check, Eye, EyeOff, Lock, Mail, User } from "lucide-react";
import { useAuth } from "@/Providers";
import { AuthShell } from "@/components/AuthShell";

const SignUpForm = () => {
  const router = useRouter();
  const { register } = useAuth();
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const validate = () => {
    const nextErrors = {};
    const name = formData.name.trim();
    if (!name) nextErrors.name = "Full name is required.";
    else if (name.length < 2 || name.length > 50)
      nextErrors.name = "Name must be between 2 and 50 characters.";

    if (!formData.email.trim()) nextErrors.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(formData.email.trim()))
      nextErrors.email = "Please enter a valid email address.";

    if (!formData.password) nextErrors.password = "Password is required.";
    else if (formData.password.length < 8)
      nextErrors.password = "Password must be at least 8 characters.";
    else if (!/[a-zA-Z]/.test(formData.password) || !/\d/.test(formData.password))
      nextErrors.password = "Password must include a letter and a number.";

    return nextErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setLoading(true);
    const result = await register({
      name: formData.name.trim(),
      email: formData.email.trim(),
      password: formData.password,
    });
    setLoading(false);

    if (result.ok) {
      toast.success("Account created successfully.");
      router.replace("/");
      router.refresh();
    } else {
      if (result.errors) setErrors(result.errors);
      toast.error(result.message || "Failed to create account.");
    }
  };

  const passwordHintOk =
    formData.password.length >= 8 &&
    /[a-zA-Z]/.test(formData.password) &&
    /\d/.test(formData.password);

  return (
    <AuthShell
      title="Create your account"
      subtitle="Join ShopFusion and start shopping smarter."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/sign-in" className="font-semibold text-indigo-600 hover:text-indigo-700">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <div>
          <label htmlFor="name" className="input-label">
            Full name
          </label>
          <div className="relative">
            <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              className="input-field pl-10"
              placeholder="Jane Doe"
              value={formData.name}
              onChange={handleChange}
            />
          </div>
          {errors.name && <p className="field-error">{errors.name}</p>}
        </div>

        <div>
          <label htmlFor="email" className="input-label">
            Email address
          </label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              className="input-field pl-10"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
            />
          </div>
          {errors.email && <p className="field-error">{errors.email}</p>}
        </div>

        <div>
          <label htmlFor="password" className="input-label">
            Password
          </label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              className="input-field pl-10 pr-10"
              placeholder="Create a strong password"
              value={formData.password}
              onChange={handleChange}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password ? (
            <p className="field-error">{errors.password}</p>
          ) : (
            formData.password.length > 0 && (
              <p className="mt-1.5 flex items-center gap-1.5 text-xs text-emerald-600">
                <Check className="h-3.5 w-3.5" />
                {passwordHintOk
                  ? "Looks good — strong password."
                  : "Use 8+ characters with a letter and a number."}
              </p>
            )
          )}
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              Creating account…
            </span>
          ) : (
            "Create account"
          )}
        </button>
      </form>
    </AuthShell>
  );
};

export default SignUpForm;
