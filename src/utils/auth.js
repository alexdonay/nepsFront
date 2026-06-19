import { PERMISSIONS } from "../constants/permissions";

export function normalizePermission(value) {
  if (!value) return null;
  const v = String(value).toLowerCase().trim();
  if (
    v === "admin" ||
    v.includes("admin") ||
    v.includes("administrador") ||
    v === "root"
  ) {
    return PERMISSIONS.ADMIN;
  }
  if (
    v.includes("institu") ||
    v.includes("education") ||
    v.includes("ensino")
  ) {
    return PERMISSIONS.INSTITUICAO_ENSINO;
  }
  if (
    v.includes("unidade") ||
    v.includes("saude") ||
    v.includes("health") ||
    v.includes("unit") ||
    v.includes("service") ||
    v.includes("serv")
  ) {
    return PERMISSIONS.CAMPO_ESTAGIO;
  }
  return null;
}

export function isAuthenticated() {
  return Boolean(localStorage.getItem("token"));
}

export function getCurrentPermission() {
  return localStorage.getItem("permission");
}

export function getCurrentUser() {
  const userJson = localStorage.getItem("user");
  if (!userJson) return null;
  try {
    return JSON.parse(userJson);
  } catch {
    return null;
  }
}

export function getCurrentInstitutionId() {
  const user = getCurrentUser();
  return user?.education_institute_id || user?.institution_id || null;
}

export function getCurrentInternshipId() {
  const user = getCurrentUser();
  return user?.internship_id || user?.health_unit_id || user?.service?.id || null;
}

export function hasPermission(permissions = []) {
  if (!permissions || permissions.length === 0) return true;
  const current = getCurrentPermission();
  if (!current) return false;
  return permissions.includes(current);
}

export default {
  normalizePermission,
  isAuthenticated,
  getCurrentPermission,
  hasPermission,
};
