import Redis from 'ioredis'

let client= null

async function connectRedis(){
    if(!client){
        client=new Redis({
            host: "127.0.0.1",
            port: 6379
        })

        client.on("connect",()=>{
            console.log("redis connected");
        })

        client.on("error",(error)=>{
            console.error("redis error: ",error);
        })
    }
}


export {connectRedis, client}