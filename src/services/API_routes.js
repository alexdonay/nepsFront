
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
    LIST: "/v1/courses/list",
    DETAIL: "/v1/courses/detail",
    BY_ID: () => "/v1/courses/detail",
    DISCIPLINES_LINK: "/v1/courses/disciplines/link",
    DISCIPLINES_UNLINK: "/v1/courses/disciplines",
  },
  DISCIPLINES: {
    BASE: "/v1/disciplines",
    LIST: "/v1/disciplines/list",
    DETAIL: "/v1/disciplines/detail",
    BY_ID: () => "/v1/disciplines/detail",
  },

  CADASTROS: {
    DISCIPLINES: "/v1/disciplines",
    DISCIPLINES_LIST: "/v1/disciplines/list",
    DISCIPLINES_DETAIL: "/v1/disciplines/detail",
    INSTITUTIONS: "/v1/education-institutes",
    INSTITUTIONS_LIST: "/v1/education-institutes/list",
    INSTITUTIONS_DETAIL: "/v1/education-institutes/detail",
    INSTITUTIONS_BY_ID: () => "/v1/education-institutes/detail",
    LOCATIONS: "/v1/cadastros/locations",
    LOCATIONS_BY_ID: () => "/v1/cadastros/locations/detail",
  },

  GESTAO: {
    STUDENTS: "/v1/students",
    STUDENTS_DETAIL: "/v1/students/detail",
    STUDENTS_BY_ID: () => "/v1/students/detail",
    STUDENTS_BY_COURSE: "/v1/students/by-discipline",
    STUDENTS_BY_INSTITUTE: "/v1/students/by-institute",
    LINK_STUDENT: "/v1/students/link-internship",
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
    BASE: "/v1/internships",
    DETAIL: "/v1/internships/detail",
    BY_ID: () => "/v1/internships/detail",
    BY_REGION: "/v1/internships/by-region",
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

  DASHBOARD: {
    BASE: "/v1/dashboard",
    VACANCIES_BY_REGION: "/v1/dashboard/vacancies-by-region",
    OCCUPIED_BY_REGION: "/v1/dashboard/occupied-by-region",
    STUDENTS_BY_INSTITUTION: "/v1/dashboard/students-by-institution",
    STUDENTS_BY_REGION_INSTITUTION: "/v1/dashboard/students-by-region-institution",
    OCCUPIED_BY_INTERNSHIP: "/v1/dashboard/occupied-by-internship",
    CAPACITY_BY_INTERNSHIP: "/v1/dashboard/capacity-by-internship",
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
