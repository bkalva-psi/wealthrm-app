import { createRoot } from "react-dom/client";
import { Router } from "wouter";
import App from "./App";
import "./index.css";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { AuthProvider } from "@/context/auth-context";

// Use hash-based routing to support page refreshes
const hashBasedLocation = () => {
  // Get the hash from the URL (without the '#' character)
  const hash = window.location.hash.replace(/^#/, '') || '/'
  return hash
}

// Update the URL hash when navigating
const hashBasedNavigate = (to: string) => {
  window.location.hash = to
}

createRoot(document.getElementById("root")!).render(
  <ThemeProvider defaultTheme="light" storageKey="wealth-rm-theme">
    <Router hook={() => [hashBasedLocation(), hashBasedNavigate]}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </Router>
  </ThemeProvider>
);
