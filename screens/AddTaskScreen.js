import React, { useState } from "react";
import { View, ScrollView, StyleSheet, Platform, Alert } from "react-native";
import { Button, TextInput, Menu } from "react-native-paper";
import DateTimePicker from "@react-native-community/datetimepicker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { sendTaskSavedNotification, cancelAllNotifications } from "../services/NotificationService";

const STORAGE_KEY = "@tasks";

export default function AddTaskScreen({ navigation, route }) {
  const editingTask = route.params?.task || null;

  const [title, setTitle] = useState(editingTask ? editingTask.title : "");
  const [course, setCourse] = useState(editingTask ? editingTask.course : "");
  const [deadline, setDeadline] = useState(editingTask ? new Date(editingTask.deadline) : new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [priority, setPriority] = useState(editingTask ? editingTask.priority : "Medium");
  const [menuVisible, setMenuVisible] = useState(false);

  const saveTaskWithNotification = async () => {
    if (!title.trim()) {
      Alert.alert("Validation Error", "Please enter a task title.");
      return;
    }

    const newTask = {
      id: editingTask ? editingTask.id : Date.now().toString(),
      title,
      course,
      deadline: deadline.toISOString(), // Ruajmë si ISO për të përfshirë datën dhe orën
      priority,
      progress: editingTask ? editingTask.progress : 0,
    };

    try {
      const storedTasks = await AsyncStorage.getItem(STORAGE_KEY);
      const tasks = storedTasks ? JSON.parse(storedTasks) : [];

      let updatedTasks;
      if (editingTask) {
        updatedTasks = tasks.map((task) => (task.id === editingTask.id ? newTask : task));
      } else {
        updatedTasks = [...tasks, newTask];
      }

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTasks));
      await cancelAllNotifications();
      await sendTaskSavedNotification("Detyra juaj është ruajtur me sukses");

      navigation.goBack();
    } catch (error) {
      console.error("Failed to save task:", error);
      Alert.alert("Error", "Something went wrong while saving the task.");
    }
  };

  const onDateChange = (event, selectedDate) => {
    if (selectedDate) {
      setDeadline((prevDate) => new Date(selectedDate.setHours(prevDate.getHours(), prevDate.getMinutes())));
    }
    setShowDatePicker(false);
  };

  const onTimeChange = (event, selectedTime) => {
    if (selectedTime) {
      setDeadline((prevDate) => new Date(prevDate.setHours(selectedTime.getHours(), selectedTime.getMinutes())));
    }
    setShowTimePicker(false);
  };

  return (
    <ScrollView style={styles.container}>
      <TextInput label="Task Title" value={title} onChangeText={setTitle} style={styles.input} mode="outlined" />
      <TextInput label="Course Name" value={course} onChangeText={setCourse} style={styles.input} mode="outlined" />

      {/* Data dhe Ora */}
      <TextInput
        label="Deadline"
        value={`${deadline.toLocaleDateString()} - ${deadline.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true })}`}
        style={styles.input}
        mode="outlined"
        editable={false}
        right={<TextInput.Icon icon="calendar" onPress={() => setShowDatePicker(true)} />}
      />
      {showDatePicker && (
        <DateTimePicker
          value={deadline}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={onDateChange}
        />
      )}

      <Button mode="outlined" onPress={() => setShowTimePicker(true)} style={styles.timeButton} icon="clock">
        Set Time
      </Button>
      {showTimePicker && (
        <DateTimePicker
          value={deadline}
          mode="time"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={onTimeChange}
        />
      )}

      {/* Menu për prioritetin */}
      <Menu
        visible={menuVisible}
        onDismiss={() => setMenuVisible(false)}
        anchor={
          <Button mode="outlined" onPress={() => setMenuVisible(true)} style={styles.input} icon="alert-circle">
            Priority: {priority}
          </Button>
        }
      >
        <Menu.Item onPress={() => { setPriority("High"); setMenuVisible(false); }} title="High" />
        <Menu.Item onPress={() => { setPriority("Medium"); setMenuVisible(false); }} title="Medium" />
        <Menu.Item onPress={() => { setPriority("Low"); setMenuVisible(false); }} title="Low" />
      </Menu>

      <Button mode="contained" onPress={saveTaskWithNotification} style={styles.button} icon="content-save">
        {editingTask ? "Update Task" : "Save Task"}
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  input: { marginBottom: 15 },
  button: { marginTop: 20, backgroundColor: "#6200ee" },
  timeButton: {
    marginBottom: 15,
    borderColor: "#6200ee",
    borderWidth: 1,
    borderRadius: 5,
  },
});
