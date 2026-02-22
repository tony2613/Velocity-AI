import { useState, useEffect } from "react";
import { useLocation, Link, Redirect } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { insertUserSchema, type InsertUser } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2, ArrowLeft } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function AuthPage() {
    const { user, loginMutation, registerMutation } = useAuth();
    const [, setLocation] = useLocation();
    const [activeTab, setActiveTab] = useState("login");
    const { t } = useLanguage();

    useEffect(() => {
        if (user) {
            setLocation("/dashboard");
        }
    }, [user, setLocation]);

    if (user) {
        return <Redirect to="/dashboard" />;
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4 relative">
            <div className="absolute top-4 left-4 md:top-8 md:left-8">
                <Link href="/">
                    <Button variant="ghost" className="gap-2">
                        <ArrowLeft className="h-4 w-4" />
                        {t("auth.back_to_home")}
                    </Button>
                </Link>
            </div>


            <Card className="w-full max-w-md border-zinc-200 dark:border-zinc-800 shadow-xl">
                <CardHeader>
                    <CardTitle>
                        {activeTab === "login" && t("auth.welcome_back")}
                        {activeTab === "register" && t("auth.create_account")}
                        {activeTab === "forgot-password" && t("auth.reset_password")}
                    </CardTitle>
                    <CardDescription>
                        {activeTab === "login" && t("auth.signin_desc")}
                        {activeTab === "register" && t("auth.signup_desc")}
                        {activeTab === "forgot-password" && t("auth.reset_desc")}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-4">
                            <TabsTrigger value="login">{t("auth.login")}</TabsTrigger>
                            <TabsTrigger value="register">{t("auth.register")}</TabsTrigger>
                        </TabsList>

                        <TabsContent value="login">
                            <LoginForm
                                onSubmit={(data) => loginMutation.mutate(data)}
                                isPending={loginMutation.isPending}
                                onForgotPassword={() => setActiveTab("forgot-password")}
                            />
                        </TabsContent>

                        <TabsContent value="register">
                            <RegisterForm onSubmit={(data) => registerMutation.mutate(data)} isPending={registerMutation.isPending} />
                        </TabsContent>

                        <TabsContent value="forgot-password">
                            <ForgotPasswordForm onBack={() => setActiveTab("login")} />
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
}

function LoginForm({ onSubmit, isPending, onForgotPassword }: { onSubmit: (data: InsertUser) => void, isPending: boolean, onForgotPassword: () => void }) {
    const { t } = useLanguage();
    const form = useForm<InsertUser>({
        resolver: zodResolver(insertUserSchema),
        defaultValues: {
            username: "",
            password: "",
        },
    });

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t("auth.username")}</FormLabel>
                            <FormControl>
                                <Input placeholder={t("auth.enter_username")} {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t("auth.password")}</FormLabel>
                            <FormControl>
                                <Input type="password" placeholder={t("auth.enter_password")} {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="flex justify-end">
                    <Button variant="link" className="px-0 h-auto text-sm" onClick={(e) => { e.preventDefault(); onForgotPassword(); }}>
                        {t("auth.forgot_password")}
                    </Button>
                </div>
                <Button className="w-full" type="submit" disabled={isPending}>
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {t("auth.login")}
                </Button>
            </form>
        </Form>
    );
}

function ForgotPasswordForm({ onBack }: { onBack: () => void }) {
    const { toast } = useToast();
    const { t } = useLanguage();
    const form = useForm<{ email: string }>({
        defaultValues: {
            email: "",
        },
    });

    const forgotPasswordMutation = useMutation({
        mutationFn: async (data: { email: string }) => {
            const res = await apiRequest("POST", "/api/forgot-password", data);
            return res.text();
        },
        onSuccess: (message) => {
            toast({
                title: "Email Sent",
                description: message,
            });
            onBack();
        },
        onError: (error: Error) => {
            toast({
                title: "Request Failed",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit((data) => forgotPasswordMutation.mutate(data))} className="space-y-4">
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t("auth.email")}</FormLabel>
                            <FormControl>
                                <Input type="email" placeholder={t("auth.enter_email")} {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button className="w-full" type="submit" disabled={forgotPasswordMutation.isPending}>
                    {forgotPasswordMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {t("auth.send_reset")}
                </Button>
                <div className="text-center">
                    <Button variant="link" className="px-0 h-auto text-sm" onClick={(e) => { e.preventDefault(); onBack(); }}>
                        {t("auth.back_to_login")}
                    </Button>
                </div>
            </form>
        </Form>
    );
}

function RegisterForm({ onSubmit, isPending }: { onSubmit: (data: InsertUser) => void, isPending: boolean }) {
    const { t } = useLanguage();
    const form = useForm<InsertUser>({
        resolver: zodResolver(insertUserSchema),
        defaultValues: {
            username: "",
            password: "",
        },
    });

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t("auth.username")}</FormLabel>
                            <FormControl>
                                <Input placeholder={t("auth.choose_username")} {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t("auth.email")}</FormLabel>
                            <FormControl>
                                <Input type="email" placeholder={t("auth.enter_email")} {...field} value={field.value || ''} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t("auth.password")}</FormLabel>
                            <FormControl>
                                <Input type="password" placeholder={t("auth.choose_password")} {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button className="w-full" type="submit" disabled={isPending}>
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {t("auth.register")}
                </Button>
            </form>
        </Form>
    );
}
