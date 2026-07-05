import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Calendar, Filter, Search, Users, X } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { BackBtn } from "../../../components/BackBtn";
import { useTheme } from "../../../contexts/ThemeContext";
import { apiGetEvents } from "../../../services/api";
import { isEventCompleted, sortEvents } from "../../../utils/eventHelpers";

const TRENDING_TAGS = ["Hackathon", "AI Workshop", "Research", "Design", "Tech Talk"];
const FILTER_OPTIONS = ["All", "Active", "Completed"] as const;
type FilterOption = typeof FILTER_OPTIONS[number];

export default function SearchScreen() {
  const router = useRouter();
  const { theme: T } = useTheme();
  const [query, setQuery] = useState("");
  const [allEvents, setAllEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<FilterOption>("All");
  const [showFilterModal, setShowFilterModal] = useState(false);

  // Load all published events on mount
  useEffect(() => {
    apiGetEvents()
      .then(data => {
        // Sort them properly
        const sorted = sortEvents(data);
        setAllEvents(sorted);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Client-side filter
  const getFilteredResults = () => {
    let filtered = allEvents;

    // Apply search query
    if (query) {
      filtered = filtered.filter(e =>
        e.title.toLowerCase().includes(query.toLowerCase()) ||
        e.category.toLowerCase().includes(query.toLowerCase()) ||
        (e.description || "").toLowerCase().includes(query.toLowerCase())
      );
    }

    // Apply filter option
    if (selectedFilter === "Active") {
      filtered = filtered.filter(e => !isEventCompleted(e));
    } else if (selectedFilter === "Completed") {
      filtered = filtered.filter(e => isEventCompleted(e));
    } else {
      // For "All", ensure completed are at bottom
      filtered = sortEvents(filtered);
    }

    return filtered;
  };
  const results = getFilteredResults();

  return (
    <View style={[styles.container, { backgroundColor: T.bg }]}>
      {/* Filter Modal */}
      <Modal
        visible={showFilterModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => setShowFilterModal(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: T.surface, borderColor: T.border }]}>
            <Text style={[styles.modalTitle, { color: T.text }]}>Filter Events</Text>
            <View style={styles.optionsContainer}>
              {FILTER_OPTIONS.map(option => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.filterOption,
                    {
                      backgroundColor:
                        selectedFilter === option ? T.primary : T.surfaceAlt,
                      borderColor: T.border,
                    },
                  ]}
                  onPress={() => {
                    setSelectedFilter(option);
                    setShowFilterModal(false);
                  }}
                >
                  <Text
                    style={[
                      styles.filterOptionText,
                      {
                        color: selectedFilter === option ? "#fff" : T.text,
                        fontWeight: selectedFilter === option ? "bold" : "normal",
                      },
                    ]}
                  >
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      <View style={[styles.header, { backgroundColor: T.surface, borderColor: T.border }]}>
        <BackBtn T={T} onBack={() => router.back()} />
        <View style={[styles.searchContainer, { backgroundColor: T.surfaceAlt, borderColor: T.border }]}>
          <Search size={15} color={T.textDim} />
          <TextInput
            style={[styles.input, { color: T.text }]}
            placeholder="Search events..."
            placeholderTextColor={T.textDim}
            value={query}
            onChangeText={setQuery}
            autoFocus
            cursorColor={T.primary}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery("")}>
              <X size={14} color={T.textDim} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={[
            styles.filterBtn,
            {
              backgroundColor: selectedFilter !== "All" ? T.primarySoft : T.surfaceAlt,
            },
          ]}
          onPress={() => setShowFilterModal(true)}
        >
          <Filter size={16} color={selectedFilter !== "All" ? T.primary : T.textDim} />
          {selectedFilter !== "All" && (
            <Text style={{ fontSize: 10, color: T.primary, fontWeight: "bold", marginLeft: 4 }}>
              {selectedFilter}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={T.primary} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {!query && (
            <View style={styles.trendingSection}>
              <Text style={[styles.trendingTitle, { color: T.textMuted }]}>TRENDING</Text>
              <View style={styles.tagsContainer}>
                {TRENDING_TAGS.map(t => (
                  <TouchableOpacity
                    key={t}
                    onPress={() => setQuery(t)}
                    style={[styles.tag, { backgroundColor: T.surface, borderColor: T.border }]}
                  >
                    <Text style={[styles.tagText, { color: T.textMuted }]}>{t}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {query && results.length === 0 ? (
            <View style={[styles.emptyState, { backgroundColor: T.surface, borderColor: T.border }]}>
              <Text style={[styles.emptyText, { color: T.textMuted }]}>No events found for "{query}"</Text>
            </View>
          ) : null}

          <View style={styles.resultsList}>
            {results.map(event => (
              <TouchableOpacity
                key={event._id}
                onPress={() => router.push(`/(student)/detail/${event._id}`)}
                style={[
                  styles.eventCard,
                  {
                    backgroundColor: T.surface,
                    borderColor: T.border,
                    opacity: isEventCompleted(event) ? 0.7 : 1,
                  },
                ]}
              >
                <Image source={{ uri: event.image }} style={styles.eventImage} />
                <View style={styles.eventDetails}>
                  <Text style={[styles.eventTitle, { color: T.text }]} numberOfLines={1}>{event.title}</Text>
                  <Text style={[styles.eventMeta, { color: T.textMuted }]}>{event.category} · {event.date}</Text>
                  <View style={styles.attendeesRow}>
                    <Users size={10} color={T.textMuted} />
                    <Text style={[styles.attendeesText, { color: T.textMuted }]}>{event.attendeesCount} registered</Text>
                    <Calendar size={10} color={T.textMuted} style={{ marginLeft: 8 }} />
                    <Text style={[styles.attendeesText, { color: T.textMuted }]}>{event.time}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
  },
  input: { flex: 1, fontSize: 14, padding: 0 },
  filterBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
    height: 36,
    borderRadius: 12,
  },
  loadingContainer: { flex: 1, alignItems: "center", justifyContent: "center" },
  scrollContent: { padding: 16, paddingBottom: 100 },
  trendingSection: { marginBottom: 20 },
  trendingTitle: { fontSize: 12, fontWeight: "bold", letterSpacing: 1, marginBottom: 10 },
  tagsContainer: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tag: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, borderWidth: 1 },
  tagText: { fontSize: 12, fontWeight: "600" },
  emptyState: { padding: 24, borderRadius: 16, borderWidth: 1, alignItems: "center", marginBottom: 12 },
  emptyText: { fontSize: 13 },
  resultsList: { gap: 10 },
  eventCard: { flexDirection: "row", gap: 12, padding: 12, borderRadius: 12, borderWidth: 1 },
  eventImage: { width: 56, height: 56, borderRadius: 12 },
  eventDetails: { flex: 1, justifyContent: "center" },
  eventTitle: { fontSize: 13, fontWeight: "bold" },
  eventMeta: { fontSize: 11, marginTop: 2 },
  attendeesRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 },
  attendeesText: { fontSize: 11 },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  modalContent: {
    width: "80%",
    maxWidth: 320,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
  },
  modalTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 16, textAlign: "center" },
  optionsContainer: { gap: 12 },
  filterOption: {
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
  },
  filterOptionText: { fontSize: 14 },
});
