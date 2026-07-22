import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import HowItWorks from "@/components/HowItWorks";
import FeaturesGrid from "@/components/FeaturesGrid";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";

const homeStructuredData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "VelocityAI",
  applicationCategory: "EducationApplication",
  operatingSystem: "Web",
  description:
    "AI-powered study tool that transforms notes, PDFs, and lectures into smart summaries and quizzes.",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  author: {
    "@type": "Organization",
    name: "VelocityAI",
    url: "https://velocityai.app",
  },
};

export default function Home() {
  // Donation popup removed per user request

  return (
    <div className="min-h-screen">
      <SEO
        title="AI-Powered Study Tool for Students"
        description="Transform your notes, PDFs, and lectures into AI-powered summaries and quizzes instantly. Study smarter with VelocityAI — free to get started."
        canonicalPath="/"
        structuredData={homeStructuredData}
      />
      <Navbar />
      <HeroSection />
      <HowItWorks />
      <FeaturesGrid />
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
