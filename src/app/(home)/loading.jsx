export default function Loading() {
  return (
    <div className="mx-auto max-w-[1280px] space-y-8 px-4 py-8 sm:px-6">
      <div className="h-64 w-full animate-pulse rounded-2xl bg-slate-200" />
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="aspect-[4/5] w-full animate-pulse rounded-2xl bg-slate-200"
          />
        ))}
      </div>
    </div>
  );
}
