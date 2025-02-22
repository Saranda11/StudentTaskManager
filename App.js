import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Provider as PaperProvider } from "react-native-paper";
import { View, Button } from "react-native";
console.log("Testing update");


import WelcomeScreen from "./screens/WelcomeScreen";
import HomeScreen from "./screens/HomeScreen";
import AddTaskScreen from "./screens/AddTaskScreen";
import AnalyticsScreen from "./screens/AnalyticsScreen";
import {
  requestNotificationPermission,
  scheduleAllTaskNotifications,
  sendTestNotification,
  cancelAllNotifications
} from "./services/NotificationService";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Stack Navigator for Home
function HomeStack({ navigation }) {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ 
          title: "Task Manager",
          headerLeft: () => (
            <Button title="Back" onPress={() => navigation.navigate("Welcome")} />
          )
        }}
      />
      <Stack.Screen name="AddTask" component={AddTaskScreen} options={{ title: "Add New Task" }} />
    </Stack.Navigator>
  );
}

export default function App() {
  useEffect(() => {
    async function setupNotifications() {
      console.log("Setting up notifications..."); // Kontrollo në terminal nëse ekzekutohet
      const permissionGranted = await requestNotificationPermission();
      if (permissionGranted) {
        console.log("Notification permission granted! Scheduling notifications...");
        await scheduleAllTaskNotifications();
      } else {
        console.warn("Notification permission not granted!");
      }
    }
    setupNotifications();
  }, []);

  return (
    <PaperProvider>
      <NavigationContainer>
        <View style={{ flex: 1 }}>
          <Stack.Navigator initialRouteName="Welcome">
            <Stack.Screen name="Welcome" component={WelcomeScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
          </Stack.Navigator>
        </View>
      </NavigationContainer>
    </PaperProvider>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === "HomeStack") iconName = "format-list-bulleted";
          if (route.name === "Analytics") iconName = "chart-pie";
          return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#6200ee",
        tabBarInactiveTintColor: "gray",
      })}
    >
      <Tab.Screen name="HomeStack" component={HomeStack} options={{ title: "Home" }} />
      <Tab.Screen name="Analytics" component={AnalyticsScreen} />
    </Tab.Navigator>
  );
}
