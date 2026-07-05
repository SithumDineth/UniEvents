
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from "react-native";
import { AlertTriangle, RefreshCw } from "lucide-react-native";
import { useTheme } from "../contexts/ThemeContext";

interface ErrorViewProps {
  message?: string;
  onRetry?: () => void;
  style?: ViewStyle;
}

export const ErrorView: React.FC<ErrorViewProps> = ({
  message = "Something went wrong. Please try again.",
  onRetry,
  style,
}) => {
  const { theme: T } = useTheme();

  return (
    <View style={[styles.container, style]}>
      <AlertTriangle size={48} color={T.red} />
      <Text style={[styles.message, { color: T.text }]}>{message}</Text>
      {onRetry && (
        <TouchableOpacity
          onPress={onRetry}
          style={[styles.retryBtn, { backgroundColor: T.primary }]}
        >
          <RefreshCw size={16} color="#fff" />
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
      )}
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
  message: {
    fontSize: 16,
    textAlign: "center",
    fontWeight: "500",
  },
  retryBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
});

