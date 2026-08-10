import { useState, useMemo } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import SEO from "@/components/SEO";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { 
  Search, 
  Brain, 
  ShieldCheck, 
  CreditCard, 
  Lock, 
  HelpCircle, 
  AlertTriangle,
  Sparkles
} from "lucide-react";

interface FAQItem {
  category: string;
  question: string;
  answer: string;
}

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const categories = [
    { id: "all", label: "All Questions", icon: HelpCircle },
    { id: "basics", label: "Product Basics", icon: Brain },
    { id: "trust", label: "Trust & Accuracy", icon: ShieldCheck },
    { id: "pricing", label: "Pricing & Access", icon: CreditCard },
    { id: "privacy", label: "Privacy & Data", icon: Lock },
    { id: "support", label: "Support & Practical", icon: AlertTriangle },
  ];

  const faqs: FAQItem[] = [
    {
      category: "basics",
      question: "What is Velocity AI and how does it work?",
      answer: "Velocity AI is an intelligent study assistant that transforms lectures, textbooks, PDFs, and notes into concise summaries and active-recall quizzes. Simply upload your files, and our AI instantly extracts key concepts and builds study aids tailored to your learning goals.",
    },
    {
      category: "basics",
      question: "What file types can I upload (PDFs, notes, slides)?",
      answer: "We support PDF documents, TXT files, Word files (DOCX), and PowerPoint presentations (PPTX). You can also upload images of handwritten notes or slides, and our built-in OCR (Optical Character Recognition) will extract the text for processing.",
    },
    {
      category: "basics",
      question: "What subjects/courses does it support?",
      answer: "Velocity AI is subject-agnostic and works for STEM, humanities, law, medicine, business, and languages. The AI automatically adapts to the terminology, formulas, and vocabulary of whichever document or discipline you upload.",
    },
    {
      category: "trust",
      question: "How accurate are the summaries and quizzes?",
      answer: "Our summaries and quizzes are highly accurate because they are built directly from your uploaded materials rather than generic online training data. To guarantee top exam readiness, we recommend occasionally cross-referencing key formulas and terms with your syllabus.",
    },
    {
      category: "trust",
      question: "Is it a replacement for studying, or a supplement?",
      answer: "Velocity AI is a powerful study supplement designed to speed up active recall, comprehension, and self-testing. It works best when paired with your core readings and class attendance to streamline review sessions and pinpoint knowledge gaps.",
    },
    {
      category: "trust",
      question: "Does it work with my specific syllabus/textbook, or is it generic?",
      answer: "It works directly with the specific materials you upload, such as your professor's slides, notes, or assigned chapters. This ensures the generated summaries and quizzes mirror your exact class curriculum rather than generic online topics.",
    },
    {
      category: "pricing",
      question: "Is there a free plan / free trial?",
      answer: "Yes! We offer a generous Free tier that includes 5 file uploads per day, basic summaries, standard OCR, and 3 quizzes per day to help you get started with zero cost or commitment.",
    },
    {
      category: "pricing",
      question: "What's included at each pricing tier?",
      answer: "The Free plan provides basic daily study aids. Velocity Pro ($10/€10/₹99 per month) upgrades you to 50 uploads, unlimited quizzes, priority speed, and chat access. Velocity Elite ($30/€25/₹249 per month) unlocks 200 uploads, expert-level summaries, and unlimited active devices.",
    },
    {
      category: "pricing",
      question: "Can I cancel anytime?",
      answer: "Yes, you can cancel your subscription at any time with a single click in your Settings dashboard. There are no contract terms, cancellation fees, or hidden charges, and you'll keep premium access until the end of your billing cycle.",
    },
    {
      category: "privacy",
      question: "Do you store my uploaded documents?",
      answer: "Your uploaded documents are securely stored in our encrypted database so you can access your summaries and quizzes from any device. You have full control and can permanently delete any document or generated content from your dashboard at any time.",
    },
    {
      category: "privacy",
      question: "Is my data shared or used to train other models?",
      answer: "Absolutely not. We prioritize student privacy: your notes, files, summaries, and chat transcripts are never sold, shared, or used to train third-party language models.",
    },
    {
      category: "support",
      question: "What if the quiz generation or CANA chat doesn't work as expected?",
      answer: "Following our recent Gemini model migration, some users may experience occasional 404 errors during quiz generation or hangs in the CANA chat. If you encounter these issues, try refreshing the page or submitting a bug report via the Help section so our engineering team can fix it.",
    },
    {
      category: "support",
      question: "How do I share notes/quizzes with classmates?",
      answer: "You can easily share your generated study aids by clicking the 'Share' button on any summary or quiz page. This generates a unique, secure link that your classmates can open to study the exact same materials.",
    },
  ];

  const filteredFaqs = useMemo(() => {
    return faqs.filter((faq) => {
      const matchesCategory = activeCategory === "all" || faq.category === activeCategory;
      const matchesSearch = 
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, activeCategory]);

  const faqStructuredData = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  }), []);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <SEO
        title="FAQ – Frequently Asked Questions"
        description="Find answers to common questions about VelocityAI: supported file formats, pricing, how AI summarization works, and how to get started."
        canonicalPath="/faq"
        structuredData={faqStructuredData}
      />
      <Navbar />
      
      {/* Background decoration elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] overflow-hidden pointer-events-none z-0 opacity-30">
        <div className="absolute top-[-20%] left-[20%] w-[400px] h-[400px] rounded-full bg-primary/20 blur-[80px]" />
        <div className="absolute top-[-10%] right-[20%] w-[350px] h-[350px] rounded-full bg-violet-500/20 blur-[100px]" />
      </div>

      <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Header Section */}
        <div className="text-center space-y-4 mb-12">
          <Badge variant="outline" className="px-3 py-1 text-xs text-primary bg-primary/5 border-primary/20">
            <Sparkles className="h-3 w-3 mr-1.5 inline-block text-primary animate-pulse" />
            Support Center
          </Badge>
          <h1 className="text-4xl font-extrabold sm:text-5xl tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-muted-foreground bg-clip-text text-transparent">
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Got questions about Velocity AI? Find quick, direct answers to help you study smarter and faster.
          </p>
        </div>

        {/* Search Input Bar */}
        <div className="relative max-w-xl mx-auto mb-8 shadow-sm rounded-lg">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
            className="pl-12 pr-4 h-12 text-base rounded-lg border-border bg-card/65 backdrop-blur-md focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary transition-all shadow-2xs" 
            placeholder="Search questions, keywords, or topics..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Category Selector Pills */}
        <div className="flex flex-wrap justify-center gap-2 mb-12 max-w-3xl mx-auto">
          {categories.map((category) => {
            const Icon = category.icon;
            const isActive = activeCategory === category.id;
            return (
              <Button
                key={category.id}
                variant={isActive ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveCategory(category.id)}
                className={`rounded-full h-9 px-4 transition-all duration-200 ${
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-sm scale-[1.02]" 
                    : "bg-card/50 hover:bg-muted text-muted-foreground hover:text-foreground hover-elevate"
                }`}
              >
                <Icon className="h-4 w-4 mr-2 shrink-0" />
                {category.label}
              </Button>
            );
          })}
        </div>

        {/* Support Migration Warning Callout */}
        <Alert variant="default" className="mb-10 border-amber-500/20 bg-amber-500/[0.03] dark:bg-amber-500/[0.02] backdrop-blur-sm text-amber-800 dark:text-amber-300">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          <AlertTitle className="font-semibold text-amber-600 dark:text-amber-400">Recent System Update Note</AlertTitle>
          <AlertDescription className="text-sm opacity-90">
            Following our recent Gemini model migration, some users may occasionally encounter issues with quiz generation (e.g. 404 errors) or CANA chat responses. Our team is actively deploying fixes. If you experience a glitch, a simple page refresh will resolve most hiccups.
          </AlertDescription>
        </Alert>

        {/* FAQ Accordion List */}
        <div className="bg-card/40 border border-border/50 rounded-xl p-6 sm:p-8 backdrop-blur-md shadow-xs">
          {filteredFaqs.length > 0 ? (
            <Accordion type="single" collapsible className="w-full space-y-4">
              {filteredFaqs.map((faq, index) => {
                const categoryObj = categories.find(c => c.id === faq.category);
                return (
                  <AccordionItem 
                    key={index} 
                    value={`item-${index}`}
                    className="border border-border/60 rounded-lg px-4 bg-background/50 hover:bg-background/80 transition-all shadow-2xs hover:shadow-xs group"
                  >
                    <AccordionTrigger className="text-left font-semibold text-base py-4 hover:no-underline group-hover:text-primary transition-colors">
                      <span className="flex items-center gap-3">
                        {faq.question}
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground text-sm leading-relaxed pb-4 pt-1 border-t border-dashed border-border/30 mt-2">
                      <div className="flex flex-col gap-3">
                        <p>{faq.answer}</p>
                        {categoryObj && (
                          <div className="flex items-center mt-1">
                            <Badge variant="secondary" className="text-[10px] font-medium py-0.5 px-2 bg-muted/60 text-muted-foreground capitalize flex items-center gap-1 border-none">
                              {categoryObj.label}
                            </Badge>
                          </div>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          ) : (
            <div className="text-center py-12 space-y-4">
              <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto stroke-1 animate-bounce" />
              <div className="space-y-1">
                <h3 className="text-lg font-bold">No results found</h3>
                <p className="text-sm text-muted-foreground">
                  We couldn't find any FAQs matching "{searchQuery}" in this category.
                </p>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setActiveCategory("all");
                }}
                className="mt-2 rounded-full"
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
