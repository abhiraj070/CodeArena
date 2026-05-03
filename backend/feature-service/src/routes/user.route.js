import { Router } from "express";
import { login, register, pastConnectedUsers, getUserByUsername, getRecentlyConnectedUsers, getChatsWithUsers, updatePreferredLanguage, updateProfile, updateUserOnlineStatus } from "../controllers/user.controller.js";
import { VerifyJWT } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";

const router= Router()

router.route("/login").post(login)
router.route("/register").post(upload.single("profilePicture"), register)
router.route("/pastUsersConnected").get(VerifyJWT,pastConnectedUsers)
router.route("/recentlyConnected/:id").get(VerifyJWT,getRecentlyConnectedUsers)
router.route("/chatsWith/:userId").get(VerifyJWT,getChatsWithUsers)
router.route("/language").patch(VerifyJWT,updatePreferredLanguage)
router.route("/profile").patch(VerifyJWT,updateProfile)
router.route("/online-status/:id").patch(updateUserOnlineStatus)
router.route("/:username").get(VerifyJWT,getUserByUsername)

export default router