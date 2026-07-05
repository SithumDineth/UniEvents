import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useRouter, useSegments } from "expo-router";
import { Bell, Calendar, ChevronRight, Edit2, Heart, LogOut, Moon, Settings, Sparkles, Sun, X } from "lucide-react-native";
import React, { useCallback, useState } from "react";
import { ActivityIndicator, Alert, Modal, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";
import { ErrorView } from "../../../components/ErrorView";
import { LoadingIndicator } from "../../../components/LoadingIndicator";
import { useTheme } from "../../../contexts/ThemeContext";
import { apiGetProfile, apiGetRegisteredEvents, apiGetSavedEvents, apiUpdateProfile } from "../../../services/api";

const INTERESTS = ["Hackathons", "AI & ML", "Design", "Research", "Social", "Tech Talks"];

export default function StudentProfile() {
  const router = useRouter();
  const { theme: T, mode, toggleTheme } = useTheme();
  const [user, setUser] = useState<any>(null);
  const [registeredCount, setRegisteredCount] = useState(0);
  const [savedCount, setSavedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Editing state
  const [isEditing, setIsEditing] = useState(false);
  const [tempInterests, setTempInterests] = useState<string[]>([]);
  const [savingInterests, setSavingInterests] = useState(false);

  const segments = useSegments();
  const routePrefix = segments[0] === "(admin)" ? "/(admin)" : "/(student)";

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [profile, registered, saved] = await Promise.all([
        apiGetProfile(),
        apiGetRegisteredEvents(),
        apiGetSavedEvents(),
      ]);
      setUser(profile);
      setRegisteredCount(registered.length);
      setSavedCount(saved.length);
    } catch (e: any) {
      setError(e.message || "Error loading profile");
      // fallback to local storage
      const userStr = await AsyncStorage.getItem("user");
      if (userStr) setUser(JSON.parse(userStr));
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const handleLogout = async () => {
    await AsyncStorage.multiRemove(["token", "user"]);
    router.replace("/(auth)/login");
  };

  const openEditModal = () => {
    setTempInterests(user?.interests || []);
    setIsEditing(true);
  };

  const toggleInterest = (i: string) => {
    setTempInterests(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]);
  };

  const handleSaveInterests = async () => {
    setSavingInterests(true);
    try {
      const updatedProfile = await apiUpdateProfile({ interests: tempInterests });
      setUser(updatedProfile);
      // Update local storage so it persists
      const oldStr = await AsyncStorage.getItem("user");
      if (oldStr) {
        const oldUser = JSON.parse(oldStr);
        await AsyncStorage.setItem("user", JSON.stringify({ ...oldUser, interests: tempInterests }));
      }
      setIsEditing(false);
    } catch (e: any) {
      Alert.alert("Error", e.message || "Failed to update profile");
    } finally {
      setSavingInterests(false);
    }
  };

  const handleToggleNotifications = async (val: boolean) => {
    const prev = user?.notificationsEnabled;
    setUser({ ...user, notificationsEnabled: val });
    try {
      await apiUpdateProfile({ notificationsEnabled: val });
    } catch (e) {
      setUser({ ...user, notificationsEnabled: prev });
      Alert.alert("Error", "Failed to update notification settings");
    }
  };

  const initials = user?.name
    ? user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  if (loading) {
    return <LoadingIndicator style={{ backgroundColor: T.bg }} text="Loading profile..." />;
  }

  if (error && !user) {
    return <ErrorView message={error} onRetry={load} style={{ backgroundColor: T.bg }} />;
  }

  return (
    <View style={[styles.container, { backgroundColor: T.bg }]}>
      <LinearGradient colors={T.gradientHeader} style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>My Profile</Text>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
            <LogOut size={12} color="#fff" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.profileInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View>
            <Text style={styles.name}>{user?.name || "Student"}</Text>
            <Text style={styles.subtitle}>{user?.faculty || "University"}</Text>
          </View>
        </View>
        <View style={styles.statsRow}>
          {[
            { label: "Events", val: registeredCount.toString() },
            { label: "Saved", val: savedCount.toString() },
            { label: "AI Score", val: user?.interests?.length > 3 ? "94%" : "72%" },
          ].map((s) => (
            <View key={s.label} style={styles.statBox}>
              <Text style={styles.statVal}>{s.val}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Modal for editing interests */}
        <Modal visible={isEditing} transparent animationType="fade" onRequestClose={() => setIsEditing(false)}>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: T.surface, borderColor: T.border }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: T.text }]}>Edit Interests</Text>
                <TouchableOpacity onPress={() => setIsEditing(false)}><X size={20} color={T.textMuted} /></TouchableOpacity>
              </View>
              <Text style={{ color: T.textMuted, fontSize: 12, marginBottom: 16 }}>
                Select topics to improve your AI recommendations.
              </Text>
              <View style={styles.tagsContainer}>
                {INTERESTS.map((i) => {
                  const selected = tempInterests.includes(i);
                  return (
                    <TouchableOpacity
                      key={i}
                      onPress={() => toggleInterest(i)}
                      style={[
                        styles.tag,
                        selected
                          ? { backgroundColor: T.primary, borderColor: T.primary, borderWidth: 1 }
                          : { backgroundColor: T.primarySoft, borderColor: T.primary + "50", borderWidth: 1 },
                      ]}
                    >
                      <Text style={{ fontSize: 12, fontWeight: "600", color: selected ? "#fff" : T.primary }}>{i}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              <TouchableOpacity
                onPress={handleSaveInterests}
                disabled={savingInterests}
                style={[styles.saveBtn, { backgroundColor: T.primary }]}
              >
                {savingInterests ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Save Changes</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {user?.interests?.length > 0 && (
          <View style={[styles.aiCard, { backgroundColor: T.surface, borderColor: T.border }]}>
            <View style={styles.aiCardHeaderRow}>
              <View style={styles.aiCardHeader}>
                <Sparkles size={15} color={T.primary} />
                <Text style={[styles.aiCardTitle, { color: T.text }]}>AI Interest Profile</Text>
              </View>
              <TouchableOpacity onPress={openEditModal} style={styles.editBtn}>
                <Edit2 size={12} color={T.primary} />
                <Text style={{ color: T.primary, fontSize: 11, fontWeight: "bold", marginLeft: 4 }}>Edit</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.tagsContainer}>
              {user.interests.map((i: string) => (
                <View key={i} style={[styles.tag, { backgroundColor: T.primarySoft }]}>
                  <Text style={[styles.tagText, { color: T.primary }]}>{i}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {[
          { label: "My Registered Events", icon: Calendar, val: `${registeredCount} events`, route: `${routePrefix}/registered` },
          { label: "Saved Events", icon: Heart, val: `${savedCount} saved`, route: `${routePrefix}/saved` },
          { label: "Notification Settings", icon: Bell, type: "toggle", value: user?.notificationsEnabled ?? true },
          { label: "Privacy & Security", icon: Settings },
        ].map((item) => (
          <TouchableOpacity
            key={item.label}
            onPress={() => item.route ? router.push(item.route as any) : null}
            disabled={item.type === "toggle"}
            style={[styles.menuItem, { backgroundColor: T.surface, borderColor: T.border }]}
          >
            <View style={styles.menuLeft}>
              <View style={[styles.menuIconWrapper, { backgroundColor: T.primarySoft }]}>
                <item.icon size={15} color={T.primary} />
              </View>
              <Text style={[styles.menuLabel, { color: T.text }]}>{item.label}</Text>
            </View>
            <View style={styles.menuRight}>
              {item.type === "toggle" ? (
                <Switch
                  value={item.value}
                  onValueChange={handleToggleNotifications}
                  trackColor={{ false: T.border, true: T.primary }}
                  thumbColor="#fff"
                />
              ) : (
                <>
                  {item.val && <Text style={[styles.menuVal, { color: T.textMuted }]}>{item.val}</Text>}
                  <ChevronRight size={15} color={T.textDim} />
                </>
              )}
            </View>
          </TouchableOpacity>
        ))}

        {/* Theme Toggle */}
        <TouchableOpacity
          onPress={toggleTheme}
          style={[styles.menuItem, { backgroundColor: T.surface, borderColor: T.border }]}
        >
          <View style={styles.menuLeft}>
            <View style={[styles.menuIconWrapper, { backgroundColor: T.primarySoft }]}>
              {mode === "dark" ? (
                <Moon size={15} color={T.primary} />
              ) : (
                <Sun size={15} color={T.primary} />
              )}
            </View>
            <Text style={[styles.menuLabel, { color: T.text }]}>
              {mode === "dark" ? "Dark Mode" : "Light Mode"}
            </Text>
          </View>
          <View style={styles.menuRight}>
            <Switch
              value={mode === "dark"}
              onValueChange={toggleTheme}
              trackColor={{ false: T.border, true: T.primary }}
              thumbColor="#fff"
            />
          </View>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 50, paddingBottom: 20 },
  headerTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  title: { color: "#fff", fontSize: 16, fontWeight: "900" },
  logoutBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, backgroundColor: "rgba(255,77,106,0.2)" },
  logoutText: { color: "#fff", fontSize: 12, fontWeight: "600" },
  profileInfo: { flexDirection: "row", alignItems: "center", gap: 16 },
  avatar: { width: 64, height: 64, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" },
  avatarText: { color: "#fff", fontSize: 20, fontWeight: "900" },
  name: { color: "#fff", fontSize: 18, fontWeight: "900" },
  subtitle: { color: "rgba(255,255,255,0.7)", fontSize: 12, marginTop: 2 },
  statsRow: { flexDirection: "row", gap: 12, marginTop: 16 },
  statBox: { flex: 1, paddingVertical: 8, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.15)", alignItems: "center" },
  statVal: { color: "#fff", fontSize: 16, fontWeight: "900" },
  statLabel: { color: "rgba(255,255,255,0.6)", fontSize: 10 },
  scrollContent: { padding: 16, paddingBottom: 100 },
  aiCard: { padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 12 },
  aiCardHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 },
  aiCardTitle: { fontSize: 14, fontWeight: "bold" },
  tagsContainer: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  tagText: { fontSize: 12, fontWeight: "600" },
  menuItem: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 14, borderRadius: 16, borderWidth: 1, marginBottom: 8 },
  menuLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  menuIconWrapper: { width: 32, height: 32, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  menuLabel: { fontSize: 13, fontWeight: "600" },
  menuRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  menuVal: { fontSize: 11 },
  // Edit Modal
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", padding: 24 },
  modalContent: { borderRadius: 20, padding: 20, borderWidth: 1 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  modalTitle: { fontSize: 16, fontWeight: "bold" },
  saveBtn: { paddingVertical: 12, borderRadius: 12, alignItems: "center", marginTop: 24 },
  saveBtnText: { color: "#fff", fontWeight: "bold", fontSize: 14 },
  aiCardHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  editBtn: { flexDirection: "row", alignItems: "center", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, backgroundColor: "rgba(110, 86, 207, 0.15)" },
});
