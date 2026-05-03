import { Message } from "../models/message.model.js";
import { Convo } from "../models/convo.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const sendMessage = asyncHandler(async (req, res) => {
  const { message, personA, personB } = req.body;
    console.log(message, personA, personB);
    
  if (!message || typeof message !== "string" || message.trim() === "") {
    throw new ApiError(400, "Message is required and must be a non-empty string");
  }

  if (!personA || !personB) {
    throw new ApiError(400, "PersonA and PersonB IDs are required");
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


const 

export { sendMessage };
