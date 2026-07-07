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
   npm run we
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

## Phone Connection Tips

- **Same Wi-Fi**: Ensure your phone is connected to the **same Wi-Fi/hotspot** as your laptop
- **Manual URL Entry**: If QR scan fails, enter `exp://[YOUR_LAPTOP_IP]:8081` in your dev client
  (Find your laptop's IP with `ipconfig` on Windows or `ifconfig` on macOS/Linux)
- **Firewall**: Allow incoming connections for Node.js/Expo in your firewall settings
- **Backend API URL**: Update `API_BASE_URL` in `src/services/api.ts` to use your laptop's IP
  (e.g., `http://192.168.8.104:5000/api` → `http://10.185.214.26:5000/api`)

## Switching Networks?
When you change Wi-Fi (e.g., from hotspot to home Wi-Fi):
1. Find your laptop's new IP address
2. Update `API_BASE_URL` in `src/services/api.ts`
3. Reload your app

The backend accepts connections from **any network** (no blocking).

## Learn More

- [Expo Router documentation](https://docs.expo.dev/router/introduction/)
- [Expo documentation](https://docs.expo.dev/)
