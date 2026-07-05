# UniEvents

Cross-platform university event management app for students and admins built with React Native, Expo, and Node.js.

## Project Structure

```
UniEvents/
├── backend/          # Node.js backend (Express, MongoDB)
├── frontend/         # Expo + React Native frontend (uses expo-dev-client)
└── README.md
```

## Quick Start

### Frontend (Expo)

```bash
cd frontend
npm install
npm start  # Runs: npx expo start --dev-client
# Or to run directly on a specific platform:
npm run android
npm run ios
npm run web
```

### Backend (Node.js/Express)

```bash
cd backend
npm install
# Set up your MongoDB connection in backend/.env
npm run dev  # Runs with nodemon for auto-reload
```

## Features

- **Student Features**: Browse/search events, personalized AI recommendations, save/register for events, set calendar reminders, push notifications, dark/light theme support
- **Admin Features**: Create/edit/publish events, manage registrations, mark events as completed, send notifications, view analytics
- **Tech Stack**: React Native (Expo Router), TypeScript, Node.js, Express, MongoDB (Mongoose), Expo Notifications, Expo Calendar, expo-dev-client

## License

MIT
