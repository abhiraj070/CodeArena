import { ApiError } from "../src/utils/ApiError.js";
import { asyncHandler } from "../src/utils/asyncHandler.js";

const parseCode= asyncHandler((req,res,next)=>{
    if(!req?.body?.language){
        throw new ApiError(400,"language not mentioned")
    }
    if(!req?.body?.code){
        throw new ApiError(400, "code is unavailable")
    }
    if(req.body.code.includes("fucntion solve")){
        throw new ApiError("solve() is required")
    }
    if(req.body.language==="JavaScript"){
        req.body.code=`const fs = require("fs");; const input = fs.readFileSync(0, "utf-8").trim();\n` + req.body.code 
        req.body.code+=`\nconsole.log(solve(input));`
    }
    if(req.body.language=="TypeScript"){
        req.body.code=`const fs = require("fs"); const input: string = fs.readFileSync(0, "utf-8").trim();\n` + req.body.code
        req.body.code+=`\nconsole.log(solve(input));`
    }
    next()
})

export {parseCode}