import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import SEO from "@/components/SEO";
import { Loader2 } from "lucide-react";

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
        title: "Message Sent",
        description: "We'll get back to you as soon as possible.",
      });

      // Clear the form
      setName("");
      setEmail("");
      setMessage("");
    } catch (error: any) {
      console.error("Submission error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Contact Us – VelocityAI Support"
        description="Have a question or need help? Reach out to the VelocityAI team and we'll get back to you as soon as possible."
        canonicalPath="/contact"
      />
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h1 className="text-4xl font-bold text-center mb-8">Contact Us</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Name</label>
            <Input 
              placeholder="Your Name" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              required 
              disabled={isSubmitting}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <Input 
              type="email" 
              placeholder="Email Address" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
              disabled={isSubmitting}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Message</label>
            <Textarea 
              placeholder="How can we help?" 
              className="min-h-[150px]" 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required 
              disabled={isSubmitting}
            />
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending Message...
              </>
            ) : (
              "Send Message"
            )}
          </Button>
        </form>
      </main>
      <Footer />
    </div>
  );
}
