import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import type { ComponentProps } from "react";
type MaterialCommunityIconName = ComponentProps<typeof MaterialCommunityIcons>["name"];

interface EmptyStateProps {
  iconName: MaterialCommunityIconName;
  message: string;
  buttonText: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  iconName,
  message,
  buttonText,
  onPress,
  loading = false,
  disabled = false,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <MaterialCommunityIcons
          name={iconName && typeof iconName === 'string' ? iconName : 'alert-circle-outline'}
          size={48}
          color="#2c3e50"
        />
      </View>
      <Text style={styles.message}>{message}</Text>
      <TouchableOpacity
        style={[styles.actionButton, styles.noteToolsButton, disabled && styles.disabledButton]}
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={0.8}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>{buttonText}</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f8fbff",
    borderRadius: 16,
    marginVertical: 32,
    marginHorizontal: 16,

  },
  iconCircle: {
    backgroundColor: "#e6f0ff",
    borderRadius: 48,
    width: 64,
    height: 64,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  message: {
    fontSize: 18,
    color: "#2c3e50",
    fontWeight: "600",
    marginBottom: 20,
    textAlign: "center",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginHorizontal: 4,
    backgroundColor: "#2c3e50",
  },
  noteToolsButton: {
    backgroundColor: "#2c3e50",
  },
  buttonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
    textAlign: "center",
  },
  disabledButton: {
    opacity: 0.6,
  },
});

export default EmptyState;
