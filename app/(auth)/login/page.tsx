"use client";

import { useState, useEffect } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { signInWithEmailAndPassword } from "firebase/auth";

import { AuthFormLayout } from "@/components/auth-form-layout";
import { HoneypotFields, useHoneypot } from "@/components/honeypot-fields";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/auth-context";
import { devError } from "@/lib/dev-utils";
import { auth } from "@/lib/firebase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Anti-bot honeypot fields
  const { website, phone, setWebsite, setPhone, isBot } = useHoneypot();

  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push("/dashboard");
    }
  }, [user, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Check honeypot fields - if filled, it's likely a bot
    if (isBot) {
      // Silently fail for bots - don't give them feedback
      setLoading(false);
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/dashboard");
    } catch (error) {
      devError("Login error:", error);

      // Check if it's an invalid credential error
      if (error && typeof error === "object" && "code" in error) {
        if (
          error.code === "auth/invalid-credential" ||
          error.code === "auth/wrong-password" ||
          error.code === "auth/user-not-found"
        ) {
          setError("Invalid Credentials");
        } else {
          setError("There was an error logging you in. Please try again.");
        }
      } else {
        setError("There was an error logging you in. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (user) {
    return null; // Will redirect in useEffect
  }

  return (
    <AuthFormLayout
      title="Welcome to the 'Fews"
      subtitle="Congratulations. You have been selected to join the Few."
      cardTitle="Sign In"
      cardDescription="Enter your email and password to access your account"
    >
      <form onSubmit={handleLogin} className="space-y-4">
        <HoneypotFields
          website={website}
          phone={phone}
          onWebsiteChange={setWebsite}
          onPhoneChange={setPhone}
        />

        <div className="space-y-2">
          <Label htmlFor="email" className="dark:text-neutral-300">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="dark:bg-neutral-700 dark:border-neutral-700 dark:text-neutral-100 dark:placeholder-neutral-400"
          />
        </div>
        <div className="space-y-2 mb-8">
          <Label htmlFor="password" className="dark:text-neutral-300">
            Password
          </Label>
          <Input
            id="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="dark:bg-neutral-700 dark:border-neutral-700 dark:text-neutral-100 dark:placeholder-neutral-400"
          />
        </div>
        {error && (
          <div className="text-red-500 text-sm text-center">{error}</div>
        )}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Signing in..." : "Sign In"}
        </Button>
        <div className="text-center mt-4">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Register here
            </Link>
          </p>
        </div>
      </form>
    </AuthFormLayout>
  );
}
