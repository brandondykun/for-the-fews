"use client";

import { usePathname } from "next/navigation";

import Header from "@/components/header";
import ProtectedRoute from "@/components/protected-route";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getHeaderTitle } from "@/lib/utils";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isGamePage = pathname.startsWith("/games/");

  const headerTitle = getHeaderTitle(pathname);

  return (
    <ProtectedRoute>
      <main className="bg-neutral-50 dark:bg-neutral-900">
        <Header
          title={headerTitle}
          backButtonUrl={isGamePage ? "/games" : "/dashboard"}
          backButtonText={isGamePage ? "Back to Games" : "Back to Dashboard"}
        />
        <ScrollArea className="h-[calc(dvh-64px)]">{children}</ScrollArea>
      </main>
    </ProtectedRoute>
  );
}
