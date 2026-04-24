import { Router } from "express";
import {getAllQuestion, getAQuestion, getNewlyCreatedQuestion, startQuestion, storeAQuestion} from "../controllers/question.controller.js"
import { VerifyJWT } from "../middleware/auth.middleware.js";
import { parseTestCases } from "../middleware/parseTestCases.js";
const router= Router()


router.route("/startQues").get(VerifyJWT,startQuestion)
router.route("/getQuestions").get(VerifyJWT,getAllQuestion)
router.route("/getAQuestion/:ques_id").get(VerifyJWT,getAQuestion)
router.route("/newlyCreatedQuestion").get(VerifyJWT,getNewlyCreatedQuestion)
router.route("/storeQuestion").post(VerifyJWT, parseTestCases, storeAQuestion)

export default router
