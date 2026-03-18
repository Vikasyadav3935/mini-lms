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

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const { login, error, clearError, isLoading } = useAuth();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: LoginForm) => {
    clearError();
    try {
      await login(data.email, data.password);
      router.replace("/(tabs)");
    } catch {
      // error shown from context
    }
  };

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
          <View className="flex-1 px-6 justify-center">
            <View className="mb-10">
              <Text className="text-indigo-600 text-4xl font-bold mb-2">
                MiniLMS
              </Text>
              <Text className="text-gray-900 text-2xl font-semibold">
                Welcome back
              </Text>
              <Text className="text-gray-500 mt-1">
                Sign in to continue learning
              </Text>
            </View>

            {error && (
              <View className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4 flex-row items-center gap-3">
                <Feather name="alert-circle" size={16} color="#EF4444" />
                <Text className="text-red-600 text-sm flex-1">{error}</Text>
              </View>
            )}

            <View className="mb-4">
              <Text className="text-gray-700 text-sm font-medium mb-2">
                Email
              </Text>
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, value, onBlur } }) => (
                  <TextInput
                    className="bg-white text-gray-900 rounded-xl px-4 py-3 border border-gray-200"
                    placeholder="you@example.com"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    accessibilityLabel="Email input"
                  />
                )}
              />
              {errors.email && (
                <Text className="text-red-500 text-xs mt-1">
                  {errors.email.message}
                </Text>
              )}
            </View>

            <View className="mb-6">
              <Text className="text-gray-700 text-sm font-medium mb-2">
                Password
              </Text>
              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, value, onBlur } }) => (
                  <TextInput
                    className="bg-white text-gray-900 rounded-xl px-4 py-3 border border-gray-200"
                    placeholder="••••••••"
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    accessibilityLabel="Password input"
                  />
                )}
              />
              {errors.password && (
                <Text className="text-red-500 text-xs mt-1">
                  {errors.password.message}
                </Text>
              )}
            </View>

            <TouchableOpacity
              onPress={handleSubmit(onSubmit)}
              disabled={isLoading}
              className="bg-indigo-600 py-4 rounded-xl items-center mb-4"
              accessibilityRole="button"
              accessibilityLabel="Sign in"
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-semibold text-base">
                  Sign In
                </Text>
              )}
            </TouchableOpacity>

            <View className="flex-row justify-center">
              <Text className="text-gray-500">Don't have an account? </Text>
              <Link href="/(auth)/register">
                <Text className="text-indigo-600 font-semibold">Sign Up</Text>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
