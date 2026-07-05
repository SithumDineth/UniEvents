/**
 * Seed script — populates the UniEvents database with sample events.
 * Run once: node seed.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Event = require('./models/Event');

const SEED_EVENTS = [
  {
    title: 'National Hackathon 2026',
    category: 'Tech',
    date: 'Jul 12, 2026',
    time: '9:00 AM',
    location: 'Main Auditorium, Block A',
    capacity: 300,
    attendeesCount: 248,
    description: 'Join 250+ students for a 24-hour coding marathon. Build innovative solutions to real-world problems. Prizes worth LKR 500,000.',
    organizer: 'IEEE Student Branch',
    image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600&h=340&fit=crop&auto=format',
    tag: 'AI Pick',
    accentKey: 'primary',
    published: true,
    featured: true,
    completed: false,
  },
  {
    title: 'Research Paper Symposium',
    category: 'Academic',
    date: 'Jul 18, 2026',
    time: '10:30 AM',
    location: 'Lecture Hall C, Block D',
    capacity: 150,
    attendeesCount: 92,
    description: 'Present your research to faculty, peers, and industry guests. Compete for the Best Paper Award.',
    organizer: 'Faculty of Computing',
    image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&h=340&fit=crop&auto=format',
    tag: 'Trending',
    accentKey: 'secondary',
    published: true,
    featured: false,
    completed: false,
  },
  {
    title: 'UI/UX Design Workshop',
    category: 'Design',
    date: 'Jul 22, 2026',
    time: '2:00 PM',
    location: 'Innovation Lab, Block B',
    capacity: 60,
    attendeesCount: 55,
    description: 'Hands-on Figma workshop covering user research, wireframing, and prototyping. Bring your laptop!',
    organizer: 'Design Society',
    image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&h=340&fit=crop&auto=format',
    tag: 'New',
    accentKey: 'green',
    published: true,
    featured: false,
    completed: false,
  },
  {
    title: 'AI & Machine Learning Talk',
    category: 'Tech',
    date: 'Jul 28, 2026',
    time: '11:00 AM',
    location: 'Seminar Room 1',
    capacity: 200,
    attendeesCount: 130,
    description: 'Industry experts discuss the latest in LLMs, generative AI, and practical ML applications.',
    organizer: 'CS Department',
    image: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=600&h=340&fit=crop&auto=format',
    tag: 'AI Pick',
    accentKey: 'primary',
    published: true,
    featured: false,
    completed: false,
  },
  {
    title: 'Public Speaking Championship',
    category: 'Social',
    date: 'Aug 2, 2026',
    time: '3:00 PM',
    location: 'Main Hall',
    capacity: 120,
    attendeesCount: 78,
    description: 'Develop confidence and oratory skills at our annual championship. Open to all students.',
    organizer: 'Toastmasters Club',
    image: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=600&h=340&fit=crop&auto=format',
    tag: 'Popular',
    accentKey: 'orange',
    published: true,
    featured: false,
    completed: false,
  },
  {
    title: 'Cybersecurity Bootcamp',
    category: 'Tech',
    date: 'Aug 8, 2026',
    time: '9:00 AM',
    location: 'Computer Lab 3, Block C',
    capacity: 80,
    attendeesCount: 42,
    description: 'Two-day intensive bootcamp on ethical hacking, network security, and penetration testing. CEH basics covered.',
    organizer: 'CyberSec Club',
    image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&h=340&fit=crop&auto=format',
    tag: 'Hot',
    accentKey: 'red',
    published: true,
    featured: false,
    completed: false,
  },
  {
    title: 'Entrepreneurship Summit 2026',
    category: 'Social',
    date: 'Aug 15, 2026',
    time: '10:00 AM',
    location: 'Faculty of Business Auditorium',
    capacity: 250,
    attendeesCount: 180,
    description: 'Connect with startup founders, VCs, and industry mentors. Pitch your idea and win seed funding.',
    organizer: 'Business Innovation Hub',
    image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&h=340&fit=crop&auto=format',
    tag: 'Featured',
    accentKey: 'secondary',
    published: true,
    featured: true,
    completed: false,
  },
  {
    title: 'Annual Cultural Night',
    category: 'Social',
    date: 'Aug 20, 2026',
    time: '6:00 PM',
    location: 'University Open Grounds',
    capacity: 500,
    attendeesCount: 320,
    description: 'Celebrate diversity with music, dance, food stalls, and cultural performances from students across all faculties.',
    organizer: 'Student Union',
    image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&h=340&fit=crop&auto=format',
    tag: 'Popular',
    accentKey: 'orange',
    published: true,
    featured: false,
    completed: false,
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
    console.log('✅ Connected to MongoDB Atlas');

    const existing = await Event.countDocuments();
    if (existing > 0) {
      console.log(`ℹ️  Database already has ${existing} events. Skipping seed.`);
      console.log('   To re-seed, run: node seed.js --force');
      if (!process.argv.includes('--force')) {
        process.exit(0);
      }
      await Event.deleteMany({});
      console.log('🗑️  Cleared existing events.');
    }

    const inserted = await Event.insertMany(SEED_EVENTS);
    console.log(`🌱 Seeded ${inserted.length} events successfully!`);
    inserted.forEach(e => console.log(`   · ${e.title}`));
  } catch (err) {
    console.error('❌ Seed error:', err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seed();
