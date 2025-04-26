import React, { useEffect } from "react";
import { View, StyleSheet, Animated, Easing } from "react-native";

const LoadingScreen = () => {
  const waveAnim1 = new Animated.Value(0);
  const waveAnim2 = new Animated.Value(0);
  const waveAnim3 = new Animated.Value(0);

  useEffect(() => {
    const createWaveAnimation = (anim: any) => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: 1,
            duration: 1500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 1500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
    };

    Animated.stagger(300, [
      createWaveAnimation(waveAnim1),
      createWaveAnimation(waveAnim2),
      createWaveAnimation(waveAnim3),
    ]).start();
  }, []);

  const waveStyle = (anim: any) => ({
    transform: [
      {
        scale: anim.interpolate({
          inputRange: [0, 1],
          outputRange: [0.8, 1.4],
        }),
      },
    ],
    opacity: anim.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0.8, 0.4, 0],
    }),
  });

  return (
    <View style={styles.container}>
      <View style={styles.waveContainer}>
        <Animated.View style={[styles.wave, waveStyle(waveAnim1)]} />
        <Animated.View style={[styles.wave, waveStyle(waveAnim2)]} />
        <Animated.View style={[styles.wave, waveStyle(waveAnim3)]} />
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
  waveContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  wave: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#2c3e50",
  },
});

export default LoadingScreen;
