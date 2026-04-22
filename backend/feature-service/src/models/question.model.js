import mongoose,{Schema} from "mongoose";
import { type } from "os";

const questionSchema= Schema({
    description:{
        type: String,
        required: true
    },
    visibleTestCases:[{
        input: {
            type: String,
            required: true
        },
        output: {
            type: String,
            required: true
        }
    }],
    hiddenTestCases:[{
        input: {
            type: String,
            required: true
        },
        output: {
            type: String,
            required: true
        }
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

export const Questions= mongoose.model("Question",questionSchema)