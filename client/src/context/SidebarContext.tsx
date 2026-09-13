import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface SidebarContextType {
  // Desktop sidebar expand/collapse state
  isOpen: boolean;
  isExpanded: boolean;
  toggle: () => void;
  close: () => void;
  open: () => void;

  // Mobile drawer state
  isMobileOpen: boolean;
  toggleMobile: () => void;
  closeMobile: () => void;
  openMobile: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  // Desktop state: Load from localStorage, default to true (expanded)
  const [isOpen, setIsOpen] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem("sidebar_open");
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  // Mobile drawer state: default to false (closed), never persisted
  const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false);

  useEffect(() => {
    try {
      localStorage.setItem("sidebar_open", JSON.stringify(isOpen));
    } catch (e) {
      // ignore
    }
  }, [isOpen]);

  // If resized to desktop, ensure mobile drawer is closed
  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== "undefined" && window.innerWidth >= 768) {
        setIsMobileOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggle = useCallback(() => setIsOpen((prev: boolean) => !prev), []);
  const close = useCallback(() => setIsOpen(false), []);
  const open = useCallback(() => setIsOpen(true), []);

  const toggleMobile = useCallback(() => setIsMobileOpen((prev: boolean) => !prev), []);
  const closeMobile = useCallback(() => setIsMobileOpen(false), []);
  const openMobile = useCallback(() => setIsMobileOpen(true), []);


  return (
    <SidebarContext.Provider
      value={{
        isOpen,
        isExpanded: isOpen,
        toggle,
        close,
        open,
        isMobileOpen,
        toggleMobile,
        closeMobile,
        openMobile,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}

