const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

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
  });
  const accessToken = jwt.sign(
    {
      userInfo: {
        id: user._id,
      },
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "15m" }
  );
  const refreshToken = jwt.sign(
    {
      userInfo: {
        id: user._id,
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
      },
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "15m" }
  );
  const refreshToken = jwt.sign(
    {
      userInfo: {
        id: foundUser._id,
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

module.exports = {
  register,
  login,
  refresh,
  logout,
};
