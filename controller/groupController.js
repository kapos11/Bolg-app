const Group = require("../models/Group");
const User = require("../models/User");
const path = require("path");
const {
  cloudinaryUploadImg,
  cloudinaryDeleteImg,
} = require("../utils/cloudinary");
const fs = require("fs");

/**
 *
 * @desc Create New Group
 * @rout /group
 * @method POST
 * @access private (only logged in user)
 */

const createGroup = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({ message: "Please give the group name" });
    }

    const group = await Group.create({
      name,
      description,
      creator: req.userId,
    });
    group.members.push(req.userId);
    await group.save();
    res.status(201).json(group);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 *
 * @desc Get All Groups
 * @rout /groups/groups
 * @method GET
 * @access private (Only admin)
 */

const getAllGroups = async (req, res) => {
  const group = await Group.find();
  if (!group.length) {
    return res.status(40).json({ message: "Post Not Found" });
  }
  res.status(200).json(group);
};

/**
 *
 * @desc Get Group By Id
 * @rout /group/groups/:id
 * @method Get
 * @access private (only admin)
 */

const getGroupById = async (req, res) => {
  const group = await Group.findById(req.params.id);
  if (!group) {
    return res.status(40).json({ message: "Group Not Found" });
  }
  res.status(200).json(group);
};

/**
 *
 * @desc Update Group
 * @rout /group/:id
 * @method PUT
 * @access private (only owner of the group)
 */

const updateGroup = async (req, res) => {
  try {
    const groupId = req.params.id;
    const userId = req.userId;
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "The Group Not Found" });
    }
    if (group.creator.toString() !== userId) {
      return res.status(404).json({ message: "Cant Cccess This Group" });
    }
    const updatedGroup = await Group.findByIdAndUpdate(
      groupId,
      {
        $set: {
          name: req.body.name,
          description: req.body.description,
        },
      },
      { new: true }
    );

    res.status(200).json(updatedGroup);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 *
 * @desc Delete Group
 * @rout /group/:id
 * @method DELETE
 * @access private (only admin or owner of the Group)
 */
const deleteGroup = async (req, res) => {
  try {
    const groupId = req.params.id;
    const userId = req.userId;
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "the Group not found" });
    }
    if (group.creator.toString() !== userId) {
      return res.status(404).json({ message: "cant access this Group" });
    }
    await Group.findByIdAndDelete(groupId);

    res.status(200).json({ message: "The Group Deleted Successful" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 *
 * @desc Add User
 * @rout /group/:{groupId}/addUser
 * @method POST
 * @access private (only owner of the Group)
 */

const addUser = async (req, res) => {
  const { groupId } = req.params;
  const { userId, addedByUserId } = req.body;
  //search group
  const group = await Group.findById(groupId);
  if (!group) {
    return res.status(404).json({ message: "The Group Not Found" });
  }
  //search addUser
  const addedByUser = User.findById(addedByUserId);
  if (!addedByUser) {
    return res.status(404).json({ message: "The User Not Found" });
  }

  //if addUser member or admin
  const isMember = group.members.includes(addedByUserId);

  if (group.creator.toString() !== addedByUserId && !isMember) {
    return res
      .status(400)
      .json({ message: "You are Not Member in This Group" });
  }

  //if member already inClude
  const isInclude = group.members.includes(userId);
  if (isInclude) {
    return res.status(400).json({ message: "User already member in group" });
  }

  //add member
  group.members.push(userId);
  await group.save();

  res
    .status(200)
    .json({ message: "User added to the group successful", group });
};

/**
 *
 * @desc Join Request
 * @rout /group/:{groupId}/joinRequest
 * @method POST
 * @access private (only loggin user)
 */

const joinRequest = async (req, res) => {
  const { groupId } = req.params;
  const { userId } = req.body;

  //search group
  const group = await Group.findById(groupId);
  if (!group) {
    return res.status(404).json({ message: "The Group Not Found" });
  }
  //search User
  const user = User.findById(userId);
  if (!user) {
    return res.status(404).json({ message: "The User Not Found" });
  }

  //if User member
  const isMember = group.members.includes(userId);
  if (isMember) {
    return res
      .status(400)
      .json({ message: "You are already member in this group" });
  }

  //if user have send req brefor
  const checkRequest = group.joinRequest.includes(userId);
  console.log(checkRequest);
  if (checkRequest) {
    return res.status(400).json({ message: "Request already sent" });
  }

  //add User To joinRequest array
  group.joinRequest.push(userId);
  await group.save(userId);

  res
    .status(200)
    .json({ message: "Your request to the group successful", group });
};

/**
 *
 * @desc Accept Join Request
 * @rout /group/:{groupId}/accept
 * @method PUT
 * @access private (only admin)
 */

const acceptRequest = async (req, res) => {
  const { groupId, userId } = req.params;
  const group = await Group.findById(groupId);
  const user = User.findById(userId);
  if (!group || !user) {
    return res.status(404).json({ message: "something Wrong" });
  }
  //check req
  const request = group.joinRequest.includes(userId);
  if (!request) {
    return res.status(400).json({ message: "Request Not found" });
  }
  //if he was member
  const isMember = group.members.includes(userId);
  if (isMember) {
    return res.status(400).json({ message: "You are already member" });
  }

  group.joinRequest.pop(userId);
  group.members.push(userId);

  await group.save();
  res
    .status(200)
    .json({ message: "User added to the group successful", group });
};

/**
 *
 * @desc Reject Join Request
 * @rout /group/:{groupId}/reject
 * @method PUT
 * @access private (only admin)
 */

const rejectRequest = async (req, res) => {
  const { groupId, userId } = req.params;
  const group = await Group.findById(groupId);
  const user = User.findById(userId);
  if (!group || !user) {
    return res.status(404).json({ message: "something Wrong" });
  }
  //check req
  const request = group.joinRequest.includes(userId);
  if (!request) {
    return res.status(400).json({ message: "Request Not found" });
  }

  group.joinRequest.pop(userId);
  await group.save();
  res
    .status(200)
    .json({ message: "Recect Request to the group successful", group });
};

module.exports = {
  createGroup,
  getAllGroups,
  getGroupById,
  updateGroup,
  deleteGroup,
  addUser,
  joinRequest,
  acceptRequest,
  rejectRequest,
};
