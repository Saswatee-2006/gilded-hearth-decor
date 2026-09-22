import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";

type AuthMode = "signin" | "signup" | "forgot";

function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const search = Object.fromEntries(new URLSearchParams(location.search));
  const { user, isAdmin, loading } = useAuth();

  const [mode, setMode] = useState<AuthMode>("signin");
  const [busy, setBusy] = useState(false);

  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showSuccess, setShowSuccess] = useState(false);

  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    // Rely exclusively on the authenticated state to handle navigation.
    // This prevents race conditions where the redirect happens before
    // the auth context verifies the user's admin role.
    if (user && !loading && !isLoggingIn) {
      if (isAdmin) {
        navigate("/admin", { replace: true });
      } else {
        setShowSuccess(true);
        const timer = setTimeout(() => {
          if (search["returnTo"]) {
            navigate(search["returnTo"], { replace: true });
          } else {
            navigate("/", { replace: true });
          }
        }, 1800);
        return () => clearTimeout(timer);
      }
    }
    return undefined;
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
            Welcome back{user?.user_metadata?.["full_name"] ? `, ${user.user_metadata["full_name"]}` : ""}
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
      if (mode === "signin") {
        if (!form.email || !form.password) {
          throw new Error("Email and password are required.");
        }
        const { error } = await supabase.auth.signInWithPassword({
          email: form.email.trim(),
          password: form.password,
        });
        if (error) throw error;
        toast.success("Welcome back");
      } else if (mode === "signup") {
        if (!form.email || !form.password || !form.name) {
          throw new Error("Name, email, and password are required for signup.");
        }
        const { data, error } = await supabase.auth.signUp({
          email: form.email.trim(),
          password: form.password,
          options: {
            data: { full_name: form.name.trim() }
          }
        });
        if (error) throw error;
        
        toast.success("Account created successfully!");
      }
    } catch (err) {
      if (err instanceof Error) {
        if (err.message.includes("Invalid login credentials")) {
          toast.error("Invalid email or password. If you forgot your password, use Forgot Password.");
        } else if (err.message.includes("User already registered")) {
          toast.error("This email is already registered. Please sign in instead.");
        } else {
          toast.error(err.message);
        }
      } else {
        toast.error("Something went wrong");
      }
    } finally {
      setBusy(false);
      setIsLoggingIn(false);
    }
  }

  async function handleGoogleLogin() {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}${search["returnTo"] ? `?returnTo=${search["returnTo"]}` : ''}`
        }
      });
      if (error) throw error;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Google login failed");
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
      const { error } = await supabase.auth.resetPasswordForEmail(form.email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });
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
          {mode === "signin"
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
              <Label htmlFor="name" className="text-xs">
                Full Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
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
                maxLength={255}
                required
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

        {/* Login Form (Email + Google) */}
        {mode === "signin" && (
          <div className="space-y-6">
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
              
              <Button type="submit" className="w-full" disabled={busy}>
                Sign In
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-muted" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">OR</span>
              </div>
            </div>

            <Button 
              type="button" 
              variant="outline" 
              className="w-full" 
              onClick={handleGoogleLogin} 
              disabled={busy}
            >
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continue with Google
            </Button>
          </div>
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
        {(mode === "signin") && (
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
