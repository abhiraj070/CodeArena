import {createClient } from 'ioredis'

const client=createClient()

client.on("connect",()=>{
    console.log("redis connected");
})

client.on("error",()=>{
    console.error("redis error: ",error);
})

async function connectRedis(){
    if(!client.isOpen){
        await client.connect()
    }
}


export {connectRedis, client}