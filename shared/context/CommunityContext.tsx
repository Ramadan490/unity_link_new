// context/CommunityContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";

// Define the shape of community data
export type CommunityData = {
  announcements: number;
  events: number;
  requests: number;
};

// Context with default null
const CommunityContext = createContext<CommunityData | null>(null);

// Provider
export function CommunityProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<CommunityData>({
    announcements: 0,
    events: 0,
    requests: 0,
  });

  // Example: replace with API calls
  const fetchCommunityData = async () => {
    try {
      // TODO: Replace with real services
      // e.g. const anns = await getAnnouncements();
      // e.g. const evts = await getEvents();
      // e.g. const reqs = await getRequests();

      setData({
        announcements: Math.floor(Math.random() * 5), // 🔥 demo
        events: Math.floor(Math.random() * 3),
        requests: Math.floor(Math.random() * 4),
      });
    } catch (err) {
      console.error("⚠️ Failed to fetch community data", err);
    }
  };

  useEffect(() => {
    fetchCommunityData(); // initial fetch
    const interval = setInterval(fetchCommunityData, 10000); // every 10s
    return () => clearInterval(interval);
  }, []);

  return (
    <CommunityContext.Provider value={data}>
      {children}
    </CommunityContext.Provider>
  );
}

// Hook for consuming
export function useCommunity() {
  const ctx = useContext(CommunityContext);
  if (!ctx) {
    throw new Error("useCommunity must be used inside a CommunityProvider");
  }
  return ctx;
}
