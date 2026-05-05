import Redis from 'ioredis'

let redis= null

async function connectRedis(){
    if(!redis){
        redis=new Redis({
            host: "127.0.0.1",
            port: 6379
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