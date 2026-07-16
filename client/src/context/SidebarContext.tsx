import React, { createContext, useContext, useState, useEffect } from 'react';

interface SidebarContextType {
  isOpen: boolean;
  toggle: () => void;
  close: () => void;
  open: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  // Load state from localStorage, default to true (expanded)
  const [isOpen, setIsOpen] = useState(() => {
    try {
      const saved = localStorage.getItem("sidebar_open");
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("sidebar_open", JSON.stringify(isOpen));
    } catch (e) {
      // ignore
    }
  }, [isOpen]);

  const toggle = () => setIsOpen(!isOpen);
  const close = () => setIsOpen(false);
  const open = () => setIsOpen(true);

  return (
    <SidebarContext.Provider value={{ isOpen, toggle, close, open }}>
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
