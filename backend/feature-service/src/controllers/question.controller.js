import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Questions } from "../models/question.model.js";
import { client } from "../redis/redis.js";


const getAllQuestion= asyncHandler(async (req,res) => {
    const {cursor,limit}= req.query
    if(cursor==null){
        const cachedValue= await client.get("startingQuestions")
        const startCursor= await client.get("startCursor")
        if(cachedValue){
            return res
            .status(200)
            .ApiResponse(200,{questions: JSON.parse(cachedValue), nextCursor: JSON.parse(startCursor)},"successfully fetched limit number of questions from redis")
        }
    }
    const query= cursor && mongoose.Types.ObjectId.isValid(cursor)? {_id:{$lt: mongoose.Types.ObjectId(cursor)}} : {}
    const questionToDisplay= await Questions.aggregate([
        {$match: {...query}},
        {$sort: {createdAt: -1}},
        {limit: Number(limit)}
    ])
    if(questionToDisplay.length===0){
        throw new ApiError(404, "No more questions to display")
    }
    await client.set("startingQuestions",JSON.stringify(questionToDisplay))
    const nextCursor= questionToDisplay.length? questionToDisplay[questionToDisplay.length-1]._id : null
    await client.set("startCursor".JSON.stringify(nextCursor))
    return res
    .status(200)
    .json(new ApiResponse(200,{questions: questionToDisplay, nextCursor: nextCursor}, "successfully fetched limit number of questions from db"))
})

const startQuestion= asyncHandler(async (req,res) => {
    const {ques_id}= req.body
    const user= req.user
    if(!user){
        throw new ApiError(401, "Unauthorized request")
    }
    if(!ques_id){
        throw new ApiError(400, "Question id is required")
    }
    const cachedValue= await client.get(`${user._id}:Question:${ques_id}`)
    if(cachedValue){
        return res
        .status(200)
        .json(new ApiResponse(200,{question: JSON.parse(cachedValue), user},"successfully started a workspace for question"))
    }
    const question= await Questions.findById(ques_id)
    if(!question){
        throw new ApiError(404, "Question not found")
    }
    await client.set(`${user._id}:Question:${ques_id}`,JSON.stringify(question))
    return res
    .status(200)
    .json(new ApiResponse(200,{question, user},"successfully started a workspace for question"))
})

const getAQuestion= asyncHandler(async (req, res) => {
    const ques_id= res.params.ques_id
    if(!ques_id){
        throw new ApiError(400,"question id is required")
    }
    const question= await Questions.findById(ques_id).select("-visibleInput -VisibleOutput -description")
    if(!question){
        throw new ApiError(404,"question not found")
    }
    return res
    .status(200)
    .json(new ApiResponse(200,question,"Question featched successfully"))
})

const storeAQuestion= asyncHandler(async (req, res) => {
    const {description, difficulty, returnType, hiddenTestCases, visibleTestCases}= req.body
    if(!description || !difficulty || !returnType || !hiddenTestCases || !visibleTestCases){
        throw new ApiError(400,"all fields are required")
    }
    const questionCreated= await Questions.create({
        description,
        difficulty,
        returnType,
        hiddenTestCases,
        visibleTestCases
    })
    if(!questionCreated){
        throw new ApiError(500,"Error while storeing the question")
    }
    return res
    .status(200)
    .json(new ApiResponse(200,questionCreated,"successfully created a qeuestion"))
})

export {startQuestion, getAllQuestion, getAQuestion, storeAQuestion}