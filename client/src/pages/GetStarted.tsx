import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Upload, Zap, BookOpen } from "lucide-react";
import SEO from "@/components/SEO";

export default function GetStarted() {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Get Started – Begin Your AI Study Journey"
        description="Sign up for VelocityAI and start uploading notes in minutes. Upload PDFs, images, or text and get instant AI-powered summaries and quizzes."
        canonicalPath="/get-started"
      />
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Welcome to VelocityAI</h1>
          <p className="text-xl text-muted-foreground">
            Get started in 3 simple steps
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="hover-elevate">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Upload className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-lg">Step 1: Upload</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Upload your notes as PDF, images, or text. You can also record audio or paste content from YouTube.
              </p>
            </CardContent>
          </Card>

          <Card className="hover-elevate">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Zap className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-lg">Step 2: Summarize</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Our AI instantly generates clear, concise summaries with key concepts and important bullet points.
              </p>
            </CardContent>
          </Card>

          <Card className="hover-elevate">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-lg">Step 3: Learn</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Take AI-generated quizzes to test your knowledge and reinforce what you've learned.
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Why VelocityAI?</CardTitle>
            <CardDescription>
              Everything you need to study smarter, not harder
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Free for Students</h4>
                <p className="text-muted-foreground text-sm">
                  No hidden fees or premium features. VelocityAI is completely free for all students.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Multiple Formats</h4>
                <p className="text-muted-foreground text-sm">
                  Upload PDFs, images, text files, or record audio—we support all your note formats.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">AI-Powered</h4>
                <p className="text-muted-foreground text-sm">
                  Advanced AI models that understand your content and generate meaningful summaries and quizzes.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Save Time</h4>
                <p className="text-muted-foreground text-sm">
                  Turn hours of studying into minutes. Get instant summaries and practice questions.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-12 text-center space-y-4">
          <Link href="/upload">
            <a>
              <Button size="lg" className="gap-2">
                Start Uploading Notes
                <ArrowRight className="h-5 w-5" />
              </Button>
            </a>
          </Link>
          <Link href="/">
            <a className="block">
              <Button size="lg" variant="outline">
                Back to Home
              </Button>
            </a>
          </Link>
        </div>
      </div>
    </div>
  );
}
