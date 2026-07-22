import { useState, useMemo } from "react";
import AppLayout from "@/components/AppLayout";
import OnboardingTutorial from "@/components/OnboardingTutorial";
import Footer from "@/components/Footer";
import NoteCard from "@/components/NoteCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import type { Note } from "@shared/schema";
import { useLanguage } from "@/context/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { useLocation, Link } from "wouter";
import { queryClient } from "@/lib/queryClient";
import {
  FolderOpen,
  FileText,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Loader2,
  MoreVertical,
  Trash2,
  Plus
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Dashboard() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<"all" | "subjects">("all");
  const [expandedSubjects, setExpandedSubjects] = useState<Set<string>>(new Set());
  const [isGeneratingQuizId, setIsGeneratingQuizId] = useState<string | null>(null);

  const { data: notes, isLoading } = useQuery<Note[]>({
    queryKey: ["/api/notes"],
  });

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - new Date(date).getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return new Date(date).toLocaleDateString();
  };

  const deleteNoteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/notes/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete note");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notes"] });
      toast({
        title: "Note deleted",
        description: "Your note has been removed.",
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

  const generateQuizMutation = useMutation({
    mutationFn: async (id: string) => {
      setIsGeneratingQuizId(id);
      const response = await fetch(`/api/notes/${id}/quiz`, { method: "POST" });
      if (!response.ok) throw new Error("Failed to generate quiz");
      return response.json();
    },
    onSuccess: (data: { quiz: { id: string }, message?: string }) => {
      setIsGeneratingQuizId(null);
      toast({
        title: data.message ? "Partial Quiz Generated" : "Quiz ready!",
        description: data.message || "Your quiz has been generated. Click 'Take Quiz' to start.",
      });
      setLocation(`/quiz/${data.quiz.id}`);
    },
    onError: (error: Error) => {
      setIsGeneratingQuizId(null);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Group notes by subject (case-insensitive)
  const subjectGroups = useMemo(() => {
    if (!notes || notes.length === 0) return [];
    const groups: Record<string, { subject: string; notes: Note[] }> = {};
    for (const note of notes) {
      const key = note.subject.toLowerCase().trim();
      if (!groups[key]) {
        groups[key] = { subject: note.subject, notes: [] };
      }
      groups[key].notes.push(note);
    }
    // Sort each group's notes by date (newest first)
    for (const key of Object.keys(groups)) {
      groups[key].notes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    // Sort groups by most recent note
    return Object.values(groups).sort(
      (a, b) => new Date(b.notes[0].createdAt).getTime() - new Date(a.notes[0].createdAt).getTime()
    );
  }, [notes]);

  // Flattened sorted notes list (newest first)
  const sortedNotes = useMemo(() => {
    if (!notes) return [];
    return [...notes].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [notes]);

  const toggleSubject = (subject: string) => {
    setExpandedSubjects((prev) => {
      const next = new Set(prev);
      const key = subject.toLowerCase().trim();
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  return (
    <AppLayout>
      <OnboardingTutorial />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 w-full">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/40 pb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-1 text-foreground">{t("dash.title")}</h1>
            <p className="text-sm text-muted-foreground">{t("dash.subtitle")}</p>
          </div>
          <Link href="/upload">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-4 py-2.5 rounded-xl shadow-lg shadow-primary/20 flex items-center gap-2 self-start sm:self-auto transition-all hover:scale-[1.02]">
              <Plus className="h-4 w-4" />
              Upload Notes
            </Button>
          </Link>
        </div>

        {/* Tab Selection Bar */}
        <div className="flex items-center justify-between border-b border-border/30 pb-2">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                activeTab === "all"
                  ? "bg-primary/10 text-primary border border-primary/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
              }`}
            >
              All Notes
            </button>
            <button
              onClick={() => setActiveTab("subjects")}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                activeTab === "subjects"
                  ? "bg-primary/10 text-primary border border-primary/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
              }`}
            >
              Subjects
            </button>
          </div>
        </div>

        {/* Notes list / grid view */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-border/80 bg-card">
                  <div className="flex items-center gap-4 flex-1">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-5 w-1/3" />
                      <Skeleton className="h-3 w-1/4" />
                    </div>
                  </div>
                  <Skeleton className="h-8 w-24 rounded-lg" />
                </div>
              ))}
            </div>
          ) : notes && notes.length > 0 ? (
            activeTab === "all" ? (
              // All Notes List View (Flat list of file rows)
              <div className="space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">
                  Earlier
                </span>
                {sortedNotes.map((note) => (
                  <div
                    key={note.id}
                    className="flex items-center justify-between p-4 rounded-xl border border-border/40 bg-card hover:bg-muted/20 hover:border-primary/20 transition-all duration-200 group"
                  >
                    <Link href={`/summary/${note.id}`} className="flex items-center gap-4 flex-1 min-w-0 cursor-pointer">
                      <div className="h-10 w-10 rounded-lg bg-indigo-500/10 flex items-center justify-center shrink-0 border border-indigo-500/20 group-hover:scale-105 transition-transform shadow-sm">
                        <FileText className="h-5 w-5 text-indigo-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-base text-foreground group-hover:text-primary transition-colors truncate">
                            {note.title}
                          </span>
                          <Badge variant="outline" className="text-[10px] font-medium shrink-0 border-indigo-500/30 text-indigo-400">
                            {note.subject}
                          </Badge>
                        </div>
                        <span className="text-xs text-muted-foreground mt-0.5 block">
                          Created {formatDate(note.createdAt)}
                        </span>
                      </div>
                    </Link>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 shrink-0">
                      <Link href={`/summary/${note.id}`}>
                        <Button size="sm" variant="ghost" className="h-9 gap-1 text-xs hover:bg-muted/50">
                          <FileText className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline">Summary</span>
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-9 gap-1 text-xs hover:bg-primary/10 hover:text-primary"
                        onClick={() => generateQuizMutation.mutate(note.id)}
                        disabled={isGeneratingQuizId !== null}
                      >
                        {isGeneratingQuizId === note.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Sparkles className="h-3.5 w-3.5 text-primary" />
                        )}
                        <span className="hidden sm:inline">Quiz</span>
                      </Button>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-9 w-9 hover:bg-muted/50">
                            <MoreVertical className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/summary/${note.id}`}>
                              <a className="w-full">View Summary</a>
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => generateQuizMutation.mutate(note.id)}>
                            Generate Quiz
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => deleteNoteMutation.mutate(note.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // Subjects list (Folder view)
              <div className="space-y-3">
                {subjectGroups.map((group) => {
                  const key = group.subject.toLowerCase().trim();
                  const isExpanded = expandedSubjects.has(key);

                  return (
                    <div key={key} className="space-y-2">
                      <div
                        className="flex items-center justify-between p-4 rounded-xl border border-border/40 bg-card hover:bg-muted/20 hover:border-primary/20 transition-all duration-200 group cursor-pointer select-none"
                        onClick={() => toggleSubject(group.subject)}
                      >
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20 group-hover:scale-105 transition-transform shadow-sm">
                            <FolderOpen className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3">
                              <span className="font-semibold text-base text-foreground group-hover:text-primary transition-colors truncate">
                                {group.subject}
                              </span>
                              <Badge variant="secondary" className="text-xs font-medium shrink-0 bg-primary/5 text-primary border border-primary/10">
                                {group.notes.length} notes
                              </Badge>
                            </div>
                            <span className="text-xs text-muted-foreground mt-0.5 block">
                              Last updated {formatDate(group.notes[0].createdAt)}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {isExpanded ? (
                            <ChevronDown className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                          ) : (
                            <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                          )}
                        </div>
                      </div>

                      {/* Indented collapsible notes list */}
                      {isExpanded && (
                        <div className="ml-6 sm:ml-12 border-l border-border/40 pl-4 py-1 space-y-2 transition-all">
                          {group.notes.map((note) => (
                            <NoteCard
                              key={note.id}
                              id={note.id}
                              title={note.title}
                              subject={note.subject}
                              preview={note.content.slice(0, 150) + "..."}
                              date={formatDate(note.createdAt)}
                              compact
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )
          ) : (
            // No Notes Fallback
            <div className="text-center py-16 border border-dashed rounded-2xl max-w-xl mx-auto w-full bg-card/30">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">{t("dash.no_notes")}</h3>
              <p className="text-muted-foreground mb-6">{t("dash.upload_first")}</p>
              <Link href="/upload">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-4 py-2 rounded-xl">
                  <Plus className="h-4 w-4 mr-1.5" />
                  Upload Your First Note
                </Button>
              </Link>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </AppLayout>
  );
}
