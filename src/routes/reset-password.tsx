import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        toast.success("Ready to reset password. Please enter your new password.");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      toast.error("Passwords do not match");
      return;
    }
    
    setBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      
      toast.success("Password has been successfully reset!");
      // Sign out to enforce a fresh login with the new credentials
      await supabase.auth.signOut();
      navigate("/auth");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to reset password");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-md px-4 pt-16 pb-16 md:pt-24 md:pb-24">
      <div className="rounded-md bg-card p-8 shadow-soft">
        <h1 className="font-display text-3xl mb-2">Reset Password</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Please enter your new password below.
        </p>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <Label htmlFor="password" className="text-xs">New Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              minLength={6}
              maxLength={72}
              required
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="confirm" className="text-xs">Confirm Password</Label>
            <Input
              id="confirm"
              type="password"
              value={confirm}
              minLength={6}
              maxLength={72}
              required
              onChange={(e) => setConfirm(e.target.value)}
              className="mt-1.5"
            />
          </div>
          <Button type="submit" className="w-full" disabled={busy}>
            Update Password
          </Button>
        </form>
      </div>
    </div>
  );
}
