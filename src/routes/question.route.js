import { Router } from "express";
import {startQuestion} from "../controllers/question.controller"
import { VerifyJWT } from "../middleware/auth.middleware";
const router= Router()

router.route("/startQues").get(VerifyJWT, startQuestion)

