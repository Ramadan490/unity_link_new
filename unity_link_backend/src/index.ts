// src/index.ts - FIXED VERSION
import cors from "cors";
import express from "express";
import router from "./routes"; // ✅ Import the centralized router

const app = express();

// ✅ Convert PORT to number with proper fallback
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// ✅ Enable CORS
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

// ✅ Mount ALL routes at /api using the centralized router
app.use("/api", router);

// Health check
app.get("/", (req, res) => {
  res.send("✅ Unity Link backend is running");
});

// Health check at /api/health
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Server is running" });
});

// ✅ FIXED: PORT is now guaranteed to be a number
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`✅ API available at http://localhost:${PORT}/api`);
  console.log(`✅ Health check: http://localhost:${PORT}/api/health`);
});
