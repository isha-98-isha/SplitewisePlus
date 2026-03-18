const express = require("express")
const router = express.Router()
const {
  createGroup,
  getGroups,
  getGroup,
  updateGroup,
  deleteGroup,
  addMember,
  removeMember
} = require("../controllers/groupController")

router.post("/create", createGroup)
router.get("/:userId", getGroups)
router.get("/single/:id", getGroup)
router.put("/:id", updateGroup)
router.delete("/:id", deleteGroup)
router.put("/:id/add-member", addMember)
router.put("/:id/remove-member", removeMember)

module.exports = router
