import Redis from 'ioredis'

let redis= null

async function connectRedis(){
    if(!redis){
        redis=new Redis(
            process.env.STATE==="production" 
            ? {
                url: process.env.REDIS_URL,
                enableOfflineQueue: false,
                maxRetriesPerRequest: 1,
            }
            : {
                host: process.env.REDIS_HOST,
                port: process.env.REDIS_PORT,
                enableOfflineQueue: false,
                maxRetriesPerRequest: 1,
            }
        )

        redis.on("connect",()=>{
            console.log("redis connected");
        })

        redis.on("error",(error)=>{
            console.error("redis error: ",error);
        })
    }
}


export {connectRedis, redis}