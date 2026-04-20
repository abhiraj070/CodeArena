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
    const res= await axios.get("https://judge0-ce.p.rapidapi.com/submissions",
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
    return res.data.token
}


async function runCdoe(code, input, language){
    const language_id= LANGUAGE_MAP[language]
    const token= await createSubmission(code, language_id, input)
    const result= await getResult(token)
    return {
        stdout: result.stdout,
        stderr: result.stderr,
        compile_output: result.compile_output,
        status: result.status.description
    };
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