import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ColorModeSwitch from "@/components/ui/colorModeSwitch";
import { PageTitle, SectionTitle } from "@/components/ui/gradient-text";
import { GradientBorder } from "@/components/ui/gradientBorder";

interface AuthFormLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  cardTitle: string;
  cardDescription: string;
  bottomPadding?: boolean;
}

export function AuthFormLayout({
  children,
  title,
  subtitle,
  cardTitle,
  cardDescription,
  bottomPadding = false,
}: AuthFormLayoutProps) {
  return (
    <div className="min-h-screen flex bg-gradient-to-br from-neutral-50 via-neutral-300 to-neutral-50 dark:from-neutral-900 dark:via-neutral-950 dark:to-neutral-900">
      {/* Dark Mode Toggle */}
      <div className="absolute top-4 right-4">
        <ColorModeSwitch />
      </div>

      <div className={`flex flex-col flex-1 ${bottomPadding ? "p-4" : ""}`}>
        {/* Header Section */}
        <div className="flex flex-col items-center justify-center gap-4 mt-18 mb-12">
          <PageTitle className="font-light">{title}</PageTitle>
          <h2 className="text-center text-neutral-400">{subtitle}</h2>
        </div>

        {/* Form Card */}
        <div
          className={`flex justify-center items-center ${
            bottomPadding ? "mb-8" : ""
          }`}
        >
          <GradientBorder roundedSize="2xl" width={1}>
            <Card className="sm:w-sm md:w-md dark:bg-neutral-950 dark:border-neutral-900">
              <CardHeader>
                <CardTitle className="mb-2">
                  <SectionTitle>{cardTitle}</SectionTitle>
                </CardTitle>
                <CardDescription className="dark:text-neutral-300">
                  {cardDescription}
                </CardDescription>
              </CardHeader>
              <CardContent>{children}</CardContent>
            </Card>
          </GradientBorder>
        </div>
      </div>
    </div>
  );
}
