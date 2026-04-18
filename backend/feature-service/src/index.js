import { server } from "./app.js";
import { dbconnect } from "./db/dbconnect.js";
import {connectRedis} from "./redis/redis.js"
import { initializeIO } from "./socket/socket.js";


dbconnect()
.then(
    async ()=>{
        await connectRedis()
        server.listen(process.env.PORT,()=>{
            console.log("server started on port",process.env.PORT);
        })
        try {
                initializeIO();
            } catch (error) {
                console.log("error while initializing socket:",error);
                return new ApiError(500, "Error while initializing socket")
            }
    }
)
.catch((error)=>{
    console.log("error in server creation");
    throw error
})
