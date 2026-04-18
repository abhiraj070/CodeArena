import { Worker } from "bullmq";
import axios from 'axios'
import {client} from '../redis/redis.js'
import { ApiError } from "../utils/ApiError.js";

function executeCode(code, language, question){
    let input
    if(type==="Submit"){
        input = question.hiddenInput
    }
    else if(type==="Run"){
        input= question.visibleInput
    }
    else{
        throw new ApiError(400,"submission type is invalid")
    }
    for(const inp of input){

    }
    const result= await runCode(code,input,language)

}

const worker= new Worker("code-execution",async (job)=>{
    const {code, language, ques_id, type}= job.data
    const question= await axios.get(`/getAQuestion/${ques_id}`)
    const result = await executeCode(code, language, question, type)
    await client.publish("code-result", JSON.stringify(result))
},
{
    connection: {
      host: "127.0.0.1",
      port: 6379,
    },
}
)