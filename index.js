import express from "express";
import jwt from "jsonwebtoken";
import cors from "cors";
import path from "path";
import morgan from "morgan";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { DateTime } from "luxon";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

const PORT = process.env.PORT || 3000;
const SECRET = process.env.JWT_SECRET || "cambiame";
const __dirname = path.resolve();

mongoose.set("strictQuery", false);
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Conectado a MongoDB"))
  .catch((err) => {
    console.error("Error al conectar con MongoDB:", err);
    process.exit(1);
  });


const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  timezone: { type: String, default: "UTC" },
  locale: { type: String, default: "es-MX" },
  createdAt: { type: Date, default: () => new Date() },
  updatedAt: { type: Date, default: () => new Date() }
});
userSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});
const User = mongoose.model("User", userSchema);

const habitSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  description: { type: String, default: "" },
  frequency: { type: String, enum: ["Diario", "Semanal", "Mensual"], default: "Diario" },
  recordatorio: {
    enabled: { type: Boolean, default: false },
    time: { type: String, default: "08:00" }
  },
  icon: { type: String, default: "" },
  motivation: { type: String, default: "" },
  archived: { type: Boolean, default: false },
  createdAt: { type: Date, default: () => new Date() },
  updatedAt: { type: Date, default: () => new Date() }
});
habitSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});
const Habit = mongoose.model("Habit", habitSchema);

const historySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  habitId: { type: mongoose.Schema.Types.ObjectId, ref: "Habit", required: true },
  date: { type: String, required: true }, // YYYY-MM-DD
  completed: { type: Boolean, default: false },
  notes: { type: String, default: "" },
  createdAt: { type: Date, default: () => new Date() },
  updatedAt: { type: Date, default: () => new Date() }
});
historySchema.index({ userId: 1, habitId: 1, date: 1 }, { unique: true });
historySchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});
const HabitHistory = mongoose.model("HabitHistory", historySchema);

const reportSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: String, enum: ["bug", "feedback", "other"], default: "other" },
  title: { type: String, required: true },
  description: { type: String, default: "" },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  status: { type: String, enum: ["open", "closed"], default: "open" },
  handledBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  resolvedAt: { type: Date, default: null },
  createdAt: { type: Date, default: () => new Date() },
  updatedAt: { type: Date, default: () => new Date() }
});

reportSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

// índices útiles
reportSchema.index({ userId: 1, status: 1 });
reportSchema.index({ createdAt: -1 });

const Report = mongoose.model("Report", reportSchema);


function todayISOForTimezone(timezone) {
  return DateTime.now().setZone(timezone || "UTC").toISODate();
}

/**
 * AUTH
 */

// POST /auth/signup
app.post("/auth/signup", async (req, res) => {
  const { nombre, correo, contraseña, timezone, locale } = req.body;
  if (!nombre || !correo || !contraseña) return res.status(400).json({ message: "Todos los campos son obligatorios" });

  const exists = await User.findOne({ email: correo });
  if (exists) return res.status(400).json({ message: "El usuario ya existe" });

  // Nota: contraseña en texto plano
  const user = new User({
    name: nombre,
    email: correo,
    password: contraseña,
    timezone: timezone || "UTC",
    locale: locale || "es-MX"
  });
  await user.save();

  res.status(201).json({ message: "Usuario registrado con éxito" });
});

// POST /auth/login
app.post("/auth/login", async (req, res) => {
  const { correo, contraseña } = req.body;
  if (!correo || !contraseña) return res.status(400).json({ message: "Correo y contraseña son requeridos" });

  const user = await User.findOne({ email: correo });
  if (!user || user.password !== contraseña) return res.status(400).json({ message: "Credenciales inválidas" });

  const token = jwt.sign({ id: user._id.toString() }, SECRET, { expiresIn: "8h" });

  res.json({
    token,
    usuario: {
      id: user._id,
      nombre: user.name,
      correo: user.email,
      timezone: user.timezone
    }
  });
});

/**
 * authMiddleware (carga el user en req.user)
 */
async function authMiddleware(req, res, next) {
  const header = req.headers["authorization"];
  if (!header) return res.status(401).json({ message: "Token requerido" });
  const parts = header.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") return res.status(401).json({ message: "Formato de token inválido" });

  const token = parts[1];
  const decoded = jwt.verify(token, SECRET); // si token inválido -> error lanzado y manejado por express-async-errors
  const user = await User.findById(decoded.id);
  if (!user) return res.status(401).json({ message: "Usuario no encontrado" });
  req.user = user;
  next();
}

/**
 * USERS
 */
app.get("/api/users/me", authMiddleware, async (req, res) => {
  const u = req.user;
  res.json({
    id: u._id,
    name: u.name,
    email: u.email,
    timezone: u.timezone,
    locale: u.locale,
    createdAt: u.createdAt
  });
});

app.put("/api/users/me", authMiddleware, async (req, res) => {
  const { name, timezone, locale } = req.body;
  const u = req.user;
  if (name) u.name = name;
  if (timezone) u.timezone = timezone;
  if (locale) u.locale = locale;
  await u.save();
  res.json({ message: "Perfil actualizado", user: { id: u._id, name: u.name, timezone: u.timezone, locale: u.locale } });
});

/**
 * HABITS
 */
app.get("/api/habits", authMiddleware, async (req, res) => {
  const habits = await Habit.find({ userId: req.user._id, archived: false }).sort({ createdAt: -1 });
  res.json(habits);
});

app.post("/api/habits", authMiddleware, async (req, res) => {
  const { title, description, frequency, recordatorio, icon, motivation } = req.body;
  if (!title) return res.status(400).json({ message: "title es requerido" });

  const h = new Habit({
    userId: req.user._id,
    title,
    description: description || "",
    frequency: ["Diario", "Semanal", "Mensual"].includes(frequency) ? frequency : "Diario",
    recordatorio: recordatorio || { enabled: false, time: "08:00" },
    icon: icon || "",
    motivation: motivation || ""
  });
  await h.save();
  res.status(201).json(h);
});

app.put("/api/habits/:id", authMiddleware, async (req, res) => {
  const id = req.params.id;
  const updates = req.body;
  const habit = await Habit.findOne({ _id: id, userId: req.user._id });
  if (!habit) return res.status(404).json({ message: "Hábito no encontrado" });

  const allowed = ["title", "description", "frequency", "recordatorio", "icon", "motivation", "archived"];
  for (const k of allowed) {
    if (k in updates) habit[k] = updates[k];
  }
  await habit.save();
  res.json(habit);
});

app.delete("/api/habits/:id", authMiddleware, async (req, res) => {
  const id = req.params.id;
  const habit = await Habit.findOne({ _id: id, userId: req.user._id });
  if (!habit) return res.status(404).json({ message: "Hábito no encontrado" });
  habit.archived = true;
  await habit.save();
  res.status(204).send();
});

/**
 * HABIT-HISTORY
 */
app.get("/api/habit-history", authMiddleware, async (req, res) => {
  const { start, end } = req.query;
  if (!start || !end) return res.status(400).json({ message: "start y end son requeridos" });

  const histories = await HabitHistory.find({
    userId: req.user._id,
    date: { $gte: start, $lte: end }
  }).lean();

  res.json(histories);
});

app.post("/api/habit-history", authMiddleware, async (req, res) => {
  const { habitId, date, completed, notes } = req.body;
  if (!habitId || !date) return res.status(400).json({ message: "habitId y date son requeridos" });

  const habit = await Habit.findOne({ _id: habitId, userId: req.user._id, archived: false });
  if (!habit) return res.status(404).json({ message: "Hábito no encontrado" });

  const filter = { userId: req.user._id, habitId: habitId, date };
  const update = { $set: { completed: !!completed, notes: notes || "", updatedAt: new Date() }, $setOnInsert: { createdAt: new Date() } };
  const opts = { upsert: true, new: true };

  const doc = await HabitHistory.findOneAndUpdate(filter, update, opts);
  res.json(doc);
});

app.delete("/api/habit-history/:id", authMiddleware, async (req, res) => {
  const id = req.params.id;
  const doc = await HabitHistory.findOne({ _id: id, userId: req.user._id });
  if (!doc) return res.status(404).json({ message: "Registro no encontrado" });
  await doc.deleteOne();
  res.status(204).send();
});

/**
 * DASHBOARD
 */
app.get("/api/dashboard", authMiddleware, async (req, res) => {
  const user = req.user;
  const tz = user.timezone || "UTC";
  const todayISO = todayISOForTimezone(tz);

  const habits = await Habit.find({ userId: user._id, archived: false }).lean();
  const totalHabits = habits.length;

  const completedTodayDocs = await HabitHistory.find({ userId: user._id, date: todayISO, completed: true }).lean();
  const habitsCompletedToday = completedTodayDocs.length;
  const percentageToday = totalHabits > 0 ? Math.round((habitsCompletedToday / totalHabits) * 100) : 0;

  const doneSet = new Set(completedTodayDocs.map((d) => d.habitId.toString()));
  const remainingHabits = habits.filter((h) => !doneSet.has(h._id.toString())).map((h) => h.title);

  let streak = 0;
  for (let i = 0; i < 365; i++) {
    const d = DateTime.now().setZone(tz).minus({ days: i }).toISODate();
    const any = await HabitHistory.exists({ userId: user._id, date: d, completed: true });
    if (any) streak++;
    else break;
  }

  let message = "Sigue así";
  if (percentageToday >= 80) message = "¡Excelente! Tu constancia está sólida.";
  else if (percentageToday >= 50) message = "Vas bien, hay margen de mejora.";
  else message = "Pequeños pasos diarios suman mucho.";

  res.json({
    name: user.name.split(" ")[0] || user.name,
    totalHabits,
    habitsCompletedToday,
    percentageToday,
    remainingHabits,
    streak,
    message
  });
});

/**
 * STATS
 */
app.get("/api/stats/week", authMiddleware, async (req, res) => {
  const user = req.user;
  const tz = user.timezone || "UTC";

  let mondayISO = req.query.monday;
  if (!mondayISO) {
    mondayISO = DateTime.now().setZone(tz).startOf("week").toISODate();
  }

  const days = Array.from({ length: 7 }).map((_, i) => DateTime.fromISO(mondayISO, { zone: tz }).plus({ days: i }).toISODate());
  const habits = await Habit.find({ userId: user._id, archived: false }).lean();
  const totalHabits = habits.length;

  const porDia = [];
  for (const d of days) {
    const countCompleted = await HabitHistory.countDocuments({ userId: user._id, date: d, completed: true });
    const pct = totalHabits > 0 ? Math.round((countCompleted / totalHabits) * 100) : 0;
    porDia.push({ date: d, weekdayName: DateTime.fromISO(d, { zone: tz }).toFormat("cccc"), percentage: pct });
  }

  const progresoGeneral = porDia.reduce((a, b) => a + b.percentage, 0) / porDia.length || 0;
  const promedioDiario = porDia.reduce((a, b) => a + Math.round((b.percentage / 100) * totalHabits), 0) / porDia.length || 0;

  res.json({ porDia, progresoGeneral: Math.round(progresoGeneral), promedioDiario: Math.round(promedioDiario) });
});

app.get("/api/stats/month", authMiddleware, async (req, res) => {
  const user = req.user;
  const tz = user.timezone || "UTC";
  const startISO = req.query.start || DateTime.now().setZone(tz).startOf("week").toISODate();

  const startMonday = DateTime.fromISO(startISO, { zone: tz }).startOf("week");
  const semanas = [];
  for (let i = 0; i < 4; i++) {
    const monday = startMonday.plus({ weeks: i });
    const days = Array.from({ length: 7 }).map((_, j) => monday.plus({ days: j }).toISODate());
    const totalHabits = await Habit.countDocuments({ userId: user._id, archived: false });
    let sumaPct = 0;
    for (const d of days) {
      const comp = await HabitHistory.countDocuments({ userId: user._id, date: d, completed: true });
      const pct = totalHabits > 0 ? Math.round((comp / totalHabits) * 100) : 0;
      sumaPct += pct;
    }
    const semanaPct = Math.round(sumaPct / 7);
    semanas.push({ etiqueta: `Semana ${i + 1}`, porcentaje: semanaPct });
  }

  res.json(semanas);
});

/**
 * REPORTS
 */
app.post("/api/reports", authMiddleware, async (req, res) => {
  const { type, title, description, metadata } = req.body;
  if (!title) return res.status(400).json({ message: "title es requerido" });

  const r = new Report({
    userId: req.user._id,
    type: ["bug", "feedback", "other"].includes(type) ? type : "other",
    title,
    description: description || "",
    metadata: metadata || {}
  });

  await r.save();
  res.status(201).json(r);
});

app.get("/api/reports", authMiddleware, async (req, res) => {
  const limit = Math.min(100, parseInt(req.query.limit || "50", 10));
  const reports = await Report.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(limit).lean();
  res.json(reports);
});


app.get("/api/reports/:id", authMiddleware, async (req, res) => {
  const id = req.params.id;
  const rpt = await Report.findById(id).lean();
  if (!rpt) return res.status(404).json({ message: "Reporte no encontrado" });
  if (rpt.userId.toString() !== req.user._id.toString()) return res.status(403).json({ message: "Acceso denegado" });
  res.json(rpt);
});


app.patch("/api/reports/:id", authMiddleware, async (req, res) => {
  const id = req.params.id;
  const updates = req.body;
  const rpt = await Report.findById(id);
  if (!rpt) return res.status(404).json({ message: "Reporte no encontrado" });
  if (rpt.userId.toString() !== req.user._id.toString()) return res.status(403).json({ message: "Acceso denegado" });

  const allowed = ["title", "description", "metadata", "status"];
  for (const k of allowed) {
    if (k in updates) rpt[k] = updates[k];
  }

  if (updates.status === "closed") {
    rpt.resolvedAt = new Date();
    rpt.handledBy = req.user._id;
  }

  await rpt.save();
  res.json(rpt);
});

app.delete("/api/reports/:id", authMiddleware, async (req, res) => {
  const id = req.params.id;
  const rpt = await Report.findById(id);
  if (!rpt) return res.status(404).json({ message: "Reporte no encontrado" });
  if (rpt.userId.toString() !== req.user._id.toString()) return res.status(403).json({ message: "Acceso denegado" });
  await rpt.deleteOne();
  res.status(204).send();
});


// Servir archivos estáticos de React
app.use(express.static(path.join(__dirname, "dist")));

// Catch-all: para cualquier ruta que no sea un archivo estático
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

/**
 * Error handler 
 */
app.use((err, req, res, next) => {
  console.error("ERROR:", err);

  // Si el error viene de JWT (token expirado o inválido)
  if (err.name === "TokenExpiredError") {
    return res.status(403).json({ message: "Token expirado" });
  }
  if (err.name === "JsonWebTokenError") {
    return res.status(403).json({ message: "Token inválido" });
  }

  // Si el error tiene un código de estado definido (por ejemplo, lanzado manualmente)
  if (err.status) {
    return res.status(err.status).json({ message: err.message || "Error" });
  }

  // Si es un error de validación 
  if (err.name === "ValidationError") {
    return res.status(400).json({ message: "Datos inválidos", details: err.errors });
  }

  // Error interno genérico
  res.status(500).json({ message: "Error interno del servidor" });
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
