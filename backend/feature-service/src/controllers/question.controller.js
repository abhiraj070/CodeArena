import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Questions } from "../models/question.model.js";
import { redis } from "../redis/redis.js";
import { rooms } from "../socket/socket.js";

const REDIS_TTL_SECONDS = 60;


const getAllQuestion= asyncHandler(async (req,res) => {
    console.log("starting to get all the question");
    
    const {cursor,limit}= req.query
    //console.log("cursor:",cursor);
    const parsedLimit= Number(limit) || 10
    if(parsedLimit <= 0){
        throw new ApiError(400, "limit must be greater than 0")
    }
    if(cursor==null){
        const cachedValue= await redis.get("startingQuestions")
        const startCursor= await redis.get("startCursor")
        //console.log(13);
        //console.log("cachedCursor",startCursor);
        
        console.log("returning cached questions");
        
        if(cachedValue){
            return res
            .status(200)
            .json(new ApiResponse(200,{questions: JSON.parse(cachedValue), nextCursor: JSON.parse(startCursor)},"successfully fetched limit number of questions from redis"))
        }
    }
    //console.log(14);
    
    const query= cursor && mongoose.Types.ObjectId.isValid(cursor)? {_id:{$lt: new mongoose.Types.ObjectId(cursor)}} : {}
    //console.log(query);
    
    const questionToDisplay= await Questions.aggregate([
        {$match: {...query}},
        {$sort: {createdAt: -1}},
        {$limit: parsedLimit}
    ])
    //console.log(questionToDisplay);
    
    if(questionToDisplay.length===0){
        return res
        .status(200)
        .json(new ApiResponse(200,{questions: [], nextCursor: null}, "no more questions to display"))
    }
    console.log("got all questions");
    const nextCursor= questionToDisplay.length? questionToDisplay[questionToDisplay.length-1]._id : null

    
    if(!cursor){
        await redis.set("startingQuestions", JSON.stringify(questionToDisplay), "EX", REDIS_TTL_SECONDS)
        await redis.set("startCursor", JSON.stringify(nextCursor), "EX", REDIS_TTL_SECONDS)

    }
    return res
    .status(200)
    .json(new ApiResponse(200,{questions: questionToDisplay, nextCursor: nextCursor}, "successfully fetched limit number of questions from db"))
})

const startQuestion= asyncHandler(async (req,res) => {
    const ques_id = req.params?.ques_id
    const user= req.user
    const { roomId } = req.params
    //console.log("38");
    
    if(!roomId){
        //console.log("40");
        throw new ApiError(400, "Room id is required")
    }
    //console.log(roomId);
    //console.log("35");
    const room = rooms[roomId]
    
    if(!room){
        throw new ApiError(404, "Room not found")
    }
    //console.log("code:",room.code);
    
    if(!room.code){
        throw new ApiError(400, "code is unavailable")
    }
    if(!user){
        throw new ApiError(401, "Unauthorized request")
    }
    if(!ques_id){
        throw new ApiError(400, "Question id is required")
    }
    const cachedValue= await redis.get(`${user._id}:Question:${ques_id}`)
    if(cachedValue){
        return res
        .status(200)
        .json(new ApiResponse(200,{question: JSON.parse(cachedValue), code: room.code},"successfully started a workspace for question"))
    }
    const question= await Questions.findById(ques_id)
    if(!question){
        throw new ApiError(404, "Question not found")
    }
    await redis.set(`${user._id}:Question:${ques_id}`, JSON.stringify(question), "EX", REDIS_TTL_SECONDS)
    
    return res
    .status(200)
    .json(new ApiResponse(200,{question, code: room.code},"successfully started a workspace for question"))
})

const startQuestionFromRoom= asyncHandler(async (req,res) => {
    console.log("starting to fetch quesiton with roomid");
    
    const { roomId } = req.params
    if(!roomId){
        throw new ApiError(400, "Room id is required")
    }
    //console.log(roomId);
    
    const room = rooms[roomId]
    if(!room?.questionId){
        throw new ApiError(404, "Room not found")
    }
    if(!room?.code || room.code==""){
        throw new ApiError(400, "code is unavailable")
    }
    //console.log("19");
    
    const question = await Questions.findById(room.questionId)
    //console.log(question);
    
    if(!question){
        throw new ApiError(404, "Question not found")
    }
    console.log("fetched question");
    
    return res
    .status(200)
    .json(new ApiResponse(200, { question, code: room.code }, "successfully fetched question for room"))
})

const startQuestionFromRoomAndId = asyncHandler(async (req, res) => {
    const { roomId } = req.params
    if (!roomId) {
        throw new ApiError(400, "Room id is required")
    }
    const room = rooms[roomId]
    if (!room) {
        throw new ApiError(404, "Room not found")
    }
    if (!room?.code || room.code === "") {
        throw new ApiError(400, "code is unavailable")
    }
    const ques_id= room.questionId
    if (!ques_id) {
        throw new ApiError(400, "Question id is required")
    }

    const question = await Questions.findById(ques_id)
    if (!question) {
        throw new ApiError(404, "Question not found")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, { question, code: room.code }, "successfully fetched question for room"))
})

const storeAQuestion= asyncHandler(async (req, res) => {
    //console.log(1);
    
    const {description, difficulty, returnType, title}= req.body
    const {hiddenTestCases, visibleTestCases}= req
    console.log("h:",hiddenTestCases,"v:",visibleTestCases);
    
    if(!description || !difficulty || !returnType || !hiddenTestCases || !visibleTestCases ||!title){
        throw new ApiError(401,"all fields are required")
    }
    //console.log(5);
    
    const questionCreated= await Questions.create({
        title,
        description,
        difficulty,
        returnType,
        hiddenTestCases,
        visibleTestCases
    })
    //console.log(4);
    
    if(!questionCreated){
        throw new ApiError(500,"Error while storeing the question")
    }
    //console.log(3);
    
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

const getQuestionById = asyncHandler(async (req, res) => {
    console.log("getting question");
    
    const { ques_id } = req.params
    if (!ques_id) {
        throw new ApiError(400, "Question id is required")
    }
    const question = await Questions.findById(ques_id).select("visibleTestCases hiddenTestCases ")
    if (!question) {
        throw new ApiError(404, "Question not found")
    }
    return res
    .status(200)
    .json(new ApiResponse(200, question, "Question fetched successfully"))
})

export {startQuestion, startQuestionFromRoom, startQuestionFromRoomAndId, getAllQuestion, storeAQuestion, getNewlyCreatedQuestion, getQuestionById}