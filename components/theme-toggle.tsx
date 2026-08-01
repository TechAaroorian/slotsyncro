"use client";

import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";

// Helper hook to safely detect client-side hydration without useEffect
function useIsMounted() {
  return useSyncExternalStore(
    () => () => {}, // empty subscribe function
    () => true, // client snapshot value
    () => false, // server snapshot value
  );
}

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const isMounted = useIsMounted();

  // Render a fixed-size placeholder during SSR to prevent layout shift
  if (!isMounted) {
    return <div className="w-8 h-8" aria-hidden="true" />;
  }

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="p-2 text-xs font-medium bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      aria-label="Toggle Theme"
    >
      {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
    </button>
  );
}
