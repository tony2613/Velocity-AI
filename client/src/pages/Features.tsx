import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Zap, Calendar, Target, TrendingUp, FolderOpen, Share2 } from "lucide-react";
import SEO from "@/components/SEO";
import { FEATURES, getPageSeoData } from "@shared/site-data";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

const FEATURE_ICONS: Record<string, any> = {
  "ai-summarization": Brain,
  "quiz-generation": Zap,
  "exam-calendar": Calendar,
  "adaptive-planner": Target,
  "weakness-tracker": TrendingUp,
  "note-organization": FolderOpen,
  "export-tools": Share2,
};

export default function FeaturesPage() {
  const seoData = getPageSeoData("/features");

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={seoData.title}
        description={seoData.description}
        canonicalPath="/features"
        structuredData={seoData.structuredData}
      />
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-4">
            AI-Powered Exam Preparation
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">Powerful Study Features</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need to master your subjects faster with intelligent study automation.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {FEATURES.map((feature) => {
            const Icon = FEATURE_ICONS[feature.id] || Brain;
            return (
              <Card key={feature.id} className="hover-elevate flex flex-col justify-between transition-all duration-200">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-3 bg-primary/10 rounded-xl text-primary">
                      <Icon className="h-6 w-6" />
                    </div>
                    {feature.isNew && (
                      <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-primary/20 text-primary border border-primary/30">
                        NEW
                      </span>
                    )}
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm font-medium text-foreground">{feature.shortDesc}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{feature.fullDesc}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="text-center bg-card border border-border/60 rounded-3xl p-8 sm:p-12 max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">Ready to transform your study routine?</h2>
          <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
            Join students using VelocityAI to summarize lectures, generate practice quizzes, and plan exam schedules in minutes.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/auth">
              <Button size="lg" className="rounded-xl px-8 font-semibold">
                Get Started Free
              </Button>
            </Link>
            <Link href="/pricing">
              <Button size="lg" variant="outline" className="rounded-xl px-8 font-semibold">
                View Pricing
              </Button>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
