import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import SEO from "@/components/SEO";
import { BLOG_POSTS, getPageSeoData } from "@shared/site-data";
import { BookOpen, Brain, Sparkles, HelpCircle, CheckCircle2, ArrowRight } from "lucide-react";

export const blogPosts = BLOG_POSTS;

export default function BlogPage() {
  const seoData = getPageSeoData("/blog");

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between">
      <SEO
        title={seoData.title}
        description={seoData.description}
        canonicalPath="/blog"
        structuredData={seoData.structuredData}
      />
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider">
            <Brain className="h-3.5 w-3.5" />
            Learning Science & Research
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
            The VelocityAI Learning Blog
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Evidence-based study methodologies, active recall cognitive science, and tactical exam preparation strategies designed to help university and secondary students learn deeply in half the time.
          </p>
        </div>

        {/* Blog Posts Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Latest Research & Articles</h2>
              <p className="text-sm text-muted-foreground">Practical insights on memory retention, retrieval practice, and AI-assisted learning.</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-muted text-muted-foreground">
              {blogPosts.length} Articles
            </span>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {blogPosts.map((post) => (
              <Link key={post.id} href={`/blog/${post.id}`}>
                <a className="block group h-full">
                  <Card className="hover-elevate h-full transition-all group-hover:border-primary/50 flex flex-col justify-between bg-card border-border">
                    <CardHeader className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-primary uppercase tracking-wider">{post.date}</span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <BookOpen className="h-3 w-3" /> 4 min read
                        </span>
                      </div>
                      <CardTitle className="group-hover:text-primary transition-colors text-xl font-bold leading-snug">
                        {post.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-muted-foreground text-sm leading-relaxed">{post.summary}</p>
                      <div className="pt-2 flex items-center text-sm font-semibold text-primary group-hover:translate-x-1 transition-transform">
                        Read full guide <ArrowRight className="h-4 w-4 ml-1" />
                      </div>
                    </CardContent>
                  </Card>
                </a>
              </Link>
            ))}
          </div>
        </div>

        {/* Cognitive Frameworks Section */}
        <section className="p-8 sm:p-10 rounded-3xl border border-border bg-card/60 space-y-8">
          <div className="max-w-3xl space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Core Evidence-Based Learning Frameworks</h2>
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
              VelocityAI is engineered upon foundational cognitive psychology principles that have been tested and verified across hundreds of empirical academic studies. Here is how our automated workflows support your brain’s natural memory consolidation processes:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl border border-border/80 bg-background/80 space-y-3">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary w-fit">
                <Brain className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-lg">Active Recall (Retrieval Practice)</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Rather than passively reading lecture slides, forcing your brain to retrieve knowledge produces robust neural pathways. Our system generates practice tests automatically so you test yourself immediately after reading.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-border/80 bg-background/80 space-y-3">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary w-fit">
                <Sparkles className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-lg">Spaced Repetition & Interval Decay</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Ebbinghaus’s Forgetting Curve demonstrates that memories decay rapidly without periodic review. Our adaptive study planner calculates optimal intervals (24h, 72h, 1 week) to reinforce concepts right before you forget them.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-border/80 bg-background/80 space-y-3">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary w-fit">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-lg">Targeted Diagnostic Weakness Drills</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Students often spend revision time restudying concepts they already know well because it feels satisfying. Our diagnostic engine pinpoints low-scoring subtopics and forces focused deliberate practice where it matters most.
              </p>
            </div>
          </div>
        </section>

        {/* Study FAQ Section */}
        <section className="space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Study Science Frequently Asked Questions</h2>
            <p className="text-sm text-muted-foreground">Answers to common student questions about study habits, memory retention, and digital revision.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            <Card className="border-border bg-card p-6 space-y-2">
              <h3 className="font-bold text-base flex items-start gap-2">
                <HelpCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                Why does rereading notes feel so effective when it produces poor results?
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed pl-7">
                Cognitive scientists call this the "fluency illusion" or "illusion of competence." When you reread text, your eyes easily recognize the words and syntax, leading your brain to mistake visual familiarity for true mastery. Real mastery requires unprompted recall.
              </p>
            </Card>

            <Card className="border-border bg-card p-6 space-y-2">
              <h3 className="font-bold text-base flex items-start gap-2">
                <HelpCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                How many practice quizzes should I take before an exam?
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed pl-7">
                Research recommends taking at least 3 distributed quiz iterations per topic spread across several days. VelocityAI generates unlimited quizzes from your uploaded documents, enabling you to test knowledge from varying angles.
              </p>
            </Card>

            <Card className="border-border bg-card p-6 space-y-2">
              <h3 className="font-bold text-base flex items-start gap-2">
                <HelpCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                How should I structure study sessions during exam week?
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed pl-7">
                Use 45-minute focused study blocks followed by 10-minute breaks (the Pomodoro technique). Begin each session with a 10-question diagnostic quiz on the previous day's material, review incorrect answers, and then advance to new topics.
              </p>
            </Card>

            <Card className="border-border bg-card p-6 space-y-2">
              <h3 className="font-bold text-base flex items-start gap-2">
                <HelpCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                Can VelocityAI process handwritten lecture notes and whiteboard photos?
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed pl-7">
                Yes. VelocityAI integrates high-precision OCR models that parse handwritten notes, diagrams, mathematical notations, and lecture presentation decks into clean text ready for instant summarization and quiz creation.
              </p>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

