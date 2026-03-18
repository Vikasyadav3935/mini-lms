import React from "react";
import { ActivityIndicator, View } from "react-native";

interface LoadingSpinnerProps {
  size?: "small" | "large";
  color?: string;
  fullScreen?: boolean;
}

export function LoadingSpinner({
  size = "large",
  color = "#4F46E5",
  fullScreen = false,
}: LoadingSpinnerProps) {
  if (fullScreen) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size={size} color={color} />
      </View>
    );
  }

  return (
    <View className="py-8 items-center">
      <ActivityIndicator size={size} color={color} />
    </View>
  );
}
