const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const usersRoutes = require("./routes/users.routes");

const app = express();
const PORT = 3000;

// app.options("*", cors({
//   origin: "http://localhost:5173",
//   credentials: true
// }));

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

app.use(express.json());

app.use((req,res,next) => {
    console.log(`${req.method} ${req.url} ${req.hostname}`);
    next();
})

app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);

module.exports = app;