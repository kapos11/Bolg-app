const Group = require("../models/Group");
const Post = require("../models/Post");

const checkPostOwnerOrGroupAdmin = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    console.log(post.author.toString());

    //if public post
    if (!post.groupId && post.author.toString() !== req.userId) {
      return res.status(403).json({ message: "cant access this post" });
    }

    //if group Post
    if (post.groupId) {
      const group = await Group.findById(post.groupId);
      const isAdmin = group.creator.toString() === req.userId;
      const isOwner = post.author.toString() === req.userId;

      if (!isAdmin && !isOwner) {
        return res.status(403).json("cant access this post");
      }
    }
  } catch (err) {
    res.status(400).json({ err: err.message });
  }

  next();
};

module.exports = checkPostOwnerOrGroupAdmin;
