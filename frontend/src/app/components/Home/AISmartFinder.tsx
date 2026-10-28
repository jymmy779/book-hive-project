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
    <div className="mb-14 md:mb-18 rounded-3xl bg-gradient-to-br from-[#022c22] via-primary to-emerald-950 text-white p-6 sm:p-10 md:p-12 shadow-xl border border-white/10 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-accent/20 blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-3xl mx-auto text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/15 backdrop-blur-md text-accent-light border border-white/20 mb-3">
          <HiSparkles className="text-amber-300" />
          <span>Công Nghệ AI Gợi Ý Độc Quyền</span>
        </div>

        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white mb-3 tracking-tight">
          Chưa Biết Đọc Gì? Trợ Lý AI Sẽ Gợi Ý Chuẩn Gu
        </h2>

        <p className="text-xs sm:text-sm md:text-base text-slate-300 mb-6 max-w-xl mx-auto leading-relaxed">
          Chia sẻ tâm trạng, mục tiêu hoặc cuốn sách bạn từng yêu thích — AI BookHive sẽ gợi ý tác phẩm hoàn hảo nhất dành riêng cho bạn.
        </p>

        {/* Interactive Chat Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleTriggerAI();
          }}
          className="flex items-center gap-2 bg-white rounded-2xl p-2 shadow-2xl max-w-2xl mx-auto mb-4 text-text-primary border-2 border-white/20 focus-within:border-accent transition-colors"
        >
          <div className="pl-3 text-accent">
            <FiCpu size={20} />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ví dụ: Gợi ý cho mình sách giúp giảm stress và cân bằng công việc..."
            className="w-full bg-transparent outline-none text-xs sm:text-sm px-2 text-text-primary placeholder:text-text-muted"
          />
          <button
            type="submit"
            className="px-5 py-2.5 sm:py-3 bg-accent hover:bg-accent-hover text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            <span>Hỏi AI ngay</span>
            <FiSend size={13} />
          </button>
        </form>

        {/* Quick prompt pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
          <span className="text-slate-400 font-medium">Gợi ý câu hỏi:</span>
          {QUICK_TAGS.map((tag, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleTriggerAI(tag)}
              className="bg-white/10 hover:bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-lg text-slate-200 hover:text-white transition-all text-[11px] sm:text-xs cursor-pointer border border-white/10"
            >
              &ldquo;{tag}&rdquo;
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
