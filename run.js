const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const User = require("./models/user");

dotenv.config();

async function insertAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const existing = await User.findOne({ email: "admin@example.com" });
    if (existing) {
      console.log("⚠️ Admin already exists.");
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash("admin123", 10);

    const admin = new User({
      name: "Admin",
      email: "admin@example.com",
      password: hashedPassword,
      role: "admin",
    });

    await admin.save();
    console.log("✅ Admin inserted successfully.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error inserting admin:", err);
    process.exit(1);
  }
}

insertAdmin();
