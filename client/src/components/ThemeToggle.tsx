import { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/ThemeProvider";

interface ThemeToggleProps {
  showLabel?: boolean;
  className?: string;
}

export default function ThemeToggle({ showLabel = true, className = "" }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted
    ? theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)
    : theme === "dark";

  const label = isDark ? "Night" : "Day";

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <Button
      variant="ghost"
      size={showLabel ? "sm" : "icon"}
      onClick={toggleTheme}
      data-testid="button-theme-toggle"
      aria-label={isDark ? "Switch to day mode (currently night mode)" : "Switch to night mode (currently day mode)"}
      title={isDark ? "Switch to day mode" : "Switch to night mode"}
      className={`relative inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg active:scale-95 transition-all text-foreground hover:bg-muted/80 select-none ${className}`}
    >
      {showLabel && (
        <span className="text-xs font-semibold tracking-wide text-foreground">
          {label}
        </span>
      )}
      {isDark ? (
        <Moon className="h-4 w-4 text-indigo-400 shrink-0" />
      ) : (
        <Sun className="h-4 w-4 text-amber-500 shrink-0" />
      )}
    </Button>
  );
}
