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

    res.json({ token, user: { id: user.id, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Events Routes ---

// Get all events
app.get("/events", async (req, res) => {
  const result = await pool.query("SELECT * FROM events");
  res.json(result.rows);
});

// Get single event by id
app.get("/events/:id", async (req, res) => {
  const { id } = req.params;
  const result = await pool.query("SELECT * FROM events WHERE id=$1", [id]);
  const event = result.rows[0];

  if (!event) {
    return res.status(404).json({ error: "Event not found" });
  }

  res.json(event);
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

// Get events a user is registered to
app.get("/users/:id/events", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "SELECT event_id FROM event_users WHERE user_id=$1",
      [id]
    );
    const eventIds = result.rows.map((row) => row.event_id);
    res.json(eventIds);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Register user to an event
app.post("/events/:id/register", async (req, res) => {
  const { id } = req.params; 
  const { userId } = req.body; 
  try {
    const result = await pool.query(
      "INSERT INTO event_users (event_id, user_id) VALUES ($1, $2) ON CONFLICT (event_id, user_id) DO NOTHING RETURNING *",
      [id, userId]
    );

    if (result.rowCount === 0) {
      return res.status(400).json({ error: "User already registered for this event" });
    }

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
app.listen(PORT, "0.0.0.0", () => console.log(`Server running on port ${PORT}`));