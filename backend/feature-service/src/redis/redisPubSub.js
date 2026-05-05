import { io } from "../app"; 
import { redis } from "./redis";
const subscriber= redis.duplicate() //we are making this duplicate connection because when at the moment you call .subscribe() the reids connection enters a special mode where it can only recive mesages. no storage things (SET, GEt etc).
// the duplicate has the same configuration but different connection.

subscriber.connect() 

subscriber.subscribe("code-result",(data)=>{
    io.to(data.roomId).emit("code-result", {result: data.result})
})