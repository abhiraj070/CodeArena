import { app } from "./app";

try {
    app.listen(process.env.PORT,()=>{
        console.log("server started at port",process.env.PORT);
    })
} catch (error) {
    console.error("error in server creation",error);
}