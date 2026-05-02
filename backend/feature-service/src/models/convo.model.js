import mongoose,{Schema, Types} from "mongoose";

const convoScheme= Schema({
    PersonA:{
        type: mongoose.Types.ObjectId,
        ref: "User"
    },
    PersonB:{
        type: mongoose.Types.ObjectId,
        ref: "User"
    },
},{timestamps: true})

export const Convo= mongoose.model("Convo",convoScheme)