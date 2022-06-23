import cors from "cors"
import corsConfig from "../Config/corsConfig.js";
import express from "express";
import { loginUser, registerUser } from "../Controllers/AuthController.js";

const router = express.Router()

router.options("*",cors(corsConfig))
router.post('/register', registerUser)
router.post('/login', loginUser)
export default router