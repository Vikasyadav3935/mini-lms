import React, { useEffect } from "react";
import { Redirect } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { LoadingSpinner } from "@/components/LoadingSpinner";

export default function Index() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <LoadingSpinner fullScreen />;
  if (isAuthenticated) return <Redirect href="/(tabs)" />;
  return <Redirect href="/(auth)/login" />;
}
