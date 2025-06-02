const Group = require("../models/Group");

const isMember = async (req, res, next) => {
  const group = await Group.findById(req.params.groupId);
  if (!group.members.includes(userId)) {
    return res.status(400).json({ message: "You are not Member" });
  }
  next();
};

module.exports = isMember;
