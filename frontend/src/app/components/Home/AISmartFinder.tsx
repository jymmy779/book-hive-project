"use client";

import { useState } from "react";
import { FiCpu, FiSend, FiSearch } from "react-icons/fi";
import { HiSparkles } from "react-icons/hi2";

const QUICK_TAGS = [
  "Sách chữa lành tâm hồn & tìm lại an yên",
  "Sách kinh doanh và đầu tư cho người mới",
  "Sách rèn luyện kỷ luật bản thân và sự tập trung",
  "Tiểu thuyết trinh thám gay cấn nhất",
];

export const AISmartFinder = () => {
  const [query, setQuery] = useState("");

  const handleTriggerAI = (textToSend?: string) => {
    const question = textToSend || query.trim();
    if (!question) return;

    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("open-ai-chat", {
          detail: { prompt: question },
        }),
      );
    }
    setQuery("");
  };

  return (
    <div className="relative mb-14 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#022c22] via-primary to-emerald-950 p-5 text-white shadow-xl sm:mb-18 sm:p-10 md:p-12">
      {/* Background Glow */}
      <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-accent/20 blur-3xl pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-3xl text-center">
        <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/15 px-3 py-1 text-[10px] font-semibold text-accent-light backdrop-blur-md sm:text-xs">
          <HiSparkles className="text-amber-300" />
          <span>Công Nghệ AI Gợi Ý Độc Quyền</span>
        </div>

        <h2 className="mb-3 text-xl font-extrabold leading-tight tracking-tight text-white sm:text-3xl md:text-4xl">
          Chưa Biết Đọc Gì? Trợ Lý AI Sẽ Gợi Ý Chuẩn Gu
        </h2>

        <p className="mx-auto mb-5 max-w-xl text-xs leading-relaxed text-slate-300 sm:mb-6 sm:text-sm md:text-base">
          Chia sẻ tâm trạng, mục tiêu hoặc cuốn sách bạn từng yêu thích — AI BookHive sẽ gợi ý tác phẩm hoàn hảo nhất dành riêng cho bạn.
        </p>

        {/* Interactive Chat Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleTriggerAI();
          }}
          className="mx-auto mb-5 flex max-w-2xl flex-wrap items-center gap-2 rounded-2xl border-2 border-white/20 bg-white p-2 text-text-primary shadow-2xl transition-colors focus-within:border-accent sm:mb-6 sm:flex-nowrap"
        >
          <div className="hidden pl-3 text-accent sm:block">
            <FiCpu size={20} />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ví dụ: Gợi ý cho mình sách giúp giảm stress và cân bằng công việc..."
            className="min-w-0 flex-1 bg-transparent px-2 py-2 text-xs text-text-primary outline-none placeholder:text-text-muted sm:py-1 sm:text-sm"
          />
          <button
            type="submit"
            className="ml-auto inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-xl bg-accent px-3 py-2.5 text-xs font-bold text-white shadow-md transition-all hover:bg-accent-hover sm:px-5 sm:py-3 sm:text-sm"
          >
            <span>Hỏi AI ngay</span>
            <FiSend size={13} />
          </button>
        </form>

        {/* Quick prompt pills */}
        <div className="space-y-2 text-xs">
          <p className="font-medium text-left text-slate-400">Gợi ý câu hỏi:</p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {QUICK_TAGS.map((tag, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleTriggerAI(tag)}
              className="min-h-10 w-full cursor-pointer rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-left text-[11px] leading-snug text-slate-200 transition-all hover:bg-white/20 hover:text-white sm:text-xs"
            >
              {tag}
            </button>
          ))}
          </div>
        </div>
      </div>
    </div>
  );
};
