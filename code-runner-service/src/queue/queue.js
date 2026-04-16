import {Queue} from 'bullmq' //bullmq is a rapper on redis: it connects with redis on the same port and stores the data in a queue. and provides a worker which execurews the tassk present in the queue

const queue= new Queue("code-execution",{
    connection:{
        host: "127.0.0.1",
        port: 6379
    }
})

export {queue}