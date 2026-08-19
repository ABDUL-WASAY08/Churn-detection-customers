import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import router from "./src/route/Route.js";
dotenv.config();

const app= express();
app.use(cors());
app.use(express.json());
// simple routes
app.use('/api',router)

// server
const port= process.env.PORT ||5000
app.listen(port,()=>{
    console.log("server is initilized")

})