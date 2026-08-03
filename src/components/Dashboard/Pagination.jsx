"use client";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

const Pagination = ({ page, hasPrev, hasNext }) => {
  const router = useRouter();

  const btnClasses = (disabled) =>
    `inline-flex items-center gap-1.5 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
      disabled
        ? "cursor-not-allowed border-slate-200 text-slate-300"
        : "border-slate-200 bg-white text-slate-700 hover:border-indigo-300 hover:text-indigo-700"
    }`;

  return (
    <div className="mt-6 flex items-center justify-between gap-4 border-t border-slate-200 pt-4">
      <p className="text-sm text-slate-500">Page {page}</p>
      <div className="flex gap-3">
        <button
          disabled={!hasPrev}
          onClick={() => router.push(`?page=${page - 1}`)}
          className={btnClasses(!hasPrev)}
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </button>
        <button
          disabled={!hasNext}
          onClick={() => router.push(`?page=${page + 1}`)}
          className={btnClasses(!hasNext)}
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
