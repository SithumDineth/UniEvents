import { Home, Code2, Award, Palette, Mic, Cpu } from "lucide-react-native";
import { AccentKey } from "./Themes";

export type Role = "student" | "admin";

export const BASE_EVENTS = [
  {
    id: 1, title: "National Hackathon 2025", category: "Tech",
    date: "Jul 12, 2025", time: "9:00 AM", location: "Main Auditorium, Block A",
    attendees: 248, capacity: 300,
    image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600&h=340&fit=crop&auto=format",
    tag: "AI Pick", accentKey: "primary" as AccentKey,
    description: "Join 250+ students for a 24-hour coding marathon. Build innovative solutions to real-world problems. Prizes worth LKR 500,000.",
    organizer: "IEEE Student Branch", registered: false, featured: true, published: true,
  },
  {
    id: 2, title: "Research Paper Symposium", category: "Academic",
    date: "Jul 18, 2025", time: "10:30 AM", location: "Lecture Hall C, Block D",
    attendees: 92, capacity: 150,
    image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&h=340&fit=crop&auto=format",
    tag: "Trending", accentKey: "secondary" as AccentKey,
    description: "Present your research to faculty, peers, and industry guests. Compete for the Best Paper Award.",
    organizer: "Faculty of Computing", registered: true, featured: false, published: true,
  },
  {
    id: 3, title: "UI/UX Design Workshop", category: "Design",
    date: "Jul 22, 2025", time: "2:00 PM", location: "Innovation Lab, Block B",
    attendees: 55, capacity: 60,
    image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&h=340&fit=crop&auto=format",
    tag: "New", accentKey: "green" as AccentKey,
    description: "Hands-on Figma workshop covering user research, wireframing, and prototyping.",
    organizer: "Design Society", registered: false, featured: false, published: true,
  },
  {
    id: 4, title: "AI & Machine Learning Talk", category: "Tech",
    date: "Jul 28, 2025", time: "11:00 AM", location: "Seminar Room 1",
    attendees: 130, capacity: 200,
    image: "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=600&h=340&fit=crop&auto=format",
    tag: "AI Pick", accentKey: "primary" as AccentKey,
    description: "Industry experts discuss the latest in LLMs, generative AI, and practical ML applications.",
    organizer: "CS Department", registered: false, featured: false, published: false,
  },
  {
    id: 5, title: "Public Speaking Championship", category: "Social",
    date: "Aug 2, 2025", time: "3:00 PM", location: "Main Hall",
    attendees: 78, capacity: 120,
    image: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=600&h=340&fit=crop&auto=format",
    tag: "Popular", accentKey: "orange" as AccentKey,
    description: "Develop confidence and oratory skills at our annual championship. Open to all students.",
    organizer: "Toastmasters Club", registered: false, featured: false, published: true,
  },
];

export const CATEGORIES = [
  { label: "All", icon: Home }, { label: "Tech", icon: Code2 },
  { label: "Academic", icon: Award }, { label: "Design", icon: Palette },
  { label: "Social", icon: Mic }, { label: "AI", icon: Cpu },
];

export const NOTIFICATIONS = [
  { id: 1, title: "Hackathon registration closes soon!", body: "Only 12 spots left for National Hackathon 2025.", time: "2h ago", read: false, accentKey: "primary" as AccentKey },
  { id: 2, title: "New AI recommendation", body: "Based on your interests, check out the AI & ML Talk.", time: "5h ago", read: false, accentKey: "secondary" as AccentKey },
  { id: 3, title: "Event reminder", body: "Research Paper Symposium starts tomorrow at 10:30 AM.", time: "1d ago", read: true, accentKey: "secondary" as AccentKey },
  { id: 4, title: "Registration confirmed!", body: "You are registered for the Research Paper Symposium.", time: "2d ago", read: true, accentKey: "green" as AccentKey },
];
