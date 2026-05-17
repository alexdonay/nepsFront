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
    put: (id, data) => api.put(API_ROUTES.REGIONS.BY_ID(id), data),
    delete: (id) => api.delete(API_ROUTES.REGIONS.BY_ID(id)),
  },

  // Unidades de Saúde
  healthUnits: {
    get: () => api.get(API_ROUTES.EDUCATION_INSTITUTES.BASE),
    getById: (id) => api.get(API_ROUTES.EDUCATION_INSTITUTES.BY_ID(id)),
    post: (data) => api.post(API_ROUTES.EDUCATION_INSTITUTES.BASE, data),
    put: (id, data) =>
      api.put(API_ROUTES.EDUCATION_INSTITUTES.BY_ID(id), data),
    delete: (id) => api.delete(API_ROUTES.EDUCATION_INSTITUTES.BY_ID(id)),
  },

  // Instituições
  institutions: {
    get: () => api.get(API_ROUTES.EDUCATION_INSTITUTES.BASE),
    getById: (id) => api.get(API_ROUTES.EDUCATION_INSTITUTES.BY_ID(id)),
    post: (data) => api.post(API_ROUTES.EDUCATION_INSTITUTES.BASE, data),
    put: (id, data) =>
      api.put(API_ROUTES.EDUCATION_INSTITUTES.BY_ID(id), data),
    delete: (id) => api.delete(API_ROUTES.EDUCATION_INSTITUTES.BY_ID(id)),
  },

  // Salas
  rooms: {
    get: () => api.get(API_ROUTES.ROOMS.BASE),
    getById: (id) => api.get(API_ROUTES.ROOMS.BY_ID(id)),
    post: (data) => api.post(API_ROUTES.ROOMS.BASE, data),
    put: (id, data) => api.put(API_ROUTES.ROOMS.BY_ID(id), data),
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
    byInstitute: (instituteId) => api.get(API_ROUTES.STUDENTS.BY_INSTITUTE(instituteId)),
  },

  // Internships
  internships: {
    get: () => api.get(API_ROUTES.INTERNSHIPS.BASE),
    post: (data) => api.post(API_ROUTES.INTERNSHIPS.BASE, data),
    getById: (id) => api.get(API_ROUTES.INTERNSHIPS.BY_ID(id)),
    byField: (fieldId) => api.get(API_ROUTES.INTERNSHIPS.BY_FIELD(fieldId)),
    byEducationInstitute: (eduId) => api.get(API_ROUTES.INTERNSHIPS.BY_EDU_INSTITUTE(eduId)),
    byRoom: (roomId) => api.get(API_ROUTES.INTERNSHIPS.BY_ROOM(roomId)),
  },

  // Períodos (se existir no backend)
  periods: {
    get: () => api.get("/api/v1/periods"),
    getCurrent: () => api.get("/api/v1/periods/current"),
    post: (data) => api.post("/api/v1/periods", data),
  },

  // Acompanhamento
  acompanhamento: {
    locationsAgenda: () => api.get("/api/v1/locations-agenda"),
  },
};
