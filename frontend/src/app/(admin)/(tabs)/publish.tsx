import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import { CheckCircle2 } from "lucide-react-native";
import React, { useState } from "react";
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";
import { BackBtn } from "../../../components/BackBtn";
import { Field } from "../../../components/Field";
import { useTheme } from "../../../contexts/ThemeContext";
import { apiCreateEvent } from "../../../services/api";

const CATEGORIES = ["Tech", "Academic", "Design", "Social", "AI"];
const ACCENTS = ["primary", "secondary", "green", "orange", "red"];
const TAGS = ["New", "AI Pick", "Trending", "Popular"];

export default function AdminPublish() {
  const router = useRouter();
  const { theme: T } = useTheme();
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [publishNow, setPublishNow] = useState(true);

  const [form, setForm] = useState({
    title: "", category: "Tech", date: "", time: "",
    location: "", capacity: "", description: "", organizer: "",
    image: "", tag: "New", accentKey: "primary",
  });

  const set = (key: keyof typeof form) => (val: string) => setForm(f => ({ ...f, [key]: val }));

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [dateObj, setDateObj] = useState(new Date());

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDateObj(selectedDate);
      setForm(f => ({ ...f, date: selectedDate.toLocaleDateString() }));
    }
  };

  const onTimeChange = (event: any, selectedDate?: Date) => {
    setShowTimePicker(false);
    if (selectedDate) {
      setDateObj(selectedDate);
      setForm(f => ({ ...f, time: selectedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }));
    }
  };

  const handlePublish = async () => {
    if (!form.title || !form.date || !form.time || !form.location || !form.capacity || !form.description || !form.organizer || !form.image) {
      Alert.alert("Error", "Please fill in all required fields.");
      return;
    }
    setLoading(true);
    try {
      await apiCreateEvent({
        title: form.title,
        category: form.category,
        date: form.date,
        time: form.time,
        location: form.location,
        capacity: parseInt(form.capacity),
        description: form.description,
        organizer: form.organizer,
        image: form.image,
        published: publishNow,
      });
      setDone(true);
    } catch (e: any) {
      Alert.alert("Error", e.message || "Could not publish event.");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: T.bg }]}>
        <View style={[styles.successIconWrapper, { backgroundColor: T.greenSoft }]}>
          <CheckCircle2 size={40} color={T.green} />
        </View>
        <View style={styles.successTextContainer}>
          <Text style={[styles.successTitle, { color: T.text }]}>Event {publishNow ? "Published" : "Saved as Draft"}!</Text>
          <Text style={[styles.successDesc, { color: T.textMuted }]}>
            {publishNow
              ? "Students will be notified based on their AI interest profiles."
              : "Your event has been saved as a draft. You can publish it later."}
          </Text>
        </View>
        <TouchableOpacity onPress={() => router.replace("/(admin)/(tabs)/home")} style={[styles.mainBtn, { backgroundColor: T.primary }]}>
          <Text style={styles.mainBtnText}>Back to Dashboard</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: T.bg }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <View style={[styles.header, { backgroundColor: T.surface, borderColor: T.border }]}>
        <BackBtn T={T} onBack={() => router.back()} />
        <Text style={[styles.title, { color: T.text }]}>Publish Event</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Field T={T} label="Event Title *" placeholder="e.g. National Hackathon 2025" value={form.title} onChangeText={set("title")} />
        <Field T={T} label="Organizer *" placeholder="e.g. IEEE Student Branch" value={form.organizer} onChangeText={set("organizer")} />

        {Platform.OS === "web" ? (
          <Field T={T} label="Date *" placeholder="e.g. Jul 12, 2025" value={form.date} onChangeText={set("date")} />
        ) : (
          <TouchableOpacity onPress={() => setShowDatePicker(true)} activeOpacity={0.8}>
            <View pointerEvents="none">
              <Field T={T} label="Date *" placeholder="Select Date" value={form.date} onChangeText={set("date")} />
            </View>
          </TouchableOpacity>
        )}

        {Platform.OS === "web" ? (
          <Field T={T} label="Time *" placeholder="e.g. 9:00 AM" value={form.time} onChangeText={set("time")} />
        ) : (
          <TouchableOpacity onPress={() => setShowTimePicker(true)} activeOpacity={0.8}>
            <View pointerEvents="none">
              <Field T={T} label="Time *" placeholder="Select Time" value={form.time} onChangeText={set("time")} />
            </View>
          </TouchableOpacity>
        )}

        <Field T={T} label="Location *" placeholder="e.g. Main Auditorium, Block A" value={form.location} onChangeText={set("location")} />
        <Field T={T} label="Capacity *" placeholder="e.g. 300" value={form.capacity} onChangeText={set("capacity")} />
        <Field T={T} label="Image URL *" placeholder="https://images.unsplash.com/... (must be a valid image URL)" value={form.image} onChangeText={set("image")} />
        <Field T={T} label="Description *" placeholder="Tell students what this event is about..." value={form.description} onChangeText={set("description")} />

        {/* Category Selector */}
        <View style={styles.fieldCol}>
          <Text style={[styles.label, { color: T.textMuted }]}>Category</Text>
          <View style={styles.tagsRow}>
            {CATEGORIES.map(c => (
              <TouchableOpacity
                key={c}
                onPress={() => setForm(f => ({ ...f, category: c }))}
                style={[styles.chipBtn, form.category === c
                  ? { backgroundColor: T.primary, borderColor: T.primary }
                  : { backgroundColor: T.surfaceAlt, borderColor: T.border }]}
              >
                <Text style={{ color: form.category === c ? "#fff" : T.textMuted, fontSize: 12, fontWeight: "600" }}>{c}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Tag Selector */}
        <View style={styles.fieldCol}>
          <Text style={[styles.label, { color: T.textMuted }]}>Tag</Text>
          <View style={styles.tagsRow}>
            {TAGS.map(t => (
              <TouchableOpacity
                key={t}
                onPress={() => setForm(f => ({ ...f, tag: t }))}
                style={[styles.chipBtn, form.tag === t
                  ? { backgroundColor: T.secondary, borderColor: T.secondary }
                  : { backgroundColor: T.surfaceAlt, borderColor: T.border }]}
              >
                <Text style={{ color: form.tag === t ? "#fff" : T.textMuted, fontSize: 12, fontWeight: "600" }}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Publish Toggle */}
        <View style={[styles.toggleRow, { backgroundColor: T.surface, borderColor: T.border }]}>
          <View>
            <Text style={[styles.toggleTitle, { color: T.text }]}>Publish Immediately</Text>
            <Text style={[styles.toggleSub, { color: T.textMuted }]}>Turn off to save as draft</Text>
          </View>
          <Switch
            value={publishNow}
            onValueChange={setPublishNow}
            trackColor={{ false: T.surfaceAlt, true: T.primary + "80" }}
            thumbColor={publishNow ? T.primary : T.textDim}
          />
        </View>

        <TouchableOpacity
          onPress={handlePublish}
          disabled={loading}
          style={[styles.submitBtn, { backgroundColor: T.primary, opacity: loading ? 0.7 : 1 }]}
        >
          {loading ? <ActivityIndicator color="#fff" /> : (
            <Text style={styles.submitBtnText}>{publishNow ? "Publish Event" : "Save as Draft"}</Text>
          )}
        </TouchableOpacity>

        {Platform.OS !== "web" && showDatePicker && (
          <DateTimePicker
            value={dateObj}
            mode="date"
            display="default"
            onChange={onDateChange}
          />
        )}
        {Platform.OS !== "web" && showTimePicker && (
          <DateTimePicker
            value={dateObj}
            mode="time"
            display="default"
            onChange={onTimeChange}
          />
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centerContainer: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24, gap: 24 },
  header: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingTop: 50, paddingBottom: 16, borderBottomWidth: 1 },
  title: { fontSize: 16, fontWeight: "900" },
  scrollContent: { padding: 16, paddingBottom: 100, gap: 16 },
  fieldCol: { gap: 6 },
  label: { fontSize: 12, fontWeight: "600" },
  tagsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 4 },
  chipBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1 },
  toggleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 14, borderRadius: 16, borderWidth: 1 },
  toggleTitle: { fontSize: 14, fontWeight: "bold" },
  toggleSub: { fontSize: 11, marginTop: 2 },
  submitBtn: { width: "100%", paddingVertical: 14, borderRadius: 16, alignItems: "center", marginTop: 8 },
  submitBtnText: { color: "#fff", fontSize: 14, fontWeight: "bold" },
  successIconWrapper: { width: 80, height: 80, borderRadius: 40, alignItems: "center", justifyContent: "center" },
  successTextContainer: { alignItems: "center" },
  successTitle: { fontSize: 20, fontWeight: "900" },
  successDesc: { fontSize: 14, marginTop: 4, textAlign: "center" },
  mainBtn: { width: "100%", paddingVertical: 14, borderRadius: 16, alignItems: "center" },
  mainBtnText: { color: "#fff", fontSize: 14, fontWeight: "bold" },
});
