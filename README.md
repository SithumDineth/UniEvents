# UniEvents - Interactive University Event Management App

UniEvents is a cutting-edge cross-platform mobile application that combines personalized AI-powered event recommendations with seamless event management for both students and university administrators. Built with React Native and Expo, users can explore, register, and get reminders for campus events, while admins can create, manage, and analyze events with ease.

## 🚀 Features

- **Interactive AI Event Recommendations**: Personalized event suggestions powered by Google Gemini 1.5 Flash, based on user interests and registered events history
- **Role-Specific Portals**: Separate, secure login for students and administrators with role-based access control
- **Student Features**: Browse/search events, personalized AI picks, register for events, set calendar reminders, push notifications, dark/light theme support
- **Admin Features**: Create/edit/publish events, manage registrations, mark events as completed, send notifications, view analytics
- **Calendar Integration**: Add events directly to your device calendar and receive reminder notifications one day before
- **Responsive UI**: Modern, clean interface with smooth animations and glass-morphism effects
- **Smart Reminders**: User-specific device reminders stored locally using AsyncStorage

## 🛠️ Tech Stack

### Frontend
- Framework: React Native / Expo 54 (Expo Router)
- Language: TypeScript
- UI Components: Lucide React Native Icons, React Native Reanimated
- Local Storage: AsyncStorage
- Integrations: Expo Notifications, Expo Calendar

### Backend
- Framework: Node.js / Express.js
- Database: MongoDB (Mongoose ODM)
- Authentication: JWT (JSON Web Tokens)
- AI Integration: Google Generative AI (Gemini 1.5 Flash)
- Push Notifications: Expo Server SDK

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v18 or higher)
- npm or yarn
- MongoDB (local or cloud instance)
- Expo Go app or expo-dev-client on your mobile device

## ⚙️ Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <your-github-repo-url>
   cd UniEvents
   ```

2. **Set up Backend**
   ```bash
   cd backend
   npm install
   ```
   Create a `.env` file in `backend/` directory with:
   ```
   MONGODB_URI=mongodb://localhost:27017/unievents
   JWT_SECRET=your_jwt_secret_key_here
   GOOGLE_API_KEY=your_google_generative_ai_api_key_here
   PORT=5000
   ```

3. **Set up Frontend**
   ```bash
   cd ../frontend
   npm install
   ```
   Update `API_BASE_URL` in `frontend/src/services/api.ts` to your laptop's network IP address (e.g., `http://192.168.8.104:5000/api`)

4. **Run the Backend Server**
   ```bash
   cd ../backend
   npm run dev
   ```

5. **Run the Frontend App**
   ```bash
   cd ../frontend
   npm start
   ```

   Open the Expo Go app on your mobile device and scan the QR code, or run on a specific platform:
   ```bash
   npm run android
   npm run ios
   npm run web
   ```

## 🎮 Controls & Usage

### For Students
- **Sign In**: Use the "Student" tab on the login screen
- **Browse Events**: Home tab shows all upcoming events and AI recommendations
- **Search**: Search tab lets you filter by categories and keywords
- **Register**: Tap on an event to view details and register
- **Set Reminders**: On event detail screen, tap the reminder icon to set a notification
- **Update Profile**: Profile tab allows updating personal details and interests

### For Admins
- **Sign In**: Use the "Admin" tab on the login screen
- **Manage Events**: Create, edit, publish, and delete events
- **View Registrations**: See who has registered for each event
- **Send Notifications**: Send push notifications to students
- **Mark Complete**: Mark events as completed once they've happened

## 📄 License

© 2025 UniEvents. All Rights Reserved.

This project and its source code are proprietary. Unauthorized copying, modification, distribution, or use of this software, in whole or in part, is strictly prohibited without explicit permission from the copyright holders.

## Development Team

- Sithum Dineth
- Dulneth Ranaweera
- Rasindu
- Devin
