import { Router } from "express";
import { VerifyJWT } from "../middleware/auth.middleware.js";
import { sendMessage } from "../controllers/message.controller.js";

const router= Router()

router.route("/sendMessage").post(VerifyJWT,sendMessage)

export default router