import { useEffect } from "react";
import { useStudyTimer } from "@/hooks/use-study-timer";
import { useToast } from "@/hooks/use-toast";

export default function GlobalStudyTimer() {
  const { celebration, clearCelebration } = useStudyTimer();
  const { toast } = useToast();

  useEffect(() => {
    if (celebration) {
      console.log(`[Study Timer] Launching toast celebration for: ${celebration.duration}`);
      
      toast({
        title: "Great job! 🏆",
        description: `You've been actively studying for ${celebration.duration}. Keep up the momentum!`,
        duration: 8000,
        onOpenChange: (open) => {
          if (!open) {
            clearCelebration();
          }
        }
      });
    }
  }, [celebration, toast, clearCelebration]);

  return null;
}
