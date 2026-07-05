import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Bell, Calendar, CalendarPlus, CheckCircle2, Clock, Heart, MapPin, Share2, Sparkles, Users } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, Share, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { BackBtn } from "@/components/BackBtn";
import { ErrorView } from "@/components/ErrorView";
import { LoadingIndicator } from "@/components/LoadingIndicator";
import { Tag } from "@/components/Tag";
import { useTheme } from "@/contexts/ThemeContext";
import { apiCheckRegistration, apiGetEventById, apiToggleRegistration, apiToggleSavedEvent } from "@/services/api";
import { addEventToCalendar } from "@/utils/calendar";
import { isEventCompleted } from "@/utils/eventHelpers";
import { hasReminder, removeReminder, scheduleEventReminder } from "@/utils/reminders";

export default function DetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { theme: T } = useTheme();

  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [registered, setRegistered] = useState(false);
  const [saved, setSaved] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [hasReminderSet, setHasReminderSet] = useState(false);
  const [loadingReminder, setLoadingReminder] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setError(null);
        const [eventData, statusData] = await Promise.all([
          apiGetEventById(id),
          apiCheckRegistration(id).catch(() => ({ registered: false, saved: false })),
        ]);
        setEvent(eventData);
        setRegistered(statusData.registered);
        setSaved(statusData.saved || false);
        // Check if reminder is set
        const reminderExists = await hasReminder(id);
        setHasReminderSet(reminderExists);
      } catch (e: any) {
        setError(e.message || "Could not load event details.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleReminder = async () => {
    if (!event) return;
    if (isEventCompleted(event)) {
      Alert.alert("Sorry", "You can't set a reminder for a completed event.");
      return;
    }
    setLoadingReminder(true);
    try {
      if (hasReminderSet) {
        await removeReminder(id);
        setHasReminderSet(false);
        Alert.alert("Reminder Removed", "You will no longer receive a reminder for this event.");
      } else {
        // Parse event date (assuming event.date is something like "Mon, Jul 5" and event.time is "10:00 AM")
        let eventDate;
        try {
          if (event.dateTime) {
            eventDate = new Date(event.dateTime);
          } else {
            // Try to add current year to date string for proper parsing
            const currentYear = new Date().getFullYear();
            let dateString = `${event.date} ${currentYear} ${event.time}`;
            eventDate = new Date(dateString);
            
            // If date is still invalid or in past, try a fallback date: tomorrow
            if (isNaN(eventDate.getTime()) || eventDate < new Date()) {
              const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000); // Tomorrow at same time
              eventDate = tomorrow;
            }
          }
        } catch (e) {
          // Fallback to tomorrow if all else fails
          eventDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
        }

        const reminder = await scheduleEventReminder(id, event.title, eventDate);
        if (reminder) {
          setHasReminderSet(true);
          Alert.alert("Reminder Set!", "You'll receive a notification 1 day before this event starts.");
        } else {
          Alert.alert("Oops!", "Couldn't set a reminder for this event (it might be starting too soon).");
        }
      }
    } catch (e) {
      Alert.alert("Error", "Something went wrong with the reminder.");
    } finally {
      setLoadingReminder(false);
    }
  };

  const handleRegister = async () => {
    setRegistering(true);
    try {
      const res = await apiToggleRegistration(id);
      setRegistered(res.registered);
      setEvent((prev: any) => ({
        ...prev,
        attendeesCount: prev.attendeesCount + (res.registered ? 1 : -1),
      }));
    } catch (e: any) {
      Alert.alert("Error", e.message || "Could not process registration.");
    } finally {
      setRegistering(false);
    }
  };

  const handleSave = async () => {
    try {
      const res = await apiToggleSavedEvent(id);
      setSaved(res.saved);
    } catch (e) {
      // Silent fail for save
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this event: "${event.title}" on UniEvents!\n\n📅 Date: ${event.date}\n⏰ Time: ${event.time}\n📍 Location: ${event.location}\n\nJoin us and register now!`,
      });
    } catch (error) {
      console.log('Error sharing:', error);
    }
  };

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

  const pct = Math.round((event.attendeesCount / event.capacity) * 100);
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
              <TouchableOpacity onPress={handleReminder} disabled={loadingReminder} style={styles.actionBtn}>
                {loadingReminder ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Bell size={17} color={hasReminderSet ? T.green : "#fff"} fill={hasReminderSet ? T.green : "transparent"} />
                )}
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSave} style={styles.actionBtn}>
                <Heart size={17} color={saved ? T.red : "#fff"} fill={saved ? T.red : "transparent"} />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleShare} style={styles.actionBtn}>
                <Share2 size={16} color="#fff" />
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
            { icon: Users, label: `${event.attendeesCount}`, sub: "Going" },
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
          <View style={[styles.regProgress, { backgroundColor: T.surface, borderColor: T.border }]}>
            <View style={styles.regHeader}>
              <Text style={[styles.regTitle, { color: T.text }]}>Registration</Text>
              <Text style={[styles.regPct, { color: accentColor }]}>{pct}% filled</Text>
            </View>
            <View style={[styles.progressBar, { backgroundColor: T.surfaceAlt }]}>
              <View style={[styles.progressFill, { width: `${Math.min(pct, 100)}%`, backgroundColor: accentColor }]} />
            </View>
            <Text style={[styles.regDesc, { color: T.textMuted }]}>{event.attendeesCount} of {event.capacity} spots taken</Text>
          </View>

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

          {event.tag === "AI Pick" && (
            <View style={[styles.aiReasonCard, { backgroundColor: T.primarySoft, borderColor: T.primary + "30" }]}>
              <Sparkles size={18} color={T.primary} style={{ marginTop: 2 }} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.aiReasonTitle, { color: T.primary }]}>Why UniEvents recommends this</Text>
                <Text style={[styles.aiReasonText, { color: T.textMuted }]}>
                  This event matches your <Text style={{ fontWeight: "bold", color: T.text }}>Tech & Programming</Text> interests.
                </Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: T.surface + "F8", borderColor: T.border }]}>
        <TouchableOpacity
          onPress={handleRegister}
          disabled={registering || (event && isEventCompleted(event))}
          style={[
            styles.mainBtn, 
            { 
              backgroundColor: registered ? T.green : (event && isEventCompleted(event) ? T.textMuted : T.primary), 
              opacity: registering || (event && isEventCompleted(event)) ? 0.7 : 1 
            }
          ]}
        >
          {registering ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              {registered && <CheckCircle2 size={18} color="#fff" />}
              <Text style={styles.mainBtnText}>
                {event && isEventCompleted(event) ? "Event Completed" : (registered ? "Registered! Tap to Unregister" : "Register for this Event")}
              </Text>
            </>
          )}
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
  regProgress: { padding: 14, borderRadius: 16, borderWidth: 1 },
  regHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  regTitle: { fontSize: 12, fontWeight: "bold" },
  regPct: { fontSize: 11, fontWeight: "600" },
  progressBar: { height: 8, borderRadius: 4, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 4 },
  regDesc: { fontSize: 10, marginTop: 6 },
  infoCard: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 16, borderWidth: 1 },
  infoIconWrapper: { width: 36, height: 36, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  infoLabel: { fontSize: 11, fontWeight: "500" },
  infoVal: { fontSize: 13, fontWeight: "bold" },
  aboutSection: { marginTop: 8 },
  aboutTitle: { fontSize: 14, fontWeight: "bold", marginBottom: 8 },
  aboutText: { fontSize: 13, lineHeight: 20 },
  aiReasonCard: { flexDirection: "row", gap: 12, padding: 14, borderRadius: 16, borderWidth: 1, marginTop: 8 },
  aiReasonTitle: { fontSize: 12, fontWeight: "bold" },
  aiReasonText: { fontSize: 11, marginTop: 2, lineHeight: 16 },
  footer: { position: "absolute", bottom: 0, left: 0, right: 0, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 20, borderTopWidth: 1 },
  mainBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 16, borderRadius: 16, elevation: 5 },
  mainBtnText: { color: "#fff", fontSize: 14, fontWeight: "bold" },
});
