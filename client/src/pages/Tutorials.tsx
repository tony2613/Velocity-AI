import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { PlayCircle } from "lucide-react";
import SEO from "@/components/SEO";

export default function TutorialsPage() {
  const tutorials = [
    { title: "Getting Started with VelocityAI", duration: "5 mins" },
    { title: "Mastering OCR Extraction", duration: "3 mins" },
    { title: "Advanced Quiz Generation", duration: "4 mins" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Tutorials – Learn How to Use VelocityAI"
        description="Step-by-step tutorials for VelocityAI. Learn how to upload notes, generate AI summaries, create quizzes, and master OCR extraction for smarter studying."
        canonicalPath="/tutorials"
      />
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h1 className="text-4xl font-bold mb-12">Tutorials</h1>
        <div className="grid md:grid-cols-3 gap-8">
          {tutorials.map((tutorial, index) => (
            <div key={index} className="p-6 border rounded-xl hover-elevate flex flex-col items-center text-center">
              <PlayCircle className="h-12 w-12 text-primary mb-4" />
              <h3 className="font-bold mb-1">{tutorial.title}</h3>
              <p className="text-xs text-muted-foreground">{tutorial.duration}</p>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
