import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load env vars
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('✅ Connected to MongoDB');
}).catch((err) => {
  console.error('❌ MongoDB Connection Error:', err);
});

// ------------------------------------------------------------------
// Models
// ------------------------------------------------------------------

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String }, // NEW FIELD
  name: { type: String },
  blocked: { type: Boolean, default: false }
}, { timestamps: true });

const reservationSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true }, // custom frontend id
  userEmail: { type: String, required: true },
  classId: { type: String, required: true },
  timestamp: { type: Number, required: true }
}, { timestamps: true });

const waitlistSchema = new mongoose.Schema({
  userEmail: { type: String, required: true },
  classId: { type: String, required: true }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
const Reservation = mongoose.model('Reservation', reservationSchema);
const Waitlist = mongoose.model('Waitlist', waitlistSchema);

// ------------------------------------------------------------------
// API Routes
// ------------------------------------------------------------------

// --- USERS ---
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find();
    // Return objects mapping to frontend User type
    res.json(users.map(u => ({ email: u.email, password: u.password, name: u.name, blocked: u.blocked })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const { email, name, blocked } = req.body;
    
    // Upsert user
    const updatedUser = await User.findOneAndUpdate(
      { email },
      { email, name, blocked },
      { new: true, upsert: true }
    );
    
    res.json({ email: updatedUser.email, name: updatedUser.name, blocked: updatedUser.blocked });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/users/sync', async (req, res) => {
    try {
      const users = req.body; // Expects an array of users
      // Clear out old records or intelligently upsert (for simplicity replacing all here is easier if it's full sync)
      await User.deleteMany({});
      await User.insertMany(users);
      res.json({ message: "Users synchronized" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
});


// --- RESERVATIONS ---
app.get('/api/reservations', async (req, res) => {
  try {
    const reservations = await Reservation.find();
    res.json(reservations.map(r => ({ id: r.id, userEmail: r.userEmail, classId: r.classId, timestamp: r.timestamp })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/reservations/sync', async (req, res) => {
  try {
    const reservations = req.body;
    await Reservation.deleteMany({});
    if (reservations.length > 0) {
      await Reservation.insertMany(reservations);
    }
    res.json({ message: "Reservations synchronized" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// --- WAITLIST ---
app.get('/api/waitlist', async (req, res) => {
  try {
    const waitlists = await Waitlist.find();
    res.json(waitlists.map(w => ({ userEmail: w.userEmail, classId: w.classId })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/waitlist/sync', async (req, res) => {
  try {
    const waitlists = req.body;
    await Waitlist.deleteMany({});
     if (waitlists.length > 0) {
        await Waitlist.insertMany(waitlists);
     }
    res.json({ message: "Waitlist synchronized" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
