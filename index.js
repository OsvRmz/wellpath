import express from "express";
import jwt from "jsonwebtoken";
import cors from "cors";
import path from 'path';
import morgan from "morgan";
import User from './user.js';
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));


const PORT = process.env.PORT || 3000;
const SECRET = process.env.JWT_SECRET;
const __dirname = path.resolve();

// "Base de datos" en memoria (solo para pruebas)
const users = [];

// --- Servir imágenes públicas ---
app.use("/public", express.static(path.join(__dirname, "public")));

// --- Servir archivos estáticos de React ---
app.use(express.static(path.join(__dirname, "dist")));


/**
 * POST /auth/signup
 * body: { name, email, password }
 * response: { message }
 */
app.post("/auth/signup", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password)
    return res.status(400).json({ message: "Todos los campos son obligatorios" });

  const exists = await User.findOne({ email });
  if (exists)
    return res.status(400).json({ message: "El usuario ya existe" });

  const newUser = new User({ name, email, password });
  await newUser.save();

  return res.status(201).json({ message: "Usuario registrado con éxito" });
});

/**
 * POST /auth/login
 * body: { email, password }
 * response: { token, user }
 */
app.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;
  console.log(email, password)

  if (!email || !password)
    return res.status(400).json({ message: "Email y contraseña son requeridos" });

  const user = await User.findOne({ email });
  if (!user || user.password !== password)
    return res.status(400).json({ message: "Credenciales inválidas" });

  const token = jwt.sign(
    { id: user._id, name: user.name, email: user.email },
    SECRET,
    { expiresIn: "2h" }
  );

  res.json({
    token,
    user: {
      email: user.email,
      name: user.name
    }
  });
});


/**
 * Middleware de autenticación
 * Espera header: Authorization: Bearer <token>
 */
function authMiddleware(req, res, next) {
  const header = req.headers["authorization"];
  if (!header) return res.status(401).json({ message: "Token requerido" });

  const parts = header.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return res.status(401).json({ message: "Formato de token inválido" });
  }

  const token = parts[1];

  jwt.verify(token, SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: "Token inválido o expirado" });
    req.user = decoded; // { id, name, email }
    next();
  });
}



app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
