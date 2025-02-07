const express = require("express");
const router = express.Router();
const commentController = require("../controller/commentController");
const verifyJWT = require("../middleware/verifyJWT");
const validationId = require("../middleware/validateObjectId");
const photoUpload = require("../middleware/photoUpload");
const limiteComment = require("../middleware/limitComment");

router.use(verifyJWT);
router.route("/").post(limiteComment, commentController.createComment);
router.route("/:id").put(validationId, commentController.updateComment);
router.route("/:id").delete(validationId, commentController.deleteComment);
router.route("/comments").get(commentController.getAllComment);
router.route("/comments/:id").get(commentController.getCommentById);
//image
router
  .route("/upload-comment-image/:id")
  .post(photoUpload.single("image"), commentController.commentPhotoUpload);

//likes
router.route("/like/:id").put(validationId, commentController.toggleLike);

module.exports = router;
