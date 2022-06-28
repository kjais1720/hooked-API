import { v4 as uuid } from "uuid";
import PostModel from "../Models/postModel.js";
import mongoose from "mongoose";
import UserModel from "../Models/userModel.js";
import { uploadImage, deleteAssetsFromServer } from "../utils/cloudinaryHelpers.js";

//Get all posts
export const getAllPosts = async (req, res) => {
  try {
    const posts = await PostModel.find();
    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json("Internal Server Error!");
  }
};

// Create new Post
export const createPost = async (req, res) => {
  try {
    const files = req.files;
    const {username} = req.user;
    let uploadedImages;
    if (files) {
      let images = [
        files["image-0"],
        files["image-1"],
        files["image-2"],
        files["image-3"],
      ];
      images = images.filter((image) => image !== undefined);
      uploadedImages = await Promise.allSettled(
        images.map((img) => uploadImage(img, `${username}/posts`))
      );
      uploadedImages = uploadedImages.map((image, idx) => {
        return {
          title: req.body[`imageAlt-${idx}`],
          src: image.value.secure_url,
          publicId: image.value.public_id
        };
      });
    }
    const newPost = new PostModel({
      ...req.body,
      userId: req.user.id,
      images: uploadedImages,
    });
    await newPost.save();
    res.status(200).json(newPost);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
};

// Get a post

export const getPost = async (req, res) => {
  const id = req.params.id;

  try {
    const post = await PostModel.findById(id);
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json(error);
  }
};

// Update a post
export const updatePost = async (req, res) => {
  const postId = req.params.id;
  const userId = req.user.id;
  const files = req.files;
  const {imagesToDelete, ...updatedPost} = req.body
  try {
    if(files){
      
    }
    const post = await PostModel.findById(postId);
    if (post.userId === userId) {
      await post.updateOne({ $set: updatedPost });
      res.status(200).json("Post Updated");
    } else {
      res.status(403).json("Action forbidden");
    }
  } catch (error) {
    res.status(500).json(error);
  }
};

// Delete a post
export const deletePost = async (req, res) => {
  const id = req.params.id;
  const userId = req.user.id;

  try {
    const post = await PostModel.findById(id);
    if (post.userId === userId) {
      if(post.images.length>0){
        await deleteAssetsFromServer(post.images);
      }
      await post.deleteOne();
      res.status(200).json("Post deleted successfully");
    } else {
      res.status(403).json("Action forbidden");
    }
  } catch (error) {
    res.status(500).json(error);
  }
};

// like/dislike a post
export const likePost = async (req, res) => {
  const id = req.params.id;
  const userId = req.user.id;

  try {
    const post = await PostModel.findById(id);
    if (!post.likes.includes(userId)) {
      
      const postUserId = post.userId;
      const postUser = await UserModel.findById(postUserId);
      if(postUserId !== userId){
        const notification = {
          _id:uuid(),
          type: "like",
          payload: {
            userId: userId,
            postId: id
          },
        };
        await postUser.updateOne({$push:{notifications: notification}})
      }
      await post.updateOne({ $push: { likes: userId } });
      res.status(200).json("Post liked");
    } else {
      await post.updateOne({ $pull: { likes: userId } });
      res.status(200).json("Post unliked");
    }
  } catch (error) {
    res.status(500).json(error);
  }
};

//Comment on a post
export const createComment = async (req, res) => {
  const { id: postId } = req.params;
  const userId = req.user.id;
  const { ...newComment } = req.body;
  newComment.userId = userId;
  newComment._id = uuid();
  newComment.createdAt = new Date().toISOString();
  try {
    const post = await PostModel.findById(postId);
    const postUserId = post.userId;
    if(postUserId !== userId){
      const notification = {
        _id:uuid(),
        type: "like",
        payload: {
          userId: userId,
          postId: postId
        },
      };
      const postUser = await UserModel.findById(postUserId);
      await postUser.updateOne({$push:{notifications: notification}})
    }
    await post.updateOne({ $push: { comments: newComment } });
    res.status(201).json(newComment);
  } catch (err) {
    res.status(500).json(err);
  }
};

//Delete a comment 
export const deleteComment = async (req, res) => {
  const {commentId, postId} = req.params;
  try{
    const post = await PostModel.findById(postId);
    await post.updateOne({$pull : {comments:{_id:commentId}}});
    res.status(204).json("Comment deleted")
  }
  catch(err){
    res.status(500).json(err);
  }
}

// Get Timeline Posts
export const getTimelinePosts = async (req, res) => {
  const userId = req.user.id;
  try {
    const currentUserPosts = await PostModel.find({ userId: userId });
    const followingPosts = await UserModel.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(userId),
        },
      },
      {
        $lookup: {
          from: "posts",
          localField: "following",
          foreignField: "userId",
          as: "followingPosts",
        },
      },
      {
        $project: {
          followingPosts: 1,
          _id: 0,
        },
      },
    ]);
    res.status(200).json(
      currentUserPosts
        .concat(...followingPosts[0].followingPosts)
        .sort((a, b) => {
          return b.createdAt - a.createdAt;
        })
    );
  } catch (error) {
    res.status(500).json(error);
  }
};
