import Redis from 'ioredis'


let client= null
async function connectRedis(){
    if(!client){
        client= new Redis({
            host: process.env.REDIS_HOST || "127.0.0.1",
            port: process.env.REDIS_PORT 
        })
        client.on("connection",()=>{
            console.log("connected to redis server");
        })
        client.on("error",()=>{
            console.error("error while connecting with redis server");
        })
    }
}

export {client, connectRedis}