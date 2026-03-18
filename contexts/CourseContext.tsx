import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
} from "react";
import { api } from "@/lib/api";
import { appStorage } from "@/lib/storage";
import {
  requestNotificationPermissions,
  scheduleBookmarkMilestoneNotification,
} from "@/lib/notifications";
import { Course, Instructor, PaginatedData, RandomProduct, RandomUser } from "@/types";

interface CourseState {
  courses: Course[];
  bookmarks: string[];
  enrolledCourses: string[];
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  hasNotified5Bookmarks: boolean;
}

type CourseAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_REFRESHING"; payload: boolean }
  | { type: "SET_COURSES"; payload: Course[] }
  | { type: "SET_BOOKMARKS"; payload: string[] }
  | { type: "SET_ENROLLED"; payload: string[] }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_NOTIFIED"; payload: boolean };

function reducer(state: CourseState, action: CourseAction): CourseState {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    case "SET_REFRESHING":
      return { ...state, isRefreshing: action.payload };
    case "SET_COURSES":
      return { ...state, courses: action.payload, error: null };
    case "SET_BOOKMARKS":
      return { ...state, bookmarks: action.payload };
    case "SET_ENROLLED":
      return { ...state, enrolledCourses: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload };
    case "SET_NOTIFIED":
      return { ...state, hasNotified5Bookmarks: action.payload };
    default:
      return state;
  }
}

const initialState: CourseState = {
  courses: [],
  bookmarks: [],
  enrolledCourses: [],
  isLoading: false,
  isRefreshing: false,
  error: null,
  hasNotified5Bookmarks: false,
};

interface CourseContextValue extends CourseState {
  fetchCourses: (refresh?: boolean) => Promise<void>;
  toggleBookmark: (courseId: string) => Promise<void>;
  enrollCourse: (courseId: string) => Promise<void>;
  isBookmarked: (courseId: string) => boolean;
  isEnrolled: (courseId: string) => boolean;
  getBookmarkedCourses: () => Course[];
}

const CourseContext = createContext<CourseContextValue | null>(null);

function mergeCourses(
  products: RandomProduct[],
  users: RandomUser[]
): Course[] {
  return products.map((product, index) => {
    const instructor = users[index % users.length];
    return {
      id: String(product.id),
      title: product.title,
      description: product.description,
      price: product.price,
      discountPercentage: product.discountPercentage,
      rating: product.rating,
      category: product.category,
      thumbnail: product.thumbnail,
      images: product.images,
      instructor: {
        id: instructor.login.uuid,
        name: `${instructor.name.first} ${instructor.name.last}`,
        email: instructor.email,
        avatar: instructor.picture.medium,
        location: `${instructor.location.city}, ${instructor.location.country}`,
      } satisfies Instructor,
    };
  });
}

export function CourseProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    loadPersistedData();
    requestNotificationPermissions();
  }, []);

  const loadPersistedData = async () => {
    const [bookmarks, enrolled] = await Promise.all([
      appStorage.getBookmarks(),
      appStorage.getEnrolledCourses(),
    ]);
    dispatch({ type: "SET_BOOKMARKS", payload: bookmarks });
    dispatch({ type: "SET_ENROLLED", payload: enrolled });
  };

  const fetchCourses = useCallback(async (refresh = false) => {
    dispatch({ type: refresh ? "SET_REFRESHING" : "SET_LOADING", payload: true });
    dispatch({ type: "SET_ERROR", payload: null });

    try {
      const [productsRes, usersRes] = await Promise.all([
        api.get<PaginatedData<RandomProduct>>("/api/v1/public/randomproducts?limit=20&page=1"),
        api.get<PaginatedData<RandomUser>>("/api/v1/public/randomusers?limit=20&page=1"),
      ]);

      const courses = mergeCourses(productsRes.data.data, usersRes.data.data);
      dispatch({ type: "SET_COURSES", payload: courses });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to load courses";
      dispatch({ type: "SET_ERROR", payload: message });
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
      dispatch({ type: "SET_REFRESHING", payload: false });
    }
  }, []);

  const toggleBookmark = useCallback(
    async (courseId: string) => {
      const current = state.bookmarks;
      const isCurrentlyBookmarked = current.includes(courseId);
      const updated = isCurrentlyBookmarked
        ? current.filter((id) => id !== courseId)
        : [...current, courseId];

      dispatch({ type: "SET_BOOKMARKS", payload: updated });
      await appStorage.setBookmarks(updated);

      if (!isCurrentlyBookmarked && updated.length === 5 && !state.hasNotified5Bookmarks) {
        await scheduleBookmarkMilestoneNotification();
        dispatch({ type: "SET_NOTIFIED", payload: true });
      }
    },
    [state.bookmarks, state.hasNotified5Bookmarks]
  );

  const enrollCourse = useCallback(
    async (courseId: string) => {
      if (state.enrolledCourses.includes(courseId)) return;
      const updated = [...state.enrolledCourses, courseId];
      dispatch({ type: "SET_ENROLLED", payload: updated });
      await appStorage.setEnrolledCourses(updated);
    },
    [state.enrolledCourses]
  );

  const isBookmarked = useCallback(
    (courseId: string) => state.bookmarks.includes(courseId),
    [state.bookmarks]
  );

  const isEnrolled = useCallback(
    (courseId: string) => state.enrolledCourses.includes(courseId),
    [state.enrolledCourses]
  );

  const getBookmarkedCourses = useCallback(
    () => state.courses.filter((c) => state.bookmarks.includes(c.id)),
    [state.courses, state.bookmarks]
  );

  return (
    <CourseContext.Provider
      value={{
        ...state,
        fetchCourses,
        toggleBookmark,
        enrollCourse,
        isBookmarked,
        isEnrolled,
        getBookmarkedCourses,
      }}
    >
      {children}
    </CourseContext.Provider>
  );
}

export function useCourses(): CourseContextValue {
  const ctx = useContext(CourseContext);
  if (!ctx) throw new Error("useCourses must be used within CourseProvider");
  return ctx;
}
