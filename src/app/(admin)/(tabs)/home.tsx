import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useRouter } from "expo-router";
import {
    Calendar, CheckCircle2,
    FileText,
    Pencil,
    Plus,
    ShieldCheck,
    Trash2, UserPlus,
    Users,
    X,
} from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    BackHandler,
    KeyboardAvoidingView,
    Modal,
    Platform,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { ErrorView } from "../../../components/ErrorView";
import { Field } from "../../../components/Field";
import { LoadingIndicator } from "../../../components/LoadingIndicator";
import { useTheme } from "../../../contexts/ThemeContext";
import { apiDeleteEvent, apiGetAllEventsAdmin, apiGetAllUsers, apiRegister } from "../../../services/api";
import { isEventCompleted } from "../../../utils/eventHelpers";

export default function AdminDashboard() {
  const router = useRouter();
  const { theme: T } = useTheme();
  const [events, setEvents] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const sortAdminEvents = (eventList: any[]) => {
    return [...eventList].sort((a, b) => {
      const aCompleted = isEventCompleted(a);
      const bCompleted = isEventCompleted(b);
      
      if (aCompleted !== bCompleted) {
        return aCompleted ? 1 : -1;
      }
      
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  };

  // ── Create Admin Modal ──────────────────────────────────────────────────
  const [adminModalVisible, setAdminModalVisible] = useState(false);
  const [adminForm, setAdminForm] = useState({ name: "", email: "", password: "", confirmPassword: "", department: "" });
  const [adminLoading, setAdminLoading] = useState(false);
  const setA = (key: keyof typeof adminForm) => (val: string) =>
    setAdminForm(f => ({ ...f, [key]: val }));

  const handleCreateAdmin = async () => {
    if (!adminForm.name || !adminForm.email || !adminForm.password) {
      Alert.alert("Error", "Name, email and password are required.");
      return;
    }
    if (adminForm.password !== adminForm.confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }
    setAdminLoading(true);
    try {
      await apiRegister({
        name: adminForm.name,
        email: adminForm.email,
        password: adminForm.password,
        department: adminForm.department,
        role: "admin",
        adminCode: "UNIEVENTS_ADMIN_2025",
      });
      Alert.alert("✅ Success", `Admin account created for ${adminForm.name}. They can now sign in.`);
      setAdminForm({ name: "", email: "", password: "", confirmPassword: "", department: "" });
      setAdminModalVisible(false);
    } catch (e: any) {
      Alert.alert("Error", e.message || "Could not create admin account.");
    } finally {
      setAdminLoading(false);
    }
  };
  // ───────────────────────────────────────────────────────────────────────

  const loadData = useCallback(async () => {
    try {
      setError(null);
      const [eventsData, usersData] = await Promise.all([
        apiGetAllEventsAdmin(),
        apiGetAllUsers(),
      ]);
      const sortedEvents = sortAdminEvents(eventsData);
      setEvents(sortedEvents);
      setUsers(usersData);
    } catch (e: any) {
      setError(e.message || "Error loading dashboard");
      console.error("Error loading admin dashboard:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // Prevent Android back gesture from leaving home screen
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => true; // block back
      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [])
  );

  const handleDelete = (eventId: string, title: string) => {
    Alert.alert(
      "Delete Event",
      `Are you sure you want to delete "${title}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete", style: "destructive",
          onPress: async () => {
            try {
              await apiDeleteEvent(eventId);
              setEvents(prev => sortAdminEvents(prev.filter(e => e._id !== eventId)));
            } catch (e: any) {
              Alert.alert("Error", e.message || "Could not delete event.");
            }
          }
        }
      ]
    );
  };

  const published = events.filter(e => e.published).length;
  const totalAttendees = events.reduce((a, e) => a + (e.attendeesCount || 0), 0);
  const completedEventsList = events.filter(e => isEventCompleted(e));
  const upcomingEventsList = events.filter(e => !isEventCompleted(e));
  const totalStudents = users.filter(u => u.role === "student").length;

  if (loading) {
    return <LoadingIndicator style={{ backgroundColor: T.bg }} text="Loading dashboard..." />;
  }

  if (error) {
    return <ErrorView message={error} onRetry={loadEvents} style={{ backgroundColor: T.bg }} />;
  }

  return (
    <View style={[styles.container, { backgroundColor: T.bg }]}>

      {/* ── Create Admin Modal ── */}
      <Modal
        visible={adminModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setAdminModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setAdminModalVisible(false)}
          >
            <TouchableOpacity
              activeOpacity={1}
              style={[styles.modalSheet, { backgroundColor: T.surface, borderColor: T.border }]}
            >
              <View style={styles.modalHeader}>
                <View style={[styles.modalIconBadge, { backgroundColor: T.secondary + "20" }]}>
                  <ShieldCheck size={18} color={T.secondary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.modalTitle, { color: T.text }]}>Create Admin Account</Text>
                  <Text style={[styles.modalSub, { color: T.textMuted }]}>New admin can sign in immediately</Text>
                </View>
                <TouchableOpacity onPress={() => setAdminModalVisible(false)} hitSlop={10}>
                  <X size={18} color={T.textMuted} />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                <View style={styles.modalForm}>
                  <Field T={T} label="Full Name *" placeholder="e.g. Dr. Amal Silva" value={adminForm.name} onChangeText={setA("name")} />
                  <Field T={T} label="Email *" placeholder="admin@university.edu.lk" value={adminForm.email} onChangeText={setA("email")} />
                  <Field T={T} label="Department / Role" placeholder="e.g. CS Department Coordinator" value={adminForm.department} onChangeText={setA("department")} />
                  <Field T={T} label="Password *" placeholder="Set a strong password" type="password" value={adminForm.password} onChangeText={setA("password")} />
                  <Field T={T} label="Confirm Password *" placeholder="Repeat the password" type="password" value={adminForm.confirmPassword} onChangeText={setA("confirmPassword")} />

                  <TouchableOpacity
                    onPress={handleCreateAdmin}
                    disabled={adminLoading}
                    style={[styles.modalBtn, { backgroundColor: T.secondary, opacity: adminLoading ? 0.7 : 1 }]}
                  >
                    {adminLoading
                      ? <ActivityIndicator color="#fff" />
                      : <Text style={styles.modalBtnText}>Create Admin Account</Text>
                    }
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </TouchableOpacity>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>
      {/* ─────────────────────── */}

      <LinearGradient colors={T.gradientHeader} style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.subtitle}>Admin Panel</Text>
            <Text style={styles.title}>Event Dashboard</Text>
          </View>
          <TouchableOpacity
            onPress={() => setAdminModalVisible(true)}
            style={[styles.iconBtn, { backgroundColor: "rgba(255,255,255,0.2)" }]}
          >
            <UserPlus size={17} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} tintColor={T.primary} />}
      >
        <View style={styles.statsGrid}>
          {[
            { label: "Total Events", val: events.length, icon: Calendar, color: T.primary },
            { label: "Published", val: published, icon: CheckCircle2, color: T.green },
            { label: "Registrations", val: totalAttendees, icon: Users, color: T.secondary },
            { label: "Drafts", val: events.length - published, icon: FileText, color: T.orange },
            { label: "Completed", val: completedEventsList.length, icon: CheckCircle2, color: T.purple || "#9333ea" },
            { label: "Total Students", val: totalStudents, icon: UserPlus, color: T.blue || "#0ea5e9" },
          ].map((s) => (
            <View key={s.label} style={[styles.statCard, { backgroundColor: T.surface, borderColor: T.border }]}>
              <View style={[styles.statIconWrapper, { backgroundColor: s.color + "20" }]}>
                <s.icon size={16} color={s.color} />
              </View>
              <Text style={[styles.statVal, { color: T.text }]}>{s.val}</Text>
              <Text style={[styles.statLabel, { color: T.textMuted }]}>{s.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.actionsGrid}>
          {[
            { label: "Publish New Event", icon: Plus, route: "/(admin)/publish", color: T.primary },
            { label: "Manage Events", icon: FileText, route: "/(admin)/manage", color: T.secondary },
          ].map((a) => (
            <TouchableOpacity
              key={a.label}
              onPress={() => router.push(a.route as any)}
              style={[styles.actionBtn, { backgroundColor: a.color + "15", borderColor: a.color + "35" }]}
            >
              <View style={[styles.actionIconWrapper, { backgroundColor: a.color }]}>
                <a.icon size={18} color="#fff" />
              </View>
              <Text style={[styles.actionLabel, { color: T.text }]}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Create Admin quick card */}
        <TouchableOpacity
          onPress={() => setAdminModalVisible(true)}
          style={[styles.createAdminCard, { backgroundColor: T.secondarySoft, borderColor: T.secondary + "30" }]}
        >
          <View style={[styles.actionIconWrapper, { backgroundColor: T.secondary }]}>
            <UserPlus size={18} color="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.actionLabel, { color: T.text }]}>Create Admin Account</Text>
            <Text style={[styles.createAdminSub, { color: T.textMuted }]}>Add a new admin who can sign in immediately</Text>
          </View>
          <ShieldCheck size={16} color={T.secondary} />
        </TouchableOpacity>

        <Text style={[styles.sectionTitle, { color: T.text }]}>All Events</Text>
        <View style={styles.eventList}>
          {upcomingEventsList.map((event) => (
            <View key={event._id} style={[styles.eventCard, { backgroundColor: T.surface, borderColor: T.border }]}>
              <Image source={{ uri: event.image }} style={styles.eventImage} />
              <View style={styles.eventDetails}>
                <Text style={[styles.eventTitle, { color: T.text }]} numberOfLines={1}>{event.title}</Text>
                <Text style={[styles.eventMeta, { color: T.textMuted }]}>
                  {event.attendeesCount || 0} registered · {event.date}
                </Text>
                <View style={{ alignSelf: "flex-start", marginTop: 4 }}>
                  <View style={[styles.statusBadge, { backgroundColor: event.published ? T.greenSoft : T.orangeSoft }]}>
                    <Text style={[styles.statusText, { color: event.published ? T.green : T.orange }]}>
                      {event.published ? "Published" : "Draft"}
                    </Text>
                  </View>
                </View>
              </View>
              <View style={styles.eventActions}>
                <TouchableOpacity
                  onPress={() => router.push(`/(admin)/edit/${event._id}`)}
                  style={[styles.editBtn, { backgroundColor: T.surfaceAlt }]}
                >
                  <Pencil size={13} color={T.primary} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleDelete(event._id, event.title)}
                  style={[styles.editBtn, { backgroundColor: T.redSoft, marginTop: 4 }]}
                >
                  <Trash2 size={13} color={T.red} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {completedEventsList.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: T.text, marginTop: 18 }]}>Completed Events</Text>
            <View style={styles.eventList}>
              {completedEventsList.map((event) => (
                <View key={event._id} style={[styles.eventCard, { backgroundColor: T.surface, borderColor: T.border, opacity: 0.7 }]}>
                  <Image source={{ uri: event.image }} style={styles.eventImage} />
                  <View style={styles.eventDetails}>
                    <Text style={[styles.eventTitle, { color: T.text }]} numberOfLines={1}>{event.title}</Text>
                    <Text style={[styles.eventMeta, { color: T.textMuted }]}>
                      {event.attendeesCount || 0} registered · {event.date}
                    </Text>
                    <View style={{ alignSelf: "flex-start", marginTop: 4 }}>
                      <View style={[styles.statusBadge, { backgroundColor: T.orangeSoft }]}>
                        <Text style={[styles.statusText, { color: T.orange }]}>Completed</Text>
                      </View>
                    </View>
                  </View>
                  <View style={styles.eventActions}>
                    <TouchableOpacity
                      onPress={() => handleDelete(event._id, event.title)}
                      style={[styles.editBtn, { backgroundColor: T.redSoft }]}
                    >
                      <Trash2 size={13} color={T.red} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 50, paddingBottom: 20 },
  headerTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  subtitle: { fontSize: 12, fontWeight: "500", color: "rgba(255,255,255,0.7)" },
  title: { fontSize: 18, fontWeight: "900", color: "#fff" },
  iconBtn: { width: 36, height: 36, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  scrollContent: { padding: 16, paddingBottom: 100 },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 16 },
  statCard: { width: "48%", padding: 14, borderRadius: 16, borderWidth: 1, gap: 8 },
  statIconWrapper: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  statVal: { fontSize: 20, fontWeight: "900" },
  statLabel: { fontSize: 11 },
  actionsGrid: { flexDirection: "row", gap: 12, marginBottom: 12 },
  actionBtn: { flex: 1, padding: 14, borderRadius: 16, borderWidth: 1, alignItems: "center", gap: 8 },
  actionIconWrapper: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  actionLabel: { fontSize: 12, fontWeight: "bold", textAlign: "center" },
  createAdminCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  createAdminSub: { fontSize: 11, marginTop: 2 },
  sectionTitle: { fontSize: 14, fontWeight: "bold", marginBottom: 10 },
  eventList: { gap: 10 },
  eventCard: { flexDirection: "row", padding: 12, borderRadius: 16, borderWidth: 1, gap: 12, alignItems: "center" },
  eventImage: { width: 48, height: 48, borderRadius: 12 },
  eventDetails: { flex: 1 },
  eventTitle: { fontSize: 12, fontWeight: "bold" },
  eventMeta: { fontSize: 11, marginTop: 2 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 9999 },
  statusText: { fontSize: 10, fontWeight: "bold" },
  eventActions: { alignItems: "center" },
  editBtn: { width: 32, height: 32, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" },
  modalSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingBottom: 40,
    maxHeight: "85%",
    borderWidth: 1,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  modalIconBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  modalTitle: { fontSize: 15, fontWeight: "800" },
  modalSub: { fontSize: 11, marginTop: 2 },
  modalForm: { paddingHorizontal: 20, gap: 14, paddingBottom: 20 },
  modalBtn: { paddingVertical: 14, borderRadius: 16, alignItems: "center", marginTop: 4 },
  modalBtnText: { color: "#fff", fontSize: 14, fontWeight: "bold" },
});
