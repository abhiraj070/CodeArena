import { useEffect, useState } from "react";
import { api } from "@/lib/api.js";
import { Search, Send, X, UserPlus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar.jsx";
import { Button } from "@/components/ui/button.jsx";
import { Input } from "@/components/ui/input.jsx";
import { Textarea } from "@/components/ui/textarea.jsx";
import { cn } from "@/lib/utils.js";

const PRESET = "Hi, I'd like to invite you to collaborate on a coding session.";

export function ArenaInvitePanel({ open, onClose, roomId, onSendInvite }) {
  const [search, setSearch] = useState("");
  const [foundUser, setFoundUser] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [searching, setSearching] = useState(false);
  const [message, setMessage] = useState(PRESET);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!open) {
      setSearch("");
      setFoundUser(null);
      setErrorMessage(null);
      setSearching(false);
      setSending(false);
      setMessage(PRESET);
    }
  }, [open]);

  if (!open) return null;

  const handleSearch = async (event) => {
    event.preventDefault();
    const query = search.trim();

    if (query === "") {
      setFoundUser(null);
      setErrorMessage(null);
      return;
    }

    setSearching(true);
    setErrorMessage(null);
    try {
      const res = await api.get(`/feature/v1/user/${query}`);
      setFoundUser(res.data.data.user);
    } catch (error) {
      const errMsg =
        error?.response?.data?.message ||
        error?.message ||
        "User not found.";
      setFoundUser(null);
      setErrorMessage(errMsg);
    } finally {
      setSearching(false);
    }
  };

  const handleSend = async () => {
    if (!foundUser || !message.trim()) return;
    setSending(true);
    try {
      await onSendInvite({
        receiver: foundUser,
        message: message.trim(),
        code: roomId,
      });
      onClose();
    } catch (error) {
      console.error("Failed to send arena invite", error);
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 px-4 py-12"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-xl border border-border bg-background shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 border-b border-border bg-muted/30 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/15 text-primary">
              <UserPlus className="h-4 w-4" />
            </span>
            <div>
              <h2 className="text-sm font-semibold">Invite to Arena</h2>
              <p className="text-[11px] text-muted-foreground">
                Search a user by username and send them this session code.
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Close invite panel"
            className="h-8 w-8 rounded-full"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-4 p-4">
          <form onSubmit={handleSearch}>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by username..."
                  className="h-10 rounded-full pl-9"
                  autoFocus
                />
              </div>
              <Button
                type="submit"
                size="sm"
                className="h-10 rounded-full px-4"
                disabled={searching}
              >
                {searching ? "Searching..." : "Search"}
              </Button>
            </div>
          </form>

          <div>
            {foundUser ? (
              <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/20 p-3">
                <div className="relative">
                  <Avatar className="h-11 w-11">
                    <AvatarImage
                      src={foundUser.profilePicture}
                      alt={foundUser.fullName}
                    />
                    <AvatarFallback>
                      {(foundUser.fullName || foundUser.username || "U").slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <span
                    className={cn(
                      "absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-background",
                      foundUser.isOnline ? "bg-emerald-500" : "bg-zinc-300",
                    )}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{foundUser.username}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {foundUser.fullName}
                  </p>
                </div>
              </div>
            ) : errorMessage ? (
              <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
                {errorMessage}
              </p>
            ) : (
              <p className="rounded-lg border border-dashed border-border px-3 py-3 text-center text-xs text-muted-foreground">
                Search a username to invite them to this arena.
              </p>
            )}
          </div>

          {foundUser && (
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                  Message
                </label>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                  Session code
                </label>
                <Input value={roomId || ""} readOnly className="bg-muted/30" />
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-border bg-muted/20 px-4 py-3">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            size="sm"
            className="gap-1.5"
            onClick={handleSend}
            disabled={!foundUser || !message.trim() || sending}
          >
            <Send className="h-4 w-4" />
            {sending ? "Sending..." : "Send invite"}
          </Button>
        </div>
      </div>
    </div>
  );
}
