// create server
require("dotenv").config();
const express = require("express");
const app = express();

const cors = require("cors");
const corsOption = require("./config/corsOption");
const cookieParser = require("cookie-parser");
const path = require("path");

//connect DB
const mongoose = require("mongoose");
const connectDb = require("./config/dbConn");
const PORT = process.env.PORT || 4000;

connectDb();

app.use(cors({ corsOption }));
app.use(cookieParser());
app.use(express.json());

//404 Page To UnKnow routes
app.use("/", express.static(path.join(__dirname, "public")));
app.all("*", (req, res) => {
  res.status(404);
  if (req.accepts("html")) {
    res.sendFile(path.join(__dirname, "view", "404.html"));
  } else if (req.accepts("json")) {
    res.json({ message: "404 Not Found" });
  } else {
    res.type("txt").send("404 Not Found");
  }
});

app.use("/auth", require("./routes/authRoutes"));
app.use("/post", require("./routes/postRoutes"));
app.use("/users", require("./routes/userRoutes"));
app.use("/comment", require("./routes/commentRoutes"));

//if connect done
mongoose.connection.once("open", () => {
  console.log("connection to database is done");
  app.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`);
  });
});

// if not
mongoose.connection.on("error", (err) => {
  console.log(err);
});
