import JWT from "jsonwebtoken";
import { ApiError } from "../../utils/ApiError";
import { asyncHandler } from "../../utils/asyncHandler";
import { User } from "../models/user.model";

const VerifyJWT= asyncHandler(async (req,res, next) => {
    try {
        const accessToken= req.cookies?.accessToken || req.headers("Authorization").replace("Bearer ","")
        if(!accessToken){
            return new ApiError(401, "user is not logged In")
        }
        const decodeToken= JWT.verify(accessToken, process.env.ACCESS_TOKEN_SECRET)
        const user= await User.findById(decodeToken._id)
        req.user= user
        next()
    } catch (error) {
        return new ApiError(401, "Invalid or expired access token")
    }
})

export {VerifyJWT}