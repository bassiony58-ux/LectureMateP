import { useState } from "react";
import { Slide } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { downloadSlidesPptx } from "@/lib/aiService";
import { Sparkles, CheckCircle2, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface NanoBananaViewProps {
  slides: Slide[];
  title?: string;
}

interface NanoTheme {
  id: string;
  name: string;
  nameAr: string;
  baseTheme: "clean" | "dark" | "academic" | "modern" | "tech" | "corporate" | "creative" | "eco";
  // Slide-thumbnail colors
  bg: string;        // slide background
  panel: string;     // right panel / accent area
  titleBar: string;  // title text color or title bar
  accent: string;    // bullet / line color
  // PPT generation config
  pptColor: string;
  visualStyle: string;
  layoutStyle: string;
}

// A mini slide preview rendered entirely in CSS — no images needed
function SlideThumbPreview({ theme, selected }: { theme: NanoTheme; selected: boolean }) {
  return (
    <div
      className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden transition-all duration-300"
      style={{ backgroundColor: theme.bg, border: `2px solid ${selected ? theme.accent : "transparent"}` }}
    >
      {/* Right accent panel (mimics split layout) */}
      <div
        className="absolute right-0 top-0 bottom-0 w-[38%]"
        style={{ backgroundColor: theme.panel }}
      />

      {/* Title bar */}
      <div
        className="absolute left-[8%] top-[18%] h-[12%] rounded-sm"
        style={{ width: "52%", backgroundColor: theme.titleBar, opacity: 0.9 }}
      />

      {/* Accent underline */}
      <div
        className="absolute left-[8%]"
        style={{ top: "32%", width: "20%", height: "3px", backgroundColor: theme.accent, borderRadius: 2 }}
      />

      {/* Body lines */}
      {[42, 52, 62, 72].map((top, i) => (
        <div
          key={i}
          className="absolute left-[8%] h-[5%] rounded-sm"
          style={{
            top: `${top}%`,
            width: `${i % 2 === 0 ? 46 : 38}%`,
            backgroundColor: theme.titleBar,
            opacity: 0.35
          }}
        />
      ))}

      {/* Selected check */}
      {selected && (
        <div
          className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center shadow-lg"
          style={{ backgroundColor: theme.accent }}
        >
          <CheckCircle2 className="w-3 h-3 text-white" />
        </div>
      )}
    </div>
  );
}

export function NanoBananaView({ slides, title }: NanoBananaViewProps) {
  const { toast } = useToast();
  const { language } = useLanguage();
  const uiDir = language === "ar" ? "rtl" : "ltr";

  const [selectedThemeId, setSelectedThemeId] = useState<string>("minimal");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);

  const themes: NanoTheme[] = [
    {
      id: "minimal",
      name: "Minimal",
      nameAr: "بسيط",
      baseTheme: "clean",
      bg: "#F8FAFC", panel: "#E2E8F0", titleBar: "#0F172A", accent: "#F05A22",
      pptColor: "#F05A22", visualStyle: "minimalist", layoutStyle: "side_by_side"
    },
    {
      id: "midnight",
      name: "Midnight",
      nameAr: "منتصف الليل",
      baseTheme: "dark",
      bg: "#09090B", panel: "#1C1C1F", titleBar: "#FFFFFF", accent: "#8B5CF6",
      pptColor: "#8B5CF6", visualStyle: "photographic", layoutStyle: "side_by_side"
    },
    {
      id: "classic_ivory",
      name: "Classic Ivory",
      nameAr: "عاجي كلاسيكي",
      baseTheme: "academic",
      bg: "#FFFBF0", panel: "#F3E8C8", titleBar: "#1E1B16", accent: "#B49454",
      pptColor: "#B49454", visualStyle: "photographic", layoutStyle: "side_by_side"
    },
    {
      id: "vibrant_flow",
      name: "Vibrant Flow",
      nameAr: "تدفق حيوي",
      baseTheme: "modern",
      bg: "#F0FDF4", panel: "#D1FAE5", titleBar: "#064E3B", accent: "#10B981",
      pptColor: "#10B981", visualStyle: "photographic", layoutStyle: "side_by_side"
    },
    {
      id: "cyber_matrix",
      name: "Cyber Matrix",
      nameAr: "مصفوفة السايبر",
      baseTheme: "tech",
      bg: "#020617", panel: "#0F172A", titleBar: "#00F3FF", accent: "#00F3FF",
      pptColor: "#00F3FF", visualStyle: "cyberpunk", layoutStyle: "side_by_side"
    },
    {
      id: "executive_blue",
      name: "Executive Blue",
      nameAr: "الأزرق التنفيذي",
      baseTheme: "corporate",
      bg: "#EFF6FF", panel: "#BFDBFE", titleBar: "#1E3A5F", accent: "#2563EB",
      pptColor: "#2563EB", visualStyle: "minimalist", layoutStyle: "side_by_side"
    },
    {
      id: "neon_pop",
      name: "Neon Pop",
      nameAr: "نيون بوب",
      baseTheme: "creative",
      bg: "#1A0533", panel: "#2D1B69", titleBar: "#FACC15", accent: "#A855F7",
      pptColor: "#A855F7", visualStyle: "cyberpunk", layoutStyle: "side_by_side"
    },
    {
      id: "eco_green",
      name: "Eco Green",
      nameAr: "أخضر بيئي",
      baseTheme: "eco",
      bg: "#F0FFF4", panel: "#DCFCE7", titleBar: "#14532D", accent: "#16A34A",
      pptColor: "#16A34A", visualStyle: "flat_illustration", layoutStyle: "side_by_side"
    },
    {
      id: "midnight_aurora",
      name: "Midnight Aurora",
      nameAr: "أورورا الليل",
      baseTheme: "dark",
      bg: "#0C0A1E", panel: "#1E1B4B", titleBar: "#E0E7FF", accent: "#6366F1",
      pptColor: "#6366F1", visualStyle: "3d_render", layoutStyle: "side_by_side"
    },
    {
      id: "ember_glow",
      name: "Ember Glow",
      nameAr: "توهج الجمر",
      baseTheme: "dark",
      bg: "#18181B", panel: "#27272A", titleBar: "#FFF7ED", accent: "#F97316",
      pptColor: "#F97316", visualStyle: "photographic", layoutStyle: "side_by_side"
    },
    {
      id: "sunset_glow",
      name: "Sunset Glow",
      nameAr: "توهج الغروب",
      baseTheme: "creative",
      bg: "#450A0A", panel: "#7F1D1D", titleBar: "#FEF2F2", accent: "#FCA5A5",
      pptColor: "#FCA5A5", visualStyle: "photographic", layoutStyle: "side_by_side"
    },
    {
      id: "glass_ui",
      name: "Glass UI",
      nameAr: "واجهة زجاجية",
      baseTheme: "modern",
      bg: "#0F172A", panel: "#1E293B", titleBar: "#E2E8F0", accent: "#38BDF8",
      pptColor: "#38BDF8", visualStyle: "minimalist", layoutStyle: "side_by_side"
    },
    {
      id: "warm_autumn",
      name: "Warm Autumn",
      nameAr: "خريف دافئ",
      baseTheme: "creative",
      bg: "#FFF7ED", panel: "#FED7AA", titleBar: "#7C2D12", accent: "#EA580C",
      pptColor: "#EA580C", visualStyle: "flat_illustration", layoutStyle: "side_by_side"
    },
    {
      id: "ocean_depths",
      name: "Ocean Depths",
      nameAr: "أعماق المحيط",
      baseTheme: "modern",
      bg: "#ECFEFF", panel: "#A5F3FC", titleBar: "#164E63", accent: "#0891B2",
      pptColor: "#0891B2", visualStyle: "3d_render", layoutStyle: "side_by_side"
    },
    {
      id: "rose_gold",
      name: "Rose Gold",
      nameAr: "ذهبي وردي",
      baseTheme: "academic",
      bg: "#FFF1F2", panel: "#FECDD3", titleBar: "#881337", accent: "#E11D48",
      pptColor: "#E11D48", visualStyle: "flat_illustration", layoutStyle: "side_by_side"
    },
    {
      id: "lavender_fields",
      name: "Lavender Fields",
      nameAr: "حقول الخزامى",
      baseTheme: "creative",
      bg: "#FAF5FF", panel: "#E9D5FF", titleBar: "#581C87", accent: "#9333EA",
      pptColor: "#9333EA", visualStyle: "flat_illustration", layoutStyle: "side_by_side"
    },
    {
      id: "golden_hour",
      name: "Golden Hour",
      nameAr: "الساعة الذهبية",
      baseTheme: "academic",
      bg: "#FFFBEB", panel: "#FDE68A", titleBar: "#713F12", accent: "#D97706",
      pptColor: "#D97706", visualStyle: "photographic", layoutStyle: "side_by_side"
    },
    {
      id: "forest_canopy",
      name: "Forest Canopy",
      nameAr: "مظلة الغابة",
      baseTheme: "eco",
      bg: "#F0FDF4", panel: "#BBF7D0", titleBar: "#14532D", accent: "#15803D",
      pptColor: "#15803D", visualStyle: "flat_illustration", layoutStyle: "side_by_side"
    },
    {
      id: "coral_reef",
      name: "Coral Reef",
      nameAr: "الشعاب المرجانية",
      baseTheme: "modern",
      bg: "#FFF5F5", panel: "#FECACA", titleBar: "#7F1D1D", accent: "#DC2626",
      pptColor: "#DC2626", visualStyle: "3d_render", layoutStyle: "side_by_side"
    },
    {
      id: "cosmic_night",
      name: "Cosmic Night",
      nameAr: "ليل كوني",
      baseTheme: "tech",
      bg: "#0F172A", panel: "#312E81", titleBar: "#C7D2FE", accent: "#818CF8",
      pptColor: "#818CF8", visualStyle: "3d_render", layoutStyle: "full_background"
    },
    {
      id: "sakura_blossom",
      name: "Sakura Blossom",
      nameAr: "تفتح الساكورا",
      baseTheme: "creative",
      bg: "#FDF2F8", panel: "#FBCFE8", titleBar: "#831843", accent: "#DB2777",
      pptColor: "#DB2777", visualStyle: "flat_illustration", layoutStyle: "side_by_side"
    },
    {
      id: "arctic_ice",
      name: "Arctic Ice",
      nameAr: "جليد القطب",
      baseTheme: "modern",
      bg: "#F0F9FF", panel: "#BAE6FD", titleBar: "#0C4A6E", accent: "#0284C7",
      pptColor: "#0284C7", visualStyle: "3d_render", layoutStyle: "side_by_side"
    },
    {
      id: "molten_lava",
      name: "Molten Lava",
      nameAr: "حمم بركانية",
      baseTheme: "creative",
      bg: "#1A1A1A", panel: "#3D3D3D", titleBar: "#FDBA74", accent: "#EA580C",
      pptColor: "#EA580C", visualStyle: "cyberpunk", layoutStyle: "full_background"
    },
    {
      id: "pastel_dreams",
      name: "Pastel Dreams",
      nameAr: "أحلام باستيل",
      baseTheme: "creative",
      bg: "#F8FAFC", panel: "#F1F5F9", titleBar: "#475569", accent: "#94A3B8",
      pptColor: "#64748B", visualStyle: "flat_illustration", layoutStyle: "side_by_side"
    },
    {
      id: "retro_vibes",
      name: "Retro Vibes",
      nameAr: "أجواء ريترو",
      baseTheme: "creative",
      bg: "#2D1B69", panel: "#4C1D95", titleBar: "#FDE047", accent: "#FACC15",
      pptColor: "#FACC15", visualStyle: "flat_illustration", layoutStyle: "side_by_side"
    },
    {
      id: "mint_fresh",
      name: "Mint Fresh",
      nameAr: "نعناع منعش",
      baseTheme: "modern",
      bg: "#ECFDF5", panel: "#A7F3D0", titleBar: "#064E3B", accent: "#059669",
      pptColor: "#059669", visualStyle: "flat_illustration", layoutStyle: "side_by_side"
    },
  ];

  const currentTheme = themes.find(t => t.id === selectedThemeId) || themes[0];

  const handleGenerate = async () => {
    if (!slides || slides.length === 0) {
      toast({ title: language === "ar" ? "لا توجد بيانات" : "No Data", variant: "destructive" });
      return;
    }

    setIsGenerating(true);
    setGenerationStep(1);

    try {
      await new Promise(r => setTimeout(r, 900));
      setGenerationStep(2);
      await new Promise(r => setTimeout(r, 1100));
      setGenerationStep(3);

      await downloadSlidesPptx(
        slides,
        currentTheme.baseTheme,
        title || "Nano Banana Presentation",
        currentTheme.pptColor,
        {
          nanobanana: true,
          visualStyle: currentTheme.visualStyle,
          layoutStyle: currentTheme.layoutStyle,
          nbBgColor: currentTheme.bg,
          nbPanelColor: currentTheme.panel,
          nbTitleColor: currentTheme.titleBar,
        }
      );

      setGenerationStep(4);
      await new Promise(r => setTimeout(r, 400));

      toast({ title: language === "ar" ? "تم التوليد" : "Success", description: "Your professional deck is ready." });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setIsGenerating(false);
      setGenerationStep(0);
    }
  };

  const steps = [
    { num: 1, text: language === "ar" ? "تحليل طابع الثيم..." : "Analyzing theme..." },
    { num: 2, text: language === "ar" ? "جلب الصور من Pexels..." : "Sourcing images..." },
    { num: 3, text: language === "ar" ? "تطبيق التصميم النهائي..." : "Applying design..." },
    { num: 4, text: language === "ar" ? "تصدير الملف..." : "Exporting..." }
  ];

  return (
    <div className="w-full max-w-5xl mx-auto space-y-10 py-10 px-4" dir={uiDir}>

      {/* Header */}
      <div className={cn("space-y-3", uiDir === "rtl" ? "text-right" : "text-left")}>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-600 border border-amber-100 text-[10px] font-black uppercase tracking-[0.2em]">
          <Sparkles className="w-3 h-3" />
          Premium Themes
        </div>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">
          {language === "ar" ? "اختر مظهرك المفضل" : "Choose Your Look"}
        </h2>
        <p className="text-slate-500 text-sm font-medium max-w-lg">
          {language === "ar"
            ? "اختر ثيماً جاهزاً وسيقوم Nano Banana بتوليد عرضك مع صور ذكية."
            : "Pick a ready-made theme and Nano Banana will generate your deck with smart images."}
        </p>
      </div>

      {/* Theme Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
        {themes.map(theme => {
          const isSelected = selectedThemeId === theme.id;
          return (
            <button
              key={theme.id}
              onClick={() => setSelectedThemeId(theme.id)}
              className={cn(
                "group flex flex-col items-center gap-3 p-3 rounded-2xl border-2 transition-all duration-200 outline-none",
                isSelected
                  ? "border-slate-900 bg-slate-50 shadow-md scale-[1.04]"
                  : "border-slate-100 bg-white hover:border-slate-300 hover:shadow-sm"
              )}
            >
              <SlideThumbPreview theme={theme} selected={isSelected} />
              <span className={cn(
                "text-[10px] font-black uppercase tracking-widest transition-colors",
                isSelected ? "text-slate-900" : "text-slate-400"
              )}>
                {language === "ar" ? theme.nameAr : theme.name}
              </span>
            </button>
          );
        })}
      </div>

      {/* Generate Button */}
      <div className="flex justify-center pt-4">
        <AnimatePresence mode="wait">
          {isGenerating ? (
            <motion.div
              key="gen"
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10 }}
              className="bg-slate-900 text-white rounded-[2rem] px-8 py-4 shadow-2xl flex items-center gap-6 min-w-[320px]"
            >
              <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-amber-400 animate-spin flex-shrink-0" />
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">
                  {language === "ar" ? "جاري العمل" : "Processing"}
                </span>
                <span className="text-sm font-bold">{steps[generationStep > 0 ? generationStep - 1 : 0].text}</span>
              </div>
              <div className="flex gap-1.5 ml-auto">
                {[1,2,3,4].map(s => (
                  <div
                    key={s}
                    className={cn(
                      "h-1.5 rounded-full transition-all duration-500",
                      generationStep >= s ? "bg-amber-400 w-5" : "bg-white/15 w-1.5"
                    )}
                  />
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div key="btn" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Button
                onClick={handleGenerate}
                className="h-16 px-10 rounded-[2rem] bg-slate-900 hover:bg-slate-800 text-white font-black text-lg shadow-2xl shadow-slate-900/30 border-b-4 border-slate-700 active:border-b-0 active:translate-y-0.5 transition-all flex items-center gap-3"
              >
                {language === "ar" ? "توليد باستخدام" : "Generate with"}
                <span style={{ color: currentTheme.accent }}>
                  {language === "ar" ? currentTheme.nameAr : currentTheme.name}
                </span>
                <ChevronRight className={cn("w-5 h-5", language === "ar" && "rotate-180")} />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
