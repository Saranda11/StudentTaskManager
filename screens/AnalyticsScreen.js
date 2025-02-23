import React, { useState, useEffect, useCallback } from "react";
import { View, FlatList, StyleSheet, ScrollView, RefreshControl, Animated, Dimensions } from "react-native";
import { Card, Text, ProgressBar, Chip } from "react-native-paper";
import { PieChart, BarChart } from "react-native-chart-kit";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SCREEN_WIDTH = Dimensions.get("window").width;
const TASKS_STORAGE_KEY = "@tasks";

const getTaskColor = (percentage) => {
  if (percentage <= 45) return "#FF5733"; // E kuqe
  if (percentage <= 95) return "#FFC107"; // E verdhë
  return "#4CAF50"; // E gjelbër
};

export default function AnalyticsScreen({ navigation }) {
  const [tasks, setTasks] = useState([]);
  const [totalStudyTime, setTotalStudyTime] = useState(0);
  const [completedTasks, setCompletedTasks] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    loadTasks();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const loadTasks = async () => {
    try {
      const storedTasks = await AsyncStorage.getItem(TASKS_STORAGE_KEY);
      if (storedTasks) {
        const parsedTasks = JSON.parse(storedTasks);
        setTasks(parsedTasks);
        calculateStatistics(parsedTasks);
      }
    } catch (e) {
      console.error("Failed to load tasks:", e);
    }
  };

  const calculateStatistics = (tasks) => {
    if (!tasks.length) {
      setTotalStudyTime(0);
      setCompletedTasks(0);
      return;
    }
    const totalTime = tasks.reduce((acc, task) => acc + ((task.progress / 100) * (task.estimatedTime || 60)), 0);
    const completed = tasks.filter((task) => task.progress >= 100).length;

    setTotalStudyTime(isNaN(totalTime) ? 0 : totalTime.toFixed(1));
    setCompletedTasks(completed);
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadTasks().then(() => setRefreshing(false));
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      <Animated.View style={{ opacity: fadeAnim }}>
        <Card style={[styles.card, styles.shadow]}>
          <Card.Content>
            <Text style={styles.title}>📊 Study Analytics</Text>
            <Text style={styles.statsText}> Total Study Time: {totalStudyTime} minutes</Text>
            <Text style={styles.statsText}> Completed Tasks: {completedTasks} / {tasks.length}</Text>
            <ProgressBar progress={tasks.length > 0 ? completedTasks / tasks.length : 0} style={styles.progressBar} color="#6200ee" />
          </Card.Content>
        </Card>
      </Animated.View>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.title}>📚 Study Progress</Text>
          <PieChart
            data={[
              { name: "Incomplete (0-45%)", duration: tasks.filter(t => t.progress <= 45).length, color: "#FF5733", legendFontColor: "#888", legendFontSize: 10.8 },
              { name: "In Progress (50-95%)", duration: tasks.filter(t => t.progress > 45 && t.progress < 100).length, color: "#FFC107", legendFontColor: "#888", legendFontSize: 10.2 },
              { name: "Completed (100%)", duration: tasks.filter(t => t.progress === 100).length, color: "#4CAF50", legendFontColor: "#888", legendFontSize: 10.9 },
            ]}
            width={SCREEN_WIDTH - 40}
            height={220}
            chartConfig={{
              backgroundGradientFrom: "#fff",
              backgroundGradientTo: "#fff",
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              legendFontSize: 10,
              legendFontFamily: "Arial",
              paddingLeft: "0", // E afron legjendën më afër
              decimalPlaces: 0,
            }}
            accessor="duration"
            backgroundColor="transparent"
            paddingLeft="-5.5"
            absolute
          />
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.title}>⚡ Task Priority Distribution</Text>
          <BarChart
            data={{
              labels: ["High", "Medium", "Low"],
              datasets: [{ data: [tasks.filter(t => t.priority === "High").length, tasks.filter(t => t.priority === "Medium").length, tasks.filter(t => t.priority === "Low").length] }],
            }}
            width={SCREEN_WIDTH - 40}
            height={220}
            yAxisLabel=""
            chartConfig={{
              backgroundGradientFrom: "#fff",
              backgroundGradientTo: "#fff",
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            }}
            verticalLabelRotation={30}
          />
        </Card.Content>
      </Card>
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.title}>📅 Upcoming Deadlines</Text>
          {tasks.length === 0 ? (
            <Text style={styles.noDataText}>No upcoming tasks.</Text>
          ) : (
            tasks
              .filter((task) => task.progress < 100)
              .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
              .slice(0, 3)
              .map((task, index) => (
                <View key={index} style={styles.taskContainer}>
                  <Chip style={styles.taskChip} textStyle={{ color: "#FFF" }}>{task.title}</Chip>
                  <Text style={styles.deadlineText}> Due: {new Date(task.deadline).toLocaleDateString()} - {new Date(task.deadline).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true })}</Text>
                </View>
              ))
          )}
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
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
  title: {
    textAlign: "center",
    marginBottom: 10,
    fontWeight: "bold",
    fontSize: 18,
    color: "#003366",
  },
  progressBar: {
    height: 10,
    marginVertical: 5,
    borderRadius: 5,
  },
  shadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  taskContainer: {
    marginBottom: 10,
  },
  taskChip: {
   
    paddingVertical: 5,
  },
  deadlineText: {
    fontSize: 14,
    marginTop: 5,
   
  },
  noDataText: {
    textAlign: "center",
    fontSize: 14,
    
  },
});

