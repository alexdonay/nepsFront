/**
 * API Routes
 * Centraliza todas as rotas do backend
 */

export const API_ROUTES = {
  AUTH: {
    LOGIN: "/v1/auth/login",
    REGISTER: "/v1/auth/register",
    RESET_PASSWORD: "/v1/auth/reset-password",
  },

  USERS: {
    BASE: "/v1/users",
    ME: "/v1/users/me",
    BY_ID: (id) => `/v1/users/${id}`,
  },

  CADASTROS: {
    COURSES: "/v1/cadastros/courses",
    COURSES_BY_ID: (id) => `/v1/cadastros/courses/${id}`,
    REGIONS: "/v1/cadastros/regions",
    REGIONS_BY_ID: (id) => `/v1/cadastros/regions/${id}`,
    HEALTH_UNITS: "/v1/cadastros/health-units",
    HEALTH_UNITS_BY_ID: (id) => `/v1/cadastros/health-units/${id}`,
    INSTITUTIONS: "/v1/cadastros/institutions",
    INSTITUTIONS_BY_ID: (id) => `/v1/cadastros/institutions/${id}`,
    LOCATIONS: "/v1/cadastros/locations",
    LOCATIONS_BY_ID: (id) => `/v1/cadastros/locations/${id}`,
  },

  GESTAO: {
    STUDENTS: "/v1/gestao/students",
    STUDENTS_BY_ID: (id) => `/v1/gestao/students/${id}`,
    INTERNSHIPS: "/v1/gestao/internships",
    PERIODS: "/v1/gestao/periods",
    PERIODS_CURRENT: "/v1/gestao/periods/current",
  },

  ACOMPANHAMENTO: {
    LOCATIONS_AGENDA: "/v1/acompanhamento/locations-agenda",
  },

  SERVICES: {
    BASE: "/v1/services",
    BY_ID: (id) => `/v1/services/${id}`,
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
};
