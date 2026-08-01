"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

// Filter out React 19's script tag warning in development without breaking next-themes
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  const originalError = console.error;
  console.error = (...args: unknown[]) => {
    if (
      typeof args[0] === "string" &&
      args[0].includes(
        "Encountered a script tag while rendering React component",
      )
    ) {
      return;
    }
    originalError.apply(console, args);
  };
}

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
