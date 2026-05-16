/**
 * API Routes
 * Centraliza todas as rotas do backend
 */

export const API_ROUTES = {
  AUTH: {
    LOGIN: "/v1/auth/login",
    REFRESH: "/v1/auth/refresh",
    ME: "/v1/auth/me",
    REGISTER: "/v1/auth/register",
    RESET_PASSWORD: "/v1/auth/reset-password",
    RESET_PASSWORD_CONFIRM: "/v1/auth/reset-password/confirm",
  },

  USERS: {
    BASE: "/v1/users",
    ME: "/v1/users/me",
    BY_ID: (id) => `/v1/users/${id}`,
  },

  COURSES: {
    BASE: "/v1/courses",
    BY_ID: (id) => `/v1/courses/${id}`,
  },

  EDUCATION_INSTITUTES: {
    BASE: "/v1/education-institutes",
    BY_ID: (id) => `/v1/education-institutes/${id}`,
  },

  REGIONS: {
    BASE: "/v1/regions",
    BY_ID: (id) => `/v1/regions/${id}`,
  },

  INTERNSHIP_FIELD: {
    BASE: "/v1/internship-field",
    BY_ID: (id) => `/v1/internship-field/${id}`,
  },

  ROOMS: {
    BASE: "/v1/rooms",
    BY_ID: (id) => `/v1/rooms/${id}`,
    BY_INTERNSHIP_FIELD: (fieldId) => `/v1/rooms/by-internship_field/${fieldId}`,
  },

  STUDENTS: {
    BASE: "/v1/students",
    BY_ID: (id) => `/v1/students/${id}`,
    BY_COURSE: (courseId) => `/v1/students/by-course/${courseId}`,
    BY_INSTITUTE: (instituteId) => `/v1/students/by-institute/${instituteId}`,
  },

  INTERNSHIPS: {
    BASE: "/v1/internships",
    BY_ID: (id) => `/v1/internships/${id}`,
    BY_FIELD: (fieldId) => `/v1/internships/by-field/${fieldId}`,
    BY_EDU_INSTITUTE: (eduId) => `/v1/internships/by-education-institute/${eduId}`,
    BY_ROOM: (roomId) => `/v1/internships/by-room/${roomId}`,
  },
};
