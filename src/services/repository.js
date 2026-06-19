/**
 * Repository Pattern
 * Centraliza e abstrai todas as chamadas à API
 * Uso: repository.disciplines.get(), repository.students.post(data), etc.
 */

import { API_ROUTES } from "./API_routes";
import api from "./api";

const getWithParams = (url, params = {}) =>
  api.request({ method: "GET", url, params });
const deleteWithBody = (url, data = {}) =>
  api.request({ method: "DELETE", url, data });

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
    get: (params = {}) => getWithParams(API_ROUTES.USERS.BASE, params),
    getById: (id) => api.post(API_ROUTES.USERS.DETAIL, { user_id: Number(id) }),
    post: (data) => api.post(API_ROUTES.USERS.BASE, data),
    put: (id, data) =>
      api.put(API_ROUTES.USERS.BASE, { ...data, user_id: Number(id) }),
    delete: (id) =>
      deleteWithBody(API_ROUTES.USERS.BASE, { user_id: Number(id) }),
  },

  disciplines: {
    get: (params = {}) => getWithParams(API_ROUTES.DISCIPLINES.BASE, params),
    getById: (id) =>
      api.post(API_ROUTES.DISCIPLINES.DETAIL, { discipline_id: Number(id) }),
    post: (data) => api.post(API_ROUTES.DISCIPLINES.BASE, data),
    put: (id, data) =>
      api.put(API_ROUTES.DISCIPLINES.BASE, {
        ...data,
        discipline_id: Number(id),
      }),
    delete: (id) =>
      deleteWithBody(API_ROUTES.DISCIPLINES.BASE, {
        discipline_id: Number(id),
      }),
  },

  courses: {
    get: (params = {}) => getWithParams(API_ROUTES.COURSES.BASE, params),
    getById: (id) =>
      api.post(API_ROUTES.COURSES.DETAIL, { course_id: Number(id) }),
    post: (data) => api.post(API_ROUTES.COURSES.BASE, data),
    put: (id, data) =>
      api.put(API_ROUTES.COURSES.BASE, { ...data, course_id: Number(id) }),
    delete: (id) =>
      deleteWithBody(API_ROUTES.COURSES.BASE, { course_id: Number(id) }),
    linkDiscipline: (courseId, disciplineId) =>
      api.post(API_ROUTES.COURSES.DISCIPLINES_LINK, {
        course_id: Number(courseId),
        discipline_id: Number(disciplineId),
      }),
    unlinkDiscipline: (courseId, disciplineId) =>
      deleteWithBody(API_ROUTES.COURSES.DISCIPLINES_UNLINK, {
        course_id: Number(courseId),
        discipline_id: Number(disciplineId),
      }),
  },

  // Territórios
  regions: {
    get: (params = {}) => getWithParams(API_ROUTES.REGIONS.BASE, params),
    getById: (id) =>
      api.post(API_ROUTES.REGIONS.DETAIL, { region_id: Number(id) }),
    post: (data) => api.post(API_ROUTES.REGIONS.BASE, data),
    put: (id, data) =>
      api.patch(API_ROUTES.REGIONS.BASE, { ...data, region_id: Number(id) }),
    delete: (id) =>
      deleteWithBody(API_ROUTES.REGIONS.BASE, { region_id: Number(id) }),
  },

  // Unidades de Saúde
  healthUnits: {
    get: (params = {}) => getWithParams(API_ROUTES.SERVICES.BASE, params),
    getById: (id) =>
      api.post(API_ROUTES.SERVICES.DETAIL, { internship_id: Number(id) }),
    post: (data) => api.post(API_ROUTES.SERVICES.BASE, data),
    put: (id, data) =>
      api.put(API_ROUTES.SERVICES.BASE, { ...data, internship_id: Number(id) }),
    delete: (id) =>
      deleteWithBody(API_ROUTES.SERVICES.BASE, { internship_id: Number(id) }),
  },

  // Instituições
  institutions: {
    get: (params = {}) =>
      getWithParams(API_ROUTES.CADASTROS.INSTITUTIONS, params),
    getById: (id) =>
      api.post(API_ROUTES.CADASTROS.INSTITUTIONS_DETAIL, {
        institute_id: Number(id),
      }),
    post: (data) => api.post(API_ROUTES.CADASTROS.INSTITUTIONS, data),
    put: (id, data) =>
      api.put(API_ROUTES.CADASTROS.INSTITUTIONS, {
        ...data,
        institute_id: Number(id),
      }),
    delete: (id) =>
      deleteWithBody(API_ROUTES.CADASTROS.INSTITUTIONS, {
        institute_id: Number(id),
      }),
  },

  // Salas
  rooms: {
    get: (params = {}) => getWithParams(API_ROUTES.ROOMS.BASE, params),
    getById: (id) => api.post(API_ROUTES.ROOMS.DETAIL, { room_id: Number(id) }),
    getAvailableSlots: (params = {}) =>
      api.post(API_ROUTES.ROOMS.AVAILABLE_SLOTS, params),
    post: (data) => api.post(API_ROUTES.ROOMS.BASE, data),
    put: (id, data) =>
      api.patch(API_ROUTES.ROOMS.BASE, { ...data, room_id: Number(id) }),
    delete: (id) =>
      deleteWithBody(API_ROUTES.ROOMS.BASE, { room_id: Number(id) }),
  },

  roomSchedules: {
    get: (roomId) =>
      api.post(API_ROUTES.ROOMS.SCHEDULE, { room_id: Number(roomId) }),
    addStudent: (roomId, dayOfWeek, period, periodId, studentId) =>
      api.post(API_ROUTES.ROOMS.SCHEDULE_STUDENT, {
        room_id: roomId,
        day_of_week: dayOfWeek,
        period,
        period_id: periodId,
        student_id: studentId,
      }),
    removeStudent: (roomId, dayOfWeek, period, periodId, studentId) =>
      api.delete(API_ROUTES.ROOMS.SCHEDULE_STUDENT, {
        data: {
          room_id: roomId,
          day_of_week: dayOfWeek,
          period,
          period_id: periodId,
          student_id: studentId,
        },
      }),
  },

  // Estudantes
  students: {
    get: (params = {}) => getWithParams(API_ROUTES.GESTAO.STUDENTS, params),
    getById: (id, params = {}) =>
      api.post(API_ROUTES.GESTAO.STUDENTS_DETAIL, {
        ...params,
        student_id: Number(id),
      }),
    post: (data) => api.post(API_ROUTES.GESTAO.STUDENTS, data),
    put: (id, data) =>
      api.patch(API_ROUTES.GESTAO.STUDENTS, {
        ...data,
        student_id: Number(id),
      }),
    delete: (id) =>
      deleteWithBody(API_ROUTES.GESTAO.STUDENTS, { student_id: Number(id) }),
    byDiscipline: (disciplineId, params = {}) =>
      api.post(API_ROUTES.GESTAO.STUDENTS_BY_COURSE, {
        ...params,
        discipline_id: Number(disciplineId),
      }),
    byInstitute: (instituteId, params = {}) =>
      api.post(API_ROUTES.GESTAO.STUDENTS_BY_INSTITUTE, {
        ...params,
        institute_id: Number(instituteId),
      }),
    linkToInternship: (studentId, internshipId) =>
      api.post(API_ROUTES.GESTAO.LINK_STUDENT, {
        student_id: Number(studentId),
        internship_id: Number(internshipId),
      }),
    unlinkFromInternship: (studentId) =>
      api.patch(API_ROUTES.GESTAO.STUDENTS, {
        student_id: Number(studentId),
        internship_id: null,
      }),
  },

  // Períodos (se existir no backend)
  periods: {
    get: (params = {}) => getWithParams(API_ROUTES.GESTAO.PERIODS, params),
    getById: (id, params = {}) =>
      api.post(API_ROUTES.GESTAO.PERIODS_DETAIL, {
        ...params,
        period_id: Number(id),
      }),
    findOne: (id) =>
      api.post(API_ROUTES.GESTAO.PERIODS_DETAIL, {
        period_id: Number(id),
      }),
    post: (data) => api.post(API_ROUTES.GESTAO.PERIODS, data),
    put: (id, data) =>
      api.put(API_ROUTES.GESTAO.PERIODS, { ...data, period_id: Number(id) }),
    patch: (id, data) =>
      api.patch(API_ROUTES.GESTAO.PERIODS, {
        ...data,
        period_id: Number(id),
      }),
    delete: (id) =>
      deleteWithBody(API_ROUTES.GESTAO.PERIODS, { period_id: Number(id) }),
    getStudents: (id, params = {}) =>
      api.post(API_ROUTES.GESTAO.PERIODS_DETAIL, {
        ...params,
        period_id: Number(id),
        include: "students",
      }),
    addStudent: (id, studentId) =>
      api.post(API_ROUTES.GESTAO.PERIODS_STUDENTS, {
        period_id: Number(id),
        student_id: Number(studentId),
      }),
    removeStudent: (id, studentId) =>
      api.delete(API_ROUTES.GESTAO.PERIODS_STUDENTS, {
        data: { period_id: Number(id), student_id: Number(studentId) },
      }),
  },

  histories: {
    getByPeriod: (periodId, params = {}) =>
      api.post(API_ROUTES.HISTORIES.BY_PERIOD, {
        ...params,
        id: Number(periodId),
      }),
    getByRoom: (roomId, params = {}) =>
      api.post(API_ROUTES.HISTORIES.BY_ROOM, {
        ...params,
        id: Number(roomId),
      }),
    getBySchedule: (scheduleId, params = {}) =>
      api.post(API_ROUTES.HISTORIES.BY_SCHEDULE, {
        ...params,
        id: Number(scheduleId),
      }),
    getByStudent: (studentId, params = {}) =>
      api.post(API_ROUTES.HISTORIES.BY_STUDENT, {
        ...params,
        id: Number(studentId),
      }),
  },

  // Internships
  internships: {
    get: (params = {}) => getWithParams(API_ROUTES.SERVICES.BASE, params),
    getById: (id) =>
      api.post(API_ROUTES.SERVICES.DETAIL, { internship_id: Number(id) }),
    byRegion: (regionId, params = {}) =>
      api.post(API_ROUTES.SERVICES.BY_REGION, {
        ...params,
        region_id: Number(regionId),
      }),
    post: (data) => api.post(API_ROUTES.SERVICES.BASE, data),
    put: (id, data) =>
      api.put(API_ROUTES.SERVICES.BASE, { ...data, internship_id: Number(id) }),
    delete: (id) =>
      deleteWithBody(API_ROUTES.SERVICES.BASE, { internship_id: Number(id) }),
  },

  // Service Rooms
  serviceRooms: {
    get: (params = {}) => getWithParams(API_ROUTES.SERVICE_ROOMS.BASE, params),
    getById: (id) =>
      api.post(API_ROUTES.SERVICE_ROOMS.DETAIL, {
        service_room_id: Number(id),
      }),
    getByService: (serviceId, params = {}) =>
      api.post(API_ROUTES.SERVICE_ROOMS.BY_SERVICE, {
        ...params,
        internship_id: Number(serviceId),
      }),
    post: (data) => api.post(API_ROUTES.SERVICE_ROOMS.BASE, data),
    put: (id, data) =>
      api.patch(API_ROUTES.SERVICE_ROOMS.BASE, {
        ...data,
        service_room_id: Number(id),
      }),
    delete: (id) =>
      deleteWithBody(API_ROUTES.SERVICE_ROOMS.BASE, {
        service_room_id: Number(id),
      }),
  },

  // Service Schedules
  serviceSchedules: {
    get: (params = {}) =>
      getWithParams(API_ROUTES.SERVICE_SCHEDULES.BASE, params),
    getById: (id) =>
      api.post(API_ROUTES.SERVICE_SCHEDULES.DETAIL, {
        service_schedule_id: Number(id),
      }),
    getByRoom: (roomId) =>
      api.post(API_ROUTES.SERVICE_SCHEDULES.BY_ROOM, {
        service_room_id: Number(roomId),
      }),
    getByRoomDay: (roomId, day) =>
      api.post(API_ROUTES.SERVICE_SCHEDULES.BY_ROOM_DAY, {
        service_room_id: Number(roomId),
        week_day: day,
      }),
    post: (data) => api.post(API_ROUTES.SERVICE_SCHEDULES.BASE, data),
    put: (id, data) =>
      api.patch(API_ROUTES.SERVICE_SCHEDULES.BASE, {
        ...data,
        service_schedule_id: Number(id),
      }),
    delete: (id) =>
      deleteWithBody(API_ROUTES.SERVICE_SCHEDULES.BASE, {
        service_schedule_id: Number(id),
      }),
  },

  // Dashboard
  dashboard: {
    get: () => api.get(API_ROUTES.DASHBOARD.BASE),
    vacanciesByRegion: () => api.get(API_ROUTES.DASHBOARD.VACANCIES_BY_REGION),
    occupiedByRegion: () => api.get(API_ROUTES.DASHBOARD.OCCUPIED_BY_REGION),
    studentsByInstitution: () =>
      api.get(API_ROUTES.DASHBOARD.STUDENTS_BY_INSTITUTION),
    studentsByRegionInstitution: () =>
      api.get(API_ROUTES.DASHBOARD.STUDENTS_BY_REGION_INSTITUTION),
    occupiedByInternship: () =>
      api.get(API_ROUTES.DASHBOARD.OCCUPIED_BY_INTERNSHIP),
    capacityByInternship: () =>
      api.get(API_ROUTES.DASHBOARD.CAPACITY_BY_INTERNSHIP),
  },

  // Acompanhamento
  acompanhamento: {
    locationsAgenda: () => api.get("/api/v1/locations-agenda"),
  },
};
