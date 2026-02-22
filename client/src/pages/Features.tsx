import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, FileText, Zap, Share2 } from "lucide-react";
import SEO from "@/components/SEO";

export default function FeaturesPage() {
  const features = [
    {
      title: "AI Summarization",
      description: "Get concise, high-quality summaries of your long lectures, textbooks, or research papers in seconds.",
      icon: <Brain className="h-8 w-8 text-primary" />,
    },
    {
      title: "Quiz Generation",
      description: "Instantly turn any note or document into a comprehensive quiz to test your knowledge.",
      icon: <Zap className="h-8 w-8 text-primary" />,
    },
    {
      title: "Note Organization",
      description: "Keep all your study materials organized by subject and date with an intuitive dashboard.",
      icon: <FileText className="h-8 w-8 text-primary" />,
    },
    {
      title: "Export Tools",
      description: "Easily export your notes and summaries to multiple formats or even GitHub for version control.",
      icon: <Share2 className="h-8 w-8 text-primary" />,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Features – AI Summarization, Quiz Generation & More"
        description="Explore VelocityAI's powerful study features: instant AI summaries, auto-generated quizzes, note organization, and export tools to accelerate your learning."
        canonicalPath="/features"
      />
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4">Powerful Study Features</h1>
          <p className="text-xl text-muted-foreground">Everything you need to master your subjects faster.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="hover-elevate">
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">{feature.icon}</div>
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
