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

  function normalizeIndianPhone(raw: string): string {
    let digits = raw.replace(/\D/g, "");
    if (digits.startsWith("91") && digits.length > 10) {
      digits = digits.substring(2);
    } else if (digits.startsWith("0") && digits.length > 10) {
      digits = digits.substring(1);
    }
    if (digits.length !== 10) {
      throw new Error("Invalid phone number. Please enter a valid 10-digit Indian mobile number.");
    }
    return `+91${digits}`;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setIsLoggingIn(true);
    try {
      if (mode === "legacy-email") {
        if (!form.email || !form.password) {
          throw new Error("Email and password are required.");
        }
        const { error } = await supabase.auth.signInWithPassword({
          email: form.email.trim(),
          password: form.password,
        });
        if (error) throw error;
        toast.success("Welcome back");
      } else if (mode === "signin") {
        if (!form.phone || !form.password) {
          throw new Error("Mobile number and password are required.");
        }
        const normalizedPhone = normalizeIndianPhone(form.phone);
        const { error } = await supabase.auth.signInWithPassword({
          phone: normalizedPhone,
          password: form.password,
        });
        if (error) throw error;
        toast.success("Welcome back");
      } else if (mode === "signup") {
        if (!form.phone || !form.password || !form.name) {
          throw new Error("Name, mobile number, and password are required for signup.");
        }
        const normalizedPhone = normalizeIndianPhone(form.phone);
        const { data, error } = await supabase.auth.signUp({
          phone: normalizedPhone,
          password: form.password,
          options: {
            data: {
              full_name: form.name.trim(),
              email: form.email ? form.email.trim() : undefined,
            }
          }
        });
        if (error) throw error;
        
        toast.success("Account created successfully!");
      }
    } catch (err) {
      if (err instanceof Error && err.message.includes("Phone logins are disabled")) {
        toast.error("Phone Provider is disabled in Supabase. Please enable it in Authentication > Providers.");
      } else {
        toast.error(err instanceof Error ? err.message : "Something went wrong");
      }
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
              <Label htmlFor="phone" className="text-xs">
                Mobile Number <span className="text-red-500">*</span>
              </Label>
              <div className="relative mt-1.5">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">+91</span>
                <Input
                  id="phone"
                  type="tel"
                  value={form.phone}
                  required
                  maxLength={15}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="pl-10"
                  placeholder="9999999999"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="email" className="text-xs">
                Email Address (Optional)
              </Label>
              <Input
                id="email"
                type="email"
                value={form.email}
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

        {/* Login Form (Phone) */}
        {mode === "signin" && (
          <form onSubmit={submit} className="space-y-4">
            <div>
              <Label htmlFor="phone" className="text-xs">
                Mobile Number
              </Label>
              <div className="relative mt-1.5">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">+91</span>
                <Input
                  id="phone"
                  type="tel"
                  value={form.phone}
                  required
                  maxLength={10}
                  onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, '') })}
                  className="pl-10"
                  placeholder="9999999999"
                />
              </div>
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
                value={form.password}
                required
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="mt-1.5"
              />
            </div>
            <Button type="submit" className="w-full" disabled={busy}>
              Sign In
            </Button>
            
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => setMode("legacy-email")}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Use email instead
              </button>
            </div>
          </form>
        )}

        {/* Legacy Email Form */}
        {mode === "legacy-email" && (
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
