import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";

import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import AuthPage from "@/pages/auth-page";
import Dashboard from "@/pages/Dashboard";
import SummaryView from "@/pages/SummaryView";
import QuizView from "@/pages/QuizView";
import MyNotes from "@/pages/MyNotes";
import QuizzesPage from "@/pages/QuizzesPage";
import UploadNotesPage from "@/pages/UploadNotesPage";
import GetStarted from "@/pages/GetStarted";
import Features from "@/pages/Features";
import FAQ from "@/pages/FAQ";
import Contact from "@/pages/Contact";
import Privacy from "@/pages/Privacy";
import Terms from "@/pages/Terms";
import Help from "@/pages/Help";
import Blog from "@/pages/Blog";
import BlogPost from "@/pages/BlogPost";
import Tutorials from "@/pages/Tutorials";
import Profile from "@/pages/Profile";
import Settings from "@/pages/Settings";
import Pricing from "@/pages/Pricing";
import ResetPassword from "@/pages/ResetPassword";
import GuestDemo from "@/pages/GuestDemo";
import { LanguageProvider } from "@/context/LanguageContext";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/reset-password" component={ResetPassword} />
      <Route path="/demo" component={GuestDemo} />

      {/* Protected Routes */}
      <ProtectedRoute path="/dashboard" component={Dashboard} />
      <ProtectedRoute path="/notes" component={MyNotes} />
      <ProtectedRoute path="/summary/:id" component={SummaryView} />
      <ProtectedRoute path="/quiz/:id" component={QuizView} />
      <ProtectedRoute path="/quizzes" component={QuizzesPage} />
      <ProtectedRoute path="/upload" component={UploadNotesPage} />
      <ProtectedRoute path="/profile" component={Profile} />
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
  );
}



function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <LanguageProvider>
            <TooltipProvider>
              <Toaster />
              <Router />
            </TooltipProvider>
          </LanguageProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
