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
    console.log("response:",cloudinaryResponse);
    
    const profilePictureUrl = cloudinaryResponse?.secure_url || cloudinaryResponse?.url
    if(!profilePictureUrl){
        throw new ApiError(500, "Profile picture upload failed")
    }
    console.log("pp:",profilePictureUrl);
    
    
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
    if(!email || !password){
        throw new ApiError(400,"All fields are required")
    }
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

    const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
    }

    user.refreshToken= refreshToken;
    await user.save({validateBeforeSave: false})
    const loggedUser= await User.findById(user._id).select("-password -refreshToken")

    return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(new ApiResponse(200,{user: loggedUser, accessToken},"User logged in successfully"))
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

const updatePreferredLanguage = asyncHandler(async (req, res) => {
    const { userId, language } = req.body

    if(!userId){
        throw new ApiError(400, "userId is required")
    }

    const normalizedLanguage = language?.trim()?.toLowerCase()
    const allowedLanguages = ["javascript", "python", "cpp", "java", "typescript"]

    if(!normalizedLanguage || !allowedLanguages.includes(normalizedLanguage)){
        throw new ApiError(400, "Invalid language")
    }

    const updatedUser = await User.findByIdAndUpdate(
        userId,
        { language: normalizedLanguage },
        { new: true }
    ).select("-password -refreshToken")

    if(!updatedUser){
        throw new ApiError(404, "User not found")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, { user: updatedUser }, "Language updated successfully"))
})

const updateProfile = asyncHandler(async (req, res) => {
    const { userId, fullName, username, email, bio, profilePicture, language } = req.body

    if(!userId){
        throw new ApiError(400, "userId is required")
    }

    const user = await User.findById(userId)
    if(!user){
        throw new ApiError(404, "User not found")
    }

    const updatePayload = {}

    if(typeof fullName === "string"){
        const normalizedFullName = fullName.trim()
        if(!normalizedFullName){
            throw new ApiError(400, "fullName cannot be empty")
        }
        updatePayload.fullName = normalizedFullName
    }

    if(typeof username === "string"){
        const normalizedUsername = username.trim().toLowerCase()
        if(!normalizedUsername){
            throw new ApiError(400, "username cannot be empty")
        }

        const existingByUsername = await User.findOne({
            username: normalizedUsername,
            _id: { $ne: userId }
        })

        if(existingByUsername){
            throw new ApiError(400, "Username is already taken")
        }

        updatePayload.username = normalizedUsername
    }

    if(typeof email === "string"){
        const normalizedEmail = email.trim().toLowerCase()
        if(!normalizedEmail){
            throw new ApiError(400, "email cannot be empty")
        }

        const existingByEmail = await User.findOne({
            email: normalizedEmail,
            _id: { $ne: userId }
        })

        if(existingByEmail){
            throw new ApiError(400, "Email is already in use")
        }

        updatePayload.email = normalizedEmail
    }

    if(typeof bio === "string"){
        updatePayload.bio = bio.trim()
    }

    if(typeof profilePicture === "string"){
        updatePayload.profilePicture = profilePicture.trim()
    }

    if(typeof language === "string"){
        const normalizedLanguage = language.trim().toLowerCase()
        const allowedLanguages = ["javascript", "python", "cpp", "java", "typescript"]

        if(!allowedLanguages.includes(normalizedLanguage)){
            throw new ApiError(400, "Invalid language")
        }

        updatePayload.language = normalizedLanguage
    }

    const updatedUser = await User.findByIdAndUpdate(
        userId,
        updatePayload,
        { new: true }
    ).select("-password -refreshToken")

    return res
    .status(200)
    .json(new ApiResponse(200, { user: updatedUser }, "Profile updated successfully"))
})

export {register, login, pastConnectedUsers, getUserByUsername, updatePreferredLanguage, updateProfile}