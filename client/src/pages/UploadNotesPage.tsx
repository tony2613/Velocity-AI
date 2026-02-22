import Navbar from "@/components/Navbar";
import UploadZone from "@/components/UploadZone";

export default function UploadNotesPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Upload Notes</h1>
            <p className="text-muted-foreground">Add your notes and let AI transform them into summaries and quizzes</p>
          </div>

          <UploadZone />

          <div className="bg-card border border-border rounded-lg p-6 space-y-4">
            <h2 className="text-lg font-semibold">How it works:</h2>
            <ol className="space-y-3 text-muted-foreground list-decimal list-inside">
              <li>Upload your notes or paste text directly</li>
              <li>Our AI will generate a concise summary</li>
              <li>Create a custom quiz to test your knowledge</li>
              <li>Track your learning progress</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
