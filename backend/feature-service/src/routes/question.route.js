import { Router } from "express";
import {getAllQuestion, getNewlyCreatedQuestion, startQuestion, storeAQuestion} from "../controllers/question.controller.js"
import { VerifyJWT } from "../middleware/auth.middleware.js";
import { parseTestCases } from "../middleware/parseTestCases.js";
const router= Router()


router.route("/startQues/:ques_id").get(VerifyJWT,startQuestion)
router.route("/getQuestions").get(VerifyJWT,getAllQuestion)
router.route("/newlyCreatedQuestion").get(VerifyJWT,getNewlyCreatedQuestion)
router.route("/storeQuestion").post(VerifyJWT, parseTestCases, storeAQuestion)

export default router
