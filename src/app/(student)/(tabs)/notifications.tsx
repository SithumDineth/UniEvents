import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useRouter } from "expo-router";
import { Bell, CheckCircle, Trash2 } from "lucide-react-native";
import React, { useCallback, useState } from "react";
import { FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { LoadingIndicator } from "../../../components/LoadingIndicator";
import { ErrorView } from "../../../components/ErrorView";
import { useTheme } from "../../../contexts/ThemeContext";
import { apiDeleteNotification, apiGetNotifications, apiMarkAllNotificationsRead, apiMarkNotificationRead } from "../../../services/api";

export default function NotificationsScreen() {
  const router = useRouter();
  const { theme: T } = useTheme();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = async () => {
    try {
      setError(null);
      const data = await apiGetNotifications();
      setNotifications(data);
    } catch (e: any) {
      console.log("Error fetching notifications", e);
      setError(e.message || "Failed to load notifications");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchNotifications();
    }, [])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await apiMarkNotificationRead(id);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (e) {
      console.log("Error marking as read", e);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await apiMarkAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (e) {
      console.log("Error marking all as read", e);
    }
  };

  const handleDeleteNotification = async (id: string) => {
    try {
      await apiDeleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
    } catch (e) {
      console.log("Error deleting notification", e);
    }
  };

  const renderRightActions = (id: string) => (
    <TouchableOpacity
      style={[styles.deleteAction, { backgroundColor: T.red }]}
      onPress={() => handleDeleteNotification(id)}
    >
      <Trash2 size={24} color="#fff" />
    </TouchableOpacity>
  );

  const renderItem = ({ item }: { item: any }) => (
    <Swipeable renderRightActions={() => renderRightActions(item._id)}>
      <TouchableOpacity
        onPress={() => {
          if (!item.isRead) handleMarkAsRead(item._id);
          if (item.data?.eventId) {
            router.push(`/(student)/detail/${item.data.eventId}`);
          }
        }}
        style={[
          styles.card,
          {
            backgroundColor: item.isRead ? T.surface : T.primarySoft,
            borderColor: T.border,
          },
        ]}
      >
        <View style={styles.cardIcon}>
          <Bell size={20} color={T.primary} />
        </View>
        <View style={styles.cardContent}>
          <Text style={[styles.cardTitle, { color: T.text }]}>{item.title}</Text>
          <Text style={[styles.cardBody, { color: T.textMuted }]}>{item.body}</Text>
          <Text style={[styles.cardTime, { color: T.textDim }]}>
            {new Date(item.createdAt).toLocaleString()}
          </Text>
        </View>
        {!item.isRead && <View style={[styles.unreadDot, { backgroundColor: T.primary }]} />}
      </TouchableOpacity>
    </Swipeable>
  );

  return (
    <View style={[styles.container, { backgroundColor: T.bg }]}>
      <LinearGradient colors={T.gradientHeader} style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>Notifications</Text>
          <TouchableOpacity onPress={handleMarkAllAsRead} style={styles.markAllBtn}>
            <CheckCircle size={14} color="#fff" />
            <Text style={styles.markAllText}>Mark all read</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {loading ? (
        <LoadingIndicator style={{ backgroundColor: T.bg }} text="Loading notifications..." />
      ) : error ? (
        <ErrorView message={error} onRetry={fetchNotifications} style={{ backgroundColor: T.bg }} />
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={item => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={T.primary} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Bell size={48} color={T.border} />
              <Text style={[styles.emptyText, { color: T.textMuted }]}>No notifications yet</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 50, paddingBottom: 20 },
  headerTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  title: { color: "#fff", fontSize: 24, fontWeight: "bold" },
  markAllBtn: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "rgba(255,255,255,0.2)", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  markAllText: { color: "#fff", fontSize: 12, fontWeight: "600" },
  listContent: { padding: 16, paddingBottom: 100, gap: 12 },
  card: { flexDirection: "row", padding: 16, borderRadius: 16, borderWidth: 1 },
  cardIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.05)", alignItems: "center", justifyContent: "center", marginRight: 12 },
  cardContent: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 4 },
  cardBody: { fontSize: 14, marginBottom: 8 },
  cardTime: { fontSize: 11 },
  unreadDot: { width: 10, height: 10, borderRadius: 5, marginTop: 6, marginLeft: 8 },
  emptyContainer: { alignItems: "center", justifyContent: "center", marginTop: 80 },
  emptyText: { fontSize: 16, marginTop: 12 },
  deleteAction: {
    width: 80,
    alignItems: "center",
    justifyContent: "center",
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
  },
});
