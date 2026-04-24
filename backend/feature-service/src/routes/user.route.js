import { Router } from "express";
import { login, register, pastConnectedUsers, getUserByUsername, updatePreferredLanguage, updateProfile } from "../controllers/user.controller.js";
import { VerifyJWT } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";

const router= Router()

router.route("/login").post(login)
router.route("/register").post(upload.single("profilePicture"), register)
router.route("/pastUsersConnected").get(VerifyJWT,pastConnectedUsers)
router.route("/language").patch(VerifyJWT,updatePreferredLanguage)
router.route("/profile").patch(VerifyJWT,updateProfile)
router.route("/:username").get(VerifyJWT,getUserByUsername)

export default router