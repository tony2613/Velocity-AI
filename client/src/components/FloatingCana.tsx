import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Loader2, Sparkles, BrainCircuit, ArrowRight, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface AIResult {
  provider: string;
  content: string;
  error?: string;
}

export default function FloatingCana() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const researchMutation = useMutation({
    mutationFn: async (searchQuery: string) => {
      const res = await apiRequest("POST", "/api/research", { query: searchQuery });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to research");
      return data.results as AIResult[];
    },
    onError: (error: Error) => {
      toast({
        title: "CANA Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    researchMutation.mutate(query);
  };

  const result = researchMutation.data?.[0];

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
        setIsOpen((prev) => !prev);
      }
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Read URL query parameter in case they were redirected here previously
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const canaQuery = params.get("cana");
    if (canaQuery) {
      setQuery(decodeURIComponent(canaQuery));
      setIsOpen(true);
      researchMutation.mutate(decodeURIComponent(canaQuery));
      window.history.replaceState({}, document.title, window.location.pathname);
    }
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

      {/* Main Floating Component */}
      <div 
        className={`fixed z-[101] left-1/2 -translate-x-1/2 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] max-h-[85dvh] overflow-hidden flex flex-col w-[90%] ${
          isOpen 
            ? "top-[12dvh] sm:top-[15dvh] max-w-3xl scale-100" 
            : "top-[calc(100dvh-4.5rem)] max-w-md cursor-pointer hover:scale-105"
        }`}
      >
        {/* Search Input Container */}
        <div 
          onClick={() => !isOpen && setIsOpen(true)}
          className={`relative bg-background/60 backdrop-blur-xl border flex items-center shadow-2xl transition-all duration-500 ${
            isOpen 
              ? "rounded-2xl border-primary/40 shadow-primary/20 ring-1 ring-primary/20 p-2" 
              : "rounded-full border-primary/20 p-1.5"
          }`}
        >
          {isOpen ? (
            <form onSubmit={handleSearch} className="flex gap-2 w-full">
              <div className="flex items-center pl-4">
                <BrainCircuit className="h-6 w-6 text-primary animate-pulse" />
              </div>
              <Input
                ref={inputRef}
                placeholder="Ask CANA... It searches all your notes."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 border-0 bg-transparent text-lg focus-visible:ring-0 px-2 py-6 text-foreground placeholder:text-muted-foreground/70"
                disabled={researchMutation.isPending}
              />
              {query && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setQuery("");
                    inputRef.current?.focus();
                  }}
                  className="h-10 w-10 shrink-0 text-muted-foreground hover:text-foreground rounded-full mr-1"
                >
                  <X className="h-5 w-5" />
                </Button>
              )}
              <Button 
                type="submit" 
                size="icon"
                disabled={researchMutation.isPending || !query.trim()}
                className="h-12 w-12 rounded-xl bg-primary hover:bg-primary/90 shrink-0"
              >
                {researchMutation.isPending ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <ArrowRight className="h-5 w-5" />
                )}
              </Button>
            </form>
          ) : (
            // Idle State View (Pill)
            <div className="flex items-center px-4 py-2 w-full gap-3 text-muted-foreground">
              <Search className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">Ask CANA...</span>
              <div className="ml-auto hidden sm:flex items-center gap-1 opacity-60">
                <kbd className="bg-muted px-1.5 py-0.5 rounded text-[10px] uppercase font-mono border">⌘</kbd>
                <kbd className="bg-muted px-1.5 py-0.5 rounded text-[10px] uppercase font-mono border">K</kbd>
              </div>
            </div>
          )}
        </div>

        {/* Results Container (Only shows when Open) */}
        {isOpen && result && (
          <div className="mt-4 animate-in fade-in slide-in-from-top-4 duration-500 flex-1 overflow-y-auto custom-scrollbar">
            <Card className="border-primary/20 bg-background/90 backdrop-blur-2xl shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-50 z-0"></div>
              
              <CardHeader className="py-4 border-b bg-primary/5 relative z-10 sticky top-0 backdrop-blur-xl">
                <CardTitle className="text-sm font-bold flex items-center justify-between">
                  <div className="flex items-center gap-2 text-primary">
                    <Sparkles className="w-4 h-4" />
                    CANA AI Results
                  </div>
                  <div className="text-xs font-semibold px-2 py-1 bg-background rounded-full border text-muted-foreground">
                    Using Context: My Notes
                  </div>
                </CardTitle>
              </CardHeader>
              
              <CardContent className="p-6 relative z-10">
                {result.error ? (
                  <div className="p-4 bg-destructive/10 text-destructive rounded-lg border border-destructive/20 text-sm font-medium">
                    {result.error}
                  </div>
                ) : (
                  <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none text-foreground/90 pb-8">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        h1: ({ children }) => <h1 className="text-xl font-bold mt-4 mb-2">{children}</h1>,
                        h2: ({ children }) => <h2 className="text-lg font-bold mt-4 mb-2 text-foreground/90">{children}</h2>,
                        h3: ({ children }) => <h3 className="text-base font-bold mt-3 mb-1 text-foreground/85">{children}</h3>,
                        strong: ({ children }) => <strong className="font-extrabold text-primary">{children}</strong>,
                        ul: ({ children }) => <ul className="list-disc pl-5 my-2 space-y-1">{children}</ul>,
                        ol: ({ children }) => <ol className="list-decimal pl-5 my-2 space-y-1">{children}</ol>,
                        table: ({ children }) => (
                          <div className="overflow-x-auto my-4 rounded-lg border bg-background">
                            <table className="w-full text-sm text-left">{children}</table>
                          </div>
                        ),
                        thead: ({ children }) => <thead className="bg-muted/50 border-b">{children}</thead>,
                        tbody: ({ children }) => <tbody>{children}</tbody>,
                        tr: ({ children }) => <tr className="border-b last:border-0">{children}</tr>,
                        th: ({ children }) => <th className="px-3 py-2 font-semibold border-r last:border-0">{children}</th>,
                        td: ({ children }) => <td className="px-3 py-2 border-r last:border-0">{children}</td>,
                        code: ({ inline, children }: any) =>
                          inline ? (
                            <code className="bg-primary/10 text-primary px-1 rounded text-xs font-mono">{children}</code>
                          ) : (
                            <pre className="bg-[#1e1e1e] text-gray-300 p-3 rounded-lg overflow-x-auto text-xs font-mono my-3">{children}</pre>
                          ),
                        blockquote: ({ children }) => (
                          <blockquote className="border-l-2 border-primary/50 pl-3 italic text-foreground/70 my-2">{children}</blockquote>
                        ),
                      }}
                    >
                      {result.content}
                    </ReactMarkdown>
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
