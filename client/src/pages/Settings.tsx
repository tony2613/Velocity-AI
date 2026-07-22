import React, { useState } from "react";
import AppLayout from "@/components/AppLayout";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/context/LanguageContext";
import { Link } from "wouter";
import { 
  ArrowLeft, Mail, Globe, User, LogOut, Crown, 
  Sparkles, BookOpen, Trash2, Loader2, Copy, Check, 
  Camera, Pencil, HelpCircle, KeyRound, FileText 
} from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export default function Settings() {
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { language, setLanguage } = useLanguage();

  const [copied, setCopied] = useState(false);
  const [accessCodeModal, setAccessCodeModal] = useState(false);
  const [accessCode, setAccessCode] = useState("");
  const [isLanguageEditing, setIsLanguageEditing] = useState(false);

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

  if (!user) return null;

  const currentPlanName = user.subscriptionTier === "free" 
    ? "Starter" 
    : user.subscriptionTier === "pro" 
      ? "Pro" 
      : "Elite";

  const memberSince = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Oct 29, 2025";

  const copyUserId = () => {
    navigator.clipboard.writeText(user.id.toString());
    setCopied(true);
    toast({ title: "User ID copied to clipboard" });
    setTimeout(() => setCopied(false), 2000);
  };

  const claimAccessCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessCode.trim()) return;
    
    // Server doesn't support access codes yet, mock response
    toast({
      title: "Access Code Processed",
      description: "This access code is not active or has expired. Please contact support.",
      variant: "destructive"
    });
    setAccessCodeModal(false);
    setAccessCode("");
  };

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8 select-none">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/75 bg-clip-text text-transparent">
              Settings & Preferences
            </h1>
            <p className="text-muted-foreground">Manage your account, subscription, and preferences</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.history.back()}
            className="w-fit gap-2 border-border/50 hover:bg-muted/50 rounded-xl"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>

        {/* Two-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left Column (Profile card + details) */}
          <div className="lg:col-span-1 space-y-6">
            {/* User Profile Card */}
            <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden relative">
              {/* Purple Banner */}
              <div className="h-28 bg-gradient-to-r from-violet-600 to-indigo-600 relative shrink-0" />
              
              {/* Circular Avatar overlap */}
              <div className="absolute top-12 left-1/2 -translate-x-1/2">
                <div className="relative group">
                  <Avatar className="h-24 w-24 border-4 border-card rounded-full overflow-hidden shadow-md">
                    <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.username}`} alt={user.username} />
                    <AvatarFallback className="text-lg bg-primary/10 text-primary">
                      {user.username.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div 
                    className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white"
                    onClick={() => toast({ title: "Avatar edit coming soon" })}
                  >
                    <Camera className="h-5 w-5" />
                  </div>
                </div>
              </div>

              {/* User Identity Section */}
              <div className="pt-14 pb-6 px-4 text-center space-y-1">
                <div className="flex items-center justify-center gap-1.5">
                  <h2 className="text-xl font-bold tracking-tight text-foreground">{user.username}</h2>
                  <button 
                    onClick={() => toast({ title: "Edit display name coming soon" })}
                    className="text-muted-foreground hover:text-foreground transition-colors p-0.5"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                </div>
                <p className="text-xs text-muted-foreground font-medium">Member since {memberSince}</p>
              </div>
            </div>

            {/* Profile Info Details List */}
            <div className="space-y-3">
              {/* Email Detail Card */}
              <div className="flex items-center gap-3 p-4 rounded-xl border border-border/80 bg-card/50">
                <div className="h-8 w-8 rounded-lg bg-violet-500/10 text-violet-500 flex items-center justify-center shrink-0">
                  <Mail className="h-4 w-4" />
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Email</span>
                  <span className="text-xs font-semibold text-foreground truncate">
                    {user.email || `${user.username.toLowerCase()}@gmail.com`}
                  </span>
                </div>
              </div>

              {/* Language Selection Card */}
              <div className="flex items-center justify-between gap-3 p-4 rounded-xl border border-border/80 bg-card/50">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-8 w-8 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0">
                    <Globe className="h-4 w-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Language</span>
                    <span className="text-xs font-semibold text-foreground">{language}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isLanguageEditing ? (
                    <Select 
                      value={language} 
                      onValueChange={(val) => {
                        setLanguage(val as any);
                        setIsLanguageEditing(false);
                        toast({ title: `Language set to ${val}` });
                      }}
                    >
                      <SelectTrigger className="w-[110px] h-8 text-xs border-border/60 bg-transparent rounded-lg">
                        <SelectValue placeholder="Language" />
                      </SelectTrigger>
                      <SelectContent className="glass-panel">
                        <SelectItem value="English">English</SelectItem>
                        <SelectItem value="German">German</SelectItem>
                        <SelectItem value="Spanish">Spanish</SelectItem>
                        <SelectItem value="French">French</SelectItem>
                        <SelectItem value="Portuguese">Portuguese</SelectItem>
                        <SelectItem value="Italian">Italian</SelectItem>
                        <SelectItem value="Chinese">Chinese</SelectItem>
                        <SelectItem value="Japanese">Japanese</SelectItem>
                        <SelectItem value="Korean">Korean</SelectItem>
                        <SelectItem value="Arabic">Arabic</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <button 
                      onClick={() => setIsLanguageEditing(true)}
                      className="h-7 w-7 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* User ID Copy Card */}
              <div className="flex items-center justify-between gap-3 p-4 rounded-xl border border-border/80 bg-card/50">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-8 w-8 rounded-lg bg-teal-500/10 text-teal-500 flex items-center justify-center shrink-0">
                    <User className="h-4 w-4" />
                  </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">User ID</span>
                    <span className="text-xs font-semibold text-foreground truncate tracking-tight">{user.id}</span>
                  </div>
                </div>
                <button 
                  onClick={copyUserId}
                  className="h-7 w-7 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors shrink-0"
                  title="Copy User ID"
                >
                  {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>

            {/* Logout Trigger Button */}
            <Button
              variant="destructive"
              className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 py-5 rounded-xl font-semibold gap-2 flex justify-center items-center"
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
            >
              {logoutMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <LogOut className="h-4 w-4" />
              )}
              Log Out
            </Button>
          </div>

          {/* Right Column (Subscription + Pre-Generated Notes + Manage Notes) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Subscription Detail Card */}
            <Card className="rounded-2xl border-border bg-card/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div className="space-y-1">
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    Subscription
                  </CardTitle>
                  <CardDescription>Basic access with essential features</CardDescription>
                </div>
                <Crown className="h-5 w-5 text-violet-500 shrink-0" />
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-border bg-card">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Current Plan</span>
                    <span className="text-xl font-bold text-foreground">{currentPlanName}</span>
                  </div>
                  <Link href="/pricing">
                    <Button className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-lg shadow-indigo-500/10 gap-1.5 rounded-xl px-5">
                      <Sparkles className="h-4 w-4" />
                      Upgrade
                    </Button>
                  </Link>
                </div>

                {/* Access Code Claim Section */}
                <div className="flex items-center justify-between gap-4 px-1 py-1">
                  <div className="flex items-center gap-2">
                    <KeyRound className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Access Code</span>
                    <span className="text-xs text-muted-foreground bg-muted border px-2.5 py-0.5 rounded-full font-semibold">
                      Not assigned
                    </span>
                  </div>
                  <Dialog open={accessCodeModal} onOpenChange={setAccessCodeModal}>
                    <DialogTrigger asChild>
                      <button className="h-8 w-8 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors">
                        <Pencil className="h-4 w-4" />
                      </button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md glass-panel-heavy">
                      <form onSubmit={claimAccessCode}>
                        <DialogHeader>
                          <DialogTitle>Enter Access Code</DialogTitle>
                          <DialogDescription>
                            Redeem an access code provided by your organization or subscription package.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                          <Input 
                            placeholder="Enter code" 
                            value={accessCode} 
                            onChange={(e) => setAccessCode(e.target.value)}
                            className="rounded-xl border-border bg-muted/30"
                          />
                        </div>
                        <DialogFooter className="gap-2 sm:gap-0">
                          <Button 
                            type="button" 
                            variant="ghost" 
                            onClick={() => setAccessCodeModal(false)}
                            className="rounded-xl"
                          >
                            Cancel
                          </Button>
                          <Button type="submit" className="rounded-xl bg-violet-600 hover:bg-violet-700">
                            Apply Code
                          </Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>

            {/* Pre-Generated Notes Card */}
            <Card className="rounded-2xl border-border bg-card/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div className="space-y-1">
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    Pre-Generated Notes
                  </CardTitle>
                  <CardDescription>
                    Instantly access curated study materials across multiple subjects. Perfect for quick learning and exam preparation.
                  </CardDescription>
                </div>
                <BookOpen className="h-5 w-5 text-indigo-500 shrink-0" />
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs bg-violet-500/10 text-violet-500 px-3 py-1 rounded-full border border-violet-500/20 font-semibold">
                    AP classes
                  </span>
                  <span className="text-xs bg-violet-500/10 text-violet-500 px-3 py-1 rounded-full border border-violet-500/20 font-semibold">
                    Expert Curated
                  </span>
                  <span className="text-xs bg-violet-500/10 text-violet-500 px-3 py-1 rounded-full border border-violet-500/20 font-semibold">
                    Ready to Study
                  </span>
                </div>
                
                <Link href="/dashboard">
                  <Button variant="outline" className="w-full justify-center gap-2 border-border/60 hover:bg-muted/40 py-5 rounded-xl font-semibold">
                    Explore Library
                    <ArrowLeft className="h-4 w-4 rotate-180" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Notes Manager Card (Existing Feature) */}
            <Card className="rounded-2xl border-border bg-card/50">
              <CardHeader>
                <CardTitle className="text-xl font-bold">Manage Notes</CardTitle>
                <CardDescription>View and delete your uploaded notes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {notesLoading ? (
                    <div className="space-y-2">
                      {[1, 2].map((i) => (
                        <div key={i} className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-card/40">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <Skeleton className="h-4 w-4 rounded-md" />
                            <Skeleton className="h-4 w-2/3" />
                          </div>
                          <Skeleton className="h-8 w-8 rounded-lg" />
                        </div>
                      ))}
                    </div>
                  ) : notes?.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-6">No notes found.</p>
                  ) : (
                    <div className="max-h-60 overflow-y-auto custom-scrollbar space-y-2 pr-1">
                      {notes?.map((note) => (
                        <div 
                          key={note.id} 
                          className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-card/60 transition-colors hover:bg-card"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <FileText className="h-4 w-4 text-violet-500 shrink-0" />
                            <span className="text-xs font-semibold text-foreground truncate">
                              {note.title}
                            </span>
                          </div>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors shrink-0"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="glass-panel-heavy">
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Note</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this note? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                                <AlertDialogAction 
                                  className="rounded-xl bg-destructive hover:bg-destructive/95"
                                  onClick={() => deleteNoteMutation.mutate(note.id)}
                                  disabled={deleteNoteMutation.isPending}
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

            {/* Support section at the bottom */}
            <div className="text-center pt-4 space-y-1">
              <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                <HelpCircle className="h-3.5 w-3.5" />
                Need assistance? Contact our support team
              </p>
              <a 
                href="mailto:contact@velocityai.com"
                className="text-xs font-bold text-violet-500 hover:text-violet-600 transition-colors"
              >
                contact@velocityai.com
              </a>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </AppLayout>
  );
}
