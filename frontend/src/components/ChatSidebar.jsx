import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar.jsx";
import { Input } from "@/components/ui/input.jsx";
import { Button } from "@/components/ui/button.jsx";
import { ArrowLeft, MessageSquare, Search, Send, Sparkles, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils.js";
import { useUser } from "@/context/user.context";
import { useSocket } from "@/context/socket.context";
import axios from "axios";

export function ChatSidebar({
  activeId,
  setActiveId,
  onClose,
}) {
  console.log("inside chatsidebar");

  const [draft, setDraft] = useState("");
  const [chat, setChat] = useState([]);
  const [chatingWith, setChattingWith] = useState([]);
  const [active, setActive] = useState(null);
  const [search, setSearch] = useState("");
  const { user } = useUser();
  const socket = useSocket();
  const bottomRef = useRef(null);


  useEffect(() => {
    if (!activeId) return;
    const fetchMessages = async () => {
      //console.log("userid:",user._id,"activeId:",activeId);

      const res = await axios.get(`feature/v1/message/getMessages/${user._id}/${activeId}`);
      setChat(res.data.data.messages || []);
      console.log("req:", res.data.data.messages);
      setActive(res.data.data.personB);
    };
    fetchMessages();
  }, [activeId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  useEffect(() => {
    const fectchPeople = async () => {
      const res = await axios.get(`feature/v1/user/chatsWith/${user._id}`);
      console.log("people", res.data.data);

      setChattingWith(res.data.data.chatsWith);
    };
    fectchPeople();

    const handleMessage = ({ message, senderId }) => {
      //console.log("sender",senderId,"active:",activeId);
      if (!activeId) return;

      if (senderId.toString() !== activeId.toString()) return;
      console.log("received message");
      //console.log("sender",senderId);

      const id = crypto.randomUUID();
      let sender;
      (async () => {
        const res = await axios.get(`/feature/v1/user/details/${senderId}`);
        sender = res.data.data.user;
        const receivedMessage = [{ message, sentBy: sender, _id: id }];
        console.log("recived:", receivedMessage);
        setChat((prev) => [...prev, ...receivedMessage]);
      })(); //this is a async IIFE: Immediatly invoked function expression
    };
    socket.on("receive-inchat-message", handleMessage);

    return () => {
      socket.off("receive-inchat-message", handleMessage); // ← cleanup
    };
  }, [activeId]);

  const handleSend = async (message) => {
    socket.emit("in-chat-message", { message, senderId: user._id, receiver_id: activeId });
    await axios.post(`/feature/v1/message/sendMessage`, {
      message,
      personA: user._id,
      personB: activeId,
    });

    const id = crypto.randomUUID();
    const properMessage = [{ message, sentBy: user, _id: id }];
    setChat((prev) => [...prev, ...properMessage]);
    setDraft("");
  };

  const filteredPeople = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return chatingWith;
    return chatingWith.filter((p) =>
      (p.username || "").toLowerCase().includes(q),
    );
  }, [chatingWith, search]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-0 backdrop-blur-sm sm:p-6 animate-in fade-in-0 duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative flex h-full w-full flex-col overflow-hidden border-0 bg-card shadow-2xl shadow-black/40 sm:h-[min(85vh,720px)] sm:max-w-4xl sm:rounded-2xl sm:border sm:border-border animate-in zoom-in-95 fade-in-0 duration-200"
      >
        {/* Decorative top glow */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-primary/10 via-primary/5 to-transparent" />

        {/* Header */}
        <div className="relative flex items-center justify-between border-b border-border bg-background/40 px-4 py-3 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <MessageSquare className="h-4 w-4" />
              <span className="absolute -inset-1 -z-10 rounded-xl bg-primary/20 blur-md" />
            </div>
            <div>
              <h2 className="text-sm font-semibold leading-none">Messages</h2>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Chat with your CodeArena connections
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full hover:bg-muted"
            aria-label="Close chat"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Body */}
        <div className="relative flex min-h-0 flex-1">
          {/* Left: people list */}
          <aside
            className={cn(
              "flex w-full flex-col border-r border-border bg-background/30 sm:w-[300px]",
              active && "hidden sm:flex",
            )}
          >
            <div className="border-b border-border p-3">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search conversations..."
                  className="h-9 rounded-full border-transparent bg-muted/40 pl-9 focus-visible:bg-muted/70 focus-visible:ring-primary/40"
                />
              </div>
            </div>

            <ul className="flex-1 space-y-0.5 overflow-y-auto p-2">
              {filteredPeople.length === 0 ? (
                <li className="px-4 py-12 text-center text-xs text-muted-foreground">
                  {chatingWith.length === 0
                    ? "No conversations yet."
                    : "No matches."}
                </li>
              ) : (
                filteredPeople.map((people) => {
                  const isActive = activeId === people._id;
                  return (
                    <li key={people._id}>
                      <button
                        onClick={() => setActiveId(people._id)}
                        className={cn(
                          "group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all",
                          isActive
                            ? "bg-primary/15 ring-1 ring-primary/30 shadow-sm shadow-primary/10"
                            : "hover:bg-muted/60",
                        )}
                      >
                        <div className="relative shrink-0">
                          <Avatar className="h-10 w-10 ring-2 ring-background">
                            <AvatarImage src={people.profilePicture} alt={people.username} />
                            <AvatarFallback className="bg-primary/20 text-xs font-semibold text-primary">
                              {(people.username || "?").slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span
                            className={cn(
                              "absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-card transition",
                              people.isOnline
                                ? "bg-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.18)]"
                                : "bg-zinc-500",
                            )}
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p
                            className={cn(
                              "truncate text-sm font-medium",
                              isActive
                                ? "text-primary"
                                : "text-foreground group-hover:text-foreground",
                            )}
                          >
                            {people.username}
                          </p>
                          <p className="truncate text-[11px] text-muted-foreground">
                            {people.isOnline ? "Online" : "Offline"}
                          </p>
                        </div>
                      </button>
                    </li>
                  );
                })
              )}
            </ul>
          </aside>

          {/* Right: chat area */}
          <section
            className={cn(
              "flex min-w-0 flex-1 flex-col",
              !active && "hidden sm:flex",
            )}
          >
            {!active ? (
              <EmptyChatState />
            ) : (
              <>
                {/* Conversation header */}
                <div className="flex items-center gap-3 border-b border-border bg-background/30 px-4 py-3 backdrop-blur-sm">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0 rounded-full sm:hidden"
                    onClick={() => {
                      setActive(null);
                      setActiveId(null);
                    }}
                    aria-label="Back to conversations"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <div className="relative shrink-0">
                    <Avatar className="h-10 w-10 ring-2 ring-primary/30">
                      <AvatarImage src={active.profilePicture} alt={active.username} />
                      <AvatarFallback className="bg-primary/20 text-xs font-semibold text-primary">
                        {(active.username || "?").slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span
                      className={cn(
                        "absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-card",
                        active.isOnline ? "bg-emerald-500" : "bg-zinc-500",
                      )}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-semibold leading-tight">
                      {active.username}
                    </h3>
                    <p className="text-[11px] text-muted-foreground">
                      {active.isOnline ? "Active now" : "Offline"}
                    </p>
                  </div>
                </div>

                {/* Messages */}
                <div className="relative min-h-0 flex-1 overflow-y-auto">
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background/40 via-transparent to-background/30" />
                  <div className="relative space-y-3 px-4 py-5">
                    {chat.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="relative mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                          <Sparkles className="h-5 w-5" />
                          <span className="absolute -inset-1 -z-10 rounded-2xl bg-primary/15 blur-lg" />
                        </div>
                        <p className="text-sm font-medium">
                          Say hi to {active.username}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Start the conversation — your messages are private.
                        </p>
                      </div>
                    ) : (
                      chat.map((message) => {
                        const mine = message.sentBy._id === user._id;
                        return (
                          <div
                            key={message._id}
                            className={cn(
                              "flex animate-in fade-in-0 slide-in-from-bottom-1 duration-200",
                              mine ? "justify-end" : "justify-start",
                            )}
                          >
                            <div
                              className={cn(
                                "max-w-[75%] px-4 py-2 text-sm shadow-sm",
                                mine
                                  ? "rounded-2xl rounded-br-md bg-primary text-primary-foreground shadow-primary/20"
                                  : "rounded-2xl rounded-bl-md border border-border/60 bg-muted text-foreground",
                              )}
                            >
                              <p className="whitespace-pre-wrap break-words leading-relaxed">
                                {message.message}
                              </p>
                              {message.createdAt && (
                                <div
                                  className={cn(
                                    "mt-1 text-[10px]",
                                    mine
                                      ? "text-primary-foreground/70"
                                      : "text-muted-foreground",
                                  )}
                                >
                                  {message.createdAt}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={bottomRef}></div>
                  </div>
                </div>

                {/* Composer */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSend(draft);
                  }}
                  className="flex items-center gap-2 border-t border-border bg-background/40 p-3 backdrop-blur-sm"
                >
                  <Input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder={`Message ${active.username}...`}
                    className="h-10 rounded-full border-border/60 bg-muted/40 px-4 focus-visible:bg-muted/70 focus-visible:ring-primary/40"
                  />
                  <Button
                    type="submit"
                    size="icon"
                    disabled={!draft.trim()}
                    className="h-10 w-10 shrink-0 rounded-full shadow-md shadow-primary/30 transition-transform hover:scale-105 disabled:hover:scale-100"
                    aria-label="Send message"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

function EmptyChatState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
      <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <MessageSquare className="h-7 w-7" />
        <span className="absolute -inset-2 -z-10 rounded-3xl bg-primary/15 blur-xl" />
      </div>
      <h3 className="text-base font-semibold">Your messages</h3>
      <p className="max-w-sm text-sm text-muted-foreground">
        Select a conversation from the left to view messages, or invite someone
        from the People page to start a new one.
      </p>
    </div>
  );
}
