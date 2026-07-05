import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Check, ChevronDown, GraduationCap, Phone, User } from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { BackBtn } from "../../components/BackBtn";
import { Field } from "../../components/Field";
import { useTheme } from "../../contexts/ThemeContext";
import { apiRegister } from "../../services/api";

// ─── Validators ───────────────────────────────────────────────────────────────
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PWD_RE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;

const FACULTIES = [
  "Faculty of Computing",
  "Faculty of Engineering",
  "Faculty of Business",
  "Faculty of Science",
  "Faculty of Medicine",
  "Faculty of Arts",
  "Faculty of Law",
  "Faculty of Education",
  "Faculty of Management",
  "Faculty of Architecture",
];

const INTERESTS = ["Hackathons", "AI & ML", "Design", "Research", "Social", "Tech Talks"];

export default function RegisterScreen() {
  const router = useRouter();
  const { theme: T } = useTheme();
  const [loading, setLoading] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [facultyModalVisible, setFacultyModalVisible] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    faculty: "",
    password: "",
    confirmPassword: "",
  });

  const set = (key: keyof typeof form) => (val: string) => setForm(f => ({ ...f, [key]: val }));

  const toggleInterest = (i: string) =>
    setSelectedInterests(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Full name is required.";
    if (!form.email.trim()) {
      e.email = "Email is required.";
    } else if (!EMAIL_RE.test(form.email)) {
      e.email = "Enter a valid email address.";
    }
    if (!form.faculty) e.faculty = "Please select your faculty.";
    if (!form.password) {
      e.password = "Password is required.";
    } else if (!PWD_RE.test(form.password)) {
      e.password = "Min 8 chars with uppercase, lowercase, number & special character.";
    }
    if (!form.confirmPassword) {
      e.confirmPassword = "Please confirm your password.";
    } else if (form.password !== form.confirmPassword) {
      e.confirmPassword = "Passwords do not match.";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const data = await apiRegister({
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone,
        role: "student",
        faculty: form.faculty,
        interests: selectedInterests,
      });

      await AsyncStorage.setItem("token", data.token);
      await AsyncStorage.setItem("user", JSON.stringify(data));
      router.replace("/(student)/home");
    } catch (error: any) {
      Alert.alert("Registration Failed", error.message || "Something went wrong.");
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
      {/* Faculty Picker Modal */}
      <Modal
        visible={facultyModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setFacultyModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setFacultyModalVisible(false)}
        >
          <View style={[styles.modalSheet, { backgroundColor: T.surface, borderColor: T.border }]}>
            <Text style={[styles.modalTitle, { color: T.text }]}>Select Faculty</Text>
            <FlatList
              data={FACULTIES}
              keyExtractor={item => item}
              renderItem={({ item }) => {
                const selected = form.faculty === item;
                return (
                  <TouchableOpacity
                    onPress={() => { set("faculty")(item); setFacultyModalVisible(false); }}
                    style={[
                      styles.facultyOption,
                      { borderColor: T.border },
                      selected && { backgroundColor: T.primarySoft },
                    ]}
                  >
                    <Text style={[styles.facultyOptionText, { color: selected ? T.primary : T.text }]}>
                      {item}
                    </Text>
                    {selected && <Check size={14} color={T.primary} />}
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </TouchableOpacity>
      </Modal>

      <LinearGradient colors={T.gradientHeader} style={styles.header}>
        <View style={styles.logoRow}>
          <BackBtn T={T} onBack={() => router.back()} />
          <Text style={styles.title}>Create Account</Text>
        </View>
        <Text style={styles.subtitle}>Join UniEvents and never miss what matters.</Text>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.form}>
          <View style={styles.fieldCol}>
            <Field T={T} label="Full Name *" placeholder="e.g. Kavinda Perera" icon={<User size={15} color={T.textMuted} />} value={form.name} onChangeText={v => { set("name")(v); setErrors(p => ({ ...p, name: "" })); }} />
            {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}
          </View>

          <View style={styles.fieldCol}>
            <Field T={T} label="University Email *" placeholder="student@university.edu.lk" icon={<User size={15} color={T.textMuted} />} value={form.email} onChangeText={v => { set("email")(v); setErrors(p => ({ ...p, email: "" })); }} />
            {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
          </View>

          <Field T={T} label="Mobile / Contact Number" placeholder="e.g. +94 77 123 4567" icon={<Phone size={15} color={T.textMuted} />} value={form.phone} onChangeText={set("phone")} />

          {/* Faculty Picker */}
          <View style={styles.fieldCol}>
            <Text style={[styles.label, { color: T.textMuted }]}>Faculty *</Text>
            <TouchableOpacity
              onPress={() => setFacultyModalVisible(true)}
              style={[
                styles.pickerBtn,
                {
                  borderColor: errors.faculty ? T.red : form.faculty ? T.primary + "60" : T.inputBorder,
                  backgroundColor: "transparent",
                },
              ]}
            >
              <GraduationCap size={15} color={T.textMuted} />
              <Text style={[styles.pickerText, { color: form.faculty ? T.text : T.textMuted }]}>
                {form.faculty || "Select your faculty"}
              </Text>
              <ChevronDown size={15} color={T.textMuted} />
            </TouchableOpacity>
            {errors.faculty ? <Text style={styles.errorText}>{errors.faculty}</Text> : null}
          </View>

          {/* Interests */}
          <View style={styles.fieldCol}>
            <Text style={[styles.label, { color: T.textMuted }]}>Interests (for AI recommendations)</Text>
            <View style={styles.tagsContainer}>
              {INTERESTS.map(i => (
                <TouchableOpacity
                  key={i}
                  onPress={() => toggleInterest(i)}
                  style={[
                    styles.tag,
                    selectedInterests.includes(i)
                      ? { backgroundColor: T.primary, borderColor: T.primary }
                      : { backgroundColor: T.primarySoft, borderColor: T.primary + "50" },
                  ]}
                >
                  <Text style={{ fontSize: 11, fontWeight: "600", color: selectedInterests.includes(i) ? "#fff" : T.primary }}>{i}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.fieldCol}>
            <Field T={T} label="Password *" instruction="Min 8 chars, upper, lower, number, symbol" placeholder="Create a strong password" type="password" value={form.password} onChangeText={v => { set("password")(v); setErrors(p => ({ ...p, password: "" })); }} />
            {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
          </View>

          <View style={styles.fieldCol}>
            <Field T={T} label="Confirm Password *" placeholder="Repeat your password" type="password" value={form.confirmPassword} onChangeText={v => { set("confirmPassword")(v); setErrors(p => ({ ...p, confirmPassword: "" })); }} />
            {errors.confirmPassword ? <Text style={styles.errorText}>{errors.confirmPassword}</Text> : null}
          </View>

          <TouchableOpacity
            onPress={handleRegister}
            disabled={loading}
            style={[styles.submitBtn, { backgroundColor: T.primary, opacity: loading ? 0.7 : 1 }]}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitBtnText}>Create Student Account</Text>
            )}
          </TouchableOpacity>

          <View style={styles.footerRow}>
            <Text style={{ color: T.textMuted, fontSize: 12 }}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={{ color: T.primary, fontSize: 12, fontWeight: "bold" }}>Sign in</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 24, paddingTop: 60, paddingBottom: 20 },
  logoRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 16 },
  title: { color: "#fff", fontSize: 20, fontWeight: "900" },
  subtitle: { color: "rgba(255,255,255,0.7)", fontSize: 14 },
  scrollContent: { paddingTop: 16, paddingBottom: 60 },
  form: { paddingHorizontal: 24, gap: 14 },
  fieldCol: { gap: 4 },
  label: { fontSize: 12, fontWeight: "600" },
  errorText: { fontSize: 11, color: "#E05570", marginLeft: 2 },
  pickerBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderWidth: 1,
  },
  pickerText: { flex: 1, fontSize: 14 },
  tagsContainer: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 4 },
  tag: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1 },
  submitBtn: { width: "100%", paddingVertical: 14, borderRadius: 16, alignItems: "center", justifyContent: "center", marginTop: 8 },
  submitBtnText: { color: "#fff", fontSize: 14, fontWeight: "bold" },
  footerRow: { flexDirection: "row", justifyContent: "center" },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" },
  modalSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingBottom: 40,
    maxHeight: "70%",
    borderWidth: 1,
  },
  modalTitle: { fontSize: 16, fontWeight: "800", paddingHorizontal: 20, marginBottom: 12 },
  facultyOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  facultyOptionText: { fontSize: 14, fontWeight: "500" },
});
