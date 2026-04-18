import { useMemo, useState } from "react";
import { Navbar } from "@/components/Navbar.jsx";
import { ChatSidebar } from "@/components/ChatSidebar.jsx";
import { InviteDialog } from "@/components/InviteDialog.jsx";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar.jsx";
import { Button } from "@/components/ui/button.jsx";
import { Card } from "@/components/ui/card.jsx";
import { Input } from "@/components/ui/input.jsx";
import { Search } from "lucide-react";
import { conversations as initialConversations, users } from "@/lib/mock-data.js";
import { cn } from "@/lib/utils.js";

export default function PeoplePage() {
  const [search, setSearch] = useState("");
  const [inviteUser, setInviteUser] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [conversations, setConversations] = useState(initialConversations);
  const [activeChatId, setActiveChatId] = useState(null);

  const handleSendInvite = ({ user, message, code }) => {
    if (!user || !message) return;
    const text = code ? `${message} Session code: ${code}` : message;
    const timestamp = Date.now();
    let targetId = null;

    setConversations((prev) => {
      const existing = prev.find((c) => c.user.id === user.id);
      if (existing) {
        targetId = existing.id;
        return prev.map((c) =>
          c.id === existing.id
            ? {
                ...c,
                lastMessage: text,
                unread: 0,
                messages: [
                  ...c.messages,
                  { id: `m${timestamp}`, from: "me", text, time: "now" },
                ],
              }
            : c,
        );
      }

      const newConversation = {
        id: `c${timestamp}`,
        user,
        lastMessage: text,
        unread: 0,
        messages: [{ id: `m${timestamp}`, from: "me", text, time: "now" }],
      };

      targetId = newConversation.id;

      return [newConversation, ...prev];
    });

    if (targetId) setActiveChatId(targetId);
    setChatOpen(true);
    setInviteUser(null);
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => u.name.toLowerCase().includes(q));
  }, [search]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar onOpenChat={() => setChatOpen(true)} />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="text-2xl font-semibold tracking-tight">Find people</h1>
        <p className="mb-6 text-sm text-muted-foreground">
          Search developers and invite them to a coding session.
        </p>

        <div className="relative mb-6 max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name..."
            className="h-10 rounded-full pl-9"
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((u) => (
            <Card key={u.id} className="flex items-center gap-3 p-4">
              <div className="relative">
                <Avatar className="h-11 w-11">
                  <AvatarImage src={u.avatar} alt={u.name} />
                  <AvatarFallback>{u.name.slice(0, 2)}</AvatarFallback>
                </Avatar>
                <span
                  className={cn(
                    "absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-card",
                    u.online ? "bg-emerald-500" : "bg-zinc-300",
                  )}
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{u.name}</p>
                <p className="truncate text-xs text-muted-foreground">{u.role}</p>
              </div>
              <Button size="sm" variant="outline" onClick={() => setInviteUser(u)}>
                Invite
              </Button>
            </Card>
          ))}
        </div>
      </main>

      <InviteDialog
        user={inviteUser}
        open={!!inviteUser}
        onClose={() => setInviteUser(null)}
        onSendInvite={handleSendInvite}
      />
      <ChatSidebar
        open={chatOpen}
        onOpenChange={setChatOpen}
        conversations={conversations}
        onConversationsChange={setConversations}
        activeId={activeChatId}
        onActiveChange={setActiveChatId}
      />
    </div>
  );
}
