import { useEffect } from "react";
import { X, Trophy } from "lucide-react";
import confetti from "canvas-confetti";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface StudyCelebrationPopupProps {
  duration: string;
  onClose: () => void;
}

export default function StudyCelebrationPopup({ duration, onClose }: StudyCelebrationPopupProps) {
  useEffect(() => {
    console.log(`[Study Timer] Popup rendered for duration: ${duration}`);
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 }
    });
  }, [duration]);

  // Auto-dismiss after 8 seconds
  useEffect(() => {
    const timer = setTimeout(onClose, 8000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-8 right-8 z-[100] animate-in slide-in-from-right-8 fade-in duration-500">
      <Card className="relative overflow-hidden border-primary/20 bg-background/80 backdrop-blur-xl shadow-2xl p-6 pr-12 w-[320px]">
        {/* Decorative background glow */}
        <div className="absolute -top-10 -right-10 w-24 h-24 bg-primary/20 blur-2xl rounded-full pointer-events-none" />
        
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 shrink-0 rounded-full bg-primary/10 flex items-center justify-center relative">
            <Trophy className="h-6 w-6 text-primary animate-bounce" />
            <div className="absolute inset-0 rounded-full border border-primary/30 animate-ping opacity-20" />
          </div>
          
          <div className="space-y-1">
            <h3 className="font-bold text-lg leading-tight">Great job!</h3>
            <p className="text-sm text-muted-foreground">
              You've been actively studying for <strong className="text-foreground">{duration}</strong>. Keep up the momentum!
            </p>
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute top-2 right-2 h-8 w-8 text-muted-foreground hover:text-foreground rounded-full"
        >
          <X className="h-4 w-4" />
        </Button>
      </Card>
    </div>
  );
}
