
//Whole flow for the code sync
// User types in the editor. Monaco updates its model.
// MonacoBinding writes the change into yText (inside ydoc).
// ydoc emits an "update" event with origin undefined (local).
// handleLocalUpdate checks origin and emits socket.emit("yjs-update", { update, roomId, fullText }).
// Server broadcasts to other socket(s) in the room.
// The other client receives "yjs-update-receive" → handleRemoteUpdate.
// handleRemoteUpdate normalizes the payload and runs Y.applyUpdate(ydoc,

import { Link, useSearchParams, useParams, useLocation } from "react-router-dom";
import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import Editor from "@monaco-editor/react";
import { Button } from "@/components/ui/button.jsx";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar.jsx";
import { Input } from "@/components/ui/input.jsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.jsx";
import { DifficultyBadge } from "@/components/DifficultyBadge.jsx";
import { ArenaInvitePanel } from "@/components/ArenaInvitePanel.jsx";
import { STARTER_CODE, LANGUAGES } from "@/lib/code-template.js";
import { ArrowLeft, Check, Code2, Copy, MessageSquare, Play, Send, UserPlus, X } from "lucide-react";
import axios from "axios";
import { useUser } from "@/context/user.context.jsx"; 
import { MonacoBinding } from "y-monaco"; //binds yjs and monaco
import * as Y from "yjs";
//import { WebsocketProvider } from "y-websocket"; // it helps sync our yjs document over websocket, automatically(without us writing socket.on() etc). it basiclly connects our yjs docs to the websocket server and handles sending and reciving automatically.
import { createYjsDoc } from "@/Yjs/yjs.jsx";
import { useSocket } from "@/context/socket.context.jsx";
import { cn } from "@/lib/utils.js";

function normalizeYjsUpdate(update) {
  if (update instanceof Uint8Array) {
    return update
  }

  if (update instanceof ArrayBuffer) {
    return new Uint8Array(update)
  }

  if (Array.isArray(update)) {
    return Uint8Array.from(update)
  }

  if (update?.type === "Buffer" && Array.isArray(update.data)) {
    return Uint8Array.from(update.data)
  }

  return null
}


export default function QuestionPage() {

  const [question, setQuestion] = useState(null)
  const { id } = useParams();
  const [language, setLanguage] = useState("cpp");
  const [searchParams]= useSearchParams()
  const rawRoomId = searchParams.get("roomId")
  const roomId = rawRoomId && rawRoomId !== "null" && rawRoomId !== "undefined" ? rawRoomId : null
  const {user}= useUser()
  const socket = useSocket()
  const [code, setCode] = useState("");
  const [copied, setCopied] = useState(false)
  const ydocRef= useRef(null)
  const bindingRef= useRef(null)
  const copyTimeoutRef= useRef(null)
  const hydrationRef = useRef(true)
  const location =useLocation()
  const consoleHeightRef = useRef(140)
  const sectionRef = useRef(null)
  const [consoleHeight, setConsoleHeight] = useState(140)
  const [consoleLoading, setConsoleLoading] = useState(false)
  const [inviteOpen, setInviteOpen] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)
  const [chatDraft, setChatDraft] = useState("")
  const [roomMessages, setRoomMessages] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [roomProfiles, setRoomProfiles] = useState({})
  const chatBottomRef = useRef(null)

  const alreadyJoined = location.state?.alreadyJoined ?? false
  useEffect(()=>{
    setLanguage(user.language)
  },[])

  const onLanguageChange = (val) => {
    setLanguage(val);
    hydrationRef.current= true
    //console.log(99);
    setCode(STARTER_CODE[val]);
  };

  //console.log(id)
  
  useEffect(() => {
    if(alreadyJoined) return
    if (!socket || !roomId || !user?._id) return

    const joinRoom = () => {
      socket.emit("join-room", { roomId, username: user.username, id: user._id })
    }

    if (!socket.connected) {
      socket.connect()
    }

    if (socket.connected) {
      joinRoom()
    }

    socket.on("connect", joinRoom)

    return () => {
      socket.off("connect", joinRoom)
    }
  }, [socket, roomId, user?._id, user?.username])



  
  // YJS

  if(!ydocRef.current){ //ydocRef pura yjs document hai jisme 2 chize hoti hai ydoc and ytext. ydoc is unique per user.
    const {ydoc, yText}=createYjsDoc()
    ydocRef.current= {ydoc,yText}
  }

  useEffect(()=>{
    const fetchQuestion=async ()=>{
      try {

        if (!roomId && id) {
          const res = await axios.get(`/feature/v1/question/getAQuestion/${id}`)
          setQuestion(res.data.data)
          setCode(STARTER_CODE[language])
          return
        }

        if(!question && roomId){
          const res= await axios.get(`/feature/v1/question/startQuesByRoomAndId/${roomId}`)
          //console.log("got question from roomid");
          //console.log("ques:",res.data.data.question);
          setQuestion( res.data.data.question)
          setCode(STARTER_CODE[language])
          return
        }

        if (id && roomId) {
          //console.log("19 — treating id as valid", id);
          console.log("roomid:",roomId,"id:",id);
          
          const res= await axios.get(`/feature/v1/question/startQues/${id}/${roomId}`)
          setQuestion( res.data.data.question)
          console.log("ques:",res.data.data.question);
          hydrationRef.current = true
          setCode(STARTER_CODE[language])
          return
        }

        
        console.log("code sync and question featch start");
        
        hydrationRef.current = true
        console.log("code synced");
        
      } catch (error) {
        console.error("error while fetching question",error);
        
      }
    }
    fetchQuestion()
  },[id, roomId])

  
  const ydoc= useMemo(()=>ydocRef.current.ydoc,[])

  const yText= useMemo(()=>ydocRef.current.yText,[]) 

  useEffect(() => {
    if (!roomId) return
    const handleUpdate = (update) => {
      const normalizedUpdate = normalizeYjsUpdate(update)

      if (!normalizedUpdate || normalizedUpdate.length === 0) {
        console.warn("Ignoring invalid Yjs update payload", update)
        return
      }

      try {
        Y.applyUpdate(ydoc, normalizedUpdate, "remote")
      } catch (error) {
        console.error("Failed to apply remote Yjs update", error, update)
      }
    }

    const handleInit = (payload) => {
      const normalizedInit = normalizeYjsUpdate(payload)
      if (!normalizedInit || normalizedInit.length === 0) return
      try {
        Y.applyUpdate(ydoc, normalizedInit, "remote")
      } catch (error) {
        console.error("Failed to apply yjs-init", error)
      }
    }

    socket.on("yjs-update-receive", handleUpdate)
    socket.on("yjs-init", handleInit)

    socket.emit("request-yjs-state", { roomId })

    return () => {
      socket.off("yjs-update-receive", handleUpdate)
      socket.off("yjs-init", handleInit)
    }
  }, [roomId, socket, ydoc])


  useEffect(() => {
    if (!roomId) return
    const handleLocalUpdate = (update, origin) => { //yjs gives a origin string which tells whether the change is local or from other user(remote). so if the change is fomrother user do not emit it back.
      if (origin === "remote" || origin === "hydrate") return
      socket.emit("yjs-update", { update, roomId, fullText: yText.toString() })
    }
    //the origin thing is done because suppose form user B yjs/ydoc emits a update change and user A recives it and then applychanges, so technically yjs is updated again and can emit update again but using origin this could be stoped
    ydoc.on("update", handleLocalUpdate)
    return () => {
      ydoc.off("update", handleLocalUpdate)
    }
  }, [roomId, socket, ydoc])

  useEffect(() => {
    if (code === undefined || code === null) return
    if (code === "" && !hydrationRef.current) return
    if (roomId) return // server is the single source of truth for yText in collaborative rooms

    const isHydrating = hydrationRef.current

    const applyCode = () => { //.transact helps many changes in the y.text to wrap in one and send. this helps in many things including network traffic
      if (yText.length > 0) {
        yText.delete(0, yText.length)
      }
      yText.insert(0, code)
    }

    if (isHydrating) {
      ydoc.transact(applyCode, "hydrate")
      hydrationRef.current = false
    } else {
      ydoc.transact(applyCode)
    }
  }, [code, ydoc, yText, roomId])

  const handleEditorDidMount= (editor)=>{
    bindingRef.current = new MonacoBinding( 
      yText,
      editor.getModel(),
      new Set([editor]),
      null
    );
  }

  useEffect(() => {
    return () => {
      bindingRef.current?.destroy()
      if (copyTimeoutRef.current) {
        window.clearTimeout(copyTimeoutRef.current)
      }
    }
  }, [])


  // useEffect(()=>{
  //   if(!roomId || !ydocRef.current) return

  //     const provider= new WebsocketProvider(// this provider will act as the mediator between the yjs and the websocket server
  //       import.meta.env.VITE_WEBSOCKET_URL,
  //       roomId,
  //       ydocRef.current.ydoc
  //     )

  //     providerRef.current= provider    
  //     return ()=>{
  //       provider.destroy()
  //     }
  // },[roomId, ydocRef.current])

  //flow
  //   Editor → yText → ydoc
  //       ↓
  //   WebsocketProvider
  //         ↓
  //   WebSocket server
  //         ↓
  //   Other clients




  //COPY

  const handleCopyArenaId = async () => {
    if (!roomId) return

    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(roomId)
      } else {
        const textarea = document.createElement("textarea")
        textarea.value = roomId
        textarea.setAttribute("readonly", "")
        textarea.style.position = "absolute"
        textarea.style.left = "-9999px"
        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand("copy")
        textarea.remove()
      }

      setCopied(true)
      if (copyTimeoutRef.current) {
        window.clearTimeout(copyTimeoutRef.current)
      }
      copyTimeoutRef.current = window.setTimeout(() => setCopied(false), 1600)
    } catch (error) {
      console.error("Failed to copy arena ID", error)
    }
  }



  useEffect(()=>{
    if(!roomId) return
    socket.on("Get-chat-receive",({message, user})=>{
      const entry = {
        id: crypto.randomUUID(),
        message,
        sender: user,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }
      setRoomMessages(entry)
    })
  },[])



  const handleArenaLeave=()=>{
    socket.emit("leave-room",{roomId, id: user._id})
  }

  const handleArenaInvite = async ({ receiver, message, code }) => {
    if (!user || !receiver || !message) return
    const text = code ? `${message} Session code: ${code}` : message
    try {
      await axios.post("/feature/v1/message/sendMessage", {
        message: text,
        personA: user._id,
        personB: receiver._id,
      })
      socket.emit("in-chat-message", {
        message: text,
        receiver_id: receiver._id,
        senderId: user._id,
      })
    } catch (error) {
      console.error("Failed to send arena invite", error)
      throw error
    }
  }

  useEffect(()=>{
    socket.on("code-result",({result})=>{
      console.log(result);
      
    })
  },[])


  useEffect(() => {
    if (!user?.username) return
    setRoomProfiles((prev) => {
      if (prev[user.username]) return prev
      return {
        ...prev,
        [user.username]: {
          username: user.username,
          fullName: user.fullName,
          profilePicture: user.profilePicture,
        },
      }
    })
  }, [user?.username, user?.fullName, user?.profilePicture])

  useEffect(() => {
    if (!socket || !roomId) return

    const handleRoomMessage = async ({ message, user }) => {
      if (!message) return

      const entry = {
        id: crypto.randomUUID(),
        message,
        sender: user,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }


      setRoomMessages((prev) => [...prev, entry])
      if (!chatOpen) {
        setUnreadCount((prev) => prev + 1)
      }
    }

    socket.on("in-meeting-message-receive", handleRoomMessage)

    return () => {
      socket.off("in-meeting-message-receive", handleRoomMessage)
    }
  }, [socket, roomId, user?.username, chatOpen])

  useEffect(() => {
    if (!chatOpen) return
    setUnreadCount(0)
  }, [chatOpen])

  useEffect(() => {
    if (!chatOpen) return
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [roomMessages, chatOpen])

  useEffect(() => {
    setRoomMessages([])
    setUnreadCount(0)
  }, [roomId])

  const handleRoomSend = async () => {
    const trimmed = chatDraft.trim()
    if (!trimmed || !roomId || !user?.username || !socket) return

    const entry = {
      id: crypto.randomUUID(),
      message: trimmed,
      sender: user,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      self: true,
    }

    setRoomMessages((prev) => [...prev, entry])
    setChatDraft("")
    console.log("message emited");
    
    socket.emit("in-meeting-message", { roomId, user: user, message: trimmed })
  }

  const handleRunCode= async()=>{
    setConsoleLoading(true)
    try {
      console.log("sending code for test");
      
      await axios.post(`/codeRun/v1/codeRunner/run/${id}?type=Run`, {
        language,
        code: yText.toString(),
        roomId
      })
    } catch (error) {
      console.error("Run failed", error)
    } finally {
      setConsoleLoading(false)
    }
  }

  

   

  if (!question) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Loading question...</p>
      </div>
    )
  }

  const handleConsoleResizeStart = (event) => {
    event.preventDefault()
    const startY = event.clientY
    const startHeight = consoleHeightRef.current
    const maxHeight = Math.floor((sectionRef.current?.clientHeight ?? 0) * 0.45) || 360

    const handleMove = (moveEvent) => {
      const delta = startY - moveEvent.clientY
      const nextHeight = Math.max(110, Math.min(startHeight + delta, maxHeight))
      consoleHeightRef.current = nextHeight
      setConsoleHeight(nextHeight)
    }

    const handleUp = () => {
      document.removeEventListener("mousemove", handleMove)
      document.removeEventListener("mouseup", handleUp)
    }

    document.addEventListener("mousemove", handleMove)
    document.addEventListener("mouseup", handleUp)
  }

  const handleChatOpen= async()=>{
    setChatOpen((prev) => !prev)
    console.log("chat opened now fetching messages");
    socket.emit("Get-Chats",{roomId});
  }  

  return (
    <div className="flex h-screen flex-col bg-background">
      <header className="flex h-14 items-center justify-between border-b border-border bg-background/85 px-4 backdrop-blur">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition hover:bg-muted hover:text-foreground"
            aria-label="Back to problems"
          >
            <ArrowLeft className="h-4 w-4" onClick={handleArenaLeave}/>
          </Link>
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Code2 className="h-4 w-4" />
          </span>
          <h1 className="text-sm font-semibold sm:text-base">{question.title}</h1>
          <DifficultyBadge difficulty={question.difficulty} />
        </div>
        {roomId && (
          <div className="flex items-center gap-2">
            <div className="flex h-8 items-center overflow-hidden rounded-md border border-primary/40 bg-primary/10">
              <span className="px-3 text-xs font-medium text-primary/80 sm:text-sm">
                Arena ID
              </span>
              <span className="border-l border-primary/30 px-3 font-mono text-xs font-semibold tracking-wider text-primary sm:text-sm">
                {roomId}
              </span>
              <button
                type="button"
                onClick={handleCopyArenaId}
                aria-label={copied ? "Copied" : "Copy arena ID"}
                title={copied ? "Copied" : "Copy arena ID"}
                className="flex h-full w-8 items-center justify-center border-l border-primary/30 text-primary/70 transition hover:bg-primary/15 hover:text-primary"
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={handleChatOpen}
              className="relative h-8 gap-1.5 border-border/60 bg-background/40 hover:border-primary/60 hover:bg-primary/10 hover:text-primary"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              Chat
              {unreadCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-semibold text-primary-foreground shadow-sm">
                  {unreadCount}
                </span>
              )}
            </Button>
            <Button
              size="sm"
              onClick={() => setInviteOpen(true)}
              className="h-8 gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <UserPlus className="h-3.5 w-3.5" />
              Invite
            </Button>
          </div>
        )}
      </header>

      <ArenaInvitePanel
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        roomId={roomId}
        onSendInvite={handleArenaInvite}
      />

      <div className="grid flex-1 grid-cols-1 overflow-hidden md:grid-cols-2">
        <section ref={sectionRef} className="relative overflow-hidden border-b border-border p-0 md:border-b-0 md:border-r">
          <div className="h-full overflow-y-auto p-6">
            <div className="mb-3 flex items-center gap-2">
            <h2 className="text-lg font-semibold">{question.title}</h2>
            </div>

            <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Description
            </h3>
            <p className="mb-5 text-sm leading-relaxed text-foreground/90">{question.description}</p>

            {question.visibleTestCases && (
              <>
                <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Example
                </h3>
                {question.visibleTestCases.map((tc, index) => (
                  <pre
                    key={tc._id ?? `${tc.input}-${tc.output}-${index}`}
                    className="mb-2 overflow-x-auto rounded-lg border border-border bg-muted/40 p-3 text-xs text-foreground"
                  >
                    <span className="text-muted-foreground">Input:  </span>
                    {tc.input}
                    {"\n"}
                    <span className="text-muted-foreground">Output: </span>
                    <span className="text-primary">{tc.output}</span>
                  </pre>
                ))}

              </>
            )}

            <h3 className="mb-1.5 mt-5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Constraints
            </h3>
            <ul className="list-inside list-disc space-y-1 text-sm text-foreground/80">
              <li>1 ≤ n ≤ 10⁵</li>
              <li>−10⁹ ≤ values ≤ 10⁹</li>
              <li>Solution must run within the time limit</li>
            </ul>
          </div>

          <div className="absolute bottom-0 left-0 right-0 border-t border-border bg-muted/40 text-xs text-muted-foreground shadow-[0_-8px_24px_-16px_rgba(0,0,0,0.4)]">
            <div className="relative flex items-center justify-between px-4 py-2">
              <button
                type="button"
                aria-label="Resize console"
                onMouseDown={handleConsoleResizeStart}
                className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 cursor-row-resize rounded-full border border-border/70 bg-background/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/80 shadow-sm"
              >
                Drag
              </button>
              <span className="text-primary">●</span>
              <span className="text-xs text-muted-foreground">Console output</span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70">Resize up</span>
            </div>
            <div
              style={{ height: consoleHeight }}
              className="overflow-auto border-t border-border/60 bg-background/80 px-4 py-3 font-mono text-[11px] leading-5 text-foreground/80"
            >
              {consoleLoading ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span className="h-3 w-3 animate-spin rounded-full border-2 border-primary/40 border-t-primary" />
                  Running...
                </div>
              ) : (
                "Console output will appear here."
              )}
            </div>
          </div>
        </section>

        <section className="flex flex-col overflow-hidden bg-[oklch(0.13_0_0)]">
          <div className="flex items-center justify-between border-b border-border/60 bg-[oklch(0.18_0_0)] px-3 py-2">
            <Select value={language} onValueChange={onLanguageChange}>
              <SelectTrigger className="h-8 w-40 border-border/60 bg-background/40 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((l) => (
                  <SelectItem key={l.value} value={l.value}>
                    {l.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1">
            <Editor
              height="100%"
              width="100%"
              language={language}
              theme="vs-dark"
              path="main"
              options={editorOptions}
              onMount={handleEditorDidMount}
            />
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-border/60 bg-[oklch(0.18_0_0)] px-3 py-2.5">
            <Button
              size="sm"
              variant="outline"
              className="h-8 gap-1.5 border-border/60 bg-transparent hover:border-primary/60 hover:bg-primary/10 hover:text-primary"
              onClick={handleRunCode}
            >
              <Play className="h-3.5 w-3.5" /> Run
            </Button>
            <Button
              size="sm"
              className="h-8 gap-1.5 bg-primary text-primary-foreground shadow-[0_0_0_1px_oklch(0.74_0.18_150/0.4)] hover:bg-primary/90"
            >
              <Send className="h-3.5 w-3.5" /> Submit
            </Button>
          </div>
        </section>
      </div>

      {roomId && (
        <div
          className={cn(
            "fixed bottom-4 right-4 z-40 w-[min(360px,calc(100%-2rem))] overflow-hidden rounded-2xl border border-border/70 bg-card/95 shadow-2xl shadow-black/40 backdrop-blur transition-all duration-200",
            chatOpen ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0",
          )}
          role="dialog"
          aria-modal="false"
          aria-label="Room chat"
        >
          <div className="relative flex items-center justify-between border-b border-border bg-background/50 px-4 py-3">
            <div>
              <h3 className="text-sm font-semibold">Room chat</h3>
              <p className="text-[11px] text-muted-foreground">Messages are visible to everyone in the arena.</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={() => setChatOpen(false)}
              aria-label="Close chat"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          

          <div className="max-h-[55vh] min-h-[240px] overflow-y-auto px-4 py-4">
            {roomMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <p className="text-sm font-medium">Start the room conversation</p>
                <p className="text-xs text-muted-foreground">Share hints or ask for help while you code.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {roomMessages.map((item) => {
                  const mine = item.sender?.username === user?.username || item.self
                  const displayName = item.sender?.fullName || item.sender?.username || "Unknown"
                  const initials = (displayName || "?").slice(0, 2).toUpperCase()

                  return (
                    <div
                      key={item.id}
                      className={cn(
                        "flex gap-3",
                        mine ? "flex-row-reverse" : "flex-row",
                      )}
                    >
                      <Avatar className="h-9 w-9 ring-2 ring-background">
                        <AvatarImage src={item.sender?.profilePicture || ""} alt={displayName} />
                        <AvatarFallback className="bg-primary/20 text-xs font-semibold text-primary">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className={cn("max-w-[70%] w-fit space-y-1", mine && "text-right")}> 
                        <div className={cn("text-[11px] text-muted-foreground", mine && "text-primary/80")}>
                          {displayName}
                          {item.time ? ` • ${item.time}` : ""}
                        </div>
                        <div
                          className={cn(
                            "w-fit rounded-2xl px-4 py-2 text-sm shadow-sm",
                            mine
                              ? "rounded-br-md bg-primary text-primary-foreground shadow-primary/20"
                              : "rounded-bl-md border border-border/60 bg-muted text-foreground",
                          )}
                        >
                          <p className="whitespace-pre-wrap break-words leading-relaxed">{item.message}</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
                <div ref={chatBottomRef} />
              </div>
            )}
          </div>

          <form
            onSubmit={(event) => {
              event.preventDefault()
              handleRoomSend()
            }}
            className="flex items-center gap-2 border-t border-border bg-background/60 px-4 py-3"
          >
            <Input
              value={chatDraft}
              onChange={(event) => setChatDraft(event.target.value)}
              placeholder="Send a message to the room"
              className="h-10 rounded-full border-border/60 bg-muted/40 px-4 focus-visible:bg-muted/70 focus-visible:ring-primary/40"
            />
            <Button
              type="submit"
              size="icon"
              className="h-10 w-10 shrink-0 rounded-full shadow-md shadow-primary/30 transition-transform hover:scale-105 disabled:hover:scale-100"
              disabled={!chatDraft.trim()}
              aria-label="Send message"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}

function extFor(lang) {
  switch (lang) {
    case "javascript":
      return "js";
    case "typescript":
      return "ts";
    case "python":
      return "py";
    case "cpp":
      return "cpp";
    case "java":
      return "java";
  }
}

const editorOptions = {
  fontSize: 13,
  lineHeight: 22,
  minimap: { enabled: false },
  scrollBeyondLastLine: false,
  scrollbar: {
    verticalScrollbarSize: 8,
    horizontalScrollbarSize: 8,
  },
  wordWrap: "off",
  tabSize: 2,
  automaticLayout: true,
};
