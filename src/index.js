import { server } from "./app.js";
import { dbconnect } from "./db/dbconnect.js";
import {connectRedis} from "./redis/redis.js"

dbconnect()
.then(
    async ()=>{
        await connectRedis()
        server.listen(process.env.PORT,()=>{
            console.log("server started on port",process.env.PORT);
        })
    }
)
.catch((error)=>{
    console.log("error in server creation");
    throw error
})
