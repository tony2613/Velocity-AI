import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Search, X, Menu, LogOut, User as UserIcon, Settings as SettingsIcon, Upload, ArrowRight, Sparkles, ExternalLink } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import { Input } from "@/components/ui/input";
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

export default function Navbar() {
  const { t } = useLanguage();
  const [, setLocation] = useLocation();
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const { isInstallable, isInstalled, promptInstall } = usePWAInstall();
  const [showIOSInstallModal, setShowIOSInstallModal] = useState(false);
  const [showInAppBrowserModal, setShowInAppBrowserModal] = useState(false);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const usageLimit = user?.subscriptionTier === 'elite' ? 200 : user?.subscriptionTier === 'pro' ? 50 : 5;
  const dailyUsage = user?.dailyUploadCount || 0;
  const isNearLimit = dailyUsage >= usageLimit - 1;
  const isAtLimit = dailyUsage >= usageLimit;

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
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
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
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium mr-2
                    ${isAtLimit ? 'bg-destructive/10 text-destructive border-destructive/20' 
                      : isNearLimit ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' 
                      : 'bg-primary/10 text-primary border-primary/20'}`}
                  >
                    <Sparkles className="h-3 w-3" />
                    <span>{dailyUsage} / {usageLimit}</span>
                  </div>
                  <Link href="/upload">
                    <Button className="gap-2 mr-2">
                      <Upload className="h-4 w-4" />
                      <span className="hidden sm:inline">{t("nav.upload")}</span>
                    </Button>
                  </Link>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                        <Avatar className="h-10 w-10 border border-border">
                          <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.username}`} alt={user.username} />
                          <AvatarFallback>{user.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                      <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">{user.username}</p>
                          <p className="text-xs leading-none text-muted-foreground">
                            {user.subscriptionTier === 'free' ? t("sub.free") :
                              user.subscriptionTier === 'pro' ? t("sub.pro") : t("sub.elite")}
                          </p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setLocation("/profile")}>
                        <UserIcon className="mr-2 h-4 w-4" />
                        <span>{t("nav.profile")}</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setLocation("/pricing")}>
                        <Sparkles className="mr-2 h-4 w-4" />
                        <span>{t("nav.upgrade")}</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setLocation("/settings")}>
                        <SettingsIcon className="mr-2 h-4 w-4" />
                        <span>{t("nav.settings")}</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout} className="text-red-500">
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>{t("nav.logout")}</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <div className="flex items-center gap-2">
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
        <SheetContent side="right" className="w-[300px]">
          <SheetHeader className="text-left mb-4">
            <SheetTitle>Menu</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col gap-2">
            {user ? (
              <>
                <div className="flex items-center justify-between px-2 py-3 mb-2 rounded-lg bg-muted/30 border">
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold uppercase text-muted-foreground">App Usage</span>
                    <span className="text-sm font-medium">Daily Credits</span>
                  </div>
                  <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-bold
                    ${isAtLimit ? 'bg-destructive/10 text-destructive border-destructive/20' 
                      : isNearLimit ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' 
                      : 'bg-primary/10 text-primary border-primary/20'}`}
                  >
                    <Sparkles className="h-3 w-3" />
                    {dailyUsage} / {usageLimit}
                  </div>
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
        <DialogContent className="sm:max-w-md">
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
        <DialogContent className="sm:max-w-md">
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

      <div className="absolute bottom-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary to-transparent animate-gradient-x opacity-70"></div>
    </nav >
  );
}
