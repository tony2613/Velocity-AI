import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Check, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import SEO from "@/components/SEO";

const tiers = [
    {
        name: "Free",
        price: "₹0",
        period: "/month",
        description: "Essential tools for casual students",
        features: [
            "5 Uploads per day",
            "Basic text summarization",
            "Standard OCR processing",
            "3 Quizzes per day",
            "No Research Mode"
        ],
        limit: "5 uploads",
        searchLimit: "0 searches",
        value: "free"
    },
    {
        name: "Velocity Pro",
        price: "₹99",
        period: "/month",
        description: "Perfect for dedicated learners",
        features: [
            "50 Uploads per day",
            "Priority processing",
            "Advanced summarization",
            "Unlimited Quizzes",
            "Limited Research Mode (10/day)"
        ],
        limit: "50 uploads",
        searchLimit: "10 searches",
        value: "pro",
        popular: true
    },
    {
        name: "Velocity Elite",
        price: "₹249",
        period: "/month",
        description: "Ultimate power for heavy research",
        features: [
            "200 Uploads per day",
            "Fastest processing speed",
            "Expert-level summaries",
            "Unlimited Quizzes",
            "Unlimited Research Mode (100/day)"
        ],
        limit: "200 uploads",
        searchLimit: "Unlimited",
        value: "elite"
    }
];

export default function Pricing() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [loadingTier, setLoadingTier] = useState<string | null>(null);

    const upgradeMutation = useMutation({
        mutationFn: async (tier: string) => {
            const res = await apiRequest("POST", "/api/debug/set-tier", { tier });
            return res.json();
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["/api/user"] });
            toast({
                title: "Subscription Updated",
                description: `You are now on the ${data.tier} plan!`,
            });
            setLoadingTier(null);
        },
        onError: (error: Error) => {
            toast({
                title: "Update failed",
                description: error.message,
                variant: "destructive",
            });
            setLoadingTier(null);
        },
    });

    const handleUpgrade = (tier: string) => {
        if (!user) {
            toast({
                title: "Login Required",
                description: "Please log in to upgrade your plan.",
            });
            return;
        }
        setLoadingTier(tier);
        upgradeMutation.mutate(tier);
    };

    return (
        <div className="min-h-screen bg-background relative">
            <SEO
                title="Pricing – Affordable Plans for Students"
                description="Choose from VelocityAI's Free, Velocity Pro, and Velocity Elite plans. Start free or upgrade for unlimited AI summaries, quizzes, and research mode."
                canonicalPath="/pricing"
            />
            <Button
                variant="ghost"
                size="icon"
                onClick={() => window.history.back()}
                className="absolute top-4 left-4 z-50 rounded-full bg-background/50 hover:bg-muted"
            >
                <ArrowLeft className="h-6 w-6" />
            </Button>
            <div className="py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center space-y-4 mb-16">
                        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                            Simple, Transparent Pricing
                        </h1>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                            Choose the plan that fits your study needs. Upgrade anytime to unlock more power.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        {tiers.map((tier) => {
                            const isCurrent = user?.subscriptionTier === tier.value;
                            return (
                                <Card
                                    key={tier.name}
                                    className={`relative flex flex-col ${tier.popular ? 'border-primary shadow-lg scale-105 z-10' : 'border-border'}`}
                                >
                                    {tier.popular && (
                                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
                                            MOST POPULAR
                                        </div>
                                    )}
                                    <CardHeader>
                                        <CardTitle className="text-2xl">{tier.name}</CardTitle>
                                        <CardDescription>{tier.description}</CardDescription>
                                        <div className="mt-4">
                                            <span className="text-4xl font-bold">{tier.price}</span>
                                            <span className="text-muted-foreground">{tier.period}</span>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="flex-1">
                                        <ul className="space-y-3">
                                            {tier.features.map((feature) => (
                                                <li key={feature} className="flex items-start gap-2 text-sm">
                                                    <Check className="h-4 w-4 text-green-500 mt-1 shrink-0" />
                                                    <span>{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                    <CardFooter>
                                        <Button
                                            className="w-full"
                                            variant={isCurrent ? "outline" : (tier.popular ? "default" : "secondary")}
                                            disabled={isCurrent || loadingTier === tier.value}
                                            onClick={() => handleUpgrade(tier.value)}
                                        >
                                            {loadingTier === tier.value ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : isCurrent ? (
                                                "Current Plan"
                                            ) : (
                                                user ? "Upgrade" : "Log in to Upgrade"
                                            )}
                                        </Button>
                                    </CardFooter>
                                </Card>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
