/**
 * Courses API service
 */

import apiClient from './client';
import { ENDPOINTS } from './config';

export const coursesService = {
  /**
   * Get all courses
   */
  getCourses: async (params = {}) => {
    const response = await apiClient.get(ENDPOINTS.COURSES.LIST, { params });
    return response.data;
  },

  /**
   * Get course by ID
   */
  getCourse: async (courseId) => {
    const response = await apiClient.get(ENDPOINTS.COURSES.DETAIL(courseId));
    return response.data;
  },

  /**
   * Enroll in a course
   */
  enrollCourse: async (courseId, options = {}) => {
    // options: { simulate_payment: boolean }
    const response = await apiClient.post(ENDPOINTS.COURSES.ENROLL(courseId), options);
    return response.data;
  },

  /**
   * Unenroll from a course
   */
  unenrollCourse: async (courseId) => {
    const response = await apiClient.post(ENDPOINTS.COURSES.UNENROLL(courseId));
    return response.data;
  },

  /**
   * Get user's enrollments
   */
  getEnrollments: async () => {
    const response = await apiClient.get(ENDPOINTS.ENROLLMENTS.LIST);
    return response.data;
  },

  /**
   * Get lessons for a course
   */
  getLessons: async (courseId) => {
    const response = await apiClient.get(ENDPOINTS.LESSONS.LIST, {
      params: { course: courseId },
    });
    return response.data;
  },

  /**
   * Get enrollment progress
   */
  getEnrollmentProgress: async (enrollmentId) => {
    const response = await apiClient.get(`/enrollments/${enrollmentId}/progress/`);
    return response.data;
  },

  /**
   * Mark lesson as complete
   */
  markLessonComplete: async (enrollmentId, lessonId) => {
    const response = await apiClient.post(`/enrollments/${enrollmentId}/lessons/${lessonId}/complete/`);
    return response.data;
  },

  /**
   * Mark lesson as complete (alternate method)
   */
  completeLesson: async (lessonId) => {
    const response = await apiClient.post(ENDPOINTS.LESSONS.COMPLETE(lessonId));
    return response.data;
  },

  /**
   * Create a new course (admin only)
   */
  createCourse: async (courseData) => {
    const response = await apiClient.post(ENDPOINTS.COURSES.CREATE, courseData);
    return response.data;
  },

  /**
   * Update a course (admin only)
   */
  updateCourse: async (courseId, courseData) => {
    const response = await apiClient.put(ENDPOINTS.COURSES.DETAIL(courseId), courseData);
    return response.data;
  },

  /**
   * Delete a course (admin only)
   */
  deleteCourse: async (courseId) => {
    const response = await apiClient.delete(ENDPOINTS.COURSES.DETAIL(courseId));
    return response.data;
  },

  /**
   * Create a Stripe Payment Intent for a course (in-app payment)
   */
  createPaymentIntent: async (courseId) => {
    const response = await apiClient.post(`${ENDPOINTS.COURSES.DETAIL(courseId)}create_payment_intent/`);
    return response.data;
  },

  /**
   * Confirm payment and create enrollment after successful payment
   */
  confirmPayment: async (courseId, paymentIntentId) => {
    const response = await apiClient.post(`${ENDPOINTS.COURSES.DETAIL(courseId)}confirm_payment/`, {
      payment_intent_id: paymentIntentId,
    });
    return response.data;
  },

  /**
   * Get certificate for completed course enrollment
   */
  getCertificate: async (enrollmentId) => {
    const response = await apiClient.get(`/enrollments/${enrollmentId}/certificate/`);
    return response.data;
  },

  /**
   * Get all paid orders/enrollments (admin only)
   */
  getPaidOrders: async () => {
    const response = await apiClient.get('/enrollments/paid-orders/');
    return response.data;
  },

  /**
   * Create a new lesson (admin only)
   */
  createLesson: async (lessonData) => {
    const response = await apiClient.post(ENDPOINTS.LESSONS.LIST, lessonData);
    return response.data;
  },

  /**
   * Update a lesson (admin only)
   */
  updateLesson: async (lessonId, lessonData) => {
    const response = await apiClient.put(ENDPOINTS.LESSONS.DETAIL(lessonId), lessonData);
    return response.data;
  },

  /**
   * Delete a lesson (admin only)
   */
  deleteLesson: async (lessonId) => {
    const response = await apiClient.delete(ENDPOINTS.LESSONS.DETAIL(lessonId));
    return response.data;
  },

  /**
   * Get a specific lesson by ID
   */
  getLesson: async (lessonId) => {
    const response = await apiClient.get(ENDPOINTS.LESSONS.DETAIL(lessonId));
    return response.data;
  },

  /**
   * Get enrollment details by ID (admin only)
   */
  getEnrollmentDetails: async (enrollmentId) => {
    const response = await apiClient.get(`${ENDPOINTS.ENROLLMENTS.LIST}${enrollmentId}/`);
    return response.data;
  },
};
