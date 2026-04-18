import mongoose,{Schema} from "mongoose";

const questionSchema= Schema({
    description:{
        type: String,
        required: true
    },
    visibleTestCases:[{
        type: String,
        required: true
    }],
    hiddenTestCases:[{
        type: String,
        required: true
    }],
    difficulty:{
        type: String,
        required: true
    },
    returnType:{
        type: String,
        required: true
    },
},{timestamps: true})

export const Questions= Schema.model("Question",questionSchema)