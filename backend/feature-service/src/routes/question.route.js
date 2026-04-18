import { Router } from "express";
import {getAllQuestion, getAQuestion, startQuestion, storeAQuestion} from "../controllers/question.controller.js"
import { VerifyJWT } from "../middleware/auth.middleware.js";
import { parseTestCases } from "../middleware/parseTestCases.js";
const router= Router()

router.route("/startQues").get(VerifyJWT, startQuestion)
router.route("/getQuestions").get(VerifyJWT, getAllQuestion)
router.route("/getAQuestion/:ques_id").get(getAQuestion)
router.route("/storeQuestion").post(parseTestCases, storeAQuestion)
