import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Lock, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import GuestUploadZone from "@/components/GuestUploadZone";
import SEO from "@/components/SEO";

export default function GuestDemo() {
    return (
        <div className="min-h-screen bg-background">
            <SEO
                title="Try VelocityAI Free – No Signup Required"
                description="Upload a PDF or paste your notes and get an instant AI summary, quiz, and AI research — no account needed. Try VelocityAI for free right now."
                canonicalPath="/demo"
            />
            <Navbar />

            {/* Top Banner */}
            <div className="bg-primary/10 border-b border-primary/20 text-center py-3 px-4">
                <p className="text-sm flex items-center justify-center gap-2 flex-wrap">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <span className="font-medium">Free demo — no account needed.</span>
                    <span className="text-muted-foreground">You get 1 summary · 1 quiz · 1 search.</span>
                    <Link href="/auth">
                        <span className="text-primary font-semibold hover:underline cursor-pointer inline-flex items-center gap-1">
                            Sign up free for more <ArrowRight className="h-3.5 w-3.5" />
                        </span>
                    </Link>
                </p>
            </div>

            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
                {/* Hero text */}
                <div className="text-center space-y-4">
                    <Badge variant="secondary" className="gap-1.5 px-3 py-1 text-sm">
                        <Sparkles className="h-3.5 w-3.5" /> AI-Powered Demo
                    </Badge>
                    <h1 className="text-4xl sm:text-5xl font-bold leading-tight">
                        Try it yourself — <span className="text-primary">right now</span>
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                        Upload a PDF, paste notes, or drop any document. Our AI will summarize it, generate a quiz, and answer your questions — instantly.
                    </p>
                </div>

                {/* Steps indicator */}
                <div className="flex items-center justify-center gap-0">
                    {[
                        { num: "1", label: "Upload" },
                        { num: "2", label: "Summary" },
                        { num: "3", label: "Quiz" },
                        { num: "4", label: "Search" },
                    ].map((step, i, arr) => (
                        <div key={step.num} className="flex items-center">
                            <div className="flex flex-col items-center gap-1">
                                <div className="h-8 w-8 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center text-xs font-bold text-primary">
                                    {step.num}
                                </div>
                                <span className="text-xs text-muted-foreground hidden sm:block">{step.label}</span>
                            </div>
                            {i < arr.length - 1 && (
                                <div className="h-px w-8 sm:w-16 bg-border mx-1 mb-3" />
                            )}
                        </div>
                    ))}
                </div>

                {/* Main upload zone */}
                <GuestUploadZone />

                {/* CTA footer */}
                <div className="text-center py-6 border-t space-y-4">
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                        <Lock className="h-4 w-4" />
                        <span>Your demo content is processed but never saved to any account</span>
                    </div>
                    <div className="space-y-2">
                        <p className="text-sm font-medium">Want to save your notes and get unlimited access?</p>
                        <div className="flex gap-3 justify-center flex-wrap">
                            <Link href="/auth?tab=register">
                                <Button className="gap-2">
                                    <Sparkles className="h-4 w-4" /> Create free account
                                </Button>
                            </Link>
                            <Link href="/pricing">
                                <Button variant="outline">View pricing</Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
