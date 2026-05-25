import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "../context/AuthContext";
import AuthNavigator from "./AuthNavigator";
import UserTabNavigator from "./UserTabNavigator";
import AdminNavigator from "./AdminNavigator";

const AppNavigator = () => {
  const { user, isLoading, isAdmin } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {!user ? (
        <AuthNavigator />
      ) : isAdmin ? (
        <AdminNavigator />
      ) : (
        <UserTabNavigator />
      )}
    </NavigationContainer>
  );
};

export default AppNavigator;