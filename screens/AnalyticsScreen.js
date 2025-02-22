import React, { useState, useEffect, useCallback } from "react";
import { View, StyleSheet, Dimensions, ScrollView, RefreshControl } from "react-native";
import { Card, Text, ProgressBar, Chip } from "react-native-paper";
import { PieChart, BarChart } from "react-native-chart-kit";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SCREEN_WIDTH = Dimensions.get("window").width;
const TASKS_STORAGE_KEY = "@tasks";

export default function AnalyticsScreen() {
  const [tasks, setTasks] = useState([]);
  const [totalStudyTime, setTotalStudyTime] = useState(0);
  const [completedTasks, setCompletedTasks] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadTasks();
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

  const getCourseDistribution = () => {
    const courseMap = {};

    tasks.forEach((task) => {
      if (!task.course) return;
      if (!courseMap[task.course]) courseMap[task.course] = 0;
      const estimatedTime = task.estimatedTime ? task.estimatedTime : 60;
      courseMap[task.course] += ((task.progress / 100) * estimatedTime);
    });

    const data = Object.keys(courseMap).map((course, index) => ({
      name: course,
      duration: isNaN(courseMap[course]) ? 0 : courseMap[course],
      color: generateColor(index),
      legendFontColor: "#888",
      legendFontSize: 14,
    }));

    return data.length > 0 ? data : [{ name: "No Data", duration: 1, color: "#ccc", legendFontColor: "#888", legendFontSize: 14 }];
  };

  const getPriorityDistribution = () => {
    const priorityMap = { High: 0, Medium: 0, Low: 0 };

    tasks.forEach((task) => {
      if (priorityMap[task.priority] !== undefined) {
        priorityMap[task.priority] += 1;
      }
    });

    return {
      labels: Object.keys(priorityMap),
      datasets: [{ data: Object.values(priorityMap) }],
    };
  };

  const generateColor = (index) => {
    const colors = ["#FF6384", "#36A2EB", "#FFCE56", "#4CAF50", "#9C27B0"];
    return colors[index % colors.length];
  };

  const sortedTasksByDeadline = tasks
    .filter((task) => task.progress < 100)
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
    .slice(0, 3);

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.title}>📊 Study Analytics</Text>
          <Text style={styles.statsText}>⏳ Total Study Time: {totalStudyTime} mins</Text>
          <Text style={styles.statsText}>✅ Completed Tasks: {completedTasks} / {tasks.length}</Text>
          <ProgressBar progress={tasks.length > 0 ? completedTasks / tasks.length : 0} style={styles.progressBar} color="#6200ee" />
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.title}>📚 Study Distribution by Course</Text>
          {getCourseDistribution().length > 1 ? (
            <PieChart
              data={getCourseDistribution()}
              width={SCREEN_WIDTH - 40}
              height={220}
              chartConfig={{
                backgroundGradientFrom: "#fff",
                backgroundGradientTo: "#fff",
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              }}
              accessor="duration"
              backgroundColor="transparent"
              paddingLeft="15"
              absolute
            />
          ) : (
            <Text style={styles.noDataText}>No study data available.</Text>
          )}
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.title}>⚡ Task Priority Distribution</Text>
          <BarChart
            data={getPriorityDistribution()}
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
          {sortedTasksByDeadline.length === 0 ? (
            <Text style={styles.noDataText}>No upcoming tasks.</Text>
          ) : (
            sortedTasksByDeadline.map((task, index) => {
              const deadlineDate = new Date(task.deadline);
              const formattedDeadline = `${deadlineDate.toLocaleDateString()} - ${deadlineDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true })}`;
              
              return (
                <View key={index} style={styles.taskContainer}>
                  <Chip style={styles.taskChip} textStyle={{ color: "#FFF" }}>{task.title}</Chip>
                  <Text style={styles.deadlineText}>📅 Due: {formattedDeadline}</Text>
                </View>
              );
            })
          )}
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 15,
    backgroundColor: "#F7F9FC",
  },
  card: {
    padding: 15,
    borderRadius: 10,
    backgroundColor: "#FFF",
    elevation: 3,
    marginBottom: 10,
  },
  title: {
    textAlign: "center",
    marginBottom: 10,
    fontWeight: "bold",
    fontSize: 18,
  },
  statsText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 5,
  },
  progressBar: {
    height: 10,
    marginVertical: 10,
    borderRadius: 5,
  },
  taskContainer: {
    marginTop: 8,
  },
  taskChip: {
    backgroundColor: "#6200ee",
    paddingVertical: 5,
  },
  deadlineText: {
    fontSize: 14,
    marginTop: 5,
    color: "#37474F",
  },
});

