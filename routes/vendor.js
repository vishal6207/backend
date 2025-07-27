const express = require("express");
const router = express.Router();
const Client = require("../models/Clients");
const Message = require("../models/Message");
const verifyVendor = require("../middleware/auth");
const { getSocket } = require("../whatsappClient");

// ✅ Add a client
router.post("/clients", verifyVendor, async (req, res) => {
  const { name, phone, tags } = req.body;

  if (!name || !phone) {
    return res.status(400).json({ msg: "Name and phone are required" });
  }

  try {
    const client = await Client.create({
      vendorId: req.user.id,
      name,
      phone,
      tags,
    });

    res.status(201).json(client);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Failed to add client" });
  }
});

// ✅ Get all clients of vendor
router.get("/clients", verifyVendor, async (req, res) => {
  try {
    const clients = await Client.find({ vendorId: req.user.id });
    res.json(clients);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Failed to fetch clients" });
  }
});



// ✅ Send bulk WhatsApp messages (REAL using Baileys)
router.post("/send-bulk", verifyVendor, async (req, res) => {
  const { messageId } = req.body;

  if (!messageId) {
    return res.status(400).json({ msg: "messageId is required" });
  }

  try {
    const messageTemplate = await Message.findOne({
      _id: messageId,
      vendorId: req.user.id
    });

    if (!messageTemplate) {
      return res.status(404).json({ msg: "Message template not found" });
    }

    const clients = await Client.find({ vendorId: req.user.id });

    if (!clients.length) {
      return res.status(400).json({ msg: "No clients found" });
    }

    const sock = getSocket(); // ✅ Get active WhatsApp socket
    if (!sock) return res.status(500).json({ msg: "WhatsApp not connected" });

    const sentMessages = [];

    for (const client of clients) {
      const personalized = messageTemplate.body.replace(/{{name}}/g, client.name);
      const phone = client.phone.startsWith("+91") ? client.phone : `+91${client.phone}`;
      const jid = phone.replace("+", "") + "@s.whatsapp.net";

      // ✅ Actual WhatsApp message
      await sock.sendMessage(jid, { text: personalized });

      sentMessages.push({
        to: client.phone,
        name: client.name,
        message: personalized
      });

      console.log(`📤 Sent to ${client.name}: ${personalized}`);
    }

    res.json({
      msg: "✅ Bulk WhatsApp messages sent",
      totalSent: sentMessages.length,
      preview: sentMessages
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Bulk send failed" });
  }
});


module.exports = router;
