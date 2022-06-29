import mongoose from "mongoose";

const postSchema = mongoose.Schema(
  {
    userId: { type: String, required: true },
    content: { type: String },
    type:String,
    likes: [],
    comments:[],
    images: [],
    createdAt: { type: Date, default: Date.toISOString },
  },
  {
    timestamps: true,
  }
);

var PostModel = mongoose.model("Posts", postSchema);
export default PostModel;
