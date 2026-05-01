import { useState, useMemo, ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Share2, Sparkles, FileDown } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { cn } from "@/lib/utils";
import { TextWithMath } from "./MathRenderer";

interface SummaryViewProps {
  summary: string | string[]; // Support both long-form string (new) and array (legacy)
  title?: string;
}

interface ParsedSections {
  intro: string;
  summary: string;
  keyPoints: string[];
}

export function SummaryView({ summary, title: initialTitle }: SummaryViewProps) {
  const { toast } = useToast();
  const { language } = useLanguage();
  const isRTL = language === "ar";

  // Parsing logic for the rich JSON format
  const parsedData = useMemo(() => {
    if (typeof summary !== "string") return null;
    try {
      if (summary.trim().startsWith("{")) {
        return JSON.parse(summary);
      }
    } catch (e) {
      console.warn("Summary is not JSON, falling back to legacy parsing");
    }
    return null;
  }, [summary]);

  const t = {
    keyConcepts: language === "ar" ? "المفاهيم الأساسية" : "Key Concepts",
    definitions: language === "ar" ? "التعريفات العلمية" : "Definitions",
    takeaways: language === "ar" ? "الخلاصة والنتائج" : "Takeaway Summary",
    exportPDF: language === "ar" ? "تصدير الملخص" : "Export Summary",
    quizReady: language === "ar" ? "الاختبار جاهز" : "Quick Quiz Ready",
    startFlashcards: language === "ar" ? "ابدأ المراجعة" : "Start Flashcards",
    breadcrumb: {
      courses: language === "ar" ? "الدورات" : "Courses",
      cs: language === "ar" ? "علوم الحاسب" : "Computer Science",
      summary: language === "ar" ? "ملخص المحاضرة" : "Lecture Summary"
    }
  };

  const handleExportPDF = async () => {
    const element = document.getElementById("premium-summary-container");
    if (!element) return;

    try {
      const canvas = await html2canvas(element, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${initialTitle || "Summary"}.pdf`);
      toast({ title: language === "ar" ? "تم التصدير بنجاح" : "PDF Exported Successfully" });
    } catch (err) {
      toast({ title: "Export Failed", variant: "destructive" });
    }
  };

  // If not premium JSON, show legacy view
  if (!parsedData) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-6">
        <h1 className="text-4xl font-black mb-8 text-[#1A1A1A]">{initialTitle || t.breadcrumb.summary}</h1>
        <div className="prose prose-orange max-w-none">
          <TextWithMath text={typeof summary === "string" ? summary : (Array.isArray(summary) ? summary.join("\n") : "No summary available.")} />
        </div>
      </div>
    );
  }

  const { mainTitle, subTitle, keyConcepts, definitions, takeawaySummary, takeawayPoints } = parsedData;

  // Split title to emulate the "Orange end" style
  const titleParts = (mainTitle || initialTitle || "Lecture Summary")?.split(" ") || [];
  const lastPart = titleParts.slice(-2).join(" ");
  const firstPart = titleParts.slice(0, -2).join(" ");

  return (
    <div id="premium-summary-container" className={cn("min-h-screen bg-[#FCFCFC] py-12 px-6 md:px-12 font-sans overflow-hidden", isRTL && "rtl text-right")}>
      <div className="max-w-[1200px] mx-auto">
        
        {/* Breadcrumbs */}
        <div className={cn("flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#A0A0A0] mb-6", isRTL && "flex-row-reverse")}>
          <span>{t.breadcrumb.courses}</span>
          <span className="opacity-40">/</span>
          <span>{t.breadcrumb.cs}</span>
          <span className="opacity-40">/</span>
          <span className="text-[#F05A22]">{t.breadcrumb.summary}</span>
        </div>

        {/* Header Section */}
        <div className="mb-14">
          <h1 className="text-4xl md:text-5xl font-black text-[#1A1A1A] mb-6 leading-tight">
            {firstPart} <span className="text-[#F05A22]">{lastPart}</span>
          </h1>
          <p className="text-lg md:text-xl text-[#666666] max-w-3xl leading-relaxed font-medium">
            {subTitle}
          </p>
        </div>

        {/* Actions Bar */}
        <div className="flex justify-end gap-3 mb-10 no-print">
          <Button 
            variant="outline" 
            onClick={handleExportPDF}
            className="rounded-full border-[#E5E5E5] text-[#1A1A1A] hover:bg-white hover:border-[#F05A22] font-bold transition-all h-12 px-6"
          >
            <Download className="w-4 h-4 mr-2" /> {t.exportPDF}
          </Button>
          <Button 
            className="bg-[#1A1A1A] text-white hover:bg-black rounded-full w-12 h-12 flex items-center justify-center p-0 transition-all active:scale-95"
          >
            <Share2 className="w-4 h-4" />
          </Button>
        </div>

        {/* Dynamic Bento-style Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Main Content Side (8/12) */}
          <div className="lg:col-span-8 space-y-10">
            
            {/* Key Concepts Card */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-[50px] p-10 md:p-14 shadow-[0_30px_60px_rgba(0,0,0,0.03)] border border-[#F0F0F0] relative overflow-hidden group"
            >
              {/* Decorative background element */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#F05A22]/[0.02] rounded-full -translate-y-1/2 translate-x-1/3 transition-transform group-hover:scale-110" />
              
              <div className={cn("flex items-center gap-5 mb-14", isRTL && "flex-row-reverse")}>
                <div className="w-12 h-12 rounded-full bg-[#FFF1ED] flex items-center justify-center shadow-inner">
                  <Sparkles className="w-6 h-6 text-[#F05A22]" />
                </div>
                <h2 className="text-3xl font-black text-[#1A1A1A] tracking-tight">{t.keyConcepts}</h2>
              </div>

              <div className="space-y-10">
                {keyConcepts?.map((concept: any, i: number) => (
                  <motion.div 
                    key={i} 
                    initial={{ opacity: 0, x: -10 }} 
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + i * 0.1 }}
                    className={cn("flex gap-6", isRTL && "flex-row-reverse")}
                  >
                    <div className="mt-3 w-2 h-2 rounded-full bg-[#F05A22] shrink-0 shadow-lg shadow-[#F05A22]/40" />
                    <div>
                      <h3 className="text-lg font-bold text-[#1A1A1A] mb-3">{concept.title}</h3>
                      <div className="text-[#555] leading-relaxed text-[15px] font-medium opacity-90">
                        <TextWithMath text={concept.description} />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Bottom Insight Duo */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              {/* Value Summary Card (Orange Gradient) */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-[#F05A22] bg-gradient-to-br from-[#F05A22] to-[#FF7043] rounded-[50px] p-10 text-white flex flex-col shadow-2xl shadow-[#F05A22]/20"
              >
                <h2 className={cn("text-3xl font-black mb-8 leading-tight", isRTL ? "text-right" : "text-left")}>Takeaway<br/>Summary</h2>
                <p className="text-white/95 text-[15px] leading-relaxed mb-8 font-medium tracking-tight">
                  <TextWithMath text={takeawaySummary} />
                </p>
                
                <div className="mt-10 space-y-4">
                  {takeawayPoints?.map((point: string, i: number) => (
                    <div key={i} className={cn("flex items-start gap-4", isRTL && "flex-row-reverse")}>
                      <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center border border-white/20 shrink-0 mt-0.5">
                         <div className="w-1.5 h-1.5 rounded-full bg-white" />
                      </div>
                      <div className="text-xs font-medium text-white/90 tracking-[0.01em] leading-relaxed">
                        <TextWithMath text={point} />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Visualization Card */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="rounded-[50px] overflow-hidden shadow-2xl relative group h-fit flex items-start self-start"
              >
                <img 
                  src="https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&q=80" 
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                  alt="Conceptual AI Visual"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
              </motion.div>
            </div>
          </div>

          {/* Sidebar Area (4/12) */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* Glossary / Definitions Card */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-[50px] p-10 shadow-[0_20px_60px_rgba(0,0,0,0.03)] border border-[#F0F0F0]"
            >
              <div className={cn("flex items-center gap-4 mb-12", isRTL && "flex-row-reverse")}>
                <div className="w-10 h-10 rounded-xl bg-[#F8F9FA] flex items-center justify-center shadow-sm">
                   <span className="material-symbols-outlined text-[#F05A22] text-2xl">menu_book</span>
                </div>
                <h2 className="text-2xl font-black text-[#1A1A1A]">{t.definitions}</h2>
              </div>

              <div className="space-y-12">
                {definitions?.map((def: any, i: number) => (
                  <div key={i} className="relative">
                    <p className={cn("text-[11px] font-black uppercase tracking-[0.25em] text-[#F05A22] mb-3", isRTL && "text-right")}>
                      {def.term}
                    </p>
                    <p className={cn("text-[#666] text-sm leading-relaxed font-semibold opacity-80", isRTL && "text-right")}>
                      {def.definition}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>

          </div>

        </div>

        {/* Global Footer Citation */}
        <div className="mt-24 pt-10 border-t border-[#F0F0F0] text-center">
          <p className="text-[10px] font-black text-[#A0A0A0] uppercase tracking-[0.4em] opacity-60">
            Curated by Lecture Mate Intelligence • Last updated {new Date().toLocaleDateString(isRTL ? 'ar-EG' : 'en-US')}
          </p>
        </div>
      </div>
    </div>
  );
}
