import { Link, useParams } from "react-router-dom";
import { useState } from "react";
import Editor from "@monaco-editor/react";
import { Button } from "@/components/ui/button.jsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.jsx";
import { DifficultyBadge } from "@/components/DifficultyBadge.jsx";
import { questions, STARTER_CODE, LANGUAGES } from "@/lib/mock-data.js";
import { ArrowLeft, Code2, Play, Send } from "lucide-react";
import NotFoundPage from "./NotFound.jsx";
export default function QuestionPage() {
  const { id } = useParams();
  const question = questions.find((q) => q.id === id);
  if (!question) return <NotFoundPage />;
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState(STARTER_CODE.javascript);

  const onLanguageChange = (val) => {
    const lang = val;
    setLanguage(lang);
    setCode(STARTER_CODE[lang]);
  };

  return (
    <div className="flex h-screen flex-col bg-background">
      <header className="flex h-14 items-center justify-between border-b border-border bg-background/85 px-4 backdrop-blur">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition hover:bg-muted hover:text-foreground"
            aria-label="Back to problems"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Code2 className="h-4 w-4" />
          </span>
          <h1 className="text-sm font-semibold sm:text-base">{question.title}</h1>
          <DifficultyBadge difficulty={question.difficulty} />
        </div>
        <span className="hidden text-xs text-muted-foreground sm:inline">
          Acceptance · {question.acceptance.toFixed(1)}%
        </span>
      </header>

      <div className="grid flex-1 grid-cols-1 overflow-hidden md:grid-cols-2">
        <section className="overflow-y-auto border-b border-border p-6 md:border-b-0 md:border-r">
          <div className="mb-3 flex items-center gap-2">
            <h2 className="text-lg font-semibold">{question.title}</h2>
          </div>
          <div className="mb-4 flex flex-wrap gap-1.5">
            {question.tags.map((t) => (
              <span key={t} className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                {t}
              </span>
            ))}
          </div>

          <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Description
          </h3>
          <p className="mb-5 text-sm leading-relaxed text-foreground/90">{question.description}</p>

          {question.example && (
            <>
              <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Example
              </h3>
              <pre className="overflow-x-auto rounded-lg border border-border bg-muted/40 p-3 text-xs text-foreground">
                <span className="text-muted-foreground">Input:  </span>
                {question.example.input}
                {"\n"}
                <span className="text-muted-foreground">Output: </span>
                <span className="text-primary">{question.example.output}</span>
              </pre>
            </>
          )}

          <h3 className="mb-1.5 mt-5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Constraints
          </h3>
          <ul className="list-inside list-disc space-y-1 text-sm text-foreground/80">
            <li>1 ≤ n ≤ 10⁵</li>
            <li>−10⁹ ≤ values ≤ 10⁹</li>
            <li>Solution must run within the time limit</li>
          </ul>
        </section>

        <section className="flex flex-col overflow-hidden bg-[oklch(0.13_0_0)]">
          <div className="flex items-center justify-between border-b border-border/60 bg-[oklch(0.18_0_0)] px-3 py-2">
            <Select value={language} onValueChange={onLanguageChange}>
              <SelectTrigger className="h-8 w-40 border-border/60 bg-background/40 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((l) => (
                  <SelectItem key={l.value} value={l.value}>
                    {l.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
              main.{extFor(language)}
            </span>
          </div>

          <div className="flex-1">
            <Editor
              height="100%"
              width="100%"
              language={language}
              theme="vs-dark"
              value={code}
              onChange={(value) => setCode(value ?? "")}
              path={`main.${extFor(language)}`}
              options={editorOptions}
            />
          </div>

          <div className="border-t border-border/60 bg-[oklch(0.18_0_0)] px-3 py-2 text-xs text-muted-foreground">
            <span className="text-primary">●</span> Console output will appear here.
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-border/60 bg-[oklch(0.18_0_0)] px-3 py-2.5">
            <Button
              size="sm"
              variant="outline"
              className="h-8 gap-1.5 border-border/60 bg-transparent hover:border-primary/60 hover:bg-primary/10 hover:text-primary"
            >
              <Play className="h-3.5 w-3.5" /> Run
            </Button>
            <Button
              size="sm"
              className="h-8 gap-1.5 bg-primary text-primary-foreground shadow-[0_0_0_1px_oklch(0.74_0.18_150/0.4)] hover:bg-primary/90"
            >
              <Send className="h-3.5 w-3.5" /> Submit
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}

function extFor(lang) {
  switch (lang) {
    case "javascript":
      return "js";
    case "typescript":
      return "ts";
    case "python":
      return "py";
    case "cpp":
      return "cpp";
    case "java":
      return "java";
  }
}

const editorOptions = {
  fontSize: 13,
  lineHeight: 22,
  minimap: { enabled: false },
  scrollBeyondLastLine: false,
  scrollbar: {
    verticalScrollbarSize: 8,
    horizontalScrollbarSize: 8,
  },
  wordWrap: "off",
  tabSize: 2,
  automaticLayout: true,
};
