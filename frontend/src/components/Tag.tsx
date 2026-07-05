import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Sparkles } from "lucide-react-native";

interface TagProps {
  label: string;
  accent: string;
}

export function Tag({ label, accent }: TagProps) {
  return (
    <View
      style={[
        styles.container,
        { backgroundColor: accent + "28", borderColor: accent + "50" },
      ]}
    >
      {label === "AI Pick" && <Sparkles size={9} color={accent} />}
      <Text style={[styles.text, { color: accent }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 9999,
    borderWidth: 1,
  },
  text: {
    fontSize: 10,
    fontWeight: "bold",
  },
});
