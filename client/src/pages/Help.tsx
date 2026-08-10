import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Search, Bug, HelpCircle, Loader2, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function HelpPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("faq");

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [steps, setSteps] = useState("");
  const [severity, setSeverity] = useState("low");

  const bugReportMutation = useMutation({
    mutationFn: async (reportData: {
      title: string;
      description: string;
      stepsToReproduce: string;
      severity: string;
    }) => {
      const res = await fetch("/api/bug-reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reportData),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to submit bug report");
      }
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Bug Report Submitted",
        description: data.message || "Thank you! Our engineering team will look into this.",
      });
      // Clear form
      setTitle("");
      setDescription("");
      setSteps("");
      setSeverity("low");
      // Switch back to FAQ
      setActiveTab("faq");
    },
    onError: (error: Error) => {
      toast({
        title: "Submission Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleBugSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      toast({
        title: "Missing fields",
        description: "Title and description are required to submit a bug report.",
        variant: "destructive",
      });
      return;
    }
    bugReportMutation.mutate({
      title,
      description,
      stepsToReproduce: steps,
      severity,
    });
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <Navbar />
      
      {/* Background blobs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[400px] overflow-hidden pointer-events-none z-0 opacity-20">
        <div className="absolute top-[-10%] left-[10%] w-[350px] h-[350px] rounded-full bg-violet-600/30 blur-[90px]" />
        <div className="absolute top-[-5%] right-[10%] w-[300px] h-[300px] rounded-full bg-primary/30 blur-[90px]" />
      </div>

      <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex flex-col items-center mb-10 text-center space-y-4">
            <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-muted-foreground bg-clip-text text-transparent sm:text-5xl">
              Support Center
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl">
              Need assistance? Browse common topics or submit a detailed bug report directly to our development team.
            </p>

            <TabsList className="bg-muted/80 p-1 rounded-full border border-border mt-4">
              <TabsTrigger 
                value="faq" 
                className="rounded-full px-6 py-1.5 text-xs font-semibold data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all"
              >
                <HelpCircle className="h-3.5 w-3.5 mr-2" />
                Help Center
              </TabsTrigger>
              <TabsTrigger 
                value="bug" 
                className="rounded-full px-6 py-1.5 text-xs font-semibold data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all"
              >
                <Bug className="h-3.5 w-3.5 mr-2" />
                Report a Bug
              </TabsTrigger>
            </TabsList>
          </div>

          {/* HELP CENTER FAQ CONTENT */}
          <TabsContent value="faq" className="space-y-12">
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input 
                className="pl-12 h-12 text-base rounded-lg border-border bg-card/65 backdrop-blur-md focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary shadow-2xs" 
                placeholder="Search help articles..." 
              />
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <Card className="hover-elevate bg-card/45 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <CardTitle className="text-base font-bold">Getting Started</CardTitle>
                  <CardDescription className="text-xs">Learn the basics of using VelocityAI.</CardDescription>
                </CardHeader>
                <CardContent className="text-xs text-muted-foreground">
                  Find setup tutorials, dashboard navigation guides, and tips on uploading notes to speed up your learning loop.
                </CardContent>
              </Card>

              <Card className="hover-elevate bg-card/45 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <CardTitle className="text-base font-bold">Account & Billing</CardTitle>
                  <CardDescription className="text-xs">Manage your subscription and profile.</CardDescription>
                </CardHeader>
                <CardContent className="text-xs text-muted-foreground">
                  Learn about plan limits, subscription upgrades, cancellations, and requesting refunds directly from settings.
                </CardContent>
              </Card>

              <Card className="hover-elevate bg-card/45 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <CardTitle className="text-base font-bold">AI Tools</CardTitle>
                  <CardDescription className="text-xs">Master our summarization and quiz features.</CardDescription>
                </CardHeader>
                <CardContent className="text-xs text-muted-foreground">
                  Understand how notes are parsed via OCR, how practice quizzes are built, and how to query CANA AI chat assistant.
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* REPORT A BUG CONTENT */}
          <TabsContent value="bug">
            <Card className="bg-card/45 backdrop-blur-md border-border/50 max-w-2xl mx-auto shadow-sm">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-red-500/10 text-red-500">
                    <Bug className="h-4 w-4" />
                  </span>
                  <div>
                    <CardTitle className="text-lg font-bold">Submit Bug Report</CardTitle>
                    <CardDescription className="text-xs">Report glitches, failures, or errors directly to engineering.</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleBugSubmit} className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground flex items-center justify-between">
                      <span>Bug Title</span>
                      <span className="text-[10px] text-red-500/80 font-normal">Required</span>
                    </label>
                    <Input 
                      placeholder="e.g., Note upload crashes on PDF pages exceeding 100" 
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="rounded-xl border-border bg-background/60 h-10 text-sm"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground">Severity Level</label>
                      <Select value={severity} onValueChange={setSeverity}>
                        <SelectTrigger className="rounded-xl border-border bg-background/60 h-10 text-sm">
                          <SelectValue placeholder="Select severity" />
                        </SelectTrigger>
                        <SelectContent className="glass-panel">
                          <SelectItem value="low">Low (Minor visual issue)</SelectItem>
                          <SelectItem value="medium">Medium (Feature glitch, workaround exists)</SelectItem>
                          <SelectItem value="high">High (Feature unusable)</SelectItem>
                          <SelectItem value="critical">Critical (App crash or security hazard)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground flex items-center justify-between">
                      <span>Description</span>
                      <span className="text-[10px] text-red-500/80 font-normal">Required</span>
                    </label>
                    <Textarea 
                      placeholder="Please describe what happened, what you expected, and what actually occurred..." 
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="rounded-xl border-border bg-background/60 min-h-[100px] text-sm leading-relaxed"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Steps to Reproduce (Optional)</label>
                    <Textarea 
                      placeholder="1. Go to Upload Note&#10;2. Select a file with scanned handwritten images&#10;3. Click Extract...&#10;4. See error box" 
                      value={steps}
                      onChange={(e) => setSteps(e.target.value)}
                      className="rounded-xl border-border bg-background/60 min-h-[80px] text-sm leading-relaxed font-mono text-xs"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-violet-600 hover:bg-violet-700 text-white rounded-xl h-11 text-sm font-semibold transition-all shadow-md shadow-violet-500/10 flex items-center justify-center gap-2"
                    disabled={bugReportMutation.isPending}
                  >
                    {bugReportMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Submitting Bug Report...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        Submit Report
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
}
