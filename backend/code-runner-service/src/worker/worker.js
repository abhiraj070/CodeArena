import { Worker } from "bullmq";
import axios from 'axios'
import {client} from '../redis/redis.js'
import { ApiError } from "../utils/ApiError.js";


async function getToken(){
    
}

async function createSubmission(){

}


async function runCdoe(code, input, language){

}


async function executeCode(code, language, question, type){
    let testCases
    if(type==="Submit"){
        testCases = question.hiddenTestCases
    }
    else if(type==="Run"){
        testCases = question.visibleTestCases
    }
    else{
        throw new ApiError(400,"submission type is invalid")
    }
    let result= {
                    input: "",
                    output: "",
                    expected: "",
                    passed: true
                }
    for(const tc of testCases){
        const res= await runCode(code, tc.input, language)
        const expected= tc.output

        if(res.stderr){
            return result={
                input: tc.input,
                output: res.stderr,
                expected,
                passed: false
            }
        }

        const output= res.stdout?.trim() || ""
        if(output!==expected){
            return result={
                input: tc.input,
                output,
                expected,
                passed: false
            }
        }
    }
    return result
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