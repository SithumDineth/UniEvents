import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Calendar, ShieldCheck, User } from "lucide-react-native";
import React, { useState } from "react";
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Field } from "../../components/Field";
import { useTheme } from "../../contexts/ThemeContext";
import { apiLogin } from "../../services/api";
import { validateEmail, validatePassword } from "../../utils/validation";

export default function LoginScreen() {
  const router = useRouter();
  const { theme: T } = useTheme();
  const [tab, setTab] = useState<"student" | "admin">("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    const emailResult = validateEmail(email);
    if (!emailResult.isValid) newErrors.email = emailResult.error!;

    const passwordResult = validatePassword(password);
    if (!passwordResult.isValid) newErrors.password = passwordResult.error!;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const data = await apiLogin(email, password, tab);

      // Save token and user info
      await AsyncStorage.setItem("token", data.token);
      await AsyncStorage.setItem("user", JSON.stringify(data));

      if (data.role === "admin") {
        router.replace("/(admin)/(tabs)/home");
      } else {
        router.replace("/(student)/(tabs)/home");
      }
    } catch (error: any) {
      Alert.alert("Login Failed", error.message || "Invalid credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: T.bg }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <LinearGradient colors={T.gradientHeader} style={styles.header}>
        <View style={styles.logoRow}>
          <Calendar size={20} color="#fff" />
          <Text style={styles.logoText}>UniEvents</Text>
        </View>
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>Sign in to your account</Text>
      </LinearGradient>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
        <View style={[styles.tabContainer, { backgroundColor: T.surfaceAlt }]}>
          {(["student", "admin"] as const).map((r) => {
            const isActive = tab === r;
            const activeBg = r === "admin" ? T.secondary : T.primary;
            return (
              <TouchableOpacity
                key={r}
                onPress={() => setTab(r)}
                style={[styles.tabBtn, isActive ? { backgroundColor: activeBg } : {}]}
              >
                {r === "admin" ? (
                  <ShieldCheck size={13} color={isActive ? "#fff" : T.textMuted} />
                ) : (
                  <User size={13} color={isActive ? "#fff" : T.textMuted} />
                )}
                <Text style={[styles.tabText, { color: isActive ? "#fff" : T.textMuted }]}>
                  {r === "admin" ? "Admin" : "Student"}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.form}>
          <View style={styles.fieldCol}>
            <Field
              T={T}
              label="University Email"
              placeholder={tab === "admin" ? "admin@university.edu.lk" : "student@university.edu.lk"}
              icon={<User size={15} color={T.textMuted} />}
              value={email}
              onChangeText={(v) => {
                setEmail(v);
                setErrors((p) => ({ ...p, email: "" }));
              }}
            />
            {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
          </View>

          <View style={styles.fieldCol}>
            <Field
              T={T}
              label="Password"
              placeholder="Enter your password"
              type="password"
              value={password}
              onChangeText={(v) => {
                setPassword(v);
                setErrors((p) => ({ ...p, password: "" }));
              }}
            />
            {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
          </View>

          {tab === "admin" && (
            <View style={[styles.adminWarning, { backgroundColor: T.secondarySoft, borderColor: T.secondary + "30" }]}>
              <ShieldCheck size={14} color={T.secondary} />
              <Text style={[styles.adminWarningText, { color: T.secondary }]}>
                Admin access requires department approval
              </Text>
            </View>
          )}

          <TouchableOpacity
            onPress={handleLogin}
            disabled={loading}
            style={[styles.loginBtn, { backgroundColor: tab === "admin" ? T.secondary : T.primary, opacity: loading ? 0.7 : 1 }]}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginBtnText}>Sign In as {tab === "admin" ? "Admin" : "Student"}</Text>
            )}
          </TouchableOpacity>

          <View style={styles.dividerRow}>
            <View style={[styles.divider, { backgroundColor: T.inputBorder }]} />
            <Text style={[styles.dividerText, { color: T.textMuted }]}>OR CONNECT WITH</Text>
            <View style={[styles.divider, { backgroundColor: T.inputBorder }]} />
          </View>

          <View style={styles.socialRow}>
            <TouchableOpacity style={[styles.socialBtn, { backgroundColor: T.primary }]}>
              <Text style={styles.facebookText}>f</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.socialBtn, { backgroundColor: T.surface, borderColor: T.inputBorder, borderWidth: 1 }]}>
              <Text style={styles.googleText}>G</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.registerRow}>
            <Text style={{ color: T.textMuted, fontSize: 12 }}>New user? </Text>
            <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
              <Text style={{ color: T.primary, fontSize: 12, fontWeight: "bold" }}>Create account</Text>
            </TouchableOpacity>
          </View>
        </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 24, paddingTop: 60, paddingBottom: 24 },
  logoRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 16 },
  logoText: { color: "#fff", fontSize: 16, fontWeight: "900" },
  title: { color: "#fff", fontSize: 24, fontWeight: "900" },
  subtitle: { color: "rgba(255,255,255,0.7)", fontSize: 14, marginTop: 4 },
  scrollContent: { paddingTop: 16, paddingBottom: 40 },
  tabContainer: { flexDirection: "row", marginHorizontal: 24, borderRadius: 12, padding: 4, gap: 4, marginBottom: 20 },
  tabBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 10, borderRadius: 8 },
  tabText: { fontSize: 12, fontWeight: "bold" },
  form: { paddingHorizontal: 24, gap: 16 },
  fieldCol: { gap: 4 },
  errorText: { fontSize: 11, color: "#E05570", marginLeft: 2 },
  adminWarning: { flexDirection: "row", alignItems: "center", gap: 10, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1 },
  adminWarningText: { fontSize: 11 },
  loginBtn: { width: "100%", paddingVertical: 14, borderRadius: 9999, alignItems: "center", justifyContent: "center", marginTop: 4 },
  loginBtnText: { color: "#fff", fontSize: 14, fontWeight: "bold" },
  dividerRow: { flexDirection: "row", alignItems: "center", gap: 12, marginVertical: 4 },
  divider: { flex: 1, height: 1 },
  dividerText: { fontSize: 10, fontWeight: "600", letterSpacing: 1 },
  socialRow: { flexDirection: "row", gap: 12 },
  socialBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  facebookText: { color: "#fff", fontSize: 18, fontWeight: "900" },
  googleText: { color: "#4285F4", fontSize: 18, fontWeight: "900" },
  registerRow: { flexDirection: "row", justifyContent: "center", marginTop: 10 },
});
