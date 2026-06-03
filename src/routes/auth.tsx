import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { claimAdminIfFirst } from "@/lib/admin.functions";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Admin Login — AFROGROW" }] }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const claim = useServerFn(claimAdminIfFirst);
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) navigate({ to: "/admin", replace: true });
    });
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) navigate({ to: "/admin", replace: true });
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: window.location.origin + "/admin" },
        });
        if (error) throw error;
        toast.success("Account created. Signing you in…");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      // Claim admin if no admin exists yet (first seller account).
      try {
        const res = await claim();
        if (res.claimed) toast.success("Admin access granted.");
      } catch { /* ignore */ }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container mx-auto max-w-md px-4 py-16">
      <Link to="/" className="text-sm text-muted-foreground hover:text-primary">← Back to store</Link>
      <h1 className="mt-4 font-display text-4xl">Seller Access</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {mode === "signin" ? "Sign in to manage products, orders and categories." : "Create the seller account. The first account becomes admin."}
      </p>
      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={mode === "signin" ? "current-password" : "new-password"} />
        </div>
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Please wait…" : mode === "signin" ? "Sign In" : "Create Account"}
        </Button>
      </form>
      <button
        type="button"
        onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
        className="mt-4 text-sm text-muted-foreground hover:text-primary"
      >
        {mode === "signin" ? "No account yet? Create one" : "Have an account? Sign in"}
      </button>
    </div>
  );
}
