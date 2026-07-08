import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { claimAdminIfFirst } from "@/lib/admin.functions";
import { Eye, EyeOff } from "lucide-react";
import { getSupabaseConfigStatus } from "@/lib/debug.functions";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Admin Login - AFROGLOW" }] }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const claim = useServerFn(claimAdminIfFirst);
  const getStatus = useServerFn(getSupabaseConfigStatus);
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [debugData, setDebugData] = useState<Record<
    string,
    { defined: boolean; length: number; prefix: string }
  > | null>(null);
  const [debugLoading, setDebugLoading] = useState(false);
  const [debugError, setDebugError] = useState<string | null>(null);

  const isDebug =
    typeof window !== "undefined" && new URLSearchParams(window.location.search).has("debug");

  useEffect(() => {
    if (isDebug) {
      setDebugLoading(true);
      getStatus()
        .then(setDebugData)
        .catch((err) => setDebugError(err instanceof Error ? err.message : String(err)))
        .finally(() => setDebugLoading(false));
    }
  }, [isDebug, getStatus]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) navigate({ to: "/admin", replace: true });
    });
  }, [navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin + "/admin" },
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      // Wait for session to be persisted before calling claim (avoids race with bearer attacher).
      for (let i = 0; i < 10; i++) {
        const { data } = await supabase.auth.getSession();
        if (data.session?.access_token) break;
        await new Promise((r) => setTimeout(r, 150));
      }
      try {
        const res = await claim();
        if (res.claimed) toast.success("Admin access granted.");
      } catch (err) {
        console.error("claimAdmin failed", err);
      }
      navigate({ to: "/admin", replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container mx-auto max-w-md px-4 py-16">
      <Link to="/" className="text-sm text-muted-foreground hover:text-primary">
        ← Back to store
      </Link>
      <h1 className="mt-4 font-display text-4xl">Seller Access</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {mode === "signin"
          ? "Sign in to manage products, orders and categories."
          : "Create the seller account. The first account becomes admin."}
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </div>

        {/* Password with show/hide toggle */}
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Please wait…" : mode === "signin" ? "Sign In" : "Create Account"}
        </Button>
      </form>

      <button
        type="button"
        onClick={() => {
          setMode(mode === "signin" ? "signup" : "signin");
          setShowPassword(false);
        }}
        className="mt-4 text-sm text-muted-foreground hover:text-primary block text-left w-full"
      >
        {mode === "signin" ? "No account yet? Create one" : "Have an account? Sign in"}
      </button>

      {isDebug && (
        <div className="mt-8 p-4 border border-destructive/30 rounded-lg bg-destructive/5 text-left text-xs font-mono">
          <h2 className="font-bold text-sm text-destructive mb-2">Supabase Config Diagnostics</h2>
          {debugLoading && <p>Loading config status...</p>}
          {debugError && <p className="text-red-500">Error: {debugError}</p>}
          {debugData && (
            <div className="space-y-3">
              <div>
                <p className="font-semibold text-primary mb-1">
                  Server-side environment variables:
                </p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>
                    <strong>SUPABASE_URL:</strong>{" "}
                    {debugData.SUPABASE_URL.defined
                      ? `Defined (length: ${debugData.SUPABASE_URL.length}, prefix: "${debugData.SUPABASE_URL.prefix}")`
                      : "Undefined ❌"}
                  </li>
                  <li>
                    <strong>SUPABASE_PUBLISHABLE_KEY:</strong>{" "}
                    {debugData.SUPABASE_PUBLISHABLE_KEY.defined
                      ? `Defined (length: ${debugData.SUPABASE_PUBLISHABLE_KEY.length}, prefix: "${debugData.SUPABASE_PUBLISHABLE_KEY.prefix}")`
                      : "Undefined ❌"}
                  </li>
                  <li>
                    <strong>SUPABASE_SERVICE_ROLE_KEY:</strong>{" "}
                    {debugData.SUPABASE_SERVICE_ROLE_KEY.defined
                      ? `Defined (length: ${debugData.SUPABASE_SERVICE_ROLE_KEY.length}, prefix: "${debugData.SUPABASE_SERVICE_ROLE_KEY.prefix}")`
                      : "Undefined ❌"}
                  </li>
                </ul>
              </div>
              <div>
                <p className="font-semibold text-primary mb-1">
                  Build-time variables (client-side):
                </p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>
                    <strong>VITE_SUPABASE_URL:</strong>{" "}
                    {debugData.VITE_SUPABASE_URL.defined
                      ? `Defined (length: ${debugData.VITE_SUPABASE_URL.length}, prefix: "${debugData.VITE_SUPABASE_URL.prefix}")`
                      : "Undefined ❌"}
                  </li>
                  <li>
                    <strong>VITE_SUPABASE_PUBLISHABLE_KEY:</strong>{" "}
                    {debugData.VITE_SUPABASE_PUBLISHABLE_KEY.defined
                      ? `Defined (length: ${debugData.VITE_SUPABASE_PUBLISHABLE_KEY.length}, prefix: "${debugData.VITE_SUPABASE_PUBLISHABLE_KEY.prefix}")`
                      : "Undefined ❌"}
                  </li>
                </ul>
              </div>
              <p className="text-[10px] text-muted-foreground mt-2 leading-relaxed">
                Tip: If build-time variables (VITE_*) are Undefined but server variables are
                Defined, ensure they are configured in Vercel settings and redeploy.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
