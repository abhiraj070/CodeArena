import {Queue} from 'bullmq' //bullmq is a rapper on redis: it connects with redis on the same port and stores the data in a queue. and provides a worker which execurews the tassk present in the queue
const connection =
  process.env.STATE === "production" //this need a new redis connection
    ? new Redis(process.env.REDIS_URL)
    : new Redis({
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT
      });

const queue = new Queue("code-execution", {
  connection
});

export {queue}