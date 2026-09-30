import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { PlayCircle, BookOpen, Clock, CheckCircle2, ArrowRight } from "lucide-react";
import SEO from "@/components/SEO";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function TutorialsPage() {
  const tutorials = [
    {
      title: "Getting Started with VelocityAI: Complete Student Onboarding",
      duration: "5 mins",
      category: "Basics",
      description: "Learn how to set up your student profile, organize your subjects by semester, and navigate your dashboard for effortless study management.",
      steps: [
        "Create and verify your VelocityAI account",
        "Set your primary learning subjects and academic goals",
        "Tour the dashboard metrics, notes library, and study streak tracker"
      ]
    },
    {
      title: "Mastering Document OCR: Extracting Textbooks & Lecture Slides",
      duration: "4 mins",
      category: "Document Ingestion",
      description: "Step-by-step walkthrough on uploading PDFs, PowerPoint presentations (.pptx), images of lecture slides, and handwritten notes for instant high-accuracy text extraction.",
      steps: [
        "Upload multi-page academic PDFs and PowerPoint decks",
        "Capture mobile photos of classroom whiteboards and syllabi",
        "Verify extracted text, tables, formulas, and speaker notes"
      ]
    },
    {
      title: "Generating High-Yield Summaries with Verbatim Key Concepts",
      duration: "6 mins",
      category: "AI Summarization",
      description: "Discover how VelocityAI transforms 50-page textbook chapters into structured, textbook-grade revision guides formatted with formulas, key takeaways, and glossary tables.",
      steps: [
        "Select your preferred language across 18 supported languages",
        "Generate comprehensive summaries with verbatim academic definitions",
        "Review step-by-step problem solutions in STEM, accounting, and biology"
      ]
    },
    {
      title: "Active Recall Quizzes: Reinforcing Memory & Retention",
      duration: "5 mins",
      category: "Quiz Mastery",
      description: "Replace passive rereading with evidence-based active retrieval. Learn how to generate customized multiple-choice quizzes directly from your uploaded materials.",
      steps: [
        "Auto-generate targeted multiple-choice practice quizzes",
        "Analyze in-depth answer explanations for incorrect choices",
        "Retake quizzes to track improvements and build long-term retention"
      ]
    },
    {
      title: "Adaptive Study Planning: Exam Countdown & Daily Agendas",
      duration: "7 mins",
      category: "Exam Prep",
      description: "Never fall behind on syllabus coverage. Set your exam dates and let the AI study scheduler automatically calculate daily topic targets and adjust when plans change.",
      steps: [
        "Add upcoming midterms, finals, and certification test dates",
        "Set your realistic daily target study minutes",
        "Let the scheduler automatically rebalance study blocks dynamically"
      ]
    },
    {
      title: "Weakness Diagnostics: Turning Problem Topics Into Strengths",
      duration: "4 mins",
      category: "Analytics",
      description: "Understand where knowledge gaps exist. Learn how quiz score analytics pinpoint specific weak concepts and automatically prioritize targeted review sessions.",
      steps: [
        "Review topic mastery scores across your subjects",
        "Identify high-yield weak areas flagged for urgent revision",
        "Execute targeted quiz drills to achieve full subject mastery"
      ]
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between">
      <SEO
        title="Tutorials & Study Guides – Learn How to Use VelocityAI"
        description="Comprehensive video guides and step-by-step tutorials for VelocityAI. Master note uploading, AI summarization, active recall quiz generation, and adaptive study scheduling."
        canonicalPath="/tutorials"
      />
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
        <header className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wide uppercase">
            <BookOpen className="h-3.5 w-3.5" />
            Learning Academy & Tutorials
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
            Master VelocityAI in Minutes
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Follow our step-by-step guides to unlock the full potential of AI-assisted studying. From converting lecture slides into summaries to building adaptive exam countdowns, learn the strategies used by top students.
          </p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tutorials.map((tutorial, index) => (
            <Card key={index} className="hover-elevate flex flex-col justify-between border-border bg-card shadow-sm">
              <CardHeader className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-primary px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20">
                    {tutorial.category}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{tutorial.duration}</span>
                  </div>
                </div>
                <div className="flex items-start gap-3 pt-2">
                  <PlayCircle className="h-8 w-8 text-primary shrink-0 mt-0.5" />
                  <CardTitle className="text-xl font-bold leading-snug">
                    {tutorial.title}
                  </CardTitle>
                </div>
                <CardDescription className="text-sm leading-relaxed text-muted-foreground pt-1">
                  {tutorial.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-2 border-t border-border/50">
                <p className="text-xs font-semibold text-foreground uppercase tracking-wider mb-2">What you'll learn:</p>
                <ul className="space-y-1.5 text-xs text-muted-foreground">
                  {tutorial.steps.map((step, sIdx) => (
                    <li key={sIdx} className="flex items-start gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </section>

        {/* Best Practices Section */}
        <section className="p-8 sm:p-12 rounded-3xl border border-border bg-card/60 shadow-sm space-y-6">
          <div className="max-w-3xl space-y-3">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
              Pro Tips for Effective Exam Revision
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              Applying cognitive science principles with VelocityAI will multiply your learning efficiency. Keep these golden rules in mind when studying for finals:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            <div className="space-y-2">
              <h3 className="font-semibold text-base text-foreground">1. Test Immediately After Reading</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Do not wait days to quiz yourself. Take an AI-generated quiz within 15 minutes of reviewing a summary to exploit the testing effect and lock memories in place.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-base text-foreground">2. Focus on Diagnostic Weaknesses</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Reviewing topics you already know feels comforting but produces minimal score gains. Use the Weakness Tracker to focus 80% of your energy on sub-topics with low quiz percentages.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-base text-foreground">3. Stick to Daily Micro-Goals</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Cramming for 10 hours before an exam yields fast forgetting. Setting 45 to 90 daily study minutes with the Adaptive Exam Planner ensures high retention with zero burnout.
              </p>
            </div>
          </div>

          <div className="pt-4 flex flex-wrap items-center justify-between gap-4 border-t border-border/60">
            <span className="text-sm font-medium text-muted-foreground">
              Ready to put these study strategies into practice?
            </span>
            <Link href="/auth">
              <a>
                <Button className="gap-2 shadow-sm">
                  Start Studying Free
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </a>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
