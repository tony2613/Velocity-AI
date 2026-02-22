import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import SEO from "@/components/SEO";

export default function FAQPage() {
  const faqs = [
    {
      question: "Is VelocityAI free?",
      answer: "Yes, we offer a generous free tier for students to get started with AI-powered learning.",
    },
    {
      question: "What file formats are supported?",
      answer: "We support PDF, TXT, DOCX, and images (via OCR).",
    },
    {
      question: "Can I use it on mobile?",
      answer: "VelocityAI is fully responsive and works great on mobile browsers.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="FAQ – Frequently Asked Questions"
        description="Find answers to common questions about VelocityAI: supported file formats, pricing, how AI summarization works, and how to get started."
        canonicalPath="/faq"
      />
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h1 className="text-4xl font-bold text-center mb-12">Frequently Asked Questions</h1>
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger>{faq.question}</AccordionTrigger>
              <AccordionContent>{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </main>
      <Footer />
    </div>
  );
}
