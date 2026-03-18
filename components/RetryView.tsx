import React from "react";
import { View, TouchableOpacity } from "react-native";
import { Text } from "@/components/Text";
import { Feather } from "@expo/vector-icons";

interface RetryViewProps {
  message: string;
  onRetry: () => void;
}

export function RetryView({ message, onRetry }: RetryViewProps) {
  return (
    <View className="flex-1 items-center justify-center px-8 bg-gray-50">
      <Feather name="alert-circle" size={48} color="#D1D5DB" />
      <Text className="text-gray-900 text-lg font-semibold text-center mt-4 mb-2">
        Something went wrong
      </Text>
      <Text className="text-gray-500 text-sm text-center mb-6">{message}</Text>
      <TouchableOpacity
        onPress={onRetry}
        className="bg-indigo-600 px-6 py-3 rounded-xl flex-row items-center gap-2"
        accessibilityRole="button"
        accessibilityLabel="Retry"
      >
        <Feather name="refresh-cw" size={14} color="#FFFFFF" />
        <Text className="text-white font-semibold">Try Again</Text>
      </TouchableOpacity>
    </View>
  );
}
