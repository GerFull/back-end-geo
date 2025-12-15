const router = require("express").Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const knex = require("../db/knex");
const auth = require("../middleware/auth.middleware");

const SECRET = "SUPER_SECRET_KEY";

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
  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign(
    { userId: user.id },
    SECRET,
    { expiresIn: "7d" }
  );

  res.json({ token });
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
