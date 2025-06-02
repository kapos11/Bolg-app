const crypto = require("crypto");
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail");
//register
const register = async (req, res) => {
  const { first_name, last_name, email, password } = req.body;
  if (!first_name || !last_name || !email || !password) {
    return res.status(400).json({ message: " all fieldes are required" });
  }
  const foundUser = await User.findOne({ email }).exec();
  if (foundUser) {
    res.status(401).json({ message: " user already exists" });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({
    first_name,
    last_name,
    email,
    password: hashedPassword,
    isAdmin,
  });
  const accessToken = jwt.sign(
    {
      userInfo: {
        id: user._id,
        isAdmain: user.isAdmin,
      },
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "15m" }
  );
  const refreshToken = jwt.sign(
    {
      userInfo: {
        id: user._id,
        isAdmain: user.isAdmin,
      },
    },
    process.env.RESRESH_TOKEN_SECRET,
    { expiresIn: "7d" }
  );
  res.cookie("jwt", refreshToken, {
    httpOnly: true,
    secure: true, // https
    sameSite: "none",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  res.json({
    accessToken,
    email: user.email,
    first_name: user.first_name,
    last_name: user.last_name,
  });
};

//login
const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: " all fieldes are required" });
  }
  const foundUser = await User.findOne({ email }).exec();
  if (!foundUser) {
    res.status(401).json({ message: " user Not exists" });
  }
  const match = await bcrypt.compare(password, foundUser.password);

  if (!match) {
    res.status(401).json({ message: "Wrong password" });
  }

  const accessToken = jwt.sign(
    {
      userInfo: {
        id: foundUser._id,
        isAdmin: foundUser.isAdmin,
      },
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "15m" }
  );
  const refreshToken = jwt.sign(
    {
      userInfo: {
        id: foundUser._id,
        isAdmain: foundUser.isAdmin,
      },
    },
    process.env.RESRESH_TOKEN_SECRET,
    { expiresIn: "7d" }
  );
  res.cookie("jwt", refreshToken, {
    httpOnly: true,
    secure: true, // https
    sameSite: "none",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  res.json({
    accessToken,
    id: foundUser.id,
    email: foundUser.email,
    first_name: foundUser.first_name,
  });
};

const refresh = (req, res) => {
  const cookies = req.cookies;
  if (!cookies.jwt) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const refreshToken = cookies.jwt;
  jwt.verify(
    refreshToken,
    process.env.RESRESH_TOKEN_SECRET,
    async (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const foundUser = await User.findById(decoded.userInfo.id).exec();
      if (!foundUser) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const accessToken = jwt.sign(
        {
          userInfo: {
            id: foundUser._id,
            isAdmain: foundUser.isAdmin,
          },
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "15m" }
      );
      res.json({ accessToken });
    }
  );
};

const logout = (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) {
    return res.sendStatus(204); //not content
  }
  res.clearCookie("jwt", {
    httpOnly: true,
    sameSite: true,
    secure: true,
  });
  res.json({ message: " logout success" });
};

const forgotPassword = async (req, res) => {
  //GET user By Email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  //Generate Random code
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedResetCode = crypto
    .createHash("sha256")
    .update(resetCode)
    .digest("hex");

  //Save Code in db
  user.passwordResetCode = hashedResetCode;

  //Expiration time
  user.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  user.passwordResetVerified = false;

  await user.save();

  const message = `Hi ${user.first_name} \n We received a requset to reset the password account \n ${resetCode} \n Enter this code to reset ypur password`;
  //Send the reset code to Email
  try {
    await sendEmail({
      email: user.email,
      subject: " Your password reset code (valid for 10min)",
      message,
    });
  } catch (error) {
    user.passwordResetCode = undefined;
    user.passwordResetExpires = undefined;
    user.passwordResetVerified = undefined;

    await user.save();
    return res.status(500).json({ error: error.message });
  }

  res.status(200).json({ message: " reset code send to email" });
};

const verifyResetCode = async (req, res) => {
  //get user by reset code
  const hashedResetCode = crypto
    .createHash("sha256")
    .update(req.body.resetCode)
    .digest("hex");

  // passwordResetExpires: { $gt: Date.now()}
  const user = await User.findOne({
    passwordResetCode: hashedResetCode,
  });
  if (!user) {
    return res.status(400).json({ message: "Reset Code Not valid" });
  }

  user.passwordResetVerified = true;
  await user.save();

  res.status(200).json({ message: "successful" });
};

const resetPassword = async (req, res) => {
  const { email, newPassword } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ message: "user Not found" });
  }
  if (!user.passwordResetVerified) {
    return res.status(400).json({ message: "reset code not verify" });
  }

  user.password = newPassword;
  user.passwordResetCode = undefined;
  user.passwordResetExpires = undefined;
  user.passwordResetVerified = undefined;
  await user.save();

  res
    .status(200)
    .json({ message: "Reset Password success you can login again" });
};

module.exports = {
  register,
  login,
  refresh,
  logout,
  forgotPassword,
  verifyResetCode,
  resetPassword,
};
