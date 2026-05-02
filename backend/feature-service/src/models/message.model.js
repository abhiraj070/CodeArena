import mongoose,{Schema} from "mongoose";

const messageSchema= Schema({
    sentBy: {
        type: mongoose.Types.ObjectId,
        ref: "User"
    },
    message:{
        type: String,
        required: true,
        trim: true
    },
    convoId:{
        type: mongoose.Types.ObjectId,
        ref: "Convo"
    },
    seen:{
        type: Boolean
    }
},{timestamps: true})

export const Message= mongoose.model("Message",messageSchema)