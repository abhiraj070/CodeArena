import {io} from "../app"

const rooms={}
const initilisIO= ()=>{
    io.on("connection",(socket)=>{
        socket.on("create-room",({roomId, username})=>{
            socket.join(roomId)
            rooms[roomId]= rooms[roomId] || []
            rooms[roomId].push({socketId: socket.id, username: username})
            socket.emit("room created",roomId)
        })

        socket.on("join-room",({roomId, username})=>{
            socket.join(roomId)
            rooms[roomId]= rooms[roomId] || []
            rooms[roomId]= rooms[roomId].push({socketId: socket.id, username: username})
            socket.emit("user_joined",`${username}`)
        })

        //send message to room
        socket.on("send-message",({roomId, username, message})=>{
            io.to(`${roomId}`).emit("recived-message",{message,username})
        })

        socket.on("leave-room",({roomId})=>{
            socket.leave(roomId)
            rooms[roomId]= rooms[roomId].filter((user)=>{
                user.socket.id!=socket.id
            })
        })

        //disconnect connection
        socket.on("disconnect",(reason)=>{
            console.log("disconnected:",reason);
            
        })
    })
}

export {initilisIO}

