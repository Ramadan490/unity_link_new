// src/routes/index.ts
import { Router } from "express";
import announcementsRouter from "./announcements";
import authRouter from "./auth";
import communitiesRouter from "./communities";
import eventsRouter from "./events";
import healthRouter from "./health";
import memorialsRouter from "./memorials";
import requestsRouter from "./requests";
import usersRouter from "./users";

const router = Router();

// Mount each router
router.use("/auth", authRouter);
router.use("/health", healthRouter);
router.use("/users", usersRouter);
router.use("/events", eventsRouter);
router.use("/announcements", announcementsRouter);
router.use("/requests", requestsRouter);
router.use("/memorials", memorialsRouter);
router.use("/communities", communitiesRouter);

export default router;
