import React from "react";
import { createStackNavigator } from "@react-navigation/stack";

import AdminDashboardScreen from "../screens/admin/AdminDashboardScreen";
import AdminUserListScreen from "../screens/admin/AdminUserListScreen";
import AdminDriverListScreen from "../screens/admin/AdminDriverListScreen";
import AdminDestinationListScreen from "../screens/admin/AdminDestinationListScreen";
import AdminTransactionListScreen from "../screens/admin/AdminTransactionListScreen";
import AdminReviewListScreen from "../screens/admin/AdminReviewListScreen";
import AdminProfileScreen from "../screens/admin/AdminProfileScreen";
import AddDriverScreen from "../screens/driver/AddDriverScreen";
import EditDriverScreen from "../screens/driver/EditDriverScreen";
import AddDestinationScreen from "../screens/destination/AddDestinationScreen";
import EditDestinationScreen from "../screens/destination/EditDestinationScreen";
import TransactionDetailScreen from "../screens/finance/TransactionDetailScreen";

const Stack = createStackNavigator();

const AdminNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: "#1a237e" },
        headerTintColor: "#fff",
        headerTitleStyle: { fontWeight: "bold" },
      }}
    >
      <Stack.Screen
        name="AdminDashboard"
        component={AdminDashboardScreen}
        options={{ title: "Admin Dashboard" }}
      />
      <Stack.Screen
        name="AdminUsers"
        component={AdminUserListScreen}
        options={{ title: "Manage Users" }}
      />
      <Stack.Screen
        name="AdminDrivers"
        component={AdminDriverListScreen}
        options={{ title: "Manage Drivers" }}
      />
      <Stack.Screen
        name="AddDriver"
        component={AddDriverScreen}
        options={{ title: "Add New Driver" }}
      />
      <Stack.Screen
        name="EditDriver"
        component={EditDriverScreen}
        options={{ title: "Edit Driver" }}
      />
      <Stack.Screen
        name="AdminDestinations"
        component={AdminDestinationListScreen}
        options={{ title: "Manage Destinations" }}
      />
      <Stack.Screen
        name="AddDestination"
        component={AddDestinationScreen}
        options={{ title: "Add Destination" }}
      />
      <Stack.Screen
        name="EditDestination"
        component={EditDestinationScreen}
        options={{ title: "Edit Destination" }}
      />
      <Stack.Screen
        name="AdminTransactions"
        component={AdminTransactionListScreen}
        options={{ title: "All Transactions" }}
      />
      <Stack.Screen
        name="TransactionDetail"
        component={TransactionDetailScreen}
        options={{ title: "Transaction Detail" }}
      />
      <Stack.Screen
        name="AdminReviews"
        component={AdminReviewListScreen}
        options={{ title: "Manage Reviews" }}
      />
      <Stack.Screen
        name="AdminProfile"
        component={AdminProfileScreen}
        options={{ title: "Admin Profile" }}
      />
    </Stack.Navigator>
  );
};

export default AdminNavigator;