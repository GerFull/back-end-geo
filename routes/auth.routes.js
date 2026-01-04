const router = require("express").Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const knex = require("../db/knex");
const auth = require("../middleware/auth.middleware");
const logger = require("../utils/logger");

const SECRET = "SUPER_SECRET_KEY";
const REFRESH_SECRET = "REFRESH_SECRET_KEY";

/**
 * REGISTER
 */
router.post("/register", async (req, res) => {
  const { email, password } = req.body;

  const exists = await knex("users").where({ email }).first();
  if (exists) {
    return res.status(400).json({ message: "User already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const [id] = await knex("users").insert({
    email,
    password: hashedPassword
  });

  res.json({ id, email });
});

/**
 * LOGIN
 */
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await knex("users").where({ email }).first();
  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ message: "Invalid credentials" });

  // Создаём access token (короткий)
  const accessToken = jwt.sign({ userId: user.id }, SECRET, { expiresIn: "1d" });
  // Создаём refresh token (долго живущий)
  const refreshToken = jwt.sign({ userId: user.id }, REFRESH_SECRET, { expiresIn: "7d" });

  // Отправляем refresh token в HttpOnly cookie
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: false, // true если HTTPS
    sameSite: "Strict",
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 дней
  });

  logger.info(`User ${user.id} logged in`);
  console.log(accessToken)
  res.json({ accessToken });
});

/**
 * REFRESH TOKEN
 */
router.post("/refresh-token", (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.status(401).json({ message: "No refresh token" });

  try {
    const payload = jwt.verify(token, REFRESH_SECRET);
    const accessToken = jwt.sign({ userId: payload.userId }, SECRET, { expiresIn: "15m" });
    res.json({ accessToken });
  } catch (e) {
    res.status(401).json({ message: "Invalid refresh token" });
  }
});

/**
 * LOGOUT
 */
router.post("/logout", (req, res) => {
  res.clearCookie("refreshToken");
  res.json({ message: "Logged out" });
});


/**
 * PROFILE (protected)
 */
router.get("/profile", auth, async (req, res) => {

  const user = await knex("users")
    .select("id", "email","info","likes")
    .where({ id: req.userId })
    .first();

  res.json(user);
});

module.exports = router;
