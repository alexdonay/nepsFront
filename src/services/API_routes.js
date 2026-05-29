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
    BY_ID: (id) => `/v1/users/${id}`,
  },

  COURSES: {
    BASE: "/v1/courses",
    BY_ID: (id) => `/v1/courses/${id}`,
  },

  CADASTROS: {
    COURSES: "/v1/courses",
    INSTITUTIONS: "/v1/education-institutes",
    INSTITUTIONS_BY_ID: (id) => `/v1/education-institutes/${id}`,
    LOCATIONS: "/v1/cadastros/locations",
    LOCATIONS_BY_ID: (id) => `/v1/cadastros/locations/${id}`,
  },

  GESTAO: {
    STUDENTS: "/v1/students",
    STUDENTS_BY_ID: (id) => `/v1/students/${id}`,
    STUDENTS_BY_COURSE: (courseId) => `/v1/students/by-course/${courseId}`,
    STUDENTS_BY_INSTITUTE: (instituteId) =>
      `/v1/students/by-institute/${instituteId}`,
    PERIODS: "/v1/periods",
    PERIODS_BY_ID: (id) => `/v1/periods/${id}`,
    PERIODS_STUDENTS: (id) => `/v1/periods/${id}/students`,
  },

  HISTORIES: {
    BY_PERIOD: (periodId) => `/v1/histories/by-period/${periodId}`,
  },

  ACOMPANHAMENTO: {
    LOCATIONS_AGENDA: "/v1/acompanhamento/locations-agenda",
  },

  SERVICES: {
    BASE: "/v1/services",
    BY_ID: (id) => `/v1/services/${id}`,
    BY_REGION: (regionId) => `/v1/services/by-region/${regionId}`,
  },

  REGIONS: {
    BASE: "/v1/regions",
    BY_ID: (id) => `/v1/regions/${id}`,
  },

  SERVICE_ROOMS: {
    BASE: "/v1/service-rooms",
    BY_ID: (id) => `/v1/service-rooms/${id}`,
    BY_SERVICE: (serviceId) => `/v1/service-rooms/by-service/${serviceId}`,
  },

  SERVICE_SCHEDULES: {
    BASE: "/v1/service-schedules",
    BY_ID: (id) => `/v1/service-schedules/${id}`,
    BY_ROOM: (roomId) => `/v1/service-schedules/by-room/${roomId}`,
    BY_ROOM_DAY: (roomId, weekDay) =>
      `/v1/service-schedules/by-room/${roomId}/by-day/${weekDay}`,
  },

  ROOMS: {
    BASE: "/v1/rooms",
    BY_ID: (id) => `/v1/rooms/${id}`,
    BY_SERVICE: (serviceId) => `/v1/rooms/by-service/${serviceId}`,
    AVAILABLE_SLOTS: "/v1/rooms/available-slots",
    SCHEDULE: (roomId) => `/v1/rooms/${roomId}/schedule`,
    SCHEDULE_STUDENT: (roomId, dayOfWeek, period) =>
      `/v1/rooms/${roomId}/schedule/${dayOfWeek}/${period}/student`,
  },
};
