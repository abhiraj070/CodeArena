import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { User } from "../models/user.model.js";
import {joinedMyRoom} from "../socket/socket.js"


const register= asyncHandler(async (req,res) => {
    const {fullName, username, email, password}= req.body
    if(!fullName || !username || !email || !password){
        throw new ApiError(400, "All fields are required")
    }
    const isUserNew= await User.findOne({email})
    if(isUserNew){
        throw new ApiError(400, "User already exists")
    }
    const isUsernameTaken = await User.findOne({ username: username.trim().toLowerCase() })
    if(isUsernameTaken){
        throw new ApiError(400, "Username is already taken")
    }
    let profilePicturePath
    if(req.file){
        profilePicturePath= req.file.path
    }
    else{
        throw new ApiError(400, "Profile picture is required")
    }

    const cloudinaryResponse = await uploadOnCloudinary(profilePicturePath)
    const profilePictureUrl = cloudinaryResponse?.url 
    
    const user= await User.create({
        fullName,
        username,
        email,
        password,
        profilePicture: profilePictureUrl
    })
    if(!user){
        throw new ApiError(500, "Error while creating user")
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
        throw new ApiError(400, "User not registered")
    }
    const isPasswordCorrect= await user.isPasswordCorrect(password)
    if(!isPasswordCorrect){
        throw new ApiError(401, "Invalid password")
    }
    const accessToken= await user.generateAccessToken()
    const refreshToken= await user.generateRefreshToken()

    if(!accessToken || !refreshToken){
        throw new ApiError(500,"Error while generating tokens")
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
        throw new ApiError(404, "user not found")
    }
    const user= await User.findById(user_id)
    return res
    .status(200)
    .json(new ApiError(200,{pastConnections: user.recentlyConnectedWith},"Successfully fetched past connections"))
})

const getUserByUsername = asyncHandler(async (req, res) => {
    const { username } = req.params

    if(!username || !username.trim()){
        throw new ApiError(400, "username is required")
    }

    const user = await User.findOne({ username: username.trim() }).select("-password -refreshToken")

    if(!user){
        throw new ApiError(404, "User not found")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, { user }, "User fetched successfully"))
})

export {register, login, pastConnectedUsers, getUserByUsername}