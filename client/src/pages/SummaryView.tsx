import React, { useState } from "react";
import { useParams, Link } from "wouter";
import Footer from "@/components/Footer";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ArrowLeft, Sparkles, Loader2, Search, Copy, Share2, Download, Link2 } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";
import type { Note, Summary } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
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

const markdownComponents = {
  table: ({ children }: any) => (
    <div className="overflow-x-auto my-6 -mx-1 px-1 w-full">
      <table className="w-full border-collapse text-sm border border-border shadow-sm rounded-lg overflow-hidden">{children}</table>
    </div>
  ),
  thead: ({ children }: any) => <thead className="bg-muted/50">{children}</thead>,
  tr: ({ children }: any) => <tr className="border-b border-border last:border-0">{children}</tr>,
  th: ({ children }: any) => <th className="px-4 py-3 text-left font-bold text-foreground border-r border-border last:border-0">{children}</th>,
  td: ({ children }: any) => <td className="px-4 py-3 border-r border-border last:border-0 tabular-nums">{children}</td>,
  pre: ({ children }: any) => (
    <pre className="overflow-x-auto p-4 rounded-xl bg-muted/30 border border-border max-w-full my-4 font-mono text-xs leading-relaxed whitespace-pre">
      {children}
    </pre>
  ),
  code: ({ className, children, ...props }: any) => {
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
};

export default function SummaryView() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();

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








  // Render main guide directly


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

          {/* Spacer */}
          <div className="h-px bg-border/40 w-full" />

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
                let text = summary.content || "";
                if (summary.topicExplanations && Object.keys(summary.topicExplanations).length > 0) {
                  text += "\n\n### Web Research & Deep-Dives\n";
                  Object.entries(summary.topicExplanations).forEach(([topic, explanation]) => {
                    text += `\n* **${topic}**: ${explanation}\n`;
                  });
                }
                return text;
              }}
            />
          )}
        </div>

        {summary && !error ? (
          <div className="space-y-8">
            <div id="summary-content-to-print">
              <Card className="border-none shadow-none bg-transparent w-full">
                <CardContent className="p-0 w-full space-y-8">
                  <div className="prose prose-base dark:prose-invert max-w-none break-words [word-break:break-word] overflow-x-auto leading-relaxed text-foreground/90 w-full">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={markdownComponents}
                    >
                      {summary.content}
                    </ReactMarkdown>
                  </div>

                  {summary.topicExplanations && Object.keys(summary.topicExplanations).length > 0 && (
                    <div className="mt-8 pt-8 border-t border-border/60">
                      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <Search className="h-5 w-5 text-primary" /> Web Research & Deep-Dives
                      </h3>
                      <div className="grid gap-4">
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
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
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
