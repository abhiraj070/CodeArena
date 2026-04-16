import { Worker } from "bullmq";
import axios from 'axios'


const worker= new Worker("code-execution",async (job)=>{
    const {code, language, ques_id}= job.data
    const question= await axios.get(`/getAQuestion/${ques_id}`)
    const result = await executeCode(code, language, question)
})