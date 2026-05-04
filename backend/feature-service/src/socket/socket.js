import { ApiError } from "../utils/ApiError.js"
import {io} from "../app.js"
import { User } from "../models/user.model.js"
import { client } from "../redis/redis.js"
import axios from 'axios'
import * as Y from "yjs"


// we have socket.rooms and socket._id by default for every .on trigger.
const api= axios.create({
    baseURL: "http://localhost:8003"
})

const rooms={},userToSocket={},socketToUser={}

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
    io.on("connection",async(socket)=>{
        //console.log("32");
        console.log("user connected to socket form Backend");
        const userId= socket.handshake.auth.userId
        socketToUser[socket.id]=userId
        userToSocket[userId]=socket.id
        console.log("user",userId);
        
        await api.patch(`/feature/v1/user/online-status/${userId}?online=true`)
        const storedMessage= await client.lrange(`stored-chat-message:${userId}`,0,-1)
            if(storedMessage.length>0){
                const parse=[]
                for (const msg of storedMessage) {
                    parse.push(JSON.parse(msg)) 
                }
                socket.emit("receive-inchat-message",parse,{senderId: parse.senderId})
                await client.del(`stored-chat-message:${userId}`)
            }

        socket.on("create-room",({roomId, username, id, questionId, code})=>{
            console.log("starting the room creation");
            
            if(rooms[roomId]){
                return
            }
            socket.join(roomId)
            socketToUser[socket.id] = { id, username, roomId }

            const seedCode = code ?? ""
            const ydoc = new Y.Doc()
            if (seedCode.length > 0) {
                ydoc.getText("editor").insert(0, seedCode)
            }
            const state = Y.encodeStateAsUpdate(ydoc)

            rooms[roomId] = {
                creatorId: id,
                users: [],
                questionId,
                code: seedCode,
                ydoc,
                state,
            }
            console.log("questionId:",questionId);
            
            rooms[roomId].users.push({
                Id: id,
                username: username
            })

            socket.emit("yjs-init", state)
        })

        socket.on("join-room",async({roomId, username, id})=>{ // when the execution flow reaches here it means that the user has already joined the room.
            console.log(`${username} joining room`);
            console.log('JOIN', username, roomId)
            if(!rooms[roomId]){
                return
            }
            //console.log("users");

            socket.join(roomId)
            socketToUser[socket.id] = { id, username, roomId }
            rooms[roomId].users.push({Id: id, username: username})
            //console.log("user",rooms[roomId].users);
            
            for(const users of rooms[roomId].users){
                console.log(users);
     
            }
            const creatorId = rooms[roomId].creatorId

            if(creatorId!=id){
                console.log("starting to update recentlyConnectedWith");
                
                const [userUpdate, creatorUpdate] = await Promise.all([
                    User.updateOne(
                        { _id: id },
                        [
                            {$set:{
                                recentlyConnectedWith:{
                                    $slice:[
                                        {$concatArrays:[
                                            {$filter:{
                                                input: "$recentlyConnectedWith",
                                                cond: {$ne:["$$this",creatorId]}
                                            }},
                                            [creatorId]
                                        ]},
                                        -10
                                    ]
                                }
                            }}
                        ],
                        {updatePipeline: true}
                    ),
                    User.updateOne(
                        { _id: creatorId },
                        [
                            {$set:{
                                recentlyConnectedWith:{
                                    $slice:[
                                        {$concatArrays:[
                                            {$filter:{
                                                input: "$recentlyConnectedWith",
                                                cond: {$ne:["$$this",id]}
                                            }},
                                            [id]
                                        ]},-10
                                    ]
                                }
                            }}
                        ],
                        {updatePipeline: true}
                    )
                ])
                if(userUpdate.matchedCount === 0 || creatorUpdate.matchedCount === 0){
                    return
                }
            }
            
            if (rooms[roomId]?.state) {
              socket.emit("yjs-init", rooms[roomId].state);
            }

            socket.to(roomId).emit("user_joined",`${username}`)
            console.log(`user ${username} joined roomId ${roomId}`);
            
        })

        //send message to room
        socket.on("in-meeting-message",({roomId, username, message})=>{
            if(!rooms[roomId]){
                return new ApiError(404,"roomId not found")
            }
            io.to(`${roomId}`).emit("received-message",{message, username})
        })

        socket.on("leave-room",({roomId, id})=>{
            console.log("leaving the room")
            if(!rooms[roomId]){
                return new ApiError(404,"roomId not found")
            }
            socket.leave(roomId)
            rooms[roomId].users = rooms[roomId].users.filter((user)=>{
                return user.Id!= id
            })
            if(rooms[roomId].users.length===0){
                delete rooms[roomId]
            }
            delete socketToUser[socket.id]
            delete userToSocket[id]
        })
        //disconnect connection
        socket.on("disconnect",(reason)=>{
            console.log("disconnected: ",reason);
            
            const userInfo = socketToUser[socket.id]
            if (userInfo) {
                const { id, username, roomId } = userInfo
                
                if (rooms[roomId]) {
                    rooms[roomId].users = rooms[roomId].users.filter((user) => user.Id !== id)
                    console.log(`User ${username} removed from room ${roomId}`)
                    
                    if (rooms[roomId].users.length === 0) {
                        delete rooms[roomId]
                        console.log(`Room ${roomId} deleted (no users left)`)
                    } else {
                        io.to(roomId).emit("user_left", username)
                    }
                }
                
                delete socketToUser[socket.id]
            }
            
            for (const userId in userToSocket) {
                if (userToSocket[userId] === socket.id) {
                    delete userToSocket[userId]
                    break
                }
            }
        })

        socket.on("disconnecting",async()=>{
            const userId=socketToUser[socket.id]
            if(!userId){
                console.log("user id is getting undefined check it");
                return
                
            }
            console.log("going offline")
            //console.log("userId",userId)
            
            await api.patch(`/feature/v1/user/online-status/${userId.id || userId}?online=false`)
            // for (const roomId of socket.rooms) { //when a socket is created it adds itself in socket.rooms.and "disconnecting" can give us this socket.rooms
            //     console.log(roomId);
            // }
        })

        socket.on("in-chat-message",async({message,receiver_id,senderId})=>{
                console.log("emiting the message to the receiver");
                //console.log("reveiver:",receiver_id);
                console.log("users registered");
                
                for(const u in userToSocket){
                    console.log(u);
                    
                }
                console.log(userToSocket[receiver_id]);
                
            if(userToSocket[receiver_id]){
                    console.log("message emited to the receiver");
                    console.log("Sending senderId:", senderId);
                    
                io.to(userToSocket[receiver_id]).emit("receive-inchat-message",{message, senderId})
            }
            else{
                await client.lpush(`stored-chat-message:${receiver_id}`,JSON.stringify({message, senderId}))
            }
        })

        socket.on("request-yjs-state", ({ roomId }) => {
            const room = rooms[roomId]
            if (!room || !room.state) return
            socket.emit("yjs-init", room.state)
        })

        socket.on("yjs-update",({update,roomId})=>{
            const normalizedUpdate = normalizeYjsUpdate(update);

            if (!normalizedUpdate || normalizedUpdate.length === 0) {
                return;
            }

            const room = rooms[roomId];
            if (!room) return;

            if (!room.ydoc) {
                room.ydoc = new Y.Doc();

                if (room.state) {
                    Y.applyUpdate(room.ydoc, room.state);
                }
            }

            Y.applyUpdate(room.ydoc, normalizedUpdate);
            room.state = Y.encodeStateAsUpdate(room.ydoc);
            socket.to(roomId).emit("yjs-update-receive", normalizedUpdate);
        })

    })
}

export {initializeIO, rooms}

