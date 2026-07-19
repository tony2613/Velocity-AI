import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { useSidebar } from "@/context/SidebarContext";
import { Sheet, SheetContent } from "@/components/ui/sheet";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { isOpen, close } = useSidebar();

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row w-full max-w-full overflow-x-hidden">
      {/* Desktop Sidebar (hidden on mobile) */}
      <div className="hidden md:block shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Drawer Sidebar */}
      <Sheet open={isOpen} onOpenChange={(openState) => !openState && close()}>
        <SheetContent side="left" className="p-0 w-64 border-r border-border bg-card">
          <Sidebar />
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
