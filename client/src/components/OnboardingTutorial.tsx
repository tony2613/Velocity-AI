import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { X, ChevronRight, ChevronLeft, Sparkles } from "lucide-react";

interface Step {
  targetId: string;
  title: string;
  description: string[];
}

const STEPS: Step[] = [
  {
    targetId: "tut-credits",
    title: "Monitor Your Limits",
    description: [
      "Track your daily document upload quota here.",
      "Pro and Elite members enjoy up to 200 uploads per day.",
      "Remember: Generating summaries and quizzes is always free!"
    ]
  },
  {
    targetId: "tut-upload",
    title: "Start Your Study Session",
    description: [
      "Upload any PDF, Image, or PowerPoint file here.",
      "Our OCR engine extracts text with university-grade accuracy.",
      "A digital note will be automatically created for you instantly."
    ]
  },
  {
    targetId: "tut-notes",
    title: "Central Knowledge Hub",
    description: [
      "Access all your uploaded study materials from this list.",
      "Click any note to open it and unlock advanced features.",
      "Your documents are securely stored and organized by subject."
    ]
  },
  {
    targetId: "tut-notes", // Still targeting notes because summary/quiz are inside notes
    title: "Generate Summaries & Quizzes",
    description: [
      "Inside each note, click 'Generate Study Pack' for results.",
      "Get exhaustive summaries that skip the fluff and focus on exams.",
      "Create custom quizzes to test your knowledge before the big day."
    ]
  },
  {
    targetId: "tut-cana",
    title: "Meet CANA Assistant",
    description: [
      "Your 24/7 research companion for deep academic dives.",
      "Ask CANA anything—she searches your notes and the web.",
      "Get expert, multi-perspective answers formatted for study."
    ]
  }
];

export default function OnboardingTutorial() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    const hasSeen = localStorage.getItem("velocity_onboarding_seen");
    if (!hasSeen) {
      // Small delay to let page render
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const updateHighlight = useCallback(() => {
    const step = STEPS[currentStep];
    const element = document.getElementById(step.targetId);
    if (element) {
      setTargetRect(element.getBoundingClientRect());
      element.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [currentStep]);

  useEffect(() => {
    if (isVisible) {
      updateHighlight();
      window.addEventListener("resize", updateHighlight);
      window.addEventListener("scroll", updateHighlight);
      return () => {
        window.removeEventListener("resize", updateHighlight);
        window.removeEventListener("scroll", updateHighlight);
      };
    }
  }, [isVisible, updateHighlight]);

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem("velocity_onboarding_seen", "true");
    setIsVisible(false);
  };

  if (!isVisible || !targetRect) return null;

  const step = STEPS[currentStep];

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none">
      {/* Spotlight Mask */}
      <svg className="absolute inset-0 w-full h-full pointer-events-auto">
        <defs>
          <mask id="spotlight-mask">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            <rect
              x={targetRect.left - 8}
              y={targetRect.top - 8}
              width={targetRect.width + 16}
              height={targetRect.height + 16}
              rx="12"
              fill="black"
            />
          </mask>
        </defs>
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(0, 0, 0, 0.75)"
          mask="url(#spotlight-mask)"
          onClick={handleComplete}
          className="cursor-pointer"
        />
      </svg>

      {/* Floating Info Box */}
      <div
        className="absolute pointer-events-auto transition-all duration-500 ease-out"
        style={{
          top: targetRect.bottom + 20 > window.innerHeight - 300 
            ? targetRect.top - 280 
            : targetRect.bottom + 20,
          left: Math.min(Math.max(20, targetRect.left + targetRect.width / 2 - 160), window.innerWidth - 340),
          width: "320px",
        }}
      >
        <div className="bg-card border-2 border-primary/30 shadow-2xl rounded-2xl p-6 relative overflow-hidden animate-in fade-in zoom-in duration-300">
          <div className="absolute top-0 right-0 p-1">
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={handleComplete}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2 text-primary mb-3">
            <Sparkles className="h-5 w-5 fill-primary/20" />
            <h3 className="font-bold text-lg leading-tight">{step.title}</h3>
          </div>

          <div className="space-y-2 mb-6 text-sm text-muted-foreground leading-relaxed">
            {step.description.map((line, idx) => (
              <p key={idx} className="flex gap-2">
                <span className="text-primary font-bold">•</span>
                {line}
              </p>
            ))}
          </div>

          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex gap-1">
              {STEPS.map((_, i) => (
                <div
                  key={i}
                  className={`h-1 rounded-full transition-all duration-300 ${
                    i === currentStep ? "w-4 bg-primary" : "w-1 bg-muted"
                  }`}
                />
              ))}
            </div>
            <div className="flex gap-2">
              {currentStep > 0 && (
                <Button variant="outline" size="sm" onClick={handlePrev} className="h-8">
                  <ChevronLeft className="h-4 w-4 mr-1" /> Back
                </Button>
              )}
              <Button size="sm" onClick={handleNext} className="h-8 shadow-lg shadow-primary/20">
                {currentStep === STEPS.length - 1 ? "Finish" : "Next"}
                {currentStep < STEPS.length - 1 && <ChevronRight className="h-4 w-4 ml-1" />}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
