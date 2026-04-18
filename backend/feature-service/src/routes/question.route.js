import { Router } from "express";
import {getAllQuestion, getAQuestion, startQuestion} from "../controllers/question.controller.js"
import { VerifyJWT } from "../middleware/auth.middleware.js";
const router= Router()

router.route("/startQues").get(VerifyJWT, startQuestion)
router.route("/getQuestions").get(VerifyJWT, getAllQuestion)
router.route("/getAQuestion/:ques_id").get(getAQuestion)
