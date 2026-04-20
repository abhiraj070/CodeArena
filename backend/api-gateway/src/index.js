import { app } from "./app.js";

try {
    app.listen(process.env.PORT,()=>{
        console.log("Api-gate-server is running on port",process.env.PORT);
    })
} catch (error) {
    console.error("Error in creating the api-gateway server", error);
}
