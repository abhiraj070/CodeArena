import Redis from 'ioredis'

let redis= null

async function connectRedis(){
    if(!redis){
        redis=new Redis({
            host: process.env.REDIS_HOST,
            port: process.env.REDIS_PORT
        })

        redis.on("connect",()=>{
            console.log("redis connected");
        })

        redis.on("error",(error)=>{
            console.error("redis error: ",error);
        })
    }
}


export {connectRedis, redis}