import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Bell, Moon, Shield, LogOut, Trash2, Loader2, FileText } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/components/ThemeProvider";

export default function Settings() {
    const { user, logoutMutation } = useAuth();
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const { theme, setTheme } = useTheme();
    const { language, setLanguage, t } = useLanguage();

    const { data: notes, isLoading: notesLoading } = useQuery<any[]>({
        queryKey: ["/api/notes"],
    });

    const deleteNoteMutation = useMutation({
        mutationFn: async (id: string) => {
            const res = await fetch(`/api/notes/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to delete note");
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/notes"] });
            toast({ title: "Note deleted" });
        },
        onError: (error: Error) => {
            toast({
                title: "Failed to delete note",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    return (
        <div className="min-h-screen bg-background relative">
            <Button
                variant="ghost"
                size="icon"
                onClick={() => window.history.back()}
                className="absolute top-4 left-4 z-50 rounded-full bg-background/50 hover:bg-muted"
            >
                <ArrowLeft className="h-6 w-6" />
            </Button>
            <div className="p-4 md:p-8 pb-24 pt-16">
                <div className="max-w-4xl mx-auto space-y-8">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{t("settings.title")}</h1>
                        <p className="text-muted-foreground">{t("settings.title")} & Preferences</p>
                    </div>

                    <div className="grid gap-6">
                        {/* Account Section */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Account</CardTitle>
                                <CardDescription>Manage your account information.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <Label>Username</Label>
                                        <p className="text-sm text-muted-foreground">{user?.username}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Notes Manager */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Manage Notes</CardTitle>
                                <CardDescription>View and delete your uploaded notes.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {notesLoading ? (
                                        <div className="flex justify-center p-4">
                                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                        </div>
                                    ) : notes?.length === 0 ? (
                                        <p className="text-sm text-muted-foreground text-center py-4">No notes found.</p>
                                    ) : (
                                        <div className="grid gap-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                            {notes?.map((note) => (
                                                <div key={note.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                                                    <div className="flex items-center gap-3 overflow-hidden">
                                                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                                            <FileText className="h-4 w-4 text-primary" />
                                                        </div>
                                                        <div className="truncate">
                                                            <p className="text-sm font-medium truncate">{note.title}</p>
                                                            <p className="text-xs text-muted-foreground">
                                                                {new Date(note.createdAt).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive shrink-0">
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Delete Note?</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    This will permanently delete "{note.title}" and all associated quizzes and summaries. This action cannot be undone.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                <AlertDialogAction
                                                                    onClick={() => deleteNoteMutation.mutate(note.id)}
                                                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                                >
                                                                    Delete
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Appearance</CardTitle>
                                <CardDescription>Customize how the app looks on your device.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <Moon className="h-4 w-4 text-muted-foreground" />
                                        <div className="space-y-1">
                                            <Label>Dark Mode</Label>
                                            <p className="text-sm text-muted-foreground">
                                                Toggle dark mode on or off.
                                            </p>
                                        </div>
                                    </div>
                                    <Switch
                                        checked={theme === "dark"}
                                        onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Notifications</CardTitle>
                                <CardDescription>Configure how you receive alerts.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <Bell className="h-4 w-4 text-muted-foreground" />
                                        <div className="space-y-1">
                                            <Label>Email Notifications</Label>
                                            <p className="text-sm text-muted-foreground">
                                                Receive emails about your activity.
                                            </p>
                                        </div>
                                    </div>
                                    <Switch />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Privacy</CardTitle>
                                <CardDescription>Manage your data and privacy settings.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <Shield className="h-4 w-4 text-muted-foreground" />
                                        <div className="space-y-1">
                                            <Label>Public Profile</Label>
                                            <p className="text-sm text-muted-foreground">
                                                Make your profile visible to others.
                                            </p>
                                        </div>
                                    </div>
                                    <Switch />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>{t("settings.language")} 🌐</CardTitle>
                                <CardDescription>{t("settings.language_desc")}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <Label>{t("settings.language")}</Label>
                                        <p className="text-sm text-muted-foreground">
                                            {t("settings.language_desc")}
                                        </p>
                                    </div>
                                    <Select
                                        value={language}
                                        onValueChange={(value: any) => {
                                            setLanguage(value);
                                            toast({ title: "Language Updated", description: `App language set to ${value}` });
                                        }}
                                    >
                                        <SelectTrigger className="w-[180px]">
                                            <SelectValue placeholder="Select Language" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="English">English</SelectItem>
                                            <SelectItem value="Hindi">Hindi (हिंदी)</SelectItem>
                                            <SelectItem value="Kannada">Kannada (कन्नड)</SelectItem>
                                            <SelectItem value="Bengali">Bengali (বাংলা)</SelectItem>
                                            <SelectItem value="Tamil">Tamil (தமிழ்)</SelectItem>
                                            <SelectItem value="Telugu">Telugu (తెలుగు)</SelectItem>
                                            <SelectItem value="Malayalam">Malayalam (മലയാളം)</SelectItem>
                                            <SelectItem value="Marathi">Marathi (मराठी)</SelectItem>
                                            <SelectItem value="German">German (Deutsch)</SelectItem>
                                            <SelectItem value="Spanish">Spanish (Español)</SelectItem>
                                            <SelectItem value="French">French (Français)</SelectItem>
                                            <SelectItem value="Portuguese">Portuguese (Português)</SelectItem>
                                            <SelectItem value="Italian">Italian (Italiano)</SelectItem>
                                            <SelectItem value="Russian">Russian (Русский)</SelectItem>
                                            <SelectItem value="Chinese">Chinese (中文)</SelectItem>
                                            <SelectItem value="Japanese">Japanese (日本語)</SelectItem>
                                            <SelectItem value="Korean">Korean (한국어)</SelectItem>
                                            <SelectItem value="Arabic">Arabic (العربية)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="pt-6 border-t">
                            <Button
                                variant="destructive"
                                className="w-full sm:w-auto"
                                onClick={() => logoutMutation.mutate()}
                                disabled={logoutMutation.isPending}
                            >
                                {logoutMutation.isPending ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <LogOut className="mr-2 h-4 w-4" />
                                )}
                                Log out
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
