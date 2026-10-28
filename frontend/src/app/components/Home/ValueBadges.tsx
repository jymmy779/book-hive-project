"use client";

import { FiTruck, FiShield, FiRefreshCw, FiCpu } from "react-icons/fi";
import { ScrollRevealItem } from "../Animation/ScrollReveal";

const BADGES = [
  {
    icon: FiTruck,
    title: "Giao hàng toàn quốc",
    desc: "Miễn phí ship đơn từ 250k",
    color: "text-blue-600 bg-blue-50 border-blue-100",
  },
  {
    icon: FiShield,
    title: "100% Sách chính hãng",
    desc: "Bản quyền & chất lượng cao",
    color: "text-emerald-600 bg-emerald-50 border-emerald-100",
  },
  {
    icon: FiRefreshCw,
    title: "Đổi trả trong 7 ngày",
    desc: "Hỗ trợ đổi mới nhanh chóng",
    color: "text-amber-600 bg-amber-50 border-amber-100",
  },
  {
    icon: FiCpu,
    title: "AI Tư vấn thông minh",
    desc: "Gợi ý sách chuẩn gu bạn đọc",
    color: "text-purple-600 bg-purple-50 border-purple-100",
  },
];

export const ValueBadges = () => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5 mb-10 md:mb-14">
      {BADGES.map((badge, idx) => {
        const Icon = badge.icon;
        return (
          <ScrollRevealItem
            key={idx}
            className="flex items-center gap-3 p-3.5 sm:p-4 rounded-xl bg-white border border-border/80 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
          >
            <div
              className={`w-10 h-10 sm:w-11 sm:h-11 rounded-lg flex items-center justify-center shrink-0 border ${badge.color}`}
            >
              <Icon size={20} />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs sm:text-sm font-bold text-text-primary truncate">
                {badge.title}
              </h4>
              <p className="text-[11px] sm:text-xs text-text-secondary truncate mt-0.5">
                {badge.desc}
              </p>
            </div>
          </ScrollRevealItem>
        );
      })}
    </div>
  );
};
