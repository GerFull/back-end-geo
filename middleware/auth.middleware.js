const jwt = require("jsonwebtoken");
const SECRET = "ACCESS_SECRET_KEY";

module.exports = function (req, res, next) {



  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "No token" });

  const token = authHeader.split(" ")[1];
  try {
    const payload = jwt.verify(token, SECRET);
    req.userId = payload.userId;
    next();
  } catch (e) {
    res.status(401).json({ message: "Invalid token" });
  }
};