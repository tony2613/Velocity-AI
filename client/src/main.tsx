import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { initClientSecurity } from "./lib/security";

initClientSecurity();

createRoot(document.getElementById("root")!).render(<App />);

// Proactively unregister any legacy service workers and clear caches
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (const registration of registrations) {
      registration.unregister().catch(() => {});
    }
  }).catch(() => {});
}
if (typeof window !== "undefined" && "caches" in window) {
  caches.keys().then((keys) => {
    for (const key of keys) {
      caches.delete(key).catch(() => {});
    }
  }).catch(() => {});
}
