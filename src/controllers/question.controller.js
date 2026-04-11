import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { Questions } from "../models/question.model.js";
import { initilisIO } from "../socket/socket.js";
import { client } from "../redis/redis.js";


const startQuestion= asyncHandler(async (req,res) => {
    const {ques_id}= req.body
    const user= req.user
    if(!user){
        return new ApiError(401, "Unauthorized request")
    }
    if(!ques_id){
        return new ApiError(400, "Question id is required")
    }
    const cachedValue= await client.
    if()
    const question= await Questions.findById(ques_id)
    if(!question){
        return new ApiError(404, "Question not found")
    }
    try {
        initilisIO();
    } catch (error) {
        console.log("error while initializing socket:",error);
        return new ApiError(500, "Error while initializing socket")
    }
    return res
    .status(200)
    .json(new ApiResponse(200,{question, user},"successfully started a workspace for question"))
})

export {startQuestion}