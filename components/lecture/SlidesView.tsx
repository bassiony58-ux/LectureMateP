import { Slide } from "@/lib/mockData";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Download, Presentation, Edit2, Save, X, Check, Sparkles, Palette, ChevronDown, ChevronUp, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState, useEffect, useMemo } from "react";
import { downloadSlidesPptx, SlideTheme, generateSlides } from "@/lib/aiService";
import { useLectures } from "@/hooks/useLectures";
import { useAuth } from "@/contexts/AuthContext";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { TextWithMath } from "./MathRenderer";
import { motion, AnimatePresence } from "framer-motion";

interface SlidesViewProps {
  slides: Slide[];
  title?: string;
  transcript?: string;
  summary?: string | string[];
  lectureId?: string;
}

export function SlidesView({ slides, title, transcript, summary, lectureId }: SlidesViewProps) {
  const { toast } = useToast();
  const { language } = useLanguage();
  const { user } = useAuth();
  const { updateLecture } = useLectures();

  const detectContentLanguage = useMemo(() => {
    if (!slides || slides.length === 0) return language;
    const allText = slides
      .map(slide => `${slide.title} ${Array.isArray(slide.content) ? slide.content.join(" ") : ""}`)
      .join(" ");
    const hasArabic = /[\u0600-\u06FF]/.test(allText);
    return hasArabic ? "ar" : language;
  }, [slides, language]);

  const contentDir = detectContentLanguage === "ar" ? "rtl" : "ltr";
  const contentTextAlign = detectContentLanguage === "ar" ? "right" : "left";
  const uiDir = language === "ar" ? "rtl" : "ltr";

  const [theme, setTheme] = useState<SlideTheme>("clean");
  const [customColor, setCustomColor] = useState<string>("#F05A22");
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [editingSlideId, setEditingSlideId] = useState<number | null>(null);
  const [editedSlides, setEditedSlides] = useState<Slide[]>(slides);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setEditedSlides(slides);
  }, [slides]);

  const defaultTitle = language === "ar" ? "شرائح المحاضرة" : "Lecture Slides";
  const displayTitle = title || defaultTitle;

  const t = {
    generatedSlides: language === "ar" ? "الشرائح المُنشأة" : "Generated Slides",
    downloadPPTX: language === "ar" ? "تحميل PowerPoint (.pptx)" : "Download PowerPoint (.pptx)",
    noSlides: language === "ar" ? "لا توجد شرائح متاحة" : "No slides available",
    slide: language === "ar" ? "شريحة" : "Slide",
    selectThemeLabel: language === "ar" ? "اختر نمط العرض الفاخر" : "Select Premium Style",
    saved: language === "ar" ? "تم الحفظ" : "Saved",
    savedDesc: language === "ar" ? "تم حفظ التغييرات بنجاح." : "Changes saved successfully.",
  };

  const themeConfig: Record<string, any> = {
    clean: { label: language === "ar" ? "نقي ومينيمال" : "Minimal", defaultColor: "#F05A22", font: "Inter, sans-serif", colors: { bg: "bg-white", title: "text-slate-900", text: "text-slate-600" } },
    dark: { label: language === "ar" ? "داكن فخم" : "Midnight", defaultColor: "#F05A22", font: "Inter, sans-serif", colors: { bg: "bg-[#09090b]", title: "text-white", text: "text-slate-300" } },
    academic: { label: language === "ar" ? "أكاديمي كلاسيك" : "Classic Ivory", defaultColor: "#1A1A1A", font: "Georgia, serif", colors: { bg: "bg-[#FDFBF7]", title: "text-stone-900", text: "text-stone-700" } },
    modern: { label: language === "ar" ? "عصري متدرج" : "Vibrant Flow", defaultColor: "#FFFFFF", font: "Outfit, sans-serif", colors: { bg: "bg-gradient-to-br from-indigo-50/40 via-white to-orange-50/40", title: "text-slate-800", text: "text-slate-600" } },
    tech: { label: language === "ar" ? "تقني سايبر" : "Cyber Matrix", defaultColor: "#00E5FF", font: "JetBrains Mono, monospace", colors: { bg: "bg-[#0A0A0F]", title: "text-cyan-400", text: "text-cyan-100/70" } },
    corporate: { label: language === "ar" ? "احترافي تنفيذي" : "Executive Blue", defaultColor: "#2563EB", font: "Arial, sans-serif", colors: { bg: "bg-[#F8FAFC]", title: "text-slate-900", text: "text-slate-700" } },
    creative: { label: language === "ar" ? "إبداعي نيون" : "Neon Pop", defaultColor: "#D946EF", font: "Outfit, sans-serif", colors: { bg: "bg-[#FAFAF9]", title: "text-rose-950", text: "text-rose-900" } },
    eco: { label: language === "ar" ? "طبيعي أخضر" : "Eco Green", defaultColor: "#16A34A", font: "Inter, sans-serif", colors: { bg: "bg-[#F0FDF4]", title: "text-green-950", text: "text-green-900" } },
    midnight_aurora: { label: language === "ar" ? "الشفق الليلي" : "Midnight Aurora", defaultColor: "#818cf8", font: "Inter, sans-serif", colors: { bg: "bg-[#0f172a]", title: "text-white", text: "text-slate-300" } },
    ember_glow: { label: language === "ar" ? "توهج الجمر" : "Ember Glow", defaultColor: "#f97316", font: "Inter, sans-serif", colors: { bg: "bg-[#1c1917]", title: "text-white", text: "text-slate-300" } },
    sunset_glow: { label: language === "ar" ? "تدرج الغروب" : "Sunset Glow", defaultColor: "#fbbf24", font: "Manrope, sans-serif", colors: { bg: "bg-[#450a0a]", title: "text-amber-50", text: "text-[#fbbf24]" } },
    glassmorphism: { label: language === "ar" ? "زجاجي متبلل" : "Glass UI", defaultColor: "#ffffff", font: "Outfit, sans-serif", colors: { bg: "bg-slate-950", title: "text-white", text: "text-white/70" } },
  };

  const handleEditSlide = (slideId: number) => setEditingSlideId(slideId);
  const handleCancelEdit = () => { setEditingSlideId(null); setEditedSlides(slides); };
  
  const handleSaveSlide = async (slideId: number) => {
    if (!user?.uid || !lectureId) return;
    setIsSaving(true);
    try {
      await updateLecture({ lectureId, updates: { slides: editedSlides } });
      setEditingSlideId(null);
      toast({ title: t.saved, description: t.savedDesc });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally { setIsSaving(false); }
  };

  const handleUpdateSlideTitle = (slideId: number, newTitle: string) => {
    setEditedSlides(prev => prev.map(s => s.id === slideId ? { ...s, title: newTitle } : s));
  };

  const handleUpdateSlideContent = (slideId: number, newContent: string[]) => {
    setEditedSlides(prev => prev.map(s => s.id === slideId ? { ...s, content: newContent } : s));
  };

  const handleDownloadPPTX = async () => {
    if (editedSlides.length === 0) return;
    setIsDownloading(true);
    try {
      await downloadSlidesPptx(editedSlides, theme as SlideTheme, displayTitle, customColor);
      toast({ title: language === "ar" ? "تم التحميل" : "Downloaded", description: language === "ar" ? "تم تحميل ملف PowerPoint." : "PowerPoint file downloaded." });
    } catch (error: any) {
      toast({ title: "Error", description: error?.message, variant: "destructive" });
    } finally { setIsDownloading(false); }
  };

  return (
    <div className="space-y-8" dir={uiDir}>
      {/* Header Section */}
      <div className={cn("flex flex-col md:flex-row justify-between items-start md:items-center gap-6", uiDir === "rtl" && "md:flex-row-reverse")}>
        <div>
          <h3 className="text-3xl font-black flex items-center gap-3 tracking-tight">
            <div className="p-2 rounded-xl bg-primary/10">
              <Presentation className="w-8 h-8 text-primary" />
            </div>
            {t.generatedSlides}
          </h3>
          <p className="text-muted-foreground font-medium mt-1 ml-14">{displayTitle}</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={handleDownloadPPTX} disabled={isDownloading || editedSlides.length === 0} size="lg" className="rounded-2xl shadow-xl shadow-primary/20 transition-all active:scale-95 px-8 h-14 font-black">
            <Download className={cn("w-5 h-5", uiDir === 'rtl' ? "ml-3" : "mr-3")} />
            {isDownloading ? "..." : t.downloadPPTX}
          </Button>
        </div>
      </div>

      {/* Premium Theme Selector */}
      <Collapsible open={isThemeOpen} onOpenChange={setIsThemeOpen} className="border-2 rounded-[2rem] bg-card shadow-xl overflow-hidden border-border/40 transition-all duration-500">
        <CollapsibleTrigger className="w-full flex items-center justify-between p-7 hover:bg-muted/30 transition-colors">
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white shadow-lg shadow-primary/20">
              <Palette className="w-6 h-6" />
            </div>
            <div className="text-left">
              <p className="font-black text-lg">{t.selectThemeLabel}</p>
              <p className="text-sm text-muted-foreground font-medium">{language === "ar" ? "اختر من بين 12 نمطاً احترافياً" : "Choose from 12 professional layout styles"}</p>
            </div>
          </div>
          <div className="p-2 rounded-full bg-muted">
            {isThemeOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent className="p-10 border-t-2 border-border/40 bg-muted/5 space-y-10">
           <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
             {Object.entries(themeConfig).map(([key, conf]: [any, any]) => (
               <button key={key} onClick={() => setTheme(key)} className={cn("relative p-5 rounded-2xl border-2 transition-all group", theme === key ? "border-primary bg-primary/5 shadow-2xl scale-[1.05]" : "border-border hover:border-primary/40 hover:translate-y-[-4px]")}>
                 <div className={cn("aspect-video rounded-xl p-4 flex flex-col justify-between mb-4 border shadow-inner", conf.colors.bg)}>
                    <div className="w-full h-1.5 rounded-full" style={{ backgroundColor: theme === key ? customColor : "#eee" }} />
                    <div className="space-y-1.5">
                      <div className="w-3/4 h-1 bg-current opacity-20 rounded-full" />
                      <div className="w-1/2 h-1 bg-current opacity-10 rounded-full" />
                    </div>
                 </div>
                 <p className="text-[10px] font-black uppercase tracking-[0.15em] text-center truncate">{conf.label}</p>
                 {theme === key && <div className="absolute -top-2 -right-2 w-7 h-7 bg-primary text-white rounded-full shadow-lg flex items-center justify-center animate-in zoom-in-50"><Check className="w-4 h-4" /></div>}
               </button>
             ))}
           </div>
           <div className="flex items-center gap-8 p-6 bg-muted/40 rounded-3xl border-2 border-dashed border-border/60">
             <div className="p-4 rounded-2xl bg-white shadow-sm">
                <Palette className="w-8 h-8 text-primary" />
             </div>
             <div className="flex-1">
                <p className="text-lg font-black">{language === "ar" ? "تخصيص اللون" : "Brand Identity Color"}</p>
                <p className="text-sm text-muted-foreground font-medium">{language === "ar" ? "سيتم تطبيق هذا اللون على كافة العناصر التزيينية" : "Custom accent color for academic highlights"}</p>
             </div>
             <input type="color" value={customColor} onChange={e => setCustomColor(e.target.value)} className="w-24 h-16 rounded-2xl border-4 border-white cursor-pointer bg-transparent shadow-xl" />
           </div>
        </CollapsibleContent>
      </Collapsible>

      {/* High-End Slide Canvas Grid */}
      <div className="grid grid-cols-1 gap-16">
        {editedSlides.map((slide) => {
          const isEditing = editingSlideId === slide.id;
          const conf = themeConfig[theme] || themeConfig['clean'];
          return (
            <motion.div key={slide.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <Card className="overflow-hidden flex flex-col shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] border-none group max-w-6xl mx-auto w-full rounded-[2.5rem] ring-1 ring-border/10">
                <div className={cn("aspect-[16/9] relative flex flex-col overflow-hidden transition-all duration-700", conf.colors.bg)} style={{ fontFamily: conf.font }}>
                  
                  {/* Premium Theme Visual Decorations */}
                  <div className="absolute top-0 left-0 right-0 h-1.5 transition-all duration-700 z-20" style={{ backgroundColor: customColor }} />
                  
                  <div className="absolute inset-0 flex flex-col justify-start items-stretch p-0 m-0 overflow-hidden">
                    {/* Header - Title Section (Docked to Top) */}
                    <div className="shrink-0 w-full" style={{ padding: '20px 60px 0 60px', margin: 0 }}>
                      {isEditing ? (
                        <Input value={slide.title} onChange={e => handleUpdateSlideTitle(slide.id, e.target.value)} className="text-3xl font-black bg-white/5 border-2 rounded-2xl h-12 px-6 w-full" />
                      ) : (
                        <motion.h4 
                          initial={{ opacity: 0, y: -5 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          className={cn("text-3xl md:text-5xl font-black leading-none tracking-tight m-0 p-0", conf.colors.title)} 
                          dir={contentDir} 
                          style={{ 
                            textAlign: contentTextAlign, 
                            color: theme.includes('dark') || theme.includes('midnight') || theme.includes('ember') ? customColor : undefined,
                            textShadow: theme === 'tech' ? `0 0 30px ${customColor}40` : undefined,
                            marginTop: 0,
                            paddingTop: 0
                          }}
                        >
                          <TextWithMath text={slide.title} />
                        </motion.h4>
                      )}
                    </div>

                    {/* Body - Content Section (Dynamic Vertical Distribution) */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar relative px-10 md:px-14 flex flex-col justify-center" style={{ marginTop: '10px', paddingTop: 0 }}>
                      {isEditing ? (
                        <Textarea value={slide.content.join("\n")} onChange={e => handleUpdateSlideContent(slide.id, e.target.value.split("\n"))} className="w-full h-full resize-none bg-white/5 border-2 rounded-2xl font-medium text-xl p-6 leading-relaxed" />
                      ) : (
                        <ul 
                          className={cn("font-medium m-0 p-0", conf.colors.text)} 
                          dir={contentDir} 
                          style={{ 
                            marginTop: 0, 
                            paddingTop: 0,
                            paddingBottom: '20px'
                          }}
                        >
                          {slide.content.map((item, i) => {
                            const totalChars = slide.content.join("").length;
                            const numBullets = slide.content.length;
                            
                            // EXTREMELY SPARSE (up to 4 items)
                            const isSparse = numBullets <= 4 && totalChars < 250;
                            // MEDIUM (up to 8 items)
                            const isMedium = numBullets <= 8 && totalChars < 600;

                            const fontSize = isSparse ? 'text-3xl md:text-5xl' : isMedium ? 'text-2xl md:text-3xl' : 'text-lg md:text-2xl';
                            const gapSize = isSparse ? 'gap-10' : isMedium ? 'gap-8' : 'gap-4';
                            const bulletSize = isSparse ? 'w-5 h-5' : isMedium ? 'w-3.5 h-3.5' : 'w-2.5 h-2.5';
                            const leading = isSparse ? 'leading-[1.4]' : isMedium ? 'leading-[1.4]' : 'leading-[1.3]';
                            const dotMargin = isSparse ? 'mt-4' : isMedium ? 'mt-3' : 'mt-2.5';
                            const itemPadding = isSparse ? 'pt-12' : isMedium ? 'pt-8' : 'pt-3';

                            return (
                              <motion.li 
                                key={i} 
                                initial={{ opacity: 0, x: contentDir === 'rtl' ? 10 : -10 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.02 }}
                                className={cn("flex items-start", gapSize)} 
                                style={{ textAlign: contentTextAlign, marginTop: 0, paddingTop: itemPadding }}
                              >
                                <div className={cn("rounded-full shrink-0 shadow-sm", bulletSize, dotMargin)} style={{ backgroundColor: customColor }} />
                                <div className="flex-1 min-w-0">
                                  <TextWithMath text={item} className={cn(fontSize, leading)} />
                                </div>
                              </motion.li>
                            );
                          })}
                        </ul>
                      )}
                    </div>

                    {/* Footer - Branding Section (Pinned to bottom with solid mask) */}
                    <div className={cn("shrink-0 pt-4 pb-6 px-10 md:px-14 z-30 border-t border-white/10", conf.colors.bg)}>
                      <div className="flex justify-between items-center text-[10px] md:text-[11px] font-black uppercase tracking-[0.3em] opacity-40 transition-all group-hover:opacity-100 mix-blend-difference text-white">
                        <span className="flex items-center gap-2 font-bold"><Sparkles className="w-3.5 h-3.5 text-primary" /> LECTUREMATE AI</span>
                        <span className="opacity-60">SLIDE {slide.id} — {theme.toUpperCase()}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Editor Toolbar */}
                <CardContent className="p-6 bg-muted/40 border-t-2 border-border/40 flex justify-between items-center px-10">
                  <div className="flex items-center gap-4">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: customColor }} />
                    <span className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Draft Instance #{slide.id}</span>
                  </div>
                  <div className="flex gap-3">
                    {isEditing ? (
                      <>
                        <Button size="lg" variant="default" onClick={() => handleSaveSlide(slide.id)} disabled={isSaving} className="rounded-2xl shadow-xl px-6 font-black h-12 gap-3"><Save className="w-4 h-4" /> SAVE</Button>
                        <Button size="lg" variant="ghost" onClick={handleCancelEdit} className="rounded-2xl h-12 font-black">CANCEL</Button>
                      </>
                    ) : (
                      <Button size="lg" variant="outline" onClick={() => handleEditSlide(slide.id)} className="rounded-2xl border-2 hover:bg-primary hover:text-white hover:border-primary opacity-0 group-hover:opacity-100 transition-all h-12 font-black gap-3"><Edit2 className="w-4 h-4" /> EDIT SLIDE</Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
