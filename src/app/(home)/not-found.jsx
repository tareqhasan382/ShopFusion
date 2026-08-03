import Link from "next/link";
import { FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <FileQuestion className="h-16 w-16 text-indigo-200" />
      <h2 className="text-4xl font-extrabold text-slate-900">404</h2>
      <p className="text-lg font-semibold text-slate-700">Page not found</p>
      <p className="max-w-md text-sm text-slate-500">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link href="/" className="btn-primary mt-2">
        Back to home
      </Link>
    </div>
  );
}
