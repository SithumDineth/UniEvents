import React from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import { ArrowLeft } from "lucide-react-native";
import { Theme } from "../constants/Themes";

interface BackBtnProps {
  T: Theme;
  onBack: () => void;
}

export function BackBtn({ T, onBack }: BackBtnProps) {
  return (
    <TouchableOpacity
      onPress={onBack}
      style={[styles.btn, { backgroundColor: T.surfaceAlt }]}
    >
      <ArrowLeft size={17} color={T.text} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
});
