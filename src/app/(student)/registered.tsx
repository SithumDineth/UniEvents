import { Image } from "expo-image";
import { useFocusEffect, useRouter, useSegments } from "expo-router";
import { Calendar, Clock, MapPin, Users } from "lucide-react-native";
import React, { useCallback, useState } from "react";
import { BackHandler, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { BackBtn } from "../../components/BackBtn";
import { ErrorView } from "../../components/ErrorView";
import { LoadingIndicator } from "../../components/LoadingIndicator";
import { Tag } from "../../components/Tag";
import { useTheme } from "../../contexts/ThemeContext";
import { apiGetRegisteredEvents } from "../../services/api";

export default function RegisteredEventsScreen() {
  const router = useRouter();
  const { theme: T } = useTheme();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const segments = useSegments();
  const routePrefix = segments[0] === "(admin)" ? "/(admin)" : "/(student)";

  const fetchEvents = useCallback(async () => {
    try {
      setError(null);
      const data = await apiGetRegisteredEvents();
      setEvents(data);
    } catch (e: any) {
      setError(e.message || "Failed to load registered events");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchEvents();
  }, [fetchEvents]);

  useFocusEffect(
    useCallback(() => {
      fetchEvents();
    }, [fetchEvents])
  );

  // Android back gesture → go back to profile
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        router.back();
        return true;
      };
      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [router])
  );

  const renderEvent = ({ item: event }: { item: any }) => (
    <TouchableOpacity
      onPress={() => router.push(`${routePrefix}/detail/${event._id}` as any)}
      style={[styles.eventCard, { backgroundColor: T.surface, borderColor: T.border }]}
    >
      <Image source={{ uri: event.image }} style={styles.eventImage} />
      <View style={styles.eventDetails}>
        <View style={styles.eventHeader}>
          <Text style={[styles.eventTitle, { color: T.text }]} numberOfLines={1}>{event.title}</Text>
          <Tag label={event.tag} accent={T[event.accentKey as keyof typeof T] as string || T.primary} />
        </View>
        <View style={styles.eventMetaRow}>
          <View style={styles.metaItem}>
            <Calendar size={10} color={T.textMuted} />
            <Text style={{ fontSize: 11, color: T.textMuted }}>{event.date}</Text>
          </View>
          <View style={styles.metaItem}>
            <Clock size={10} color={T.textMuted} />
            <Text style={{ fontSize: 11, color: T.textMuted }}>{event.time}</Text>
          </View>
        </View>
        <View style={styles.eventFooterRow}>
          <View style={styles.metaItem}>
            <Users size={10} color={T.textMuted} />
            <Text style={{ fontSize: 11, color: T.textMuted }}>{event.attendeesCount} registered</Text>
          </View>
          <View style={styles.metaItem}>
            <MapPin size={10} color={T.textMuted} />
            <Text style={{ fontSize: 11, color: T.textMuted }} numberOfLines={1}>{event.location}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: T.bg }]}>
      <View style={[styles.header, { backgroundColor: T.surface, borderColor: T.border }]}>
        <BackBtn T={T} onBack={() => router.back()} />
        <Text style={[styles.headerTitle, { color: T.text }]}>My Registered Events</Text>
        <View style={{ width: 36 }} />
      </View>
      
      {loading ? (
        <LoadingIndicator style={{ backgroundColor: T.bg }} text="Loading registered events..." />
      ) : error ? (
        <ErrorView message={error} onRetry={fetchEvents} style={{ backgroundColor: T.bg }} />
      ) : events.length === 0 ? (
        <View style={styles.center}>
          <Text style={{ color: T.textMuted }}>You haven't registered for any events yet.</Text>
        </View>
      ) : (
        <FlatList
          data={events}
          keyExtractor={(item) => item._id}
          renderItem={renderEvent}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={T.primary} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: 50, paddingBottom: 16, paddingHorizontal: 16, borderBottomWidth: 1 },
  headerTitle: { fontSize: 16, fontWeight: "bold" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  listContent: { padding: 16, gap: 12 },
  eventCard: { flexDirection: "row", gap: 12, padding: 12, borderRadius: 16, borderWidth: 1 },
  eventImage: { width: 64, height: 64, borderRadius: 12 },
  eventDetails: { flex: 1, justifyContent: "center" },
  eventHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 4 },
  eventTitle: { flex: 1, fontSize: 13, fontWeight: "bold" },
  eventMetaRow: { flexDirection: "row", gap: 8, marginTop: 6 },
  eventFooterRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 6 },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
});
