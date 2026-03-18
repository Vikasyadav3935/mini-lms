import React, { useCallback } from "react";
import { View } from "react-native";
import { LegendList } from "@legendapp/list";
import { Text } from "@/components/Text";
import { Feather } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { CourseCard } from "@/components/CourseCard";
import { useCourses } from "@/contexts/CourseContext";
import { Course } from "@/types";

export default function BookmarksScreen() {
  const { getBookmarkedCourses, bookmarks } = useCourses();
  const bookmarkedCourses = getBookmarkedCourses();

  const renderItem = useCallback(
    ({ item }: { item: Course }) => <CourseCard course={item} />,
    []
  );

  const keyExtractor = useCallback((item: Course) => item.id, []);

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="px-4 pt-2 pb-4">
        <Text className="text-gray-900 text-2xl font-bold mb-1">Bookmarks</Text>
        <Text className="text-gray-500 text-sm">
          {bookmarks.length} course{bookmarks.length !== 1 ? "s" : ""} saved
        </Text>
      </View>

      {bookmarks.length >= 4 && (
        <View className="mx-4 mb-4 bg-indigo-50 border border-indigo-100 rounded-xl p-3 flex-row items-center gap-2">
          <Feather name="award" size={16} color="#4F46E5" />
          <Text className="text-indigo-600 text-sm font-medium flex-1">
            Almost there! One more bookmark to go.
          </Text>
        </View>
      )}

      <LegendList
        data={bookmarkedCourses}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
        ListEmptyComponent={
          <View className="items-center py-20">
            <Feather name="bookmark" size={48} color="#D1D5DB" />
            <Text className="text-gray-900 font-semibold text-lg mt-4">
              No bookmarks yet
            </Text>
            <Text className="text-gray-500 text-sm mt-2 text-center px-8">
              Tap the bookmark icon on any course to save it for later
            </Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
        recycleItems
        estimatedItemSize={260}
      />
    </SafeAreaView>
  );
}
