import { asyncHandler } from "../utils/asyncHandler.js";
import { queue } from "../queue/queue.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const pushCodeToQueue= asyncHandler(async (req,res) => {
    const {code, language}= req.body
    const {ques_id}= req.params
    const {type}= req.query
    queue.add("execute-code",{
        code,
        language,
        ques_id,
        type
    })  
    return res
    .status(200)
    .json(new ApiResponse(200,{},"submission pushed to queue successfully"))
})


export { pushCodeToQueue }