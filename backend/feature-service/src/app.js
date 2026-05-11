import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import { Server } from 'socket.io'
import http from 'http'
import helmet from 'helmet'

const app= express()
const server= http.createServer(app)
const corsOrigin = process.env.ORIGIN
const io= new Server(server, {
    cors: {
        origin: corsOrigin,
        credentials: true,
    },
})


app.use(cors({
    origin: corsOrigin,
    credentials: true
}))
app.use(helmet()) //helmet protects our app from some well known web vulnerabilities by setting appropriate HTTP headers.
app.use(cookieParser())
app.use(express.urlencoded({ extended: true, limit: "10mb" }))
app.use(express.json({limit:"10mb"}))
app.use("/temp", express.static("public/temp"))

app.get("/health", (_req, res) => res.status(200).json({ status: "ok" }))

import userRouter from "./routes/user.route.js"
import quesRouter from "./routes/question.route.js"
import messageRouter from "./routes/message.route.js"
import { errorHandler } from "./utils/errorHandler.js"

app.use("/api/v1/user", userRouter)
app.use("/api/v1/question", quesRouter)
app.use("/api/v1/message",messageRouter)
app.use(errorHandler)
export {server, io}