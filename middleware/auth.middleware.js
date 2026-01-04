const jwt = require("jsonwebtoken");
const SECRET = "SUPER_SECRET_KEY";

module.exports = function (req, res, next) {

  // console.log(req.headers)

  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "No token" });
  // console.log(authHeader)
  const token = authHeader.split(" ")[1];
  console.log(token)
  try {
    const payload = jwt.verify(token, SECRET);
    req.userId = payload.userId;
    next();
  } catch (e) {
    res.status(401).json({ message: "Invalid token" });
  }
};