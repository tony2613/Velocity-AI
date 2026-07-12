import { useState, useMemo, useRef, useEffect } from "react";
import Navbar from "@/components/Navbar";
import OnboardingTutorial from "@/components/OnboardingTutorial";

import NoteCard from "@/components/NoteCard";
import UploadZone from "@/components/UploadZone";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, ChevronDown, ChevronRight, FolderOpen } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import type { Note, Quiz } from "@shared/schema";
import { useLanguage } from "@/context/LanguageContext";
import { isToday, isYesterday } from "date-fns";

export default function Dashboard() {
  const { t } = useLanguage();
  const { user } = useAuth();
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
    <div className="min-h-screen bg-background">
      <OnboardingTutorial />
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">{t("dash.title")}</h1>
          <p className="text-muted-foreground">{t("dash.subtitle")}</p>
        </div>



        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div id="tut-notes" className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">{t("dash.your_notes")}</h2>
            </div>

            {isLoading ? (
              <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-6 border rounded-lg space-y-4">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                ))}
              </div>
            ) : subjectGroups.length > 0 ? (
              <div className="grid gap-6">
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
                    <Card key={key} className="overflow-hidden" data-testid={`subject-group-${key}`}>
                      <CardHeader
                        className="flex flex-row items-center gap-3 py-4 px-5 cursor-pointer hover:bg-muted/30 transition-colors select-none"
                        onClick={() => toggleSubject(group.subject)}
                      >
                        <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <FolderOpen className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-base">{group.subject}</h3>
                            <Badge variant="secondary" className="text-xs">
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
              <div className="text-center py-12 border rounded-lg">
                <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">{t("dash.no_notes")}</h3>
                <p className="text-muted-foreground mb-4">{t("dash.upload_first")}</p>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">{t("dash.quick_upload")}</h2>
            <UploadZone />
          </div>
        </div>
      </main>
    </div>
  );
}
