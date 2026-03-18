import React from "react";
import { View, TouchableOpacity } from "react-native";
import { Text } from "@/components/Text";
import { Feather } from "@expo/vector-icons";
import {
  ErrorBoundary as BaseErrorBoundary,
  FallbackProps,
} from "react-error-boundary";

function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <View className="flex-1 items-center justify-center px-8 bg-gray-50">
      <Feather name="alert-triangle" size={48} color="#D1D5DB" />
      <Text className="text-gray-900 text-lg font-semibold mt-4 mb-2">
        Unexpected Error
      </Text>
      <Text className="text-gray-500 text-sm text-center mb-6">
        {error instanceof Error ? error.message : "An unknown error occurred"}
      </Text>
      <TouchableOpacity
        onPress={resetErrorBoundary}
        className="bg-indigo-600 px-6 py-3 rounded-xl flex-row items-center gap-2"
      >
        <Feather name="refresh-cw" size={14} color="#FFFFFF" />
        <Text className="text-white font-semibold">Restart Screen</Text>
      </TouchableOpacity>
    </View>
  );
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function ErrorBoundary({ children, fallback }: ErrorBoundaryProps) {
  return (
    <BaseErrorBoundary
      FallbackComponent={fallback ? () => <>{fallback}</> : ErrorFallback}
    >
      {children}
    </BaseErrorBoundary>
  );
}
