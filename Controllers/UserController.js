import { v4 as uuid} from "uuid"
import UserModel from "../Models/userModel.js";
import bcrypt from "bcrypt";
import { uploadImage } from "../utils/cloudinaryHelpers.js";

//get all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await UserModel.find();
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json(err);
  }
};

// get a User
export const getUser = async (req, res) => {
  const id = req.params.id;

  try {
    const user = await UserModel.findById(id);
    if (user) {
      const { password, ...otherDetails } = user._doc;
      res.status(200).json({ user: otherDetails });
    } else {
      res.status(404).json("No such user exists");
    }
  } catch (error) {
    res.status(500).json(error);
  }
};

// update a user
export const updateUser = async (req, res) => {
  const {id, username} = req.user;
  const { updateUserId, password, ...updatedUser } = req.body;
  const files = req.files;
  try {
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updatedUser.password = await bcrypt.hash(password, salt);
    }
    if (files) {
      const profilePic = files["profilePicture"];
      const coverPic = files["coverPicture"];
      if (profilePic) {
        const uploadedPicture = await uploadImage(
          profilePic,
          `${username}/profilePic`
        );
        updatedUser.profilePicture = {
          src:uploadedPicture.secure_url,
          publicId: uploadedPicture.public_id
        };
      }
      if (coverPic) {
        const uploadedPicture = await uploadImage(
          coverPic,
          `${username}/coverPic`
        );
        updatedUser.coverPicture = {
          src:uploadedPicture.secure_url,
          publicId: uploadedPicture.public_id
        };
      }

    }
    const user = await UserModel.findByIdAndUpdate(id, updatedUser, {
      new: true,
    });

    res.status(201).json(user);
  } catch (error) {
    res.status(500).json(error);
  }
};

// Delete user
export const deleteUser = async (req, res) => {
  const id = req.params.id;

  const { currentUserId, currentUserAdminStatus } = req.body;

  if (currentUserId === id || currentUserAdminStatus) {
    try {
      await UserModel.findByIdAndDelete(id);
      res.status(200).json("User deleted successfully");
    } catch (error) {
      res.status(500).json(error);
    }
  } else {
    res.status(403).json("Access Denied! you can only delete your own profile");
  }
};

// Follow a User
export const followUser = async (req, res) => {
  const id = req.params.id;

  const { id: currentUserId } = req.user;
  if (currentUserId === id) {
    res.status(403).json("Action forbidden");
  } else {
    try {
      const followUser = await UserModel.findById(id);
      const followingUser = await UserModel.findById(currentUserId);
      const notification = {
        _id:uuid(),
        type: "follow",
        payload: {
          userId: currentUserId,
        },
      };
      if (!followUser.followers.includes(currentUserId)) {
        await followUser.updateOne({
          $push: { followers: currentUserId, notifications: notification },
        });
        await followingUser.updateOne({ $push: { following: id } });
        res.status(200).json("User followed!");
      } else {
        res.status(403).json("User is Already followed by you");
      }
    } catch (error) {
      res.status(500).json(error);
    }
  }
};

// UnFollow a User
export const UnFollowUser = async (req, res) => {
  const id = req.params.id;

  const followingUser = req.user;
  if (followingUser.id === id) {
    res.status(403).json("Action forbidden");
  } else {
    try {
      const followUser = await UserModel.findById(id);
      if (followUser.followers.includes(followingUser.id)) {
        await followUser.updateOne({ $pull: { followers: followingUser.id } });
        await followingUser.updateOne({ $pull: { following: id } });
        res.status(200).json("User Unfollowed!");
      } else {
        res.status(403).json("User is not followed by you");
      }
    } catch (error) {
      res.status(500).json(error);
    }
  }
};

// Save a Post
export const bookmarkPost = async (req, res) => {
  const userId = req.user.id;
  const {id:postId} = req.params;
  try{
    const user = await UserModel.findById(userId)
    if(user.bookmarks.includes(postId)){
      await user.updateOne({$pull : { bookmarks: postId}})
      res.status(202).json("Post removed from bookmarks")
    }
    else{
      await user.updateOne({$push : {bookmarks:postId}});
      res.status(201).json("Post added to bookmarks");
    }
  }
  catch(err){
    res.status(500).json(err);
  }
}

// Get notifications
export const getNotifications = async (req, res) => {
  const {notifications} = req.user
  try{
    res.status(200).json(notifications)
  }
  catch(err){
    res.status(500).json(err)
  }
}

//Delete a notification 
export const deleteNotification = async (req, res ) => {
  const userId = req.user.id;
  const {id} = req.params
  try{
    const user = await UserModel.findById(userId);
    await user.updateOne({$pull:{notifications: {_id :id }}})
    res.status(201).json("Notification deleted");
  }
  catch(err){
    res.status(500).json(err)
  }
}