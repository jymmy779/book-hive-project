import Link from "next/link";
import {
  FaFacebookF,
  FaInstagram,
  FaGithub,
  FaPhoneAlt,
  FaEnvelope,
} from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="w-full bg-primary-dark text-white pt-12 pb-6 mt-16">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-center md:text-left">
        <div>
          <span className="font-extrabold text-2xl tracking-wide text-white">
            BookHive
          </span>
          <p className="mt-3 text-sm text-white/70 leading-relaxed">
            Nền tảng mua sách trực tuyến uy tín, đa dạng đầu sách, giao hàng tận
            nơi.
          </p>
        </div>
        <div>
          <h4 className="font-semibold mb-4 text-base text-white/90 border-b border-white/10 pb-2 inline-block">
            Liên kết nhanh
          </h4>
          <ul className="space-y-2 text-sm text-white/70">
            <li>
              <Link href="/" className="hover:text-white transition-colors duration-200">
                Trang chủ
              </Link>
            </li>
            <li>
              <Link href="/books" className="hover:text-white transition-colors duration-200">
                Sách
              </Link>
            </li>
            <li>
              <Link href="/cart" className="hover:text-white transition-colors duration-200">
                Giỏ hàng
              </Link>
            </li>
            <li>
              <Link href="/orders" className="hover:text-white transition-colors duration-200">
                Tra cứu
              </Link>
            </li>
            <li>
              <Link href="/profile" className="hover:text-white transition-colors duration-200">
                Tài khoản
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-4 text-base text-white/90 border-b border-white/10 pb-2 inline-block">
            Liên hệ
          </h4>
          <ul className="space-y-3 text-sm text-white/70">
            <li className="flex items-center justify-center md:justify-start gap-2">
              <FaPhoneAlt className="text-xs shrink-0" />
              <span>0935 846 541</span>
            </li>
            <li className="flex items-center justify-center md:justify-start gap-2">
              <FaEnvelope className="text-xs shrink-0" />
              <span>bookhivestore161@gmail.com</span>
            </li>
            <li className="leading-relaxed">
              286 Nguyễn Văn Lượng, Phường 16, Gò Vấp, TPHCM
            </li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-4 text-base text-white/90 border-b border-white/10 pb-2 inline-block">
            Kết nối với chúng tôi
          </h4>
          <div className="flex justify-center md:justify-start gap-3 mt-2">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all duration-200 hover:-translate-y-0.5"
            >
              <FaFacebookF className="text-sm" />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all duration-200 hover:-translate-y-0.5"
            >
              <FaInstagram className="text-sm" />
            </a>
            <a
              href="https://github.com/thaigithurb"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all duration-200 hover:-translate-y-0.5"
            >
              <FaGithub className="text-sm" />
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 mt-8 pt-6 text-center text-xs text-white/50">
        © {new Date().getFullYear()} BookHive. Đã đăng ký bản quyền. Thiết kế &
        phát triển bởi{" "}
        <a
          href="https://github.com/thaigithurb"
          target="_blank"
          className="text-white/80 hover:text-white transition-colors duration-200"
        >
          @thaigithurb
        </a>
      </div>
    </footer>
  );
}