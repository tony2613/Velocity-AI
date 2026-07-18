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
      <section className="py-12 bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 text-center px-4">
        <div className="max-w-3xl mx-auto space-y-4">
          <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">About Velocity AI & Google Login</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Velocity AI is an intelligent study assistant platform designed to help students, researchers, and learners organize study notes, summarize academic materials, generate practice quizzes, and boost learning efficiency. We provide secure Google Sign-in to authenticate user accounts, keep track of study progress, and sync study materials across devices. By logging in with Google, you grant us access to your name and email address, which we use strictly for account identification and personalization.
          </p>
        </div>
      </section>
      <Footer />
    </div>
  );
}
