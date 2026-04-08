import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";
import { uploadOnCloudinary } from "../../utils/cloudinary";
import { User } from "../models/user.model";

const register= asyncHandler(async (req,res) => {
    const {fullName, email, password}= req.body
    if(!fullName || !email || !password){
        return new ApiError(400, "All fields are required")
    }
    const isUserNew= await User.findone({email})
    if(isUserNew){
        return new ApiError(400, "User already exists")
    }
    let profilePicturePath
    if(req.file){
        profilePicturePath= req.file.path
    }
    else{
        return new ApiError(400, "Profile picture is required")
    }

    const uploadOnCloudinary= await uploadOnCloudinary(profilePicturePath)
    if(!uploadOnCloudinary){
        return new ApiError(500, "Error while uploading picture on cloudinary")
    }
    const profilePictureUrl= uploadOnCloudinary.url
    
    const user= await User.create({
        fullName,
        email,
        password,
        profilePictureUrl
    })
    if(!user){
        return new ApiError(500, "Error while creating user")
    }
    const registeredUser= await User.findById(user._id).select("-refreshToken -password")
    return res
    .status(200)
    .json(new ApiResponse(200,{user:registeredUser},"User Registered successfully"))

})