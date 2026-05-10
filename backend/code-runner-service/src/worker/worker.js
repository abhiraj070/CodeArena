import { Worker } from "bullmq";
import axios from 'axios'
import {client} from '../redis/redis.js'
import { ApiError } from "../utils/ApiError.js";


const LANGUAGE_MAP = {
  cpp: 54,        // C++ (GCC 9)
  python: 71,     // Python 3
  javascript: 63, // Node.js
  java: 62
};

const api= axios.create({
    baseURL: process.env.BASE_URL
})

async function getResult(token){
    while(true){
        const res = await axios.get(
            `https://judge0-ce.p.rapidapi.com/submissions/${token}`,
            {
                headers: {
                    "X-RapidAPI-Key": process.env.RAPIDAPI,
                    "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com"
                }
            }
        );
        const statusId = res.data.status.id;
        if (statusId <= 2) {
            await new Promise(r => setTimeout(r, 1000));
            continue;
        }

        return res.data;
    }
}

async function createSubmission(code, language_id, input){
    try {
        const res= await axios.post(process.env.JUDGE_SUBMISSION_URL,
            {
                source_code: code,
                language_id,
                stdin: input
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    "X-RapidAPI-Key": process.env.RAPIDAPI,
                    "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com"
                }
            }
        )
    } catch (error) {
        console.log(error.response.status);
        console.log(error.response.data);
        
    }
    console.log(res);
    
    return res.data.token
}


async function runCode(code, input, language){
    const language_id= LANGUAGE_MAP[language]
    console.log("running create submission");
    
    const token= await createSubmission(code, language_id, input)
    console.log("running get result");
    
    const result= await getResult(token)
    return {
        stdout: result.stdout,
        stderr: result.stderr,
        compile_output: result.compile_output,
        status: result.status.description
    };
}


async function executeCode(code, language, question, type){
    console.log("reached execute code");
    
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
        console.log("execute runCode");
        
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
    const {code, language, ques_id, type, roomId}= job.data
    console.log("reached worker");
    
    const response= await api.get(`/api/v1/question/getAQuestion/${ques_id}`)
    const question= response.data.data
    //console.log("question:",question.hiddenTestCases);
    
    console.log("executing execute code");
    const result = await executeCode(code, language, question, type)
    await client.publish("code-result", JSON.stringify({result,roomId}))
},
{
    connection:
      process.env.STATE === "production" //this need a new redis connection
    ? new Redis(process.env.REDIS_URL)
    : new Redis({
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT
      })
}
)