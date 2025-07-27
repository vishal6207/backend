const jwt = require("jsonwebtoken");

function verifyVendor(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ msg: "No token" });

  try {
    const decoded = jwt.verify(token, "SECRET123");
    if (decoded.role !== "user") return res.status(403).json({ msg: "Only vendors allowed" });
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ msg: "Invalid token" });
  }
}

module.exports = verifyVendor;
