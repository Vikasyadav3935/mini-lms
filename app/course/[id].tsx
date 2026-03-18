import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  Animated,
} from "react-native";
import { Text } from "@/components/Text";
import { Image } from "expo-image";
import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, router, useNavigation } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useCourses } from "@/contexts/CourseContext";
import { scheduleEnrollmentNotification } from "@/lib/notifications";
import { CustomAlert } from "@/components/CustomAlert";

export default function CourseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { courses, toggleBookmark, enrollCourse, isBookmarked, isEnrolled } =
    useCourses();
  const navigation = useNavigation();
  const enrollScale = useRef(new Animated.Value(1)).current;
  const [enrollAlert, setEnrollAlert] = useState(false);
  const [enrolledCourseId, setEnrolledCourseId] = useState<string | null>(null);

  const course = useMemo(
    () => courses.find((c) => c.id === id),
    [courses, id]
  );

  useEffect(() => {
    if (course) {
      navigation.setOptions({ title: course.title });
    }
  }, [course, navigation]);

  const handleEnroll = useCallback(async () => {
    if (!course) return;
    if (isEnrolled(course.id)) {
      router.push(`/course/webview/${course.id}`);
      return;
    }

    Animated.sequence([
      Animated.timing(enrollScale, { toValue: 0.95, duration: 100, useNativeDriver: true }),
      Animated.timing(enrollScale, { toValue: 1.05, duration: 100, useNativeDriver: true }),
      Animated.timing(enrollScale, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();

    await enrollCourse(course.id);
    await scheduleEnrollmentNotification(course.title);
    setEnrolledCourseId(course.id);
    setEnrollAlert(true);
  }, [course, enrollCourse, isEnrolled, enrollScale]);

  if (!course) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 items-center justify-center">
        <Text className="text-gray-900 text-lg">Course not found</Text>
      </SafeAreaView>
    );
  }

  const bookmarked = isBookmarked(course.id);
  const enrolled = isEnrolled(course.id);
  const discountedPrice = course.price * (1 - course.discountPercentage / 100);

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["bottom"]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Image
          source={{ uri: course.thumbnail }}
          style={{ width: "100%", height: 220 }}
          contentFit="cover"
        />

        <View className="p-4">
          <View className="flex-row items-center justify-between mb-3">
            <View className="bg-indigo-50 px-3 py-1 rounded-full">
              <Text className="text-indigo-600 text-xs font-medium">
                {course.category}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => toggleBookmark(course.id)}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              accessibilityRole="button"
              accessibilityLabel={bookmarked ? "Remove bookmark" : "Bookmark this course"}
            >
              <Feather
                name="bookmark"
                size={22}
                color={bookmarked ? "#4F46E5" : "#9CA3AF"}
              />
            </TouchableOpacity>
          </View>

          <Text className="text-gray-900 text-xl font-bold mb-2">
            {course.title}
          </Text>

          <View className="flex-row items-center gap-3 mb-4">
            <View className="flex-row items-center gap-1">
              <Feather name="star" size={14} color="#F59E0B" />
              <Text className="text-gray-700 text-sm font-medium">
                {course.rating.toFixed(1)}
              </Text>
            </View>
            <Text className="text-gray-300">|</Text>
            <Text className="text-gray-500 text-sm">{course.category}</Text>
          </View>

          <View className="bg-white border border-gray-100 rounded-2xl p-4 mb-4">
            <View className="flex-row items-center mb-2">
              <Image
                source={{ uri: course.instructor.avatar }}
                style={{ width: 44, height: 44, borderRadius: 22 }}
                contentFit="cover"
              />
              <View className="ml-3">
                <Text className="text-gray-900 font-semibold">
                  {course.instructor.name}
                </Text>
                <View className="flex-row items-center gap-1 mt-0.5">
                  <Feather name="map-pin" size={11} color="#9CA3AF" />
                  <Text className="text-gray-500 text-xs">
                    {course.instructor.location}
                  </Text>
                </View>
              </View>
            </View>
            <View className="flex-row items-center gap-1">
              <Feather name="mail" size={12} color="#9CA3AF" />
              <Text className="text-gray-500 text-xs">{course.instructor.email}</Text>
            </View>
          </View>

          <Text className="text-gray-900 font-semibold text-base mb-2">
            About this course
          </Text>
          <Text className="text-gray-600 leading-6 mb-6">
            {course.description}
          </Text>

          <View className="flex-row items-center gap-3 mb-6">
            <Text className="text-gray-900 text-3xl font-bold">
              ${discountedPrice.toFixed(0)}
            </Text>
            {course.discountPercentage > 0 && (
              <>
                <Text className="text-gray-400 text-lg line-through">
                  ${course.price}
                </Text>
                <View className="bg-emerald-50 px-2 py-0.5 rounded">
                  <Text className="text-emerald-600 text-xs font-bold">
                    {course.discountPercentage.toFixed(0)}% OFF
                  </Text>
                </View>
              </>
            )}
          </View>

          <Animated.View style={{ transform: [{ scale: enrollScale }] }}>
            <TouchableOpacity
              onPress={handleEnroll}
              className={`py-4 rounded-xl flex-row items-center justify-center gap-2 ${
                enrolled ? "bg-emerald-500" : "bg-indigo-600"
              }`}
              accessibilityRole="button"
              accessibilityLabel={enrolled ? "Continue learning" : "Enroll now"}
            >
              <Feather
                name={enrolled ? "play" : "plus-circle"}
                size={18}
                color="#FFFFFF"
              />
              <Text className="text-white font-bold text-base">
                {enrolled ? "Continue Learning" : "Enroll Now"}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </ScrollView>

      <CustomAlert
        visible={enrollAlert}
        title="You're Enrolled! 🎉"
        message={`Welcome to "${course.title}". Ready to start learning?`}
        icon={<Feather name="check-circle" size={48} color="#6366F1" />}
        onDismiss={() => setEnrollAlert(false)}
        buttons={[
          { text: "Later", style: "cancel" },
          {
            text: "Start Learning",
            onPress: () => router.push(`/course/webview/${enrolledCourseId}`),
          },
        ]}
      />
    </SafeAreaView>
  );
}
