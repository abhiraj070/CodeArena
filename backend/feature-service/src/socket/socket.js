import { ApiError } from "../utils/ApiError.js"
import {io} from "../app.js"
import { User } from "../models/user.model.js"
import { client } from "../redis/redis.js"

const rooms={},joinedMyRoom={},user={}
const initializeIO= ()=>{
    io.on("connection",(socket)=>{

        socket.on("register",async({userId})=>{
            user[userId]=socket.id
            const storedMessage= await client.lrange(`stored-chat-message:${userId}`,0,-1)
            if(storedMessage.length>0){
                for (const msg of storedMessage) {
                    const parse= JSON.parse(msg)
                    socket.emit("receive-inchat-message",parse.message,{senderId: parse.senderId})
                }
                await client.del(`stored-chat-message:${userId}`)
            }
        })

        socket.on("create-room",({roomId, username, id, questionId})=>{
            if(rooms[roomId]){
                return new ApiError(400,"Room already exist")
            }
            socket.join(roomId)
            rooms[roomId] = {
                creatorId: id,
                users: [],
                questionId
            }
            rooms[roomId].users.push({
                Id: id,
                username: username
            })
            socket.emit("room created",roomId)
        })

        socket.on("join-room",async({roomId, username, id})=>{ // when the execution flow reaches here it means that the user has already joined the room.
            if(!rooms[roomId]){
                return new ApiError(404,"roomId not found")
            }
            socket.join(roomId)
            rooms[roomId].users.push({Id: id, username: username})
            const user= await User.findById(id)
            if(!user){
                return new ApiError(404, "User not found")
            }
            if(user.recentlyConnectedWith.length>=10){
                user.recentlyConnectedWith.splice(0,1)
            }
            user.recentlyConnectedWith.push(rooms[roomId].creatorId) 
            await user.save()
            const creater= await User.findById(rooms[roomId].creatorId)
            if(!creater){
                return new ApiError(404, "User not found")
            }
            if(creater.recentlyConnectedWith.length>=10){
                creater.recentlyConnectedWith.splice(0,1)
            }
            creater.recentlyConnectedWith.push(id)
            await creater.save()
            socket.to(roomId).emit("user_joined",`${username}`)
        })

        //send message to room
        socket.on("in-meeting-message",({roomId, username, message})=>{
            if(!rooms[roomId]){
                return new ApiError(404,"roomId not found")
            }
            io.to(`${roomId}`).emit("received-message",{message, username})
        })

        socket.on("leave-room",({roomId, id})=>{
            if(!rooms[roomId]){
                return new ApiError(404,"roomId not found")
            }
            socket.leave(roomId)
            rooms[roomId].users = rooms[roomId].users.filter((user)=>{
                return user.Id!= id
            })

        })
        //disconnect connection
        socket.on("disconnect",(reason,)=>{
            console.log("disconnected: ",reason);
            
        })

        socket.on("in-chat-message",async({message,recever_id,senderId})=>{
            if(user[recever_id]){
                io.to(user[recever_id]).emit("receive-inchat-message",message,{senderId: senderId})
            }
            else{
                await client.lpush(`stored-chat-message:${recever_id}`,JSON.stringify({message, senderId}))
            }
        })
    })
}

export {initializeIO, joinedMyRoom}

