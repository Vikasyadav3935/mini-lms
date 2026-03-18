import "../global.css";
import React from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { AuthProvider } from "@/contexts/AuthContext";
import { CourseProvider } from "@/contexts/CourseContext";
import { NetworkProvider } from "@/contexts/NetworkContext";
import { OfflineBanner } from "@/components/OfflineBanner";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { View } from "react-native";
import { useFonts } from "expo-font";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    "Nunito-Regular": require("../assets/fonts/Nunito-Regular.ttf"),
    "Nunito-Medium": require("../assets/fonts/Nunito-Medium.ttf"),
    "Nunito-SemiBold": require("../assets/fonts/Nunito-SemiBold.ttf"),
    "Nunito-Bold": require("../assets/fonts/Nunito-Bold.ttf"),
    "Nunito-ExtraBold": require("../assets/fonts/Nunito-ExtraBold.ttf"),
    "Nunito-Black": require("../assets/fonts/Nunito-Black.ttf"),
    "Nunito-Light": require("../assets/fonts/Nunito-Light.ttf"),
    "Nunito-ExtraLight": require("../assets/fonts/Nunito-ExtraLight.ttf"),
    "Nunito-Italic": require("../assets/fonts/Nunito-Italic.ttf"),
    "Nunito-BoldItalic": require("../assets/fonts/Nunito-BoldItalic.ttf"),
  });

  if (!fontsLoaded) return null;

  return (
    <ErrorBoundary>
      <NetworkProvider>
        <AuthProvider>
          <CourseProvider>
            <View style={{ flex: 1 }}>
              <OfflineBanner />
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="index" />
                <Stack.Screen name="(auth)" />
                <Stack.Screen name="(tabs)" options={{ headerBackTitle: "" }} />
                <Stack.Screen
                  name="course/[id]"
                  options={{
                    headerShown: true,
                    headerStyle: { backgroundColor: "#FFFFFF" },
                    headerTintColor: "#111827",
                    headerShadowVisible: false,
                    headerBackTitle: "",
                    headerBackButtonDisplayMode: "minimal",
                    title: "Course Details",
                  }}
                />
                <Stack.Screen
                  name="course/webview/[id]"
                  options={{
                    headerShown: true,
                    headerStyle: { backgroundColor: "#FFFFFF" },
                    headerTintColor: "#111827",
                    headerShadowVisible: false,
                    headerBackTitle: "",
                    headerBackButtonDisplayMode: "minimal",
                    title: "Course Content",
                  }}
                />
              </Stack>
              <StatusBar style="dark" />
            </View>
          </CourseProvider>
        </AuthProvider>
      </NetworkProvider>
    </ErrorBoundary>
  );
}
