import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar.jsx";
import { Input } from "@/components/ui/input.jsx";
import { Button } from "@/components/ui/button.jsx";
import { ArrowLeft, Send } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils.js";
import { useUser } from "@/context/user.context";
import axios from "axios";

export function ChatSidebar({
  activeId,
  setActiveId
}) {
  console.log("inside chatsidebar");
  
  const [draft, setDraft] = useState("");
  const [chat, setChat] = useState([]);
  const [chatingWith, setChattingWith] = useState([]);
  const [active, setActive]= useState(null)
  const {user}= useUser()

  useEffect(()=>{
    if(!activeId || !user?._id) return
    const fetchMessages= async()=>{
      console.log("userid:",user._id,"activeId:",activeId);
      
      const res= await axios.get(`feature/v1/message/getMessages/${user._id}/${activeId}`)
      setChat(res.data.data.messages || [])
      console.log("req:",res.data.data);
      
      setActive(res.data.data.personB)
    }
    fetchMessages()
  },[activeId, user?._id])

  useEffect(()=>{
    const fectchPeople=async ()=>{
      const res= await axios.get(`feature/v1/user/chatsWith/${user._id}`)
      console.log("people",res.data.data);
      
      setChattingWith(res.data.data.chatsWith)
    }
    fectchPeople()
  },[])


  return (
    <div className="fixed right-0 top-0 z-50 flex h-screen w-full sm:w-[320px] flex-col bg-background">
      {!active ? (
        <>
          <div className="border-b border-border p-4">
            <h2 className="text-lg font-semibold">Messages</h2>
          </div>
            <ul className="flex-1 overflow-y-auto">
              {chatingWith.map((people) => (
                <li key={people._id}>
                  <button
                    onClick={() => setActiveId(people._id)}
                    className="flex w-full items-center gap-3 border-b border-border px-4 py-3 text-left transition hover:bg-muted"
                  >
                    <div className="relative">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={people.profilePicture} alt={people.username} />
                        <AvatarFallback>{people.username.slice(0, 2)}</AvatarFallback>
                      </Avatar>
                      <span
                        className={cn(
                          "absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-background",
                          people.isOnline ? "bg-emerald-500" : "bg-zinc-300",
                        )}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{people.username}</p>
                      {/* <p className="truncate text-xs text-muted-foreground">{people.lastMessage}</p> */}
                    </div>
                    {/* {people.unread > 0 && (
                      <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-semibold text-primary-foreground">
                        {people.unread}
                      </span>
                    )} */}
                  </button>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <>
            <div className="flex-row items-center gap-2 space-y-0 border-b border-border p-3 flex">
              <Button variant="ghost" size="icon" onClick={() => setActive(null)}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Avatar className="h-8 w-8">
                <AvatarImage src={active.profilePicture} alt={active.username} />
                <AvatarFallback>{active.username.slice(0, 2)}</AvatarFallback>
              </Avatar>
              <h3 className="text-sm font-semibold">{active.username}</h3>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto bg-muted/30 p-4">
              {chat.map((message) => (
                <div
                  key={message._id}
                  className={cn("flex", message.sentBy._id === user._id ? "justify-end" : "justify-start")}
                >
                  <div
                    className={cn(
                      "max-w-[75%] rounded-2xl px-3.5 py-2 text-sm shadow-sm",
                      message.sentBy._id === user._id
                        ? "rounded-br-sm bg-primary text-primary-foreground"
                        : "rounded-bl-sm bg-card text-foreground",
                    )}
                  >
                    {message.message}
                    <div
                      className={cn(
                        "mt-1 text-[10px]",
                         message.sentBy._id === user._id ? "text-primary-foreground/70" : "text-muted-foreground",
                      )}
                    >
                      {message.createdAt || " "}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
              }}
              className="flex items-center gap-2 border-t border-border p-3"
            >
              <Input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Type a message..."
                className="rounded-full"
              />
              <Button type="submit" size="icon" className="rounded-full">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </>
        )}
      </div>
    );
  }
