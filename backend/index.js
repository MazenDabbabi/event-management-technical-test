require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("./db");

const app = express();
app.use(cors());
app.use(express.json());

 // REGISTER
app.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      "INSERT INTO users(email, password) VALUES($1, $2) RETURNING *",
      [email, hashedPassword]
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

 // LOGIN
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query(
      "SELECT * FROM users WHERE email=$1",
      [email]
    );

    const user = result.rows[0];

    if (!user) return res.status(400).json({ error: "User not found" });

    const valid = await bcrypt.compare(password, user.password);

    if (!valid) return res.status(400).json({ error: "Wrong password" });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);

    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(process.env.PORT, () => {
  console.log("Server running on port " + process.env.PORT);
});


// --- Events Routes ---

// Get all events
app.get("/events", async (req, res) => {
  const result = await pool.query("SELECT * FROM events");
  res.json(result.rows);
});

// Add event
app.post("/events", async (req, res) => {
  const { title, description, date } = req.body;
  const result = await pool.query(
    "INSERT INTO events (title, description, date) VALUES ($1, $2, $3) RETURNING *",
    [title, description, date]
  );
  res.json(result.rows[0]);
});

// Delete event
app.delete("/events/:id", async (req, res) => {
  const { id } = req.params;
  await pool.query("DELETE FROM events WHERE id=$1", [id]);
  res.json({ message: "Event deleted" });
});

// Get users registered to an event
app.get("/events/:id/users", async (req, res) => {
  const { id } = req.params;
  const result = await pool.query(
    `SELECT u.id, u.email
     FROM users u
     JOIN event_users eu ON u.id = eu.user_id
     WHERE eu.event_id=$1`,
    [id]
  );
  res.json(result.rows);
});

// Register user to an event
app.post("/events/:id/register", async (req, res) => {
  const { id } = req.params; 
  const { userId } = req.body; 
  try {
    await pool.query(
      "INSERT INTO event_users (event_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
      [id, userId]
    );
    res.json({ message: "User registered to event" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Test route ---
app.get("/", (req, res) => {
  res.send("Backend is running!");
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));