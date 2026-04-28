import { Router } from "express";
import { pushCodeToQueue } from "../controller/codeRun.controller.js";
import { parseCode } from "../../middleware/parseCode.js";

const router= Router()
router.route("/run/:type").post(parseCode,pushCodeToQueue)