import { cn } from "@/lib/utils";

interface GradientTextProps {
  children: React.ReactNode;
  className?: string;
  variant?: "primary" | "secondary" | "accent";
}

const gradientVariants = {
  primary:
    "bg-gradient-to-r dark:from-fuchsia-600 from-fuchsia-600 via-sky-500 to-yellow-500",
  secondary:
    "bg-gradient-to-r dark:from-sky-300 from-sky-600 via-sky-500 to-sky-600",
  accent: "bg-gradient-to-r from-orange-600 via-purple-600 to-sky-600",
};

export function GradientText({
  children,
  className,
  variant = "primary",
}: GradientTextProps) {
  return (
    <span
      className={cn(
        "text-transparent bg-clip-text font-semibold",
        gradientVariants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

// Specialized components for common use cases
export function PageTitle({
  children,
  className,
}: Omit<GradientTextProps, "variant">) {
  return (
    <h1 className={cn("text-6xl font-bold font-open-sans", className)}>
      <GradientText variant="primary">{children}</GradientText>
    </h1>
  );
}

export function SectionTitle({
  children,
  className,
}: Omit<GradientTextProps, "variant">) {
  return (
    <span className={cn("text-3xl", className)}>
      <GradientText variant="secondary">{children}</GradientText>
    </span>
  );
}
