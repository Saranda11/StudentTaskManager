import React, { useState, useEffect, useCallback } from "react";
import { View, FlatList, StyleSheet, RefreshControl, Alert, Animated } from "react-native";
import { FAB, Card, Text, ProgressBar, Button } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Slider from "@react-native-community/slider";
import { cancelAllNotifications } from "../services/NotificationService";

export default function HomeScreen({ navigation }) {
  const [tasks, setTasks] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    console.log("HomeScreen loaded!");
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", loadTasks);
    return unsubscribe;
  }, [navigation]);

  const loadTasks = async () => {
    try {
      const storedTasks = await AsyncStorage.getItem("@tasks");
      if (storedTasks) {
        setTasks(JSON.parse(storedTasks));
      }
    } catch (e) {
      console.error("Failed to load tasks:", e);
    }
  };

  const saveTasks = async (tasksToSave) => {
    try {
      await AsyncStorage.setItem("@tasks", JSON.stringify(tasksToSave));
    } catch (e) {
      console.error("Failed to save tasks:", e);
    }
  };

  const handleDeleteTask = (id) => {
    Alert.alert("Delete Task", "Are you sure you want to delete this task?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          const updatedTasks = tasks.filter((task) => task.id !== id);
          setTasks(updatedTasks);
          await AsyncStorage.setItem("@tasks", JSON.stringify(updatedTasks));
          await cancelAllNotifications();
        },
      },
    ]);
  };

  const handleProgressChange = (id, newProgress) => {
    const updatedTasks = tasks.map((task) =>
      task.id === id ? { ...task, progress: isNaN(newProgress) ? 0 : newProgress } : task
    );
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadTasks().then(() => setRefreshing(false));
  }, []);

  const renderItem = ({ item }) => {
    const deadlineDate = new Date(item.deadline);
    const formattedDeadline = `${deadlineDate.toLocaleDateString()} - ${deadlineDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}`;

    return (
      <Animated.View style={{ opacity: fadeAnim }}>
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.taskTitle}>{item.title}</Text>
            <Text style={styles.taskDetail}>📚 Course: {item.course}</Text>
            <Text style={styles.taskDetail}>📅 Deadline: {formattedDeadline}</Text>
            <Text style={styles.taskDetail}>⚡ Priority: {item.priority}</Text>

            <ProgressBar 
              progress={isNaN(item.progress) || item.progress === undefined ? 0 : item.progress / 100} 
              style={styles.progressBar} 
              color={getProgressColor(item.progress)} 
            />

            <Text style={styles.progressText}>{isNaN(item.progress) ? "0" : item.progress}% Complete</Text>

            <Slider
              style={{ width: "100%", height: 40 }}
              minimumValue={0}
              maximumValue={100}
              step={5}
              value={item.progress}
              onValueChange={(value) => handleProgressChange(item.id, value)}
              minimumTrackTintColor="#6200ee"
              thumbTintColor="#6200ee"
            />
          </Card.Content>

          <Card.Actions style={styles.actions}>
            <Button mode="contained" onPress={() => navigation.navigate("AddTask", { task: item })} style={styles.editButton}>
              Edit
            </Button>
            <Button mode="contained" color="#FFCDD2" onPress={() => handleDeleteTask(item.id)} style={styles.deleteButton}>
              Delete
            </Button>
          </Card.Actions>
        </Card>
      </Animated.View>
    );
  };

  const getProgressColor = (progress) => {
    if (isNaN(progress) || progress === undefined) return "#D3D3D3";
    if (progress >= 100) return "#4CAF50";
    if (progress >= 50) return "#FFC107";
    return "#FF5733";
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={tasks}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      />

      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => navigation.navigate("AddTask")}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: "#F0F8FF",
  },
  card: {
    margin: 8,
    padding: 8,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    elevation: 4,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#003366",
  },
  taskDetail: {
    fontSize: 14,
    color: "#555",
    marginBottom: 2,
  },
  progressBar: {
    height: 10,
    marginVertical: 5,
    borderRadius: 5,
  },
  progressText: {
    fontSize: 12,
    color: "#333",
    textAlign: "right",
    marginBottom: 5,
  },
  editButton: {
    backgroundColor: "#6200ee",
  },
  deleteButton: {
    backgroundColor: "#6200ee",
  },
  fab: {
    position: "absolute",
    margin: 16,
    right: 10,
    bottom: 20,
    backgroundColor: "#6200ee",
  },
  actions: {
    justifyContent: "space-between",
    paddingHorizontal: 10,
  },
});
