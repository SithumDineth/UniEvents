
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Bell, Calendar, CalendarPlus, Clock, Edit, MapPin, Users } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { BackBtn } from "../../../components/BackBtn";
import { ErrorView } from "../../../components/ErrorView";
import { LoadingIndicator } from "../../../components/LoadingIndicator";
import { Tag } from "../../../components/Tag";
import { useTheme } from "../../../contexts/ThemeContext";
import { apiGetEventById } from "../../../services/api";
import { addEventToCalendar } from "../../../utils/calendar";

export default function AdminDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { theme: T } = useTheme();

  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setError(null);
        const eventData = await apiGetEventById(id);
        setEvent(eventData);
      } catch (e: any) {
        setError(e.message || "Could not load event details.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) {
    return <LoadingIndicator style={{ backgroundColor: T.bg }} text="Loading event details..." />;
  }

  if (error || !event) {
    return (
      <View style={{ flex: 1, backgroundColor: T.bg }}>
        <View style={[styles.topBar, { position: "absolute", top: 50, left: 16, right: 16, zIndex: 10 }]}>
          <BackBtn T={T} onBack={() => router.back()} />
        </View>
        <ErrorView message={error || "Could not load event details."} onRetry={router.back} style={{ backgroundColor: T.bg }} />
      </View>
    );
  }

  const accentColor = T[event.accentKey as keyof typeof T] as string || T.primary;

  return (
    <View style={[styles.container, { backgroundColor: T.bg }]}>
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: event.image }} style={styles.image} />
          <LinearGradient
            colors={["rgba(5,10,25,0.95)", "rgba(0,0,0,0.25)"]}
            start={{ x: 0, y: 1 }} end={{ x: 0, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.topBar}>
            <BackBtn T={T} onBack={() => router.back()} />
            <View style={styles.topActions}>
              <TouchableOpacity onPress={() => router.push(`/(admin)/edit/${id}`)} style={styles.actionBtn}>
                <Edit size={17} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.imageOverlayContent}>
            <View style={{ alignSelf: "flex-start", marginBottom: 4 }}>
              <Tag label={event.tag} accent={accentColor} />
            </View>
            <Text style={styles.title}>{event.title}</Text>
          </View>
        </View>

        <View style={[styles.statsCard, { backgroundColor: T.surface, borderColor: T.border }]}>
          {[
            { icon: Calendar, label: event.date, sub: "Date" },
            { icon: Clock, label: event.time, sub: "Time" },
            { icon: Users, label: `${event.attendeesCount}`, sub: "Registered" },
          ].map(({ icon: Icon, label, sub }) => (
            <View key={sub} style={styles.statItem}>
              <Icon size={16} color={T.primary} style={{ marginBottom: 2 }} />
              <Text style={[styles.statLabel, { color: T.text }]}>{label}</Text>
              <Text style={[styles.statSub, { color: T.textMuted }]}>{sub}</Text>
            </View>
          ))}
        </View>

        <View style={styles.content}>
          <TouchableOpacity
            onPress={() =>
              addEventToCalendar(
                event.title,
                event.date,
                event.time,
                event.location,
                event.description
              )
            }
            style={[styles.calendarBtn, { backgroundColor: T.primarySoft, borderColor: T.primary + "40" }]}
          >
            <CalendarPlus size={16} color={T.primary} />
            <Text style={[styles.calendarBtnText, { color: T.primary }]}>Add to Calendar</Text>
          </TouchableOpacity>

          {[
            { icon: MapPin, label: "Location", val: event.location },
            { icon: Users, label: "Organized by", val: event.organizer },
          ].map(({ icon: Icon, label, val }) => (
            <View key={label} style={[styles.infoCard, { backgroundColor: T.surface, borderColor: T.border }]}>
              <View style={[styles.infoIconWrapper, { backgroundColor: T.primarySoft }]}>
                <Icon size={17} color={T.primary} />
              </View>
              <View>
                <Text style={[styles.infoLabel, { color: T.textMuted }]}>{label}</Text>
                <Text style={[styles.infoVal, { color: T.text }]}>{val}</Text>
              </View>
            </View>
          ))}

          <View style={styles.aboutSection}>
            <Text style={[styles.aboutTitle, { color: T.text }]}>About this Event</Text>
            <Text style={[styles.aboutText, { color: T.textMuted }]}>{event.description}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: T.surface + "F8", borderColor: T.border }]}>
        <TouchableOpacity
          onPress={() => router.push(`/(admin)/registered/${id}`)}
          style={[styles.mainBtn, { backgroundColor: T.primary }]}
        >
          <Text style={styles.mainBtnText}>
            View Registered Students
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  imageContainer: { height: 220, width: "100%" },
  image: { width: "100%", height: "100%" },
  topBar: { position: "absolute", top: 50, left: 16, right: 16, flexDirection: "row", justifyContent: "space-between" },
  topActions: { flexDirection: "row", gap: 8 },
  actionBtn: { width: 36, height: 36, borderRadius: 12, backgroundColor: "rgba(0,0,0,0.4)", alignItems: "center", justifyContent: "center" },
  imageOverlayContent: { position: "absolute", bottom: 12, left: 16, right: 16 },
  title: { color: "#fff", fontSize: 20, fontWeight: "900", maxWidth: 280 },
  statsCard: { marginHorizontal: 16, marginTop: -16, padding: 12, borderRadius: 16, flexDirection: "row", justifyContent: "space-around", borderWidth: 1, zIndex: 10 },
  statItem: { alignItems: "center", gap: 2 },
  statLabel: { fontSize: 12, fontWeight: "bold" },
  statSub: { fontSize: 10 },
  content: { padding: 16, paddingBottom: 100, gap: 12 },
  calendarBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  calendarBtnText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  infoCard: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 16, borderWidth: 1 },
  infoIconWrapper: { width: 36, height: 36, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  infoLabel: { fontSize: 11, fontWeight: "500" },
  infoVal: { fontSize: 13, fontWeight: "bold" },
  aboutSection: { marginTop: 8 },
  aboutTitle: { fontSize: 14, fontWeight: "bold", marginBottom: 8 },
  aboutText: { fontSize: 13, lineHeight: 20 },
  footer: { position: "absolute", bottom: 0, left: 0, right: 0, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 20, borderTopWidth: 1 },
  mainBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 16, borderRadius: 16, elevation: 5 },
  mainBtnText: { color: "#fff", fontSize: 14, fontWeight: "bold" },
});

