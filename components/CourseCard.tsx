import React, { memo } from "react";
import { View, TouchableOpacity, Pressable } from "react-native";
import { Text } from "@/components/Text";
import { Image } from "expo-image";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { Course } from "@/types";
import { useCourses } from "@/contexts/CourseContext";

interface CourseCardProps {
  course: Course;
}

function CourseCardComponent({ course }: CourseCardProps) {
  const { toggleBookmark, isBookmarked } = useCourses();
  const bookmarked = isBookmarked(course.id);

  const discountedPrice = course.price * (1 - course.discountPercentage / 100);

  return (
    <Pressable
      onPress={() => router.push(`/course/${course.id}`)}
      className="bg-white rounded-2xl mb-4 overflow-hidden border border-gray-100 active:opacity-80"
      accessibilityRole="button"
      accessibilityLabel={`View course: ${course.title}`}
    >
      <Image
        source={{ uri: course.thumbnail }}
        style={{ width: "100%", height: 160 }}
        contentFit="cover"
        transition={300}
        recyclingKey={course.id}
      />
      <View className="p-4">
        <View className="flex-row items-center mb-2">
          <Image
            source={{ uri: course.instructor.avatar }}
            style={{ width: 24, height: 24, borderRadius: 12 }}
            contentFit="cover"
          />
          <Text className="text-gray-500 text-xs ml-2 flex-1" numberOfLines={1}>
            {course.instructor.name}
          </Text>
          <View className="bg-indigo-50 px-2 py-0.5 rounded-full">
            <Text className="text-indigo-600 text-xs">{course.category}</Text>
          </View>
        </View>

        <Text className="text-gray-900 font-semibold text-base mb-1" numberOfLines={2}>
          {course.title}
        </Text>
        <Text className="text-gray-500 text-xs mb-3" numberOfLines={2}>
          {course.description}
        </Text>

        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <Text className="text-indigo-600 font-bold text-base">
              ${discountedPrice.toFixed(0)}
            </Text>
            {course.discountPercentage > 0 && (
              <Text className="text-gray-400 text-xs line-through">
                ${course.price}
              </Text>
            )}
          </View>

          <View className="flex-row items-center gap-3">
            <View className="flex-row items-center gap-1">
              <Feather name="star" size={12} color="#F59E0B" />
              <Text className="text-gray-500 text-xs">
                {course.rating.toFixed(1)}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => toggleBookmark(course.id)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityRole="button"
              accessibilityLabel={bookmarked ? "Remove bookmark" : "Bookmark course"}
            >
              <Feather
                name="bookmark"
                size={18}
                color={bookmarked ? "#4F46E5" : "#9CA3AF"}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

export const CourseCard = memo(CourseCardComponent);
