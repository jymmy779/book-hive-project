import React from "react";

export default function EditProfileSkeleton() {
  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#faf8f5]">
      {/* Header Banner Skeleton */}
      <div className="bg-[#064e3b]/30 pt-10 pb-24 px-4 relative animate-pulse">
        <div className="container mx-auto max-w-xl">
          <div className="h-9 w-24 bg-white/20 rounded-xl" />
        </div>
      </div>

      {/* Avatar & Form Skeleton */}
      <div className="container mx-auto max-w-xl px-4 -mt-16 pb-12 animate-pulse">
        <div className="flex flex-col items-center mb-6">
          <div className="w-24 h-24 rounded-2xl bg-[#e7e2d9] border-4 border-white shadow-md" />
          <div className="h-4 w-40 bg-[#e7e2d9] rounded mt-3" />
        </div>

        <div className="bg-white rounded-2xl border border-[#e7e2d9] p-6 sm:p-8 space-y-5">
          <div className="space-y-2">
            <div className="h-4 w-20 bg-[#e7e2d9] rounded" />
            <div className="h-11 w-full bg-[#faf8f5] border border-[#e7e2d9] rounded-xl" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-16 bg-[#e7e2d9] rounded" />
            <div className="h-11 w-full bg-[#f3f4f6] border border-[#e7e2d9] rounded-xl" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-24 bg-[#e7e2d9] rounded" />
            <div className="h-11 w-full bg-[#faf8f5] border border-[#e7e2d9] rounded-xl" />
          </div>
          <div className="flex gap-3 pt-4">
            <div className="h-11 flex-1 bg-[#e7e2d9]/60 rounded-xl" />
            <div className="h-11 flex-1 bg-[#064e3b]/30 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

