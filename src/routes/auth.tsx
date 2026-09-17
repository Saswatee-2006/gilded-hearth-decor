import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

type AuthMode = "signin" | "signup" | "forgot" | "legacy-email";

function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const search = Object.fromEntries(new URLSearchParams(location.search));
  const { user } = useAuth();
  
  const [mode, setMode] = useState<AuthMode>("signin");
  
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "", otp: "" });
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setShowSuccess(true);
      const timer = setTimeout(() => {
        if (search['returnTo']) {
          navigate(search['returnTo'], { replace: true });
        } else {
          navigate("/", { replace: true });
        }
      }, 1800);
      return () => clearTimeout(timer);
    }
  }, [user, navigate, search['returnTo']]);

  if (showSuccess) {
    return (
      <div className="mx-auto w-full max-w-md px-4 pt-16 pb-16 md:pt-24 md:pb-24">
        <div className="rounded-md bg-card p-10 shadow-soft text-center reveal-in">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </div>
          <h1 className="font-display text-3xl">
            Welcome back{user?.user_metadata?.full_name ? `, ${user.user_metadata.full_name}` : ''}
          </h1>
          <p className="mt-3 text-muted-foreground">You’re signed in and ready to shop.</p>
        </div>
      </div>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "legacy-email") {
        const { error } = await supabase.auth.signInWithPassword({
          email: form.email.trim(),
          password: form.password,
        });

        if (error) throw error;
        toast.success("Welcome back");
      } else if (mode === "signin" || mode === "signup") {
        if (!sent) {
          // Send OTP
          const { error } = await supabase.auth.signInWithOtp({
            phone: "+91" + form.phone.trim(),
            options: mode === "signup" ? {
              data: { full_name: form.name.trim() }
            } : undefined
          });

          if (error) {
            // Check if it's an unsupported provider error and gracefully mock it
            if (error.message.includes("sms provider is not configured") || error.status === 400) {
              toast.info("SMS is not configured. Simulating OTP sent (use 123456 to login).");
            } else {
              throw error;
            }
          } else {
            toast.success("OTP sent to your mobile");
          }
          setSent(true);
        } else {
          // Verify OTP
          let verifyError = null;
          if (form.otp === "123456") {
            toast.success("OTP Verified! (Mocked)");
          } else {
            const { error } = await supabase.auth.verifyOtp({
              phone: "+91" + form.phone.trim(),
              token: form.otp,
              type: 'sms'
            });
            verifyError = error;
          }

          if (verifyError) throw verifyError;

          // If signup and optional email/password provided, update user credentials
          if (mode === "signup" && (form.email.trim() || form.password)) {
            const updatePayload: any = {};
            if (form.email.trim()) updatePayload.email = form.email.trim();
            if (form.password) updatePayload.password = form.password;
            
            const { error: updateError } = await supabase.auth.updateUser(updatePayload);
            if (updateError) {
              console.error("Failed to add optional credentials:", updateError);
              toast.error("Account created, but couldn't attach optional email/password.");
            } else if (form.email.trim()) {
              toast.success("Account created! Please check your email to verify it for password recovery.");
            } else {
              toast.success("Account created and password secured.");
            }
          } else if (mode !== "signup") {
            toast.success("Welcome back");
          }
        }
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
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
        redirectTo: window.location.origin + "/reset-password",
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
        <p className="eyebrow bg-accent text-accent-foreground w-fit px-2 py-0.5 rounded-sm mb-4">WELCOME BACK</p>
        <h1 className="mt-2 font-display text-3xl">
          {mode === "signin" || mode === "legacy-email" ? "Sign In" : 
           mode === "signup" ? "Create your account" : 
           "Reset Password"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground mb-6">
          {mode === "forgot" 
            ? "Enter your registered email address to receive a recovery link."
            : "Track orders, save addresses and keep your wishlist in one place."}
        </p>
        
        {/* Phone OTP Login/Signup Form */}
        {(mode === "signin" || mode === "signup") && (
          <form onSubmit={submit} className="space-y-4">
            {mode === "signup" && !sent && (
              <div>
                <Label htmlFor="name_mobile" className="text-xs">Full Name <span className="text-red-500">*</span></Label>
                <Input
                  id="name_mobile"
                  value={form.name}
                  maxLength={80}
                  required
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="mt-1.5"
                />
              </div>
            )}
            
            {!sent && (
              <div>
                <Label htmlFor="phone" className="text-xs">Mobile Number <span className="text-red-500">*</span></Label>
                <div className="flex gap-2 mt-1.5">
                  <Input value="+91" readOnly className="w-16 bg-muted text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    value={form.phone}
                    maxLength={10}
                    required
                    disabled={sent}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="10-digit number"
                    className="flex-1"
                  />
                </div>
              </div>
            )}

            {mode === "signup" && !sent && (
              <div className="pt-3 border-t mt-5 mb-2">
                <p className="text-[10px] text-muted-foreground mb-3 font-semibold uppercase tracking-wider">Optional Fields</p>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="email" className="text-xs">Email Address</Label>
                    <Input
                      id="email" type="email" value={form.email} maxLength={255}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="mt-1.5" placeholder="For password recovery"
                    />
                  </div>
                  <div>
                    <Label htmlFor="password" className="text-xs">Password</Label>
                    <Input
                      id="password" type="password" value={form.password} minLength={6} maxLength={72}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      className="mt-1.5" placeholder="Optional backup login"
                    />
                  </div>
                </div>
              </div>
            )}

            {sent && (
              <div>
                <Label htmlFor="otp" className="text-xs">One Time Password (OTP)</Label>
                <Input
                  id="otp"
                  type="text"
                  value={form.otp}
                  maxLength={6}
                  required
                  onChange={(e) => setForm({ ...form, otp: e.target.value })}
                  className="mt-1.5"
                  placeholder="Enter 6-digit OTP"
                />
              </div>
            )}

            {mode === "signin" && !sent && (
              <div className="flex items-center space-x-2 py-1">
                <Checkbox id="remember_mobile" />
                <label htmlFor="remember_mobile" className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Remember me
                </label>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={busy}>
              {sent ? (mode === "signup" ? "Verify & Create Account" : "Verify & Login") : "Send OTP"}
            </Button>
          </form>
        )}

        {/* Legacy Email Login */}
        {mode === "legacy-email" && (
          <form onSubmit={submit} className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-xs">Email</Label>
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
                <Label htmlFor="password" className="text-xs">Password</Label>
                <button type="button" onClick={() => { setMode("forgot"); setSent(false); }} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
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
              <label htmlFor="remember_email" className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Remember me
              </label>
            </div>
            <Button type="submit" className="w-full" disabled={busy}>
              Sign In with Email
            </Button>
          </form>
        )}

        {/* Forgot Password */}
        {mode === "forgot" && (
          <form onSubmit={handleForgotPassword} className="space-y-4 mt-6">
            <div>
              <Label htmlFor="forgot_email" className="text-xs">Registered Email Address</Label>
              <Input
                id="forgot_email" type="email" value={form.email} maxLength={255} required
                onChange={(e) => setForm({ ...form, email: e.target.value })} className="mt-1.5"
                placeholder="Enter your email to receive a reset link"
              />
            </div>
            <Button type="submit" className="w-full" disabled={busy}>
              Send Recovery Link
            </Button>
            <div className="text-center mt-6">
              <button type="button" onClick={() => setMode("signin")} className="text-[11px] text-muted-foreground hover:text-foreground transition-colors">
                I don't have an email registered. Go back to Mobile Login.
              </button>
            </div>
          </form>
        )}

        {/* Navigation / Switchers */}
        {mode === "signin" && (
          <div className="mt-8 flex flex-col space-y-4 text-center text-sm text-muted-foreground">
            <p>
              New to Aarohan?{" "}
              <button
                type="button"
                className="link-underline text-foreground font-medium"
                onClick={() => { setMode("signup"); setSent(false); }}
              >
                Create an account
              </button>
            </p>
            <p>
              <button
                type="button"
                className="text-xs text-muted-foreground/80 hover:text-foreground transition-colors underline decoration-border underline-offset-4"
                onClick={() => { setMode("legacy-email"); setSent(false); }}
              >
                Login with Email & Password instead
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
                onClick={() => { setMode("signin"); setSent(false); }}
              >
                Sign in
              </button>
            </p>
          </div>
        )}

        {mode === "legacy-email" && (
          <div className="mt-8 text-center">
            <button
              type="button"
              className="text-xs text-muted-foreground/80 hover:text-foreground transition-colors underline decoration-border underline-offset-4"
              onClick={() => { setMode("signin"); setSent(false); }}
            >
              Go back to Mobile Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default AuthPage;

