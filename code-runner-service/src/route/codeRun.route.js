import { Router } from "express";
import { pushCodeToQueue } from "../controller/codeRun.controller";

const router= Router()
router.route("/run").post(pushCodeToQueue)