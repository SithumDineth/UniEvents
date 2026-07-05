import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Calendar, CheckCircle, EyeOff, Globe, Send, Trash2, Users } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "@/contexts/ThemeContext";
import { apiDeleteEvent, apiGetAllEventsAdmin, apiMarkEventCompleted, apiUpdateEvent } from "@/services/api";
import { isEventCompleted } from "@/utils/eventHelpers";

export default function AdminManage() {
  const router = useRouter();
  const { theme: T } = useTheme();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const sortAdminEvents = (events: any[]) => {
    return [...events].sort((a, b) => {
      const aCompleted = isEventCompleted(a);
      const bCompleted = isEventCompleted(b);
      
      // Completed events at bottom
      if (aCompleted !== bCompleted) {
        return aCompleted ? 1 : -1;
      }
      
      // Both active/completed: sort by creation date newest first
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  };
  
  // Split into active and completed
  const activeEvents = events.filter(e => !isEventCompleted(e));
  const completedEvents = events.filter(e => isEventCompleted(e));

  const loadEvents = async () => {
    setLoading(true);
    try {
      const data = await apiGetAllEventsAdmin();
      const sorted = sortAdminEvents(data);
      setEvents(sorted);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const togglePublish = async (event: any) => {
    try {
      const updated = await apiUpdateEvent(event._id, { published: !event.published });
      setEvents(prev => sortAdminEvents(prev.map(e => e._id === updated._id ? updated : e)));
    } catch (e) {
      Alert.alert("Error", "Could not update event status");
    }
  };

  const handleComplete = (event: any) => {
    Alert.alert(
      "Mark Event as Completed?",
      "This event will no longer be available for registration.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes, Complete",
          style: "destructive",
          onPress: async () => {
            try {
              const updated = await apiMarkEventCompleted(event._id);
              setEvents(prev => sortAdminEvents(prev.map(e => e._id === updated.event._id ? updated.event : e)));
            } catch (e) {
              Alert.alert("Error", "Could not mark event as completed");
            }
          }
        }
      ]
    );
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      "Delete Event",
      "Are you sure you want to delete this event? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await apiDeleteEvent(id);
              setEvents(prev => sortAdminEvents(prev.filter(e => e._id !== id)));
            } catch (e) {
              Alert.alert("Error", "Could not delete event");
            }
          }
        }
      ]
    );
  };

  const renderEvent = ({ item: event }: { item: any }) => (
    <View style={[styles.eventCard, { backgroundColor: T.surface, borderColor: T.border, opacity: isEventCompleted(event) ? 0.7 : 1 }]}>
      <View style={styles.cardHeader}>
        <View style={styles.headerLeft}>
          <Text style={[styles.eventTitle, { color: T.text }]} numberOfLines={1}>{event.title}</Text>
          <Text style={{ fontSize: 11, color: T.textMuted }}>{event.category}</Text>
        </View>
        <View style={{ gap: 8, flexDirection: "row" }}>
          {isEventCompleted(event) && (
            <View style={[styles.statusBadge, { backgroundColor: T.orange + "20", borderColor: T.orange }]}>
              <CheckCircle size={10} color={T.orange} />
              <Text style={[styles.statusText, { color: T.orange }]}>Completed</Text>
            </View>
          )}
          <View style={[styles.statusBadge, { backgroundColor: event.published ? T.green + "20" : T.surfaceAlt, borderColor: event.published ? T.green : T.border }]}>
            {event.published ? <Globe size={10} color={T.green} /> : <EyeOff size={10} color={T.textMuted} />}
            <Text style={[styles.statusText, { color: event.published ? T.green : T.textMuted }]}>
              {event.published ? "Published" : "Draft"}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Calendar size={12} color={T.primary} />
          <Text style={[styles.statVal, { color: T.text }]}>{event.date}</Text>
        </View>
        <View style={styles.statItem}>
          <Users size={12} color={T.primary} />
          <Text style={[styles.statVal, { color: T.text }]}>{event.attendeesCount} / {event.capacity}</Text>
        </View>
      </View>

      <View style={[styles.actionsRow, { borderTopColor: T.border }]}>
        <TouchableOpacity
          onPress={() => togglePublish(event)}
          style={[styles.actionBtn, { backgroundColor: T.surfaceAlt }]}
          disabled={event.completed}
        >
          <Text style={[styles.actionText, { color: T.text, opacity: event.completed ? 0.5 : 1 }]}>
            {event.published ? "Unpublish" : "Publish"}
          </Text>
        </TouchableOpacity>
        {!event.completed && (
          <TouchableOpacity
            onPress={() => handleComplete(event)}
            style={[styles.actionBtn, { backgroundColor: T.orange + "20" }]}
          >
            <Text style={[styles.actionText, { color: T.orange }]}>Complete</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          onPress={() => router.push(`/(admin)/edit/${event._id}`)}
          style={[styles.actionBtn, { backgroundColor: T.primarySoft }]}
          disabled={event.completed}
        >
          <Text style={[styles.actionText, { color: T.primary, opacity: event.completed ? 0.5 : 1 }]}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleDelete(event._id)}
          style={[styles.iconBtn, { backgroundColor: T.red + "20" }]}
        >
          <Trash2 size={16} color={T.red} />
        </TouchableOpacity>
      </View>
    </View>
  );

  // Create list data with section headers
  const listData = [
    ...activeEvents,
    ...(completedEvents.length > 0 ? [{ id: "completed-header", isHeader: true, title: "Completed Events" }] : []),
    ...completedEvents,
  ];

  const renderItem = ({ item }: { item: any }) => {
    if (item.isHeader) {
      return (
        <Text style={[styles.sectionHeader, { color: T.text }]}>{item.title}</Text>
      );
    }
    return renderEvent({ item });
  };

  return (
    <View style={[styles.container, { backgroundColor: T.bg }]}>
      <LinearGradient colors={T.gradientHeader} style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>Manage Events</Text>
            <Text style={styles.headerSub}>Manage all draft and published events</Text>
          </View>
          <TouchableOpacity onPress={() => router.push("/(admin)/push")} style={styles.pushBtn}>
            <Send size={16} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={T.primary} />
        </View>
      ) : events.length === 0 ? (
        <View style={styles.center}>
          <Text style={{ color: T.textMuted }}>No events found.</Text>
        </View>
      ) : (
        <FlatList
          data={listData}
          keyExtractor={(item) => item._id || item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 50, paddingBottom: 20, paddingHorizontal: 20 },
  headerTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  headerTitle: { color: "#fff", fontSize: 24, fontWeight: "bold" },
  headerSub: { color: "rgba(255,255,255,0.7)", fontSize: 13, marginTop: 4 },
  pushBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  listContent: { padding: 16, paddingBottom: 100 },
  sectionHeader: { fontSize: 14, fontWeight: "bold", marginTop: 18, marginBottom: 12 },
  eventCard: { borderRadius: 16, borderWidth: 1, padding: 14, marginBottom: 12 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 },
  headerLeft: { flex: 1, marginRight: 8 },
  eventTitle: { fontSize: 14, fontWeight: "bold", marginBottom: 2 },
  statusBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, borderWidth: 1 },
  statusText: { fontSize: 10, fontWeight: "bold" },
  statsRow: { flexDirection: "row", gap: 16, marginBottom: 16 },
  statItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  statVal: { fontSize: 12, fontWeight: "600" },
  actionsRow: { flexDirection: "row", padding: 12, borderTopWidth: 1, gap: 8 },
  actionBtn: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  actionText: { fontSize: 13, fontWeight: "bold" },
  iconBtn: { width: 36, height: 36, borderRadius: 8, alignItems: "center", justifyContent: "center" },
});
