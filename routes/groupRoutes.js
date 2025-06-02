const express = require("express");
const router = express.Router();
const groupController = require("../controller/groupController");
const verifyJWT = require("../middleware/verifyJWT");
const validationId = require("../middleware/validateObjectId");
const isMember = require("../middleware/isMember");
const photoUpload = require("../middleware/photoUpload");

router.use(verifyJWT);
router.route("/").post(groupController.createGroup);
router.route("/groups").get(groupController.getAllGroups);
router.route("/groups/:id").get(validationId, groupController.getGroupById);
router.route("/:id").put(validationId, groupController.updateGroup);
router.route("/:id").delete(validationId, groupController.deleteGroup);
router.route("/:groupId/addUser").post(groupController.addUser);
router.route("/:groupId/joinRequest").post(groupController.joinRequest);
router.route("/:groupId/:userId/accept").put(groupController.acceptRequest);
router.route("/:groupId/:userId/reject").put(groupController.rejectRequest);

module.exports = router;
