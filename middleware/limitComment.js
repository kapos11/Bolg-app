const Comment = require("../models/Comment");

const limiteComment = async (req, res, next) => {
  const userId = req.userId;
  const postId = req.body.postId;

  const countComment = await Comment.countDocuments({
    userId: userId,
    postId: postId,
  });
  if (countComment > 5) {
    return res
      .status(400)
      .json({ message: "you have reached the comments limited" });
  }
  next();
};

module.exports = limiteComment;
