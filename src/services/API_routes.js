/**
 * API Routes
 * Centraliza todas as rotas do backend
 */

export const API_ROUTES = {
  AUTH: {
    LOGIN: "/v1/auth/login",
    REGISTER: "/v1/auth/register",
    RESET_PASSWORD: "/v1/auth/reset-password",
    RESET_PASSWORD_CONFIRM: "/v1/auth/reset-password-confirm",
  },

  USERS: {
    BASE: "/v1/users/",
    ME: "/v1/users/me",
    DETAIL: "/v1/users/detail",
    BY_ID: () => "/v1/users/detail",
  },

  COURSES: {
    BASE: "/v1/courses",
    DETAIL: "/v1/courses/detail",
    BY_ID: () => "/v1/courses/detail",
  },

  CADASTROS: {
    COURSES: "/v1/courses",
    INSTITUTIONS: "/v1/education-institutes",
    INSTITUTIONS_DETAIL: "/v1/education-institutes/detail",
    INSTITUTIONS_BY_ID: () => "/v1/education-institutes/detail",
    LOCATIONS: "/v1/cadastros/locations",
    LOCATIONS_BY_ID: () => "/v1/cadastros/locations/detail",
  },

  GESTAO: {
    STUDENTS: "/v1/students",
    STUDENTS_DETAIL: "/v1/students/detail",
    STUDENTS_BY_ID: () => "/v1/students/detail",
    STUDENTS_BY_COURSE: "/v1/students/by-course",
    STUDENTS_BY_INSTITUTE: "/v1/students/by-institute",
    PERIODS: "/v1/periods",
    PERIODS_DETAIL: "/v1/periods/detail",
    PERIODS_BY_ID: () => "/v1/periods/detail",
    PERIODS_STUDENTS: "/v1/periods/students",
  },

  HISTORIES: {
    BY_PERIOD: "/v1/histories/by-period",
    BY_ROOM: "/v1/histories/by-room",
    BY_SCHEDULE: "/v1/histories/by-schedule",
    BY_STUDENT: "/v1/histories/by-student",
  },

  ACOMPANHAMENTO: {
    LOCATIONS_AGENDA: "/v1/acompanhamento/locations-agenda",
  },

  SERVICES: {
    BASE: "/v1/services",
    DETAIL: "/v1/services/detail",
    BY_ID: () => "/v1/services/detail",
    BY_REGION: "/v1/services/by-region",
  },

  REGIONS: {
    BASE: "/v1/regions",
    DETAIL: "/v1/regions/detail",
    BY_ID: () => "/v1/regions/detail",
  },

  SERVICE_ROOMS: {
    BASE: "/v1/service-rooms",
    DETAIL: "/v1/service-rooms/detail",
    BY_ID: () => "/v1/service-rooms/detail",
    BY_SERVICE: "/v1/service-rooms/by-service",
  },

  SERVICE_SCHEDULES: {
    BASE: "/v1/service-schedules",
    DETAIL: "/v1/service-schedules/detail",
    BY_ID: () => "/v1/service-schedules/detail",
    BY_ROOM: "/v1/service-schedules/by-room",
    BY_ROOM_DAY: "/v1/service-schedules/by-room/by-day",
  },

  ROOMS: {
    BASE: "/v1/rooms",
    DETAIL: "/v1/rooms/detail",
    BY_ID: () => "/v1/rooms/detail",
    BY_SERVICE: "/v1/rooms/by-service",
    AVAILABLE_SLOTS: "/v1/rooms/available-slots",
    SCHEDULE: "/v1/rooms/schedule",
    SCHEDULE_STUDENT: "/v1/rooms/schedule/student",
  },
};
