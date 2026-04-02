import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import cron from 'node-cron';

// Load env vars
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const allowedOrigins = [
  'https://onemorefit.netlify.app',
  'http://localhost:3000',
  'http://localhost:5173',
];
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));
app.use(express.json());

// ------------------------------------------------------------------
// MongoDB Connection
// ------------------------------------------------------------------
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
  password: { type: String },
  name: { type: String },
  blocked: { type: Boolean, default: false },
  subscriptionEndDate: { type: String, default: null }, // Format: 'YYYY-MM-DD'
}, { timestamps: true });

const reservationSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  userEmail: { type: String, required: true },
  classId: { type: String, required: true },
  timestamp: { type: Number, required: true }
}, { timestamps: true });

const waitlistSchema = new mongoose.Schema({
  userEmail: { type: String, required: true },
  classId: { type: String, required: true }
}, { timestamps: true });

const gymClassSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  type: { type: String, required: true },
  day: { type: String, required: true },
  time: { type: String, required: true },
  capacity: { type: Number, required: true }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
const Reservation = mongoose.model('Reservation', reservationSchema);
const Waitlist = mongoose.model('Waitlist', waitlistSchema);
const GymClass = mongoose.model('GymClass', gymClassSchema);

// ------------------------------------------------------------------
// Email Service (Nodemailer + Gmail)
// ------------------------------------------------------------------
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false
  }
});

const sendSubscriptionReminderEmail = async (memberEmail, memberName, expiryDate) => {
  const formattedDate = new Date(expiryDate).toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const mailOptions = {
    from: `"One More Fit +" <${process.env.GMAIL_USER}>`,
    to: memberEmail,
    subject: '⚠️ Votre abonnement One More Fit + expire demain !',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { margin: 0; padding: 0; background-color: #09090b; font-family: Arial, sans-serif; }
          .container { max-width: 600px; margin: 0 auto; background-color: #18181b; border: 1px solid #27272a; border-radius: 16px; overflow: hidden; }
          .header { background: linear-gradient(135deg, #eab308 0%, #ca8a04 100%); padding: 40px 32px; text-align: center; }
          .header h1 { color: #000; font-size: 28px; font-weight: 900; text-transform: uppercase; margin: 0; letter-spacing: -1px; }
          .header p { color: #000; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 3px; margin: 8px 0 0; opacity: 0.7; }
          .body { padding: 40px 32px; }
          .greeting { color: #ffffff; font-size: 20px; font-weight: 700; margin-bottom: 16px; }
          .message { color: #a1a1aa; font-size: 15px; line-height: 1.7; margin-bottom: 24px; }
          .alert-box { background: linear-gradient(135deg, rgba(234,179,8,0.15) 0%, rgba(234,179,8,0.05) 100%); border: 1px solid rgba(234,179,8,0.4); border-radius: 12px; padding: 24px; margin: 24px 0; text-align: center; }
          .alert-box .date { color: #eab308; font-size: 22px; font-weight: 900; text-transform: uppercase; }
          .alert-box .label { color: #a1a1aa; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 8px; }
          .cta-button { display: inline-block; background-color: #eab308; color: #000; font-size: 13px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; padding: 16px 32px; border-radius: 10px; text-decoration: none; margin: 16px 0; }
          .divider { border: none; border-top: 1px solid #27272a; margin: 32px 0; }
          .footer { color: #52525b; font-size: 11px; text-align: center; padding: 0 32px 32px; line-height: 1.8; }
          .footer strong { color: #71717a; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>One More <span>+</span> Fit</h1>
            <p>Est. 2026 — Beni Khalled, Tunisia</p>
          </div>
          <div class="body">
            <p class="greeting">Bonjour ${memberName || memberEmail.split('@')[0]} 👋</p>
            <p class="message">
              Nous espérons que vous profitez pleinement de votre expérience chez <strong style="color:#fff">One More Fit +</strong>.<br><br>
              Nous vous informons que votre abonnement arrive à <strong style="color:#eab308">expiration demain</strong>. Pour continuer à accéder à tous nos cours et équipements sans interruption, pensez à renouveler votre abonnement.
            </p>

            <div class="alert-box">
              <p class="label">Date d'expiration</p>
              <p class="date">${formattedDate}</p>
            </div>

            <p class="message">
              Pour renouveler votre abonnement, rendez-vous directement à la salle ou contactez-nous :
            </p>

            <div style="text-align:center;">
              <a href="mailto:onemorefitnes80@gmail.com" class="cta-button">Contacter la salle</a>
            </div>

            <hr class="divider">

            <p class="message" style="font-size:13px;">
              Si vous avez déjà renouvelé votre abonnement, ignorez ce message. Merci pour votre fidélité !
            </p>
          </div>
          <div class="footer">
            <strong>One More Fit +</strong><br>
            Beni Khalled, Tunisia, 8021<br>
            +216 29 248 405 · onemorefitnes80@gmail.com<br><br>
            Cet email a été envoyé automatiquement. Merci de ne pas y répondre directement.
          </div>
        </div>
      </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
  console.log(`📧 Email de rappel envoyé à ${memberEmail}`);
};

// ------------------------------------------------------------------
// Cron Job — Vérification quotidienne à 08:00
// ------------------------------------------------------------------
cron.schedule('0 8 * * *', async () => {
  console.log('🔍 [CRON] Vérification des abonnements expirant demain...');

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0]; // 'YYYY-MM-DD'

  try {
    const expiringUsers = await User.find({
      subscriptionEndDate: tomorrowStr,
      email: { $ne: 'admin@gmail.com' },
      blocked: { $ne: true },
    });

    console.log(`📋 ${expiringUsers.length} abonnement(s) expirent demain.`);

    for (const user of expiringUsers) {
      try {
        await sendSubscriptionReminderEmail(user.email, user.name, user.subscriptionEndDate);
      } catch (emailErr) {
        console.error(`❌ Échec envoi email à ${user.email}:`, emailErr.message);
      }
    }
  } catch (err) {
    console.error('❌ Erreur cron job:', err.message);
  }
}, {
  timezone: 'Africa/Tunis'
});

console.log('⏰ Cron job planifié : vérification quotidienne à 08h00 (heure de Tunis)');

// ------------------------------------------------------------------
// API Routes
// ------------------------------------------------------------------

// --- USERS ---
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users.map(u => ({
      email: u.email,
      password: u.password,
      name: u.name,
      blocked: u.blocked,
      subscriptionEndDate: u.subscriptionEndDate || null,
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/users/sync', async (req, res) => {
  try {
    const users = req.body;
    console.log(`🔄 Syncing ${users.length} users...`);
    // Protect admin from being deleted during sync if needed
    const admin = await User.findOne({ email: 'admin@gmail.com' });
    await User.deleteMany({ email: { $ne: 'admin@gmail.com' } });
    
    const usersToInsert = users.filter((u) => u.email !== 'admin@gmail.com');
    if (usersToInsert.length > 0) {
      await User.insertMany(usersToInsert);
    }
    console.log(`✅ Users synchronized (Admin preserved, ${usersToInsert.length} others)`);
    res.json({ message: 'Users synchronized (Admin preserved)' });
  } catch (err) {
    console.error('❌ Sync error users:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// PUT — Mettre à jour l'abonnement d'un membre
app.put('/api/users/:email/subscription', async (req, res) => {
  try {
    const { email } = req.params;
    const { subscriptionEndDate } = req.body;

    const updated = await User.findOneAndUpdate(
      { email },
      { subscriptionEndDate },
      { new: true }
    );

    if (!updated) return res.status(404).json({ error: 'Utilisateur introuvable' });

    res.json({
      email: updated.email,
      name: updated.name,
      blocked: updated.blocked,
      subscriptionEndDate: updated.subscriptionEndDate,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST — Test d'envoi d'email manuel (Admin uniquement)
app.post('/api/send-reminder/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'Utilisateur introuvable' });
    if (!user.subscriptionEndDate) return res.status(400).json({ error: 'Aucune date d\'abonnement définie' });

    await sendSubscriptionReminderEmail(user.email, user.name, user.subscriptionEndDate);
    res.json({ message: `Email envoyé à ${user.email}` });
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
    console.log(`🔄 Syncing ${reservations.length} reservations...`);
    await Reservation.deleteMany({});
    if (reservations.length > 0) {
      await Reservation.insertMany(reservations);
    }
    console.log(`✅ Reservations synchronized`);
    res.json({ message: 'Reservations synchronized' });
  } catch (err) {
    console.error('❌ Sync error reservations:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// DELETE — Annuler une réservation
app.delete('/api/reservations/:reservationId', async (req, res) => {
  try {
    const { reservationId } = req.params;
    const { userEmail } = req.body;

    // Trouver la réservation
    const reservation = await Reservation.findOne({ id: reservationId });
    if (!reservation) {
      return res.status(404).json({ error: 'Réservation introuvable' });
    }

    // Vérifier que c'est bien l'utilisateur qui a fait la réservation
    if (reservation.userEmail !== userEmail) {
      return res.status(403).json({ error: 'Non autorisé' });
    }

    // Récupérer la classe pour vérifier l'heure
    const gymClass = await GymClass.findOne({ id: reservation.classId });
    if (!gymClass) {
      return res.status(404).json({ error: 'Cours introuvable' });
    }

    // Vérifier que le cours n'a pas commencé
    const now = new Date();
    const [hours, minutes] = gymClass.time.split(':').map(Number);
    const classStart = new Date();
    classStart.setHours(hours, minutes, 0, 0);

    // Convert day name to check if it's today
    const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    const todayIndex = now.getDay();
    const todayName = days[todayIndex];

    // Si c'est aujourd'hui et le cours a déjà commencé, refuser l'annulation
    if (gymClass.day === todayName && now >= classStart) {
      return res.status(400).json({ error: 'Impossible d\'annuler : le cours a déjà commencé' });
    }

    // Supprimer la réservation
    await Reservation.deleteOne({ id: reservationId });
    console.log(`❌ Réservation annulée : ${reservationId}`);

    // Vérifier et promouvoir quelqu'un de la waitlist si elle existe
    const firstWaitlist = await Waitlist.findOne({ classId: reservation.classId });
    if (firstWaitlist) {
      // Supprimer de la waitlist
      await Waitlist.deleteOne({ _id: firstWaitlist._id });
      
      // Créer une nouvelle réservation pour cette personne
      const newReservation = new Reservation({
        id: Math.random().toString(36).substr(2, 9),
        userEmail: firstWaitlist.userEmail,
        classId: reservation.classId,
        timestamp: Date.now()
      });
      await newReservation.save();
      console.log(`✅ Membre de la waitlist promu : ${firstWaitlist.userEmail}`);
    }

    res.json({ message: 'Réservation annulée avec succès' });
  } catch (err) {
    console.error('❌ Erreur annulation:', err.message);
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
    console.log(`🔄 Syncing ${waitlists.length} waitlist entries...`);
    await Waitlist.deleteMany({});
    if (waitlists.length > 0) {
      await Waitlist.insertMany(waitlists);
    }
    console.log(`✅ Waitlist synchronized`);
    res.json({ message: 'Waitlist synchronized' });
  } catch (err) {
    console.error('❌ Sync error waitlist:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// --- GYM CLASSES ---
app.get('/api/classes', async (req, res) => {
  try {
    const classes = await GymClass.find();
    res.json(classes.map(c => ({
      id: c.id,
      name: c.name,
      type: c.type,
      day: c.day,
      time: c.time,
      capacity: c.capacity
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/classes/sync', async (req, res) => {
  try {
    const classes = req.body;
    console.log(`🔄 Syncing ${classes.length} classes...`);
    await GymClass.deleteMany({});
    if (classes.length > 0) {
      await GymClass.insertMany(classes);
    }
    console.log(`✅ Classes synchronized`);
    res.json({ message: 'Classes synchronized' });
  } catch (err) {
    console.error('❌ Sync error classes:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Start Server
app.listen(PORT, async () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  
  // Seed admin if not exists
  try {
    const admin = await User.findOne({ email: 'admin@gmail.com' });
    if (!admin) {
      await User.create({
        email: 'admin@gmail.com',
        password: '12345678',
        name: 'Administrateur'
      });
      console.log('👑 Admin user seeded');
    }
  } catch (err) {
    console.error('Failed to seed admin:', err);
  }
});
