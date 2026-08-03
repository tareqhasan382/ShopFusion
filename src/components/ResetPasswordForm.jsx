"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { toast } from "react-toastify";
import { Lock, Eye, EyeOff } from "lucide-react";
import { AuthShell } from "@/components/AuthShell";

const ResetPasswordForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nextErrors = {};
    if (!token) nextErrors.token = "This link is invalid or has expired.";
    if (password.length < 8 || !/[a-zA-Z]/.test(password) || !/\d/.test(password))
      nextErrors.password =
        "Password must be at least 8 characters and include a letter and a number.";
    if (password !== confirm) nextErrors.confirm = "Passwords do not match.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Password reset. Please sign in with your new password.");
        router.replace("/sign-in");
      } else {
        if (data.errors) setErrors(data.errors);
        toast.error(data.message || "Failed to reset password.");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <AuthShell
        title="Invalid link"
        subtitle="This password reset link is invalid or has expired."
        footer={
          <Link href="/forgot-password" className="font-semibold text-indigo-600 hover:text-indigo-700">
            Request a new link
          </Link>
        }
      />
    );
  }

  return (
    <AuthShell
      title="Set a new password"
      subtitle="Choose a strong password you haven't used before."
      footer={
        <>
          Remembered it?{" "}
          <Link href="/sign-in" className="font-semibold text-indigo-600 hover:text-indigo-700">
            Back to sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <div>
          <label htmlFor="password" className="input-label">
            New password
          </label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              className="input-field pl-10 pr-10"
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors((p) => ({ ...p, password: undefined }));
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword((p) => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && <p className="field-error">{errors.password}</p>}
        </div>

        <div>
          <label htmlFor="confirm" className="input-label">
            Confirm new password
          </label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              id="confirm"
              name="confirm"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              className="input-field pl-10"
              placeholder="••••••••"
              value={confirm}
              onChange={(e) => {
                setConfirm(e.target.value);
                if (errors.confirm) setErrors((p) => ({ ...p, confirm: undefined }));
              }}
            />
          </div>
          {errors.confirm && <p className="field-error">{errors.confirm}</p>}
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "Resetting…" : "Reset password"}
        </button>
      </form>
    </AuthShell>
  );
};

const Wrapped = () => (
  <Suspense fallback={null}>
    <ResetPasswordForm />
  </Suspense>
);

export default Wrapped;
