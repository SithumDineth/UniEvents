import React from "react";
import { Tabs } from "expo-router";
import { BottomNav } from "../../../components/BottomNav";
import { useTheme } from "../../../contexts/ThemeContext";

export default function AdminTabsLayout() {
  const { theme: T } = useTheme();

  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <BottomNav {...props} T={T} role="admin" />}
    >
      <Tabs.Screen name="home" />
      <Tabs.Screen name="publish" />
      <Tabs.Screen name="manage" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
