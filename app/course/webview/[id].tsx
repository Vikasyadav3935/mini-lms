import React, { useCallback, useMemo, useRef, useState } from "react";
import { View, TouchableOpacity, ActivityIndicator } from "react-native";
import { Text } from "@/components/Text";
import { WebView, WebViewMessageEvent } from "react-native-webview";
import { useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useCourses } from "@/contexts/CourseContext";
import { scheduleLessonStartNotification } from "@/lib/notifications";

function buildCourseHTML(course: {
  title: string;
  description: string;
  category: string;
  rating: number;
  price: number;
  discountPercentage: number;
  instructor: { name: string; email: string; location: string };
}): string {
  const discountedPrice = (course.price * (1 - course.discountPercentage / 100)).toFixed(0);
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
  <title>${course.title}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #0F172A;
      color: #aab9cc;
      padding: 20px;
      line-height: 1.6;
    }
    .badge {
      display: inline-block;
      background: rgba(99,102,241,0.2);
      color: #818CF8;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      margin-bottom: 16px;
      border: 1px solid rgba(99,102,241,0.3);
    }
    h1 { font-size: 22px; color: #F8FAFC; margin-bottom: 12px; font-weight: 700; }
    .meta { display: flex; gap: 16px; margin-bottom: 20px; flex-wrap: wrap; }
    .meta-item { font-size: 13px; color: #94A3B8; }
    .meta-item span { color: #F8FAFC; font-weight: 600; }
    .section { background: #1E293B; border-radius: 16px; padding: 16px; margin-bottom: 16px; border: 1px solid #334155; }
    .section h2 { font-size: 14px; color: #94A3B8; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; }
    p { color: #CBD5E1; font-size: 14px; }
    .price-row { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
    .price { font-size: 28px; font-weight: 800; color: #6366F1; }
    .original { font-size: 16px; text-decoration: line-through; color: #64748B; }
    .discount { background: rgba(34,197,94,0.2); color: #4ADE80; padding: 3px 8px; border-radius: 6px; font-size: 12px; font-weight: 700; }
    .rating { color: #FBBF24; font-size: 16px; }
    .btn {
      display: block; width: 100%; padding: 16px;
      background: linear-gradient(135deg, #6366F1, #4F46E5);
      color: white; border: none; border-radius: 14px;
      font-size: 16px; font-weight: 700; cursor: pointer;
      text-align: center; margin-top: 20px;
      transition: opacity 0.2s;
    }
    .btn:active { opacity: 0.8; }
    .progress-bar-container { background: #334155; border-radius: 8px; height: 8px; margin-top: 8px; }
    .progress-bar { background: linear-gradient(90deg, #6366F1, #818CF8); height: 100%; border-radius: 8px; width: 25%; }
  </style>
</head>
<body>
  <div class="badge">${course.category}</div>
  <h1>${course.title}</h1>
  <div class="meta">
    <div class="meta-item">Rating: <span>${course.rating.toFixed(1)} ★</span></div>
    <div class="meta-item">Instructor: <span>${course.instructor.name}</span></div>
  </div>

  <div class="price-row">
    <span class="price">$${discountedPrice}</span>
    ${course.discountPercentage > 0 ? `<span class="original">$${course.price}</span><span class="discount">${course.discountPercentage.toFixed(0)}% OFF</span>` : ''}
  </div>

  <div class="section">
    <h2>About This Course</h2>
    <p>${course.description}</p>
  </div>

  <div class="section">
    <h2>Your Progress</h2>
    <p>25% complete — Keep going!</p>
    <div class="progress-bar-container">
      <div class="progress-bar"></div>
    </div>
  </div>

  <div class="section">
    <h2>Instructor</h2>
    <p><strong style="color:#F8FAFC">${course.instructor.name}</strong></p>
    <p>${course.instructor.location}</p>
    <p>${course.instructor.email}</p>
  </div>

  <button class="btn" onclick="handleStartLesson()">▶ Start Next Lesson</button>

  <script>
    window.onload = function() {
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'WEBVIEW_READY',
          courseTitle: '${course.title.replace(/'/g, "\\'")}',
        }));
      }
    };

    function handleStartLesson() {
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'START_LESSON',
          courseTitle: '${course.title.replace(/'/g, "\\'")}',
        }));
      }
    }
  </script>
</body>
</html>
  `.trim();
}

export default function CourseWebViewScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { courses } = useCourses();
  const webViewRef = useRef<WebView>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [progress, setProgress] = useState(0);

  const course = useMemo(() => courses.find((c) => c.id === id), [courses, id]);

  const injectedJS = useMemo(() => {
    if (!course) return "";
    return `
      (function() {
        window.__courseData = ${JSON.stringify({
          id: course.id,
          title: course.title,
          category: course.category,
        })};
        true;
      })();
    `;
  }, [course]);

  const onMessage = useCallback(
    (event: WebViewMessageEvent) => {
      try {
        const msg = JSON.parse(event.nativeEvent.data) as {
          type: string;
          courseTitle?: string;
        };
        if (msg.type === "START_LESSON") {
          setProgress((p) => Math.min(p + 25, 100));
          if (course) scheduleLessonStartNotification(course.title);
        }
      } catch {
        // ignore malformed messages
      }
    },
    [course]
  );

  const onLoadEnd = useCallback(() => {
    setIsLoading(false);
    if (course) scheduleLessonStartNotification(course.title);
  }, [course]);
  const onError = useCallback(() => {
    setIsLoading(false);
    setHasError(true);
  }, []);

  if (!course) {
    return (
      <SafeAreaView className="flex-1 bg-slate-900 items-center justify-center">
        <Text className="text-white">Course not found</Text>
      </SafeAreaView>
    );
  }

  if (hasError) {
    return (
      <SafeAreaView className="flex-1 bg-slate-900 items-center justify-center px-8">
        <Text className="text-4xl mb-4">⚠️</Text>
        <Text className="text-white font-semibold text-lg mb-2">
          Content Failed to Load
        </Text>
        <Text className="text-slate-400 text-sm text-center mb-6">
          The course content couldn't be loaded. Please try again.
        </Text>
        <TouchableOpacity
          onPress={() => {
            setHasError(false);
            setIsLoading(true);
            webViewRef.current?.reload();
          }}
          className="bg-indigo-500 px-6 py-3 rounded-xl"
        >
          <Text className="text-white font-semibold">Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-900" edges={["bottom"]}>
      {progress > 0 && (
        <View className="px-4 py-2 bg-slate-800">
          <Text className="text-slate-400 text-xs mb-1">
            Progress: {progress}%
          </Text>
          <View className="bg-slate-700 h-1.5 rounded-full">
            <View
              className="bg-indigo-500 h-1.5 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </View>
        </View>
      )}

      {isLoading && (
        <View className="absolute inset-0 items-center justify-center z-10 bg-slate-900">
          <ActivityIndicator size="large" color="#6366F1" />
          <Text className="text-slate-400 mt-3 text-sm">Loading content...</Text>
        </View>
      )}

      <WebView
        ref={webViewRef}
        // For URL-based content, headers pass course context to the server:
        // source={{ uri: COURSE_CONTENT_URL, headers: { "X-Course-Id": course.id, "X-Course-Title": course.title, "X-Course-Category": course.category } }}
        // Local HTML is used here; course data is injected via injectedJavaScript instead.
        source={{ html: buildCourseHTML(course) }}
        onLoadEnd={onLoadEnd}
        onError={onError}
        onMessage={onMessage}
        injectedJavaScript={injectedJS}
        javaScriptEnabled
        domStorageEnabled
        startInLoadingState={false}
        style={{ flex: 1, backgroundColor: "#0F172A" }}
        originWhitelist={["*"]}
      />
    </SafeAreaView>
  );
}
