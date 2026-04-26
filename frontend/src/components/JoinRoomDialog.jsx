import { Dialog, DialogContent } from "@/components/ui/dialog.jsx";
import { Input } from "@/components/ui/input.jsx";

export function JoinRoomDialog({ open, onOpenChange, roomId, onRoomIdChange, onEnter }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-8">
        <Input
          autoFocus
          value={roomId}
          onChange={(e) => onRoomIdChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key !== "Enter") return;
            e.preventDefault();
            onEnter();
          }}
          placeholder="Enter the roomId"
        />
      </DialogContent>
    </Dialog>
  );
}
