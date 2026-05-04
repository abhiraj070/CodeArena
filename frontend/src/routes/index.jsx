import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar.jsx";
import { QuestionContainer } from "@/components/QuestionContainer.jsx";
import { UserList } from "@/components/UserList.jsx";
import { InviteDialog } from "@/components/InviteDialog.jsx";
import { ChatSidebar } from "@/components/ChatSidebar.jsx";
import { useSocket } from "@/context/socket.context";
import { useUser } from "@/context/user.context";
import axios from "axios";

export default function IndexPage({code}) {
  const [inviteUser, setInviteUser] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [questionAdded, setQuestionAdded]= useState(false)
  const [connectedUsers, setConnectedUsers]= useState([])
  const [activeId, setActiveId]= useState(null)
  const socket = useSocket();
  const {user}= useUser()


  // SOCKET
    useEffect(()=>{
      if(!socket) return
      socket.on("connect",()=>{
        console.log("socket connected from the client side");
      })
      return ()=> socket.off("connect")
    },[socket])



    useEffect(()=>{
      if(!user) return
      console.log("userid",user._id);

      const featchConnectedUsers= async()=>{
        const res= await axios.get(`/feature/v1/user/recentlyConnected/${user._id}`)
        setConnectedUsers(res.data.data.recentlyConnected)
      }
      featchConnectedUsers()

    },[user])


  const handleSendInvite = async({ message, code }) => {
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
  };

  const handleInviteUser = (selectedUser) => {
    setInviteUser(selectedUser);
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
          <UserList users={connectedUsers} onInvite={handleInviteUser} />
        </aside>
      </main>

      {inviteUser&&<InviteDialog
        user={inviteUser}
        onClose={() => setInviteUser(null)}
        onSendInvite={handleSendInvite}
      />}
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
