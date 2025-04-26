import React, { useEffect } from "react";
import {
  View,
  ActivityIndicator,
  StyleSheet,
  Animated,
  Easing,
} from "react-native";

const LoadingScreen = () => {
  const pulseAnim = new Animated.Value(1);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.3,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.spinnerContainer}>
        <Animated.View
          style={[styles.glowContainer, { transform: [{ scale: pulseAnim }] }]}
        />
        <ActivityIndicator
          size="large"
          color="#2c3e50"
          style={styles.spinner}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(240, 247, 255, 0.95)",
    zIndex: 9999,
  },
  spinnerContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  glowContainer: {
    position: "absolute",
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(44, 62, 80, 0.2)",
  },
  spinner: {
    transform: [{ scale: 1.5 }],
  },
});

export default LoadingScreen;
