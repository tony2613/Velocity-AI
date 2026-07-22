import { Link, useLocation } from "wouter";
import { useSidebar } from "@/context/SidebarContext";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Home, BookOpen, BrainCircuit, Settings, ChevronsLeft, Menu, LogOut, Sparkles, Flame } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useQuery } from "@tanstack/react-query";
import { PLAN_LIMITS } from "@shared/plans";
import ThemeToggle from "./ThemeToggle";
import velocityLogo from "../assets/Velocity-AI-logo.png";

export default function Sidebar() {
  const [location, setLocation] = useLocation();
  const { isOpen, toggle, close } = useSidebar();
  const { user, logoutMutation } = useAuth();
  const { t } = useLanguage();

  const isFreeTier = user?.subscriptionTier === "free";

  // Tier credits remaining calculations
  const tier = (user?.subscriptionTier || 'free') as 'free' | 'pro' | 'elite';
  const usageLimit = PLAN_LIMITS[tier]?.uploadLimit ?? 5;
  const dailyUsage = user?.dailyUploadCount || 0;
  const isNearLimit = dailyUsage >= usageLimit - 1;
  const isAtLimit = dailyUsage >= usageLimit;

  // CANA past chats query
  const { data: canaChats } = useQuery<any[]>({
    queryKey: ["/api/cana/chats"],
    enabled: !!user
  });

  const upperMenuItems = [
    {
      label: t("nav.dashboard") || "Dashboard",
      path: "/dashboard",
      icon: Home
    },
    {
      label: "Study Guides",
      path: "/notes",
      icon: BookOpen
    },
    {
      label: t("nav.quizzes") || "Quizzes",
      path: "/quizzes",
      icon: BrainCircuit
    }
  ];

  return (
    <aside 
      className={`fixed left-0 top-0 bottom-0 z-50 h-screen transition-all duration-300 ease-in-out border-r border-border bg-card dark:bg-[#33415c] flex flex-col justify-between select-none ${
        isOpen ? "w-64" : "w-16"
      }`}
    >
      {/* Top Branding Section */}
      <div className="flex flex-col min-h-0 flex-1">
        <div className={`flex items-center h-16 px-4 border-b border-border shrink-0 ${
          isOpen ? "justify-between" : "justify-center"
        }`}>
          {isOpen ? (
            <Link href="/dashboard" className="flex items-center gap-2 cursor-pointer">
              <img src={velocityLogo} alt="VelocityAI Logo" className="h-7 w-7" />
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-primary to-indigo-400 bg-clip-text text-transparent">
                VelocityAI
              </span>
            </Link>
          ) : (
            <button 
              onClick={toggle} 
              className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-muted text-muted-foreground transition-colors"
              title="Expand Sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>
          )}

          {isOpen && (
            <button 
              onClick={toggle}
              className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-muted text-muted-foreground transition-colors"
              title="Collapse Sidebar"
            >
              <ChevronsLeft className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Navigation & Stats Scroll Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-4 min-h-0">
          {/* Upper Nav Links */}
          <nav className="space-y-1">
            {upperMenuItems.map((item) => {
              const isActive = location === item.path || (item.path !== "/dashboard" && location.startsWith(item.path));
              const Icon = item.icon;

              return (
                <Link key={item.path} href={item.path} onClick={() => !isOpen && toggle()}>
                  <div 
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer font-medium text-sm transition-all group ${
                      isActive 
                        ? "bg-primary/10 text-primary" 
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    }`}
                    title={!isOpen ? item.label : undefined}
                  >
                    <Icon className={`h-5 w-5 shrink-0 transition-transform ${
                      isActive ? "text-primary scale-110" : "group-hover:scale-110"
                    }`} />
                    {isOpen && <span className="truncate">{item.label}</span>}
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* Transferred widgets - only visible when expanded */}
          {isOpen && user && (
            <div className="space-y-4 pt-4 border-t border-border/50">
              {/* Study Streak */}
              <div className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-500">
                <div className="flex items-center gap-2">
                  <Flame className="h-4 w-4 animate-pulse" />
                  <span className="text-xs font-semibold">Study Streak</span>
                </div>
                <span className="text-xs font-bold">{user.streakCount || 0} days</span>
              </div>

              {/* Upload Limit Progress */}
              <div 
                className="flex flex-col gap-1.5 p-3 rounded-xl bg-muted/40 border border-border/40 cursor-pointer transition-colors hover:bg-muted/60"
                onClick={() => setLocation('/pricing')}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Document Uploads</span>
                  <div className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-full border text-[10px] font-bold
                    ${isAtLimit ? 'bg-destructive/10 text-destructive border-destructive/20' 
                      : isNearLimit ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' 
                      : 'bg-primary/10 text-primary border-primary/20'}`}
                  >
                    <Sparkles className="h-2.5 w-2.5" />
                    {dailyUsage}/{usageLimit}
                  </div>
                </div>
                <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${isAtLimit ? 'bg-destructive' : isNearLimit ? 'bg-amber-500' : 'bg-primary'}`}
                    style={{ width: `${Math.min(100, (dailyUsage / usageLimit) * 100)}%` }}
                  />
                </div>
                <span className="text-[10px] text-muted-foreground">{usageLimit - dailyUsage} uploads left today</span>
              </div>

              {/* CANA History List */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-1">CANA History</span>
                <div className="flex flex-col gap-1 max-h-36 overflow-y-auto custom-scrollbar pr-1">
                  {canaChats?.length ? canaChats.map((chat: any) => (
                    <button 
                      key={chat.id}
                      className="text-left text-xs text-foreground/80 hover:bg-muted/50 hover:text-foreground px-2 py-1.5 rounded-lg truncate transition-colors"
                      onClick={() => {
                        close();
                        window.dispatchEvent(new CustomEvent('open-cana-chat', { detail: { chatId: chat.id } }));
                      }}
                    >
                      {chat.title}
                    </button>
                  )) : (
                    <div className="text-[11px] text-muted-foreground px-2 italic">No past chats</div>
                  )}
                </div>
              </div>

              {/* Appearance / Theme Switcher */}
              <div className="flex items-center justify-between px-3 py-1 bg-muted/20 border border-border/30 rounded-xl">
                <span className="text-xs font-semibold text-muted-foreground">{t("nav.appearance") || "Appearance"}</span>
                <ThemeToggle />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Section - Settings, Upgrade & User Profile */}
      <div className="p-3 border-t border-border shrink-0 flex flex-col gap-2 bg-card">
        {/* Upgrade Banner for Free Users */}
        {isOpen && isFreeTier && (
          <Link href="/pricing">
            <Button className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-lg shadow-indigo-500/10 font-semibold py-4 rounded-xl text-xs transition-all hover:scale-[1.02] flex items-center justify-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" />
              Upgrade to Premium
            </Button>
          </Link>
        )}

        {/* Settings Navigation Link - Placed right above profile */}
        <Link href="/settings">
          <div 
            className={`flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer font-medium text-sm transition-all group ${
              location === "/settings" 
                ? "bg-primary/10 text-primary" 
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            }`}
            title={!isOpen ? "Settings" : undefined}
          >
            <Settings className={`h-5 w-5 shrink-0 transition-transform ${
              location === "/settings" ? "text-primary scale-110" : "group-hover:scale-110"
            }`} />
            {isOpen && <span className="truncate">Settings</span>}
          </div>
        </Link>

        {/* User Card */}
        {user && (
          <div className={`flex items-center ${
            isOpen ? "justify-between gap-3 px-2 py-1.5 rounded-xl bg-muted/30 border border-border/40" : "justify-center py-1"
          }`}>
            <Link href="/settings" className="flex items-center gap-3 cursor-pointer min-w-0 flex-1">
              <Avatar className="h-9 w-9 border border-primary/20 shrink-0">
                <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.username}`} alt={user.username} />
                <AvatarFallback>{user.username.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              {isOpen && (
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-semibold truncate text-foreground leading-tight">{user.username}</span>
                  <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider truncate">
                    {user.subscriptionTier || "Free"} Plan
                  </span>
                </div>
              )}
            </Link>

            {isOpen && (
              <button 
                onClick={() => logoutMutation.mutate()} 
                className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors shrink-0"
                title={t("nav.logout") || "Log Out"}
              >
                <LogOut className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
