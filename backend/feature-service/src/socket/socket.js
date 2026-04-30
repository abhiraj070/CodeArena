import { ApiError } from "../utils/ApiError.js"
import {io} from "../app.js"
import { User } from "../models/user.model.js"
import { client } from "../redis/redis.js"

const rooms={},joinedMyRoom={},user={},socketToUser={}

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
            socketToUser[socket.id] = { id, username, roomId }
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
            console.log("users");

            socket.join(roomId)
            socketToUser[socket.id] = { id, username, roomId }
            rooms[roomId].users.push({Id: id, username: username})
            for(const users of rooms[roomId].users){
                console.log(users);
     
            }
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
        socket.on("disconnect",(reason)=>{
            console.log("disconnected: ",reason);
            
            const userInfo = socketToUser[socket.id]
            if (userInfo) {
                const { id, username, roomId } = userInfo
                
                // Remove user from the room
                if (rooms[roomId]) {
                    rooms[roomId].users = rooms[roomId].users.filter((user) => user.Id !== id)
                    console.log(`User ${username} removed from room ${roomId}`)
                    
                    // If no users left in room, delete the room
                    if (rooms[roomId].users.length === 0) {
                        delete rooms[roomId]
                        console.log(`Room ${roomId} deleted (no users left)`)
                    } else {
                        // Notify remaining users that someone left
                        io.to(roomId).emit("user_left", username)
                    }
                }
                
                // Remove from socket tracking
                delete socketToUser[socket.id]
            }
            
            // Remove from user tracking
            for (const userId in user) {
                if (user[userId] === socket.id) {
                    delete user[userId]
                    break
                }
            }
        })

        socket.on("disconnecting",()=>{
            //console.log("rooms:");
            
            // for (const roomId of socket.rooms) { //when a socket is created it adds itself in socket.rooms.and "disconnecting" can give us this socket.rooms
            //     console.log(roomId);
                
            // }
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
            const normalizedUpdate = normalizeYjsUpdate(update)

            if (!normalizedUpdate || normalizedUpdate.length === 0) {
                console.warn("Ignoring invalid Yjs update from socket", update)
                return
            }

            if (rooms[roomId] && typeof fullText === "string") {
                rooms[roomId].code = fullText
                console.log("code updated");
                
            }
            io.to(`${roomId}`).emit("yjs-update-receive",normalizedUpdate)
        })

    })
}

export {initializeIO, joinedMyRoom, rooms}

