import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../../utils/cloudinary.js";
import { User } from "../models/user.model.js";
import {joinedMyRoom} from "../socket/socket.js"


const register= asyncHandler(async (req,res) => {
    const {fullName, email, password}= req.body
    if(!fullName || !email || !password){
        return new ApiError(400, "All fields are required")
    }
    const isUserNew= await User.findOne({email})
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

    const cloudinaryResponse = await uploadOnCloudinary(profilePicturePath)
    if(!cloudinaryResponse){
        return new ApiError(500, "Error while uploading picture on cloudinary")
    }
    const profilePictureUrl = cloudinaryResponse.url
    
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

const login= asyncHandler(async (req, res) => {
    const {email, password}= req.body
    const user= await User.findOne({email})
    if(!user){
        return new ApiError(400, "User not registered")
    }
    const isPasswordCorrect= await user.isPasswordCorrect(password)
    if(!isPasswordCorrect){
        return new ApiError(401, "Invalid password")
    }
    const accessToken= await user.generateAccessToken()
    const refreshToken= await user.generateRefreshToken()

    if(!accessToken || !refreshToken){
        return new ApiError(500,"Error while generating tokens")
    }
    user.refreshToken= refreshToken;
    await user.save({validateBeforeSave: false})
    const loggedUser= await User.findById(user._id).select("-password -refreshToken")

    return res
    .status(200)
    .json(new ApiResponse(200,{user: loggedUser},"User logged in successfully"))
})

const pastConnectedUsers= asyncHandler(async (req, res) => {
    const {user_id}= req.user._id
    if(!user_id){
        return new ApiError(404, "user not found")
    }
    const user= await User.findById(user_id)
    return res
    .status(200)
    .json(new ApiError(200,{pastConnections: user.recentlyConnectedWith},"Successfully fetched past connections"))
})

export {register, login, pastConnectedUsers}