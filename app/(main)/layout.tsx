import Header from "@/components/header";
import ProtectedRoute from "@/components/protected-route";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ProtectedRoute>
      <main className="bg-neutral-50 dark:bg-neutral-900">
        <Header title="For the Few's" />
        <ScrollArea className="h-[calc(dvh-64px)]">{children}</ScrollArea>
      </main>
    </ProtectedRoute>
  );
}
