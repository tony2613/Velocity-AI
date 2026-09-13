import { lazy, Suspense } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import IosInstallPrompt from "./components/IosInstallPrompt";
import GlobalStudyTimer from "./components/GlobalStudyTimer";
import { LanguageProvider } from "@/context/LanguageContext";
import { SidebarProvider } from "@/context/SidebarContext";

// Immediate import for critical landing page
import Home from "@/pages/Home";

// Lazy-loaded routes (code-split into individual async chunks)
const AuthPage = lazy(() => import("@/pages/auth-page"));
const ResetPassword = lazy(() => import("@/pages/ResetPassword"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const ExamPlannerPage = lazy(() => import("@/pages/ExamPlannerPage"));
const MyNotes = lazy(() => import("@/pages/MyNotes"));
const SummaryView = lazy(() => import("@/pages/SummaryView"));
const QuizView = lazy(() => import("@/pages/QuizView"));
const QuizzesPage = lazy(() => import("@/pages/QuizzesPage"));
const UploadNotesPage = lazy(() => import("@/pages/UploadNotesPage"));
const Settings = lazy(() => import("@/pages/Settings"));
const GetStarted = lazy(() => import("@/pages/GetStarted"));
const Features = lazy(() => import("@/pages/Features"));
const FAQ = lazy(() => import("@/pages/FAQ"));
const Contact = lazy(() => import("@/pages/Contact"));
const Privacy = lazy(() => import("@/pages/Privacy"));
const Terms = lazy(() => import("@/pages/Terms"));
const Help = lazy(() => import("@/pages/Help"));
const Blog = lazy(() => import("@/pages/Blog"));
const BlogPost = lazy(() => import("@/pages/BlogPost"));
const Tutorials = lazy(() => import("@/pages/Tutorials"));
const Pricing = lazy(() => import("@/pages/Pricing"));
const NotFound = lazy(() => import("@/pages/not-found"));

// Lazy-loaded CANA floating chat assistant
const FloatingCana = lazy(() => import("./components/FloatingCana"));

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh] w-full">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  );
}

function Router() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/auth" component={AuthPage} />
        <Route path="/reset-password" component={ResetPassword} />

        {/* Protected Routes */}
        <ProtectedRoute path="/dashboard" component={Dashboard} />
        <ProtectedRoute path="/planner" component={ExamPlannerPage} />
        <ProtectedRoute path="/calendar" component={ExamPlannerPage} />
        <ProtectedRoute path="/notes" component={MyNotes} />
        <ProtectedRoute path="/summary/:id" component={SummaryView} />
        <ProtectedRoute path="/quiz/:id" component={QuizView} />
        <ProtectedRoute path="/quizzes" component={QuizzesPage} />
        <ProtectedRoute path="/upload" component={UploadNotesPage} />
        <ProtectedRoute path="/profile" component={Settings} />
        <ProtectedRoute path="/settings" component={Settings} />

        {/* Public Pages */}
        <Route path="/get-started" component={GetStarted} />
        <Route path="/features" component={Features} />
        <Route path="/faq" component={FAQ} />
        <Route path="/contact" component={Contact} />
        <Route path="/privacy" component={Privacy} />
        <Route path="/terms" component={Terms} />
        <Route path="/help" component={Help} />
        <Route path="/blog" component={Blog} />
        <Route path="/blog/:id" component={BlogPost} />
        <Route path="/tutorials" component={Tutorials} />
        <Route path="/pricing" component={Pricing} />

        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}




function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <LanguageProvider>
            <TooltipProvider>
              <SidebarProvider>
                <GlobalStudyTimer />
                <Suspense fallback={null}>
                  <FloatingCana />
                </Suspense>
                <IosInstallPrompt />
                <Toaster />
                <Router />
              </SidebarProvider>
            </TooltipProvider>
          </LanguageProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
