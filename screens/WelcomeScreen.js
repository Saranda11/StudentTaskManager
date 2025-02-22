import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity, Animated } from "react-native";

export default function WelcomeScreen({ navigation }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current; // Set scale to 1 to prevent movement

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <ImageBackground
      source={require("../assets/welcome.png")}
      style={styles.background}
      blurRadius={5} // Further reduced blur for instant loading
    >
      <Animated.View style={[styles.container, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}> 
        <Text style={styles.title}>
          <Text style={styles.highlight}>Welcome</Text> to <Text style={styles.bold}>Student Task Manager</Text>
        </Text>
        <Text style={styles.subtitle}>
          Organize your tasks efficiently and <Text style={styles.italic}>boost your productivity</Text>.
        </Text>
        <TouchableOpacity style={styles.button} onPress={() => navigation.replace("Main")}> 
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>
      </Animated.View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
    resizeMode: "cover",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0", // Light background to speed up rendering
  },
  container: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.6)", // Lighter transparency for better visibility
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 12,
    maxWidth: "91%", // More compact box
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#003366",
    textAlign: "center",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },
  highlight: {
    color: "#002147",
    fontWeight: "bold",
  },
  bold: {
    fontWeight: "bold",
    color: "#001B3A",
  },
  italic: {
    fontStyle: "italic",
    color: "#002147",
  },
  subtitle: {
    fontSize: 15,
    color: "#333",
    textAlign: "center",
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  button: {
    backgroundColor: "#003366",
    paddingVertical: 14,
    paddingHorizontal: 45,
    borderRadius: 25,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  buttonText: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
});
