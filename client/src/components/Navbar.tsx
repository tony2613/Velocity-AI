import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useSidebar } from "@/context/SidebarContext";
import { Button } from "@/components/ui/button";
import { Menu, Upload, Sparkles, ExternalLink } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { usePWAInstall } from "@/hooks/use-pwa-install";
import { useLanguage } from "@/context/LanguageContext";
import { PLAN_LIMITS } from "@shared/plans";

export default function Navbar() {
  const { t } = useLanguage();
  const [location, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const { isInstallable, isInstalled, promptInstall } = usePWAInstall();
  const [showIOSInstallModal, setShowIOSInstallModal] = useState(false);
  const [showInAppBrowserModal, setShowInAppBrowserModal] = useState(false);

  const { toggle: toggleSidebar } = useSidebar();

  const [isNavbarVisible, setIsNavbarVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Hide on scroll down after threshold, show on scroll up
      if (currentScrollY > lastScrollY && currentScrollY > 80) {
        setIsNavbarVisible(false);
      } else if (currentScrollY < lastScrollY) {
        setIsNavbarVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const tier = (user?.subscriptionTier || 'free') as 'free' | 'pro' | 'elite';
  const usageLimit = PLAN_LIMITS[tier]?.uploadLimit ?? 5;
  const dailyUsage = user?.dailyUploadCount || 0;
  const isNearLimit = dailyUsage >= usageLimit - 1;
  const isAtLimit = dailyUsage >= usageLimit;

  const handleInstallClick = async () => {
    const installResult = await promptInstall();
    if (installResult === 'intent') {
      toast({
        title: "Opening in Browser...",
        description: "Redirecting you to install Velocity AI.",
      });
    } else if (installResult === 'in-app') {
      setShowInAppBrowserModal(true);
    } else if (installResult === 'ios') {
      setShowIOSInstallModal(true);
    }
  };

  const isAppRoute = ["/dashboard", "/notes", "/quizzes", "/upload", "/settings", "/profile"].includes(location) ||
                     location.startsWith("/summary/") ||
                     location.startsWith("/quiz/");

  const showFloatingHamburger = !!user && isAppRoute;

  const { isOpen } = useSidebar();
  const sidebarOffsetClass = user 
    ? (isOpen ? "md:left-[17rem]" : "md:left-[5rem]")
    : "";

  const leftPositionClass = showFloatingHamburger
    ? "left-16 sm:left-[4.5rem]"
    : "left-2 sm:left-4";

  return (
    <>
      {showFloatingHamburger && (
        <div className="md:hidden fixed top-4 sm:top-6 left-2 sm:left-4 z-[70]">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="w-12 h-12 rounded-[1rem] bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl backdrop-saturate-150 border border-white/40 dark:border-zinc-800/60 shadow-lg shadow-black/10 dark:shadow-black/30 flex items-center justify-center text-foreground hover:bg-white dark:hover:bg-zinc-900 transition-all duration-300 hover:scale-105 active:scale-95"
            data-testid="button-sidebar-toggle-mobile"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      )}

      <nav 
        className={`fixed top-2 sm:top-4 ${leftPositionClass} right-2 sm:right-4 z-[60] rounded-[1.5rem] transition-all duration-300 bg-white/80 dark:bg-card/80 backdrop-blur-xl backdrop-saturate-150 border border-white/40 dark:border-border/60 shadow-lg shadow-black/10 dark:shadow-black/30 ${sidebarOffsetClass}`}
        style={{ transform: isNavbarVisible ? "translateY(0)" : "translateY(calc(-100% - 2rem))" }}
      >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo & Desktop Nav */}
          <div className="flex items-center gap-8">
            <Link href="/">
              <div className="flex items-center gap-2 cursor-pointer">
                <span className="font-bold text-xl tracking-tight">Velocity AI</span>
              </div>
            </Link>

            {/* Desktop Center Links */}
            {!user && (
              <div className="hidden md:flex items-center gap-1">
                <Link href="/features">
                  <Button variant="ghost" className="text-sm font-semibold px-4 py-2">{t("nav.features")}</Button>
                </Link>
                <Link href="/pricing">
                  <Button variant="ghost" className="text-sm font-semibold px-4 py-2">{t("nav.pricing")}</Button>
                </Link>
                <Link href="/faq">
                  <Button variant="ghost" className="text-sm font-semibold px-4 py-2">{t("nav.faq")}</Button>
                </Link>
                <Link href="/blog">
                  <Button variant="ghost" className="text-sm font-semibold px-4 py-2">{t("nav.blog")}</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Removed Desktop Search */}

          {/* Right Side Actions */}
          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-2">
              {user ? (
                <>
                  <Link href="/dashboard">
                    <Button variant="outline" className="border-border hover:bg-muted/50 rounded-xl">
                      {t("nav.dashboard") || "Dashboard"}
                    </Button>
                  </Link>
                  {isInstallable && !isInstalled && (
                    <Button
                      onClick={handleInstallClick}
                      variant="default"
                      className="bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 mr-2"
                    >
                      <Upload className="h-4 w-4 mr-2 rotate-180" />
                      Install App
                    </Button>
                  )}
                  <div
                    id="tut-credits"
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium mr-2 cursor-pointer transition-all hover:scale-105`}
                    style={{
                      background: isAtLimit ? 'rgba(239,68,68,0.1)' : isNearLimit ? 'rgba(245,158,11,0.1)' : 'rgba(var(--primary-rgb),0.1)',
                      borderColor: isAtLimit ? 'rgba(239,68,68,0.3)' : isNearLimit ? 'rgba(245,158,11,0.3)' : 'rgba(var(--primary-rgb),0.3)',
                      color: isAtLimit ? 'rgb(239,68,68)' : isNearLimit ? 'rgb(245,158,11)' : 'hsl(var(--primary))'
                    }}
                    title={`Uploads today: ${dailyUsage} used, ${usageLimit - dailyUsage} remaining. Resets daily at midnight UTC.`}
                    onClick={() => setLocation('/pricing')}
                  >
                    <Sparkles className="h-3 w-3" />
                    <span>{usageLimit - dailyUsage} uploads left</span>
                  </div>
                  <Link href="/upload">
                    <Button id="tut-upload" className="gap-2 mr-2">
                      <Upload className="h-4 w-4" />
                      <span className="hidden sm:inline">{t("nav.upload")}</span>
                    </Button>
                  </Link>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <ThemeToggle />
                  <Link href="/auth">
                    <Button variant="ghost" size="sm">{t("nav.login")}</Button>
                  </Link>
                  <Link href="/auth">
                    <Button size="sm">{t("nav.signup")}</Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Actions */}
            <div className="md:hidden flex items-center gap-2">
            {/* Mobile Search Sheet Removed */}

              {user && (
                <Link href="/dashboard">
                  <Button variant="outline" size="sm" className="border-border hover:bg-muted/50 rounded-xl h-8 text-xs font-semibold px-3">
                    {t("nav.dashboard") || "Dashboard"}
                  </Button>
                </Link>
              )}

              {isInstallable && !isInstalled && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleInstallClick}
                  className="bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 h-8 px-2"
                >
                  <Upload className="h-4 w-4 mr-1 rotate-180" />
                  <span className="text-xs">Install</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Right Sheet Removed */}

      <Dialog open={showIOSInstallModal} onOpenChange={setShowIOSInstallModal}>
        <DialogContent className="sm:max-w-md glass-panel-heavy">
          <DialogHeader>
            <DialogTitle className="text-center text-xl">Install Velocity AI</DialogTitle>
            <DialogDescription className="sr-only">Instructions on how to install the app on iOS devices</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center space-y-4 py-4 text-center">
            <div className="p-4 bg-muted/50 rounded-full">
              <Upload className="h-8 w-8 text-primary" style={{ transform: "rotate(180deg)" }} />
            </div>
            <h3 className="font-semibold px-4 text-lg">Add to your Home Screen</h3>
            <p className="text-sm text-muted-foreground px-6">
              Install Velocity AI on your iPhone or iPad for the best full-screen experience and quick access.
            </p>
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 w-full mt-4 flex flex-col gap-3 text-sm text-left">
              <div className="flex items-center gap-3">
                <div className="bg-background rounded-full w-6 h-6 flex items-center justify-center font-bold text-xs shadow-sm shadow-primary/20">1</div>
                <span>Tap the <strong>Share</strong> button at the bottom of Safari.</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-background rounded-full w-6 h-6 flex items-center justify-center font-bold text-xs shadow-sm shadow-primary/20">2</div>
                <span>Scroll down and tap <strong>Add to Home Screen</strong>.</span>
              </div>
            </div>
            <Button className="w-full mt-4" onClick={() => setShowIOSInstallModal(false)}>
              Got it
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showInAppBrowserModal} onOpenChange={setShowInAppBrowserModal}>
        <DialogContent className="sm:max-w-md glass-panel-heavy">
          <DialogHeader>
            <DialogTitle className="text-center text-xl">Open in System Browser</DialogTitle>
            <DialogDescription className="sr-only">Instructions to open the app in default browser to install</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center space-y-4 py-4 text-center">
            <div className="p-4 bg-muted/50 rounded-full">
              <ExternalLink className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-semibold px-4 text-lg">Leave the app browser</h3>
            <p className="text-sm text-muted-foreground px-6">
              You're currently viewing this in an in-app browser. To safely install Velocity AI, please open this page in your device's default browser.
            </p>
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 w-full mt-4 flex flex-col gap-3 text-sm text-left">
              <div className="flex items-start gap-3">
                <div className="bg-background rounded-full w-6 h-6 flex flex-shrink-0 items-center justify-center font-bold text-xs shadow-sm shadow-primary/20">1</div>
                <span>Tap the <strong>three dots</strong> or <strong>Share</strong> icon in the corner of your screen.</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-background rounded-full w-6 h-6 flex flex-shrink-0 items-center justify-center font-bold text-xs shadow-sm shadow-primary/20">2</div>
                <span>Select <strong>Open in Browser</strong>, <strong>Open in Safari</strong>, or <strong>Open in Chrome</strong>.</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-background rounded-full w-6 h-6 flex flex-shrink-0 items-center justify-center font-bold text-xs shadow-sm shadow-primary/20">3</div>
                <span>Once opened in your main browser, tap the <strong>Install App</strong> button again.</span>
              </div>
            </div>
            <Button className="w-full mt-4" onClick={() => setShowInAppBrowserModal(false)}>
              Got it
            </Button>
          </div>
        </DialogContent>
      </Dialog>


    </nav >
    </>
  );
}
