export function ResultSkeleton() {
  return (
    <div className="mt-24 animate-pulse space-y-4" aria-busy="true" aria-label="Memeriksa klaim…">
      <div className="h-3 w-24 rounded-full bg-soft" />
      <div className="h-14 w-2/3 rounded-2xl bg-soft" />
      <div className="h-4 w-full rounded-full bg-soft" />
      <div className="h-4 w-4/5 rounded-full bg-soft" />
    </div>
  );
}
