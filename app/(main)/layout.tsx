"use client";

import { usePathname } from "next/navigation";

import Header from "@/components/header";
import ProtectedRoute from "@/components/protected-route";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PuzzleProgressProvider } from "@/context/puzzle-progress-context";
import { getHeaderTitle } from "@/lib/utils";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isGamePage = pathname.startsWith("/games/");
  const isPuzzlePage =
    pathname.startsWith("/games/puzzle") && pathname !== "/games/puzzle";
  const isPuzzleSection = pathname.startsWith("/games/puzzle");

  const headerTitle = getHeaderTitle(pathname);

  const backUrl = isPuzzlePage
    ? "/games/puzzle"
    : isGamePage
      ? "/games"
      : "/dashboard";

  const backButtonText = isPuzzlePage
    ? "Back"
    : isGamePage
      ? "Back to Games"
      : "Back to Dashboard";

  const content = (
    <main className="bg-neutral-50 dark:bg-neutral-900">
      <Header
        title={headerTitle}
        backButtonUrl={backUrl}
        backButtonText={backButtonText}
      />
      <ScrollArea className="h-[calc(dvh-64px)]">{children}</ScrollArea>
    </main>
  );

  return (
    <ProtectedRoute>
      {isPuzzleSection ? (
        <PuzzleProgressProvider>{content}</PuzzleProgressProvider>
      ) : (
        content
      )}
    </ProtectedRoute>
  );
}
