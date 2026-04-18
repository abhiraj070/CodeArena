import { cn } from "@/lib/utils.js";

export function DifficultyBadge({ difficulty, className }) {
  const styles = {
    Easy: "text-emerald-400",
    Medium: "text-amber-400",
    Hard: "text-rose-400",
  };

  return (
    <span className={cn("text-xs font-medium", styles[difficulty], className)}>
      {difficulty}
    </span>
  );
}
