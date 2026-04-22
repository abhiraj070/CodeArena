import { Router } from "express";
import {getAllQuestion, getAQuestion, getNewlyCreatedQuestion, startQuestion, storeAQuestion} from "../controllers/question.controller.js"
import { VerifyJWT } from "../middleware/auth.middleware.js";
import { parseTestCases } from "../middleware/parseTestCases.js";
const router= Router()

router.route("/startQues").get(startQuestion)
router.route("/getQuestions").get(getAllQuestion)
router.route("/getAQuestion/:ques_id").get(getAQuestion)
router.route("/newlyCreatedQuestion").get(getNewlyCreatedQuestion)
router.route("/storeQuestion").post(parseTestCases, storeAQuestion)

export default router
