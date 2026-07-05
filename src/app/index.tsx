import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing, ActivityIndicator } from "react-native";
import { Calendar, Sparkles } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useTheme } from "../contexts/ThemeContext";

export default function SplashScreen() {
  const router = useRouter();
  const { theme: T } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [showButton, setShowButton] = useState(false);

  // Animations
  const iconScale = useRef(new Animated.Value(0)).current;
  const iconOpacity = useRef(new Animated.Value(0)).current;
  const titleSlide = useRef(new Animated.Value(30)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const featuresOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start entrance animations
    Animated.parallel([
      Animated.timing(iconScale, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
        easing: Easing.elastic(1),
      }),
      Animated.timing(iconOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Animate title
      Animated.parallel([
        Animated.timing(titleSlide, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic),
        }),
        Animated.timing(titleOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Animate features
        Animated.timing(featuresOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start(() => {
          // Stop loading and show button after short delay
          setTimeout(() => {
            setIsLoading(false);
            setShowButton(true);
          }, 800);
        });
      });
    });
  }, []);

  return (
    <LinearGradient colors={T.gradientSplash} style={styles.container}>
      <View style={{ flex: 0.5 }} />
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Animated.View
            style={[
              styles.iconBox,
              {
                backgroundColor: "rgba(255,255,255,0.15)",
                borderColor: "rgba(255,255,255,0.25)",
                transform: [{ scale: iconScale }],
                opacity: iconOpacity,
              },
            ]}
          >
            <Calendar size={40} color="#fff" />
            <View style={[styles.sparkleBadge, { backgroundColor: T.primary }]}>
              <Sparkles size={12} color="#fff" />
            </View>
          </Animated.View>
        </View>

        <Animated.View
          style={[
            styles.titleContainer,
            {
              transform: [{ translateY: titleSlide }],
              opacity: titleOpacity,
            },
          ]}
        >
          <Text style={styles.title}>UniEvents</Text>
          <Text style={styles.subtitle}>AI-Powered University Event Hub</Text>
        </Animated.View>

        <Animated.View style={[styles.features, { opacity: featuresOpacity }]}>
          {[
            { icon: Sparkles, text: "Personalized AI event recommendations" },
            { icon: Calendar, text: "Register for events in one tap" },
            { icon: Bell, text: "Smart notifications for your interests" },
          ].map(({ icon: Icon, text }, i) => (
            <View key={i} style={styles.featureItem}>
              <Icon size={15} color="#fff" />
              <Text style={styles.featureText}>{text}</Text>
            </View>
          ))}
        </Animated.View>
      </View>

      <View style={{ flex: 0.3, justifyContent: "flex-end" }}>
        {isLoading && (
          <ActivityIndicator size="large" color="#fff" style={{ marginBottom: 24 }} />
        )}

        {showButton && (
          <TouchableOpacity
            onPress={() => router.push("/(auth)/login")}
            style={[styles.btn, { backgroundColor: T.surface }]}
          >
            <Text style={[styles.btnText, { color: T.primary }]}>Get Started</Text>
          </TouchableOpacity>
        )}
      </View>
    </LinearGradient>
  );
}

// Dummy import since Bell is used above
import { Bell } from "lucide-react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 28,
    paddingVertical: 40,
  },
  content: {
    alignItems: "center",
    gap: 28,
    width: "100%",
  },
  iconContainer: {
    alignItems: "center",
  },
  iconBox: {
    width: 96,
    height: 96,
    borderRadius: 24,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  sparkleBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  titleContainer: {
    alignItems: "center",
  },
  title: {
    fontSize: 36,
    fontWeight: "900",
    color: "#fff",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "rgba(255,255,255,0.7)",
    marginTop: 6,
  },
  features: {
    width: "100%",
    gap: 10,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },
  featureText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#fff",
  },
  btn: {
    width: "100%",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  btnText: {
    fontSize: 14,
    fontWeight: "bold",
  },
});
