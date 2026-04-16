import mongoose,{Schema} from "mongoose";

const questionSchema= Schema({
    description:{
        type: String,
        required: true
    },
    visibleInput:{
        type: String,
        required: true
    },
    visibleOutput:{
        type: String,
        required: true
    },
    hiddenInput:{
        type: String,
        required: true
    },
    hiddenOutput:{
        type: String,
        required: true
    }
},{timestamps: true})

export const Questions= Schema.model("Question",questionSchema)