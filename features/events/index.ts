export { default as EventCard } from "./components/EventCard";
export * from "./services/eventService";

// Re-export types from shared/types
export type { Event } from "@/types/events"; // 👈 fixed
