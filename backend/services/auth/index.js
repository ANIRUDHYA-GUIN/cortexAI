import express from "express"
import dotenv from "dotenv"
import connectDb from "./config/db.js"
import cookieParser from "cookie-parser"
import authRoutes from "./routes/auth.route.js"
import cors from "cors"
dotenv.config()

const port = process.env.PORT || 8001
const app = express()
// CORS
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}))

app.use(express.json())
app.use(cookieParser())

// Routes
app.use("/api/auth", authRoutes)

app.get("/", (req, res) => {
    res.json({ message: "hello from auth" })
})

connectDb()

app.listen(port, () => {
    console.log(`auth started at ${port}`)
})