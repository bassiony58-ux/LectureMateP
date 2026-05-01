import { useState, useMemo, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { 
  ArrowRight, 
  ArrowLeft, 
  Filter, 
  Trash2, 
  Eye, 
  FileText, 
  RotateCcw 
} from "lucide-react";
import { format } from "date-fns";
import { useLectures } from "@/hooks/useLectures";
import { cn } from "@/lib/utils";
import type { Lecture, LectureCategory } from "@/lib/mockData";
import { useLanguage } from "@/contexts/LanguageContext";

const CATEGORY_LABELS: Record<string, { en: string; ar: string }> = {
  science: { en: "Science", ar: "العلوم" },
  technology: { en: "Technology", ar: "التكنولوجيا" },
  mathematics: { en: "Mathematics", ar: "الرياضيات" },
  medicine: { en: "Medicine", ar: "الطب" },
  history: { en: "History", ar: "التاريخ" },
  art: { en: "Art & Design", ar: "الفن والتصميم" },
  language: { en: "Languages", ar: "اللغات" },
  business: { en: "Business", ar: "الأعمال" },
  education: { en: "Education", ar: "التعليم" },
  other: { en: "Other Topics", ar: "مواضيع أخرى" }
};

export default function LectureHistoryView() {
  const { lectures, isLoading, deleteLecture } = useLectures();
  const [location, setLocation] = useLocation();
  const { language, isRTL } = useLanguage();
  
  // Make search params reactive
  const [search, setSearch] = useState(typeof window !== 'undefined' ? window.location.search : '');
  
  // Detect search changes even if pathname is the same
  useEffect(() => {
    const handlePopState = () => setSearch(window.location.search);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Also listen to wouter's location changes for initial mount and path changes
  useEffect(() => {
    setSearch(window.location.search);
  }, [location]);

  const urlCategory = useMemo(() => {
    const params = new URLSearchParams(search);
    return params.get('category') as LectureCategory | null;
  }, [search]);

  const [filter, setFilter] = useState<"all" | "pdf" | "youtube" | "ppt">("all");
  
  const t = {
    historyTitle: language === "ar" ? "مكتبتي الشاملة" : "My Global Library",
    libraryTitle: language === "ar" ? "مجموعة" : "Collection",
    backToDomains: language === "ar" ? "العودة للتصنيفات" : "Back to Categories",
    sortBy: language === "ar" ? "ترتيب حسب:" : "Sort by:",
    newest: language === "ar" ? "الأحدث أولاً" : "Newest First",
    filters: [
      { id: "all", label: language === "ar" ? "الكل" : "All" },
      { id: "pdf", label: language === "ar" ? "بي دي إف" : "PDFs" },
      { id: "youtube", label: language === "ar" ? "يوتيوب" : "Videos" },
      { id: "ppt", label: language === "ar" ? "بوربوينت" : "Presentations" }
    ],
    prev: language === "ar" ? "السابق" : "Previous",
    next: language === "ar" ? "التالي" : "Next",
    noResults: language === "ar" ? "لم يتم العثور على محاضرات تطابق الفلتر الحالي." : "No lectures found matching the current filter.",
    resetFilters: language === "ar" ? "إعادة ضبط المرشحات" : "Reset Filters"
  };

  const filteredLectures = useMemo(() => {
    let result = lectures;
    if (urlCategory) {
      result = result.filter(l => (l.category || 'other') === urlCategory);
    }
    return result.filter(l => {
      const type = l.sourceType || (l.geminiFileMimeType?.includes("pdf") ? "pdf" : l.geminiFileMimeType?.includes("presentation") ? "pptx" : "youtube");
      if (filter === "all") return true;
      if (filter === "youtube") return type === "youtube";
      if (filter === "pdf") return type === "pdf";
      if (filter === "ppt") return type === "pptx";
      return true;
    });
  }, [lectures, filter, urlCategory]);

  const categoryName = urlCategory ? (language === "ar" ? CATEGORY_LABELS[urlCategory]?.ar : CATEGORY_LABELS[urlCategory]?.en) || urlCategory : "";

  return (
    <div className="space-y-10" dir={isRTL ? "rtl" : "ltr"}>
      <div className={cn("flex flex-col sm:flex-row sm:items-center justify-between gap-6", isRTL ? "flex-row" : "flex-row")}>
        <div className={isRTL ? "text-right" : "text-left"}>
          <h2 className="text-4xl font-black text-on-surface tracking-tight font-headline">
            {urlCategory 
              ? (language === "ar" ? `${categoryName} ${t.libraryTitle}` : `${categoryName} ${t.libraryTitle}`) 
              : t.historyTitle}
          </h2>
          {urlCategory && (
            <Link href="/categories" className={cn(
              "text-sm font-bold text-[#F05A22] hover:underline flex items-center gap-1.5 mt-2",
              isRTL ? "justify-end" : "justify-start"
            )}>
               {isRTL ? <ArrowRight size={16} /> : <ArrowLeft size={16} />}
               <span>{t.backToDomains}</span>
            </Link>
          )}
        </div>
        
        <div className={cn("flex items-center gap-3 text-sm text-on-surface-variant font-medium", isRTL ? "flex-row" : "flex-row")}>
          <Filter size={16} />
          <span>{t.sortBy}</span>
          <button className="text-on-surface font-bold bg-transparent border-0 cursor-pointer p-0 hover:text-[#F05A22] transition-colors">
            {t.newest}
          </button>
        </div>
      </div>

      <div className={cn("flex flex-wrap gap-3", isRTL ? "flex-row" : "flex-row")}>
        {t.filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id as any)}
            className={cn(
              "px-6 py-2 rounded-full text-sm font-bold transition-all border-0 cursor-pointer shadow-sm",
              filter === f.id 
                ? "bg-[#F05A22] text-white scale-105" 
                : "bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-low"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filteredLectures.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredLectures.map((lecture) => (
            <HistoryCard 
              key={lecture.id} 
              lecture={lecture} 
              onDelete={() => deleteLecture(lecture.id)}
            />
          ))}
        </div>
      ) : (
        <div className="bg-surface-container-lowest rounded-[2.5rem] p-16 text-center border border-outline-variant/30">
          <div className="w-16 h-16 rounded-full bg-[#F05A22]/10 flex items-center justify-center mx-auto mb-6 text-[#F05A22]">
            <Filter size={32} />
          </div>
          <p className="text-on-surface-variant font-medium mb-6">{t.noResults}</p>
          <button 
            onClick={() => { setFilter("all"); setLocation("/history"); }}
            className="px-8 py-3 bg-[#1d1d1f] dark:bg-white text-white dark:text-[#1d1d1f] rounded-full font-bold text-sm shadow-lg hover:shadow-[#F05A22]/20 transition-all hover:-translate-y-0.5"
          >
            {t.resetFilters}
          </button>
        </div>
      )}

      {filteredLectures.length > 0 && (
        <div className={cn("flex items-center justify-center gap-2 pt-10 pb-6", isRTL ? "flex-row" : "flex-row")}>
          <button 
            aria-label={t.prev}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-white border border-outline-variant/30 text-on-surface-variant hover:text-[#F05A22] transition-colors shadow-sm cursor-pointer"
          >
            {isRTL ? <ArrowRight size={18} /> : <ArrowLeft size={18} />}
          </button>
          <button className="w-10 h-10 rounded-full flex items-center justify-center bg-[#F05A22] text-white font-bold shadow-md cursor-pointer">1</button>
          <button className="w-10 h-10 rounded-full flex items-center justify-center bg-white text-on-surface-variant font-bold hover:bg-surface-container-low transition-colors cursor-pointer">2</button>
          <button className="w-10 h-10 rounded-full flex items-center justify-center bg-white text-on-surface-variant font-bold hover:bg-surface-container-low transition-colors cursor-pointer">3</button>
          <span className="text-on-surface-variant/40 px-2">...</span>
          <button className="w-10 h-10 rounded-full flex items-center justify-center bg-white text-on-surface-variant font-bold hover:bg-surface-container-low transition-colors cursor-pointer">12</button>
          <button 
            aria-label={t.next}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-white border border-outline-variant/30 text-on-surface-variant hover:text-[#F05A22] transition-colors shadow-sm cursor-pointer"
          >
            {isRTL ? <ArrowLeft size={18} /> : <ArrowRight size={18} />}
          </button>
        </div>
      )}
    </div>
  );
}

function HistoryCard({ lecture, onDelete }: { lecture: Lecture, onDelete: () => void }) {
  const { language, isRTL } = useLanguage();
  const type = lecture.sourceType || (lecture.geminiFileMimeType?.includes("pdf") ? "pdf" : lecture.geminiFileMimeType?.includes("presentation") ? "pptx" : "youtube");
  const isVideo = type === "youtube";
  const isArchived = lecture.status === "failed" || lecture.status === "archived";

  const t = {
    archived: language === "ar" ? "مؤرشفة" : "Archived",
    completed: language === "ar" ? "مكتملة" : "Complete",
    file: language === "ar" ? "ملف" : "FILE",
    analyzed: language === "ar" ? "تم التحليل:" : "Analyzed:",
    restore: language === "ar" ? "استعادة" : "Restore",
    view: language === "ar" ? "عرض" : "View Open"
  };
  
  return (
    <div className="group relative bg-white rounded-[2.5rem] p-8 pb-10 shadow-[0_10px_40px_rgba(0,0,0,0.04)] border border-outline-variant/20 hover:shadow-[0_20px_60px_rgba(0,0,0,0.08)] transition-all duration-500 overflow-hidden text-center">
      <div className={cn("absolute top-8", isRTL ? "left-8" : "right-8")}>
        <div className={cn(
          "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm",
          isArchived 
            ? "bg-orange-100 text-orange-700 border border-orange-200" 
            : "bg-green-50 text-emerald-600 border border-emerald-100"
        )}>
          {isArchived ? t.archived : t.completed}
        </div>
      </div>

      <div className="flex justify-center mb-8">
        <div className={cn(
          "w-24 h-24 rounded-full flex items-center justify-center shadow-inner relative",
          isVideo ? "bg-red-50" : "bg-orange-50"
        )}>
          {isVideo ? (
            <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center text-white shadow-lg">
               <Eye size={22} fill="currentColor" />
            </div>
          ) : (
             <div className="w-10 h-10 bg-[#F05A22] rounded-lg flex items-center justify-center text-white shadow-lg">
                <div className="font-black text-[10px] italic">{t.file}</div>
             </div>
          )}
        </div>
      </div>

      <div className="space-y-2 mb-10 min-h-[5rem] flex flex-col justify-center">
        <h3 className="text-xl font-bold text-on-surface leading-tight line-clamp-2 px-2">
          {lecture.title}
        </h3>
        <p className="text-sm text-on-surface-variant/70 font-medium">
          {t.analyzed} {lecture.date || format(new Date(lecture.createdAt || Date.now()), 'MMM d, yyyy')}
        </p>
      </div>

      <div className={cn("flex items-center gap-3", isRTL ? "flex-row" : "flex-row")}>
        <Link 
          href={isArchived ? "#" : `/lecture/${lecture.id}`}
          className={cn(
            "flex-1 py-3 px-6 rounded-2xl font-bold text-[15px] transition-all no-underline text-center shadow-lg active:scale-95 flex items-center justify-center",
            isArchived 
              ? "bg-slate-100 text-slate-500 cursor-default shadow-none border border-slate-200" 
              : "bg-surface text-on-surface border border-outline-variant shadow-sm hover:bg-surface-container-low"
          )}
        >
          {isArchived ? (
            <div className={cn("flex items-center gap-2", isRTL ? "flex-row" : "flex-row")}>
               <RotateCcw size={18} />
               <span>{t.restore}</span>
            </div>
          ) : t.view}
        </Link>

        <button 
          onClick={(e) => { e.preventDefault(); onDelete(); }}
          aria-label={language === "ar" ? "حذف المحاضرة" : "Delete Lecture"}
          title={language === "ar" ? "حذف" : "Delete"}
          className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 border border-slate-100 flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all cursor-pointer"
        >
          <Trash2 size={20} />
        </button>
      </div>
    </div>
  );
}
