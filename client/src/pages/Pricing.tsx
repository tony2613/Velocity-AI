import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Check, Loader2, X, Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import SEO from "@/components/SEO";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import upiQrCode99 from "@/assets/upi-qr99.png.jpeg";
import upiQrCode249 from "@/assets/upi-qr249.png.jpeg";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PLANS, PLAN_LIMITS } from "@shared/plans";

const getTiersForRegion = (region: 'IN' | 'EU' | 'US') => {
    return PLANS.map(plan => {
        const pricing = plan.pricing[region];
        return {
            name: plan.name,
            price: pricing.price,
            period: pricing.period,
            description: plan.description,
            features: plan.features,
            value: plan.value,
            popular: plan.value === 'pro'
        };
    });
};

export default function Pricing() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [loadingTier, setLoadingTier] = useState<string | null>(null);

    const [paymentModalOpen, setPaymentModalOpen] = useState(false);
    const [selectedTier, setSelectedTier] = useState<ReturnType<typeof getTiersForRegion>[0] | null>(null);
    const [transactionId, setTransactionId] = useState("");
    const [region, setRegion] = useState<'IN' | 'EU' | 'US'>('IN');

    // Fetch user region once on mount
    useEffect(() => {
        fetch("https://ipapi.co/json/")
            .then(res => res.json())
            .then(data => {
                if (data.country_code === 'IN') {
                    setRegion('IN');
                } else if (data.in_eu || ['AT','BE','BG','HR','CY','CZ','DK','EE','FI','FR','DE','GR','HU','IE','IT','LV','LT','LU','MT','NL','PL','PT','RO','SK','SI','ES','SE'].includes(data.country_code)) {
                    setRegion('EU');
                } else {
                    setRegion('US');
                }
            })
            .catch(() => setRegion('IN')); // Default to IN on failure
    }, []);

    const currentTiers = getTiersForRegion(region);

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

    const handleUpgradeClick = (tier: ReturnType<typeof getTiersForRegion>[0]) => {
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
            amount: selectedTier.price.replace(/[^\d.-]/g, '')
        });
    };

    return (
        <div className="min-h-screen bg-background relative pb-20">
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
                    <div className="text-center space-y-4 mb-12">
                        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl bg-gradient-to-r from-foreground via-foreground/90 to-muted-foreground bg-clip-text text-transparent">
                            Simple, Transparent Pricing
                        </h1>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                            Choose the plan that fits your study needs. Upgrade anytime to unlock more power.
                        </p>
                    </div>

                    {/* Region Selector Switcher */}
                    <div className="flex justify-center mb-16">
                        <div className="inline-flex items-center gap-1 bg-muted/80 p-1.5 rounded-full border border-border/60 shadow-sm backdrop-blur-sm">
                            {(['IN', 'US', 'EU'] as const).map((r) => (
                                <button
                                    key={r}
                                    onClick={() => setRegion(r)}
                                    className={`px-5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                                        region === r
                                            ? 'bg-background text-foreground shadow-md'
                                            : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    {r === 'IN' ? '🇮🇳 India (INR)' : r === 'US' ? '🇺🇸 United States (USD)' : '🇪🇺 Europe (EUR)'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto items-stretch mb-24">
                        {currentTiers.map((tier) => {
                            const isCurrent = user?.subscriptionTier === tier.value;
                            return (
                                <Card
                                    key={tier.name}
                                    className={`relative flex flex-col transition-all duration-300 border bg-card/45 backdrop-blur-md ${
                                        tier.popular
                                            ? 'border-primary shadow-xl scale-100 md:scale-[1.04] z-10 ring-4 ring-primary/10'
                                            : 'border-border hover:border-border/80 hover:shadow-lg hover:-translate-y-1'
                                    }`}
                                >
                                    {tier.popular && (
                                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-violet-600 to-indigo-600 text-primary-foreground text-[10px] sm:text-xs font-extrabold px-4 py-1.5 rounded-full shadow-md tracking-wider">
                                            MOST POPULAR
                                        </div>
                                    )}
                                    <CardHeader className={`pb-6 ${tier.popular ? 'bg-primary/[0.01] rounded-t-xl' : ''}`}>
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-2xl font-bold">{tier.name}</CardTitle>
                                            {tier.popular && <Sparkles className="h-5 w-5 text-primary animate-pulse" />}
                                        </div>
                                        <CardDescription className="min-h-[40px] mt-1.5">{tier.description}</CardDescription>
                                        <div className="mt-4 flex items-baseline">
                                            <span className="text-4xl font-extrabold tracking-tight">{tier.price}</span>
                                            <span className="text-muted-foreground ml-1 text-sm">{tier.period}</span>
                                        </div>
                                    </CardHeader>
                                    
                                    <CardContent className="flex-1 pb-8">
                                        <ul className="space-y-3.5">
                                            {tier.features.map((feature) => (
                                                <li key={feature} className="flex items-start gap-2.5 text-sm">
                                                    <span className="bg-primary/10 text-primary p-0.5 rounded-full mt-0.5 shrink-0">
                                                        <Check className="h-3 w-3" />
                                                    </span>
                                                    <span className="text-foreground/90">{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                    
                                    <CardFooter className={`pt-4 pb-6 ${tier.popular ? 'bg-primary/[0.01] rounded-b-xl' : ''}`}>
                                        <Button
                                            className="w-full text-sm font-semibold h-11"
                                            variant={isCurrent ? "outline" : (tier.popular ? "default" : "secondary")}
                                            disabled={isCurrent || loadingTier === tier.value}
                                            onClick={() => handleUpgradeClick(tier)}
                                        >
                                            {loadingTier === tier.value ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : isCurrent ? (
                                                <span className="flex flex-col items-center leading-tight">
                                                    <span className="font-bold">Current Plan</span>
                                                    {tier.value !== 'free' && (user as any)?.subscriptionExpiresAt && (
                                                        <span className="text-[10px] font-normal opacity-70">
                                                            Active until {new Date((user as any).subscriptionExpiresAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                        </span>
                                                    )}
                                                </span>
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

                    {/* Feature Comparison Table Section */}
                    <div className="max-w-5xl mx-auto px-4 mt-8">
                        <div className="text-center mb-10">
                            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl bg-gradient-to-r from-foreground via-foreground/90 to-muted-foreground bg-clip-text text-transparent">
                                Compare Plan Features
                            </h2>
                            <p className="text-muted-foreground mt-2 max-w-xl mx-auto text-base">
                                Examine exact daily quotas, access limits, and system gates below.
                            </p>
                            <div className="md:hidden mt-4 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 animate-pulse">
                                <span>← Swipe left/right to compare details →</span>
                            </div>
                        </div>

                        <div className="w-full overflow-x-auto rounded-2xl border border-border/80 bg-card/45 backdrop-blur-md shadow-lg scrollbar-thin">
                            <table className="w-full min-w-[760px] border-collapse text-left text-sm">
                                <thead>
                                    <tr className="border-b border-border/60 bg-muted/40">
                                        <th className="py-5 px-6 font-bold text-muted-foreground w-1/3">Feature</th>
                                        <th className="py-5 px-6 font-bold text-muted-foreground w-1/4">Free</th>
                                        <th className="py-5 px-6 font-bold text-primary w-1/4 bg-primary/[0.02]">Velocity Pro</th>
                                        <th className="py-5 px-6 font-bold text-muted-foreground w-1/4">Velocity Elite</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/40">
                                    {/* Limits Row Group */}
                                    <tr className="bg-muted/20 font-semibold text-xs tracking-wider uppercase text-muted-foreground/80">
                                        <td colSpan={4} className="py-3.5 px-6">Limits & Quotas</td>
                                    </tr>
                                    <tr className="hover:bg-muted/10 transition-colors">
                                        <td className="py-4.5 px-6 font-medium text-foreground/90">Daily Document Uploads</td>
                                        <td className="py-4.5 px-6">{PLAN_LIMITS.free.uploadLimit} uploads</td>
                                        <td className="py-4.5 px-6 bg-primary/[0.02] font-semibold text-primary">{PLAN_LIMITS.pro.uploadLimit} uploads</td>
                                        <td className="py-4.5 px-6">{PLAN_LIMITS.elite.uploadLimit} uploads</td>
                                    </tr>
                                    <tr className="hover:bg-muted/10 transition-colors">
                                        <td className="py-4.5 px-6 font-medium text-foreground/90">Research queries / day (CANA)</td>
                                        <td className="py-4.5 px-6 text-muted-foreground">Not Available</td>
                                        <td className="py-4.5 px-6 bg-primary/[0.02]">{PLAN_LIMITS.pro.searchLimit} queries/day</td>
                                        <td className="py-4.5 px-6">{PLAN_LIMITS.elite.searchLimit} queries/day</td>
                                    </tr>
                                    <tr className="hover:bg-muted/10 transition-colors">
                                        <td className="py-4.5 px-6 font-medium text-foreground/90">AI Quiz Generation</td>
                                        <td className="py-4.5 px-6">{PLAN_LIMITS.free.quizLimit}</td>
                                        <td className="py-4.5 px-6 bg-primary/[0.02] font-semibold text-primary">{PLAN_LIMITS.pro.quizLimit}</td>
                                        <td className="py-4.5 px-6">{PLAN_LIMITS.elite.quizLimit}</td>
                                    </tr>
                                    <tr className="hover:bg-muted/10 transition-colors">
                                        <td className="py-4.5 px-6 font-medium text-foreground/90">Active Device Limit</td>
                                        <td className="py-4.5 px-6 text-muted-foreground">{PLAN_LIMITS.free.deviceLimit} active device{PLAN_LIMITS.free.deviceLimit !== null && PLAN_LIMITS.free.deviceLimit > 1 ? 's' : ''}</td>
                                        <td className="py-4.5 px-6 bg-primary/[0.02] text-foreground font-medium">{PLAN_LIMITS.pro.deviceLimit === null ? 'Unlimited active devices' : `${PLAN_LIMITS.pro.deviceLimit} active devices`}</td>
                                        <td className="py-4.5 px-6 text-foreground font-medium">{PLAN_LIMITS.elite.deviceLimit === null ? 'Unlimited active devices' : `${PLAN_LIMITS.elite.deviceLimit} active devices`}</td>
                                    </tr>
                                    
                                    {/* Features Access Group */}
                                    <tr className="bg-muted/20 font-semibold text-xs tracking-wider uppercase text-muted-foreground/80">
                                        <td colSpan={4} className="py-3.5 px-6">Access & Capabilities</td>
                                    </tr>
                                    <tr className="hover:bg-muted/10 transition-colors">
                                        <td className="py-4.5 px-6 font-medium text-foreground/90">CANA AI Notes Assistant</td>
                                        <td className="py-4.5 px-6"><X className="h-4.5 w-4.5 text-destructive/80" /></td>
                                        <td className="py-4.5 px-6 bg-primary/[0.02]"><Check className="h-4.5 w-4.5 text-green-500" /></td>
                                        <td className="py-4.5 px-6"><Check className="h-4.5 w-4.5 text-green-500" /></td>
                                    </tr>
                                    <tr className="hover:bg-muted/10 transition-colors">
                                        <td className="py-4.5 px-6 font-medium text-foreground/90">Study Streak Tracking</td>
                                        <td className="py-4.5 px-6"><Check className="h-4.5 w-4.5 text-green-500" /></td>
                                        <td className="py-4.5 px-6 bg-primary/[0.02]"><Check className="h-4.5 w-4.5 text-green-500" /></td>
                                        <td className="py-4.5 px-6"><Check className="h-4.5 w-4.5 text-green-500" /></td>
                                    </tr>
                                    <tr className="hover:bg-muted/10 transition-colors">
                                        <td className="py-4.5 px-6 font-medium text-foreground/90">Priority OCR Processing</td>
                                        <td className="py-4.5 px-6 text-muted-foreground">Standard Speed</td>
                                        <td className="py-4.5 px-6 bg-primary/[0.02] font-semibold text-primary">Priority Processing</td>
                                        <td className="py-4.5 px-6">Fastest / Dedicated Queue</td>
                                    </tr>
                                    <tr className="hover:bg-muted/10 transition-colors">
                                        <td className="py-4.5 px-6 font-medium text-foreground/90">Max File Upload Size</td>
                                        <td className="py-4.5 px-6">10 MB</td>
                                        <td className="py-4.5 px-6 bg-primary/[0.02] font-semibold text-primary">50 MB</td>
                                        <td className="py-4.5 px-6">100 MB</td>
                                    </tr>
                                    <tr className="hover:bg-muted/10 transition-colors">
                                        <td className="py-4.5 px-6 font-medium text-foreground/90">Ad-free Experience</td>
                                        <td className="py-4.5 px-6 text-muted-foreground font-normal">Supported by ads</td>
                                        <td className="py-4.5 px-6 bg-primary/[0.02] font-semibold text-primary">100% Ad-Free</td>
                                        <td className="py-4.5 px-6">100% Ad-Free</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <Dialog open={paymentModalOpen} onOpenChange={setPaymentModalOpen}>
                <DialogContent className="max-w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto p-4 sm:p-6">
                    <DialogHeader className="text-center">
                        <DialogTitle className="text-xl font-bold">Complete Your Upgrade</DialogTitle>
                        <DialogDescription className="text-sm">
                            Upgrade to <strong>{selectedTier?.name}</strong> for <strong>{selectedTier?.price}/month</strong>
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col items-center space-y-4 sm:space-y-5 py-2 sm:py-4">
                        {region === 'IN' ? (
                            <>
                                {/* QR Code - large and crisp for scanning */}
                                <div className="bg-white p-3 sm:p-4 rounded-xl shadow-sm border">
                                    <img 
                                        src={
                                            selectedTier?.value === "pro"
                                                ? upiQrCode99
                                                : selectedTier?.value === "elite"
                                                ? upiQrCode249
                                                : upiQrCode99
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
                            </>
                        ) : (
                            <>
                                <div className="bg-muted/30 p-6 rounded-2xl border border-primary/20 w-full">
                                    <div className="flex justify-center gap-4 mb-4">
                                        <div className="h-10 w-16 bg-white rounded border flex items-center justify-center p-1 shadow-sm">
                                            <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-6" />
                                        </div>
                                        <div className="h-10 w-16 bg-white rounded border flex items-center justify-center p-1 shadow-sm">
                                            <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-4" />
                                        </div>
                                        <div className="h-10 w-16 bg-white rounded border flex items-center justify-center p-1 shadow-sm">
                                            <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-6" />
                                        </div>
                                    </div>
                                    
                                    <div className="text-center space-y-3">
                                        <p className="font-bold text-lg">International Checkout</p>
                                        <p className="text-sm text-muted-foreground font-medium">
                                            Pay via <strong>Credit Card</strong> or <strong>PayPal</strong> to upgrade to {selectedTier?.name}.
                                        </p>
                                        
                                        <Button 
                                            size="lg" 
                                            className="w-full bg-[#0070ba] hover:bg-[#005ea6] text-white font-bold h-12 rounded-xl"
                                            onClick={() => {
                                                const amount = selectedTier?.price.replace(/[^\d.-]/g, '');
                                                const currency = region === 'EU' ? 'EUR' : 'USD';
                                                window.open(`https://www.paypal.com/cgi-bin/webscr?cmd=_xclick&business=tonylewiston2613@gmail.com&item_name=VelocityAI%20${selectedTier?.name}&amount=${amount}&currency_code=${currency}`, '_blank');
                                            }}
                                        >
                                            <span className="flex items-center gap-2">
                                                Proceed to PayPal
                                            </span>
                                        </Button>
                                        
                                        <div className="flex items-center justify-center gap-2 pt-2">
                                            <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">Verification Email</span>
                                            <p className="text-xs font-mono bg-background py-1 px-3 rounded border">tonylewiston2613@gmail.com</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Divider */}
                                <div className="w-full flex items-center gap-3">
                                    <div className="flex-1 h-px bg-border" />
                                    <span className="text-xs text-muted-foreground">After paying, enter your PayPal Transaction ID</span>
                                    <div className="flex-1 h-px bg-border" />
                                </div>

                                <div className="w-full space-y-2">
                                    <Label htmlFor="utr" className="text-sm font-medium">PayPal Transaction ID</Label>
                                    <Input 
                                        id="utr" 
                                        placeholder="e.g. 9DL8... or invoice number" 
                                        value={transactionId}
                                        onChange={(e) => setTransactionId(e.target.value)}
                                        className="h-12 text-base sm:h-10 sm:text-sm"
                                    />
                                    <p className="text-xs text-muted-foreground text-center">We will manually verify and upgrade your account within a few hours.</p>
                                </div>
                            </>
                        )}
                    </div>
                    <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-2">
                        <Button variant="ghost" onClick={() => setPaymentModalOpen(false)} className="h-11 sm:h-9">Cancel</Button>
                        <Button 
                            onClick={submitPayment} 
                            disabled={loadingTier === selectedTier?.value || !transactionId}
                            className="h-11 sm:h-9 text-base sm:text-sm font-semibold"
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
