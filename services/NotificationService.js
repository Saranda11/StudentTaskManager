import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = "@tasks";

// Konfiguro njoftimet
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Anulo të gjitha njoftimet e planifikuara më parë
export async function cancelAllNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
  await AsyncStorage.removeItem("@lastTaskNotification");
}

// Dërgo njoftim vetëm kur ruhet një detyrë e re
export async function sendTaskSavedNotification() {
  const lastNotification = await AsyncStorage.getItem("@lastTaskNotification");

  if (!lastNotification) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Njoftim",
        body: "Detyra juaj është ruajtur me sukses",
        sound: "default",
      },
      trigger: null,
    });

    await AsyncStorage.setItem("@lastTaskNotification", JSON.stringify({ message: "Detyra u ruajt" }));
  }
}

// Planifiko një njoftim për një detyrë të caktuar
export async function scheduleTaskNotification(task) {
  if (!task || !task.deadline) return;

  console.log("📅 Scheduling notification for:", task.title);

  const deadlineDate = new Date(task.deadline);
  deadlineDate.setHours(9, 0, 0);

  if (deadlineDate > new Date()) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Mos harro detyrën!",
        body: `Përfundo: ${task.title} për kursin ${task.course}.`,
        sound: "default",
      },
      trigger: { date: deadlineDate },
    });
  }
}
