import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h1 className="text-4xl font-bold mb-4">How can we help?</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input className="pl-10 h-12" placeholder="Search for help articles..." />
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="p-6 border rounded-xl hover-elevate">
            <h3 className="font-bold mb-2">Getting Started</h3>
            <p className="text-sm text-muted-foreground">Learn the basics of using VelocityAI.</p>
          </div>
          <div className="p-6 border rounded-xl hover-elevate">
            <h3 className="font-bold mb-2">Account & Billing</h3>
            <p className="text-sm text-muted-foreground">Manage your subscription and profile.</p>
          </div>
          <div className="p-6 border rounded-xl hover-elevate">
            <h3 className="font-bold mb-2">AI Tools</h3>
            <p className="text-sm text-muted-foreground">Master our summarization and quiz features.</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
