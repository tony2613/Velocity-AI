import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Menu, LogOut, User as UserIcon, Settings as SettingsIcon, Upload, Sparkles, ExternalLink, X, Flame } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { usePWAInstall } from "@/hooks/use-pwa-install";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { useLanguage } from "@/context/LanguageContext";
import { PLAN_LIMITS } from "@shared/plans";
import { useQuery } from "@tanstack/react-query";

export default function Navbar() {
  const { t } = useLanguage();
  const [, setLocation] = useLocation();
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const { isInstallable, isInstalled, promptInstall } = usePWAInstall();
  const [showIOSInstallModal, setShowIOSInstallModal] = useState(false);
  const [showInAppBrowserModal, setShowInAppBrowserModal] = useState(false);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const tier = (user?.subscriptionTier || 'free') as 'free' | 'pro' | 'elite';
  const usageLimit = PLAN_LIMITS[tier]?.uploadLimit ?? 5;
  const dailyUsage = user?.dailyUploadCount || 0;
  const isNearLimit = dailyUsage >= usageLimit - 1;
  const isAtLimit = dailyUsage >= usageLimit;

  const { data: canaChats } = useQuery({
    queryKey: ["/api/cana/chats"],
    enabled: !!user
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

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

  return (
    <nav className="fixed top-2 sm:top-4 left-2 sm:left-4 right-2 sm:right-4 z-[60] rounded-[1.5rem] glass-panel">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo & Desktop Nav */}
          <div className="flex items-center gap-8">
            <Link href="/">
              <div className="flex items-center gap-2 cursor-pointer">
                <span className="font-bold text-xl tracking-tight">Velocity AI</span>
                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full border border-primary/20 font-medium">
                  {t("status.beta")}
                </span>
              </div>
            </Link>

            {/* Desktop Center Links */}
            {user ? (
              <div className="hidden md:flex items-center gap-1">
                <Link href="/dashboard">
                  <div className="relative group/nav-item">
                    <Button variant="ghost" className="text-sm font-semibold px-4 py-2 hover:bg-transparent transition-colors group-hover/nav-item:text-primary">
                      {t("nav.dashboard")}
                    </Button>
                  </div>
                </Link>
                <Link href="/notes">
                  <div className="relative group/nav-item">
                    <Button variant="ghost" className="text-sm font-semibold px-4 py-2 hover:bg-transparent transition-colors group-hover/nav-item:text-primary">
                      {t("nav.notes")}
                    </Button>
                  </div>
                </Link>
                <Link href="/quizzes">
                  <div className="relative group/nav-item">
                    <Button variant="ghost" className="text-sm font-semibold px-4 py-2 hover:bg-transparent transition-colors group-hover/nav-item:text-primary">
                      {t("nav.quizzes")}
                    </Button>
                  </div>
                </Link>
              </div>
            ) : (
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
              <ThemeToggle />
              {user ? (
                <>
                  <div
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-orange-500/30 bg-orange-500/10 text-orange-500 text-xs font-medium mr-2 transition-all hover:scale-105"
                    title={`${user.streakCount || 0} day study streak!`}
                  >
                    <Flame className="h-3 w-3" />
                    <span>{user.streakCount || 0}</span>
                  </div>
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
                  <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(true)}>
                    <Menu className="h-5 w-5" />
                  </Button>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Link href="/auth">
                    <Button variant="ghost" size="sm">{t("nav.login")}</Button>
                  </Link>
                  <Link href="/auth">
                    <Button size="sm">{t("nav.signup")}</Button>
                  </Link>
                  <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(true)}>
                    <Menu className="h-5 w-5" />
                  </Button>
                </div>
              )}
            </div>

            {/* Mobile Actions */}
            <div className="md:hidden flex items-center gap-2">
            {/* Mobile Search Sheet Removed */}

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

              <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(true)}>
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="right" className="w-[300px] glass-panel border-l border-primary/10">
          <div className="flex flex-col gap-2 mt-6">
            {user ? (
              <>
                  <div className="flex items-center gap-3 px-2 py-2 mb-2">
                    <Avatar className="h-10 w-10 border border-primary/20 shadow-sm">
                      <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.username}`} alt={user.username} />
                      <AvatarFallback>{user.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold leading-tight">{user.username}</span>
                      <span className="text-[10px] uppercase font-bold text-primary tracking-wider">
                        {user.subscriptionTier === 'free' ? t("sub.free") : user.subscriptionTier === 'pro' ? t("sub.pro") : t("sub.elite")} Plan
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between px-2 py-3 mb-2 rounded-lg bg-background/40 backdrop-blur-md border border-primary/10 shadow-sm">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-semibold uppercase text-muted-foreground">Document Uploads</span>
                      <div className="w-36 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${isAtLimit ? 'bg-destructive' : isNearLimit ? 'bg-amber-500' : 'bg-primary'}`}
                          style={{ width: `${Math.min(100, (dailyUsage / usageLimit) * 100)}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">{usageLimit - dailyUsage} uploads left today</span>
                      <span className="text-[10px] text-muted-foreground/60">AI generation uses no credits</span>
                    </div>
                    <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs font-bold
                      ${isAtLimit ? 'bg-destructive/10 text-destructive border-destructive/20' 
                        : isNearLimit ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' 
                        : 'bg-primary/10 text-primary border-primary/20'}`}
                    >
                      <Sparkles className="h-3 w-3" />
                      {dailyUsage}/{usageLimit}
                    </div>
                  </div>
                  <div className="flex items-center justify-between px-3 py-2 mb-2 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-500">
                    <div className="flex items-center gap-2">
                      <Flame className="h-4 w-4" />
                      <span className="text-sm font-semibold">Study Streak</span>
                    </div>
                    <span className="text-sm font-bold">{user.streakCount || 0} days</span>
                  </div>
                <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium py-2 block">
                  {t("nav.dashboard")}
                </Link>
                <Link href="/notes" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium py-2 block">
                  {t("nav.notes")}
                </Link>
                <Link href="/quizzes" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium py-2 block">
                  {t("nav.quizzes")}
                </Link>
                <Link href="/upload" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium py-2 block flex items-center gap-2">
                  <Upload className="h-4 w-4" /> {t("nav.upload")}
                </Link>
                <div className="my-2 border-t" />
                <Link href="/profile" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium py-2 block">
                  {t("nav.profile")}
                </Link>
                <Link href="/pricing" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium py-2 block flex items-center gap-2 text-primary">
                  <Sparkles className="h-4 w-4" /> {t("nav.upgrade")}
                </Link>
                
                <div className="my-2 border-t" />
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-semibold uppercase text-muted-foreground px-1 mb-1">CANA History</span>
                  <div className="flex flex-col max-h-40 overflow-y-auto custom-scrollbar">
                    {canaChats?.length ? canaChats.map((chat: any) => (
                      <button 
                        key={chat.id}
                        className="text-left text-sm text-foreground/80 hover:bg-muted/50 hover:text-foreground px-2 py-1.5 rounded-md truncate transition-colors"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          window.dispatchEvent(new CustomEvent('open-cana-chat', { detail: { chatId: chat.id } }));
                        }}
                      >
                        {chat.title}
                      </button>
                    )) : (
                      <div className="text-xs text-muted-foreground px-2 italic">No past chats</div>
                    )}
                  </div>
                </div>

                <div className="my-2 border-t" />
                <Link href="/settings" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium py-2 block">
                  {t("nav.settings")}
                </Link>
                <div className="my-2 border-t" />
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm font-medium">{t("nav.appearance")}</span>
                  <ThemeToggle />
                </div>
                <Button variant="destructive" className="w-full mt-4 justify-start" onClick={() => { handleLogout(); setMobileMenuOpen(false); }}>
                  <LogOut className="mr-2 h-4 w-4" /> {t("nav.logout")}
                </Button>
              </>
            ) : (
              <>
                <Link href="/features" className="text-sm font-medium py-2 block">{t("nav.features")}</Link>
                <Link href="/pricing" className="text-sm font-medium py-2 block">{t("nav.pricing")}</Link>
                <Link href="/auth">
                  <Button className="w-full mt-4">{t("nav.login")}</Button>
                </Link>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>

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
  );
}
