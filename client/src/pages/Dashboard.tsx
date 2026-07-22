import { useState, useMemo } from "react";
import AppLayout from "@/components/AppLayout";
import OnboardingTutorial from "@/components/OnboardingTutorial";
import Footer from "@/components/Footer";

import NoteCard from "@/components/NoteCard";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, ChevronDown, ChevronRight, FolderOpen } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import type { Note } from "@shared/schema";
import { useLanguage } from "@/context/LanguageContext";

export default function Dashboard() {
  const { t } = useLanguage();
  const { } = useAuth();
  const [expandedSubjects, setExpandedSubjects] = useState<Set<string>>(new Set());

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

  // Group notes by subject (case-insensitive), sorted by most recent note first
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">{t("dash.title")}</h1>
          <p className="text-muted-foreground">{t("dash.subtitle")}</p>
        </div>



        <div className="space-y-6">
          <div id="tut-notes" className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">{t("dash.your_notes")}</h2>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="p-5 space-y-4 border border-border/80">
                  <div className="flex justify-between items-start">
                    <Skeleton className="h-5 w-20 rounded-full" />
                    <Skeleton className="h-8 w-8 rounded-full" />
                  </div>
                  <Skeleton className="h-6 w-2/3" />
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-4/5" />
                  </div>
                  <div className="flex gap-2 pt-4 border-t border-border/60">
                    <Skeleton className="h-9 flex-1 rounded-xl" />
                    <Skeleton className="h-9 flex-1 rounded-xl" />
                  </div>
                </Card>
              ))}
            </div>
          ) : subjectGroups.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {subjectGroups.map((group) => {
                const key = group.subject.toLowerCase().trim();
                const isExpanded = expandedSubjects.has(key);

                // Single note in subject — render as a normal card
                if (group.notes.length === 1) {
                  const note = group.notes[0];
                  return (
                    <NoteCard
                      key={note.id}
                      id={note.id}
                      title={note.title}
                      subject={note.subject}
                      preview={note.content.slice(0, 200) + "..."}
                      date={formatDate(note.createdAt)}
                    />
                  );
                }

                // Multiple notes — render as collapsible subject group
                return (
                  <Card key={key} className="overflow-hidden h-fit" data-testid={`subject-group-${key}`}>
                    <CardHeader
                      className="flex flex-row items-center gap-3 py-4 px-5 cursor-pointer hover:bg-muted/30 transition-colors select-none"
                      onClick={() => toggleSubject(group.subject)}
                    >
                      <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <FolderOpen className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-base truncate max-w-[120px] sm:max-w-none">{group.subject}</h3>
                          <Badge variant="secondary" className="text-xs shrink-0">
                            {group.notes.length} notes
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Last updated {formatDate(group.notes[0].createdAt)}
                        </p>
                      </div>
                      {isExpanded ? (
                        <ChevronDown className="h-5 w-5 text-muted-foreground shrink-0 transition-transform" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0 transition-transform" />
                      )}
                    </CardHeader>
                    {isExpanded && (
                      <CardContent className="p-0 border-t">
                        <div className="divide-y divide-border">
                          {group.notes.map((note) => (
                            <NoteCard
                              key={note.id}
                              id={note.id}
                              title={note.title}
                              subject={note.subject}
                              preview={note.content.slice(0, 200) + "..."}
                              date={formatDate(note.createdAt)}
                              compact
                            />
                          ))}
                        </div>
                      </CardContent>
                    )}
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 border rounded-lg max-w-xl mx-auto w-full">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">{t("dash.no_notes")}</h3>
              <p className="text-muted-foreground mb-4">{t("dash.upload_first")}</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </AppLayout>
  );
}
