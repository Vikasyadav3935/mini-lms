import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  TextInput,
  RefreshControl,
} from "react-native";
import { LegendList } from "@legendapp/list";
import { Text } from "@/components/Text";
import { Feather } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { CourseCard } from "@/components/CourseCard";
import { RetryView } from "@/components/RetryView";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useCourses } from "@/contexts/CourseContext";
import { Course } from "@/types";

export default function CoursesScreen() {
  const { courses, isLoading, isRefreshing, error, fetchCourses } = useCourses();
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (courses.length === 0) {
      fetchCourses();
    }
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return courses;
    const q = search.toLowerCase();
    return courses.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
        c.instructor.name.toLowerCase().includes(q)
    );
  }, [courses, search]);

  const onRefresh = useCallback(() => fetchCourses(true), [fetchCourses]);

  const renderItem = useCallback(
    ({ item }: { item: Course }) => <CourseCard course={item} />,
    []
  );

  const keyExtractor = useCallback((item: Course) => item.id, []);

  if (error && courses.length === 0) {
    return <RetryView message={error} onRetry={() => fetchCourses()} />;
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="px-4 pt-2 pb-4">
        <Text className="text-gray-900 text-2xl font-bold mb-1">
          Explore Courses
        </Text>
        <Text className="text-gray-500 text-sm mb-4">
          {courses.length} courses available
        </Text>
        <View className="flex-row items-center bg-white border border-gray-200 rounded-xl px-3 gap-2">
          <Feather name="search" size={16} color="#9CA3AF" />
          <TextInput
            className="flex-1 text-gray-900 py-3"
            placeholder="Search courses, instructors..."
            placeholderTextColor="#9CA3AF"
            value={search}
            onChangeText={setSearch}
            accessibilityLabel="Search courses"
            clearButtonMode="while-editing"
          />
        </View>
      </View>

      {isLoading && courses.length === 0 ? (
        <LoadingSpinner fullScreen />
      ) : (
        <LegendList
          data={filtered}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              tintColor="#4F46E5"
              colors={["#4F46E5"]}
            />
          }
          ListEmptyComponent={
            <View className="items-center py-16">
              <Feather name="search" size={40} color="#D1D5DB" />
              <Text className="text-gray-900 font-semibold mt-4">
                No courses found
              </Text>
              <Text className="text-gray-500 text-sm mt-1">
                Try a different search term
              </Text>
            </View>
          }
          showsVerticalScrollIndicator={false}
          recycleItems
          estimatedItemSize={260}
        />
      )}
    </SafeAreaView>
  );
}
