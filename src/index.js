import { app } from "./app.js";
import { dbconnect } from "./db/dbconnect.js";

dbconnect()
.then(
    ()=>{
        app.listen(process.env.PORT,()=>{
            console.log("server started on port",process.env.PORT);
        })
    }
)
.catch((error)=>{
    console.log("error in server creation");
    throw error
})