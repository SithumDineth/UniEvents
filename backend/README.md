# UniEvents Backend

This is the Node.js/Express backend for the UniEvents university event management app, using MongoDB as the database.

## Get Started

1. **Install dependencies**:

   ```bash
   npm install
   ```

2. **Set up environment variables**:
   Create a `.env` file in the `backend/` directory with:
   ```
   MONGODB_URI=mongodb://localhost:27017/unievents
   JWT_SECRET=your-secret-key-here
   PORT=3000
   ```

3. **Start the server**:

   ```bash
   npm run dev  # Runs with nodemon for auto-reload
   # Or for production:
   npm start
   ```

## Project Structure

- `controllers/`: Request handlers
- `middleware/`: Express middleware (auth)
- `models/`: Mongoose models
- `routes/`: API routes
- `utils/`: Utility functions (push notifications)
- `server.js`: Server entry point
- `seed.js`: Database seeding script

## API Endpoints

### Auth
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user

### Events
- `GET /api/events` - Get all published events
- `GET /api/events/:id` - Get event by ID
- `POST /api/events` - Create event (admin)
- `PUT /api/events/:id` - Update event (admin)
- `DELETE /api/events/:id` - Delete event (admin)
- `PUT /api/events/:id/complete` - Mark event as complete (admin)

### Users
- `GET /api/users` - Get all users (admin)

### Notifications
- `POST /api/notifications` - Send push notification (admin)
