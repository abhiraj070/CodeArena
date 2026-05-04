import { useState } from "react";
import { Navbar } from "@/components/Navbar.jsx";
import { ChatSidebar } from "@/components/ChatSidebar.jsx";
import { InviteDialog } from "@/components/InviteDialog.jsx";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar.jsx";
import { Button } from "@/components/ui/button.jsx";
import { Card } from "@/components/ui/card.jsx";
import { Input } from "@/components/ui/input.jsx";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils.js";
import { useUser } from "@/context/user.context";
import { useSocket } from "@/context/socket.context";
import axios from "axios";

export default function PeoplePage() {
  const [search, setSearch] = useState("");
  const [inviteUser, setInviteUser] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [searchedUser, setSearchedUser] = useState(null);
  const [errorMessage, setErrorMessage]= useState(null)
  const [activeId, setActiveId]= useState(null)
  const {user}= useUser()
  const socket= useSocket()

  const handleSearch =async (e) => {
    e.preventDefault();
    const query = search.trim();

    if(query === ""){
      setSearchedUser(null);
      setActiveId(null)
      setErrorMessage(null)
      return
    }

    try {
      const res= await axios.get(`/feature/v1/user/${query}`)
      setSearchedUser(res.data.data.user)
      setActiveId(res.data.data.user._id)
      setErrorMessage(null)
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to add question";
        setSearchedUser(null)
        setActiveId(null)
        setErrorMessage(message)
    }
  };

  const handleSendInvite = async ({message, code }) => {
    if (!user || !message || !inviteUser) return;
    const text = code ? `${message} Session code: ${code}` : message;
    //console.log("user:", user._id, "receiver:", inviteUser._id);

    await axios.post("/feature/v1/message/sendMessage", {
      message: text,
      personA: user._id,
      personB: inviteUser._id,
    })
    console.log("message req sent");
    socket.emit("in-chat-message",{message: text, receiver_id: inviteUser._id, senderId: user._id})
    setChatOpen(true);
    setActiveId(inviteUser._id)
    setInviteUser(null);
    setOpenInviteBox(false)
  };

  const handleInvite = (user) => {
    setInviteUser(user);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar onOpenChat={() => setChatOpen(true)} />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="text-2xl font-semibold tracking-tight">Find people</h1>
        <p className="mb-6 text-sm text-muted-foreground">
          Search developers and invite them to a coding session.
        </p>

        <form onSubmit={handleSearch} className="mb-6 max-w-md">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by username..."
                className="h-10 rounded-full pl-9"
              />
            </div>
            <Button type="submit" size="sm" className="h-10 rounded-full px-4">
              Search
            </Button>
          </div>
        </form>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {searchedUser ? (
            <Card className="flex items-center gap-3 p-4">
              <div className="relative">
                <Avatar className="h-11 w-11">
                  <AvatarImage src={searchedUser.profilePicture} alt={searchedUser.fullName} />
                  <AvatarFallback>{searchedUser.fullName.slice(0, 2)}</AvatarFallback>
                </Avatar>
                <span
                  className={cn(
                    "absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-card",
                    searchedUser.isOnline ? "bg-emerald-500" : "bg-zinc-300",
                  )}
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{searchedUser.username}</p>
                <p className="truncate text-xs text-muted-foreground">{searchedUser.fullName}</p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleInvite(searchedUser)}
              >
                Invite
              </Button>
            </Card>
          ) : (
            errorMessage? <p className="text-sm text-muted-foreground">{errorMessage}</p> :<p className="text-sm text-muted-foreground">Search for a user to display them here.</p>
          )}
        </div>
        
      </main>

      {inviteUser && (
        <InviteDialog
          user={inviteUser}
          onClose={() => setInviteUser(null)}
          onSendInvite={handleSendInvite}
        />
      )}
      {chatOpen&&<ChatSidebar
        activeId={activeId}
        setActiveId={setActiveId}
        onClose={() => {
          setChatOpen(false);
          setActiveId(null);
        }}
      />}
      
    </div>
  );
}
