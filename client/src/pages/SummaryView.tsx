import { useParams, Link } from "wouter";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ArrowLeft, Sparkles, Loader2, FileText } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";
import type { Note, Summary } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export default function SummaryView() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();

  const { data: note, isLoading: noteLoading } = useQuery<Note>({
    queryKey: [`/api/notes/${id}`],
  });

  const { data: summary, isLoading: summaryLoading, error } = useQuery<Summary>({
    queryKey: [`/api/notes/${id}/summary`],
    enabled: !!id,
    retry: false,
  });

  const generateSummaryMutation = useMutation({
    mutationFn: async () => {
      const language = localStorage.getItem("velocity_language") || "English";
      const response = await fetch(`/api/notes/${id}/summary`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language })
      });
      if (!response.ok) throw new Error("Failed to generate summary");
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
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

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
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon" data-testid="button-back">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">{note.title}</h1>
            <p className="text-muted-foreground">{note.subject}</p>
          </div>
        </div>

        {summary && !error ? (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <h2 className="text-2xl font-semibold flex items-center gap-2">
                  <Sparkles className="h-6 w-6 text-primary" />
                  AI Summary
                </h2>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="prose dark:prose-invert max-w-none">
                  <p className="whitespace-pre-wrap text-foreground">{summary.content}</p>
                </div>
              </CardContent>
            </Card>

            {summary.keyPoints.length > 0 && (
              <Card>
                <CardHeader>
                  <h3 className="text-xl font-semibold">Key Points</h3>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {summary.keyPoints.map((point: string, index: number) => (
                      <li key={index} className="flex gap-3">
                        <span className="text-primary font-semibold">{index + 1}.</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <h3 className="text-xl font-semibold">Original Notes</h3>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-muted-foreground">{note.content}</p>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center space-y-4">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
              <div>
                <h3 className="text-lg font-semibold mb-2">No summary yet</h3>
                <p className="text-muted-foreground mb-4">
                  Generate an AI-powered summary of your notes
                </p>
                <Button
                  onClick={() => generateSummaryMutation.mutate()}
                  disabled={generateSummaryMutation.isPending}
                  data-testid="button-generate-summary"
                >
                  {generateSummaryMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate Summary
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
