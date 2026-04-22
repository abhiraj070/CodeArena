import { MessageSquare, Users, User as UserIcon, LogOut, Settings, Plus } from "lucide-react";
import { Link, NavLink } from "react-router-dom";
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
import { currentUser } from "@/lib/mock-data.js";
import { AddQuestionDialog } from "@/components/AddQuestionDialog.jsx";

export function Navbar({ onOpenChat, setQuestionAdded, questionAdded }) {
  const [addQuestionOpen, setAddQuestionOpen] = useState(false);

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
              <button className="rounded-full ring-offset-background transition focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                <Avatar className="h-9 w-9 border border-border">
                  <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                  <AvatarFallback>AM</AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{currentUser.name}</span>
                  <span className="text-xs text-muted-foreground">{currentUser.handle}</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/profile" className="flex items-center gap-2">
                  <UserIcon className="h-4 w-4" /> View Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/people" className="flex items-center gap-2">
                  <Users className="h-4 w-4" /> People
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" /> Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive focus:text-destructive">
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
