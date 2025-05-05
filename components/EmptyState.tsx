import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Typography, FONTS } from "../constants/Typography";

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
          color="black"
        />
      </View>
      <Text style={[Typography.h3, styles.message]}>{message}</Text>
      {description && (
        <Text style={[Typography.body1, styles.description]}>
          {description}
        </Text>
      )}
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
          <Text style={[Typography.buttonText, styles.buttonText]}>
            {buttonText}
          </Text>
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
    backgroundColor: "#ffff",
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
    marginBottom: 12,
    textAlign: "center",
    color: "black",
  },
  description: {
    color: "#7f8c8d",
    textAlign: "center",
    marginBottom: 24,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginHorizontal: 4,
    backgroundColor: "black",
  },
  noteToolsButton: {
    backgroundColor: "black",
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
  },
  disabledButton: {
    opacity: 0.6,
  },
});

export default EmptyState;
export type { EmptyStateProps };
