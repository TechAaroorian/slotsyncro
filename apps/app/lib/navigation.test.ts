import { describe, expect, it } from "vitest";
import { isNavigationPathActive, localizedPath } from "./navigation";

describe("localizedPath", () => {
  it("prefixes application paths with the active locale", () => {
    expect(localizedPath("de", "/availability")).toBe("/de/availability");
  });

  it("normalizes root and surrounding slashes", () => {
    expect(localizedPath("en", "/")).toBe("/en");
    expect(localizedPath("es", "//bookings//")).toBe("/es/bookings");
  });
});

describe("isNavigationPathActive", () => {
  it("matches dashboard only on the dashboard route", () => {
    expect(isNavigationPathActive("/en/dashboard", "/dashboard")).toBe(true);
    expect(isNavigationPathActive("/en/dashboard/settings", "/dashboard")).toBe(
      false,
    );
  });

  it("matches nested resource routes", () => {
    expect(isNavigationPathActive("/en/event-types/new", "/event-types")).toBe(
      true,
    );
  });
});
