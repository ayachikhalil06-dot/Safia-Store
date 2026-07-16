import { cn } from "@/utils/cn";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "sale" | "new" | "outlined";
  className?: string;
}

const variants = {
  default: "bg-neutral-900 text-white",
  sale: "bg-red-600 text-white",
  new: "bg-emerald-600 text-white",
  outlined: "border border-neutral-300 text-neutral-700 bg-white",
};

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium tracking-wide",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
