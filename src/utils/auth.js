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
    v.includes("unit")
  ) {
    return PERMISSIONS.UNIDADE_SAUDE;
  }
  return null;
}

export function isAuthenticated() {
  return Boolean(localStorage.getItem("token"));
}

export function getCurrentPermission() {
  return localStorage.getItem("permission");
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
