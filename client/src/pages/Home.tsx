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
      <Footer />
    </div>
  );
}
