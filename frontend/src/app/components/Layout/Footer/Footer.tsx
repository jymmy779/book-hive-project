import Link from "next/link";
import {
  FaFacebookF,
  FaInstagram,
  FaGithub,
  FaPhoneAlt,
  FaEnvelope,
} from "react-icons/fa";
import { FiShield, FiTruck, FiRefreshCw, FiBookOpen } from "react-icons/fi";

export default function Footer() {
  return (
    <footer className="w-full bg-[#022c22] text-white pt-14 pb-8 mt-20 border-t border-emerald-950">
      {/* Top Value Strip */}
      <div className="max-w-7xl mx-auto px-4 pb-12 border-b border-white/10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-amber-400 shrink-0">
              <FiTruck size={20} />
            </div>
            <div>
              <h5 className="font-bold text-sm text-white">Giao Hàng Siêu Tốc</h5>
              <p className="text-xs text-white/60 mt-0.5">Freeship đơn từ 250k toàn quốc</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center md:items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-amber-400 shrink-0">
              <FiShield size={20} />
            </div>
            <div>
              <h5 className="font-bold text-sm text-white">100% Sách Thật</h5>
              <p className="text-xs text-white/60 mt-0.5">Cam kết bản quyền chính hãng</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center md:items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-amber-400 shrink-0">
              <FiRefreshCw size={20} />
            </div>
            <div>
              <h5 className="font-bold text-sm text-white">Đổi Trả Dễ Dàng</h5>
              <p className="text-xs text-white/60 mt-0.5">Hỗ trợ đổi mới trong 7 ngày</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center md:items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-amber-400 shrink-0">
              <FiBookOpen size={20} />
            </div>
            <div>
              <h5 className="font-bold text-sm text-white">Kho Tri Thức Lớn</h5>
              <p className="text-xs text-white/60 mt-0.5">Hơn 500+ tựa sách chọn lọc</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Sitemap & Info */}
      <div className="max-w-7xl mx-auto px-4 pt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-center md:text-left">
        <div>
          <div className="flex items-center justify-center md:justify-start gap-2 mb-3">
            <span className="font-black text-2xl tracking-tight text-white">
              BookHive
            </span>
            <span className="text-xs font-bold px-2 py-0.5 bg-amber-400 text-slate-950 rounded-md">
              Store
            </span>
          </div>
          <p className="text-xs sm:text-sm text-white/70 leading-relaxed mb-4">
            Nơi hội tụ những trang sách tinh tuyển, nuôi dưỡng tâm hồn và mở ra chân trời tri thức bất tận cho mọi thế hệ độc giả.
          </p>
        </div>

        <div>
          <h4 className="font-bold mb-4 text-sm text-amber-300 uppercase tracking-wider">
            Khám phá
          </h4>
          <ul className="space-y-2 text-xs sm:text-sm text-white/75">
            <li>
              <Link href="/" className="hover:text-amber-300 transition-colors">
                Trang chủ
              </Link>
            </li>
            <li>
              <Link href="/books" className="hover:text-amber-300 transition-colors">
                Tất cả sách
              </Link>
            </li>
            <li>
              <Link href="/books?sort=best-seller" className="hover:text-amber-300 transition-colors">
                Sách bán chạy
              </Link>
            </li>
            <li>
              <Link href="/books?sort=newest" className="hover:text-amber-300 transition-colors">
                Sách mới phát hành
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold mb-4 text-sm text-amber-300 uppercase tracking-wider">
            Hỗ trợ độc giả
          </h4>
          <ul className="space-y-2.5 text-xs sm:text-sm text-white/75">
            <li className="flex items-center justify-center md:justify-start gap-2">
              <FaPhoneAlt className="text-amber-400 text-xs shrink-0" />
              <span>Hotline: 0935 846 541</span>
            </li>
            <li className="flex items-center justify-center md:justify-start gap-2">
              <FaEnvelope className="text-amber-400 text-xs shrink-0" />
              <span>bookhivestore161@gmail.com</span>
            </li>
            <li className="leading-relaxed text-white/60 text-xs">
              286 Nguyễn Văn Lượng, P.16, Gò Vấp, TP. Hồ Chí Minh
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold mb-4 text-sm text-amber-300 uppercase tracking-wider">
            Kết nối cùng BookHive
          </h4>
          <p className="text-xs text-white/60 mb-3">
            Theo dõi chúng tôi để cập nhật các sự kiện ra mắt sách và ưu đãi hàng tuần.
          </p>
          <div className="flex justify-center md:justify-start gap-2.5">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-xl bg-white/10 hover:bg-amber-400 hover:text-slate-950 flex items-center justify-center transition-all duration-200"
              aria-label="Facebook"
            >
              <FaFacebookF className="text-sm" />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-xl bg-white/10 hover:bg-amber-400 hover:text-slate-950 flex items-center justify-center transition-all duration-200"
              aria-label="Instagram"
            >
              <FaInstagram className="text-sm" />
            </a>
            <a
              href="https://github.com/thaigithurb"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-xl bg-white/10 hover:bg-amber-400 hover:text-slate-950 flex items-center justify-center transition-all duration-200"
              aria-label="Github"
            >
              <FaGithub className="text-sm" />
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 mt-10 pt-6 text-center text-xs text-white/50">
        © {new Date().getFullYear()} BookHive. Tinh hoa tri thức Việt. Thiết kế & phát triển bởi{" "}
        <a
          href="https://github.com/thaigithurb"
          target="_blank"
          className="text-amber-400 hover:underline"
        >
          @thaigithurb
        </a>
      </div>
    </footer>
  );
}