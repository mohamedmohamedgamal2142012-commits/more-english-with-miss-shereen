import Link from "next/link";
import { getTranslation, Lang } from "@/lib/i18n";
import { FaFacebookF, FaYoutube, FaInstagram, FaWhatsapp, FaTiktok } from "react-icons/fa";
import { IoSchool } from "react-icons/io5";

interface FooterProps {
  lang: Lang;
}

export default function Footer({ lang }: FooterProps) {
  const t = (key: string) => getTranslation(lang, key);

  return (
    <footer className="bg-[#1F2937] text-white/80 pt-16 pb-0">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <Link href="/" className="flex items-center gap-2.5 font-bold text-lg text-white mb-4">
              <IoSchool className="text-primary text-xl" />
              <span>Miss Shereen Elmairy</span>
            </Link>
            <p className="text-sm leading-relaxed mb-5 text-white/60">
              {t("footerDesc")}
            </p>
            <div className="flex gap-3">
              {[
                { icon: FaFacebookF, label: "Facebook" },
                { icon: FaYoutube, label: "YouTube" },
                { icon: FaInstagram, label: "Instagram" },
                { icon: FaWhatsapp, label: "WhatsApp" },
                { icon: FaTiktok, label: "TikTok" },
              ].map(({ icon: Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  onClick={(e) => { e.preventDefault(); alert(`Demo: ${label}`); }}
                  className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white/70 transition-all duration-300 hover:bg-primary hover:text-white hover:-translate-y-0.5"
                >
                  <Icon className="text-base" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-white text-base font-semibold mb-5">{t("quickLinks")}</h4>
            <ul className="flex flex-col gap-2.5 list-none">
              {["about", "stages", "contact"].map((key) => (
                <li key={key}>
                  <Link
                    href={`/#${key}`}
                    className="text-sm text-white/60 transition-all duration-300 hover:text-primary"
                  >
                    {t(`nav${key.charAt(0).toUpperCase() + key.slice(1)}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white text-base font-semibold mb-5">{t("quickLinks")}</h4>
            <ul className="flex flex-col gap-2.5 list-none">
              {["kgCourses", "primaryCourses", "prepCourses", "secCourses"].map((key) => (
                <li key={key}>
                  <a
                    href="#"
                    onClick={(e) => { e.preventDefault(); alert(`Demo: ${key}`); }}
                    className="text-sm text-white/60 transition-all duration-300 hover:text-primary"
                  >
                    {t(key)}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white text-base font-semibold mb-5">{t("navContact")}</h4>
            <ul className="flex flex-col gap-2.5 list-none text-sm text-white/60">
              <li>+20 100 123 4567</li>
              <li>info@miss-shereen.com</li>
              <li>123 Education Street, Cairo, Egypt</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-10 py-6 text-center text-sm text-white/50">
          <p>{t("copyright")}</p>
        </div>
      </div>
    </footer>
  );
}
