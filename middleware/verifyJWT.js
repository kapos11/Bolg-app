const jwt = require("jsonwebtoken");

const verifyJWT = (req, res, next) => {
  //get auth
  const authHeader = req.headers.authorization || req.headers.Authorization;

  //cheack if you  have token
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  // if your token right
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: "Forbidden" });
    req.userId = decoded.userInfo.id; //to access id from any next middleware
    req.isAdmin = decoded.userInfo.isAdmin;
    next();
  });
};

module.exports = verifyJWT;
