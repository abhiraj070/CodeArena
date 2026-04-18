import { asyncHandler } from "../utils/asyncHandler.js";
import { queue } from "../queue/queue.js";

const pushCodeToQueue= asyncHandler(async (req,res) => {
    const {code, language}= req.body
    const {ques_id}= req.params
    queue.add("execute-code",{
        code,
        language,
        ques_id
    })
})

export { pushCodeToQueue }