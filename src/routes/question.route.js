import { Router } from "express";
import {getAllQuestion, startQuestion} from "../controllers/question.controller"
import { VerifyJWT } from "../middleware/auth.middleware";
const router= Router()

router.route("/startQues").get(VerifyJWT, startQuestion)
router.route("/getQuestions").get(VerifyJWT, getAllQuestion)

