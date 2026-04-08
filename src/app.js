import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'

const app= express()

app.use(cors({
    origin: process.env.ORIGIN,
    Credential: true
}))
app.use(cookieParser())
app.use(express.urlencoded())
app.use(express.json({limit:"10mb"}))

import userRouter from "../src/routes/user.route.js"


app.use("/api/v1/user",userRouter)

export {app}