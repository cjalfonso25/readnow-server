const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    summary: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
    },
    thumbnail: {
      type: Buffer,
    },
    isFeatured: {
      type: Boolean,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Users",
    },
  },
  {
    timestamps: true,
  }
);

postSchema.methods.toJSON = function () {
  const post = this;
  const postObject = post.toObject();

  return postObject;
};

const Post = mongoose.model("Post", postSchema);

module.exports = Post;
