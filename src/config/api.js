import axios from 'axios';

// API Base URL - configure based on environment
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds
});

// Request interceptor - Add auth token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Don't redirect on 401 if it's a logout request (let the logout handler deal with it)
    const isLogoutRequest = error.config?.url?.includes('/auth/logout');

    // Handle 401 Unauthorized - token expired or invalid
    if (error.response?.status === 401 && !isLogoutRequest) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('userRole');
      // Only redirect if not already on login page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }

    // Handle 403 Forbidden - insufficient permissions
    if (error.response?.status === 403) {
      console.error('Access denied: Insufficient permissions');
    }

    // Handle network errors
    if (!error.response) {
      console.error('Network error: Please check your connection');
    }

    return Promise.reject(error);
  }
);

// API endpoints
export const authAPI = {
  login: (credentials) => apiClient.post('/auth/login', credentials),
  register: (userData) => apiClient.post('/auth/register', userData),
  logout: () => apiClient.post('/auth/logout'),
  getCurrentUser: () => apiClient.get('/auth/me'),
  refreshToken: () => apiClient.post('/auth/refresh'),
  updateProfile: (data) => apiClient.put('/auth/updateprofile', data),
  updateTeacherProfile: (data) => apiClient.put('/teacher/me/profile', data),
};

export const userAPI = {
  getProfile: () => apiClient.get('/users/profile'),
  updateProfile: (data) => apiClient.put('/users/profile', data),
  changePassword: (data) => apiClient.put('/users/password', data),
};

export const adminAPI = {
  getAllUsers: (params) => apiClient.get('/admin/users', { params }),
  getUserById: (id) => apiClient.get(`/admin/users/${id}`),
  updateUser: (id, data) => apiClient.put(`/admin/users/${id}`, data),
  deleteUser: (id) => apiClient.delete(`/admin/users/${id}`),
  getStats: () => apiClient.get('/admin/stats'),
};

export const studentAPI = {
  getAllStudents: (params) => apiClient.get('/students', { params }),
  getStudent: (id) => apiClient.get(`/students/${id}`),
  createStudent: (data) => apiClient.post('/students', data),
  updateStudent: (id, data) => apiClient.put(`/students/${id}`, data),
  deleteStudent: (id) => apiClient.delete(`/students/${id}`),
};

export const attendanceAPI = {
  getAllAttendance: (params) => apiClient.get('/attendance', { params }),
  getAttendance: (id) => apiClient.get(`/attendance/${id}`),
  createAttendance: (data) => apiClient.post('/attendance', data),
  bulkCreateAttendance: (data) => apiClient.post('/attendance/bulk', data),
  updateAttendance: (id, data) => apiClient.put(`/attendance/${id}`, data),
  deleteAttendance: (id) => apiClient.delete(`/attendance/${id}`),
  getAttendanceStats: (studentId) => apiClient.get(`/attendance/stats/${studentId}`),
};

export const behaviorAPI = {
  getAllBehaviors: (params) => apiClient.get('/behaviors', { params }),
  getBehavior: (id) => apiClient.get(`/behaviors/${id}`),
  createBehavior: (data) => apiClient.post('/behaviors', data),
  updateBehavior: (id, data) => apiClient.put(`/behaviors/${id}`, data),
  deleteBehavior: (id) => apiClient.delete(`/behaviors/${id}`),
  getBehaviorStats: (studentId) => apiClient.get(`/behaviors/stats/${studentId}`),
  markParentNotified: (id) => apiClient.put(`/behaviors/${id}/notify`),
};

export const gradeAPI = {
  getAllGrades: (params) => apiClient.get('/grades', { params }),
  getGrade: (id) => apiClient.get(`/grades/${id}`),
  createGrade: (data) => apiClient.post('/grades', data),
  updateGrade: (id, data) => apiClient.put(`/grades/${id}`, data),
  deleteGrade: (id) => apiClient.delete(`/grades/${id}`),
  getGradeStats: (studentId) => apiClient.get(`/grades/stats/${studentId}`),
  getStudentSubjectRank: (studentId, params) => apiClient.get(`/grades/rank/${studentId}`, { params }),
};

export const teacherAPI = {
  getClasses: () => apiClient.get('/teacher/classes'),
  getStudents: (classId) => apiClient.get(`/teacher/classes/${classId}/students`),
  getClassrooms: () => apiClient.get('/teacher/classrooms'),
  getClassroom: (academicYearId) => apiClient.get(`/teacher/classrooms/${academicYearId}`),
  getClassroomStudents: (academicYearId) => apiClient.get(`/teacher/classrooms/${academicYearId}/students`),
  logBehavior: (data) => apiClient.post('/teacher/behavior', data),
  getBehaviorLogs: (params) => apiClient.get('/teacher/behavior', { params }),
  markAttendance: (data) => apiClient.post('/teacher/attendance', data),
  getAttendance: (params) => apiClient.get('/teacher/attendance', { params }),
};

export const parentAPI = {
  getChildren: () => apiClient.get('/students/parent/me'),
  getChildBehavior: (childId, params) => apiClient.get('/behaviors', { params: { studentId: childId, ...params } }),
  getChildAttendance: (childId, params) => apiClient.get('/attendance', { params: { studentId: childId, ...params } }),
  getChildGrades: (childId, params) => apiClient.get('/grades', { params: { studentId: childId, ...params } }),
  getMessages: () => apiClient.get('/parent/messages'),
  sendMessage: (data) => apiClient.post('/parent/messages', data),
};

// Messaging API for all roles
export const messageAPI = {
  // Messages
  sendMessage: (data) => apiClient.post('/communication/messages', data),
  getMessages: (type = 'received') => apiClient.get(`/communication/messages?type=${type}`),
  getMessageById: (id) => apiClient.get(`/communication/messages/${id}`),
  deleteMessage: (id) => apiClient.delete(`/communication/messages/${id}`),
  getUnreadCount: () => apiClient.get('/communication/messages/unread/count'),
};

// Announcement & Meeting API
export const announcementAPI = {
  // Announcements
  getAnnouncements: () => apiClient.get('/communication/announcements'),
  getAnnouncement: (id) => apiClient.get(`/communication/announcements/${id}`),
  createAnnouncement: (data) => apiClient.post('/communication/announcements', data),
  updateAnnouncement: (id, data) => apiClient.put(`/communication/announcements/${id}`, data),
  deleteAnnouncement: (id) => apiClient.delete(`/communication/announcements/${id}`),
  
  // Meetings
  getMeetings: (params) => apiClient.get('/communication/meetings', { params }),
  getMeeting: (id) => apiClient.get(`/communication/meetings/${id}`),
  createMeeting: (data) => apiClient.post('/communication/meetings', data),
  updateMeeting: (id, data) => apiClient.put(`/communication/meetings/${id}`, data),
  deleteMeeting: (id) => apiClient.delete(`/communication/meetings/${id}`),
  respondToMeeting: (id, data) => apiClient.put(`/communication/meetings/${id}/respond`, data),
};

export default apiClient;
