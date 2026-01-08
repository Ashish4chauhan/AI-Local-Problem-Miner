require('dotenv').config();

const express = require('express');
const mysql = require("mysql2");
const bcrypt = require('bcrypt');
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

app.use(express.static("public"));
app.use("/assets", express.static("assets"));


const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

db.connect(err => {
  if (err) {
    console.error("❌ DB Connection Failed:", err);
  } else {
    console.log("✅ MySQL Connected");
  }
});

/* ---------- REGISTER ---------- */
app.post("/api/register", async (req, res) => {
  const { fullName, email, password } = req.body;
  const hash = await bcrypt.hash(password, 10);

  db.query(
    "INSERT INTO users (full_name, email, password_hash) VALUES (?, ?, ?)",
    [fullName, email, hash],
    err => {
      if (err) return res.status(400).json({ error: "User exists" });
      res.json({ success: true });
    }
  );
});

/* ---------- LOGIN ---------- */
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;

  db.query(
    "SELECT * FROM users WHERE email = ?",
    [email],
    async (err, results) => {
      if (results.length === 0)
        return res.status(401).json({ error: "Invalid credentials" });

      const user = results[0];
      const match = await bcrypt.compare(password, user.password_hash);

      if (!match)
        return res.status(401).json({ error: "Invalid credentials" });

      res.json({ success: true, user: { id: user.id, name: user.full_name } });
    }
  );
});

app.listen(process.env.PORT, () =>
  console.log(`🚀 Server running on http://localhost:${process.env.PORT}`)
);
