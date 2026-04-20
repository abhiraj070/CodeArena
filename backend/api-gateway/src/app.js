import express from 'express'
import proxy from 'express-http-proxy'
import helmet from 'helmet'
import { ApiResponse } from './utils/ApiResponse.js'
import { ApiError } from './utils/ApiError.js'
import { errorHandler } from './utils/errorHandler.js'
const app= express()

app.use(helmet())

const proxyOptions_code_running_service={
    proxyReqPathResolver: (req)=>{
        return req.originalUrl.replace(/^\/codeRunService/,"/api")
    },
    proxyErrorHandler:(err, res, next)=>{
        console.error("proxy error: ",err.message);
        new ApiError(500,"error in proxy in code_running_service")
        res.
        status(500)
        .json(new ApiResponse(500,{},"error in proxy"))
    }
}
const proxyOptions_feature_service={
    proxyReqPathResolver: (req)=>{
        return req.originalUrl.replace(/^\/featureService/,"/api")
    },
    proxyErrorHandler:(err, res, next)=>{
        console.error("proxy error: ",err.message);
        new ApiError(500,"error in proxy of feature_service")
        res.
        status(500)
        .json(new ApiResponse(500,{},"error in proxy"))
    }
}



app.use("/codeRunService/v1",proxy(process.env.CODE_RUNNER_SERVICE_URL,{...proxyOptions_code_running_service}))
app.use("/featureService/v1",proxy(process.env.FEATURE_SERVICE_URL,{...proxyOptions_feature_service}))
app.use(errorHandler)

export {app}