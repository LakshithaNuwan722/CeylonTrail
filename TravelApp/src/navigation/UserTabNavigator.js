import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";

// Auth Screens
import ProfileScreen from "../screens/auth/ProfileScreen";
import EditProfileScreen from "../screens/auth/EditProfileScreen";

// Home
import HomeScreen from "../screens/HomeScreen";

// Destination Screens
import DestinationListScreen from "../screens/destination/DestinationListScreen";
import DestinationDetailScreen from "../screens/destination/DestinationDetailScreen";
import AddDestinationScreen from "../screens/destination/AddDestinationScreen";
import EditDestinationScreen from "../screens/destination/EditDestinationScreen";

// Driver Screens
import DriverListScreen from "../screens/driver/DriverListScreen";
import DriverDetailScreen from "../screens/driver/DriverDetailScreen";

// Finance Screens
import BookingScreen from "../screens/finance/BookingScreen";
import TransactionListScreen from "../screens/finance/TransactionListScreen";
import TransactionDetailScreen from "../screens/finance/TransactionDetailScreen";

// Review Screens
import ReviewListScreen from "../screens/review/ReviewListScreen";
import AddReviewScreen from "../screens/review/AddReviewScreen";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// ─── Home Stack ──────────────────────────────────────────────────────────────
const HomeStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: "#2196F3" },
      headerTintColor: "#fff",
      headerTitleStyle: { fontWeight: "bold" },
    }}
  >
    <Stack.Screen name="HomeMain" component={HomeScreen} options={{ title: "✈️ Travel App" }} />
    <Stack.Screen name="DestinationDetail" component={DestinationDetailScreen} options={{ title: "Destination" }} />
    <Stack.Screen name="DriverDetail" component={DriverDetailScreen} options={{ title: "Driver Info" }} />
    <Stack.Screen name="BookingScreen" component={BookingScreen} options={{ title: "Book Trip" }} />
    <Stack.Screen name="ReviewList" component={ReviewListScreen} options={{ title: "Reviews" }} />
  </Stack.Navigator>
);

// ─── Destination Stack ────────────────────────────────────────────────────────
const DestinationStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: "#2196F3" },
      headerTintColor: "#fff",
    }}
  >
    <Stack.Screen name="DestinationList" component={DestinationListScreen} options={{ title: "Destinations 🌍" }} />
    <Stack.Screen name="DestinationDetail" component={DestinationDetailScreen} options={{ title: "Destination Info" }} />
    <Stack.Screen name="AddDestination" component={AddDestinationScreen} options={{ title: "Add Destination" }} />
    <Stack.Screen name="EditDestination" component={EditDestinationScreen} options={{ title: "Edit Destination" }} />
    <Stack.Screen name="BookingScreen" component={BookingScreen} options={{ title: "Book Trip" }} />
    <Stack.Screen name="DriverDetail" component={DriverDetailScreen} options={{ title: "Driver Info" }} />
  </Stack.Navigator>
);

// ─── Bookings Stack ───────────────────────────────────────────────────────────
const BookingStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: "#2196F3" },
      headerTintColor: "#fff",
    }}
  >
    <Stack.Screen name="TransactionList" component={TransactionListScreen} options={{ title: "My Bookings 📋" }} />
    <Stack.Screen name="TransactionDetail" component={TransactionDetailScreen} options={{ title: "Booking Detail" }} />
    <Stack.Screen name="AddReview" component={AddReviewScreen} options={{ title: "Write Review ⭐" }} />
    <Stack.Screen name="ReviewList" component={ReviewListScreen} options={{ title: "All Reviews" }} />
  </Stack.Navigator>
);

// ─── Profile Stack ────────────────────────────────────────────────────────────
const ProfileStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: "#2196F3" },
      headerTintColor: "#fff",
    }}
  >
    <Stack.Screen name="ProfileMain" component={ProfileScreen} options={{ title: "My Profile 👤" }} />
    <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ title: "Edit Profile" }} />
    <Stack.Screen name="DriverList" component={DriverListScreen} options={{ title: "Drivers 🚗" }} />
    <Stack.Screen name="DriverDetail" component={DriverDetailScreen} options={{ title: "Driver Info" }} />
    <Stack.Screen name="BookingScreen" component={BookingScreen} options={{ title: "Book Trip" }} />
    <Stack.Screen name="ReviewList" component={ReviewListScreen} options={{ title: "Reviews ⭐" }} />
  </Stack.Navigator>
);

// ─── Main Tab Navigator ───────────────────────────────────────────────────────
const UserTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          const icons = {
            Home: focused ? "home" : "home-outline",
            Explore: focused ? "map" : "map-outline",
            Bookings: focused ? "calendar" : "calendar-outline",
            Profile: focused ? "person" : "person-outline",
          };
          return <Ionicons name={icons[route.name]} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#2196F3",
        tabBarInactiveTintColor: "#999",
        tabBarStyle: {
          elevation: 10,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          height: 60,
          paddingBottom: 8,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="Explore" component={DestinationStack} />
      <Tab.Screen name="Bookings" component={BookingStack} />
      <Tab.Screen name="Profile" component={ProfileStack} />
    </Tab.Navigator>
  );
};

export default UserTabNavigator;