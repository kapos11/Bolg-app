const express = require("express");
const router = express.Router();
const path = require("path");
const authController = require("../controller/authcontroller");

router.route("/register").post(authController.register);
router.route("/login").post(authController.login);
router.route("/refresh").get(authController.refresh);
router.route("/logout").post(authController.logout);
router.route("/forgotPassword").post(authController.forgotPassword);
router.route("/verifyResetCode").post(authController.verifyResetCode);
router.route("/resetPassword").post(authController.resetPassword);

module.exports = router;
