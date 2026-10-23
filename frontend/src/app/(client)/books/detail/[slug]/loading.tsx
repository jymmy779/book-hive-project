export default function BookDetailLoading() {
  return (
    <div className="py-6 px-4 md:py-12" aria-label="Đang tải chi tiết sách">
      <div className="max-w-4xl mx-auto animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12">
          <div className="h-[440px] rounded-2xl bg-slate-200" />
          <div className="space-y-5 py-2">
            <div className="h-9 w-4/5 rounded bg-slate-200" />
            <div className="h-5 w-1/2 rounded bg-slate-200" />
            <div className="h-5 w-2/5 rounded bg-slate-200" />
            <div className="space-y-3 pt-3">
              <div className="h-4 rounded bg-slate-200" />
              <div className="h-4 rounded bg-slate-200" />
              <div className="h-4 w-3/4 rounded bg-slate-200" />
            </div>
            <div className="h-24 rounded-xl bg-slate-200" />
            <div className="h-14 rounded-xl bg-slate-200" />
          </div>
        </div>
      </div>
    </div>
  );
}
