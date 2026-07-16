import AppLayout from "@/components/AppLayout";
import UploadZone from "@/components/UploadZone";
import Footer from "@/components/Footer";
import { useQuery } from "@tanstack/react-query";
import NoteCard from "@/components/NoteCard";
import { Card } from "@/components/ui/card";
import type { Note } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/context/LanguageContext";

export default function MyNotes() {
  const { t } = useLanguage();
  const { data: notes, isLoading } = useQuery<Note[]>({
    queryKey: ["/api/notes"],
  });

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-12">
          <div>
            <h1 className="text-4xl font-bold mb-2">{t("notes.title")}</h1>
            <p className="text-muted-foreground">{t("notes.subtitle")}</p>
          </div>

          <UploadZone />

          <div>
            <h2 className="text-2xl font-semibold mb-6">{t("notes.your_notes")}</h2>
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="h-64 flex flex-col justify-between p-6 border border-border/80 bg-card">
                    <div className="space-y-4">
                      <div className="flex justify-between items-start">
                        <Skeleton className="h-5 w-20 rounded-full" />
                        <Skeleton className="h-8 w-8 rounded-full" />
                      </div>
                      <Skeleton className="h-6 w-3/4" />
                      <div className="space-y-2">
                        <Skeleton className="h-3 w-full" />
                        <Skeleton className="h-3 w-5/6" />
                        <Skeleton className="h-3 w-4/5" />
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4 pt-4 border-t border-border/60">
                      <Skeleton className="h-9 flex-1 rounded-xl" />
                      <Skeleton className="h-9 flex-1 rounded-xl" />
                    </div>
                  </Card>
                ))}
              </div>
            ) : notes && notes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {notes.map((note) => (
                  <NoteCard
                    key={note.id}
                    id={note.id}
                    title={note.title}
                    subject={note.subject}
                    preview={note.content.substring(0, 100)}
                    date={new Date(note.createdAt).toLocaleDateString()}
                    audioData={note.audioData || undefined}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">{t("notes.no_notes")}</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </AppLayout>
  );
}
