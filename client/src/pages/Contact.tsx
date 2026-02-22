import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import SEO from "@/components/SEO";

export default function ContactPage() {
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Message Sent",
      description: "We'll get back to you as soon as possible.",
    });
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
            <Input placeholder="Your Name" required />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <Input type="email" placeholder="Email Address" required />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Message</label>
            <Textarea placeholder="How can we help?" className="min-h-[150px]" required />
          </div>
          <Button type="submit" className="w-full">Send Message</Button>
        </form>
      </main>
      <Footer />
    </div>
  );
}
