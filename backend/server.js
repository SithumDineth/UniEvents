const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 5000,
})
  .then(async () => {
    console.log('✅ MongoDB Atlas connected → UniEvents database');
    // Seed admin user
    try {
      const adminExists = await User.findOne({ email: 'admin@gmail.com' });
      if (!adminExists) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('Admin@123', salt);
        await User.create({
          name: 'Super Admin',
          email: 'admin@gmail.com',
          password: hashedPassword,
          role: 'admin',
        });
        console.log('🌱 Admin user seeded: admin@gmail.com');
      }
    } catch (e) {
      console.log('⚠️ Could not seed admin user:', e.message);
    }
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/events', require('./routes/eventRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));

// Health check
app.get('/', (req, res) => {
  res.json({ message: '✅ UniEvents API is running', version: '1.0.0' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
