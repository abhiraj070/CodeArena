import { Message } from "../models/message.model.js";
import { Convo } from "../models/convo.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";

const sendMessage = asyncHandler(async (req, res) => {
  console.log("saving message");
  
  const { message, personA, personB } = req.body;
    console.log(message, personA, personB);
    
  if (!message || typeof message !== "string" || message.trim() === "") {
    throw new ApiError(400, "Message is required and must be a non-empty string");
  }

  if (!personA || !personB) {
    throw new ApiError(400, "PersonA and PersonB IDs are required");
  }

  const chatWithUpdateA= await User.findByIdAndUpdate(
    personA,
    [{$set:{  //mongoose doesn't have a direct set data structure so we usew this whole process instead.
      chatsWith:{
        $concatArrays:[
          {$filter:{
            input: "$chatsWith",
            cond:{$ne:["$$this",personB]}
          }},
          [personB]
        ]
      }
    }}],
    {updatePipeline: true}
  )

  const chatWithUpdateB= await User.findByIdAndUpdate(
    personB,
    [{$set:{
      chatsWith:{
        $concatArrays:[
          {$filter:{
            input: "$chatsWith",
            cond:{$ne:["$$this",personA]}
          }},
          [personA]
        ]
      }
    }}],
    {updatePipeline: true}
  )

  if(!chatWithUpdateA || !chatWithUpdateB){
    throw ApiError(500,"error whileupdating user's chatsWith")
  }

  let convo = await Convo.findOne({
    $or: [
      { PersonA: personA, PersonB: personB },
      { PersonA: personB, PersonB: personA },
    ],
  });

  if (!convo) {
    convo = await Convo.create({
      PersonA: personA,
      PersonB: personB,
    });
  }

  const newMessage = await Message.create({
    sentBy: personA,
    message: message.trim(),
    convoId: convo._id,
    seen: false,
  });

  const populatedMessage = await Message.findById(newMessage._id)
    .populate("sentBy", "username email")
    .populate("convoId");

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        populatedMessage,
        "Message sent successfully"
      )
    );
});

const getMessages=asyncHandler(async (req,res) => {
  //console.log("getting all messages");
  
  const {personA, personB}= req.params
  if(!personA || !personB){
    throw new ApiError(400, "user ids are required")
  }
  const isConvo= await Convo.findOne({
    $or:[
      {PersonA: personA, PersonB: personB},
      {PersonA: personB, PersonB: personA}
    ]
  })
  const userB= await User.findById(personB)
  if(!userB){
    throw new ApiError(404,"User not found")
  }
  //console.log("userB:",userB);
  if(!isConvo){
    return res
    .status(200)
    .json(new ApiResponse(200,{messages:[], personB: userB},"successfully fetched chats"))
  }
  const messages= await Message.find({convoId: isConvo._id}).populate("sentBy")
  if(!messages){
    throw new ApiError(500, "error while fetching messages")
  }
  //console.log("userB:",userB);
  

  return res
  .status(200)
  .json(new ApiResponse(200,{messages, personB: userB},"successfully fetched chats"))
})

export { sendMessage, getMessages };
