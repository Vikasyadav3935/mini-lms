import React from "react";
import { Modal, View, TouchableOpacity, Pressable } from "react-native";
import { Text } from "@/components/Text";

export interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: "default" | "cancel" | "destructive";
}

interface CustomAlertProps {
  visible: boolean;
  title: string;
  message?: string;
  icon?: React.ReactNode;
  buttons?: AlertButton[];
  onDismiss?: () => void;
}

export function CustomAlert({
  visible,
  title,
  message,
  icon,
  buttons = [{ text: "OK" }],
  onDismiss,
}: CustomAlertProps) {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onDismiss}
    >
      <Pressable
        className="flex-1 items-center justify-center px-6"
        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        onPress={onDismiss}
      >
        <Pressable
          className="bg-white w-full rounded-3xl overflow-hidden"
          onPress={() => {}}
        >
          {/* Body */}
          <View className="items-center px-6 pt-8 pb-6">
            {icon && <View className="mb-4">{icon}</View>}
            <Text className="text-gray-900 text-xl font-bold text-center mb-2">
              {title}
            </Text>
            {message && (
              <Text className="text-gray-500 text-sm text-center leading-5">
                {message}
              </Text>
            )}
          </View>

          {/* Divider */}
          <View className="h-px bg-gray-100" />

          {/* Buttons */}
          <View className={`flex-row ${buttons.length > 1 ? "divide-x divide-gray-100" : ""}`}>
            {buttons.map((btn, i) => (
              <TouchableOpacity
                key={i}
                className="flex-1 py-4 items-center justify-center active:bg-gray-50"
                onPress={() => {
                  onDismiss?.();
                  btn.onPress?.();
                }}
              >
                <Text
                  className={`text-base ${
                    btn.style === "destructive"
                      ? "font-semibold text-red-500"
                      : btn.style === "cancel"
                      ? "font-medium text-gray-400"
                      : "font-semibold text-indigo-600"
                  }`}
                >
                  {btn.text}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
