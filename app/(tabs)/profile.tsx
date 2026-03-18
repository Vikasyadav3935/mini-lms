import React, { useState } from "react";
import {
  View,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Text } from "@/components/Text";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { Feather } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/contexts/AuthContext";
import { useCourses } from "@/contexts/CourseContext";
import { router } from "expo-router";
import { appStorage } from "@/lib/storage";
import { CustomAlert } from "@/components/CustomAlert";

export default function ProfileScreen() {
  const { user, logout, isLoading } = useAuth();
  const { enrolledCourses, bookmarks } = useCourses();
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [permissionAlert, setPermissionAlert] = useState(false);
  const [logoutAlert, setLogoutAlert] = useState(false);

  const handlePickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setPermissionAlert(true);
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  const handleLogout = () => setLogoutAlert(true);

  const confirmLogout = async () => {
    await appStorage.clearAll();
    await logout();
    router.replace("/(auth)/login");
  };

  const avatarSource = avatarUri
    ? { uri: avatarUri }
    : user?.avatar?.url
    ? { uri: user.avatar.url }
    : null;

  const initials = user?.fullName
    ? user.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : user?.username?.[0]?.toUpperCase() ?? "?";

  const stats = [
    { label: "Enrolled", value: enrolledCourses.length, icon: "book-open" as const },
    { label: "Bookmarks", value: bookmarks.length, icon: "bookmark" as const },
  ];

  const details = [
    { label: "Username", value: user?.username },
    { label: "Role", value: user?.role },
    {
      label: "Email Verified",
      value: user?.isEmailVerified ? "Verified" : "Not verified",
      verified: user?.isEmailVerified,
    },
    {
      label: "Member since",
      value: user?.createdAt
        ? new Date(user.createdAt).toLocaleDateString()
        : "—",
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View className="px-4 pt-2 pb-6">
          <Text className="text-gray-900 text-2xl font-bold mb-6">Profile</Text>

          <View className="items-center mb-8">
            <TouchableOpacity onPress={handlePickImage} className="relative">
              {avatarSource ? (
                <Image
                  source={avatarSource}
                  style={{
                    width: 96,
                    height: 96,
                    borderRadius: 48,
                    borderWidth: 3,
                    borderColor: "#4F46E5",
                  }}
                  contentFit="cover"
                />
              ) : (
                <View
                  style={{ width: 96, height: 96, borderRadius: 48 }}
                  className="bg-indigo-100 border-2 border-indigo-300 items-center justify-center"
                >
                  <Text className="text-indigo-600 text-3xl font-bold">
                    {initials}
                  </Text>
                </View>
              )}
              <View className="absolute bottom-0 right-0 bg-indigo-600 rounded-full w-7 h-7 items-center justify-center">
                <Feather name="edit-2" size={12} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
            <Text className="text-gray-900 text-xl font-semibold mt-4">
              {user?.fullName || user?.username || "User"}
            </Text>
            <Text className="text-gray-500 text-sm">{user?.email}</Text>
          </View>

          <View className="flex-row gap-4 mb-6">
            {stats.map((stat) => (
              <View
                key={stat.label}
                className="flex-1 bg-white border border-gray-100 rounded-2xl p-4 items-center"
              >
                <Feather name={stat.icon} size={20} color="#4F46E5" />
                <Text className="text-gray-900 text-2xl font-bold mt-2">
                  {stat.value}
                </Text>
                <Text className="text-gray-500 text-xs">{stat.label}</Text>
              </View>
            ))}
          </View>

          <View className="bg-white border border-gray-100 rounded-2xl overflow-hidden mb-4">
            {details.map((item, i) => (
              <View
                key={item.label}
                className={`flex-row justify-between items-center px-4 py-3 ${
                  i < details.length - 1 ? "border-b border-gray-100" : ""
                }`}
              >
                <Text className="text-gray-500 text-sm">{item.label}</Text>
                <View className="flex-row items-center gap-1">
                  {"verified" in item && (
                    <Feather
                      name={item.verified ? "check-circle" : "x-circle"}
                      size={14}
                      color={item.verified ? "#10B981" : "#EF4444"}
                    />
                  )}
                  <Text className="text-gray-900 text-sm font-medium">
                    {item.value ?? "—"}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          <TouchableOpacity
            onPress={handleLogout}
            disabled={isLoading}
            className="bg-red-50 border border-red-100 py-4 rounded-xl flex-row items-center justify-center gap-2"
            accessibilityRole="button"
            accessibilityLabel="Logout"
          >
            {isLoading ? (
              <ActivityIndicator color="#EF4444" />
            ) : (
              <>
                <Feather name="log-out" size={16} color="#EF4444" />
                <Text className="text-red-500 font-semibold">Logout</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      <CustomAlert
        visible={permissionAlert}
        title="Permission Needed"
        message="Please allow access to your photo library to update your profile picture."
        icon={<Feather name="image" size={48} color="#6366F1" />}
        onDismiss={() => setPermissionAlert(false)}
        buttons={[{ text: "OK" }]}
      />

      <CustomAlert
        visible={logoutAlert}
        title="Logout"
        message="Are you sure you want to logout?"
        icon={<Feather name="log-out" size={48} color="#EF4444" />}
        onDismiss={() => setLogoutAlert(false)}
        buttons={[
          { text: "Cancel", style: "cancel" },
          { text: "Logout", style: "destructive", onPress: confirmLogout },
        ]}
      />
    </SafeAreaView>
  );
}
