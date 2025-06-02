const mongoose = require("mongoose");
const PostSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      require: true,
    },
    titel: {
      type: String,
      require: true,
    },
    image: {
      type: Object,
      default: {
        url: "",
        publicId: null,
      },
    },
    groupId: {
      type: mongoose.Schema.ObjectId,
      ref: "Group",
    },
    isPublic: { type: Boolean, default: true },
    likes: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

//Populate Comment for This Post
PostSchema.virtual("Comments", {
  ref: "Comment",
  foreignField: "postId",
  localField: "_id",
});

module.exports = mongoose.model("Post", PostSchema);
