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
    get: (params = {}) => api.get(API_ROUTES.USERS.BASE, { params }),
    getById: (id) => api.get(API_ROUTES.USERS.BY_ID(id)),
    post: (data) => api.post(API_ROUTES.USERS.BASE, data),
    put: (id, data) => api.put(API_ROUTES.USERS.BY_ID(id), data),
    delete: (id) => api.delete(API_ROUTES.USERS.BY_ID(id)),
  },

  // Cursos
  courses: {
    get: (params = {}) => api.get(API_ROUTES.COURSES.BASE, { params }),
    getById: (id) => api.get(API_ROUTES.COURSES.BY_ID(id)),
    post: (data) => api.post(API_ROUTES.COURSES.BASE, data),
    put: (id, data) => api.put(API_ROUTES.COURSES.BY_ID(id), data),
    delete: (id) => api.delete(API_ROUTES.COURSES.BY_ID(id)),
  },

  // Regiões
  regions: {
    get: (params = {}) => api.get(API_ROUTES.REGIONS.BASE, { params }),
    getById: (id) => api.get(API_ROUTES.REGIONS.BY_ID(id)),
    post: (data) => api.post(API_ROUTES.REGIONS.BASE, data),
    put: (id, data) => api.patch(API_ROUTES.REGIONS.BY_ID(id), data),
    delete: (id) => api.delete(API_ROUTES.REGIONS.BY_ID(id)),
  },

  // Unidades de Saúde
  healthUnits: {
    get: (params = {}) => api.get(API_ROUTES.SERVICES.BASE, { params }),
    getById: (id) => api.get(API_ROUTES.SERVICES.BY_ID(id)),
    post: (data) => api.post(API_ROUTES.SERVICES.BASE, data),
    put: (id, data) => api.put(API_ROUTES.SERVICES.BY_ID(id), data),
    delete: (id) => api.delete(API_ROUTES.SERVICES.BY_ID(id)),
  },

  // Instituições
  institutions: {
    get: (params = {}) =>
      api.get(API_ROUTES.CADASTROS.INSTITUTIONS, { params }),
    getById: (id) => api.get(API_ROUTES.CADASTROS.INSTITUTIONS_BY_ID(id)),
    post: (data) => api.post(API_ROUTES.CADASTROS.INSTITUTIONS, data),
    put: (id, data) =>
      api.put(API_ROUTES.CADASTROS.INSTITUTIONS_BY_ID(id), data),
    delete: (id) => api.delete(API_ROUTES.CADASTROS.INSTITUTIONS_BY_ID(id)),
  },

  // Salas
  rooms: {
    get: (params = {}) => api.get(API_ROUTES.ROOMS.BASE, { params }),
    getById: (id) => api.get(API_ROUTES.ROOMS.BY_ID(id)),
    getAvailableSlots: (params = {}) =>
      api.get(API_ROUTES.ROOMS.AVAILABLE_SLOTS, { params }),
    post: (data) => api.post(API_ROUTES.ROOMS.BASE, data),
    put: (id, data) => api.patch(API_ROUTES.ROOMS.BY_ID(id), data),
    delete: (id) => api.delete(API_ROUTES.ROOMS.BY_ID(id)),
  },

  roomSchedules: {
    get: (roomId) => api.get(API_ROUTES.ROOMS.SCHEDULE(roomId)),
    addStudent: (roomId, dayOfWeek, period, studentId) =>
      api.post(API_ROUTES.ROOMS.SCHEDULE_STUDENT(roomId, dayOfWeek, period), {
        student_id: studentId,
      }),
    removeStudent: (roomId, dayOfWeek, period, studentId) =>
      api.delete(API_ROUTES.ROOMS.SCHEDULE_STUDENT(roomId, dayOfWeek, period), {
        data: { student_id: studentId },
      }),
  },

  // Estudantes
  students: {
    get: (params = {}) => api.get(API_ROUTES.GESTAO.STUDENTS, { params }),
    getById: (id) => api.get(API_ROUTES.GESTAO.STUDENTS_BY_ID(id)),
    post: (data) => api.post(API_ROUTES.GESTAO.STUDENTS, data),
    put: (id, data) => api.put(API_ROUTES.GESTAO.STUDENTS_BY_ID(id), data),
    delete: (id) => api.delete(API_ROUTES.GESTAO.STUDENTS_BY_ID(id)),
    byCourse: (courseId, params = {}) =>
      api.get(API_ROUTES.GESTAO.STUDENTS_BY_COURSE(courseId), { params }),
    byInstitute: (instituteId, params = {}) =>
      api.get(API_ROUTES.GESTAO.STUDENTS_BY_INSTITUTE(instituteId), {
        params,
      }),
  },

  // Períodos (se existir no backend)
  periods: {
    get: (params = {}) => api.get(API_ROUTES.GESTAO.PERIODS, { params }),
    getById: (id, params = {}) =>
      api.get(API_ROUTES.GESTAO.PERIODS_BY_ID(id), { params }),
    findOne: (id) => api.get(API_ROUTES.GESTAO.PERIODS_BY_ID(id)),
    post: (data) => api.post(API_ROUTES.GESTAO.PERIODS, data),
    put: (id, data) => api.put(API_ROUTES.GESTAO.PERIODS_BY_ID(id), data),
    patch: (id, data) => api.patch(API_ROUTES.GESTAO.PERIODS_BY_ID(id), data),
    delete: (id) => api.delete(API_ROUTES.GESTAO.PERIODS_BY_ID(id)),
    getStudents: (id, params = {}) =>
      api.get(API_ROUTES.GESTAO.PERIODS_STUDENTS(id), { params }),
    addStudent: (id, studentId) =>
      api.post(API_ROUTES.GESTAO.PERIODS_STUDENTS(id), {
        student_id: studentId,
      }),
    removeStudent: (id, studentId) =>
      api.delete(API_ROUTES.GESTAO.PERIODS_STUDENTS(id), {
        data: { student_id: studentId },
      }),
  },

  histories: {
    getByPeriod: (periodId, params = {}) =>
      api.get(API_ROUTES.HISTORIES.BY_PERIOD(periodId), { params }),
  },

  // Services
  services: {
    get: (params = {}) => api.get(API_ROUTES.SERVICES.BASE, { params }),
    getById: (id) => api.get(API_ROUTES.SERVICES.BY_ID(id)),
    post: (data) => api.post(API_ROUTES.SERVICES.BASE, data),
    put: (id, data) => api.put(API_ROUTES.SERVICES.BY_ID(id), data),
    delete: (id) => api.delete(API_ROUTES.SERVICES.BY_ID(id)),
  },

  // Service Rooms
  serviceRooms: {
    get: (params = {}) => api.get(API_ROUTES.SERVICE_ROOMS.BASE, { params }),
    getById: (id) => api.get(API_ROUTES.SERVICE_ROOMS.BY_ID(id)),
    getByService: (serviceId) =>
      api.get(API_ROUTES.SERVICE_ROOMS.BY_SERVICE(serviceId)),
    post: (data) => api.post(API_ROUTES.SERVICE_ROOMS.BASE, data),
    put: (id, data) => api.put(API_ROUTES.SERVICE_ROOMS.BY_ID(id), data),
    delete: (id) => api.delete(API_ROUTES.SERVICE_ROOMS.BY_ID(id)),
  },

  // Service Schedules
  serviceSchedules: {
    get: (params = {}) =>
      api.get(API_ROUTES.SERVICE_SCHEDULES.BASE, { params }),
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
