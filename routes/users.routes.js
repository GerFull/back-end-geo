const router = require("express").Router();
const knex = require("../db/knex");
const auth = require("../middleware/auth.middleware");

// UPDATE user
router.patch("/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { email, info, likes } = req.body;

    const updateData = {};

    if (email) updateData.email = email;
    if (info) updateData.info = JSON.stringify(info);
    if (likes) updateData.likes = JSON.stringify(likes);

    if (!Object.keys(updateData).length) {
      return res.status(400).json({ message: "Nothing to update" });
    }

    const updated = await knex("users").where({ id }).update(updateData);

    if (!updated) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = await knex("users")
      .select("id", "email", "info", "likes")
      .where({ id })
      .first();

    res.json({
      ...user,
      info: user.info ? JSON.parse(user.info) : {},
      likes: user.likes ? JSON.parse(user.likes) : []
    });
  } catch (e) {
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE user
router.delete("/:id", auth, async (req, res) => {
  const deleted = await knex("users").where({ id: req.params.id }).del();
  if (!deleted) {
    return res.status(404).json({ message: "User not found" });
  }
  res.json({ success: true });
});

module.exports = router;
