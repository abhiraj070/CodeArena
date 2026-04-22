import { cn } from "@/lib/utils.js";

export function DifficultyBadge({ difficulty, className }) {
  const value = difficulty?.toLowerCase();
  const styles = {
    easy: "text-green-700 bg-green-100",
    medium: "text-yellow-700 bg-yellow-100",
    hard: "text-red-700 bg-red-100",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium",
        styles[value] || "text-muted-foreground bg-muted",
        className,
      )}
    >
      {difficulty}
    </span>
  );
}
