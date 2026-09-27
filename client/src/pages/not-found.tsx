import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { useEffect } from "react";

export default function NotFound() {
  // If the browser loaded this SPA page for an /api route (e.g. hijacked by a service worker),
  // immediately unregister all service workers and reload the actual backend route from the network.
  useEffect(() => {
    if (window.location.pathname.startsWith("/api/")) {
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.getRegistrations().then(async (regs) => {
          for (const reg of regs) {
            await reg.unregister();
          }
          window.location.reload();
        }).catch(() => {
          window.location.reload();
        });
      } else {
        window.location.reload();
      }
    }
  }, []);

  if (typeof window !== "undefined" && window.location.pathname.startsWith("/api/")) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 dark:bg-zinc-950">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Redirecting to server...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 dark:bg-zinc-950">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-2">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">404 Page Not Found</h1>
          </div>

          <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            Did you forget to add the page to the router?
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
