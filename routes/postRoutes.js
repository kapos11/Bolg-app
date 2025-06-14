const express = require("express");
const router = express.Router();
const postController = require("../controller/postController");
const verifyJWT = require("../middleware/verifyJWT");
const validationId = require("../middleware/validateObjectId");
const photoUpload = require("../middleware/photoUpload");
const checkPostOwnerOrGroupAdmin = require("../middleware/checkPostOwner");

router.use(verifyJWT);
router.route("/").post(postController.createPost);
router.route("/posts").get(postController.getAllPosts);
router.route("/:id").get(validationId, postController.getPostById);
router
  .route("/:id")
  .put(validationId, checkPostOwnerOrGroupAdmin, postController.updatePost);
router
  .route("/:id")
  .delete(validationId, checkPostOwnerOrGroupAdmin, postController.deletePost);

//image
router
  .route("/upload-post-image/:id")
  .post(photoUpload.single("image"), postController.postPhotoUpload);
//likes
router.route("/like/:id").put(validationId, postController.toggleLike);

module.exports = router;
