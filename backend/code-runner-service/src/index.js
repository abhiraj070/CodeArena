import { app } from "./app.js";

try {
    app.listen(process.env.PORT,()=>{
        console.log("code-runner-server started at port",process.env.PORT);
    })
} catch (error) {
    console.error("error in server creation of code-runner-server",error);
}