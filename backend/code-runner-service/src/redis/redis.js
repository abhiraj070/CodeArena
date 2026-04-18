import Redis from 'ioredis'


let client= null
async function connectRedis(){
    if(!client){
        client= new Redis({
            host: "127.0.0.1",
            port: 6379
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