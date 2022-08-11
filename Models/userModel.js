import mongoose from "mongoose";

const UserSchema = mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    firstname: {
      type: String,
      required: true,
    },
    lastname: {
      type: String,
    },
    profilePicture: {
      src:String,
      publicId:String
    },
    coverPicture: {
      src:String,
      publicId:String
    },
    about: String,
    website: String,
    location: String,
    likes:[],
    posts:[],
    followers: [],
    following: [],
    bookmarks: [],
    notifications: [],
  },
  { timestamps: true }
);

const UserModel = mongoose.model("Users", UserSchema);
export default UserModel;
