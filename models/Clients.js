const mongoose = require("mongoose");

const clientSchema = new mongoose.Schema({
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: String,
  phone: String,
  tags: [String],
});

module.exports = mongoose.model("Client", clientSchema);
