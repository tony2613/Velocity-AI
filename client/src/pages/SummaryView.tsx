import React, { useState } from "react";
import { useParams, Link } from "wouter";
import Footer from "@/components/Footer";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ArrowLeft, Sparkles, Loader2, FileText, Info, ListChecks, Search, Copy, Share2, Download, Link2 } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";
import type { Note, Summary } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
// @ts-ignore
import html2pdf from "html2pdf.js";

function ShareMenu({ 
  getText, 
  title, 
  subject 
}: { 
  getText: () => string, 
  title: string, 
  subject: string 
}) {
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);

  const handleCopyText = async () => {
    const textWithContext = `Velocity AI Summary: ${title}\nSubject: ${subject}\n\n${getText()}`;
    try {
      await navigator.clipboard.writeText(textWithContext);
      toast({
        title: "Copied!",
        description: "Summary text copied to clipboard with context.",
      });
    } catch (e) {
      try {
        const textarea = document.createElement("textarea");
        textarea.value = textWithContext;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
        toast({
          title: "Copied!",
          description: "Summary text copied to clipboard with context.",
        });
      } catch (err) {
        toast({
          title: "Copy Failed",
          description: "Could not copy summary text to clipboard.",
          variant: "destructive"
        });
      }
    }
  };

  const handleCopyLink = async () => {
    const link = window.location.href;
    try {
      await navigator.clipboard.writeText(link);
      toast({
        title: "Link Copied!",
        description: "Summary page link copied to clipboard.",
      });
    } catch (e) {
      try {
        const textarea = document.createElement("textarea");
        textarea.value = link;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
        toast({
          title: "Link Copied!",
          description: "Summary page link copied to clipboard.",
        });
      } catch (err) {
        toast({
          title: "Copy Failed",
          description: "Could not copy link to clipboard.",
          variant: "destructive"
        });
      }
    }
  };

  const handleExportPDF = () => {
    setIsExporting(true);
    toast({
      title: "Generating PDF",
      description: "Please wait while we format your document...",
    });
    
    const element = document.getElementById("summary-content-to-print");
    if (!element) {
      toast({
        title: "Error",
        description: "Could not find content to export.",
        variant: "destructive"
      });
      setIsExporting(false);
      return;
    }

    let container: HTMLDivElement | null = null;
    try {
      const clone = element.cloneNode(true) as HTMLElement;
      
      const header = document.createElement("div");
      header.innerHTML = `
        <h1 style="font-size: 24px; font-weight: bold; margin-bottom: 4px; font-family: sans-serif; color: #111;">${title}</h1>
        <p style="font-size: 14px; color: #666; margin-bottom: 24px; font-family: sans-serif;">Velocity AI Summary - ${subject}</p>
      `;
      clone.insertBefore(header, clone.firstChild);
      
      clone.style.padding = "40px";
      clone.style.color = "black";
      clone.style.background = "white";
      clone.style.fontFamily = "sans-serif";
      
      container = document.createElement("div");
      container.className = "pdf-export-container";
      container.appendChild(clone);
      document.body.appendChild(container);

      const opt = {
        margin:       10,
        filename:     `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_summary.pdf`,
        image:        { type: 'jpeg' as const, quality: 0.98 },
        html2canvas:  { 
          scale: 2, 
          useCORS: true,
          onclone: (clonedDoc: Document) => {
            clonedDoc.documentElement.classList.remove("dark");
            clonedDoc.body.classList.remove("dark");
            const expContainer = clonedDoc.querySelector(".pdf-export-container") as HTMLElement;
            if (expContainer) {
              expContainer.style.color = "black";
              expContainer.style.background = "white";
              expContainer.style.padding = "40px";
              expContainer.style.fontFamily = "sans-serif";
            }
          }
        },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
      };

      setTimeout(() => {
        if (!container) return;
        html2pdf().set(opt).from(container).save().then(() => {
          if (container && document.body.contains(container)) {
            document.body.removeChild(container);
          }
          setIsExporting(false);
          toast({
            title: "Success",
            description: "PDF downloaded successfully.",
          });
        }).catch((err: any) => {
          if (container && document.body.contains(container)) {
            document.body.removeChild(container);
          }
          setIsExporting(false);
          console.error(err);
          toast({
            title: "Export Failed",
            description: "There was a problem generating the PDF.",
            variant: "destructive"
          });
        });
      }, 150);
    } catch (err: any) {
      if (container && document.body.contains(container)) {
        document.body.removeChild(container);
      }
      setIsExporting(false);
      console.error(err);
      toast({
        title: "Export Failed",
        description: "An unexpected error occurred during PDF generation.",
        variant: "destructive"
      });
    }
  };

  const handleNativeShare = async () => {
    const shareText = `Check out my summary for ${title} on Velocity AI!\n\n${getText().substring(0, 120)}...`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Velocity AI Summary: ${title}`,
          text: shareText,
          url: window.location.href,
        });
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          toast({
            title: "Share Failed",
            description: "Unable to share via your device.",
            variant: "destructive"
          });
        }
      }
    } else {
      // Fallback
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: "Link Copied!",
          description: "Sharing apps not supported. Page link copied to clipboard.",
        });
      } catch (err) {
        toast({
          title: "Share Unsupported",
          description: "Sharing is not supported on this device/browser.",
          variant: "destructive"
        });
      }
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5 text-xs transition-all" disabled={isExporting}>
          <Share2 className="h-3.5 w-3.5" />
          Share
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 glass-panel border-primary/10">
        <DropdownMenuItem onClick={handleCopyText} className="cursor-pointer" disabled={isExporting}>
          <Copy className="h-4 w-4 mr-2" />
          Copy Text
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleCopyLink} className="cursor-pointer" disabled={isExporting}>
          <Link2 className="h-4 w-4 mr-2" />
          Copy Link
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportPDF} className="cursor-pointer" disabled={isExporting}>
          {isExporting ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Download className="h-4 w-4 mr-2" />
          )}
          {isExporting ? "Exporting..." : "Export as PDF"}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleNativeShare} className="cursor-pointer" disabled={isExporting}>
          <Share2 className="h-4 w-4 mr-2" />
          Share via Apps
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
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
      const preferredModel = localStorage.getItem("velocity_model") || "gemini-2.5-flash";
      
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
      <AppLayout>
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8">
          {/* Header Skeleton */}
          <div className="flex items-center gap-4">
            <Skeleton className="h-9 w-9 rounded-xl" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-8 w-2/3" />
              <Skeleton className="h-4 w-1/4" />
            </div>
          </div>

          {/* Tabs Navigation Skeleton */}
          <div className="flex border-b border-border gap-6 pb-2">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-28" />
          </div>

          {/* Main Content Area Skeletons */}
          <div className="space-y-6">
            <Skeleton className="h-6 w-1/3" />
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/5" />
            </div>

            <Skeleton className="h-6 w-1/4" />
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        </main>
      </AppLayout>
    );
  }

  if (!note) {
    return (
      <AppLayout>
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">Note not found</h2>
            <Link href="/dashboard">
              <Button>Back to Dashboard</Button>
            </Link>
          </div>
        </main>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8 overflow-x-hidden">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon" data-testid="button-back">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl font-bold truncate">{note.title}</h1>
            <p className="text-muted-foreground truncate">{note.subject}</p>
          </div>
          {summary && !error && (
            <ShareMenu
              title={note.title}
              subject={note.subject}
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

            <div id="summary-content-to-print">

            <TabsContent value="full" className="mt-0">
              <Card className="border-none shadow-none bg-transparent w-full">
                <CardContent className="p-0 w-full">
                  <div className="prose prose-base dark:prose-invert max-w-none break-words [word-break:break-word] overflow-x-auto leading-relaxed text-foreground/90 w-full">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        table: ({ children }) => (
                          <div className="overflow-x-auto my-6 -mx-1 px-1 w-full">
                            <table className="w-full border-collapse text-sm border border-border shadow-sm rounded-lg overflow-hidden">{children}</table>
                          </div>
                        ),
                        thead: ({ children }) => <thead className="bg-muted/50">{children}</thead>,
                        tr: ({ children }) => <tr className="border-b border-border last:border-0">{children}</tr>,
                        th: ({ children }) => <th className="px-4 py-3 text-left font-bold text-foreground border-r border-border last:border-0">{children}</th>,
                        td: ({ children }) => <td className="px-4 py-3 border-r border-border last:border-0 tabular-nums">{children}</td>,
                        pre: ({ children }) => (
                          <pre className="overflow-x-auto p-4 rounded-xl bg-muted/30 border border-border max-w-full my-4 font-mono text-xs leading-relaxed whitespace-pre">
                            {children}
                          </pre>
                        ),
                        code: ({ className, children, ...props }) => {
                          const isInline = !className;
                          return isInline ? (
                            <code className="bg-muted/50 dark:bg-zinc-800/50 px-1.5 py-0.5 rounded font-mono text-[0.85em] text-foreground/90 break-all" {...props}>
                              {children}
                            </code>
                          ) : (
                            <code className="block w-full overflow-x-auto font-mono text-xs" {...props}>
                              {children}
                            </code>
                          );
                        },
                      }}
                    >
                      {summary.content}
                    </ReactMarkdown>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="snapshot" className="mt-0">
              <Card className="border-none shadow-none bg-transparent w-full">
                <CardContent className="p-0 space-y-4 w-full">
                  <div className="prose prose-base dark:prose-invert max-w-none break-words [word-break:break-word] overflow-x-auto leading-relaxed text-foreground/90 w-full">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        table: ({ children }) => (
                          <div className="overflow-x-auto my-6 -mx-1 px-1 w-full">
                            <table className="w-full border-collapse text-sm border border-border shadow-sm rounded-lg overflow-hidden">{children}</table>
                          </div>
                        ),
                        thead: ({ children }) => <thead className="bg-muted/50">{children}</thead>,
                        tr: ({ children }) => <tr className="border-b border-border last:border-0">{children}</tr>,
                        th: ({ children }) => <th className="px-4 py-3 text-left font-bold text-foreground border-r border-border last:border-0">{children}</th>,
                        td: ({ children }) => <td className="px-4 py-3 border-r border-border last:border-0 tabular-nums">{children}</td>,
                        pre: ({ children }) => (
                          <pre className="overflow-x-auto p-4 rounded-xl bg-muted/30 border border-border max-w-full my-4 font-mono text-xs leading-relaxed whitespace-pre">
                            {children}
                          </pre>
                        ),
                        code: ({ className, children, ...props }) => {
                          const isInline = !className;
                          return isInline ? (
                            <code className="bg-muted/50 dark:bg-zinc-800/50 px-1.5 py-0.5 rounded font-mono text-[0.85em] text-foreground/90 break-all" {...props}>
                              {children}
                            </code>
                          ) : (
                            <code className="block w-full overflow-x-auto font-mono text-xs" {...props}>
                              {children}
                            </code>
                          );
                        },
                      }}
                    >
                      {getSection(summary.content, "Overview") || summary.content.split(/[ \t]*#{1,6}\s*[\d.]*\s*LESSON_AND_SOLUTION/i)[0]}
                    </ReactMarkdown>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="takeaways" className="mt-0">
               <Card className="border-none shadow-none bg-transparent w-full">
                <CardContent className="p-0 w-full">
                  <ul className="space-y-4 w-full">
                    {(summary.keyPoints.length > 0 ? summary.keyPoints : (getSection(summary.content, "Takeaways") || getSection(summary.content, "Key")).split("\n").filter(l => /^[*-•]/.test(l.trim()))).map((point: string, index: number) => (
                      <li key={index} className="flex gap-4 p-4 rounded-xl bg-primary/5 border border-primary/10 w-full min-w-0">
                        <span className="h-6 w-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold shrink-0">
                          {index + 1}
                        </span>
                        <span className="text-foreground/90 leading-snug break-words [word-break:break-word] w-full min-w-0">{point.replace(/^[-*•]\s+/, "")}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>



            {summary.topicExplanations && (
              <TabsContent value="research" className="mt-0 space-y-4 w-full">
                {Object.entries(summary.topicExplanations).map(([topic, explanation], index) => (
                  <Card key={index} className="overflow-hidden border-primary/20 bg-primary/5 w-full">
                    <CardHeader className="bg-primary/10 py-3 w-full min-w-0">
                      <h4 className="font-bold text-primary flex items-center gap-2 break-words [word-break:break-word] w-full min-w-0">
                        <Sparkles className="h-4 w-4 shrink-0" /> {topic}
                      </h4>
                    </CardHeader>
                    <CardContent className="py-4 w-full min-w-0">
                      <p className="text-sm leading-relaxed text-foreground/80 italic break-words [word-break:break-word] w-full min-w-0">"{explanation}"</p>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>
            )}

            <TabsContent value="raw" className="mt-0">
              <Card className="w-full">
                <CardContent className="p-4 bg-muted/30 w-full overflow-hidden">
                  <p className="whitespace-pre-wrap break-words text-xs text-muted-foreground font-mono leading-tight max-h-[60vh] overflow-y-auto w-full">
                    {note.content}
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
            </div>
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
      <Footer />
    </AppLayout>
  );
}
