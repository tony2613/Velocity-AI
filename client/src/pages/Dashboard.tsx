import Navbar from "@/components/Navbar";
import StatsCard from "@/components/StatsCard";
import NoteCard from "@/components/NoteCard";
import UploadZone from "@/components/UploadZone";
import { FileText, CheckCircle, Flame } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import type { Note } from "@shared/schema";
import { useLanguage } from "@/context/LanguageContext";

export default function Dashboard() {
  const { t } = useLanguage();
  const { data: notes, isLoading } = useQuery<Note[]>({
    queryKey: ["/api/notes"],
  });

  const notesCount = notes?.length || 0;

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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">{t("dash.title")}</h1>
          <p className="text-muted-foreground">{t("dash.subtitle")}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatsCard
            icon={FileText}
            label={t("dash.notes_uploaded")}
            value={notesCount}
            trend={notesCount > 0 ? "Keep it up!" : "Upload your first note"}
          />
          <StatsCard
            icon={CheckCircle}
            label={t("dash.quizzes_available")}
            value={0}
            trend="Generate quizzes from notes"
          />
          <StatsCard
            icon={Flame}
            label={t("dash.study_streak")}
            value="0 days"
            trend="Start your streak today!"
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
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
            ) : notes && notes.length > 0 ? (
              <div className="grid gap-6">
                {notes.map((note) => (
                  <NoteCard
                    key={note.id}
                    id={note.id}
                    title={note.title}
                    subject={note.subject}
                    preview={note.content.slice(0, 200) + "..."}
                    date={formatDate(note.createdAt)}
                  />
                ))}
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
