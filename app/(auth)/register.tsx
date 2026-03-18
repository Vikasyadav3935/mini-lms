import React from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Text } from "@/components/Text";
import { router, Link } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Feather } from "@expo/vector-icons";
import { useAuth } from "@/contexts/AuthContext";
import { SafeAreaView } from "react-native-safe-area-context";

const registerSchema = z
  .object({
    email: z.string().email("Enter a valid email"),
    username: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .regex(/^[a-z0-9_]+$/, "Only lowercase letters, numbers, and underscores"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterScreen() {
  const { register, error, clearError, isLoading } = useAuth();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: "", username: "", password: "", confirmPassword: "" },
  });

  const onSubmit = async (data: RegisterForm) => {
    clearError();
    try {
      await register(data.email, data.username, data.password);
      router.replace("/(tabs)");
    } catch {
      // error shown from context
    }
  };

  const fields: Array<{
    name: keyof RegisterForm;
    label: string;
    placeholder: string;
    secure?: boolean;
    keyboard?: "email-address" | "default";
  }> = [
    { name: "email", label: "Email", placeholder: "you@example.com", keyboard: "email-address" },
    { name: "username", label: "Username", placeholder: "john_doe" },
    { name: "password", label: "Password", placeholder: "••••••••", secure: true },
    { name: "confirmPassword", label: "Confirm Password", placeholder: "••••••••", secure: true },
  ];

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-1 px-6 py-8">
            <View className="mb-8">
              <Text className="text-indigo-600 text-4xl font-bold mb-2">
                MiniLMS
              </Text>
              <Text className="text-gray-900 text-2xl font-semibold">
                Create Account
              </Text>
              <Text className="text-gray-500 mt-1">
                Join thousands of learners
              </Text>
            </View>

            {error && (
              <View className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4 flex-row items-center gap-3">
                <Feather name="alert-circle" size={16} color="#EF4444" />
                <Text className="text-red-600 text-sm flex-1">{error}</Text>
              </View>
            )}

            {fields.map((field) => (
              <View key={field.name} className="mb-4">
                <Text className="text-gray-700 text-sm font-medium mb-2">
                  {field.label}
                </Text>
                <Controller
                  control={control}
                  name={field.name}
                  render={({ field: { onChange, value, onBlur } }) => (
                    <TextInput
                      className="bg-white text-gray-900 rounded-xl px-4 py-3 border border-gray-200"
                      placeholder={field.placeholder}
                      placeholderTextColor="#9CA3AF"
                      keyboardType={field.keyboard ?? "default"}
                      autoCapitalize="none"
                      secureTextEntry={field.secure}
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      accessibilityLabel={`${field.label} input`}
                    />
                  )}
                />
                {errors[field.name] && (
                  <Text className="text-red-500 text-xs mt-1">
                    {errors[field.name]?.message}
                  </Text>
                )}
              </View>
            ))}

            <TouchableOpacity
              onPress={handleSubmit(onSubmit)}
              disabled={isLoading}
              className="bg-indigo-600 py-4 rounded-xl items-center mb-4 mt-2"
              accessibilityRole="button"
              accessibilityLabel="Create account"
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-semibold text-base">
                  Create Account
                </Text>
              )}
            </TouchableOpacity>

            <View className="flex-row justify-center">
              <Text className="text-gray-500">Already have an account? </Text>
              <Link href="/(auth)/login">
                <Text className="text-indigo-600 font-semibold">Sign In</Text>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
