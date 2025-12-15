const jwt = require("jsonwebtoken");

const SECRET = "SUPER_SECRET_KEY";

module.exports = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header) return res.sendStatus(401);

  const token = header.split(" ")[1];

  try {
    const decoded = jwt.verify(token, SECRET);
    req.userId = decoded.userId;
    next();
  } catch {
    res.sendStatus(401);
  }
};
