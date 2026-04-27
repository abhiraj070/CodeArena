import { server } from "./app.js";
import { dbconnect } from "./db/dbconnect.js";
import {connectRedis} from "./redis/redis.js"
import { initializeIO } from "./socket/socket.js";


dbconnect()
.then(
    async ()=>{
        await connectRedis()
        try {
            initializeIO();
            console.log("Socket Initialized");
        } catch (error) {
            console.log("error while initializing socket:",error);
            throw error
        }
        
        server.listen(process.env.PORT, ()=>{
            console.log("server started on port",process.env.PORT);
        })
    }
)
.catch((error)=>{
    console.log("error in server creation");
    throw error
})
