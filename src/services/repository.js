/**
 * Repository Pattern
 * Centraliza e abstrai todas as chamadas à API
 * Uso: repository.courses.get(), repository.students.post(data), etc.
 */

import { API_ROUTES } from './API_routes';
import api from './api';

export const repository = {
  // Autenticação
  auth: {
    login: (email, password) =>
      api.post(API_ROUTES.AUTH.LOGIN, { email, password }),
    register: (data) => api.post(API_ROUTES.AUTH.REGISTER, data),
    resetPassword: (email) =>
      api.post(API_ROUTES.AUTH.RESET_PASSWORD, { email }),
  },

  // Usuários
  users: {
    me: () => api.get(API_ROUTES.USERS.ME),
    updateMe: (data) => api.put(API_ROUTES.USERS.ME, data),
  },

  // Cursos
  courses: {
    get: () => api.get(API_ROUTES.CADASTROS.COURSES),
    getById: (id) => api.get(API_ROUTES.CADASTROS.COURSES_BY_ID(id)),
    post: (data) => api.post(API_ROUTES.CADASTROS.COURSES, data),
    put: (id, data) => api.put(API_ROUTES.CADASTROS.COURSES_BY_ID(id), data),
    delete: (id) => api.delete(API_ROUTES.CADASTROS.COURSES_BY_ID(id)),
  },

  // Regiões
  regions: {
    get: () => api.get(API_ROUTES.CADASTROS.REGIONS),
    getById: (id) => api.get(API_ROUTES.CADASTROS.REGIONS_BY_ID(id)),
    post: (data) => api.post(API_ROUTES.CADASTROS.REGIONS, data),
    put: (id, data) => api.put(API_ROUTES.CADASTROS.REGIONS_BY_ID(id), data),
    delete: (id) => api.delete(API_ROUTES.CADASTROS.REGIONS_BY_ID(id)),
  },

  // Unidades de Saúde
  healthUnits: {
    get: () => api.get(API_ROUTES.CADASTROS.HEALTH_UNITS),
    getById: (id) => api.get(API_ROUTES.CADASTROS.HEALTH_UNITS_BY_ID(id)),
    post: (data) => api.post(API_ROUTES.CADASTROS.HEALTH_UNITS, data),
    put: (id, data) =>
      api.put(API_ROUTES.CADASTROS.HEALTH_UNITS_BY_ID(id), data),
    delete: (id) => api.delete(API_ROUTES.CADASTROS.HEALTH_UNITS_BY_ID(id)),
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

  // Localizações
  locations: {
    get: () => api.get(API_ROUTES.CADASTROS.LOCATIONS),
    getById: (id) => api.get(API_ROUTES.CADASTROS.LOCATIONS_BY_ID(id)),
    post: (data) => api.post(API_ROUTES.CADASTROS.LOCATIONS, data),
    put: (id, data) => api.put(API_ROUTES.CADASTROS.LOCATIONS_BY_ID(id), data),
    delete: (id) => api.delete(API_ROUTES.CADASTROS.LOCATIONS_BY_ID(id)),
  },

  // Estudantes
  students: {
    get: () => api.get(API_ROUTES.GESTAO.STUDENTS),
    getById: (id) => api.get(API_ROUTES.GESTAO.STUDENTS_BY_ID(id)),
    post: (data) => api.post(API_ROUTES.GESTAO.STUDENTS, data),
    put: (id, data) => api.put(API_ROUTES.GESTAO.STUDENTS_BY_ID(id), data),
    delete: (id) => api.delete(API_ROUTES.GESTAO.STUDENTS_BY_ID(id)),
  },

  // Vínculos / Estágios
  vinculos: {
    get: () => api.get(API_ROUTES.GESTAO.INTERNSHIPS),
    post: (data) => api.post(API_ROUTES.GESTAO.INTERNSHIPS, data),
  },

  internships: {
    get: () => api.get(API_ROUTES.GESTAO.INTERNSHIPS),
    post: (data) => api.post(API_ROUTES.GESTAO.INTERNSHIPS, data),
  },

  // Períodos
  periods: {
    get: () => api.get(API_ROUTES.GESTAO.PERIODS),
    getCurrent: () => api.get(API_ROUTES.GESTAO.PERIODS_CURRENT),
    post: (data) => api.post(API_ROUTES.GESTAO.PERIODS, data),
  },

  // Acompanhamento
  acompanhamento: {
    locationsAgenda: () => api.get(API_ROUTES.ACOMPANHAMENTO.LOCATIONS_AGENDA),
  },
};
