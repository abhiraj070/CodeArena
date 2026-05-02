import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar.jsx";
import { QuestionContainer } from "@/components/QuestionContainer.jsx";
import { UserList } from "@/components/UserList.jsx";
import { InviteDialog } from "@/components/InviteDialog.jsx";
import { ChatSidebar } from "@/components/ChatSidebar.jsx";
import { conversations as initialConversations } from "@/lib/code-template.js";
import { useSocket } from "@/context/socket.context";
import { useUser } from "@/context/user.context";
import axios from "axios";

export default function IndexPage({code}) {
  const [inviteUser, setInviteUser] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [conversations, setConversations] = useState(initialConversations);
  const [activeChatId, setActiveChatId] = useState(null);
  const [questionAdded, setQuestionAdded]= useState(false)
  const [connectedUsers, setConnectedUsers]= useState([])
  const socket = useSocket();
  const {user}= useUser()


  // SOCKET
    useEffect(()=>{

      socket.on("connect",()=>{
        console.log("socket connected from the client side");
      })
      return ()=> socket.off("connect")
    },[socket])



    useEffect(()=>{
      if(!user) return
      console.log("userid",user._id);
      
      if(socket.connected){ // shifter register emit here because: kyuki login ke baad socket.connect hone me time lag rha tha, aur jab tak vo connect ho rha tha tab tak component unmount ho ja rha tha toh listner bhi har ja rha tha.
          socket.emit("register",{userId:user._id})
        }
      else{
        socket.once("connect",()=>{
          console.log("now register starts");
          
          socket.emit("register",{userId:user._id})
        })
      }

      const featchConnectedUsers= async()=>{
        const res= await axios.get(`/feature/v1/user/recentlyConnected/${user._id}`)
        setConnectedUsers(res.data.data.recentlyConnected)
      }
      featchConnectedUsers()

    },[])


  const handleSendInvite = async({ message, code }) => {
    if (!user || !message || !inviteUser) return;
    const text = code ? `${message} Session code: ${code}` : message;
    console.log("user:", user._id, "receiver:", inviteUser._id);

    axios.post("/feature/v1/message/sendMessage", {
      message: text,
      PersonA: user._id,
      PersonB: inviteUser._id,
    })
    console.log("message req sent");
    
    
    const timestamp = Date.now()
    let targetId = null;

    setConversations((prev) => {
      const existing = prev.find((c) => c.user.id === user.id);
      if (existing) {
        targetId = existing.id;
        return prev.map((c) =>
          c.id === existing.id
            ? {
                ...c,
                lastMessage: text,
                unread: 0,
                messages: [
                  ...c.messages,
                  { id: `m${timestamp}`, from: "me", text, time: "now" },
                ],
              }
            : c,
        );
      }

      const newConversation = {
        id: `c${timestamp}`,
        user,
        lastMessage: text,
        unread: 0,
        messages: [{ id: `m${timestamp}`, from: "me", text, time: "now" }],
      };

      targetId = newConversation.id;

      return [newConversation, ...prev];
    });

    if (targetId) setActiveChatId(targetId);
    setChatOpen(true);
    setInviteUser(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar onOpenChat={() => setChatOpen(true)} 
        setQuestionAdded={setQuestionAdded}
        questionAdded={questionAdded}
        />

      <main className="mx-auto grid max-w-7xl grid-cols-1 gap-5 px-4 py-5 lg:grid-cols-[1fr_320px]">
        <QuestionContainer questionAdded={questionAdded} code={code}/>
        <aside className="space-y-4">
          <UserList users={connectedUsers} onInvite={setInviteUser} />
        </aside>
      </main>

      <InviteDialog
        user={inviteUser}
        open={!!inviteUser}
        onSendInvite={handleSendInvite}
      />
      {chatOpen&&<ChatSidebar
        conversations={conversations}
        onConversationsChange={setConversations}
        activeId={activeChatId}
        onActiveChange={setActiveChatId}
      />}
    </div>
  );
}
