import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input.jsx";
import { Card } from "@/components/ui/card.jsx";
import { DifficultyBadge } from "./DifficultyBadge";
import { questions } from "@/lib/mock-data.js";
import { Check, Circle, Lock, Search } from "lucide-react";

export function QuestionContainer() {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return questions;
    return questions.filter(
      (x) => x.title.toLowerCase().includes(q) || x.tags.some((t) => t.toLowerCase().includes(q)),
    );
  }, [search]);

  return (
    <Card className="flex h-[calc(100vh-7.5rem)] flex-col overflow-hidden p-0">
      <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold">Problems</h2>
          <p className="text-xs text-muted-foreground">{filtered.length} questions</p>
        </div>
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search questions"
            className="h-9 rounded-full border-border bg-muted/40 pl-9 focus-visible:ring-primary"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted-foreground">
            No questions match "{search}".
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {filtered.map((q, i) => (
              <li key={q.id}>
                <Link
                  to={`/question/${q.id}`}
                  className="grid grid-cols-[2rem_1.25rem_1fr_auto_5rem] items-center gap-3 px-4 py-3 transition hover:bg-muted/40"
                >
                  <span className="text-xs text-muted-foreground tabular-nums">{i + 1}.</span>
                  <span className="flex h-5 w-5 items-center justify-center">
                    {q.solved ? (
                      <Check className="h-4 w-4 text-primary" />
                    ) : (
                      <Circle className="h-3.5 w-3.5 text-muted-foreground/50" />
                    )}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {q.title}
                      {q.locked && <Lock className="ml-2 inline h-3 w-3 text-muted-foreground" />}
                    </p>
                    <div className="mt-0.5 hidden flex-wrap gap-1.5 sm:flex">
                      {q.tags.slice(0, 3).map((t) => (
                        <span
                          key={t}
                          className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                  <span className="text-xs tabular-nums text-muted-foreground">
                    {q.acceptance.toFixed(1)}%
                  </span>
                  <DifficultyBadge difficulty={q.difficulty} className="text-right" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Card>
  );
}
