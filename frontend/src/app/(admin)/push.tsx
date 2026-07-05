import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useRouter } from "expo-router";
import { ArrowLeft, Check, Filter, Send, Users } from "lucide-react-native";
import React, { useCallback, useState } from "react";
import { ActivityIndicator, Alert, BackHandler, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useTheme } from "../../contexts/ThemeContext";
import { apiAdminSendPush } from "../../services/api";

const FACULTIES = ["Computing", "Engineering", "Business", "Humanities", "Science"];
const INTERESTS = ["Hackathons", "AI & ML", "Design", "Research", "Social", "Tech Talks"];

export default function AdminPushNotifications() {
  const router = useRouter();
  const { theme: T } = useTheme();

  // Handle native Android back button
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        router.replace("/(admin)/(tabs)/manage");
        return true;
      };
      const subscription = BackHandler.addEventListener("hardwareBackPress", onBackPress);
      return () => subscription.remove();
    }, [router])
  );

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [audience, setAudience] = useState<"all" | "faculty" | "interests">("all");
  const [faculty, setFaculty] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [sending, setSending] = useState(false);

  const toggleInterest = (i: string) => {
    setInterests(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]);
  };

  const handleSend = async () => {
    if (!title.trim() || !body.trim()) {
      Alert.alert("Validation", "Title and Body are required");
      return;
    }

    setSending(true);
    try {
      const payload = {
        title: title.trim(),
        body: body.trim(),
        audience,
        faculty: audience === 'faculty' ? faculty : undefined,
        interests: audience === 'interests' ? interests : undefined,
      };
      const res = await apiAdminSendPush(payload);
      Alert.alert("Success", res.message || "Push notification sent successfully", [
        { text: "OK", onPress: () => router.replace("/(admin)/(tabs)/manage") }
      ]);
    } catch (e: any) {
      Alert.alert("Error", e.message || "Failed to send push notification");
    } finally {
      setSending(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: T.bg }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <LinearGradient colors={T.gradientHeader} style={styles.header}>
        <TouchableOpacity onPress={() => router.replace("/(admin)/(tabs)/manage")} style={styles.backBtn}>
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Send Push Notification</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: T.text }]}>Notification Title</Text>
          <TextInput
            style={[styles.input, { backgroundColor: T.surface, color: T.text, borderColor: T.border }]}
            placeholder="e.g. Campus Closed Tomorrow"
            placeholderTextColor={T.textMuted}
            value={title}
            onChangeText={setTitle}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: T.text }]}>Notification Message</Text>
          <TextInput
            style={[styles.input, styles.textArea, { backgroundColor: T.surface, color: T.text, borderColor: T.border }]}
            placeholder="Write your message here..."
            placeholderTextColor={T.textMuted}
            multiline
            numberOfLines={4}
            value={body}
            onChangeText={setBody}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: T.text }]}>Target Audience</Text>
          <View style={styles.audienceTabs}>
            {[
              { id: "all", label: "All Students", icon: Users },
              { id: "faculty", label: "By Faculty", icon: Filter },
              { id: "interests", label: "By Interest", icon: Filter },
            ].map(tab => (
              <TouchableOpacity
                key={tab.id}
                onPress={() => setAudience(tab.id as any)}
                style={[
                  styles.tabBtn,
                  { backgroundColor: audience === tab.id ? T.primary : T.surfaceAlt, borderColor: T.border }
                ]}
              >
                <tab.icon size={14} color={audience === tab.id ? "#fff" : T.text} />
                <Text style={{ color: audience === tab.id ? "#fff" : T.text, fontSize: 12, fontWeight: "bold" }}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {audience === "faculty" && (
          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: T.text }]}>Select Faculty</Text>
            <View style={styles.tagsContainer}>
              {FACULTIES.map(f => (
                <TouchableOpacity
                  key={f}
                  onPress={() => setFaculty(f)}
                  style={[
                    styles.tag,
                    faculty === f
                      ? { backgroundColor: T.primary, borderColor: T.primary }
                      : { backgroundColor: T.surface, borderColor: T.border }
                  ]}
                >
                  <Text style={{ color: faculty === f ? "#fff" : T.text, fontSize: 12 }}>{f}</Text>
                  {faculty === f && <Check size={12} color="#fff" />}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {audience === "interests" && (
          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: T.text }]}>Select Interests</Text>
            <View style={styles.tagsContainer}>
              {INTERESTS.map(i => {
                const selected = interests.includes(i);
                return (
                  <TouchableOpacity
                    key={i}
                    onPress={() => toggleInterest(i)}
                    style={[
                      styles.tag,
                      selected
                        ? { backgroundColor: T.primary, borderColor: T.primary }
                        : { backgroundColor: T.surface, borderColor: T.border }
                    ]}
                  >
                    <Text style={{ color: selected ? "#fff" : T.text, fontSize: 12 }}>{i}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        <TouchableOpacity
          onPress={handleSend}
          disabled={sending}
          style={[styles.sendBtn, { backgroundColor: T.primary }]}
        >
          {sending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Send size={18} color="#fff" />
              <Text style={styles.sendText}>Send Notification</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 50, paddingBottom: 20, paddingHorizontal: 20, flexDirection: "row", alignItems: "center" },
  backBtn: { marginRight: 16, width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" },
  headerTitle: { color: "#fff", fontSize: 20, fontWeight: "bold" },
  content: { padding: 20, paddingBottom: 100 },
  formGroup: { marginBottom: 24 },
  label: { fontSize: 14, fontWeight: "bold", marginBottom: 8 },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 14 },
  textArea: { height: 100, textAlignVertical: "top" },
  audienceTabs: { flexDirection: "row", gap: 8 },
  tabBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 10, borderRadius: 10, borderWidth: 1 },
  tagsContainer: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tag: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16, borderWidth: 1 },
  sendBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 16, borderRadius: 16, marginTop: 12 },
  sendText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
