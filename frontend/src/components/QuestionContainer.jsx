import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input.jsx";
import { Card } from "@/components/ui/card.jsx";
import { DifficultyBadge } from "./DifficultyBadge";
import { Circle, Search } from "lucide-react";
import axios from "axios";


export function QuestionContainer({questionAdded}) {
  const observerRef= useRef(null)
  const scrollContainerRef = useRef(null)
  const fetchRef= useRef(null)
  const [search, setSearch] = useState("")
  const [questions,setQuestions]= useState([])
  const [cursor, setCursor]= useState(null)
  const [hasMore, setHasMore]= useState(true)
  const [loading, setLoading]= useState(true)

  const query = search.trim().toLowerCase()
  const getDifficultyDotColor = (difficulty) => {
    const value = difficulty?.toLowerCase()
    if (value === "hard") return "text-red-500"
    if (value === "medium") return "text-yellow-500"
    if (value === "easy") return "text-green-500"
    return "text-muted-foreground"
  }

  const filtered = !query
    ? questions
    : questions.filter((q) => {
        const title = q?.title?.toLowerCase() ?? ""
        const difficulty = q?.difficulty?.toLowerCase() ?? ""
        return title.includes(query) || difficulty.includes(query)
      })

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

  const fetchQuestions= useCallback(async () => {
    if (!hasMore ) {
      setLoading(false)
      return
    }

    try {
      const url= cursor
        ? `/feature/v1/question/getQuestions?cursor=${cursor}&limit=10`
        : `/feature/v1/question/getQuestions?limit=10`
      const res= await axios.get(url)
      const incomingQuestions = res?.data?.data?.questions ?? []
      const nextCursor = res?.data?.data?.nextCursor ?? null

      setQuestions((prev) => mergeUniqueById(prev, incomingQuestions))
      setCursor(nextCursor)
      const more = Boolean(nextCursor)
      setHasMore(more)
    } catch (error) {
      console.error("error in getting question:", error)
    } finally {
      setLoading(false)
    }
  },[])

  useEffect(()=>{
    fetchRef.current= fetchQuestions
  },[fetchQuestions])

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
          console.log("stored it successfully");
          
        } catch (error) {
            console.error("error while geting new created question");     
        }
      }
    if(cursor!=null){
      getNewlyCreatedQuestion()
    }
  },[questionAdded])

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        fetchRef.current?.()
      }
    }, {
      root: scrollContainerRef.current,
      threshold: 0,
    })

    const node = observerRef.current
    if (node) {
      observer.observe(node)
    }

    return () => observer.disconnect()
  }, [questions.length])

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
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search questions"
            className="h-9 rounded-full border-border bg-muted/40 pl-9 focus-visible:ring-primary"
          />
        </div>
      </div>

      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-10 text-center text-sm text-muted-foreground">Loading questions...</div>
        ) : questions.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted-foreground">
            No questions match "{search}".
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {questions.map((q, i) => (
              <li key={q._id}>
                <Link
                  to={`/question/${q._id}`}
                  className="grid grid-cols-[2rem_1.25rem_1fr_auto_5rem] items-center gap-3 px-4 py-3 transition hover:bg-muted/40"
                >
                  <span className="text-xs text-muted-foreground tabular-nums">{i + 1}.</span>
                  <Circle className={`h-3.5 w-3.5 ${getDifficultyDotColor(q?.difficulty)}`} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {q.title}
                    </p>
                    
                  </div>
                  <DifficultyBadge difficulty={q.difficulty} className="text-right" />
                </Link>
              </li>
            ))}
          </ul>
        )}
        <div ref={observerRef} className="h-1" />
      </div>
    </Card>
  );
}
