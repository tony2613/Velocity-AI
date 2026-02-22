import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import SEO from "@/components/SEO";

export const blogPosts = [
  {
    id: "future-of-ai",
    title: "The Future of AI in Education",
    date: "Jan 1, 2026",
    summary: "How AI is changing the way students learn.",
    content: `
      AI is no longer just a futuristic concept; it's a present reality in classrooms worldwide. 
      From personalized learning paths to instant summarization, AI tools like VelocityAI are 
      empowering students to tackle complex subjects with newfound confidence.

      In the coming years, we expect to see even deeper integration of AI in curriculum design 
      and real-time feedback systems that adapt to each student's unique learning pace.
    `
  },
  {
    id: "study-hacks-2026",
    title: "Top 5 Study Hacks for 2026",
    date: "Dec 15, 2025",
    summary: "Boost your productivity with these simple tips.",
    content: `
      1. Use AI for Initial Summaries: Don't read 50 pages if you can get the core concepts in 2.
      2. Interval Recall Quizzing: Turn your summaries into quizzes immediately.
      3. Digital Minimalism: Keep your study environment clutter-free.
      4. Pomodoro 2.0: Use AI-timed focus sessions.
      5. Collaborative Learning: Share your AI-generated insights with peers.
    `
  },
];

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Blog – AI Study Tips & Learning Guides"
        description="Read VelocityAI's blog for study tips, AI learning strategies, and guides to help you master your subjects faster using AI-powered tools."
        canonicalPath="/blog"
      />
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h1 className="text-4xl font-bold mb-12 text-center">VelocityAI Blog</h1>
        <div className="grid md:grid-cols-2 gap-8">
          {blogPosts.map((post) => (
            <Link key={post.id} href={`/blog/${post.id}`}>
              <a className="block group">
                <Card className="hover-elevate h-full transition-all group-hover:border-primary/50">
                  <CardHeader>
                    <CardTitle className="group-hover:text-primary transition-colors">{post.title}</CardTitle>
                    <p className="text-xs text-muted-foreground">{post.date}</p>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{post.summary}</p>
                  </CardContent>
                </Card>
              </a>
            </Link>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
