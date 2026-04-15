"use client";
// src/app/auth/forgot-password/page.tsx

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await authClient.requestPasswordReset({
        email,
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`,
      });
      setSent(true);
    } catch {
      toast.error("Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md text-center card p-10 animate-fade-in">
          <div className="text-6xl mb-4">📧</div>
          <h2 className="font-display text-2xl font-bold text-gray-900 mb-3">Email Sent!</h2>
          <p className="text-gray-500 mb-6">
            Password reset link sent to <strong>{email}</strong>.
            Check your inbox (and spam folder).
          </p>
          <Link href="/auth/login" className="btn-primary block text-center">Back to Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <span className="text-5xl">🔐</span>
          <h1 className="font-display text-3xl font-bold text-gray-900 mt-3">Forgot Password?</h1>
          <p className="text-gray-500 mt-2">Enter your email to receive a reset link</p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="input pl-10"
                  required
                />
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3 disabled:opacity-60">
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>

          <Link href="/auth/login" className="flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-rose-700 mt-6 transition-colors">
            <ArrowLeft size={14} /> Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
