import express from "express"
import dotenv from "dotenv"
import connectDb from "./config/db.js"
import router from "./routes/billing.route.js"
import cors from "cors";
dotenv.config()

const port =process.env.PORT

const app=express()
app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true
}))
app.use(express.json())
app.use("/",router)
app.get("/",(req,res)=>{
    res.json({message:"hello from billing"})
})

app.listen(port,()=>{
    console.log(`billing started at ${port}`)
    connectDb()
})
