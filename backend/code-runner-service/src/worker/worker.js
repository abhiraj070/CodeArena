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
    baseURL:"http://localhost:8003"
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

try {
    const res = await axios.post(
        "https://judge0-ce.p.rapidapi.com/submissions",
        {
            source_code: "print('hello')",
            language_id: 71,
            stdin: ""
        },
        {
            headers: {
                "Content-Type": "application/json",
                "X-RapidAPI-Key": "YOUR_KEY_HERE",
                "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com"
            }
        }
    );
    console.log("SUCCESS:", res.data);
} catch (err) {
    console.error("STATUS:", err.response?.status);
    console.error("DATA:", err.response?.data);
    console.error("MESSAGE:", err.message);
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
    
    const response= await api.get(`/feature/v1/question/getAQuestion/${ques_id}`)
    const question= response.data.data
    //console.log("question:",question.hiddenTestCases);
    
    console.log("executing execute code");
    const result = await executeCode(code, language, question, type)
    await client.publish("code-result", JSON.stringify({result,roomId}))
},
{
    connection: {
      host: "127.0.0.1",
      port: 6379,
    },
}
)