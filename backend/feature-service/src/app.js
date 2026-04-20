import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import { Server } from 'socket.io'
import http from 'http'
import helmet from 'helmet'

const app= express()
const server= http.createServer(app)
const io= new Server(server)

app.use(cors({
    origin: process.env.ORIGIN,
    credentials: true
}))
app.use(helmet()) //helmet protects our app from some well known web vulnerabilities by setting appropriate HTTP headers.
app.use(cookieParser())
app.use(express.urlencoded())
app.use(express.json({limit:"10mb"}))

import userRouter from "./routes/user.route.js"
import quesRouter from "./routes/question.route.js"
import { errorHandler } from "./utils/errorHandler.js"

app.use("/api/v1/user", userRouter)
app.use("/api/v1/question", quesRouter)
app.use(errorHandler)
export {server, io}