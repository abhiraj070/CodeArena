import { ApiError } from "../utils/ApiError.js"

function parseTestCases(req, res, next){
    console.log("question reached the parseTestCase controller");
    
    const {visibleInput, visibleOutput, hiddenInput, hiddenOutput}= req.body
    
    if(!visibleInput ||!visibleOutput ||!hiddenInput ||!hiddenOutput){
        throw new ApiError(400, "Test cases are required")
    }
    
    const cleanVisibleInput= visibleInput
                                .trim()
                                .split(/\n\s*\n/) //regex is used here: "//" are regex literals, "\n" is for new line, "\s*" is for any number of white spaces(in regex).
                                .map(tc=>tc.trim())
    const cleanVisibleOutput= visibleOutput
                                .trim()
                                .split(/\n\s*\n/)
                                .map(tc=>tc.trim())
    const cleanHiddenInput= hiddenInput
                                .trim()
                                .split(/\n\s*\n/)
                                .map(tc=>tc.trim())
    const cleanHiddenOutput= hiddenOutput
                                .trim()
                                .split(/\n\s*\n/)
                                .map(tc=>tc.trim())
    
    console.log("Question parsed");
    
    if(cleanHiddenInput.length!==cleanHiddenOutput.length){
        throw new ApiError(400,"Mismatch in inputs and outputs of hidden Test Cases")
    }
    if(cleanVisibleInput.length!==cleanVisibleOutput.length){
        throw new ApiError(400,"Mismatch in inputs and outputs of visible Test Cases")
    }

    const visibleTestCases= cleanVisibleInput.map((inp,i)=>({
        input: inp,
        output: cleanVisibleOutput[i]
    }))
    const hiddenTestCases= cleanHiddenInput.map((inp,i)=>({
        input: inp,
        output: cleanHiddenOutput[i]
    }))
    req.hiddenTestCases= hiddenTestCases
    req.visibleTestCases= visibleTestCases
    console.log("Question Saved");
    console.log("h:",hiddenTestCases,"v:",visibleTestCases);
    
    next()
}

export {parseTestCases}