require("dotenv").config();

const express = require("express");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const cors = require("cors");
const path = require("path");

const app = express();

/* ---------------- MIDDLEWARE ---------------- */
app.use(cors({ origin: "*" })); 
app.use(express.json());
app.use(express.urlencoded({ extended: true })); 

/* ---------------- STATIC FILES ---------------- */
app.use(express.static(path.join(__dirname, "public")));
app.use("/assets", express.static(path.join(__dirname, "assets")));

/* ---------------- DATABASE ---------------- */
const db = mysql.createConnection({
  uri: process.env.MYSQL_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

db.connect(err => {
  if (err) {
    console.error("❌ DB Connection Failed:", err.message);
  } else {
    console.log("✅ MySQL Connected");
  }
});
/* ---------------- REGISTER ---------------- */
app.post("/api/register", async (req, res) => {
  const { fullName, email, password } = req.body;

  if (!fullName || !email || !password) {
    return res.status(400).json({ error: "Missing fields" });
  }

  const hash = await bcrypt.hash(password, 10);

  db.query(
    "INSERT INTO users (full_name, email, password_hash) VALUES (?, ?, ?)",
    [fullName, email, hash],
    err => {
      if (err) {
        if (err.code === "ER_DUP_ENTRY") {
          return res.status(409).json({ error: "User already exists" });
        }
        return res.status(500).json({ error: "Database error" });
      }
      res.json({ success: true });
    }
  );
});

/* ---------------- LOGIN ---------------- */
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;

  db.query(
    "SELECT * FROM users WHERE email = ?",
    [email],
    async (err, results) => {
      if (err) return res.status(500).json({ error: "Database error" });

      if (results.length === 0) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const user = results[0];
      const match = await bcrypt.compare(password, user.password_hash);

      if (!match) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      res.json({
        success: true,
        user: {
          id: user.id,
          name: user.full_name,
          email: user.email
        }
      });
    }
  );
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

/* ---------------- FRONTEND FALLBACK ---------------- */
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

/* ---------------- SERVER ---------------- */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
