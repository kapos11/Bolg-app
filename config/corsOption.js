const allowedOrigens = require("./allowedOrigens");
const corsOption = {
  origin: (origin, callback) => {
    // cheack if any item in allowedOrigens
    if (allowedOrigens.findIndex(origin) !== -1 || !origin) {
      // !origin test for postman
      callback(null, true);
    } else {
      //send this error if any one want access this server by domain not found
      callback(new Error(" Not allowed by CORS"));
    }
  },
  // To accept any data i send in req
  credentials: true,
  optionSuccessStatus: 200,
};

module.exports = corsOption;
