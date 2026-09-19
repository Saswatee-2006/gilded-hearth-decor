import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";

type AuthMode = "signin" | "signup" | "forgot" | "legacy-email";

function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const search = Object.fromEntries(new URLSearchParams(location.search));
  const { user, isAdmin, loading } = useAuth();

  const [mode, setMode] = useState<AuthMode>("signin");
  const [busy, setBusy] = useState(false);

  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "" });
  const [showSuccess, setShowSuccess] = useState(false);

  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    // Only auto-redirect if the user lands on this page already logged in
    // and is not currently going through the active login flow.
    if (user && !loading && !isLoggingIn) {
      setShowSuccess(true);
      const timer = setTimeout(() => {
        if (isAdmin) {
          navigate("/admin", { replace: true });
        } else if (search["returnTo"]) {
          navigate(search["returnTo"], { replace: true });
        } else {
          navigate("/", { replace: true });
        }
      }, 1800);
      return () => clearTimeout(timer);
    }
  }, [user, isAdmin, loading, navigate, search["returnTo"], isLoggingIn]);

  if (showSuccess) {
    return (
      <div className="mx-auto w-full max-w-md px-4 pt-16 pb-16 md:pt-24 md:pb-24">
        <div className="rounded-md bg-card p-10 shadow-soft text-center reveal-in">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
          <h1 className="font-display text-3xl">
            Welcome back{user?.user_metadata?.full_name ? `, ${user.user_metadata.full_name}` : ""}
          </h1>
          <p className="mt-3 text-muted-foreground">You’re signed in and ready to shop.</p>
        </div>
      </div>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setIsLoggingIn(true);
    try {
      if (mode === "legacy-email" || mode === "signin") {
        if (!form.email || !form.password) {
          throw new Error("Email and password are required.");
        }
        const { data: authData, error } = await supabase.auth.signInWithPassword({
          email: form.email.trim(),
          password: form.password,
        });
        if (error) throw error;
        toast.success("Welcome back");
        
        if (authData.user) {
          // Fetch role directly to avoid race conditions with React context
          const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", authData.user.id)
            .single();

          if (profile?.role === "admin") {
            // Admin goes directly to admin dashboard
            navigate("/admin", { replace: true });
            return;
          } else {
            // Normal user goes through the success splash screen
            setShowSuccess(true);
            setTimeout(() => {
              if (search["returnTo"]) {
                navigate(search["returnTo"], { replace: true });
              } else {
                navigate("/", { replace: true });
              }
            }, 1800);
            return;
          }
        }
      } else if (mode === "signup") {
        if (!form.email || !form.password || !form.name) {
          throw new Error("Name, email, and password are required for signup.");
        }
        const { data, error } = await supabase.auth.signUp({
          email: form.email.trim(),
          password: form.password,
          options: {
            data: {
              full_name: form.name.trim(),
            }
          }
        });
        if (error) throw error;
        
        if (data.user && data.user.identities && data.user.identities.length === 0) {
          throw new Error("This email is already registered. Please sign in.");
        }
        
        toast.success("Account created successfully! Check your email to verify if required.");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
      setIsLoggingIn(false);
    }
  }

  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!form.email) {
      toast.error("Please enter your email first");
      return;
    }
    setBusy(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(form.email.trim());
      if (error) throw error;
      toast.success("Password reset link sent to your email");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not send reset link");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-md px-4 pt-2 pb-16 md:pt-4 md:pb-24">
      <div className="rounded-md bg-card p-8 shadow-soft">
        <p className="eyebrow bg-accent text-accent-foreground w-fit px-2 py-0.5 rounded-sm mb-4">
          WELCOME BACK
        </p>
        <h1 className="mt-2 font-display text-3xl">
          {mode === "signin" || mode === "legacy-email"
            ? "Sign In"
            : mode === "signup"
              ? "Create your account"
              : "Reset Password"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground mb-6">
          {mode === "forgot"
            ? "Enter your registered email address to receive a recovery link."
            : "Track orders, save addresses and keep your wishlist in one place."}
        </p>

        {/* Signup Form */}
        {mode === "signup" && (
          <form onSubmit={submit} className="space-y-4">
            <div>
              <Label htmlFor="name_mobile" className="text-xs">
                Full Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name_mobile"
                value={form.name}
                maxLength={80}
                required
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="email" className="text-xs">
                Email Address <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                required
                maxLength={255}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="password" className="text-xs">
                Password <span className="text-red-500">*</span>
              </Label>
              <Input
                id="password"
                type="password"
                value={form.password}
                required
                minLength={6}
                maxLength={72}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="mt-1.5"
              />
            </div>
            
            <Button type="submit" className="w-full" disabled={busy}>
              Create Account
            </Button>
          </form>
        )}

        {/* Login Form */}
        {(mode === "legacy-email" || mode === "signin") && (
          <form onSubmit={submit} className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-xs">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={form.email}
                maxLength={255}
                required
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="mt-1.5"
              />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs">
                  Password
                </Label>
                <button
                  type="button"
                  onClick={() => setMode("forgot")}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Forgot Password?
                </button>
              </div>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={form.password}
                minLength={6}
                maxLength={72}
                required
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="mt-1.5"
              />
            </div>
            <div className="flex items-center space-x-2 py-1">
              <Checkbox id="remember_email" />
              <label
                htmlFor="remember_email"
                className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Remember me
              </label>
            </div>
            <Button type="submit" className="w-full" disabled={busy}>
              Sign In
            </Button>
          </form>
        )}

        {/* Forgot Password */}
        {mode === "forgot" && (
          <form onSubmit={handleForgotPassword} className="space-y-4 mt-6">
            <div>
              <Label htmlFor="forgot_email" className="text-xs">
                Registered Email Address
              </Label>
              <Input
                id="forgot_email"
                type="email"
                value={form.email}
                maxLength={255}
                required
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="mt-1.5"
                placeholder="Enter your email to receive a reset link"
              />
            </div>
            <Button type="submit" className="w-full" disabled={busy}>
              Send Recovery Link
            </Button>
            <div className="text-center mt-6">
              <button
                type="button"
                onClick={() => setMode("signin")}
                className="text-[11px] text-muted-foreground hover:text-foreground transition-colors"
              >
                I don't have an email registered. Go back to Login.
              </button>
            </div>
          </form>
        )}

        {/* Navigation / Switchers */}
        {(mode === "signin" || mode === "legacy-email") && (
          <div className="mt-8 flex flex-col space-y-4 text-center text-sm text-muted-foreground">
            <p>
              New to Aarohan?{" "}
              <button
                type="button"
                className="link-underline text-foreground font-medium"
                onClick={() => setMode("signup")}
              >
                Create an account
              </button>
            </p>
          </div>
        )}

        {mode === "signup" && (
          <div className="mt-8 text-center text-sm text-muted-foreground">
            <p>
              Already have an account?{" "}
              <button
                type="button"
                className="link-underline text-foreground font-medium"
                onClick={() => setMode("signin")}
              >
                Sign in
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default AuthPage;
