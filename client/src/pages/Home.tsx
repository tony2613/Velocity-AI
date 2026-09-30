import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import HowItWorks from "@/components/HowItWorks";
import FeaturesGrid from "@/components/FeaturesGrid";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { getSoftwareApplicationSchema, BLOG_POSTS } from "@shared/site-data";
import { Link } from "wouter";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ArrowRight, BookOpen } from "lucide-react";

export default function Home() {
  // Donation popup removed per user request

  return (
    <div className="min-h-screen">
      <SEO
        title="AI-Powered Study Tool for Students"
        description="Transform your notes, PDFs, and lectures into AI-powered summaries and quizzes instantly. Study smarter with VelocityAI — free to get started."
        canonicalPath="/"
        structuredData={getSoftwareApplicationSchema()}
      />
      <Navbar />
      <HeroSection />
      <HowItWorks />
      <FeaturesGrid />

      {/* Featured Educational Blog Section for internal linking & AI search crawlability */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-t border-border bg-background">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-2 max-w-2xl">
              <span className="text-xs font-bold text-primary uppercase tracking-wider">Learning Science & Guides</span>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Evidence-Based Study Strategies</h2>
              <p className="text-muted-foreground text-sm sm:text-base">
                Discover how cognitive retrieval practice, spaced repetition intervals, and generative AI dramatically improve exam retention.
              </p>
            </div>
            <Link href="/blog">
              <a className="inline-flex items-center text-sm font-semibold text-primary hover:underline shrink-0">
                View All Articles <ArrowRight className="h-4 w-4 ml-1" />
              </a>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {BLOG_POSTS.map((post) => (
              <Link key={post.id} href={`/blog/${post.id}`}>
                <a className="block group h-full">
                  <Card className="hover-elevate h-full transition-all group-hover:border-primary/50 flex flex-col justify-between bg-card border-border">
                    <CardHeader className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{post.date}</span>
                        <span className="flex items-center gap-1"><BookOpen className="h-3 w-3" /> 4 min read</span>
                      </div>
                      <CardTitle className="text-lg font-bold group-hover:text-primary transition-colors">
                        {post.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                        {post.summary}
                      </p>
                      <div className="pt-2 text-xs font-semibold text-primary flex items-center group-hover:translate-x-1 transition-transform">
                        Read full guide &rarr;
                      </div>
                    </CardContent>
                  </Card>
                </a>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 text-center px-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">About Velocity AI</h2>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl mx-auto">
            Velocity AI is an intelligent, AI-powered study assistant platform designed to transform the way you learn. By converting lengthy study materials—such as textbooks, lecture notes, academic PDFs, presentations, and audio recordings—into concise, structured summaries and interactive practice quizzes, Velocity AI helps students, researchers, and professionals study smarter, test their knowledge, and boost learning efficiency.
          </p>
        </div>
      </section>
      <Footer />
    </div>
  );
}
