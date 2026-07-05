import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { BlurView } from "expo-blur";
import { BarChart3, Bell, FileText, Home, Plus, Search, User } from "lucide-react-native";
import React from "react";
import { Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Role } from "../constants/MockData";
import { DARK, Theme } from "../constants/Themes";

export function BottomNav({
  state,
  descriptors,
  navigation,
  T,
  role,
}: BottomTabBarProps & { T: Theme; role: Role }) {
  const studentItems = [
    { name: "home", icon: Home, label: "Home" },
    { name: "search", icon: Search, label: "Search" },
    { name: "notifications", icon: Bell, label: "Alerts" },
    { name: "profile", icon: User, label: "Profile" },
  ];
  
  const adminItems = [
    { name: "home", icon: BarChart3, label: "Dashboard" },
    { name: "publish", icon: Plus, label: "Publish" },
    { name: "manage", icon: FileText, label: "Manage" },
    { name: "profile", icon: User, label: "Profile" },
  ];

  const currentRouteName = state.routes[state.index].name;
  if (currentRouteName === "detail/[id]") {
    return null;
  }

  const items = role === "admin" ? adminItems : studentItems;

  return (
    <View style={[styles.container, { borderColor: T.border }]}>
      <BlurView
        intensity={80}
        tint={T.bg === DARK.bg ? "dark" : "light"}
        style={[StyleSheet.absoluteFill, { backgroundColor: T.surface + "E6" }]}
      />
      <View style={styles.navContent}>
        {items.map((item, index) => {
          const isFocused = state.routes[state.index].name === item.name;

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: state.routes[index]?.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(item.name);
            }
          };

          return (
            <TouchableOpacity
              key={item.name}
              onPress={onPress}
              style={styles.tabBtn}
            >
              <item.icon
                size={20}
                color={isFocused ? T.primary : T.textDim}
              />
              <Text
                style={[
                  styles.label,
                  { color: isFocused ? T.primary : T.textDim },
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    overflow: "hidden",
  },
  navContent: {
    flexDirection: "row",
    paddingHorizontal: 8,
    paddingTop: 8,
    paddingBottom: Platform.OS === "ios" ? 24 : 12,
  },
  tabBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    paddingVertical: 4,
  },
  label: {
    fontSize: 10,
    fontWeight: "600",
  },
});
