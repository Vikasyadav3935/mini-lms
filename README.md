# MiniLMS — React Native Expo Assignment

A production-quality Mini Learning Management System (LMS) mobile app built with React Native Expo SDK 55.

## Screenshots

> Run the app and take screenshots of: Login, Course List, Course Detail, Bookmarks, Profile, WebView screens.

## Tech Stack

| Category | Technology |
|----------|-----------|
| Framework | React Native Expo SDK 55 |
| Language | TypeScript (strict mode) |
| Navigation | Expo Router v4 |
| Styling | NativeWind v4 (Tailwind CSS) |
| Secure Storage | Expo SecureStore |
| App Storage | AsyncStorage |
| Forms | React Hook Form + Zod |
| Images | Expo Image (caching) |
| Notifications | Expo Notifications |
| Network | @react-native-community/netinfo |

## Architecture

```
app/                    # Expo Router screens
  (auth)/               # Login & Register (unauthenticated)
  (tabs)/               # Main app (authenticated)
  course/               # Course detail + WebView
contexts/               # React Context for global state
  AuthContext           # Authentication state + SecureStore
  CourseContext         # Courses, bookmarks, enrollment + AsyncStorage
  NetworkContext        # Network monitoring + notifications
components/             # Reusable UI components
lib/
  api.ts                # HTTP client with retry logic + token refresh
  storage.ts            # SecureStore + AsyncStorage abstractions
  notifications.ts      # Expo Notifications helpers
types/                  # TypeScript interfaces
```

## Key Architectural Decisions

1. **SecureStore for tokens** — Access + refresh tokens stored in device's secure keychain, never in AsyncStorage
2. **Automatic token refresh** — API client intercepts 401 responses and attempts token refresh before failing
3. **Retry with backoff** — Failed requests retry up to 3 times with increasing delay
4. **Context + Reducer** — CourseContext uses useReducer for predictable state transitions
5. **Memoized renders** — CourseCard wrapped in React.memo; list callbacks use useCallback
6. **WebView bidirectional** — Native injects course data via `injectedJavaScript`; WebView posts messages back via `window.ReactNativeWebView.postMessage`
7. **Offline banner** — NetworkContext watches connectivity and surfaces an offline indicator
8. **Inactivity reminder** — On app open, schedules a 24h notification if user was inactive; cancels it when they return

## Setup

### Prerequisites
- Node.js 20+
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator or Android Emulator (or Expo Go app)

### Installation

```bash
git clone <repo-url>
cd mini-lms
npm install
npx expo start
```

### Environment Variables

No `.env` required — API base URL is `https://api.freeapi.app` (public).

### Build APK

```bash
# Install EAS CLI
npm install -g eas-cli
eas login

# Build development APK
eas build --platform android --profile development
```

## Features

- **Authentication** — Login/Register with JWT tokens in SecureStore, auto-login on restart
- **Course Catalog** — 20 courses from FreeAPI, with search and pull-to-refresh
- **Course Details** — Full details, enroll with animation, bookmark toggle
- **Bookmarks** — Persisted locally; notification fires when 5+ bookmarked
- **WebView** — Embedded course content with bidirectional JS bridge
- **Profile** — Avatar picker, stats, user info, logout
- **Offline Mode** — Banner shown when disconnected; inactivity reminder notifications
- **Error Handling** — Retry UI, error boundaries, WebView error fallback

## API

All data from `https://api.freeapi.app`:
- `POST /api/v1/users/login` — Authentication
- `POST /api/v1/users/register` — Registration
- `GET /api/v1/users/current-user` — Profile
- `GET /api/v1/public/randomproducts` — Course data
- `GET /api/v1/public/randomusers` — Instructor data

## Known Limitations

- Profile picture update is local only (no upload endpoint available)
- Course progress is simulated (no backend persistence)
- Enrollment is local state only
