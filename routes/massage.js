const express = require("express");
const router = express.Router();
const Message = require("../models/Message");
const verifyVendor = require("../middleware/auth");

// Save message template
router.post("/", verifyVendor, async (req, res) => {
  const { title, body } = req.body;

  if (!title || !body) {
    return res.status(400).json({ msg: "Title and body are required" });
  }

  const message = await Message.create({
    vendorId: req.user.id,
    title,
    body,
  });

  res.status(201).json({ msg: "Message saved", message });
});

// Get all messages for logged-in vendor
router.get("/", verifyVendor, async (req, res) => {
  const messages = await Message.find({ vendorId: req.user.id }).sort({ createdAt: -1 });
  res.json(messages);
});

module.exports = router;
