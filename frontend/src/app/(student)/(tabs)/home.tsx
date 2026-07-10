import AsyncStorage from "@react-native-async-storage/async-storage";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useRouter } from "expo-router";
import {
    Bell,
    Calendar,
    ChevronRight,
    Clock,
    MapPin,
    Search,
    Sparkles,
    Users,
} from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react";
import {
    BackHandler,
    Modal,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { ErrorView } from "../../../components/ErrorView";
import { LoadingIndicator } from "../../../components/LoadingIndicator";
import { Tag } from "../../../components/Tag";
import { CATEGORIES } from "../../../constants/MockData";
import { useTheme } from "../../../contexts/ThemeContext";
import { apiGetEvents, apiGetNotifications, apiGetRecommendations } from "../../../services/api";
import { isEventCompleted, sortEvents } from "../../../utils/eventHelpers";

// Greeting based on time of day
function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning 👋";
  if (h < 17) return "Good afternoon 👋";
  return "Good evening 👋";
}

export default function HomeScreen() {
  const router = useRouter();
  const { theme: T } = useTheme();
  const [activeCategory, setActiveCategory] = useState("All");
  const [events, setEvents] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);

  // Mock notification state
  const [showMockNotification, setShowMockNotification] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setError(null);
      const [eventsData, recsData, userStr] = await Promise.all([
        apiGetEvents(activeCategory === "All" ? {} : { category: activeCategory }),
        apiGetRecommendations().catch(() => []),
        AsyncStorage.getItem("user"),
      ]);
      // Sort events using our helper
      const sortedEvents = sortEvents(eventsData);
      setEvents(sortedEvents);
      // Filter out completed events from AI recommendations
      const filteredRecs = recsData.filter(e => !isEventCompleted(e));
      setRecommendations(filteredRecs);
      if (userStr) setUser(JSON.parse(userStr));
    } catch (e: any) {
      console.error("Error loading home data:", e);
      setError(e.message || "Failed to load events. Please check your connection and try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeCategory]);

  useEffect(() => { loadData(); }, [loadData]);

  // Reload data and notifications on focus
  useFocusEffect(
    useCallback(() => {
      loadData();
      const fetchNotifications = async () => {
        try {
          const notifications = await apiGetNotifications();
          const hasUnread = notifications.some((n: any) => !n.isRead);
          setHasUnreadNotifications(hasUnread);
        } catch (e) {
          console.log("Error fetching notifications", e);
        }
      };
      fetchNotifications();
    }, [loadData])
  );

  // Prevent Android back gesture from leaving home screen
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => true; // block back
      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [])
  );

  useEffect(() => {
    const checkNotificationPrompt = async () => {
      const prompted = await AsyncStorage.getItem("mock_notification_prompted");
      if (!prompted) {
        // Show after 1.5 seconds for a natural feel
        setTimeout(() => setShowMockNotification(true), 1500);
      }
    };
    checkNotificationPrompt();
  }, []);

  const handleNotificationResponse = async () => {
    await AsyncStorage.setItem("mock_notification_prompted", "true");
    setShowMockNotification(false);
  };

  const onRefresh = () => { setRefreshing(true); loadData(); };

  // Split events into upcoming and completed
  const upcomingEvents = events.filter(e => !isEventCompleted(e));
  const completedEvents = events.filter(e => isEventCompleted(e));
  // Use the first featured event, or first upcoming event, as the hero card
  const featured = upcomingEvents.find(e => e.featured) || upcomingEvents[0];

  if (loading) {
    return (
      <LoadingIndicator
        style={{ backgroundColor: T.bg }}
        text="Loading events..."
      />
    );
  }

  if (error) {
    return <ErrorView message={error} onRetry={loadData} style={{ backgroundColor: T.bg }} />;
  }

  return (
    <View style={[styles.container, { backgroundColor: T.bg }]}>
      {/* Mock Notification Permission Modal */}
      <Modal visible={showMockNotification} transparent animationType="fade">
        <View style={styles.mockModalOverlay}>
          <View style={[styles.mockModalContent, { backgroundColor: T.surface, borderColor: T.border }]}>
            <View style={[styles.mockModalIcon, { backgroundColor: T.primarySoft }]}>
              <Bell size={24} color={T.primary} />
            </View>
            <Text style={[styles.mockModalTitle, { color: T.text }]}>Turn on Notifications?</Text>
            <Text style={[styles.mockModalText, { color: T.textMuted }]}>
              UniEvents would like to send you notifications for upcoming events, reminders, and AI recommendations.
            </Text>
            <View style={styles.mockModalActions}>
              <TouchableOpacity onPress={handleNotificationResponse} style={[styles.mockModalBtn, { borderRightWidth: 1, borderColor: T.border }]}>
                <Text style={[styles.mockModalBtnText, { color: T.textMuted, fontWeight: "normal" }]}>Don't Allow</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleNotificationResponse} style={styles.mockModalBtn}>
                <Text style={[styles.mockModalBtnText, { color: T.primary }]}>Allow</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <LinearGradient colors={T.gradientHeader} style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.userName}>{user?.name || "Welcome!"}</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={() => router.push("/(student)/notifications")} style={styles.iconBtn}>
              <Bell size={17} color="#fff" />
              {hasUnreadNotifications && <View style={[styles.badge, { backgroundColor: T.red }]} />}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push("/(student)/profile")} style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.name ? user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) : "U"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <TouchableOpacity onPress={() => router.push("/(student)/search")} style={styles.searchBar}>
          <Search size={15} color="rgba(255,255,255,0.6)" />
          <Text style={styles.searchText}>Search events, workshops...</Text>
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={T.primary} />}
      >

        {/* ── AI Recommendations Section ─────────────────────────────── */}
        {recommendations.length > 0 && (
          <View style={styles.section}>
            {/* Header row */}
            <View style={styles.sectionHeader}>
              <View style={styles.aiHeaderLeft}>
                <View style={[styles.aiIconBadge, { backgroundColor: T.primarySoft }]}>
                  <Sparkles size={14} color={T.primary} />
                </View>
                <View>
                  <Text style={[styles.sectionTitle, { color: T.text }]}>AI Picks For You</Text>
                  <Text style={[styles.aiSubtitle, { color: T.textMuted }]}>
                    Based on your interests & activity
                  </Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => router.push("/(student)/search")}>
                <Text style={[styles.seeAll, { color: T.primary }]}>See all</Text>
              </TouchableOpacity>
            </View>

            {/* Horizontal cards */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.aiCardsScroll}
            >
              {recommendations.map(event => (
                <TouchableOpacity
                  key={event._id}
                  onPress={() => router.push(`/(student)/detail/${event._id}`)}
                  style={[styles.aiCard, { backgroundColor: T.surface, borderColor: T.border }]}
                >
                  <Image source={{ uri: event.image }} style={styles.aiCardImage} />
                  <LinearGradient
                    colors={["transparent", "rgba(10,13,30,0.85)"]}
                    style={styles.aiCardGradient}
                  />
                  <View style={[styles.aiCardBadge, { backgroundColor: T.primary }]}>
                    <Sparkles size={9} color="#fff" />
                    <Text style={styles.aiCardBadgeText}>AI Pick</Text>
                  </View>
                  <View style={styles.aiCardContent}>
                    <Text style={styles.aiCardTitle} numberOfLines={2}>{event.title}</Text>
                    <View style={styles.aiCardMeta}>
                      <Calendar size={9} color="rgba(255,255,255,0.7)" />
                      <Text style={styles.aiCardMetaText}>{event.date}</Text>
                      <Users size={9} color="rgba(255,255,255,0.7)" />
                      <Text style={styles.aiCardMetaText}>{event.attendeesCount}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* No interests set yet — nudge */}
        {recommendations.length === 0 && (
          <TouchableOpacity
            onPress={() => router.push("/(student)/profile")}
            style={[styles.aiNudge, { backgroundColor: T.primarySoft, borderColor: T.primary + "25" }]}
          >
            <Sparkles size={16} color={T.primary} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.aiNudgeTitle, { color: T.text }]}>Set your interests</Text>
              <Text style={[styles.aiNudgeSub, { color: T.textMuted }]}>
                Update your profile to get AI-powered event recommendations
              </Text>
            </View>
            <ChevronRight size={14} color={T.textMuted} />
          </TouchableOpacity>
        )}

        {/* ── Featured Event Hero ────────────────────────────────────── */}
        {featured && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: T.text }]}>Featured Event</Text>
              <TouchableOpacity onPress={() => router.push("/(student)/search")}>
                <Text style={[styles.seeAll, { color: T.primary }]}>See all</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              onPress={() => router.push(`/(student)/detail/${featured._id}`)}
              style={[styles.featuredCard, { borderColor: T.border }]}
            >
              <View style={styles.featuredImageContainer}>
                <Image source={{ uri: featured.image }} style={styles.featuredImage} />
                <LinearGradient
                  colors={["rgba(5,10,25,0.92)", "transparent"]}
                  start={{ x: 0, y: 1 }} end={{ x: 0, y: 0.45 }}
                  style={StyleSheet.absoluteFill}
                />
                <View style={styles.featuredTag}>
                  <Tag label={featured.tag} accent={T[featured.accentKey as keyof typeof T] as string} />
                </View>
                <View style={styles.featuredContent}>
                  <Text style={styles.featuredTitle}>{featured.title}</Text>
                  <View style={styles.featuredMeta}>
                    <View style={styles.metaItem}>
                      <Calendar size={10} color="rgba(255,255,255,0.6)" />
                      <Text style={styles.metaText}>{featured.date}</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Users size={10} color="rgba(255,255,255,0.6)" />
                      <Text style={styles.metaText}>{featured.attendeesCount} going</Text>
                    </View>
                  </View>
                </View>
              </View>
              <View style={[styles.featuredFooter, { backgroundColor: T.surface }]}>
                <View style={styles.metaItem}>
                  <MapPin size={12} color={T.primary} />
                  <Text style={{ fontSize: 12, color: T.textMuted }}>{featured.location}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => router.push(`/(student)/detail/${featured._id}`)}
                  style={[styles.registerBtn, { backgroundColor: T.primary }]}
                >
                  <Text style={styles.registerBtnText}>Register</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* ── Categories ────────────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: T.text, marginBottom: 10 }]}>Categories</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catScroll}>
            {CATEGORIES.map(cat => {
              const isActive = activeCategory === cat.label;
              return (
                <TouchableOpacity
                  key={cat.label}
                  onPress={() => setActiveCategory(cat.label)}
                  style={[
                    styles.catBtn,
                    isActive
                      ? { backgroundColor: T.primary }
                      : { backgroundColor: T.surface, borderColor: T.border, borderWidth: 1 },
                  ]}
                >
                  <cat.icon size={12} color={isActive ? "#fff" : T.textMuted} />
                  <Text style={[styles.catText, { color: isActive ? "#fff" : T.textMuted }]}>{cat.label}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* ── Upcoming Events ───────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: T.text, marginBottom: 12 }]}>Upcoming Events</Text>
          {upcomingEvents.length === 0 ? (
            <View style={[styles.emptyState, { backgroundColor: T.surface, borderColor: T.border }]}>
              <Text style={[styles.emptyText, { color: T.textMuted }]}>No upcoming events in this category.</Text>
            </View>
          ) : (
            <View style={styles.eventList}>
              {upcomingEvents.map(event => (
                <TouchableOpacity
                  key={event._id}
                  onPress={() => router.push(`/(student)/detail/${event._id}`)}
                  style={[styles.eventCard, { backgroundColor: T.surface, borderColor: T.border }]}
                >
                  <Image source={{ uri: event.image }} style={styles.eventImage} />
                  <View style={styles.eventDetails}>
                    <View style={styles.eventHeader}>
                      <Text style={[styles.eventTitle, { color: T.text }]} numberOfLines={1}>{event.title}</Text>
                      <Tag label={event.tag} accent={T[event.accentKey as keyof typeof T] as string} />
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
              ))}
            </View>
          )}
        </View>

        {/* ── Completed Events ─────────────────────────────────────── */}
        {completedEvents.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: T.text, marginBottom: 12 }]}>Completed Events</Text>
            <View style={styles.eventList}>
              {completedEvents.map(event => (
                <TouchableOpacity
                  key={event._id}
                  onPress={() => router.push(`/(student)/detail/${event._id}`)}
                  style={[
                    styles.eventCard,
                    { 
                      backgroundColor: T.surface, 
                      borderColor: T.border,
                      opacity: 0.7 
                    }
                  ]}
                >
                  <Image source={{ uri: event.image }} style={styles.eventImage} />
                  <View style={styles.eventDetails}>
                    <View style={styles.eventHeader}>
                      <Text style={[styles.eventTitle, { color: T.text }]} numberOfLines={1}>{event.title}</Text>
                      <Tag label={event.tag} accent={T[event.accentKey as keyof typeof T] as string} />
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
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 50, paddingBottom: 16 },
  headerTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  greeting: { fontSize: 12, fontWeight: "500", color: "rgba(255,255,255,0.7)" },
  userName: { fontSize: 18, fontWeight: "900", color: "#fff" },
  headerActions: { flexDirection: "row", gap: 8 },
  iconBtn: { width: 36, height: 36, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.15)", alignItems: "center", justifyContent: "center" },
  badge: { position: "absolute", top: 4, right: 4, width: 8, height: 8, borderRadius: 4 },
  avatar: { width: 36, height: 36, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.25)", alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 14, fontWeight: "bold", color: "#fff" },
  searchBar: { flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 10, backgroundColor: "rgba(255,255,255,0.15)", borderColor: "rgba(255,255,255,0.2)", borderWidth: 1 },
  searchText: { fontSize: 14, color: "rgba(255,255,255,0.6)" },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 100 },
  section: { paddingHorizontal: 16, marginTop: 18 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  sectionTitle: { fontWeight: "bold", fontSize: 14 },
  seeAll: { fontSize: 12, fontWeight: "600" },
  // AI section
  aiHeaderLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  aiIconBadge: { width: 32, height: 32, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  aiSubtitle: { fontSize: 11, marginTop: 1 },
  aiCardsScroll: { gap: 12, paddingBottom: 4 },
  aiCard: { width: 180, height: 140, borderRadius: 16, overflow: "hidden", borderWidth: 1 },
  aiCardImage: { width: "100%", height: "100%" },
  aiCardGradient: { ...StyleSheet.absoluteFillObject },
  aiCardBadge: { position: "absolute", top: 8, left: 8, flexDirection: "row", alignItems: "center", gap: 3, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 8 },
  aiCardBadgeText: { fontSize: 9, fontWeight: "800", color: "#fff" },
  aiCardContent: { position: "absolute", bottom: 0, left: 0, right: 0, padding: 10 },
  aiCardTitle: { fontSize: 12, fontWeight: "800", color: "#fff", lineHeight: 16 },
  aiCardMeta: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 },
  aiCardMetaText: { fontSize: 9, color: "rgba(255,255,255,0.7)" },
  // Nudge
  aiNudge: { marginHorizontal: 16, marginTop: 16, flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 16, padding: 14, borderWidth: 1 },
  aiNudgeTitle: { fontSize: 13, fontWeight: "700" },
  aiNudgeSub: { fontSize: 11, marginTop: 2 },
  // Featured
  featuredCard: { borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  featuredImageContainer: { height: 150 },
  featuredImage: { width: "100%", height: "100%" },
  featuredTag: { position: "absolute", top: 10, left: 10 },
  featuredContent: { position: "absolute", bottom: 0, left: 0, right: 0, padding: 12 },
  featuredTitle: { fontSize: 16, fontWeight: "900", color: "#fff" },
  featuredMeta: { flexDirection: "row", gap: 12, marginTop: 4 },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { fontSize: 11, color: "rgba(255,255,255,0.6)" },
  featuredFooter: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 12, paddingVertical: 10 },
  registerBtn: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8 },
  registerBtnText: { fontSize: 11, fontWeight: "bold", color: "#fff" },
  // Categories
  catScroll: { gap: 8, paddingBottom: 4 },
  catBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  catText: { fontSize: 12, fontWeight: "600" },
  // Events
  eventList: { gap: 12 },
  eventCard: { flexDirection: "row", gap: 12, padding: 12, borderRadius: 16, borderWidth: 1 },
  eventImage: { width: 64, height: 64, borderRadius: 12 },
  eventDetails: { flex: 1, justifyContent: "center" },
  eventHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 4 },
  eventTitle: { flex: 1, fontSize: 13, fontWeight: "bold" },
  eventMetaRow: { flexDirection: "row", gap: 8, marginTop: 6 },
  eventFooterRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 6 },
  emptyState: { padding: 24, borderRadius: 16, borderWidth: 1, alignItems: "center" },
  emptyText: { fontSize: 13 },
  // Mock Modal
  mockModalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center", padding: 24 },
  mockModalContent: { width: 300, borderRadius: 16, borderWidth: 1, alignItems: "center", paddingTop: 24, overflow: "hidden" },
  mockModalIcon: { width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center", marginBottom: 16 },
  mockModalTitle: { fontSize: 17, fontWeight: "bold", marginBottom: 8 },
  mockModalText: { fontSize: 13, textAlign: "center", paddingHorizontal: 20, marginBottom: 20, lineHeight: 18 },
  mockModalActions: { flexDirection: "row", borderTopWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  mockModalBtn: { flex: 1, paddingVertical: 14, alignItems: "center", justifyContent: "center" },
  mockModalBtnText: { fontSize: 15, fontWeight: "bold" },
});
