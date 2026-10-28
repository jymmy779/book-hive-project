"use client";

import { useState } from "react";
import { FiStar, FiMail, FiCheck, FiUsers } from "react-icons/fi";
import { toast } from "react-toastify";

const TESTIMONIALS = [
  {
    name: "Nguyễn Minh Anh",
    role: "Độc giả tại Hà Nội",
    avatar: "MA",
    avatarBg: "bg-blue-600",
    rating: 5,
    comment:
      "Đặt sách sáng nay mà chiều đã nhận được. Sách đóng gói cực kỳ cẩn thận với xốp chống sốc, kèm bookmark thiết kế riêng rất ưng ý!",
  },
  {
    name: "Trần Đức Huy",
    role: "Kỹ sư phần mềm - TP.HCM",
    avatar: "DH",
    avatarBg: "bg-purple-600",
    rating: 5,
    comment:
      "Tính năng trợ lý AI gợi ý sách của BookHive khiến mình bất ngờ. Mình nhờ AI tìm sách về tư duy phản biện và được gợi ý đúng 2 cuốn cực kỳ sâu sắc.",
  },
  {
    name: "Lê Hoàng Yến",
    role: "Chuyên viên Marketing - Đà Nẵng",
    avatar: "HY",
    avatarBg: "bg-emerald-600",
    rating: 5,
    comment:
      "Chất lượng sách 100% bản quyền, giấy in đẹp, giá sách lại có nhiều mã giảm sâu. Giờ mình chỉ tin tưởng đặt sách ở BookHive.",
  },
];

export const ReaderCommunity = () => {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) {
      toast.warning("Vui lòng nhập địa chỉ email hợp lệ!");
      return;
    }
    setIsSubscribed(true);
    toast.success("Cảm ơn bạn! Mã voucher 15% đã được gửi vào hòm thư.");
    setEmail("");
  };

  return (
    <div className="mb-14 md:mb-18">
      {/* Testimonials Header */}
      <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary-light text-primary mb-2">
          <FiUsers size={13} />
          <span>Đồng Hành Cùng 1.000+ Bạn Đọc</span>
        </div>
        <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-text-primary tracking-tight">
          Cảm Nhận Từ Độc Giả BookHive
        </h2>
        <p className="text-xs sm:text-sm text-text-muted mt-1">
          Sự hài lòng của bạn là động lực để chúng tôi lan tỏa tri thức mỗi ngày
        </p>
      </div>

      {/* Testimonials Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-12">
        {TESTIMONIALS.map((item, idx) => (
          <div
            key={idx}
            className="p-5 sm:p-6 rounded-2xl bg-white border border-border/80 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
          >
            <div>
              {/* Stars */}
              <div className="flex items-center gap-1 text-warning mb-3">
                {Array.from({ length: item.rating }).map((_, i) => (
                  <FiStar key={i} size={14} className="fill-warning" />
                ))}
              </div>
              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed italic mb-4">
                &ldquo;{item.comment}&rdquo;
              </p>
            </div>

            <div className="flex items-center gap-3 pt-3 border-t border-border-light">
              <div
                className={`w-9 h-9 rounded-full ${item.avatarBg} text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs`}
              >
                {item.avatar}
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-text-primary">
                  {item.name}
                </h4>
                <p className="text-[11px] text-text-muted">{item.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Book Club Newsletter */}
      <div className="rounded-3xl p-6 sm:p-10 md:p-12 bg-gradient-to-r from-primary-dark via-primary to-accent text-white shadow-xl relative overflow-hidden">
        <div className="max-w-2xl mx-auto text-center relative z-10">
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-white/15 backdrop-blur-md text-amber-300 mb-3">
            🎁 Ưu Đãi Độc Quyền Cho Thành Viên Mới
          </span>

          <h3 className="text-xl sm:text-2xl md:text-3xl font-black mb-2 text-white">
            Gia Nhập Câu Lạc Bộ Độc Giả BookHive
          </h3>

          <p className="text-xs sm:text-sm text-slate-200 mb-6 leading-relaxed">
            Đăng ký nhận ngay voucher giảm 15% cho đơn hàng đầu tiên cùng danh sách gợi ý sách hay tuyển chọn hàng tuần.
          </p>

          <form
            onSubmit={handleSubscribe}
            className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto"
          >
            <div className="relative flex-1">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted">
                <FiMail size={16} />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Nhập địa chỉ email của bạn..."
                className="w-full bg-white text-text-primary text-xs sm:text-sm pl-10 pr-3 py-3 rounded-xl outline-none shadow-md placeholder:text-text-muted"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold text-xs sm:text-sm rounded-xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
            >
              {isSubscribed ? (
                <>
                  <FiCheck size={16} />
                  <span>Đã đăng ký</span>
                </>
              ) : (
                <span>Nhận ưu đãi</span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
