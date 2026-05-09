import {Queue} from 'bullmq' //bullmq is a rapper on redis: it connects with redis on the same port and stores the data in a queue. and provides a worker which execurews the tassk present in the queue

const queue= new Queue("code-execution",{
    connection:{
        // CHANGED: was hardcoded "127.0.0.1". Inside docker the redis container
        // is reachable at hostname `redis` (set via REDIS_HOST in compose).
        // Falling back to 127.0.0.1 keeps `npm run dev` on bare metal working.
        host: process.env.REDIS_HOST || "127.0.0.1",
        port: Number(process.env.REDIS_PORT) || 6379
    }
})

export {queue}