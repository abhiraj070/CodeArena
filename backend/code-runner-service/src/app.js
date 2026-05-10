import express from 'express';
import { errorHandler } from './utils/errorHandler.js';
import helmet from 'helmet';
const app = express();

app.use(helmet()); //helmet protects our app from some well known web vulnerabilities by setting appropriate HTTP headers.
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => res.status(200).json({ status: "ok" }));

import codeRunRouter from "./route/codeRun.route.js"

app.use("/api/v1/codeRunner",codeRunRouter)
app.use(errorHandler);

export { app };