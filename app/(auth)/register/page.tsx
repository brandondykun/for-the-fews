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
import { MIN_PASSWORD_LENGTH } from "@/constants";
import { useAuth } from "@/context/auth-context";
import { devError } from "@/lib/dev-utils";
import { auth } from "@/lib/firebase";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [joinCode, setJoinCode] = useState("");
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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Check honeypot fields - if filled, it's likely a bot
    if (isBot) {
      // Silently fail for bots - don't give them feedback
      setLoading(false);
      return;
    }

    // Validate fields
    if (!email || !password || !confirmPassword || !displayName || !joinCode) {
      setError("All fields are required");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(
        `Password must be at least ${MIN_PASSWORD_LENGTH} characters long`
      );
      setLoading(false);
      return;
    }

    try {
      // Call the registration API
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          displayName,
          joinCode,
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          const errorData = await response.json();
          const resetTime = new Date(errorData.resetTime);
          const timeRemaining = Math.ceil(
            (resetTime.getTime() - Date.now()) / (1000 * 60)
          ); // minutes
          throw new Error(
            `Too many registration attempts. Please try again in ${timeRemaining} minute${
              timeRemaining !== 1 ? "s" : ""
            }.`
          );
        }

        // Handle specific error cases based on status codes
        if (response.status === 400) {
          throw new Error(
            "Invalid registration information. Please check your details and try again."
          );
        } else if (response.status === 409) {
          throw new Error("An account with this email already exists.");
        } else if (response.status === 403) {
          throw new Error(
            "Invalid join code. Please check your code and try again."
          );
        } else {
          throw new Error("Registration failed. Please try again later.");
        }
      }

      // If registration is successful, sign in the user
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/dashboard");
    } catch (error) {
      devError("Registration error:", error);

      // Provide user-friendly error messages
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Registration failed. Please try again later.");
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
      title="Join the 'Fews"
      subtitle="Create your account to become one of the Few."
      cardTitle="Register"
      cardDescription="Create your account to join the exclusive community"
    >
      <form onSubmit={handleRegister} className="space-y-4">
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
        <div className="space-y-2">
          <Label htmlFor="displayName" className="dark:text-neutral-300">
            Display Name{" "}
            <span className="text-xs dark:text-neutral-400 text-neutral-600 font-light">
              (shown to other users)
            </span>
          </Label>
          <Input
            id="displayName"
            type="text"
            placeholder="Enter your display name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
            className="dark:bg-neutral-700 dark:border-neutral-700 dark:text-neutral-100 dark:placeholder-neutral-400"
          />
        </div>
        <div className="space-y-2">
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
        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="dark:text-neutral-300">
            Confirm Password
          </Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="dark:bg-neutral-700 dark:border-neutral-700 dark:text-neutral-100 dark:placeholder-neutral-400"
          />
        </div>
        <div className="space-y-2 mb-8">
          <Label htmlFor="joinCode" className="dark:text-neutral-300">
            Join Code
          </Label>
          <Input
            id="joinCode"
            type="text"
            placeholder="Enter your join code"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value)}
            required
            className="dark:bg-neutral-700 dark:border-neutral-700 dark:text-neutral-100 dark:placeholder-neutral-400"
          />
        </div>
        {error && (
          <div className="text-red-500 text-sm text-center">{error}</div>
        )}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Creating Account..." : "Register"}
        </Button>
        <div className="text-center mt-4">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Sign in here
            </Link>
          </p>
        </div>
      </form>
    </AuthFormLayout>
  );
}
