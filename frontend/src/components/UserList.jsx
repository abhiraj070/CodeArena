import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar.jsx";
import { Button } from "@/components/ui/button.jsx";
import { Card } from "@/components/ui/card.jsx";
import { cn } from "@/lib/utils.js";

export function UserList({ users, onInvite, title = "Recently connected" }) {
  return (
    <Card className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold">{title}</h3>
        <span className="text-xs text-muted-foreground">{users.length}</span>
      </div>
      <ul className="flex flex-col gap-1">
        {users.map((u) => (
          <li
            key={u.id}
            className="flex items-center gap-3 rounded-lg p-2 transition hover:bg-muted"
          >
            <div className="relative">
              <Avatar className="h-9 w-9">
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
              <p className="truncate text-xs text-muted-foreground">
                {u.online ? "Online" : "Offline"}
                {u.role ? ` · ${u.role}` : ""}
              </p>
            </div>
            <Button size="sm" variant="outline" onClick={() => onInvite(u)}>
              Invite
            </Button>
          </li>
        ))}
      </ul>
    </Card>
  );
}
