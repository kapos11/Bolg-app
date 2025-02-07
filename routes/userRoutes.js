const express = require("express");
const router = express.Router();
const userController = require("../controller/userController");
const verifyJWT = require("../middleware/verifyJWT");
const validateObjectId = require("../middleware/validateObjectId");
const photoUpload = require("../middleware/photoUpload");

router.use(verifyJWT);
router.route("/").get(userController.getAllUsers);
// router.use(validateObjectId);
router.route("/:id").get(validateObjectId, userController.getUser);
router.route("/:id").put(validateObjectId, userController.updateUser);
router.route("/:id").delete(validateObjectId, userController.deleteUser);
router
  .route("/upload-user-image")
  .post(photoUpload.single("image"), userController.profilePhotoUpload);

module.exports = router;
