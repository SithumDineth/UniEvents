import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { Eye, EyeOff } from "lucide-react-native";
import { Theme } from "../constants/Themes";

interface FieldProps {
  T: Theme;
  label: string;
  placeholder: string;
  type?: "text" | "password";
  icon?: React.ReactNode;
  value?: string;
  onChangeText?: (text: string) => void;
  instruction?: string;
}

export function Field({ T, label, placeholder, type = "text", icon, value, onChangeText, instruction }: FieldProps) {
  const [show, setShow] = useState(false);
  const isPass = type === "password";

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: T.textMuted }]}>{label}</Text>
      {instruction && <Text style={{ fontSize: 10, color: T.textMuted, marginTop: -2, marginBottom: 2 }}>{instruction}</Text>}
      <View style={[styles.inputContainer, { borderColor: T.inputBorder }]}>
        {icon && <View style={styles.iconWrapper}>{icon}</View>}
        <TextInput
          style={[styles.input, { color: T.text }]}
          placeholder={placeholder}
          placeholderTextColor={T.textMuted}
          secureTextEntry={isPass && !show}
          cursorColor={T.primary}
          value={value}
          onChangeText={onChangeText}
          autoCapitalize="none"
          keyboardType={label.toLowerCase().includes("email") ? "email-address" : "default"}
        />
        {isPass && (
          <TouchableOpacity onPress={() => setShow((s) => !s)} hitSlop={10}>
            {show ? <EyeOff size={15} color={T.textMuted} /> : <Eye size={15} color={T.textMuted} />}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    backgroundColor: "transparent",
  },
  iconWrapper: {
    justifyContent: "center",
    alignItems: "center",
  },
  input: {
    flex: 1,
    fontSize: 14,
    padding: 0,
  },
});
