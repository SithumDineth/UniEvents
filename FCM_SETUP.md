# FCM Setup for Expo Push Notifications

Follow these steps to set up Firebase Cloud Messaging (FCM) for your Expo Android app:

## Step 1: Create a Firebase Project
1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" and follow the wizard
3. Name your project and click "Continue"
4. Disable Google Analytics if desired, then click "Continue"
5. Click "Create project"

## Step 2: Add an Android App to Firebase
1. In your Firebase project dashboard, click the Android icon
2. Enter your Android package name (you can find this in `app.json` or `app.config.js`; default is `com.sithumdinesh.unievents`)
3. Optional: Enter app nickname and SHA-1 debug certificate
4. Click "Register app"
5. Download the `google-services.json` file and place it in the root of your project directory
6. Click "Next" and "Continue to console"

## Step 3: Configure Expo Project
1. Make sure your `app.json` or `app.config.js` includes the `googleServicesFile` field pointing to `./google-services.json` (for Android)
2. Also ensure your `expo-notifications` and `expo-device` are installed (they already are in this project)

## Step 4: Get Server Key and Add to Expo Project
1. In Firebase Console, go to Project Settings → Cloud Messaging
2. Copy the "Server key" (or "Legacy server key")
3. Go to your [Expo Project Settings](https://expo.dev/accounts/[your-username]/projects/[your-project-name])
4. Under "Credentials", click "Add a FCM Server Key"
5. Paste the server key and save

## Step 5: Rebuild Your App (if needed)
If you're using EAS Build, you'll need to rebuild your app after adding `google-services.json`

## Testing Push Notifications
You can test using the [Expo Push Notifications Tool](https://expo.dev/notifications)
