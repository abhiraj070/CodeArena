import { Router } from "express";
import { login, register, pastConnectedUsers, getUserByUsername } from "../controllers/user.controller.js";
import { VerifyJWT } from "../middleware/auth.middleware.js";

const router= Router()

router.route("/login").post(login)
router.route("/register").post(register)
router.route("/pastUsersConnected").get(VerifyJWT,pastConnectedUsers)
router.route("/:username").get(getUserByUsername)

export default router