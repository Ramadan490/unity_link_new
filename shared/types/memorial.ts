export type Memorial = {
  id: string;
  name: string;
  description?: string; // ✅ for text tribute
  image?: string;       // ✅ profile picture or tribute image
  createdAt: string;    // ✅ so formatDate works
  createdBy: string;
};
