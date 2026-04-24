import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Questions } from "../models/question.model.js";
import { client } from "../redis/redis.js";

const REDIS_TTL_SECONDS = 60;


const getAllQuestion= asyncHandler(async (req,res) => {
    console.log("starting to get all the question");
    
    const {cursor,limit}= req.query
    const parsedLimit= Number(limit) || 10
    if(parsedLimit <= 0){
        throw new ApiError(400, "limit must be greater than 0")
    }
    if(cursor==null){
        const cachedValue= await client.get("startingQuestions")
        const startCursor= await client.get("startCursor")
        console.log(13);
        
        if(cachedValue){
            return res
            .status(200)
            .json(new ApiResponse(200,{questions: JSON.parse(cachedValue), nextCursor: JSON.parse(startCursor)},"successfully fetched limit number of questions from redis"))
        }
    }
    console.log(14);
    
    const query= cursor && mongoose.Types.ObjectId.isValid(cursor)? {_id:{$lt: new mongoose.Types.ObjectId(cursor)}} : {}
    //console.log(query);
    
    const questionToDisplay= await Questions.aggregate([
        {$match: {...query}},
        {$sort: {createdAt: -1}},
        {$limit: parsedLimit}
    ])
    //console.log(questionToDisplay);
    
    if(questionToDisplay.length===0){
        throw new ApiError(404, "No more questions to display")
    }
    console.log("got all questions");
    
    await client.set("startingQuestions", JSON.stringify(questionToDisplay), "EX", REDIS_TTL_SECONDS)
    const nextCursor= questionToDisplay.length? questionToDisplay[questionToDisplay.length-1]._id : null
    await client.set("startCursor", JSON.stringify(nextCursor), "EX", REDIS_TTL_SECONDS)
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
    await client.set(`${user._id}:Question:${ques_id}`, JSON.stringify(question), "EX", REDIS_TTL_SECONDS)
    return res
    .status(200)
    .json(new ApiResponse(200,{question, user},"successfully started a workspace for question"))
})

const getAQuestion= asyncHandler(async (req, res) => {
    const ques_id= req.params.ques_id
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
    console.log(1);
    
    const {description, difficulty, returnType, title}= req.body
    const {hiddenTestCases, visibleTestCases}= req
    console.log("h:",hiddenTestCases,"v:",visibleTestCases);
    
    if(!description || !difficulty || !returnType || !hiddenTestCases || !visibleTestCases ||!title){
        throw new ApiError(401,"all fields are required")
    }
    console.log(5);
    
    const questionCreated= await Questions.create({
        title,
        description,
        difficulty,
        returnType,
        hiddenTestCases,
        visibleTestCases
    })
    console.log(4);
    
    if(!questionCreated){
        throw new ApiError(500,"Error while storeing the question")
    }
    console.log(3);
    
    return res
    .status(200)
    .json(new ApiResponse(200, questionCreated, "successfully created a qeuestion"))
})

const getNewlyCreatedQuestion= asyncHandler(async (req, res) => {
    const question= await Questions.findOne().sort({ createdAt: -1 })
    if(!question){
        throw new ApiError(404, "No question found")
    }
    return res
    .status(200)
    .json(new ApiResponse(200, question, "Latest question fetched successfully"))
})

export {startQuestion, getAllQuestion, getAQuestion, storeAQuestion, getNewlyCreatedQuestion}