import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { initClientSecurity } from "./lib/security";

initClientSecurity();

createRoot(document.getElementById("root")!).render(<App />);

// Register service worker non-blockingly after window load
if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js", { scope: "/" }).then((reg) => {
      // Promptly check for updates so new navigation denylist is applied immediately
      reg.update().catch(() => {});
    }).catch((err) => {
      console.warn("ServiceWorker registration failed:", err);
    });
  });
}
