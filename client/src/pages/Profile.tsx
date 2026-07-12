import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User, Mail } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function Profile() {
    const { user } = useAuth();
    const { t } = useLanguage();

    if (!user) return null;

    return (
        <div className="min-h-screen bg-background">
            <div className="p-4">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => window.history.back()}
                    className="absolute top-4 left-4 z-50 rounded-full bg-background/50 hover:bg-muted"
                >
                    <ArrowLeft className="h-6 w-6" />
                </Button>
            </div>
            <div className="p-8 pt-16">
                <div className="max-w-4xl mx-auto space-y-8">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{t("profile.title")}</h1>
                        <p className="text-muted-foreground">{t("profile.subtitle")}</p>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>{t("profile.personal_info")}</CardTitle>
                            <CardDescription>{t("profile.personal_info_desc")}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center gap-6">
                                <Avatar className="h-24 w-24">
                                    <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.username}`} />
                                    <AvatarFallback>{user.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div className="space-y-1">
                                    <h3 className="text-xl font-semibold">{user.username}</h3>
                                    <p className={`text-sm ${user.email ? 'text-muted-foreground' : 'text-muted-foreground/50 italic'}`}>
                                        {user.email || 'No email provided'}
                                    </p>
                                    <div className="text-sm text-muted-foreground flex items-center gap-2 mt-2">
                                        <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                                            {user.subscriptionTier === 'free' ? t("sub.free") :
                                                user.subscriptionTier === 'pro' ? t("sub.pro") : t("sub.elite")}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                        {t("profile.username_label")}
                                    </label>
                                    <div className="flex items-center gap-2 p-3 rounded-md border bg-muted/50">
                                        <User className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm">{user.username}</span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                        Email Address
                                    </label>
                                    <div className="flex items-center gap-2 p-3 rounded-md border bg-muted/50">
                                        <Mail className="h-4 w-4 text-muted-foreground" />
                                        <span className={`text-sm ${user.email ? '' : 'text-muted-foreground/50 italic'}`}>
                                            {user.email || "No email provided"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
