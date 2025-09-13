export type Memorial = {
  id: string;
  name: string;
  description?: string;   // ✅ use description, not message
  image?: string;
  createdAt?: string;     // ✅ use createdAt, not date
  createdBy?: string;
};
