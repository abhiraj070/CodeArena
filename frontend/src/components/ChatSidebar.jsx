import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet.jsx";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar.jsx";
import { Input } from "@/components/ui/input.jsx";
import { Button } from "@/components/ui/button.jsx";
import { ArrowLeft, Send } from "lucide-react";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils.js";

export function ChatSidebar({
  open,
  onOpenChange,
  conversations,
  onConversationsChange,
  activeId,
  onActiveChange,
}) {
  const [draft, setDraft] = useState("");

  const convos = useMemo(() => conversations ?? [], [conversations]);
  const active = convos.find((c) => c.id === activeId) ?? null;
  const setActiveId = onActiveChange ?? (() => {});
  const setConvos = onConversationsChange ?? (() => {});

  const send = () => {
    if (!active || !draft.trim()) return;
    setConvos((prev) =>
      prev.map((c) =>
        c.id === active.id
          ? {
              ...c,
              lastMessage: draft,
              messages: [
                ...c.messages,
                { id: `m${Date.now()}`, from: "me", text: draft, time: "now" },
              ],
            }
          : c,
      ),
    );
    setDraft("");
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col p-0 sm:max-w-md">
        {!active ? (
          <>
            <SheetHeader className="border-b border-border p-4">
              <SheetTitle>Messages</SheetTitle>
            </SheetHeader>
            <ul className="flex-1 overflow-y-auto">
              {convos.map((c) => (
                <li key={c.id}>
                  <button
                    onClick={() => setActiveId(c.id)}
                    className="flex w-full items-center gap-3 border-b border-border px-4 py-3 text-left transition hover:bg-muted"
                  >
                    <div className="relative">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={c.user.avatar} alt={c.user.name} />
                        <AvatarFallback>{c.user.name.slice(0, 2)}</AvatarFallback>
                      </Avatar>
                      <span
                        className={cn(
                          "absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-background",
                          c.user.online ? "bg-emerald-500" : "bg-zinc-300",
                        )}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{c.user.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{c.lastMessage}</p>
                    </div>
                    {c.unread > 0 && (
                      <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-semibold text-primary-foreground">
                        {c.unread}
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <>
            <SheetHeader className="flex-row items-center gap-2 space-y-0 border-b border-border p-3">
              <Button variant="ghost" size="icon" onClick={() => setActiveId(null)}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Avatar className="h-8 w-8">
                <AvatarImage src={active.user.avatar} alt={active.user.name} />
                <AvatarFallback>{active.user.name.slice(0, 2)}</AvatarFallback>
              </Avatar>
              <SheetTitle className="text-sm">{active.user.name}</SheetTitle>
            </SheetHeader>
            <div className="flex-1 space-y-3 overflow-y-auto bg-muted/30 p-4">
              {active.messages.map((m) => (
                <div
                  key={m.id}
                  className={cn("flex", m.from === "me" ? "justify-end" : "justify-start")}
                >
                  <div
                    className={cn(
                      "max-w-[75%] rounded-2xl px-3.5 py-2 text-sm shadow-sm",
                      m.from === "me"
                        ? "rounded-br-sm bg-primary text-primary-foreground"
                        : "rounded-bl-sm bg-card text-foreground",
                    )}
                  >
                    {m.text}
                    <div
                      className={cn(
                        "mt-1 text-[10px]",
                        m.from === "me" ? "text-primary-foreground/70" : "text-muted-foreground",
                      )}
                    >
                      {m.time}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                send();
              }}
              className="flex items-center gap-2 border-t border-border p-3"
            >
              <Input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Type a message..."
                className="rounded-full"
              />
              <Button type="submit" size="icon" className="rounded-full">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
