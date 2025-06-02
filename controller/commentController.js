const Comment = require("../models/Comment");
const path = require("path");
const {
  cloudinaryUploadImg,
  cloudinaryDeleteImg,
} = require("../utils/cloudinary");
const fs = require("fs");

/**
 *
 * @desc Create New Comment
 * @rout /comment
 * @method POST
 * @access private (only logged in user)
 */

const createComment = async (req, res) => {
  const { titel, postId } = req.body;
  if (!titel || !postId) {
    return res.status(400).json({ message: "titel & post id is require" });
  }
  try {
    const comment = await Comment.create({
      postId: postId,
      userId: req.userId,
      titel: titel,
    });
    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 *
 * @desc GET All Comment
 * @rout /comment/comments
 * @method GET
 * @access private (only Admin)
 */

const getAllComment = async (req, res) => {
  const comments = await Comment.find();
  if (!comments.length) {
    return res.status(40).json({ message: "Not comment found" });
  }
  res.status(200).json(comments);
};

/**
 *
 * @desc Get Comment By Id
 * @rout /comment/comments/:id
 * @method Get
 * @access private (only admin)
 */
const getCommentById = async (req, res) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment) {
    return res.status(40).json({ message: "Not comment found" });
  }
  // if (!req.user.isAdmin) {
  //   return res.status(404).json({ message: "cant access this comment" });
  // }
  res.status(200).json(comment);
};

/**
 *
 * @desc Update All Comment
 * @rout /comment/
 * @method PUT
 * @access private (only Admin or owner of comment)
 */

const updateComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ message: "the comment not found" });
    }
    if (comment.userId.toString() !== req.userId) {
      return res.status(404).json({ message: "cant access this comment" });
    }
    const updatedComment = await Comment.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          titel: req.body.titel,
        },
      },
      { new: true }
    );

    res.status(200).json(updatedComment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 *
 * @desc Delete Comment
 * @rout /comment/
 * @method DELETE
 * @access private (only Admin or owner of comment)
 */

const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ message: "the comment not found" });
    }

    if (comment.userId.toString() !== req.userId) {
      return res.status(404).json({ message: "cant access this comment" });
    }

    await Comment.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "the comment deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 *
 * @desc Upload Comment image
 * @rout /comment/upload-comment-image/:id
 * @method POST
 * @access private (owner of comment)
 */

const commentPhotoUpload = async (req, res) => {
  //GET comment from db
  const comment = await Comment.findById(req.params.id);

  //validation
  if (!req.file) {
    return res.status(400).json({ message: " Send the Photo" });
  }

  if (comment.userId.toString() !== req.userId) {
    return res.status(404).json({ message: "cant access this post" });
  }

  //GET img path
  const imagepath = path.join(__dirname, `../images/${req.file.filename}`);

  //upload img to cloudinary
  const uploadToCloudinary = await cloudinaryUploadImg(imagepath);

  //DELETE Old Photo
  if (comment.image.publicId !== null) {
    await cloudinaryDeleteImg(comment.image.publicId);
  }

  //Change the profile Photo in DB
  comment.image = {
    url: uploadToCloudinary.secure_url,
    publicId: uploadToCloudinary.public_id,
  };
  await comment.save();

  //Send RES
  res.status(200).json({
    message: "successfully",
    profilePhoto: {
      url: uploadToCloudinary.secure_url,
      publicId: uploadToCloudinary.public_id,
    },
  });

  //DELETE img from the server
  fs.unlinkSync(imagepath);
};

/**
 *
 * @desc ADD LIKE To COMMENT
 * @rout /comment//like/:id
 * @method PUT
 * @access private (logged user)
 */
const toggleLike = async (req, res) => {
  const loggedUser = req.userId;
  const { id: commentId } = req.params;
  let comment = await Comment.findById(req.params.id);
  if (!comment) {
    return res.status(404).json({ message: "post not found" });
  }

  const isCommentAlreadyLiked = comment.likes.find(
    (user) => user.toString() === loggedUser
  );

  if (isCommentAlreadyLiked) {
    comment = await Comment.findByIdAndUpdate(
      commentId,
      {
        $pull: { likes: loggedUser },
      },
      { new: true }
    );
  } else {
    comment = await Comment.findByIdAndUpdate(
      commentId,
      {
        $push: { likes: loggedUser },
      },
      { new: true }
    );
  }
  res.status(201).json(comment);
};

module.exports = {
  createComment,
  getAllComment,
  getCommentById,
  deleteComment,
  updateComment,
  commentPhotoUpload,
  toggleLike,
};
