const STORAGE_PREFIX = "nepsFront.routeContext.";

export const ROUTE_CONTEXT_KEYS = {
  course: "course",
  institution: "institution",
  period: "period",
  region: "region",
  room: "room",
  schedule: "schedule",
  service: "service",
  serviceRoom: "serviceRoom",
  student: "student",
  user: "user",
};

export function setRouteContext(key, value) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(value));
}

export function getRouteContext(key, fallback = null) {
  if (typeof window === "undefined") return fallback;

  const rawValue = window.sessionStorage.getItem(`${STORAGE_PREFIX}${key}`);
  if (!rawValue) return fallback;

  try {
    return JSON.parse(rawValue);
  } catch {
    return fallback;
  }
}

export function clearRouteContext(key) {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(`${STORAGE_PREFIX}${key}`);
}
