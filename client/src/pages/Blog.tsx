import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import SEO from "@/components/SEO";
import { BLOG_POSTS, getPageSeoData } from "@shared/site-data";

export const blogPosts = BLOG_POSTS;

export default function BlogPage() {
  const seoData = getPageSeoData("/blog");

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={seoData.title}
        description={seoData.description}
        canonicalPath="/blog"
        structuredData={seoData.structuredData}
      />
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">VelocityAI Blog</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Cognitive study strategies, active recall research, and guides to mastering exams faster with AI.
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
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
