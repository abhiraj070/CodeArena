import mongoose from "mongoose";

const dbconnect= async ()=>{
    try {
        mongoose.connect(`${process.env.MONGODB_URI}`)
        console.log("db connected successfully");
        
    } catch (error) {
        console.log("db connection error", error);
        process.exit(1)
    }
}

export {dbconnect}