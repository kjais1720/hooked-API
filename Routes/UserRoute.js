import cors from "cors"
import corsConfig from "../Config/corsConfig.js";
import express from "express";
import {
  deleteUser,
  followUser,
  getUser,
  UnFollowUser,
  getAllUsers,
  updateUser,
  bookmarkPost,
  getNotifications,
  deleteNotification
} from "../Controllers/UserController.js";
import authenticateToken from "../utils/authenticateToken.js";
const router = express.Router();

router.options("*",cors(corsConfig))
router.get("/",getAllUsers);
router.put("/", authenticateToken, updateUser);
router.delete("/", authenticateToken, deleteUser);
router.get("/notifications",authenticateToken, getNotifications);
router.delete("/notifications/:id", authenticateToken, deleteNotification);
router.put("/follow/:id", authenticateToken, followUser);
router.put("/unfollow/:id", authenticateToken, UnFollowUser);
router.put("/bookmarkPost/:id", authenticateToken, bookmarkPost)
router.get("/:id", getUser);
export default router;
