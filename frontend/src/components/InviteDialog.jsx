import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog.jsx";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar.jsx";
import { Button } from "@/components/ui/button.jsx";
import { Input } from "@/components/ui/input.jsx";
import { Textarea } from "@/components/ui/textarea.jsx";
import { Send } from "lucide-react";
import { useEffect, useState } from "react";

const PRESET = "Hi, I'd like to invite you to collaborate on a coding session.";

export function InviteDialog({ user, open, onClose, onSendInvite }) {
  const [message, setMessage] = useState(PRESET);
  const [code, setCode] = useState("");

  useEffect(() => {
    if (open) {
      setMessage(PRESET);
      setCode("");
    }
  }, [open, user?.id]);

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite to session</DialogTitle>
        </DialogHeader>
        <div className="flex items-center gap-3 rounded-lg border border-border p-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback>{user.name.slice(0, 2)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium">{user.name}</p>
            <p className="text-xs text-muted-foreground">
              {user.online ? "Online now" : "Offline"}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Message</label>
            <Textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={3} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">
              Session code
            </label>
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Paste session code"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            className="gap-1.5"
            onClick={() =>
              onSendInvite?.({
                user,
                message: message.trim(),
                code: code.trim(),
              })
            }
            disabled={!message.trim()}
          >
            <Send className="h-4 w-4" /> Send invite
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
