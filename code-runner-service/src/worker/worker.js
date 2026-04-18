import { Worker } from "bullmq";
import axios from 'axios'
import {client} from '../redis/redis.js'

function executeCode(code, language, question){

}

const worker= new Worker("code-execution",async (job)=>{
    const {code, language, ques_id}= job.data
    const question= await axios.get(`/getAQuestion/${ques_id}`)
    const result = await executeCode(JSON.parse(code), language, question)
    await client.publish("code-result", JSON.stringify(result))
},
{
    connection: {
      host: "127.0.0.1",
      port: 6379,
    },
}
)