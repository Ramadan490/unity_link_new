// utils/mockApi.ts
export interface User {
  id: number;
  name: string;
  email: string;
  role: 'member' | 'board' | 'superadmin';
  avatar?: string;
}

export interface Memorial {
  id: number;
  title: string;
  description: string;
  date: string;
  location: string;
}

export interface Request {
  id: number;
  type: 'maintenance' | 'complaint' | 'suggestion' | 'other';
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'rejected';
  createdAt: string;
}

export interface Announcement {
  id: number;
  title: string;
  content: string;
  author: string;
  date: string;
  category: string;
}

export interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  rsvpCount: number;
}

export const mockData = {
  '/users': [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'member', avatar: 'https://i.pravatar.cc/150?u=john' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'board', avatar: 'https://i.pravatar.cc/150?u=jane' },
    { id: 3, name: 'Admin User', email: 'admin@example.com', role: 'superadmin', avatar: 'https://i.pravatar.cc/150?u=admin' },
    { id: 4, name: 'Bob Wilson', email: 'bob@example.com', role: 'member', avatar: 'https://i.pravatar.cc/150?u=bob' },
    { id: 5, name: 'Alice Johnson', email: 'alice@example.com', role: 'member', avatar: 'https://i.pravatar.cc/150?u=alice' },
  ] as User[],

  '/memorials': [
    { id: 1, title: 'Community Memorial Garden', description: 'A beautiful garden dedicated to our beloved community members', date: '2024-03-15', location: 'Main Community Center' },
    { id: 2, title: 'Annual Remembrance Ceremony', description: 'Join us in remembering those we have lost this year', date: '2024-04-20', location: 'Community Hall' },
    { id: 3, title: 'Historical Memorial Plaque', description: 'Commemorating the founding members of our community', date: '2024-05-10', location: 'Entrance Gate' },
  ] as Memorial[],

  '/requests': [
    { id: 1, type: 'maintenance', title: 'Leaking Faucet in Common Area', description: 'The faucet in the west wing bathroom has been leaking for 3 days', status: 'pending', createdAt: '2024-01-10' },
    { id: 2, type: 'complaint', title: 'Noise Complaint - Unit 204', description: 'Excessive noise coming from unit 204 every night after 11 PM', status: 'in-progress', createdAt: '2024-01-09' },
    { id: 3, type: 'suggestion', title: 'Add More Recycling Bins', description: 'Could we please add more recycling bins near the elevators?', status: 'completed', createdAt: '2024-01-08' },
    { id: 4, type: 'other', title: 'Community Potluck Suggestion', description: 'I suggest we organize a monthly community potluck dinner', status: 'pending', createdAt: '2024-01-07' },
  ] as Request[],

  '/announcements': [
    { id: 1, title: 'Welcome to Our Community Portal', content: 'We are excited to launch our new community portal! This platform will help us stay connected and informed.', author: 'Admin Team', date: '2024-01-15', category: 'General' },
    { id: 2, title: 'Scheduled Maintenance Notice', content: 'There will be scheduled water maintenance on January 20th from 2-4 PM. Please plan accordingly.', author: 'Maintenance Team', date: '2024-01-14', category: 'Maintenance' },
    { id: 3, title: 'Community Meeting This Friday', content: 'Join us for our monthly community meeting this Friday at 6 PM in the community hall.', author: 'Board Member', date: '2024-01-13', category: 'Meeting' },
  ] as Announcement[],

  '/events': [
    { id: 1, title: 'Neighborhood Cleanup Day', description: 'Help us keep our community beautiful! Gloves and bags provided.', date: '2024-01-25', time: '9:00 AM', location: 'Main Park', rsvpCount: 23 },
    { id: 2, title: 'Yoga in the Park', description: 'Free community yoga sessions every Saturday morning', date: '2024-01-27', time: '8:00 AM', location: 'Central Lawn', rsvpCount: 15 },
    { id: 3, title: 'Book Club Meeting', description: 'This month we are discussing "The Great Gatsby"', date: '2024-01-30', time: '7:00 PM', location: 'Community Library', rsvpCount: 8 },
  ] as Event[],
};

export async function mockApiFetch<T>(endpoint: string): Promise<T> {
  // Simulate network delay (0.5-1.5 seconds)
  const delay = Math.random() * 1000 + 500;
  await new Promise(resolve => setTimeout(resolve, delay));
  
  const data = mockData[endpoint as keyof typeof mockData];
  
  if (!data) {
    throw new Error(`Mock endpoint not found: ${endpoint}`);
  }
  
  return data as T;
}