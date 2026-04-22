import mongoose,{Schema} from "mongoose";
import { type } from "os";
import { title } from "process";

const questionSchema= Schema({
    description:{
        type: String,
        required: true
    },
    title:{
        type: String || "",
        required: true,
        trim: true
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
        toUppercase: true,
        required: true
    },
    returnType:{
        type: String,
        toUppercase: true,
        required: true
    },
},{timestamps: true})

export const Questions= mongoose.model("Question",questionSchema)