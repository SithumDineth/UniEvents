# UniEvents Frontend

This is the React Native/Expo frontend for the UniEvents university event management app.

## Get Started

1. **Install dependencies**:

   ```bash
   npm install
   ```

2. **Start the app** (uses expo-dev-client):

   ```bash
   npm start  # Runs: npx expo start --dev-client
   ```

   Or run directly on a platform:
   ```bash
   npm run android
   npm run ios
   npm run web
   ```

## Project Structure

- `src/app/`: Expo Router file-based routing
  - `(auth)/`: Authentication screens (login/register)
  - `(student)/`: Student-facing screens with bottom tabs
  - `(admin)/`: Admin-facing screens with bottom tabs
- `src/components/`: Reusable UI components
- `src/constants/`: App constants (themes, mock data)
- `src/contexts/`: React contexts (ThemeContext)
- `src/hooks/`: Custom hooks
- `src/services/`: API service
- `src/types/`: TypeScript type definitions
- `src/utils/`: Utility functions (validation, calendar, reminders, event helpers)

## FCM Setup (Push Notifications)

For push notifications to work, you need to set up Firebase Cloud Messaging (FCM). See [FCM_SETUP.md](./FCM_SETUP.md) for instructions.

## Learn More

- [Expo Router documentation](https://docs.expo.dev/router/introduction/)
- [Expo documentation](https://docs.expo.dev/)
