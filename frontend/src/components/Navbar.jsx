import { MessageSquare, User as UserIcon, LogOut, Plus } from "lucide-react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.jsx";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar.jsx";
import { Button } from "@/components/ui/button.jsx";
import { Input } from "@/components/ui/input.jsx";
import { AddQuestionDialog } from "@/components/AddQuestionDialog.jsx";
import { useUser } from "@/context/user.context.jsx";
import { useSocket } from "@/context/socket.context";

export function Navbar({ onOpenChat, setQuestionAdded, questionAdded }) {
  const [addQuestionOpen, setAddQuestionOpen] = useState(false);
  const [roomIdInput, setRoomIdInput] = useState("");
  const {user, setUser}= useUser()
  const navigate = useNavigate();
  const displayName = user?.fullName || "User";
  const username = user?.username || displayName;
  const avatarFallback = displayName.slice(0, 2).toUpperCase();
  const socket = useSocket();
  

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    socket.disconnect()
    console.log("socket disconnected");
    
    navigate("/auth");
  };

  const handleJoinRoomSubmit = (e) => {
    e.preventDefault();
    const roomId = roomIdInput.trim()
    if (!roomId) return

    socket.emit("join-room", {
      roomId,
      username,
      id: user?._id,
    })
    setRoomIdInput("")
    navigate(`/question/${questionId}?roomId=${encodeURIComponent(roomId)}`)
  }

  return (
    <header className="sticky top-0 z-30 w-full border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-4">
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <span className="hidden lg:inline text-2xl font-semibold">
            CodeArena
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <NavLinkItem to="/" exact label="Problems" />
          <NavLinkItem to="/people" label="People" />
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => setAddQuestionOpen(true)}
          >
            <Plus className="h-4 w-4" /> Add question
          </Button>

          <form onSubmit={handleJoinRoomSubmit} className="flex items-center gap-2">
            <Input
              value={roomIdInput}
              onChange={(e) => setRoomIdInput(e.target.value)}
              placeholder="Enter room ID"
              className="h-9 w-36 md:w-48"
              aria-label="Room ID"
            />
            <Button
              variant="outline"
              size="sm"
              type="submit"
              className="border-green-600 bg-green-600 text-white hover:border-green-700 hover:bg-green-700"
            >
              Join Room
            </Button>
          </form>

          <Button
            variant="ghost"
            size="icon"
            onClick={onOpenChat}
            aria-label="Open chats"
            className="rounded-full hover:bg-muted hover:text-primary"
          >
            <MessageSquare className="h-5 w-5" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 rounded-full ring-offset-background transition focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                <Avatar className="h-9 w-9 border border-border">
                  <AvatarImage src={user?.profilePicture || ""} alt={displayName} />
                  <AvatarFallback>{avatarFallback}</AvatarFallback>
                </Avatar>
                <span className="max-w-28 truncate text-sm font-medium text-foreground">{username}</span>

              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{displayName}</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/profile" className="flex cursor-pointer items-center gap-2">
                  <UserIcon className="h-4 w-4" /> View Profile
                </Link>
              </DropdownMenuItem>
              
              <DropdownMenuItem
                className="cursor-pointer text-destructive focus:text-destructive"
                onSelect={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" /> Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <AddQuestionDialog
        open={addQuestionOpen}
        onClose={() => setAddQuestionOpen(false)}
        onSubmit={()=> {setAddQuestionOpen(false),setQuestionAdded(!questionAdded)}}
      />
    </header>
  );
}

function NavLinkItem({ to, label, exact }) {
  return (
    <NavLink
      to={to}
      end={exact}
      className={({ isActive }) =>
        [
          "rounded-md px-3 py-1.5 text-sm transition",
          isActive
            ? "bg-muted text-foreground"
            : "text-muted-foreground hover:bg-muted hover:text-foreground",
        ].join(" ")
      }
    >
      {label}
    </NavLink>
  );
}
