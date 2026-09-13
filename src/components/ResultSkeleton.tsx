import React from 'react';

export const ResultSkeleton: React.FC = () => {
  return (
    <div id="result-skeleton" className="w-full space-y-6 animate-pulse" aria-busy="true" aria-label="Memuat analisis klaim...">
      {/* Skeleton Verdict Card */}
      <div className="bg-[#0a0a0c] border border-white/[0.08] rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-4 w-28 bg-white/[0.06] rounded-full" />
          <div className="h-4 w-20 bg-white/[0.04] rounded-full" />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="h-9 w-44 bg-white/[0.08] rounded-full" />
          <div className="h-12 sm:w-60 bg-white/[0.06] rounded-xl" />
        </div>

        <div className="h-4 w-3/4 bg-white/[0.04] rounded-md" />

        <div className="pt-4 border-t border-white/[0.06] space-y-3">
          <div className="h-3 w-32 bg-white/[0.04] rounded-full" />
          <div className="h-16 w-full bg-white/[0.04] rounded-xl" />
        </div>
      </div>

      {/* Skeleton Evidence List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
          <div className="h-6 w-52 bg-white/[0.08] rounded-md" />
          <div className="h-4 w-28 bg-white/[0.04] rounded-full" />
        </div>

        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-[#0a0a0c] border border-white/[0.08] rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="h-4 w-32 bg-white/[0.06] rounded-md" />
                <div className="h-5 w-24 bg-white/[0.06] rounded-full" />
              </div>
              <div className="h-6 w-4/5 bg-white/[0.08] rounded-md" />
              <div className="h-14 w-full bg-white/[0.04] rounded-xl" />
              <div className="flex justify-end">
                <div className="h-4 w-36 bg-white/[0.04] rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Skeleton Entities */}
      <div className="bg-[#0a0a0c] border border-white/[0.08] rounded-2xl p-6 space-y-3">
        <div className="h-4 w-32 bg-white/[0.06] rounded-md" />
        <div className="flex gap-2">
          <div className="h-7 w-36 bg-white/[0.05] rounded-full" />
          <div className="h-7 w-40 bg-white/[0.05] rounded-full" />
        </div>
      </div>

      {/* Skeleton Token Attribution */}
      <div className="bg-[#0a0a0c] border border-white/[0.08] rounded-2xl p-6">
        <div className="h-5 w-60 bg-white/[0.06] rounded-full" />
      </div>
    </div>
  );
};
