import axios from 'axios';

const configuredBaseURL = (import.meta.env.VITE_API_BASE_URL || '').trim().replace(/\/+$/, '');
const pageHostname = typeof window !== 'undefined' ? window.location.hostname : '';
const isLocalPage = ['localhost', '127.0.0.1', '::1'].includes(pageHostname);
const configuredLocalAPI = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(configuredBaseURL);

const remoteProductionPage = import.meta.env.PROD && !isLocalPage;

export const apiConfigError =
  remoteProductionPage && !configuredBaseURL
    ? 'Frontend is deployed without VITE_API_BASE_URL. Set it to your Render backend URL in Netlify and do redeploy.'
    : remoteProductionPage && configuredLocalAPI
      ? `Frontend is deployed with VITE_API_BASE_URL=${configuredBaseURL}. Set VITE_API_BASE_URL to your Render backend URL in Netlify and redeploy.`
      : '';

export const apiBaseURL = apiConfigError
  ? ''
  : configuredBaseURL || (isLocalPage ? 'https://student-management-backend-jqc5.onrender.com' : '');

export const apiBaseURLDisplay = configuredBaseURL || apiBaseURL || 'https://student-management-backend-jqc5.onrender.com';

const effectiveBaseURL = apiBaseURL || 'https://student-management-backend-jqc5.onrender.com'; 

const API = axios.create({
  baseURL: effectiveBaseURL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach token on every request
API.interceptors.request.use((config) => {
  if (apiConfigError) {
    const error = new Error(apiConfigError);
    error.isApiConfigError = true;
    return Promise.reject(error);
  }

  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  if (config.data instanceof FormData) {
    if (typeof config.headers.delete === 'function') {
      config.headers.delete('Content-Type');
    } else {
      delete config.headers['Content-Type'];
    }
  }
  return config;
});

// ── Auth (MongoDB) ────────────────────────────────────────────────────────────
/** Admin / teacher / student login. Students use email + password. */
export const login = (identifier, password) =>
  API.post('/api/mongo/auth/login', { identifier, password });

// Legacy student registration (kept for backward-compat)
export const registerStudent = (payload) =>
  API.post('/api/auth/register-student', payload);

// ── Profile / Dashboard (legacy) ─────────────────────────────────────────────
export const getProfile = () => API.get('/api/students/profile');
export const getDashboard = () => API.get('/api/students/dashboard');

// ── Admin – Students (MongoDB) ────────────────────────────────────────────────
export const getAllStudents = (q = '') =>
  API.get('/api/mongo/students', { params: q ? { q } : {} });

export const addStudent = (payload) =>
  API.post('/api/mongo/students', payload);

export const editStudent = (id, payload) =>
  API.put(`/api/mongo/students/${id}`, payload);

export const deleteStudent = (id) =>
  API.delete(`/api/mongo/students/${id}`);

export const getStudentStats = () =>
  API.get('/api/mongo/students/stats');

// ── Admin – Teachers (legacy) ─────────────────────────────────────────────────
export const getTeachers = (q = '') =>
  API.get('/api/mongo/teachers', { params: q ? { q } : {} });
export const createTeacher = (payload) => API.post('/api/mongo/teachers', payload);
export const editTeacher = (id, payload) => API.put(`/api/mongo/teachers/${id}`, payload);
export const deleteTeacher = (id) => API.delete(`/api/mongo/teachers/${id}`);

// ── Contact Us (MongoDB) ──────────────────────────────────────────────────────
export const submitQuery = (payload) =>
  API.post('/api/mongo/contact', payload);

export const getAdminQueries = () =>
  API.get('/api/mongo/contact');

export const resolveQuery = (id) =>
  API.patch(`/api/mongo/contact/${id}/resolve`);

export const deleteQuery = (id) =>
  API.delete(`/api/mongo/contact/${id}`);

export const getQueryStats = () =>
  API.get('/api/mongo/contact/stats');

// ── Admin Dashboard ───────────────────────────────────────────────────────────
export const getAdminDashboard = () => API.get('/admin-dashboard');

// ── Attendance / Notes / Quiz (legacy) ───────────────────────────────────────
export const createAttendance = (payload) => API.post('/api/mongo/attendance', payload);
export const listAttendance = (studentId) => API.get(`/api/mongo/attendance/${studentId}`);
export const createNote = (payload) =>
  API.post('/api/mongo/notes', payload);
export const listNotes = () => API.get('/api/mongo/notes');
export const deleteNote = (noteId) =>
  API.delete(`/api/mongo/notes/${noteId}`);
export const getNoteFileUrl = (noteId) => `${apiBaseURL}/api/mongo/notes/${noteId}/file`;
export const createResult = (payload) => API.post('/api/mongo/results', payload);
export const listResults = (studentId) => API.get(`/api/mongo/results/${studentId}`);
export const createQuiz = (payload) => API.post('/api/mongo/quiz', payload);
export const listQuizzes = () => API.get('/api/mongo/quiz');
export const deleteQuiz = (quizId) =>
  API.post(`/api/mongo/quiz/${quizId}/delete`);
export const submitQuiz = (quizId, payload) =>
  API.post(`/api/mongo/quiz/${quizId}/submit`, payload);
export const markQuiz = (quizId, payload) =>
  API.post(`/api/mongo/quiz/${quizId}/mark`, payload);
export const viewQuizResults = (quizId) =>
  API.get(`/api/mongo/quiz/${quizId}/results`);

// ── Courses (legacy) ──────────────────────────────────────────────────────────
export const listCourses = () => API.get('/api/courses');
export const createCourse = (payload) => API.post('/api/courses', payload);

export default API;
