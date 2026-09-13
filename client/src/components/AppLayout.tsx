import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { useSidebar } from "@/context/SidebarContext";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useLocation } from "wouter";
import { useEffect } from "react";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { isOpen, isMobileOpen, closeMobile } = useSidebar();
  const [location] = useLocation();

  // Automatically close mobile sidebar whenever route changes
  useEffect(() => {
    closeMobile();
  }, [location, closeMobile]);

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row w-full max-w-full overflow-x-hidden">
      {/* Desktop Sidebar (hidden on mobile) */}
      <div className="hidden md:block shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Drawer Sidebar */}
      <Sheet open={isMobileOpen} onOpenChange={(openState) => !openState && closeMobile()}>
        <SheetContent side="left" className="p-0 w-64 border-r border-border bg-card md:hidden [&>button]:hidden">
          <Sidebar isMobileDrawer />
        </SheetContent>
      </Sheet>

      {/* Main Content Area */}
      <div 
        className={`flex-1 flex flex-col min-w-0 max-w-full overflow-x-hidden transition-all duration-300 ${
          isOpen ? "md:pl-64" : "md:pl-16"
        }`}
      >
        <Navbar />
        <div className="flex-1 flex flex-col justify-between min-h-[calc(100vh-5rem)] pt-20 sm:pt-24 min-w-0 w-full max-w-full overflow-x-hidden">
          {children}
        </div>
      </div>
    </div>
  );
}
