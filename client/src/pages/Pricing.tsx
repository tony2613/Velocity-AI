import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Check, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import SEO from "@/components/SEO";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import upiQrCode from "@/assets/upi-qr.png";
import upiQrCode99 from "@/assets/upi-qr99.png.jpeg";
import upiQrCode249 from "@/assets/upi-qr249.png.jpeg";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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

    const [paymentModalOpen, setPaymentModalOpen] = useState(false);
    const [selectedTier, setSelectedTier] = useState<typeof tiers[0] | null>(null);
    const [transactionId, setTransactionId] = useState("");

    const paymentMutation = useMutation({
        mutationFn: async (data: { tier: string, transactionId: string, amount: string }) => {
            const res = await apiRequest("POST", "/api/payment-request", data);
            return res.json();
        },
        onSuccess: () => {
            toast({
                title: "Payment Requested",
                description: "Your transaction ID has been submitted for verification. You will be upgraded soon!",
            });
            setPaymentModalOpen(false);
            setTransactionId("");
            setLoadingTier(null);
        },
        onError: (error: Error) => {
            toast({
                title: "Submission failed",
                description: error.message,
                variant: "destructive",
            });
            setLoadingTier(null);
        },
    });

    const handleUpgradeClick = (tier: typeof tiers[0]) => {
        if (!user) {
            toast({
                title: "Login Required",
                description: "Please log in to upgrade your plan.",
            });
            return;
        }
        
        if (tier.value === 'free') return; // Cannot explicitly buy free
        
        setSelectedTier(tier);
        setPaymentModalOpen(true);
    };

    const submitPayment = () => {
        if (!selectedTier || !transactionId) {
            toast({
                title: "Missing Information",
                description: "Please enter your 12-digit transaction ID.",
                variant: "destructive"
            });
            return;
        }

        if (transactionId.length < 10) {
            toast({
                title: "Invalid ID",
                description: "Please enter a valid UPI transaction ID (UTR).",
                variant: "destructive"
            });
            return;
        }

        setLoadingTier(selectedTier.value);
        paymentMutation.mutate({
            tier: selectedTier.value,
            transactionId: transactionId,
            amount: selectedTier.price.replace('₹', '')
        });
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
                                            onClick={() => handleUpgradeClick(tier)}
                                        >
                                            {loadingTier === tier.value ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : isCurrent ? (
                                                "Current Plan"
                                            ) : tier.value === 'free' ? (
                                                "Included"
                                            ) : (
                                                user ? "Buy Now" : "Log in to Upgrade"
                                            )}
                                        </Button>
                                    </CardFooter>
                                </Card>
                            );
                        })}
                    </div>
                </div>
            </div>

            <Dialog open={paymentModalOpen} onOpenChange={setPaymentModalOpen}>
                <DialogContent className="max-w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto p-4 sm:p-6">
                    <DialogHeader className="text-center">
                        <DialogTitle className="text-xl">Complete Your Upgrade</DialogTitle>
                        <DialogDescription className="text-sm">
                            Upgrade to <strong>{selectedTier?.name}</strong> for <strong>{selectedTier?.price}/month</strong>
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col items-center space-y-4 sm:space-y-5 py-2 sm:py-4">
                        {/* QR Code - large and crisp for scanning */}
                        <div className="bg-white p-3 sm:p-4 rounded-xl shadow-sm border">
                            <img 
                                src={
                                    selectedTier?.value === "pro"
                                        ? upiQrCode99
                                        : selectedTier?.value === "elite"
                                        ? upiQrCode249
                                        : upiQrCode
                                } 
                                alt="UPI QR Code - Scan to Pay" 
                                className="w-56 h-56 sm:w-52 sm:h-52 object-contain"
                                style={{ imageRendering: 'crisp-edges' }}
                            />
                        </div>
                        
                        <div className="text-center w-full space-y-1">
                            <p className="font-semibold text-base sm:text-lg">Scan & Pay via UPI</p>
                            <p className="text-muted-foreground text-xs font-mono bg-muted py-1 px-3 rounded inline-block select-all">tonylewiston2613@okaxis</p>
                            <p className="text-xs text-muted-foreground mt-1">GPay · PhonePe · Paytm · Any UPI App</p>
                        </div>

                        {/* Divider */}
                        <div className="w-full flex items-center gap-3">
                            <div className="flex-1 h-px bg-border" />
                            <span className="text-xs text-muted-foreground">After paying, enter your UTR below</span>
                            <div className="flex-1 h-px bg-border" />
                        </div>

                        <div className="w-full space-y-2">
                            <Label htmlFor="utr" className="text-sm font-medium">UPI Transaction ID (UTR)</Label>
                            <Input 
                                id="utr" 
                                placeholder="e.g. 412345678901" 
                                value={transactionId}
                                onChange={(e) => setTransactionId(e.target.value)}
                                className="h-12 text-base sm:h-10 sm:text-sm"
                                inputMode="numeric"
                            />
                            <p className="text-xs text-muted-foreground text-center">Find this 12-digit number in your payment app under transaction details.</p>
                        </div>
                    </div>
                    <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-2">
                        <Button variant="ghost" onClick={() => setPaymentModalOpen(false)} className="h-11 sm:h-9">Cancel</Button>
                        <Button 
                            onClick={submitPayment} 
                            disabled={loadingTier === selectedTier?.value || !transactionId}
                            className="h-11 sm:h-9 text-base sm:text-sm"
                        >
                            {loadingTier === selectedTier?.value ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : null}
                            Submit Payment Proof
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
