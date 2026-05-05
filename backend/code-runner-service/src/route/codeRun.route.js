import { Router } from "express";
import { pushCodeToQueue } from "../controller/codeRun.controller.js";
import { parseCode } from "../../middleware/parseCode.js";

const router= Router()
router.route("/run/:ques_id").post(parseCode,pushCodeToQueue)

export default router