import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar.jsx";
import { Button } from "@/components/ui/button.jsx";
import { Card } from "@/components/ui/card.jsx";
import { cn } from "@/lib/utils.js";

export function UserList({ users, onInvite, title = "Recently connected" }) {
  //console.log("users",users);
  
  return (
    <Card className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold">{title}</h3>
        <span className="text-xs text-muted-foreground">{users.length}</span>
      </div>
      <ul className="flex flex-col gap-1">
        {users.map((user) => (
          <li
            key={user._id}
            className="flex items-center gap-3 rounded-lg p-2 transition hover:bg-muted"
          >
            <div className="relative">
              <Avatar className="h-9 w-9">
                <AvatarImage src={user.profilePicture} alt={user.fullName} />
                <AvatarFallback>{user.fullName.slice(0, 2)}</AvatarFallback>
              </Avatar>
              <span
                className={cn(
                  "absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-card",
                  user.online ? "bg-emerald-500" : "bg-zinc-300",
                )}
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <p className="truncate text-sm font-semibold leading-5 text-white">{user.fullName}</p>
               
              </div>
              <p className="truncate text-xs text-muted-foreground mt-1">@{(user.username || "").split(" ").slice(-1)[0]}</p>
            </div>
            <Button size="sm" variant="outline" onClick={() => onInvite(user)}>
              Invite
            </Button>
          </li>
        ))}
      </ul>
    </Card>
  );
}
