// server.ts
import cors from "cors";
import express from "express";
import morgan from "morgan";
import { errorHandler } from "./src/middleware/errorHandler";
import router from "./src/routes";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// ✅ FIXED: Mount routes under /api
app.use("/api", router);

// Health check
app.get("/ping", (_req, res) => {
  res.json({ message: "pong" });
});

// Global error handler
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
