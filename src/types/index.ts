
export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'student' | 'admin';
  faculty?: string;
  interests?: string[];
  department?: string;
  savedEvents?: string[];
  expoPushToken?: string;
  notificationsEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Event {
  _id: string;
  title: string;
  category: string;
  date: string;
  time: string;
  location: string;
  capacity: number;
  description: string;
  organizer: string;
  image?: string;
  tag?: string;
  accentKey?: string;
  published?: boolean;
  featured?: boolean;
  completed?: boolean;
  attendeesCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  _id: string;
  title: string;
  body: string;
  userId: string;
  isRead: boolean;
  eventId?: string;
  createdAt: string;
  updatedAt: string;
}
