"use client";

import { useEffect } from "react";

import { useRouter } from "next/navigation";

import { LoadingScreen } from "@/components/ui/loading-spinner";
import { useAuth } from "@/context/auth-context";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return <LoadingScreen size="md" />;
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
