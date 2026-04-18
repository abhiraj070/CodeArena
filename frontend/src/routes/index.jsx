import { useState } from "react";
import { Navbar } from "@/components/Navbar.jsx";
import { QuestionContainer } from "@/components/QuestionContainer.jsx";
import { UserList } from "@/components/UserList.jsx";
import { InviteDialog } from "@/components/InviteDialog.jsx";
import { ChatSidebar } from "@/components/ChatSidebar.jsx";
import { conversations as initialConversations, users } from "@/lib/mock-data.js";

export default function IndexPage() {
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

  return (
    <div className="min-h-screen bg-background">
      <Navbar onOpenChat={() => setChatOpen(true)} />

      <main className="mx-auto grid max-w-7xl grid-cols-1 gap-5 px-4 py-5 lg:grid-cols-[1fr_320px]">
        <QuestionContainer />
        <aside className="space-y-4">
          <UserList users={users} onInvite={setInviteUser} />
        </aside>
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
