/**
 * API Routes
 * Centraliza todas as rotas do backend
 */

export const API_ROUTES = {
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    RESET_PASSWORD: "/auth/reset-password",
  },

  USERS: {
    ME: "/users/me",
  },

  CADASTROS: {
    COURSES: "/cadastros/courses",
    COURSES_BY_ID: (id) => `/cadastros/courses/${id}`,
    REGIONS: "/cadastros/regions",
    REGIONS_BY_ID: (id) => `/cadastros/regions/${id}`,
    HEALTH_UNITS: "/cadastros/health-units",
    HEALTH_UNITS_BY_ID: (id) => `/cadastros/health-units/${id}`,
    INSTITUTIONS: "/cadastros/institutions",
    INSTITUTIONS_BY_ID: (id) => `/cadastros/institutions/${id}`,
    LOCATIONS: "/cadastros/locations",
    LOCATIONS_BY_ID: (id) => `/cadastros/locations/${id}`,
  },

  GESTAO: {
    STUDENTS: "/gestao/students",
    STUDENTS_BY_ID: (id) => `/gestao/students/${id}`,
    INTERNSHIPS: "/gestao/internships",
    PERIODS: "/gestao/periods",
    PERIODS_CURRENT: "/gestao/periods/current",
  },

  ACOMPANHAMENTO: {
    LOCATIONS_AGENDA: "/acompanhamento/locations-agenda",
  },
};
