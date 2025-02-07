const { json } = require("express");
const Post = require("../models/Post");
const path = require("path");
const {
  cloudinaryUploadImg,
  cloudinaryDeleteImg,
} = require("../utils/cloudinary");
const fs = require("fs");

/**
 *
 * @desc Create Post
 * @rout /post/
 * @method POST
 * @access private (Logged User)
 */

const createPost = async (req, res) => {
  try {
    const { titel } = req.body;
    if (!titel) {
      return res.status(400).json({ message: "write something" });
    }
    const post = await Post.create({
      userId: req.userId,
      titel: req.body.titel,
    });
    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 *
 * @desc Get All Post
 * @rout /post/posts
 * @method GET
 * @access private (Only admin)
 */

const getAllPosts = async (req, res) => {
  const post = await Post.find();
  if (!post.length) {
    return res.status(40).json({ message: "Post Not Found" });
  }
  res.status(200).json(post);
};

/**
 *
 * @desc Get Post By Id
 * @rout /post/posts/:id
 * @method Get
 * @access private (only admin)
 */

const getPostById = async (req, res) => {
  const post = await Post.findById(req.params.id).populate("Comments");
  if (!post) {
    return res.status(40).json({ message: "Post Not Found" });
  }
  if (!req.user.isAdmin) {
    return res.status(404).json({ message: "cant access this comment" });
  }
  res.status(200).json(post);
};

/**
 *
 * @desc Update Post
 * @rout /post/:id
 * @method PUT
 * @access private (only owner of the post)
 */

const updatePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.userId;
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "the post not found" });
    }
    if (post.userId.toString() !== userId) {
      return res.status(404).json({ message: "cant access this post" });
    }
    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      {
        $set: {
          titel: req.body.titel,
        },
      },
      { new: true }
    );

    res.status(200).json(updatedPost);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 *
 * @desc Delete Post
 * @rout /post/:id
 * @method DELETE
 * @access private (only admin or owner of the post)
 */
const deletePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.userId;
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "the post not found" });
    }
    if (!req.user.isAdmin || post.userId.toString() !== userId) {
      return res.status(404).json({ message: "cant access this post" });
    }
    await Post.findByIdAndDelete(postId);

    res.status(200).json({ message: "the post deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 *
 * @desc Upload Post image
 * @rout /post/upload-post-image/:id
 * @method POST
 * @access private (owner of comment)
 */

const postPhotoUpload = async (req, res) => {
  //GET post from db
  const post = await Post.findById(req.params.id);

  //validation
  if (!req.file) {
    return res.status(400).json({ message: " Send the Photo" });
  }

  if (post.userId.toString() !== req.userId) {
    return res.status(404).json({ message: "cant access this post" });
  }

  //GET img path
  const imagepath = path.join(__dirname, `../images/${req.file.filename}`);

  //upload img to cloudinary
  const uploadToCloudinary = await cloudinaryUploadImg(imagepath);

  //DELETE Old Photo
  if (post.image.publicId !== null) {
    await cloudinaryDeleteImg(post.image.publicId);
  }

  //Change the profile Photo in DB
  post.image = {
    url: uploadToCloudinary.secure_url,
    publicId: uploadToCloudinary.public_id,
  };
  await post.save();

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
 * @desc ADD LIKE To Post
 * @rout /comment//like/:id
 * @method PUT
 * @access private (logged user)
 */
const toggleLike = async (req, res) => {
  const loggedUser = req.userId;
  const { id: postId } = req.params;
  let post = await Post.findById(req.params.id);
  if (!post) {
    return res.status(404).json({ message: "post not found" });
  }

  const isPostAlreadyLiked = post.likes.find(
    (user) => user.toString() === loggedUser
  );

  if (isPostAlreadyLiked) {
    post = await Post.findByIdAndUpdate(
      postId,
      {
        $pull: { likes: loggedUser },
      },
      { new: true }
    );
  } else {
    post = await Post.findByIdAndUpdate(
      postId,
      {
        $push: { likes: loggedUser },
      },
      { new: true }
    );
  }
  res.status(201).json(post);
};

module.exports = {
  createPost,
  getAllPosts,
  getPostById,
  updatePost,
  deletePost,
  postPhotoUpload,
  toggleLike,
};
