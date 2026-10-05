import express from "express"
import { login, logOut , updateUserPayment, deductCredits} from "../controllers/auth.controller.js"
const router=express.Router()

router.post("/login", login)
router.get("/logout", logOut)
router.post("/update-plan",updateUserPayment)
router.post("/deduct-credits",deductCredits)

export default router