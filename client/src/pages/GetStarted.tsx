import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { ArrowRight, Upload, Zap, BookOpen, CheckCircle, FileText, Sparkles } from "lucide-react";
import SEO from "@/components/SEO";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function GetStarted() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between">
      <SEO
        title="Get Started – Begin Your AI Study Journey with VelocityAI"
        description="Step-by-step onboarding for VelocityAI. Upload your lecture notes, academic PDFs, and PowerPoint slides to generate instant AI summaries and practice quizzes."
        canonicalPath="/get-started"
      />
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
        <header className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wide uppercase">
            <Sparkles className="h-3.5 w-3.5" />
            Quick Start Onboarding
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
            Welcome to VelocityAI
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Start transforming raw study materials into high-yield exam summaries and active recall quizzes in three effortless steps.
          </p>
        </header>

        {/* 3 Step Core Flow */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="hover-elevate border-border bg-card shadow-sm p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Upload className="h-6 w-6" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-primary">Step 01</span>
            </div>
            <CardTitle className="text-xl font-bold">Upload Your Notes</CardTitle>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Upload textbook chapters, lecture slides in PDF or PPTX formats, captured whiteboard photos, or audio recordings. Our engine automatically parses raw text, formulas, and diagrams.
            </p>
          </Card>

          <Card className="hover-elevate border-border bg-card shadow-sm p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Zap className="h-6 w-6" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-primary">Step 02</span>
            </div>
            <CardTitle className="text-xl font-bold">Generate Summaries</CardTitle>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Our advanced AI models analyze and condense complex coursework into structured study sheets, preserving exact academic definitions, key equations, and core syllabus takeaways.
            </p>
          </Card>

          <Card className="hover-elevate border-border bg-card shadow-sm p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <BookOpen className="h-6 w-6" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-primary">Step 03</span>
            </div>
            <CardTitle className="text-xl font-bold">Test & Master</CardTitle>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Generate self-testing quizzes directly from your material. Identify weak spots before exam day, track your topic mastery scores, and build durable long-term retention.
            </p>
          </Card>
        </section>

        {/* What to Prepare Section */}
        <section className="p-8 sm:p-12 rounded-3xl border border-border bg-card shadow-sm space-y-8">
          <div className="space-y-3">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
              What Materials Can You Study With VelocityAI?
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-3xl">
              VelocityAI is designed to accommodate the varied file formats students encounter throughout high school, undergraduate programs, and graduate test preparation:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-5 rounded-2xl border border-border/80 bg-background/60 space-y-2">
              <FileText className="h-6 w-6 text-primary" />
              <h3 className="font-semibold text-base">Academic PDFs</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Research articles, dense textbook chapters, syllabus outlines, and past exam question papers.
              </p>
            </div>
            <div className="p-5 rounded-2xl border border-border/80 bg-background/60 space-y-2">
              <FileText className="h-6 w-6 text-primary" />
              <h3 className="font-semibold text-base">PowerPoint Decks</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Lecture slide decks (.pptx) including slide bullet points, speaker notes, and embedded charts.
              </p>
            </div>
            <div className="p-5 rounded-2xl border border-border/80 bg-background/60 space-y-2">
              <FileText className="h-6 w-6 text-primary" />
              <h3 className="font-semibold text-base">Syllabus Images</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Smartphone photos of printed handouts, handwritten formulas, and whiteboard notes via OCR.
              </p>
            </div>
            <div className="p-5 rounded-2xl border border-border/80 bg-background/60 space-y-2">
              <FileText className="h-6 w-6 text-primary" />
              <h3 className="font-semibold text-base">Audio Lectures</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Record classroom lectures or voice notes directly into the app for automatic transcription and summarization.
              </p>
            </div>
          </div>
        </section>

        {/* Why VelocityAI Grid */}
        <section className="p-8 sm:p-12 rounded-3xl border border-border bg-card/60 space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Why Students Choose VelocityAI</h2>
            <p className="text-sm text-muted-foreground">Proven cognitive study tools designed to maximize your revision ROI.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h3 className="font-semibold text-base text-foreground">Free Tier for Every Student</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Start without entering a credit card. Enjoy 5 uploads and 3 practice quizzes every single day for free.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h3 className="font-semibold text-base text-foreground">Active Recall Over Passive Rereading</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Quizzing yourself builds real cognitive neural connections that survive test anxiety in high-stakes exams.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h3 className="font-semibold text-base text-foreground">Adaptive Pacing & Exam Countdown</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Automatic schedule rebalancing ensures you cover all course modules without last-minute panic or late-night cramming.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h3 className="font-semibold text-base text-foreground">Privacy & Strict Security</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Your academic notes and lecture recordings belong to you. We never sell your personal data or training transcripts.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Actions */}
        <div className="text-center space-y-4 pt-4">
          <Link href="/auth">
            <a>
              <Button size="lg" className="gap-2 px-8 py-6 text-base font-semibold shadow-md">
                Create Your Free Account & Upload
                <ArrowRight className="h-5 w-5" />
              </Button>
            </a>
          </Link>
          <div>
            <Link href="/">
              <a className="text-sm font-medium text-muted-foreground hover:text-foreground underline">
                Return to Homepage
              </a>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
