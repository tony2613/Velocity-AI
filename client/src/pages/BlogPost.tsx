import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useRoute } from "wouter";
import { blogPosts } from "./Blog";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import SEO from "@/components/SEO";
import { useMemo } from "react";

export default function BlogPost() {
  const [, params] = useRoute("/blog/:id");
  const post = blogPosts.find((p) => p.id === params?.id);

  const postStructuredData = useMemo(() => {
    if (!post) return undefined;
    
    let dateStr = "2026-08-10";
    try {
      const d = new Date(post.date);
      if (!isNaN(d.getTime())) {
        dateStr = d.toISOString().split('T')[0];
      }
    } catch (e) {
      console.error(e);
    }

    return {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": post.title,
      "datePublished": dateStr,
      "description": post.summary,
      "articleBody": post.content,
      "publisher": {
        "@type": "Organization",
        "name": "VelocityAI",
        "logo": {
          "@type": "ImageObject",
          "url": "https://velocityaisoftware.app/pwa-512x512.png"
        }
      },
      "author": {
        "@type": "Organization",
        "name": "VelocityAI Team"
      }
    };
  }, [post]);

  if (!post) {
    return (
      <div className="min-h-screen bg-background">
        <SEO title="Post Not Found" description="The requested blog post was not found on VelocityAI." />
        <Navbar />
        <main className="max-w-3xl mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">Post not found</h1>
          <Link href="/blog">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="h-4 w-4" /> Back to Blog
            </Button>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={post.title}
        description={post.summary}
        canonicalPath={`/blog/${post.id}`}
        structuredData={postStructuredData}
      />
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <Link href="/blog">
          <Button variant="ghost" className="gap-2 mb-8 -ml-2 hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Blog
          </Button>
        </Link>
        
        <article className="prose dark:prose-invert max-w-none">
          <header className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">{post.title}</h1>
            <p className="text-muted-foreground font-medium">{post.date}</p>
          </header>
          
          <div className="text-lg leading-relaxed space-y-6 whitespace-pre-wrap">
            {post.content}
          </div>
        </article>

        {/* Related Articles Section for strong internal linking & crawlability */}
        <section className="mt-16 pt-12 border-t border-border space-y-8">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight">Related Study Science Articles</h2>
            <p className="text-sm text-muted-foreground">Continue expanding your cognitive study strategies.</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {blogPosts
              .filter((p) => p.id !== post.id)
              .slice(0, 3)
              .map((related) => (
                <Link key={related.id} href={`/blog/${related.id}`}>
                  <a className="p-4 rounded-xl border border-border bg-card hover:border-primary/50 transition-colors block group space-y-1">
                    <span className="text-xs text-muted-foreground">{related.date}</span>
                    <h3 className="font-semibold text-sm group-hover:text-primary transition-colors leading-snug">
                      {related.title}
                    </h3>
                  </a>
                </Link>
              ))}
          </div>

          {/* Quick CTA to Getting Started Guide */}
          <div className="p-6 rounded-2xl bg-muted/40 border border-border/80 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <h3 className="font-bold text-base">Ready to apply these techniques?</h3>
              <p className="text-xs text-muted-foreground">Generate your first AI summary and active recall practice quiz in minutes.</p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <Link href="/get-started">
                <a className="inline-flex px-4 py-2 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:opacity-90">
                  Getting Started Guide &rarr;
                </a>
              </Link>
              <Link href="/tutorials">
                <a className="inline-flex px-4 py-2 rounded-xl text-xs font-medium border border-border hover:bg-background">
                  Tutorials
                </a>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
