import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input.jsx";
import { Card } from "@/components/ui/card.jsx";
import { DifficultyBadge } from "./DifficultyBadge";
import { Circle, Search } from "lucide-react";
import axios from "axios";
import { useSocket } from "@/context/socket.context";
import { useUser } from "@/context/user.context";


export function QuestionContainer({questionAdded}) {
  const observerRef= useRef(null)
  const fetchRef= useRef(null)
  const [search, setSearch] = useState("")
  const [questions,setQuestions]= useState([])
  const [cursor, setCursor]= useState(null)
  const [hasMore, setHasMore]= useState(true)
  const [loading, setLoading]= useState(false)
  const [filteredQuestions, setFilteredQuestions]= useState([])
  const socket = useSocket();
  const {user}= useUser()
  const navigate = useNavigate()




  const getDifficultyDotColor = (difficulty) => {
    const value = difficulty?.toLowerCase()
    if (value === "hard") return "text-red-500"
    if (value === "medium") return "text-yellow-500"
    if (value === "easy") return "text-green-500"
    return "text-muted-foreground"
  }
  




  // QUESTIONS

  useEffect(()=>{
      const getNewlyCreatedQuestion= async () => {
        try {
          console.log("getting newly created question");

          const res= await axios.get(`/feature/v1/question/newlyCreatedQuestion`)
          const latestQuestion = res?.data?.data?.question ?? res?.data?.data ?? null
          if (!latestQuestion) return
          console.log("got the new question");
          
          setQuestions((prev) => {
            const exists = prev.some((item) => item._id === latestQuestion._id)
            if (exists) return prev
            return mergeUniqueById([latestQuestion], prev)
          })
          setFilteredQuestions((prev) => {
            const exists = prev.some((item) => item._id === latestQuestion._id)
            if (exists) return prev
            return mergeUniqueById([latestQuestion], prev)
          })
          console.log("stored it successfully");
          
        } catch (error) {
            console.error("error while geting new created question");     
        }
      }
    if(cursor!=null){
      getNewlyCreatedQuestion()
    }
  },[questionAdded])

  const fetchQuestions= useCallback(async () => {
    if(loading || !hasMore) return

    setLoading(true)
    try {
        const url= cursor
          ? `/feature/v1/question/getQuestions?cursor=${cursor}&limit=12`
          : `/feature/v1/question/getQuestions?limit=12`
        const res= await axios.get(url)
        const incomingQuestions = res?.data?.data?.questions ?? []
        const nextCursor = res?.data?.data?.nextCursor ?? null

        setQuestions((prev) => mergeUniqueById(prev, incomingQuestions))
        setFilteredQuestions((prev) => mergeUniqueById(prev, incomingQuestions))
        setCursor(nextCursor)
        const more = Boolean(nextCursor)
        setHasMore(more)
      } catch (error) {
        if (error?.response?.status === 404) {
          setHasMore(false)
        }
        console.error("error in getting question:", error)
      } finally {
        setLoading(false)
      }
    
  },[cursor,hasMore,loading])

  const mergeUniqueById = (existing, incoming) => {
    const seen = new Set(existing.map((item) => item?._id).filter(Boolean))
    const nextItems = incoming.filter((item) => {
      const id = item?._id
      if (!id || seen.has(id)) return false
      seen.add(id)
      return true
    })
    return [...existing, ...nextItems]
  }






  // INFINITE SCROLL

  useEffect(()=>{
    fetchRef.current= fetchQuestions
  },[fetchQuestions])

  useEffect(() => {
   const observer = new IntersectionObserver(entries => { // a tool provided by the browser to keep an i on screen. as soon as the req html appears on the screen this triggers
            if (entries[0].isIntersecting) { //after the div is visible browser generates a object which is passed to entries, in it there is a field isIntersecting, it turns true when div is visible
                fetchRef.current();
            }
        });
        if (observerRef.current) {
            observer.observe(observerRef.current) // due to this assignment of observer.observe we got an eye on the div and whenever it is inside the viewport it tells the browser and then it triggers the callback function given to it.
        }
        return () => observer.disconnect();
  }, [])

  // CREATE ARENA BUTTON

  const handleCreateArena = async (questionId) => {
    let roomId = ""
    let cnt = 0
    while (cnt != 3) {
      for (let i = 0; i < 4; i++) {
        roomId += Math.ceil(Math.random() * 10)
      }
      cnt++
      if (cnt == 3) continue
      roomId += "-"
    }

    navigate(`/question/${questionId}?roomId=${encodeURIComponent(roomId)}`)

    if (!socket || !user?._id) return
    socket.emit("create-room", { roomId, userame: `${user.userame}`, id: user._id, questionId  })


  }

  


  // QUESTION SEARCHING

  function searched(searchInBox){
    setSearch(searchInBox)
    if(searchInBox.trim()===""){
      setFilteredQuestions(questions)
      return
    }
    
    console.log("search initiated")
    
    const searchWords= searchInBox.split(/\s+/)
    const filtredQuestions= questions.filter((question)=> {
      return searchWords.every(word=>question.title.toLowerCase().trim().includes(word.toLowerCase().trim()))
    })
    setFilteredQuestions(filtredQuestions)
    console.log("search done")
    
  }

  

  

  return (
    <Card className="flex h-[calc(100vh-7.5rem)] flex-col overflow-hidden p-0">
      <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold">Problems</h2>
          <p className="text-xs text-muted-foreground">{questions.length} questions</p>
        </div>
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => searched(e.target.value)}
            placeholder="Search questions"
            className="h-9 rounded-full border-border bg-muted/40 pl-9 focus-visible:ring-primary"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredQuestions.length === 0 && !loading ? (
          <div className="p-10 text-center text-sm text-muted-foreground">
            No questions match "{search}".
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {filteredQuestions.map((q, i) => (
              <li key={q._id}>
                <div className="grid grid-cols-[2rem_1.25rem_1fr_auto_auto] items-center gap-3 px-4 py-3 transition hover:bg-muted/40">
                  <span className="text-xs text-muted-foreground tabular-nums">{i + 1}.</span>
                  <Circle className={`h-3.5 w-3.5 ${getDifficultyDotColor(q?.difficulty)}`} />
                  <div className="min-w-0">
                    <Link to={`/question/${q._id}`} className="block">
                      <p className="truncate text-sm font-medium text-foreground hover:underline">
                        {q.title}
                      </p>
                    </Link>
                    
                  </div>
                  <DifficultyBadge difficulty={q.difficulty} className="text-right" />
                  <button
                    type="button"
                    onClick={() => handleCreateArena(q._id)}
                    className="cursor-pointer rounded-md border border-green-600 bg-green-600 px-3 py-1 text-xs font-medium text-white transition hover:bg-green-700"
                  >
                    Create Arena
                  </button>
                </div>
              </li>
            ))}
          </ul>
          
        )}
            {loading && (
              <div className="py-4 text-center text-xs text-muted-foreground">Loading more questions...</div>
            )}
            <div ref={observerRef} className="h-1" />
      </div>
    </Card>
  );
}
