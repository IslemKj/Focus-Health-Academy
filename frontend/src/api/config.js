/**
 * API Configuration
 */

// Automatically use production or development API
// __DEV__ is true in development, false in production builds
export const API_BASE_URL = __DEV__
  ? 'http://192.168.100.11:8000/api/v1'  // Development (local network)
  : 'https://api.focushealth-academy.com/api/v1';  // Production

// API endpoints
export const ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: '/auth/login/',
    REGISTER: '/auth/register/',
    LOGOUT: '/auth/logout/',
    REFRESH: '/auth/refresh/',
    PROFILE: '/auth/profile/',
    CHANGE_PASSWORD: '/auth/change-password/',
    PASSWORD_RESET: '/auth/password-reset/',
    PASSWORD_RESET_CONFIRM: '/auth/password-reset-confirm/',
  },
  
  // Courses endpoints
  COURSES: {
    LIST: '/courses/',
    DETAIL: (id) => `/courses/${id}/`,
    CREATE: '/courses/',
    ENROLL: (id) => `/courses/${id}/enroll/`,
    UNENROLL: (id) => `/courses/${id}/unenroll/`,
  },
  
  // Lessons endpoints
  LESSONS: {
    LIST: '/lessons/',
    DETAIL: (id) => `/lessons/${id}/`,
    COMPLETE: (id) => `/lessons/${id}/complete/`,
  },
  
  // Enrollments endpoints
  ENROLLMENTS: {
    LIST: '/enrollments/',
    DETAIL: (id) => `/enrollments/${id}/`,
  },
  
  // Events endpoints
  EVENTS: {
    LIST: '/events/',
    DETAIL: (id) => `/events/${id}/`,
    CREATE: '/events/',
    REGISTER: (id) => `/events/${id}/register/`,
    CANCEL: (id) => `/events/${id}/cancel_registration/`,
  },

  // Event registrations (user's registrations)
  EVENT_REGISTRATIONS: {
    LIST: '/event-registrations/',
    DETAIL: (id) => `/event-registrations/${id}/`,
  },
  
  // Timeline endpoints
  POSTS: {
    LIST: '/posts/',
    DETAIL: (id) => `/posts/${id}/`,
    CREATE: '/posts/',
    LIKE: (id) => `/posts/${id}/like/`,
    UNLIKE: (id) => `/posts/${id}/unlike/`,
    COMMENTS: (id) => `/posts/${id}/comments/`,
    ADD_COMMENT: (id) => `/posts/${id}/add_comment/`,
    DELETE_COMMENT: (commentId) => `/comments/${commentId}/`,
  },
  // Users endpoints (admin)
  USERS: {
    LIST: '/users/',
    DETAIL: (id) => `/users/${id}/`,
    UPDATE: (id) => `/users/${id}/`,
    DELETE: (id) => `/users/${id}/`,
  },
  
  // Chat endpoints
  CHAT: {
    ROOMS: '/chat-rooms/',
    ROOM_DETAIL: (id) => `/chat-rooms/${id}/`,
    MESSAGES: (id) => `/chat-rooms/${id}/messages/`,
    SEND_MESSAGE: (id) => `/chat-rooms/${id}/send_message/`,
    MARK_AS_READ: (id) => `/chat-rooms/${id}/mark_as_read/`,
    GET_OR_CREATE_DIRECT: '/chat-rooms/get_or_create_direct_chat/',
  },
};
