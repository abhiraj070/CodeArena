import { Router } from "express";
import { VerifyJWT } from "../middleware/auth.middleware.js";
import { getMessages, sendMessage } from "../controllers/message.controller.js";

const router= Router()

router.route("/sendMessage").post(VerifyJWT,sendMessage)
router.route("/getMessages/:personA/:personB").get(VerifyJWT,getMessages)

export default router