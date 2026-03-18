import { useCourses } from "@/contexts/CourseContext";

export function useBookmarks() {
  const { bookmarks, toggleBookmark, isBookmarked, getBookmarkedCourses } =
    useCourses();
  return { bookmarks, toggleBookmark, isBookmarked, getBookmarkedCourses };
}
