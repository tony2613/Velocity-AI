import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Sparkles, CheckCircle2 } from "lucide-react";

interface SignupWallModalProps {
    open: boolean;
    onClose: () => void;
    trigger?: "summary" | "quiz" | "search" | "generic";
}

const PERKS = [
    { text: "5 uploads / day on the free plan" },
    { text: "Save & organise all your notes" },
    { text: "Unlimited quiz generation" },
    { text: "AI-powered search, unlimited" },
];

const TRIGGER_MESSAGES: Record<string, string> = {
    summary: "You've used your free upload. Sign up to keep going!",
    quiz: "You've used your free quiz. Sign up to generate unlimited quizzes!",
    search: "You've used your free search. Sign up for unlimited AI research!",
    generic: "Your free trial is complete. Loved it? Keep going for free!",
};

export default function SignupWallModal({ open, onClose, trigger = "generic" }: SignupWallModalProps) {
    const [, setLocation] = useLocation();

    const go = (path: string) => {
        onClose();
        setLocation(path);
    };

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="max-w-sm p-0 overflow-hidden border-0">
                {/* Gradient header */}
                <div className="relative bg-gradient-to-br from-primary via-primary/90 to-violet-600 p-8 text-white text-center">
                    <div className="absolute inset-0 opacity-10"
                        style={{ backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)", backgroundSize: "30px 30px" }} />
                    <div className="relative">
                        <div className="mx-auto mb-4 h-14 w-14 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                            <Sparkles className="h-7 w-7 text-white" />
                        </div>
                        <h2 className="text-xl font-bold mb-1">🚀 Free Trial Complete!</h2>
                        <p className="text-sm text-white/85 leading-snug">{TRIGGER_MESSAGES[trigger]}</p>
                    </div>
                </div>

                {/* Perks */}
                <div className="px-6 py-5 space-y-3 bg-card">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">What you get — free forever</p>
                    <ul className="space-y-2.5">
                        {PERKS.map(({ text }) => (
                            <li key={text} className="flex items-center gap-3 text-sm">
                                <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                                <span>{text}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Actions */}
                <div className="px-6 pb-6 space-y-2 bg-card">
                    <Button className="w-full h-11 text-base font-semibold" onClick={() => go("/auth?tab=register")}>
                        Create free account
                    </Button>
                    <Button variant="ghost" className="w-full h-10 text-muted-foreground" onClick={() => go("/auth")}>
                        Already have an account? Log in
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
