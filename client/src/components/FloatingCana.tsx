import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Loader2, Sparkles, BrainCircuit, ArrowRight, X, MessageSquare, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { PLAN_LIMITS } from "@shared/plans";
import { useLocation } from "wouter";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface CanaChat {
  id: string;
  userId: string;
  title: string;
  messages: ChatMessage[];
}

export default function FloatingCana() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<"chat" | "topics">("chat");
  const [activeChat, setActiveChat] = useState<CanaChat | null>(null);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  // Route Denylist - completely unmount CANA on these routes
  if (location.startsWith("/auth") || location.startsWith("/quiz/")) {
    return null;
  }

  const chatMutation = useMutation({
    mutationFn: async (searchQuery: string) => {
      const res = await apiRequest("POST", "/api/cana/chat", { 
        query: searchQuery, 
        mode,
        chatId: activeChat?.id 
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to chat");
      return data;
    },
    onError: (error: Error) => {
      toast({
        title: "CANA Failed",
        description: error.message,
        variant: "destructive",
      });
    },
    onSuccess: (data) => {
      setActiveChat(data.chat);
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/cana/chats"] });
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    // Optimistically add user message
    if (activeChat) {
      setActiveChat({
        ...activeChat,
        messages: [...activeChat.messages, { role: "user", content: query }]
      });
    } else {
      setActiveChat({
        id: "",
        userId: user?.id || "",
        title: "New Chat",
        messages: [{ role: "user", content: query }]
      });
    }

    chatMutation.mutate(query);
    setQuery("");
  };

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activeChat?.messages, chatMutation.isPending]);

  // Focus input automatically when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Handle keyboard shortcut (Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen(true);
        setTimeout(() => inputRef.current?.focus(), 50);
      }
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Expose a global way to open a specific chat ID (useful for the Navbar history)
  useEffect(() => {
    const handleOpenChat = (e: CustomEvent<{chatId: string}>) => {
      setIsOpen(true);
      fetch(`/api/cana/chats/${e.detail.chatId}`)
        .then(res => res.json())
        .then(chat => setActiveChat(chat))
        .catch(console.error);
    };
    window.addEventListener('open-cana-chat', handleOpenChat as EventListener);
    return () => window.removeEventListener('open-cana-chat', handleOpenChat as EventListener);
  }, []);

  return (
    <>
      {/* Dark Overlay Background */}
      <div 
        className={`fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm transition-all duration-500 ease-out ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsOpen(false)}
      />

      {/* Main Floating Component Anchored Bottom */}
      <div 
        id="tut-cana"
        className={`fixed z-[101] left-1/2 -translate-x-1/2 transition-all duration-500 ease-out flex flex-col-reverse w-[90%] bottom-4 ${
          isOpen 
            ? "max-w-3xl scale-100" 
            : "max-w-md cursor-pointer hover:scale-105"
        }`}
      >
        {/* Search Input Container */}
        <div 
          onClick={() => !isOpen && setIsOpen(true)}
          className={`relative glass-panel border flex flex-col shadow-2xl transition-all duration-500 z-20 ${
            isOpen 
              ? "rounded-2xl border-primary/40 shadow-primary/20 ring-1 ring-primary/20 p-3" 
              : "rounded-full border-primary/20 p-1.5 flex-row items-center"
          }`}
        >
          {isOpen && (
            <div className="flex items-center justify-between mb-3 px-2">
              <div className="flex bg-muted/50 p-1 rounded-lg">
                <button
                  onClick={(e) => { e.stopPropagation(); setMode("chat"); }}
                  className={`px-3 py-1.5 text-xs font-medium flex items-center gap-2 rounded-md transition-all ${mode === "chat" ? "bg-background shadow text-primary" : "text-muted-foreground hover:text-foreground"}`}
                >
                  <MessageSquare className="h-3.5 w-3.5" /> Conversational Chat
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setMode("topics"); }}
                  className={`px-3 py-1.5 text-xs font-medium flex items-center gap-2 rounded-md transition-all ${mode === "topics" ? "bg-background shadow text-primary" : "text-muted-foreground hover:text-foreground"}`}
                >
                  <BookOpen className="h-3.5 w-3.5" /> Search My Notes
                </button>
              </div>
              
              <div className="flex items-center gap-2">
                {user && user.subscriptionTier === 'elite' && (
                  <div className="text-[10px] font-medium text-muted-foreground bg-background px-2 py-0.5 rounded border">
                    {Math.max(0, PLAN_LIMITS.elite.searchLimit - (user.monthlySearchCount || 0))} / {PLAN_LIMITS.elite.searchLimit} queries
                  </div>
                )}
                <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full" onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {isOpen ? (
            <form onSubmit={handleSearch} className="flex gap-2 w-full items-center">
              <div className="flex items-center pl-2">
                <BrainCircuit className="h-6 w-6 text-primary animate-pulse" />
              </div>
              <Input
                ref={inputRef}
                placeholder={mode === "chat" ? "Ask CANA anything..." : "Search your notes for a specific topic..."}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 border-0 bg-transparent text-base sm:text-lg focus-visible:ring-0 px-2 py-6 text-foreground placeholder:text-muted-foreground/70"
                disabled={chatMutation.isPending}
              />
              <Button 
                type="submit" 
                size="icon"
                disabled={chatMutation.isPending || !query.trim()}
                className="h-12 w-12 rounded-xl bg-primary hover:bg-primary/90 shrink-0"
              >
                {chatMutation.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <ArrowRight className="h-5 w-5" />}
              </Button>
            </form>
          ) : (
            // Idle State View (Pill)
            <div className="flex items-center px-4 py-2 w-full gap-3 text-muted-foreground">
              <Search className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">Ask CANA...</span>
            </div>
          )}
        </div>

        {/* Chat History Container (Grows upward) */}
        {isOpen && activeChat?.messages && activeChat.messages.length > 0 && (
          <div className="mb-4 animate-in fade-in slide-in-from-bottom-4 duration-500 z-10">
            <Card className="glass-panel-heavy border-primary/20 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-50 z-0"></div>
              
              <CardContent ref={scrollRef} className="p-6 relative z-10 max-h-[60vh] overflow-y-auto custom-scrollbar flex flex-col gap-4">
                {activeChat.messages.map((msg, i) => (
                  <div key={i} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                      msg.role === 'user' 
                        ? 'bg-primary text-primary-foreground rounded-tr-sm' 
                        : 'bg-muted border rounded-tl-sm'
                    }`}>
                      {msg.role === 'user' ? (
                        <p className="text-sm">{msg.content}</p>
                      ) : (
                        <div className="prose prose-sm dark:prose-invert max-w-none text-foreground/90">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              p: ({children}) => <p className="mb-2 last:mb-0">{children}</p>,
                              a: ({children, href}) => <a href={href} className="text-primary font-medium hover:underline">{children}</a>,
                              code: ({ inline, children }: any) => inline 
                                ? <code className="bg-primary/10 text-primary px-1 rounded text-xs font-mono">{children}</code>
                                : <pre className="bg-[#1e1e1e] text-gray-300 p-3 rounded-lg overflow-x-auto text-xs font-mono my-3">{children}</pre>
                            }}
                          >
                            {msg.content}
                          </ReactMarkdown>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {chatMutation.isPending && (
                  <div className="flex w-full justify-start">
                    <div className="max-w-[85%] bg-muted border rounded-2xl rounded-tl-sm px-4 py-3 flex gap-2 items-center text-muted-foreground">
                      <Sparkles className="h-4 w-4 animate-pulse text-primary" />
                      <span className="text-sm">CANA is thinking...</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </>
  );
}
