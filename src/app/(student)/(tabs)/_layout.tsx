import React, { useEffect } from "react";
import { Tabs } from "expo-router";
import { BottomNav } from "../../../components/BottomNav";
import { usePushNotifications } from "../../../hooks/usePushNotifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import { API_BASE_URL } from "../../../services/api";
import { useTheme } from "../../../contexts/ThemeContext";

export default function StudentTabsLayout() {
  const { theme: T } = useTheme();
  const { expoPushToken } = usePushNotifications();

  useEffect(() => {
    const updateToken = async () => {
      if (expoPushToken) {
        const token = await AsyncStorage.getItem("token");
        if (token) {
          try {
            await fetch(`${API_BASE_URL}/users/push-token`, {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ token: expoPushToken }),
            });
          } catch (e) {
            console.log("Failed to update push token");
          }
        }
      }
    };
    updateToken();
  }, [expoPushToken]);

  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <BottomNav {...props} T={T} role="student" />}
    >
      <Tabs.Screen name="home" />
      <Tabs.Screen name="search" />
      <Tabs.Screen name="notifications" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
