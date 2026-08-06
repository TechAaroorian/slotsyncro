// apps/app/vitest.setup.ts
import "@testing-library/jest-dom";
import { vi } from "vitest";

// 🟢 Global mock for next-intl across all test suites
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string, params?: Record<string, unknown>) => {
    if (params?.count !== undefined) {
      return `${params.count} ${key}`;
    }
    // Return key or fallback label mapping
    const keyMap: Record<string, string> = {
      yes: "Yes",
      no: "No",
      ifNeeded: "If Needed",
      maybe: "If Needed",
    };
    return keyMap[key] || key;
  },
  useLocale: () => "en",
}));

vi.mock("@/auth", () => ({
  auth: vi.fn().mockResolvedValue(null),
  handlers: { GET: vi.fn(), POST: vi.fn() },
  signIn: vi.fn(),
  signOut: vi.fn(),
}));

// Mock Next.js cache utilities (revalidatePath, revalidateTag, etc.)
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}));

// Mock Next.js navigation utilities
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => "/en/poll/test",
  useSearchParams: () => new URLSearchParams(),
}));

// Mock next-auth to avoid loading Next server internals
vi.mock("next-auth", () => ({
  default: vi.fn(),
  getServerSession: vi.fn(),
}));
