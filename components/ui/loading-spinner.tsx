import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function LoadingSpinner({
  size = "md",
  className,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  return (
    <div
      className={cn(
        "animate-spin rounded-full border-b-2 border-gray-900 dark:border-gray-100",
        sizeClasses[size],
        className
      )}
    />
  );
}

// Centered loading wrapper
export function LoadingScreen({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  return (
    <div className="flex items-center justify-center min-h-screen dark:bg-neutral-900 bg-neutral-100">
      <LoadingSpinner size={size} />
    </div>
  );
}
