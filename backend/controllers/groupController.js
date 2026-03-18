const Group = require("../models/Group")

// CREATE GROUP
exports.createGroup = async (req, res) => {
  try {
    const { name, description, members, createdBy } = req.body
    const group = await Group.create({
      name,
      description: description || "",
      members: Array.isArray(members) ? members : [],
      createdBy
    })
    res.status(201).json(group)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// GET ALL GROUPS BY USER
exports.getGroups = async (req, res) => {
  try {
    const groups = await Group.find({ createdBy: req.params.userId })
    res.json(groups)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// GET SINGLE GROUP
exports.getGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
    if (!group) return res.status(404).json({ message: "Group not found" })
    res.json(group)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// UPDATE GROUP
exports.updateGroup = async (req, res) => {
  try {
    const updated = await Group.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    )
    res.json(updated)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// DELETE GROUP
exports.deleteGroup = async (req, res) => {
  try {
    await Group.findByIdAndDelete(req.params.id)
    res.json({ message: "Group deleted" })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// ADD MEMBER TO GROUP
exports.addMember = async (req, res) => {
  try {
    const { memberName } = req.body
    const group = await Group.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { members: memberName } },
      { new: true }
    )
    res.json(group)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// REMOVE MEMBER FROM GROUP
exports.removeMember = async (req, res) => {
  try {
    const { memberName } = req.body
    const group = await Group.findByIdAndUpdate(
      req.params.id,
      { $pull: { members: memberName } },
      { new: true }
    )
    res.json(group)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
