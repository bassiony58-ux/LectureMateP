import { useState, useEffect, useMemo } from "react";
import { Question } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight, Bot, X, Timer, Sparkles, Clock, Search, BookText, PlayCircle, Globe } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { AgentChatView } from "./AgentChatView";
import { TextWithMath } from "./MathRenderer";

import { generateQuiz, evaluateEssayAnswer, type EssayEvaluation } from "@/lib/aiService";
import { useLectures } from "@/hooks/useLectures";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

interface QuizViewProps {
  questions?: Question[];
  title?: string;
  lectureId?: string;
  transcript?: string;
  modelType?: "gpu" | "api";
}

export function QuizView({ questions: initialQuestions, lectureId, transcript, modelType = "api" }: QuizViewProps) {
  const { updateLecture } = useLectures();
  const { language } = useLanguage();
  const { toast } = useToast();
  const isRTL = language === "ar";

  const [isGenerating, setIsGenerating] = useState(false);
  const [questions, setQuestions] = useState<Question[]>(initialQuestions || []);
  const [quizMode, setQuizMode] = useState<"menu" | "quiz" | "review">("menu");
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [quizComplete, setQuizComplete] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState(40); // 40 seconds total
  const [showHint, setShowHint] = useState(false);
  
  // Essay states
  const [essayAnswer, setEssayAnswer] = useState("");
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<EssayEvaluation | null>(null);

  useEffect(() => {
    if (initialQuestions && initialQuestions.length > 0) {
      setQuestions(initialQuestions);
    }
  }, [initialQuestions]);

  // Timer logic
  useEffect(() => {
    if (quizMode !== "quiz" || isAnswered || quizComplete || currentQuestion?.type === "open_ended") return;

    if (timeLeft <= 0) {
      setIsAnswered(true);
      // If time ran out and they didn't answer, it's wrong by default
      return;
    }

    if (timeLeft === 20) {
      setShowHint(true);
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [quizMode, isAnswered, quizComplete, timeLeft]);

  // Reset timer and hint on question change
  useEffect(() => {
    setTimeLeft(40);
    setShowHint(false);
  }, [currentQuestionIndex]);

  const t = {
    title: language === "ar" ? "اختر مستوى الاختبار" : "Choose Your Quiz Level",
    subtitle: language === "ar" 
      ? "خصص رحلتك التعليمية. اختر مستوى الصعوبة الذي يناسب استيعابك للمادة لإنشاء تقييم مخصص." 
      : "Tailor your learning journey. Select a difficulty level that matches your current grasp of the material to generate a custom-curated assessment.",
    beginner: {
      name: language === "ar" ? "مبتدئ" : "Beginner",
      desc: language === "ar" 
        ? "يركز على المفاهيم التأسيسية والمصطلحات الرئيسية. مثالي للمراجعة الأولى."
        : "Focuses on foundational concepts, key terminology, and primary lecture takeaways. Perfect for a first-pass review.",
      points: language === "ar" ? ["تعريفات أساسية", "اختيار من متعدد"] : ["Core Definitions", "Multiple Choice Focus"]
    },
    intermediate: {
      name: language === "ar" ? "متوسط" : "Intermediate",
      desc: language === "ar"
        ? "يتحدى قدرتك على ربط وحدات المحاضرة المختلفة وتطبيق المفاهيم على مواقف واقعية."
        : "Challenges your ability to connect different lecture modules and apply concepts to practical, real-world scenarios.",
      points: language === "ar" ? ["ربط المفاهيم", "تحليل سيناريوهات", "جلسات موقوتة"] : ["Conceptual Mapping", "Scenario Analysis", "Timed Sessions"]
    },
    advanced: {
      name: language === "ar" ? "متقدم" : "Advanced",
      desc: language === "ar"
        ? "تقييم صارم يتميز بحل المشكلات المعقدة والتركيب النقدي وتقييم الحالات الاستثنائية."
        : "Rigorous assessment featuring complex problem-solving, critical synthesis, and edge-case theory evaluation.",
      points: language === "ar" ? ["تركيب نظري", "تقييم نقدي"] : ["Theoretical Synthesis", "Critical Evaluation"]
    },
    generate: language === "ar" ? "إنشاء الاختبار" : "Generate Quiz",
    adaptiveTitle: language === "ar" ? "محرك التعلم التكيفي" : "Adaptive Learning Engine",
    adaptiveDesc: language === "ar" 
      ? "لست متأكداً أيهما تختار؟ يمكن للذكاء الاصطناعي تحليل ملاحظاتك واقتراح الصعوبة المثلى."
      : "Not sure which to choose? Our AI can analyze your past notes and suggest the optimal difficulty to maximize retention.",
    runDiagnostics: language === "ar" ? "تشغيل التشخيص" : "Run Diagnostics",
    newFeature: language === "ar" ? "ميزة جديدة" : "NEW FEATURE"
  };

  const handleGenerate = async (level: "comprehensive" | "advanced" | "expert") => {
    if (!lectureId || !transcript) return;

    try {
      setIsGenerating(true);
      const newQuestions = await generateQuiz(transcript, modelType, level);

      if (newQuestions && newQuestions.length > 0) {
        setQuestions(newQuestions);
        await updateLecture({
          lectureId,
          updates: { questions: newQuestions as any }
        });
        setQuizMode("quiz");
        setCurrentQuestionIndex(0);
        setIsAnswered(false);
        setScore(0);
        setQuizComplete(false);
      }
    } catch (err) {
      toast({ title: "Generation Failed", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  const currentQuestion = questions[currentQuestionIndex];

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(i => i + 1);
      setSelectedOption(null);
      setIsAnswered(false);
      setTimeLeft(40); // Reset timer on next
      setShowHint(false);
      setEssayAnswer("");
      setEvaluation(null);
    } else {
      setQuizComplete(true);
    }
  };

  const handleOptionSelect = (idx: number) => {
    if (isAnswered || !currentQuestion) return;
    setSelectedOption(idx);
    const isCorrect = idx === currentQuestion.correctIndex;
    if (isCorrect) setScore(s => s + 1);
    setIsAnswered(true);
  };

  const handleEssaySubmit = async () => {
    if (!essayAnswer.trim() || isEvaluating || !currentQuestion) return;
    
    try {
      setIsEvaluating(true);
      const res = await evaluateEssayAnswer(
        currentQuestion.text,
        essayAnswer,
        currentQuestion.correct_answer || "",
        currentQuestion.expected_keywords || [],
        !!currentQuestion.is_numerical
      );
      
      setEvaluation(res);
      setIsAnswered(true);
      if (res.isCorrect) setScore(s => s + 1);
    } catch (error) {
      toast({ title: "Evaluation Failed", variant: "destructive" });
    } finally {
      setIsEvaluating(false);
    }
  };

  if (isGenerating) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] space-y-8 bg-white">
        <div className="relative w-24 h-24">
          <div className="absolute inset-0 rounded-full border-4 border-[#F05A22]/20 animate-ping" />
          <div className="absolute inset-2 rounded-full border-4 border-[#F05A22] border-t-transparent animate-spin" />
        </div>
        <div className="text-center space-y-2">
          <h3 className="text-2xl font-black text-[#1A1A1A] tracking-tight">Curating your Assessment...</h3>
          <p className="text-[#666] font-medium animate-pulse">Analyzing lecture nuances and synthesizing questions</p>
        </div>
      </div>
    );
  }

  if (quizMode === "menu") {
    return (
      <div className={cn("min-h-screen bg-[#FDFDFD] py-20 px-6", isRTL && "rtl text-right")}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <div className="flex justify-center mb-10">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-24 h-24 bg-transparent p-1 flex items-center justify-center overflow-hidden"
              >
                <img src="/logo.png" className="w-full h-full object-contain" alt="Lecture Mate Logo" />
              </motion.div>
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-[#1A1A1A] mb-6 tracking-tight">
              {t.title}
            </h1>
            <p className="text-lg text-[#666] max-w-2xl mx-auto leading-relaxed font-medium">
              {t.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
            {/* Beginner */}
            <motion.div whileHover={{ y: -10 }} className="bg-white rounded-[40px] p-10 shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-[#F0F0F0] flex flex-col items-center text-center relative overflow-hidden">
              <div className="w-16 h-16 rounded-3xl bg-[#FFF5F2] flex items-center justify-center mb-8 shadow-inner text-2xl">😊</div>
              <h3 className="text-2xl font-black text-[#1A1A1A] mb-4">{t.beginner.name}</h3>
              <p className="text-sm text-[#777] leading-relaxed mb-10 min-h-[5rem] font-medium">{t.beginner.desc}</p>
              <div className="space-y-4 mb-12 w-full">
                {t.beginner.points.map((p, i) => (
                  <div key={i} className={cn("flex items-center gap-3 text-[13px] font-bold text-[#444]", isRTL && "flex-row-reverse")}>
                    <CheckCircle className="w-4 h-4 text-[#C64B1D]" />
                    <span>{p}</span>
                  </div>
                ))}
              </div>
              <Button onClick={() => handleGenerate("comprehensive")} className="w-full h-14 rounded-3xl bg-[#C14416] hover:bg-[#A13912] text-white font-black">
                {t.generate}
              </Button>
            </motion.div>

            {/* Intermediate */}
            <motion.div whileHover={{ y: -10 }} className="bg-white rounded-[40px] p-10 shadow-[0_30px_70px_rgba(0,0,0,0.08)] border-2 border-[#F05A22]/10 flex flex-col items-center text-center relative overflow-hidden">
              <div className="absolute top-6 right-10">
                <Badge className="bg-[#FFF1ED] text-[#F05A22] border-none font-black text-[10px] py-1 px-3 uppercase">Popular</Badge>
              </div>
              <div className="w-16 h-16 rounded-3xl bg-[#FFF5F2] flex items-center justify-center mb-8 shadow-inner text-2xl">🧠</div>
              <h3 className="text-2xl font-black text-[#1A1A1A] mb-4">{t.intermediate.name}</h3>
              <p className="text-sm text-[#777] leading-relaxed mb-10 min-h-[5rem] font-medium">{t.intermediate.desc}</p>
              <div className="space-y-4 mb-12 w-full">
                {t.intermediate.points.map((p, i) => (
                  <div key={i} className={cn("flex items-center gap-3 text-[13px] font-bold text-[#444]", isRTL && "flex-row-reverse")}>
                    <CheckCircle className="w-4 h-4 text-[#C64B1D]" />
                    <span>{p}</span>
                  </div>
                ))}
              </div>
              <Button onClick={() => handleGenerate("advanced")} className="w-full h-14 rounded-3xl bg-[#C14416] hover:bg-[#A13912] text-white font-black">
                {t.generate}
              </Button>
            </motion.div>

            {/* Advanced */}
            <motion.div whileHover={{ y: -10 }} className="bg-white rounded-[40px] p-10 shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-[#F0F0F0] flex flex-col items-center text-center relative overflow-hidden">
              <div className="w-16 h-16 rounded-3xl bg-[#FFF5F2] flex items-center justify-center mb-8 shadow-inner text-2xl">🔥</div>
              <h3 className="text-2xl font-black text-[#1A1A1A] mb-4">{t.advanced.name}</h3>
              <p className="text-sm text-[#777] leading-relaxed mb-10 min-h-[5rem] font-medium">{t.advanced.desc}</p>
              <div className="space-y-4 mb-12 w-full">
                {t.advanced.points.map((p, i) => (
                  <div key={i} className={cn("flex items-center gap-3 text-[13px] font-bold text-[#444]", isRTL && "flex-row-reverse")}>
                    <CheckCircle className="w-4 h-4 text-[#C64B1D]" />
                    <span>{p}</span>
                  </div>
                ))}
              </div>
              <Button onClick={() => handleGenerate("expert")} className="w-full h-14 rounded-3xl bg-[#C14416] hover:bg-[#A13912] text-white font-black">
                {t.generate}
              </Button>
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="bg-[#F8F9FA] rounded-[40px] p-8 md:p-14 flex flex-col md:flex-row items-center gap-12 border border-[#F0F0F0]">
            <div className="w-full md:w-[300px] h-[200px] rounded-3xl overflow-hidden shadow-2xl bg-white flex items-center justify-center p-6 border border-[#FFE4DE]">
              <img src="/logo.png" className="w-full h-full object-contain" alt="Lecture Mate Branding" />
            </div>
            <div className="flex-1">
              <p className="text-[#C14416] text-[10px] font-black tracking-[0.2em] mb-4 uppercase">{t.newFeature}</p>
              <h2 className="text-3xl font-black text-[#1A1A1A] mb-5">{t.adaptiveTitle}</h2>
              <p className="text-[#666] leading-relaxed mb-8 font-medium">{t.adaptiveDesc}</p>
              <button className="flex items-center gap-2 text-[#1A1A1A] font-black text-sm border-b-2 border-[#C14416] pb-1 hover:text-[#C14416] transition-colors">
                {t.runDiagnostics} <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  if (quizComplete || (questions.length > 0 && quizMode === "review")) {
    const isHighScore = questions.length > 0 && score >= 27;

    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white relative overflow-hidden">
        {/* Celebration Particles for High Score */}
        {isHighScore && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ 
                  opacity: 0, 
                  y: "100vh", 
                  x: `${Math.random() * 100}vw`,
                  scale: 0.5 + Math.random() 
                }}
                animate={{ 
                  opacity: [0, 1, 0], 
                  y: "-20vh",
                  rotate: [0, 360]
                }}
                transition={{ 
                  duration: 2 + Math.random() * 2, 
                  repeat: Infinity,
                  delay: Math.random() * 3
                }}
                className={cn(
                  "absolute text-2xl",
                  ["✨", "⭐", "🔸", "🎉", "🔥"][Math.floor(Math.random() * 5)]
                )}
              />
            ))}
          </div>
        )}

        <div className="max-w-2xl px-6 py-12 text-center space-y-10 relative z-10">
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            className="w-32 h-32 rounded-full bg-[#FFF5F2] flex items-center justify-center mx-auto shadow-2xl border-4 border-white"
          >
            <span className="text-6xl">{isHighScore ? "🏆" : "🎓"}</span>
          </motion.div>

          {isHighScore && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-block bg-[#F05A22] text-white px-6 py-2 rounded-full font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-[#F05A22]/30"
            >
              Curator's Excellence Achievement
            </motion.div>
          )}

          <div className="space-y-4">
            <h2 className="text-5xl font-black text-[#1A1A1A] tracking-tight">
              {isHighScore 
                ? (language === "ar" ? "إنجاز مذهل!" : "Stunning Mastery!") 
                : (language === "ar" ? "اكتمل التقييم" : "Assessment Complete")}
            </h2>
            <p className="text-xl text-[#666] font-medium max-w-lg mx-auto leading-relaxed">
              {isHighScore
                ? (language === "ar" 
                  ? "لقد أثبتّ قدرة استثنائية على استيعاب تفاصيل المحاضرة. أنت الآن في قمة الإتقان."
                  : "You've demonstrated exceptional command over the lecture nuances. You are at the peak of mastery.")
                : (language === "ar" 
                  ? "لقد أنهيت مراجعة محتوى المحاضرة بنجاح. استمر في التدرب للوصول للإتقان الكامل."
                  : "You have successfully navigated the lecture coverage. Continue practice to achieve full mastery.")}
            </p>
          </div>

          <div className="relative">
            <div className="text-8xl font-black text-[#F05A22] mb-2">{questions.length > 0 ? Math.round((score/questions.length)*100) : 0}%</div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#A0A0A0]">Knowledge Retention Score</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
             <Button onClick={() => {setQuizMode("menu"); setQuizComplete(false);}} variant="outline" className="rounded-2xl h-16 px-10 border-2 border-[#E5E5E5] font-black text-[#1A1A1A] hover:bg-[#F9F9F9] transition-all">
                {language === "ar" ? "إعادة التقييم" : "Retry Assessment"}
             </Button>
             <Button onClick={() => setQuizMode("menu")} className="rounded-2xl h-16 px-10 bg-[#1A1A1A] hover:bg-[#F05A22] text-white font-black text-lg transition-all shadow-xl shadow-black/10">
                {language === "ar" ? "العودة للمقاطع" : "Back to Modules"}
             </Button>
          </div>
        </div>
      </div>
    );
  }

  if (quizMode === "quiz" && currentQuestion) {
    return (
      <div className={cn("max-w-4xl mx-auto py-12 px-6 bg-[#FDFDFD] min-h-screen", isRTL && "rtl text-right")}>
        <div className="bg-white rounded-[40px] shadow-[0_30px_100px_rgba(240,90,34,0.08)] border border-[#FFE4DE] overflow-hidden">
          {/* Header Section with Question */}
          <div className="bg-[#FFF8F6] p-8 md:p-12 border-b border-[#FFE4DE]">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-4">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-[#F05A22] uppercase tracking-[0.2em] mb-0.5">
                    {language === "ar" ? "السؤال" : "QUESTION"}
                  </span>
                  <div className="text-xl font-black text-[#1A1A1A] flex items-baseline gap-1">
                    {currentQuestionIndex + 1}
                    <span className="text-[#A0A0A0] text-xs font-bold">/ {questions.length}</span>
                  </div>
                </div>
                {currentQuestion.type !== "open_ended" && (
                  <>
                    <div className="h-8 w-px bg-[#FFE4DE] mx-2 hidden md:block" />
                    <div className="flex items-center gap-2 bg-[#F05A22]/10 text-[#F05A22] px-4 py-2 rounded-2xl font-black text-sm">
                      <Timer className="w-4 h-4" />
                      <span>{timeLeft}</span>
                    </div>
                  </>
                )}
              </div>
              <div className="text-[11px] font-black text-[#F05A22] uppercase tracking-widest bg-[#F05A22]/5 px-4 py-1.5 rounded-full">
                {currentQuestion.type === "open_ended" 
                   ? (language === "ar" ? "سؤال مقالي" : "Open-Ended Question")
                   : (language === "ar" ? "خيار من متعدد" : "Multiple Choice")}
              </div>
            </div>
            
            <h2 className="text-xl md:text-2xl font-black text-[#1A1A1A] leading-tight max-w-4xl">
              <TextWithMath text={currentQuestion.text} />
            </h2>

            {/* Hint Box - Phase 2 */}
            <AnimatePresence>
              {showHint && !isAnswered && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }} 
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-6 p-4 rounded-2xl bg-[#FFF5F2] border-l-4 border-[#F05A22] text-[#C14416] flex items-start gap-3"
                >
                  <Bot className="w-5 h-5 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-black text-sm uppercase block mb-1">{language === "ar" ? "تلميح للحل:" : "Study Hint:"}</span>
                    <p className="text-sm font-medium italic">
                      <TextWithMath text={currentQuestion.hint || (language === "ar" ? "فكر في المفاهيم الأساسية التي تم شرحها في المحاضرة." : "Think about the core concepts explained in the lecture.")} />
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Question Content Section */}
          <div className="p-8 md:p-12 space-y-8 bg-white">
            {currentQuestion.type === "open_ended" ? (
              <div className="space-y-6">
                <div className="space-y-4">
                  <label className="text-sm font-black text-[#666] uppercase tracking-widest">
                    {language === "ar" ? "إجابتك:" : "Your Answer:"}
                  </label>
                  <Textarea 
                    value={essayAnswer}
                    onChange={(e) => setEssayAnswer(e.target.value)}
                    disabled={isAnswered}
                    placeholder={language === "ar" ? "اكتب إجابتك هنا بالتفصيل..." : "Compose your detailed response here..."}
                    className="min-h-[200px] rounded-[30px] border-2 border-[#F0F0F0] focus:border-[#F05A22] focus:ring-0 p-6 text-base font-medium leading-relaxed transition-all"
                  />
                </div>

                {!isAnswered && (
                  <Button 
                    onClick={handleEssaySubmit}
                    disabled={!essayAnswer.trim() || isEvaluating}
                    className="w-full h-16 rounded-[25px] bg-[#1A1A1A] hover:bg-[#F05A22] text-white font-black text-lg transition-all shadow-xl flex items-center justify-center gap-3"
                  >
                    {isEvaluating ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        {language === "ar" ? "جاري تقييم الإجابة..." : "Evaluating Response..."}
                      </>
                    ) : (
                      language === "ar" ? "إرسال الإجابة للتقييم" : "Submit for Evaluation"
                    )}
                  </Button>
                )}

                {evaluation && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }} 
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-8 rounded-[35px] border-2 border-dashed border-[#F05A22]/20 bg-[#FFF8F6] flex flex-col items-center text-center gap-4"
                  >
                    <div className="w-20 h-20 rounded-full bg-white shadow-xl flex items-center justify-center border-4 border-[#F05A22]">
                      <span className="text-2xl font-black text-[#F05A22]">{evaluation.similarityScore}%</span>
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-xl font-black text-[#1A1A1A]">
                        {evaluation.similarityScore < 20 
                          ? (language === "ar" ? "الإجابة غير مرتبطة بالموضوع" : "Irrelevant Response")
                          : (language === "ar" ? "مستوى المطابقة" : "Conceptual Alignment")}
                      </h4>
                      <p className="text-[#666] font-medium max-w-md mx-auto italic">
                        "{evaluation.feedback}"
                      </p>
                    </div>
                  </motion.div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {currentQuestion.options?.map((opt, i) => {
                  const letter = String.fromCharCode(65 + i);
                  const isSelected = selectedOption === i;
                  const isCorrect = i === currentQuestion.correctIndex;
                  const showResult = isAnswered;

                  return (
                    <motion.button
                      key={i}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleOptionSelect(i)}
                      disabled={isAnswered}
                      className={cn(
                        "w-full p-4 md:p-5 rounded-3xl text-left transition-all border-2 font-bold relative flex items-center gap-4 group min-h-[70px]",
                        showResult
                          ? isCorrect 
                            ? "bg-[#F0FFF4] border-[#10B981] text-[#10B981]" 
                            : isSelected 
                              ? "bg-[#FFF5F5] border-[#EF4444] text-[#EF4444]"
                              : "bg-white border-[#F0F0F0] text-[#888]"
                          : isSelected
                            ? "bg-[#FFF5F2] border-[#F05A22] text-[#F05A22]"
                            : "bg-white border-[#F0F0F0] hover:border-[#F05A22]/30 text-[#444]"
                      )}
                    >
                      <span className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center text-sm font-black shrink-0 transition-colors uppercase",
                        isSelected || (showResult && isCorrect) ? "bg-[#F05A22] text-white" : "text-[#F05A22]"
                      )}>
                        {letter}.
                      </span>
                      <span className={cn(
                        "flex-1 text-[14px] md:text-base font-medium tracking-tight",
                        isRTL ? "text-right" : "text-left"
                      )}>
                        <TextWithMath text={opt} />
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            )}

            <div className="pt-8 flex justify-between items-center">
              {isAnswered && selectedOption === null && (
                <div className="px-6 py-3 rounded-2xl bg-red-50 text-red-600 font-bold border border-red-100 flex items-center gap-2">
                  <Timer className="w-4 h-4" />
                  {language === "ar" ? "انتهى الوقت!" : "Time's up!"}
                </div>
              )}
              <div className="flex-1" />
              <Button 
                onClick={handleNext} 
                disabled={!isAnswered}
                className={cn(
                  "h-14 px-10 rounded-2xl font-black text-white transition-all shadow-lg",
                  isAnswered ? "bg-[#F05A22] hover:bg-[#D44A1B] shadow-[#F05A22]/20" : "bg-[#F3F4F6] text-[#9CA3AF] cursor-not-allowed shadow-none"
                )}
              >
                {currentQuestionIndex < questions.length - 1 ? "Next Question" : "Finish Review"}
              </Button>
            </div>
          </div>
        </div>

        {/* Feedback Section (Enhanced) */}
        <AnimatePresence>
          {isAnswered && (
            <motion.div 
              initial={{ opacity: 0, y: 30 }} 
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              className="mt-8 space-y-4"
            >
              {/* 1. Explanation Box */}
              <div className="p-8 rounded-[35px] bg-[#FFF8F6] border border-[#FFE4DE] relative overflow-hidden group">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5 text-[#F05A22]" />
                  <h4 className="font-black text-[#F05A22] text-lg">
                    {currentQuestion.type === "open_ended"
                      ? (language === "ar" ? "الإجابة النموذجية:" : "Model Answer:")
                      : (language === "ar" ? "الشرح:" : "Explanation:")
                    }
                  </h4>
                </div>
                <div className="text-[#444] font-medium leading-[1.8] text-[15px] md:text-base">
                  <TextWithMath text={
                    (currentQuestion.type === "open_ended" ? (evaluation?.correctAnswer || currentQuestion.explanation) : currentQuestion.explanation) || 
                    (language === "ar" ? "الشرح لهذا السؤال سيكون متاحاً قريباً." : "Detailed explanation for this question will be available shortly.")
                  } />
                </div>
              </div>

              {/* 2. Reference Source Box */}
              <div className="p-6 rounded-[35px] bg-white border border-[#F0F0F0] shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 px-10">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="flex flex-col items-center md:items-start gap-1">
                    <span className="text-[10px] font-black text-[#F05A22] uppercase tracking-tighter">
                      {language === "ar" ? "المصدر المرجعي:" : "Reference Source:"}
                    </span>
                    <div className="flex items-center gap-3">
                       <div className={cn(
                         "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider shadow-sm transition-all",
                         currentQuestion.reference?.source_type === "uploaded_content" 
                           ? "bg-[#F05A22] text-white" 
                           : "bg-[#FDFDFD] border border-[#EEEEEE] text-[#777]"
                       )}>
                         {currentQuestion.reference?.source_type === "uploaded_content" ? (
                           <>
                             <PlayCircle className="w-3 h-3" />
                             {language === "ar" ? "من المحتوى" : "From Content"}
                           </>
                         ) : (
                           <>
                             <Globe className="w-3 h-3 text-[#F05A22]" />
                             {language === "ar" ? "مصدر خارجي" : "External Source"}
                           </>
                         )}
                       </div>
                       
                       {currentQuestion.reference?.location && (
                         <div className="flex items-center gap-1.5 text-[#555] text-sm font-bold">
                           <Clock className="w-4 h-4 text-[#F05A22]" />
                           <span>{currentQuestion.reference.location}</span>
                         </div>
                       )}
                    </div>
                  </div>

                  <div className="h-8 w-[1px] bg-[#EEE] hidden md:block" />

                  <div className="flex items-center gap-3">
                    <Search className="w-4 h-4 text-[#AAA]" />
                    <span className="text-sm font-bold text-[#1A1A1A]">
                      {currentQuestion.reference?.concept || (language === "ar" ? "المفهوم الأساسي" : "Core Concept")}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-[#FFF8F6] text-[#F05A22]">
                  <BookText className="w-6 h-6" />
                </div>
              </div>

              {/* 3. AI Chat Trigger Bar */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => setIsChatOpen(true)}
                className="w-full h-16 bg-white border border-[#F0F0F0] rounded-[25px] flex items-center justify-between px-6 shadow-sm hover:shadow-md transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#F05A22] flex items-center justify-center text-white shadow-lg shadow-[#F05A22]/20">
                    <Bot className="w-5 h-5" />
                  </div>
                  <span className="text-[#666] font-bold text-sm">
                    {language === "ar" ? "اسأل الذكاء الاصطناعي للمساعدة..." : "Ask AI for help..."}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[#BBB] group-hover:text-[#F05A22] transition-colors">
                  <span className="text-[10px] font-black uppercase tracking-widest hidden md:block">
                    {language === "ar" ? "فتح المحادثة" : "Open Chat"}
                  </span>
                  <div className="flex flex-col items-center justify-center">
                    <ArrowRight className="w-4 h-4 rotate-[-45deg]" />
                  </div>
                </div>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Chat Drawer Integration */}
        <AnimatePresence>
          {isChatOpen && (
            <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center p-4 bg-black/20 backdrop-blur-sm">
               <motion.div 
                 initial={{ opacity: 0, y: 100 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, y: 100 }}
                 className="w-full max-w-4xl h-[80vh] bg-white rounded-[40px] shadow-2xl border border-[#F0F0F0] overflow-hidden flex flex-col relative"
               >
                 <div className="p-6 border-b border-[#F0F0F0] flex justify-between items-center bg-[#FDFDFD]">
                   <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-2xl bg-[#F05A22]/10 flex items-center justify-center">
                       <Bot className="w-6 h-6 text-[#F05A22]" />
                     </div>
                     <div>
                       <h3 className="font-black text-[#1A1A1A]">AI Academic Assistant</h3>
                       <p className="text-[10px] text-[#A0A0A0] font-bold uppercase tracking-widest">Discussing: {currentQuestion.reference?.concept}</p>
                     </div>
                   </div>
                   <Button variant="ghost" size="icon" onClick={() => setIsChatOpen(false)} className="rounded-full hover:bg-red-50 hover:text-red-500">
                     <X className="w-5 h-5" />
                   </Button>
                 </div>
                 
                 <div className="flex-1 overflow-hidden">
                    <AgentChatView 
                      transcript={transcript || ""}
                      title={currentQuestion.reference?.concept || "Question Analysis"}
                      initialMessage={language === "ar" 
                        ? `مرحباً، أريد الاستفسار عن المفهوم التالي من المحاضرة: "${currentQuestion.reference?.concept || currentQuestion.text}"` 
                        : `Hi, I want to discuss the following concept from the lecture: "${currentQuestion.reference?.concept || currentQuestion.text}"`}
                    />
                 </div>
               </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    );
  }


  return null;
}
