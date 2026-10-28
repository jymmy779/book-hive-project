import React from "react";

export default function CartSkeleton() {
  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#faf8f5] py-6 md:py-10 px-4">
      <div className="container mx-auto max-w-5xl animate-pulse">
        {/* Title skeleton */}
        <div className="h-8 w-48 bg-[#e7e2d9] rounded-xl mb-6" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart items list (left 2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-[#e7e2d9] p-4 sm:p-5 flex gap-4 items-center"
              >
                {/* Book cover skeleton */}
                <div className="w-16 h-24 sm:w-20 sm:h-28 bg-[#e7e2d9] rounded-xl shrink-0" />

                {/* Book info skeleton */}
                <div className="flex-1 space-y-2.5">
                  <div className="h-5 w-3/4 bg-[#e7e2d9] rounded-md" />
                  <div className="h-4 w-1/3 bg-[#e7e2d9]/70 rounded-md" />
                  <div className="h-5 w-24 bg-[#e7e2d9] rounded-md" />
                </div>

                {/* Quantity & action skeleton */}
                <div className="space-y-2 flex flex-col items-end">
                  <div className="h-8 w-24 bg-[#e7e2d9] rounded-lg" />
                  <div className="h-6 w-6 bg-[#e7e2d9]/60 rounded-full" />
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary skeleton (right 1 col) */}
          <div className="bg-white rounded-2xl border border-[#e7e2d9] p-6 space-y-4 h-fit">
            <div className="h-6 w-36 bg-[#e7e2d9] rounded-md" />
            <div className="space-y-3 pt-2 border-t border-[#f2ede4]">
              <div className="flex justify-between">
                <div className="h-4 w-20 bg-[#e7e2d9] rounded" />
                <div className="h-4 w-16 bg-[#e7e2d9] rounded" />
              </div>
              <div className="flex justify-between">
                <div className="h-4 w-24 bg-[#e7e2d9] rounded" />
                <div className="h-4 w-12 bg-[#e7e2d9] rounded" />
              </div>
              <div className="flex justify-between pt-3 border-t border-[#f2ede4]">
                <div className="h-5 w-20 bg-[#e7e2d9] rounded" />
                <div className="h-6 w-28 bg-[#e7e2d9] rounded" />
              </div>
            </div>
            <div className="h-12 w-full bg-[#e7e2d9] rounded-xl mt-4" />
          </div>
        </div>
      </div>
    </div>
  );
}

