import ColorModeSwitch from "@/components/ui/colorModeSwitch";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="min-h-screen relative">
      <div className="absolute top-4 right-4">
        <ColorModeSwitch />
      </div>
      {children}
    </main>
  );
}
