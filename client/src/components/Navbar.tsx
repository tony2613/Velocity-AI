import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Search, X, Loader2, Menu, LogOut, User as UserIcon, Settings as SettingsIcon, Upload, ArrowRight, Sparkles, ExternalLink } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
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

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [question, setQuestion] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [selectedResult, setSelectedResult] = useState<any | null>(null);
  const setLastSearchedQuestion = (_v: string) => { }; // kept for onSuccess call — value unused

  const searchQuestionMutation = useMutation({
    mutationFn: async (q: string) => {
      const res = await fetch("/api/search-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to search");
      }
      return res.json();
    },
    onSuccess: (data) => {
      setSearchResults(data.results || []);
      setShowResults(true);
      setLastSearchedQuestion(question);
    },
    onError: (error: Error) => {
      toast({
        title: t("error.search_failed"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const handleResultClick = (result: any) => {
    window.open(result.link, "_blank");
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

          {/* Desktop Search */}
          {user && (
            <div className="hidden lg:flex flex-1 max-w-lg mx-8 items-center">
              <div className="relative w-full group">
                <div className="relative flex items-center">
                  <Input
                    placeholder={t("nav.search_placeholder")}
                    className="w-full pl-11 pr-12 h-11 rounded-full bg-muted/30 focus:bg-background/80"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && question.trim()) {
                        searchQuestionMutation.mutate(question);
                      }
                    }}
                  />
                  <Search className="absolute left-4 h-5 w-5 text-muted-foreground/60" />
                  <div className="absolute right-1.5 flex items-center gap-1">
                    {question.trim() && (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 rounded-full"
                        onClick={() => setQuestion("")}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      size="icon"
                      variant="default"
                      className="h-8 w-8 rounded-full"
                      onClick={() => {
                        if (question.trim()) {
                          searchQuestionMutation.mutate(question);
                        }
                      }}
                      disabled={searchQuestionMutation.isPending || !question.trim()}
                    >
                      {searchQuestionMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Search className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {showResults && searchResults.length > 0 && (
                  <div className="absolute top-full mt-3 w-full bg-background/95 border border-primary/20 rounded-2xl shadow-xl p-3 z-50 backdrop-blur-xl">
                    <div className="flex items-center justify-between px-3 mb-3">
                      <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">{t("nav.ai_insights")}</span>
                      <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full" onClick={() => setShowResults(false)}>
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="space-y-1 max-h-[400px] overflow-y-auto custom-scrollbar">
                      {searchResults.map((result, index) => (
                        <div
                          key={index}
                          className="p-4 hover:bg-primary/5 rounded-xl cursor-pointer transition-all border border-transparent hover:border-primary/20"
                          onClick={() => handleResultClick(result)}
                        >
                          <div className="flex items-center justify-between gap-3 mb-2">
                            <h5 className="font-bold text-sm text-primary leading-tight">{result.title}</h5>
                            <ExternalLink className="h-3.5 w-3.5 text-primary opacity-70" />
                          </div>
                          <p className="text-xs text-muted-foreground/90 line-clamp-3 leading-relaxed">{result.snippet}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Right Side Actions */}
          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-2">
              <ThemeToggle />
              {user ? (
                <>
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
              <Sheet open={showMobileSearch} onOpenChange={setShowMobileSearch}>
                <SheetContent side="top" className="w-full p-0 bg-background/95 backdrop-blur-xl border-b z-50">
                  <div className="flex flex-col h-[50vh]">
                    <SheetHeader className="sr-only">
                      <SheetTitle>Search</SheetTitle>
                    </SheetHeader>
                    <div className="flex items-center gap-2 h-16 px-4 border-b shrink-0">
                      <form
                        className="flex-1 relative group"
                        onSubmit={(e) => {
                          e.preventDefault();
                          if (question.trim()) {
                            searchQuestionMutation.mutate(question);
                          }
                        }}
                      >
                        <Input
                          placeholder={t("nav.search_placeholder")}
                          className="h-10 pl-10 rounded-full w-full"
                          value={question}
                          onChange={(e) => setQuestion(e.target.value)}
                          autoFocus
                        />
                        <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground/60" />
                        <button
                          type="submit"
                          className="absolute right-1.5 top-1.5 p-1.5 rounded-full hover:bg-primary/10 text-primary"
                        >
                          {searchQuestionMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <ArrowRight className="h-4 w-4" />
                          )}
                        </button>
                      </form>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4">
                      {searchResults.map((result, index) => (
                        <div
                          key={index}
                          className="p-4 bg-card/50 border border-border/50 rounded-xl mb-3"
                          onClick={() => handleResultClick(result)}
                        >
                          <h5 className="font-bold text-sm mb-1">{result.title}</h5>
                          <p className="text-xs text-muted-foreground line-clamp-3">{result.snippet}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>

              {user && (
                <Button variant="ghost" size="icon" onClick={() => setShowMobileSearch(true)}>
                  <Search className="h-5 w-5" />
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

      <Dialog open={!!selectedResult} onOpenChange={(open) => !open && setSelectedResult(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedResult?.title}</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <p>{selectedResult?.snippet}</p>
            {selectedResult?.link && (
              <Button onClick={() => window.open(selectedResult.link, "_blank")} className="mt-4">
                Read More <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <div className="absolute bottom-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary to-transparent animate-gradient-x opacity-70"></div>
    </nav >
  );
}
