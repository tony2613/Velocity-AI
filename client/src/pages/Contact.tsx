import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import SEO from "@/components/SEO";
import { Loader2, Mail, MessageSquare, Clock, ShieldCheck, HelpCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function ContactPage() {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, message }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to send message");
      }

      toast({
        title: "Message Sent Successfully",
        description: "Thank you for reaching out. Our student support team will reply within 24 to 48 hours.",
      });

      // Clear the form
      setName("");
      setEmail("");
      setMessage("");
    } catch (error: any) {
      console.error("Submission error:", error);
      toast({
        title: "Submission Error",
        description: error.message || "Failed to send message. Please try again or email us directly.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between">
      <SEO
        title="Contact VelocityAI – Student Support, Feedback & Inquiries"
        description="Have a question about document OCR, AI study summaries, or subscription plans? Contact the VelocityAI support team for quick assistance."
        canonicalPath="/contact"
      />
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
        <header className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wide uppercase">
            <Mail className="h-3.5 w-3.5" />
            Get in Touch
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
            We’re Here to Help You Study Smarter
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Have questions about processing complex PDF lecture slides, setting up your exam calendar, or managing your subscription? Reach out to the VelocityAI student support team.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 max-w-6xl mx-auto items-start">
          {/* Left Column: Contact Form */}
          <div className="lg:col-span-7">
            <Card className="border-border bg-card shadow-sm p-6 sm:p-8 space-y-6">
              <CardHeader className="p-0 space-y-1">
                <CardTitle className="text-2xl font-bold">Send Us a Direct Message</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  Fill out the form below and an academic support specialist will respond to your email.
                </CardDescription>
              </CardHeader>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">Your Full Name</label>
                  <Input 
                    placeholder="e.g. Alex Johnson" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required 
                    disabled={isSubmitting}
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">Email Address</label>
                  <Input 
                    type="email" 
                    placeholder="alex@university.edu" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required 
                    disabled={isSubmitting}
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">How Can We Help You?</label>
                  <Textarea 
                    placeholder="Describe your question, feature suggestion, or any difficulty you experienced with document uploading or quizzes..." 
                    className="min-h-[160px] resize-y" 
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required 
                    disabled={isSubmitting}
                  />
                </div>
                <Button type="submit" size="lg" className="w-full font-semibold shadow-sm" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending Your Message...
                    </>
                  ) : (
                    "Send Message"
                  )}
                </Button>
              </form>
            </Card>
          </div>

          {/* Right Column: Support Overview & FAQs */}
          <div className="lg:col-span-5 space-y-6">
            <Card className="border-border bg-card shadow-sm p-6 space-y-4">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Response Time & Availability
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Our support desk is active Monday through Friday, 9:00 AM – 6:00 PM UTC. We review every student submission and aim to respond within 24 to 48 business hours.
              </p>
              <div className="pt-2 border-t border-border/60 text-xs text-muted-foreground flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>Your personal contact data is strictly encrypted and protected.</span>
              </div>
            </Card>

            <Card className="border-border bg-card shadow-sm p-6 space-y-4">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                Support Inquiries We Handle
              </h2>
              <ul className="text-sm text-muted-foreground space-y-2.5">
                <li className="flex items-start gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0"></span>
                  <span><strong>Document & OCR Parsing:</strong> Assistance with scanned textbook readability, layout anomalies, or PPTX formatting.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0"></span>
                  <span><strong>Account & Plan Changes:</strong> Guidance on Velocity Pro and Elite tiers, active device reset requests, or receipts.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0"></span>
                  <span><strong>Academic Partnerships:</strong> Inquiries regarding university student organization discounts and campus licenses.</span>
                </li>
              </ul>
            </Card>

            <Card className="border-border bg-card/60 p-6 space-y-3">
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-primary" />
                Quick Tip
              </h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Looking for step-by-step instructions right now? Check out our interactive <a href="/tutorials" className="text-primary underline font-medium">Tutorials Page</a> or browse the <a href="/faq" className="text-primary underline font-medium">Frequently Asked Questions</a> for instant answers.
              </p>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
