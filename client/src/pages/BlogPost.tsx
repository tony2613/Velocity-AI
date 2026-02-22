import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useRoute } from "wouter";
import { blogPosts } from "./Blog";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function BlogPost() {
  const [, params] = useRoute("/blog/:id");
  const post = blogPosts.find((p) => p.id === params?.id);

  if (!post) {
    return (
      <div className="min-h-screen bg-background">
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
      </main>
      <Footer />
    </div>
  );
}
