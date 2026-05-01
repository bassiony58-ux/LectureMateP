import { useState } from "react";
import { Search, UserCircle, Languages } from "lucide-react";
import { Link } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

export default function Header() {
  const [tab, setTab] = useState<"recent" | "favorites">("recent");
  const { language, toggleLanguage, isRTL } = useLanguage();

  const t = {
    recent: language === "ar" ? "المحاضرات الأخيرة" : "Recent Lectures",
    search: language === "ar" ? "ابحث في موادك..." : "Search materials...",
    account: language === "ar" ? "الحساب الشخصي" : "Account"
  };

  return (
    <header className={cn(
      "flex justify-between items-center w-full px-12 py-5 sticky top-0 bg-surface/95 backdrop-blur-sm z-40 border-b border-outline-variant/40",
      isRTL ? "flex-row" : "flex-row"
    )} dir={isRTL ? "rtl" : "ltr"}>
      <div className="flex items-center gap-10 text-[15px] font-semibold font-sans">
        <button
          type="button"
          className="text-[#F05A22] border-b-[3px] border-[#F05A22] pb-2 -mb-[1px] leading-none bg-transparent border-x-0 border-t-0 cursor-default"
        >
          {t.recent}
        </button>
      </div>

      <div className="flex items-center gap-5">
        <button 
          onClick={toggleLanguage}
          className="p-2 rounded-full hover:bg-surface-container-low text-on-surface-variant hover:text-[#F05A22] transition-all flex items-center gap-2 border-0 bg-transparent cursor-pointer font-bold text-xs"
          title={language === "ar" ? "Switch to English" : "التحويل للعربية"}
        >
          <Languages size={18} />
          <span>{language === "ar" ? "EN" : "AR"}</span>
        </button>

        <div className="relative">
          <Search
            className={cn(
              "absolute top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none",
              isRTL ? "right-3.5" : "left-3.5"
            )}
            size={17}
          />
          <input
            type="search"
            placeholder={t.search}
            className={cn(
              "bg-surface-container-lowest rounded-full py-2.5 border border-outline-variant/50 focus:ring-2 focus:ring-[#F05A22]/25 focus:border-transparent w-[220px] sm:w-64 text-sm text-on-surface placeholder:text-on-surface-variant/70 shadow-sm",
              isRTL ? "pr-10 pl-4 text-right" : "pl-10 pr-4 text-left"
            )}
          />
        </div>

        <Link
          href="/profile"
          className="text-on-surface-variant hover:text-[#F05A22] transition-colors rounded-full p-0.5 inline-flex no-underline"
          aria-label={t.account}
        >
          <UserCircle size={26} strokeWidth={1.75} />
        </Link>
      </div>
    </header>
  );
}
