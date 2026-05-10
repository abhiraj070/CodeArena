import Redis from 'ioredis'


let client= null
async function connectRedis(){
    if(!client){
        client= new Redis(
            process.env.STATE==="production" 
            ? process.env.REDIS_URL
            : { host: process.env.REDIS_HOST, port: process.env.REDIS_PORT}
        )
        client.on("connection",()=>{
            console.log("connected to redis server");
        })
        client.on("error",()=>{
            console.error("error while connecting with redis server");
        })
    }
}

export {client, connectRedis}