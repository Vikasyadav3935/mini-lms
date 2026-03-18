import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  return finalStatus === "granted";
}

export async function scheduleBookmarkMilestoneNotification(): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Learning Milestone! 🎯",
      body: "You've bookmarked 5 courses! You're on a great learning journey.",
      data: { type: "bookmark_milestone" },
    },
    trigger: null,
  });
}

export async function scheduleInactivityReminder(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Miss you! 📚",
      body: "You haven't visited your courses in a while. Pick up where you left off!",
      data: { type: "inactivity_reminder" },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 24 * 60 * 60,
      repeats: false,
    },
  });
}

export async function scheduleEnrollmentNotification(courseTitle: string): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Enrollment Confirmed! 🎉",
      body: `You're now enrolled in "${courseTitle}". Start learning today!`,
      data: { type: "enrollment" },
    },
    trigger: null,
  });
}

export async function scheduleLessonStartNotification(courseTitle: string): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Lesson Started! 🚀",
      body: `You're now learning "${courseTitle}". Keep it up!`,
      data: { type: "lesson_start" },
    },
    trigger: null,
  });
}

export async function cancelInactivityReminder(): Promise<void> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  const reminder = scheduled.find(
    (n) => n.content.data?.type === "inactivity_reminder"
  );
  if (reminder) {
    await Notifications.cancelScheduledNotificationAsync(reminder.identifier);
  }
}
