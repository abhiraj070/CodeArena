import express from 'express';
import { errorHandler } from './utils/errorHandler.js';
import helmet from 'helmet';
const app = express();

app.use(helmet()); //helmet protects our app from some well known web vulnerabilities by setting appropriate HTTP headers.
app.use(errorHandler);

export { app };