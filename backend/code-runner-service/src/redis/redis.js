import Redis from 'ioredis'


let client= null
async function connectRedis(){
    if(!client){
        const client =
        process.env.STATE === "production"
            ? new Redis(process.env.REDIS_URL, {
                maxRetriesPerRequest: null
            })
            : new Redis({
                host: process.env.REDIS_HOST,
                port: process.env.REDIS_PORT,
                maxRetriesPerRequest: null
            });
        client.on("connection",()=>{
            console.log("connected to redis server");
        })
        client.on("error",()=>{
            console.error("error while connecting with redis server");
        })
    }
}

export {client, connectRedis}