import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import type { ComponentProps } from "react";
type MaterialCommunityIconName = ComponentProps<
  typeof MaterialCommunityIcons
>["name"];

interface EmptyStateProps {
  iconName: MaterialCommunityIconName;
  message: string;
  description?: string;
  buttonText: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  iconName,
  message,
  description,
  buttonText,
  onPress,
  loading = false,
  disabled = false,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <MaterialCommunityIcons
          name={
            iconName && typeof iconName === "string"
              ? iconName
              : "alert-circle-outline"
          }
          size={48}
          color="#2c3e50"
        />
      </View>
      <Text style={styles.message}>{message}</Text>
      {description && <Text style={styles.description}>{description}</Text>}
      <TouchableOpacity
        style={[
          styles.actionButton,
          styles.noteToolsButton,
          disabled && styles.disabledButton,
        ]}
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
    width: 96,
    height: 96,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  message: {
    fontSize: 20,
    color: "#2c3e50",
    fontWeight: "600",
    marginBottom: 12,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    color: "#7f8c8d",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginHorizontal: 4,
    backgroundColor: "#2c3e50",
  },
  noteToolsButton: {
    backgroundColor: "#2c3e50",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  disabledButton: {
    opacity: 0.6,
  },
});

export default EmptyState;
export type { EmptyStateProps };
