/**
 * Client-Side Security Hardening & Tamper Deterrents
 *
 * 1. Authoritative Console Warning (similar to Discord, Facebook, Google)
 * 2. Discourages unauthorized script injection and DOM manipulation
 */
export function initClientSecurity() {
  if (typeof window === "undefined") return;

  try {
    const titleStyle = "color: #ef4444; font-size: 24px; font-weight: bold;";
    const textStyle = "color: #6366f1; font-size: 13px; font-weight: 500;";
    const warnStyle = "color: #f59e0b; font-size: 12px; font-style: italic;";

    console.log("%cSTOP! Security Notice", titleStyle);
    console.log(
      "%cVelocityAI enforces strict Zero-Trust server authorization. Pasting scripts, tampering with DOM elements, or attempting client manipulation will not grant elevated permissions and cannot alter server records.",
      textStyle
    );
    console.log(
      "%cAll study records, notes, and quizzes are verified on the backend. Never paste code from untrusted sources.",
      warnStyle
    );
  } catch {
    // Ignore logging errors
  }
}
