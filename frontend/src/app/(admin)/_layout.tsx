import React from "react";
import { Stack } from "expo-router";
import { useTheme } from "../../contexts/ThemeContext";

export default function AdminLayout() {
  const { theme: T } = useTheme();

  return (
    <Stack
      screenOptions={{ headerShown: false, contentStyle: { backgroundColor: T.bg } }}
    >
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="detail/[id]" />
      <Stack.Screen name="edit/[id]" />
      <Stack.Screen name="push" />
      <Stack.Screen name="registered" />
      <Stack.Screen name="saved" />
    </Stack>
  );
}
