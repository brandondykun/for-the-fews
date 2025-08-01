"use client";

import { useEffect } from "react";

import { useRouter } from "next/navigation";

import { LoadingScreen } from "@/components/ui/loading-spinner";
import { useAuth } from "@/context/auth-context";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.push("/dashboard");
      } else {
        router.push("/login");
      }
    }
  }, [user, loading, router]);

  if (loading) {
    return <LoadingScreen size="md" />;
  }

  return null;
}
