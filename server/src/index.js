require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger");

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
});

const authRoutes = require("./routes/authRoutes");
const patientRoutes = require("./routes/patientRoutes");
const doctorRoutes = require("./routes/doctorRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");
const prescriptionRoutes = require("./routes/prescriptionRoutes");
const pharmacyRoutes = require("./routes/pharmacyRoutes");
const adminRoutes = require("./routes/adminRoutes");
const chatRoutes = require("./routes/chatRoutes");

const prisma = new PrismaClient();
const app = express();

const path = require("path");
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "../public/uploads")));

// Swagger UI — http://localhost:5002/api/docs
app.use(
  "/api/docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customSiteTitle: "MediTrack API Docs",
    customCss: `
      .swagger-ui .topbar { background: linear-gradient(135deg, #1B3A6B 0%, #20C9A8 100%); }
      .swagger-ui .topbar-wrapper img { content: url('/logo.jpeg'); height: 36px; }
    `,
    swaggerOptions: { persistAuthorization: true },
  }),
);

// Raw OpenAPI JSON
app.get("/api/docs.json", (req, res) => res.json(swaggerSpec));

// API Status Route
app.get("/api/status", (req, res) => {
  res.json({ status: "active", message: "MediTrack Backend Engine Running" });
});

// Mount Routes
app.use("/api/auth", authRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/prescriptions", prescriptionRoutes);
app.use("/api/pharmacy", pharmacyRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/chat", chatRoutes);

const PORT = 5002;
const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`Backend Server running on http://localhost:${PORT}`);
});

// Force keep-alive for the event loop on Windows environments where it might prematurely exit
setInterval(() => {
  if (!server.listening) {
    console.error("SERVER STOPPED LISTENING - RESTARTING...");
    process.exit(1);
  }
}, 10000);
