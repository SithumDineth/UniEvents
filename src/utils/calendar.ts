
import { Alert } from "react-native";

export const addEventToCalendar = async (
  title: string,
  dateStr: string,
  timeStr: string,
  location: string,
  description?: string
) => {
  try {
    // We'll add the actual implementation once native setup is complete
    // For now, show a friendly message
    Alert.alert(
      "Coming Soon!",
      "Calendar integration will be available once we complete the native app setup. For now, you can manually add this event to your calendar!"
    );
    return null;
  } catch (error) {
    console.error("Error adding event to calendar:", error);
    Alert.alert("Error", "Failed to add event to calendar.");
  }
};
