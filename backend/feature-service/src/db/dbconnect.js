import mongoose from "mongoose";

const dbconnect= async ()=>{
    try {
        const mongoUri = process.env.MONGODB_URI
        if(!mongoUri){
            throw new Error("MONGODB_URI is not configured")
        }

        await mongoose.connect(mongoUri)
        console.log("db connected successfully");
        
    } catch (error) {
        console.log("db connection error", error);
        process.exit(1)
    }
}

export {dbconnect}