import { ApiError } from "../utils/ApiError.js"
import {io} from "../app.js"
import { User } from "../models/user.model.js"
import { client } from "../redis/redis.js"

const rooms={},joinedMyRoom={},user={}
const initializeIO= ()=>{
    io.on("connection",(socket)=>{
        //console.log("32");
        console.log("user connected to socket form Backend");
        
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
            console.log("31");
            
        })

        socket.on("create-room",({roomId, username, id, questionId, code}, callback)=>{
            console.log("starting the room creation");
            
            if(rooms[roomId]){
                callback?.({ ok: false, error: "Room already exist" })
                return
            }
            socket.join(roomId)
            rooms[roomId] = {
                creatorId: id,
                users: [],
                questionId,
                code
            }
            console.log("questionId:",questionId);
            
            rooms[roomId].users.push({
                Id: id,
                username: username
            })
            callback?.({ ok: true })
        })

        socket.on("join-room",async({roomId, username, id}, callback)=>{ // when the execution flow reaches here it means that the user has already joined the room.
            console.log(`${username} joining room`);
            
            if(!rooms[roomId]){
                callback?.({ ok: false, error: "roomId not found" })
                return
            }
            socket.join(roomId)
            rooms[roomId].users.push({Id: id, username: username})
            const creatorId = rooms[roomId].creatorId

            const [userUpdate, creatorUpdate] = await Promise.all([
                User.updateOne(
                    { _id: id },
                    { $push: { recentlyConnectedWith: { $each: [creatorId], $slice: -10 } } }
                ),
                User.updateOne(
                    { _id: creatorId },
                    { $push: { recentlyConnectedWith: { $each: [id], $slice: -10 } } }
                )
            ])

            if(userUpdate.matchedCount === 0 || creatorUpdate.matchedCount === 0){
                callback?.({ ok: false, error: "User not found" })
                return
            }
            socket.to(roomId).emit("user_joined",`${username}`)
            console.log(`user ${username} joined roomId ${roomId}`);
            callback?.({ ok: true })
            
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

        socket.on("yjs-update",({update,roomId, fullText})=>{
            if (rooms[roomId] && typeof fullText === "string") {
                rooms[roomId].code = fullText
                console.log("code updated");
                
            }
            io.to(`${roomId}`).emit("yjs-update-receive",update)
        })

    })
}

export {initializeIO, joinedMyRoom, rooms}

