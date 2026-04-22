import React, { useState, useCallback } from "react";
import { useParams, Link } from "wouter";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ArrowLeft, Sparkles, Loader2, FileText, Info, ListChecks, Search, Copy, Check } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";
import type { Note, Summary } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function CopyButton({ getText }: { getText: () => string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      const text = getText();
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const text = getText();
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [getText]);

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleCopy}
      className="gap-1.5 text-xs transition-all"
      data-testid="button-copy"
    >
      {copied ? (
        <>
          <Check className="h-3.5 w-3.5 text-green-500" />
          Copied!
        </>
      ) : (
        <>
          <Copy className="h-3.5 w-3.5" />
          Copy
        </>
      )}
    </Button>
  );
}

export default function SummaryView() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("full");

  const { data: note, isLoading: noteLoading } = useQuery<Note>({
    queryKey: [`/api/notes/${id}`],
  });

  const { data: summary, isLoading: summaryLoading, error } = useQuery<Summary & { topicExplanations?: Record<string, string> }>({
    queryKey: [`/api/notes/${id}/summary`],
    enabled: !!id,
    retry: false,
  });

  const generateSummaryMutation = useMutation({
    mutationFn: async () => {
      const language = localStorage.getItem("velocity_language") || "English";
      const preferredModel = localStorage.getItem("velocity_model") || "llama-3.3-70b-versatile";
      
      const response = await fetch(`/api/notes/${id}/summary`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language, preferredModel })
      });
      
      if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || errorData.error || "Failed to generate summary");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/notes/${id}/summary`] });
      toast({
        title: "Summary generated!",
        description: "Your AI-powered summary is ready.",
      });
    },
    onError: (error: Error) => {
      const isGroqRateLimit = error.message?.includes("__GROQ_RATE_LIMIT__");
      const isPlanLimit = error.message?.toLowerCase().includes("daily usage limit") || error.message?.toLowerCase().includes("upgrade your plan");
      
      const cleanMessage = error.message?.replace("__GROQ_RATE_LIMIT__: ", "");
      
      toast({
        title: isGroqRateLimit ? "Service Busy" : isPlanLimit ? "Plan Limit Reached" : "Generation Failed",
        description: cleanMessage,
        variant: "destructive",
      });
    },
  });

  const getSection = (content: string, sectionName: string) => {
    if (!content) return "";
    const name = sectionName.toLowerCase();
    const lowerContent = content.toLowerCase();
    
    // Standardized keywords from the AI prompt
    const kwOverview = "overview";
    const kwSolution = "lesson_and_solution";
    const kwLesson = "lesson"; // alternative
    const kwTakeaways = "takeaways";
    const kwKeyPoint = "key point";

    // Find indices
    const idxOverview = lowerContent.indexOf(kwOverview);
    const idxSolution = lowerContent.indexOf(kwSolution) !== -1 
        ? lowerContent.indexOf(kwSolution) 
        : lowerContent.indexOf(kwLesson);
    const idxTakeaways = lowerContent.indexOf(kwTakeaways) !== -1 
        ? lowerContent.indexOf(kwTakeaways) 
        : lowerContent.indexOf(kwKeyPoint);

    const getStartOfBody = (idx: number) => {
      if (idx === -1) return -1;
      const nextNewline = content.indexOf("\n", idx);
      return nextNewline === -1 ? idx + 30 : nextNewline + 1;
    };

    if (name === "overview") {
      if (idxOverview === -1) return "";
      const start = getStartOfBody(idxOverview);
      const nextIdx = idxSolution !== -1 ? idxSolution : (idxTakeaways !== -1 ? idxTakeaways : content.length);
      const piece = content.substring(start, nextIdx).trim();
      return piece.replace(/[ \t]*#{1,6}\s*[\d.]*\s*$/, "").trim();
    }
    
    if (name === "solution") {
      if (idxSolution === -1) return "";
      const start = getStartOfBody(idxSolution);
      const nextIdx = idxTakeaways !== -1 ? idxTakeaways : content.length;
      const piece = content.substring(start, nextIdx).trim();
      return piece.replace(/[ \t]*#{1,6}\s*[\d.]*\s*$/, "").trim();
    }
    
    if (name === "takeaways") {
      if (idxTakeaways === -1) return "";
      const start = getStartOfBody(idxTakeaways);
      return content.substring(start).trim();
    }
    
    return "";
  };






  // Default to the main lesson tab 
  const defaultTab = "full";


  if (noteLoading || summaryLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-64 w-full" />
        </main>
      </div>
    );
  }

  if (!note) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">Note not found</h2>
            <Link href="/dashboard">
              <Button>Back to Dashboard</Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon" data-testid="button-back">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl font-bold truncate">{note.title}</h1>
            <p className="text-muted-foreground">{note.subject}</p>
          </div>
          {summary && !error && (
            <CopyButton
              getText={() => {
                if (activeTab === "full") return summary.content || "";
                if (activeTab === "snapshot") return getSection(summary.content, "Overview") || summary.content.split(/[ \t]*#{1,6}\s*[\d.]*\s*LESSON_AND_SOLUTION/i)[0] || "";
                if (activeTab === "takeaways") return (summary.keyPoints.length > 0 ? summary.keyPoints : []).join("\n");
                if (activeTab === "raw") return note.content || "";
                if (activeTab === "research" && (summary as any).topicExplanations) {
                  return Object.entries((summary as any).topicExplanations).map(([topic, explanation]) => `${topic}\n${explanation}`).join("\n\n");
                }
                return summary.content || "";
              }}
            />
          )}
        </div>

        {summary && !error ? (
          <Tabs defaultValue={defaultTab} className="space-y-6" onValueChange={setActiveTab}>
            <div className="sticky top-16 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-2 -mx-4 px-4 border-b">
              <TabsList className="w-full justify-start overflow-x-auto no-scrollbar bg-transparent h-auto p-0 gap-6">
                <TabsTrigger value="snapshot" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 py-2 flex items-center gap-2">
                  <Info className="h-4 w-4" /> Snapshot
                </TabsTrigger>
                <TabsTrigger value="takeaways" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 py-2 flex items-center gap-2">
                  <ListChecks className="h-4 w-4" /> Takeaways
                </TabsTrigger>
                {summary.topicExplanations && Object.keys(summary.topicExplanations).length > 0 && (
                  <TabsTrigger value="research" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 py-2 flex items-center gap-2">
                    <Search className="h-4 w-4" /> Research
                  </TabsTrigger>
                )}
                <TabsTrigger value="full" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 py-2 flex items-center gap-2">
                  <FileText className="h-4 w-4" /> Full Lesson
                </TabsTrigger>
                <TabsTrigger value="raw" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 py-2 flex items-center gap-2 text-muted-foreground">
                  <Sparkles className="h-4 w-4" /> Source
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="full" className="mt-0">
              <Card className="border-none shadow-none bg-transparent">
                <CardContent className="p-0">
                  <div className="prose prose-base dark:prose-invert max-w-none leading-relaxed text-foreground/90">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        table: ({ children }) => (
                          <div className="overflow-x-auto my-6 -mx-1 px-1">
                            <table className="w-full border-collapse text-sm border border-border shadow-sm rounded-lg overflow-hidden">{children}</table>
                          </div>
                        ),
                        thead: ({ children }) => <thead className="bg-muted/50">{children}</thead>,
                        tr: ({ children }) => <tr className="border-b border-border last:border-0">{children}</tr>,
                        th: ({ children }) => <th className="px-4 py-3 text-left font-bold text-foreground border-r border-border last:border-0">{children}</th>,
                        td: ({ children }) => <td className="px-4 py-3 border-r border-border last:border-0 tabular-nums">{children}</td>,
                      }}
                    >
                      {summary.content}
                    </ReactMarkdown>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="snapshot" className="mt-0">
              <Card className="border-none shadow-none bg-transparent">
                <CardContent className="p-0 space-y-4">
                  <div className="prose prose-base dark:prose-invert max-w-none leading-relaxed text-foreground/90">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {getSection(summary.content, "Overview") || summary.content.split(/[ \t]*#{1,6}\s*[\d.]*\s*LESSON_AND_SOLUTION/i)[0]}
                    </ReactMarkdown>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="takeaways" className="mt-0">
               <Card className="border-none shadow-none bg-transparent">
                <CardContent className="p-0">
                  <ul className="space-y-4">
                    {(summary.keyPoints.length > 0 ? summary.keyPoints : (getSection(summary.content, "Takeaways") || getSection(summary.content, "Key")).split("\n").filter(l => /^[*-•]/.test(l.trim()))).map((point: string, index: number) => (
                      <li key={index} className="flex gap-4 p-4 rounded-xl bg-primary/5 border border-primary/10">
                        <span className="h-6 w-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold shrink-0">
                          {index + 1}
                        </span>
                        <span className="text-foreground/90 leading-snug">{point.replace(/^[-*•]\s+/, "")}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>



            {summary.topicExplanations && (
              <TabsContent value="research" className="mt-0 space-y-4">
                {Object.entries(summary.topicExplanations).map(([topic, explanation], index) => (
                  <Card key={index} className="overflow-hidden border-primary/20 bg-primary/5">
                    <CardHeader className="bg-primary/10 py-3">
                      <h4 className="font-bold text-primary flex items-center gap-2">
                        <Sparkles className="h-4 w-4" /> {topic}
                      </h4>
                    </CardHeader>
                    <CardContent className="py-4">
                      <p className="text-sm leading-relaxed text-foreground/80 italic">"{explanation}"</p>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>
            )}

            <TabsContent value="raw" className="mt-0">
              <Card>
                <CardContent className="p-4 bg-muted/30">
                  <p className="whitespace-pre-wrap text-xs text-muted-foreground font-mono leading-tight max-h-[60vh] overflow-y-auto">
                    {note.content}
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        ) : (
          !summaryLoading && (
            <Card className="border-dashed border-2">
              <CardContent className="py-20 text-center space-y-6">
                <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <Sparkles className="h-8 w-8 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Generate Study Pack</h3>
                  <p className="text-muted-foreground">Transform your notes into a structured study package with summaries and deep-dives.</p>
                </div>
                <Button
                  size="lg"
                  onClick={() => generateSummaryMutation.mutate()}
                  disabled={generateSummaryMutation.isPending}
                  className="px-8"
                >
                  {generateSummaryMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Crafting your guide...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate Study Pack
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )
        )}
      </main>
    </div>
  );
}
