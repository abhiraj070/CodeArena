import { Router } from "express";
import { pushCodeToQueue } from "../controller/codeRun.controller.js";

const router= Router()
router.route("/run").post(pushCodeToQueue)