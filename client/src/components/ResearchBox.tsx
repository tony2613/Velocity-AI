import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Loader2, Sparkles, BrainCircuit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useEffect } from "react";

interface AIResult {
  provider: string;
  content: string;
  error?: string;
}

export default function ResearchBox() {
  const [query, setQuery] = useState("");
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

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const canaQuery = params.get("cana");
    if (canaQuery) {
      setQuery(canaQuery);
      researchMutation.mutate(canaQuery);
      // Clean up URL without reloading
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const result = researchMutation.data?.[0]; // Fetch the singular CANA result

  return (
    <div className="w-full space-y-4 mb-8">
      <div className="flex items-center gap-2 mb-2 px-1">
        <BrainCircuit className="h-6 w-6 text-primary" />
        <h2 className="text-xl font-semibold opacity-90">CANA</h2>
      </div>
      <form onSubmit={handleSearch} className="flex gap-3">
        <Input
          placeholder="Ask CANA any query. It searches your uploaded notes for the exact answer!"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 text-lg py-7 px-6 rounded-3xl shadow-sm focus-visible:ring-primary/50 border-primary/20 bg-background/50 backdrop-blur transition-all focus:border-primary/50"
          disabled={researchMutation.isPending}
        />
        <Button 
          type="submit" 
          disabled={researchMutation.isPending || !query.trim()}
          className="h-auto px-8 rounded-3xl shadow-md text-base bg-primary hover:bg-primary/90 transition-all active:scale-95"
        >
          {researchMutation.isPending ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            <>
              <Search className="h-5 w-5 mr-2" />
              Ask CANA
            </>
          )}
        </Button>
      </form>

      {result && (
        <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Card className="overflow-hidden border-primary/30 shadow-2xl bg-gradient-to-b from-card/90 to-card/50 backdrop-blur-xl">
            <CardHeader className="bg-primary/10 py-5 border-b border-primary/20 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-transparent opacity-50"></div>
              <CardTitle className="text-xl font-bold flex items-center justify-between w-full relative z-10">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/20 rounded-full">
                    <Sparkles className="w-6 h-6 text-primary" />
                  </div>
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
                    CANA Response
                  </span>
                </div>
                <div className="text-xs font-medium px-3 py-1 bg-background/50 rounded-full border border-primary/10 text-muted-foreground">
                  Context-Aware Assitant
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              {result.error ? (
                <div className="p-5 bg-destructive/10 text-destructive rounded-xl border border-destructive/20 text-sm font-medium flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-destructive animate-pulse"></div>
                  {result.error}
                </div>
              ) : (
                <div className="prose prose-base sm:prose-lg dark:prose-invert max-w-none leading-relaxed text-foreground/90 selection:bg-primary/20 selection:text-primary">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      h1: ({ children }) => <h1 className="text-2xl font-black mt-6 mb-4 text-foreground/95 tracking-tight border-b pb-2">{children}</h1>,
                      h2: ({ children }) => <h2 className="text-xl font-bold mt-5 mb-3 text-foreground/90">{children}</h2>,
                      h3: ({ children }) => <h3 className="text-lg font-bold mt-4 mb-2 text-foreground/85">{children}</h3>,
                      strong: ({ children }) => <strong className="font-extrabold text-primary/90">{children}</strong>,
                      ul: ({ children }) => <ul className="list-disc pl-6 my-4 space-y-2 marker:text-primary/70">{children}</ul>,
                      ol: ({ children }) => <ol className="list-decimal pl-6 my-4 space-y-2 marker:text-primary/70">{children}</ol>,
                      li: ({ children }) => <li className="text-foreground/80">{children}</li>,
                      p: ({ children }) => <p className="my-4 leading-7 text-foreground/80">{children}</p>,
                      table: ({ children }) => (
                        <div className="overflow-hidden rounded-xl border border-border/50 my-6 bg-background/50 shadow-sm">
                          <div className="overflow-x-auto">
                            <table className="w-full border-collapse text-sm text-left">{children}</table>
                          </div>
                        </div>
                      ),
                      thead: ({ children }) => <thead className="bg-primary/5 uppercase text-xs font-semibold tracking-wider text-muted-foreground">{children}</thead>,
                      tbody: ({ children }) => <tbody>{children}</tbody>,
                      tr: ({ children }) => <tr className="border-b border-border/50 last:border-0 hover:bg-muted/10 transition-colors">{children}</tr>,
                      th: ({ children }) => (
                        <th className="px-4 py-3 border-r border-border/50 last:border-0">{children}</th>
                      ),
                      td: ({ children }) => (
                        <td className="px-4 py-3 border-r border-border/50 last:border-0 tabular-nums">{children}</td>
                      ),
                      code: ({ inline, children }: any) =>
                        inline ? (
                          <code className="bg-primary/10 text-primary px-1.5 py-0.5 rounded-md text-sm font-mono border border-primary/20">{children}</code>
                        ) : (
                          <pre className="bg-[#1e1e1e] text-gray-300 p-4 rounded-xl overflow-x-auto text-sm font-mono my-6 shadow-inner border border-white/10">{children}</pre>
                        ),
                      blockquote: ({ children }) => (
                        <blockquote className="border-l-4 border-primary bg-primary/5 p-4 rounded-r-xl italic text-foreground/80 my-5 shadow-sm">{children}</blockquote>
                      ),
                      hr: () => <hr className="border-border/60 my-8" />,
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
  );
}
