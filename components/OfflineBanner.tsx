import React from "react";
import { View } from "react-native";
import { Text } from "@/components/Text";
import { Feather } from "@expo/vector-icons";
import { useNetwork } from "@/contexts/NetworkContext";

export function OfflineBanner() {
  const { isConnected } = useNetwork();

  if (isConnected) return null;

  return (
    <View className="bg-red-50 border-b border-red-100 px-4 py-2 flex-row items-center justify-center gap-2">
      <Feather name="wifi-off" size={14} color="#EF4444" />
      <Text className="text-red-500 text-sm font-medium">
        No internet connection
      </Text>
    </View>
  );
}
