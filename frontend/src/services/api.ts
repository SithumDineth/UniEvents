import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── CONFIG ───────────────────────────────────────────────────────────────────
// Change this to your computer's local IP when running on a physical device
// e.g. 'http://192.168.8.104:5000/api'
export const API_BASE_URL = 'http://192.168.8.104:5000/api';

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const getToken = async (): Promise<string | null> => {
  return await AsyncStorage.getItem('token');
};

const authHeaders = async () => {
  const token = await getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const handleResponse = async (res: Response) => {
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
};

// ─── AUTH ─────────────────────────────────────────────────────────────────────
export const apiLogin = async (email: string, password: string, role: 'student' | 'admin') => {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, role }),
  });
  return handleResponse(res);
};

export const apiRegister = async (data: {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role?: 'student' | 'admin';
  faculty?: string;
  interests?: string[];
  department?: string;
  adminCode?: string;
}) => {
  const res = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
};

export const apiGetMe = async () => {
  const res = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: await authHeaders(),
  });
  return handleResponse(res);
};

// ─── NOTIFICATIONS ────────────────────────────────────────────────────────────
export const apiGetNotifications = async () => {
  const res = await fetch(`${API_BASE_URL}/notifications`, {
    headers: await authHeaders(),
  });
  return handleResponse(res);
};

export const apiMarkNotificationRead = async (id: string) => {
  const res = await fetch(`${API_BASE_URL}/notifications/${id}/read`, {
    method: 'PUT',
    headers: await authHeaders(),
  });
  return handleResponse(res);
};

export const apiMarkAllNotificationsRead = async () => {
  const res = await fetch(`${API_BASE_URL}/notifications/read-all`, {
    method: 'PUT',
    headers: await authHeaders(),
  });
  return handleResponse(res);
};

export const apiDeleteNotification = async (id: string) => {
  const res = await fetch(`${API_BASE_URL}/notifications/${id}`, {
    method: 'DELETE',
    headers: await authHeaders(),
  });
  return handleResponse(res);
};

export const apiAdminSendPush = async (data: { title: string, body: string, audience: string, faculty?: string, interests?: string[] }) => {
  const res = await fetch(`${API_BASE_URL}/notifications/admin-push`, {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
};

// ─── EVENTS ──────────────────────────────────────────────────────────────────
export const apiGetEvents = async (params?: { search?: string; category?: string }) => {
  const query = new URLSearchParams(params as Record<string, string>).toString();
  const res = await fetch(`${API_BASE_URL}/events${query ? '?' + query : ''}`, {
    headers: await authHeaders(),
  });
  return handleResponse(res);
};

export const apiGetEventById = async (id: string) => {
  const res = await fetch(`${API_BASE_URL}/events/${id}`, {
    headers: await authHeaders(),
  });
  return handleResponse(res);
};

export const apiGetRecommendations = async () => {
  const res = await fetch(`${API_BASE_URL}/events/recommendations`, {
    headers: await authHeaders(),
    cache: 'no-cache',
  });
  return handleResponse(res);
};

export const apiToggleRegistration = async (eventId: string) => {
  const res = await fetch(`${API_BASE_URL}/events/${eventId}/register`, {
    method: 'POST',
    headers: await authHeaders(),
  });
  return handleResponse(res);
};

export const apiCheckRegistration = async (eventId: string) => {
  const res = await fetch(`${API_BASE_URL}/events/${eventId}/registration-status`, {
    headers: await authHeaders(),
  });
  return handleResponse(res);
};

// Admin
export const apiGetAllEventsAdmin = async () => {
  const res = await fetch(`${API_BASE_URL}/events/admin/all`, {
    headers: await authHeaders(),
  });
  return handleResponse(res);
};

export const apiCreateEvent = async (data: {
  title: string;
  category: string;
  date: string;
  time: string;
  location: string;
  capacity: number;
  description: string;
  organizer: string;
  image?: string;
  published?: boolean;
}) => {
  const res = await fetch(`${API_BASE_URL}/events`, {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
};

export const apiUpdateEvent = async (id: string, data: Record<string, any>) => {
  const res = await fetch(`${API_BASE_URL}/events/${id}`, {
    method: 'PUT',
    headers: await authHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
};

export const apiDeleteEvent = async (id: string) => {
  const res = await fetch(`${API_BASE_URL}/events/${id}`, {
    method: 'DELETE',
    headers: await authHeaders(),
  });
  return handleResponse(res);
};

export const apiMarkEventCompleted = async (id: string) => {
  const res = await fetch(`${API_BASE_URL}/events/${id}/complete`, {
    method: 'PUT',
    headers: await authHeaders(),
  });
  return handleResponse(res);
};

// ─── USERS ────────────────────────────────────────────────────────────────────
export const apiGetProfile = async () => {
  const res = await fetch(`${API_BASE_URL}/users/profile`, {
    headers: await authHeaders(),
  });
  return handleResponse(res);
};

export const apiGetAllUsers = async () => {
  const res = await fetch(`${API_BASE_URL}/users`, {
    headers: await authHeaders(),
  });
  return handleResponse(res);
};

export const apiUpdateProfile = async (data: { name?: string; phone?: string; faculty?: string; interests?: string[]; notificationsEnabled?: boolean }) => {
  const res = await fetch(`${API_BASE_URL}/users/profile`, {
    method: 'PUT',
    headers: await authHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
};

export const apiGetRegisteredEvents = async () => {
  const res = await fetch(`${API_BASE_URL}/users/registered-events`, {
    headers: await authHeaders(),
  });
  return handleResponse(res);
};

export const apiToggleSavedEvent = async (eventId: string) => {
  const res = await fetch(`${API_BASE_URL}/users/saved-events/${eventId}`, {
    method: 'POST',
    headers: await authHeaders(),
  });
  return handleResponse(res);
};

export const apiGetSavedEvents = async () => {
  const res = await fetch(`${API_BASE_URL}/users/saved-events`, {
    headers: await authHeaders(),
  });
  return handleResponse(res);
};
