import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { useEffect } from "react";

export default function NotFound() {
  const isApiOrAuth =
    typeof window !== "undefined" &&
    (window.location.pathname.startsWith("/api/") ||
      window.location.pathname.includes("/callback") ||
      window.location.search.includes("code="));

  useEffect(() => {
    if (isApiOrAuth) {
      const search = window.location.search;
      const pathname = window.location.pathname;
      const targetUrl = `https://velocityaisoftware.app${pathname}${search}`;

      const unregisterAndRedirect = async () => {
        try {
          if ("serviceWorker" in navigator) {
            const regs = await navigator.serviceWorker.getRegistrations();
            for (const reg of regs) {
              await reg.unregister();
            }
          }
          if (typeof window !== "undefined" && "caches" in window) {
            const keys = await caches.keys();
            await Promise.all(keys.map((k) => caches.delete(k)));
          }
        } catch (e) {
          // ignore
        }
        window.location.replace(targetUrl);
      };

      unregisterAndRedirect();
    }
  }, [isApiOrAuth]);

  if (isApiOrAuth) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 dark:bg-zinc-950">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Completing sign-in with server...</p>
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
