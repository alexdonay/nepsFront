/**
 * Repository Pattern
 * Centraliza e abstrai todas as chamadas à API
 * Uso: repository.courses.get(), repository.students.post(data), etc.
 */

import { API_ROUTES } from "./API_routes";
import api from "./api";

export const repository = {
  // Autenticação
  auth: {
    login: (email, password) =>
      api.post(API_ROUTES.AUTH.LOGIN, { email, password }),
    register: (data) => api.post(API_ROUTES.AUTH.REGISTER, data),
    resetPassword: (email) =>
      api.post(API_ROUTES.AUTH.RESET_PASSWORD, { email }),
    confirmReset: (hash, newPassword) =>
      api.post(API_ROUTES.AUTH.RESET_PASSWORD_CONFIRM, {
        reset_token: hash,
        new_password: newPassword,
      }),
  },

  // Usuários
  users: {
    me: () => api.get(API_ROUTES.USERS.ME),
    updateMe: (data) => api.put(API_ROUTES.USERS.ME, data),
    get: () => api.get(API_ROUTES.USERS.BASE),
    getById: (id) => api.get(API_ROUTES.USERS.BY_ID(id)),
    post: (data) => api.post(API_ROUTES.USERS.BASE, data),
    put: (id, data) => api.put(API_ROUTES.USERS.BY_ID(id), data),
    delete: (id) => api.delete(API_ROUTES.USERS.BY_ID(id)),
  },

  // Cursos
  courses: {
    get: () => api.get(API_ROUTES.COURSES.BASE),
    getById: (id) => api.get(API_ROUTES.COURSES.BY_ID(id)),
    post: (data) => api.post(API_ROUTES.COURSES.BASE, data),
    put: (id, data) => api.put(API_ROUTES.COURSES.BY_ID(id), data),
    delete: (id) => api.delete(API_ROUTES.COURSES.BY_ID(id)),
  },

  // Regiões
  regions: {
    get: () => api.get(API_ROUTES.REGIONS.BASE),
    getById: (id) => api.get(API_ROUTES.REGIONS.BY_ID(id)),
    post: (data) => api.post(API_ROUTES.REGIONS.BASE, data),
    put: (id, data) => api.patch(API_ROUTES.REGIONS.BY_ID(id), data),
    delete: (id) => api.delete(API_ROUTES.REGIONS.BY_ID(id)),
  },

  // Unidades de Saúde
  healthUnits: {
    get: () => api.get(API_ROUTES.SERVICES.BASE),
    getById: (id) => api.get(API_ROUTES.SERVICES.BY_ID(id)),
    post: (data) => api.post(API_ROUTES.SERVICES.BASE, data),
    put: (id, data) => api.put(API_ROUTES.SERVICES.BY_ID(id), data),
    delete: (id) => api.delete(API_ROUTES.SERVICES.BY_ID(id)),
  },

  // Instituições
  institutions: {
    get: () => api.get(API_ROUTES.CADASTROS.INSTITUTIONS),
    getById: (id) => api.get(API_ROUTES.CADASTROS.INSTITUTIONS_BY_ID(id)),
    post: (data) => api.post(API_ROUTES.CADASTROS.INSTITUTIONS, data),
    put: (id, data) =>
      api.put(API_ROUTES.CADASTROS.INSTITUTIONS_BY_ID(id), data),
    delete: (id) => api.delete(API_ROUTES.CADASTROS.INSTITUTIONS_BY_ID(id)),
  },

  // Salas
  rooms: {
    get: () => api.get(API_ROUTES.ROOMS.BASE),
    getById: (id) => api.get(API_ROUTES.ROOMS.BY_ID(id)),
    post: (data) => api.post(API_ROUTES.ROOMS.BASE, data),
    put: (id, data) => api.patch(API_ROUTES.ROOMS.BY_ID(id), data),
    delete: (id) => api.delete(API_ROUTES.ROOMS.BY_ID(id)),
  },

  // Estudantes
  students: {
    get: () => api.get(API_ROUTES.STUDENTS.BASE),
    getById: (id) => api.get(API_ROUTES.STUDENTS.BY_ID(id)),
    post: (data) => api.post(API_ROUTES.STUDENTS.BASE, data),
    put: (id, data) => api.put(API_ROUTES.STUDENTS.BY_ID(id), data),
    delete: (id) => api.delete(API_ROUTES.STUDENTS.BY_ID(id)),
    byCourse: (courseId) => api.get(API_ROUTES.STUDENTS.BY_COURSE(courseId)),
    byInstitute: (instituteId) =>
      api.get(API_ROUTES.STUDENTS.BY_INSTITUTE(instituteId)),
  },

  // Períodos (se existir no backend)
  periods: {
    get: () => api.get("/v1/periods"),
    post: (data) => api.post("/v1/periods", data),
  },

  // Services
  services: {
    get: () => api.get(API_ROUTES.SERVICES.BASE),
    getById: (id) => api.get(API_ROUTES.SERVICES.BY_ID(id)),
    post: (data) => api.post(API_ROUTES.SERVICES.BASE, data),
    put: (id, data) => api.put(API_ROUTES.SERVICES.BY_ID(id), data),
    delete: (id) => api.delete(API_ROUTES.SERVICES.BY_ID(id)),
  },

  // Service Rooms
  serviceRooms: {
    get: () => api.get(API_ROUTES.SERVICE_ROOMS.BASE),
    getById: (id) => api.get(API_ROUTES.SERVICE_ROOMS.BY_ID(id)),
    getByService: (serviceId) =>
      api.get(API_ROUTES.SERVICE_ROOMS.BY_SERVICE(serviceId)),
    post: (data) => api.post(API_ROUTES.SERVICE_ROOMS.BASE, data),
    put: (id, data) => api.put(API_ROUTES.SERVICE_ROOMS.BY_ID(id), data),
    delete: (id) => api.delete(API_ROUTES.SERVICE_ROOMS.BY_ID(id)),
  },

  // Service Schedules
  serviceSchedules: {
    get: () => api.get(API_ROUTES.SERVICE_SCHEDULES.BASE),
    getById: (id) => api.get(API_ROUTES.SERVICE_SCHEDULES.BY_ID(id)),
    getByRoom: (roomId) =>
      api.get(API_ROUTES.SERVICE_SCHEDULES.BY_ROOM(roomId)),
    getByRoomDay: (roomId, day) =>
      api.get(API_ROUTES.SERVICE_SCHEDULES.BY_ROOM_DAY(roomId, day)),
    post: (data) => api.post(API_ROUTES.SERVICE_SCHEDULES.BASE, data),
    put: (id, data) => api.put(API_ROUTES.SERVICE_SCHEDULES.BY_ID(id), data),
    delete: (id) => api.delete(API_ROUTES.SERVICE_SCHEDULES.BY_ID(id)),
  },

  // Acompanhamento
  acompanhamento: {
    locationsAgenda: () => api.get("/api/v1/locations-agenda"),
  },
};
