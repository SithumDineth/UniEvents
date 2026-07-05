
import React from "react";
import { View, ActivityIndicator, StyleSheet, Text, ViewStyle } from "react-native";
import { useTheme } from "../contexts/ThemeContext";

interface LoadingIndicatorProps {
  size?: "small" | "large";
  text?: string;
  style?: ViewStyle;
}

export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  size = "large",
  text,
  style,
}) => {
  const { theme: T } = useTheme();

  return (
    <View style={[styles.container, style]}>
      <ActivityIndicator size={size} color={T.primary} />
      {text && <Text style={[styles.text, { color: T.textMuted }]}>{text}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 16,
  },
  text: {
    fontSize: 14,
    fontWeight: "500",
  },
});

