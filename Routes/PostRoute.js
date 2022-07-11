import cors from "cors";
import corsConfig from "../Config/corsConfig.js";
import express from "express";
import authenticateToken from "../utils/authenticateToken.js";
import {
  createPost,
  deletePost,
  getPost,
  getAllPosts,
  getTimelinePosts,
  likePost,
  updatePost,
  createComment,
  deleteComment,
  updateComment,
} from "../Controllers/PostController.js";
const router = express.Router();

router.options("*", cors(corsConfig));
router.get("/", getAllPosts);
router.post("/", authenticateToken, createPost);
router.get("/timeline", authenticateToken, getTimelinePosts);
router.get("/:id", authenticateToken, getPost);
router.put("/:id", authenticateToken, updatePost);
router.delete("/:id", authenticateToken, deletePost);
router.put("/:id/like", authenticateToken, likePost);
router.put("/:id/comment", authenticateToken, createComment);
router.put("/:postId/comment/:commentId", authenticateToken, updateComment);
router.delete("/:postId/comment/:commentId", authenticateToken, deleteComment);
export default router;
