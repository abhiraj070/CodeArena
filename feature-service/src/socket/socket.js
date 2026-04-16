import { ApiError } from "../../utils/ApiError"
import {io} from "../app"
import { User } from "../models/user.model"

const rooms={},joinedMyRoom={}
const initializeIO= ()=>{
    io.on("connection",(socket)=>{
        socket.on("create-room",({roomId, username, id})=>{
            if(rooms[roomId]){
                return new ApiError(400,"Room already exist")
            }
            socket.join(roomId)
            rooms[roomId] = {
                creatorId: id,
                users: []
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
            rooms[roomId].push({Id: id, username: username})
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
        socket.on("send-message",({roomId, username, message})=>{
            if(!rooms[roomId]){
                return new ApiError(404,"roomId not found")
            }
            io.to(`${roomId}`).emit("received-message",{message,username})
        })

        socket.on("leave-room",({roomId, id})=>{
            if(!rooms[roomId]){
                return new ApiError(404,"roomId not found")
            }
            socket.leave(roomId)
            rooms[roomId]= rooms[roomId].filter((user)=>{
                return user.Id!= id
            })

        })

        //disconnect connection
        socket.on("disconnect",(reason)=>{
            console.log("disconnected:",reason);
            
        })
    })
}

export {initializeIO, joinedMyRoom}

