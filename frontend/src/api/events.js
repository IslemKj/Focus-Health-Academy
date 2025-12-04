/**
 * Events API service
 */

import apiClient from './client';
import { ENDPOINTS } from './config';

export const eventsService = {
  /**
   * Get all events
   */
  getEvents: async (params = {}) => {
    const response = await apiClient.get(ENDPOINTS.EVENTS.LIST, { params });
    return response.data;
  },

  /**
   * Get event by ID
   */
  getEvent: async (eventId) => {
    const response = await apiClient.get(ENDPOINTS.EVENTS.DETAIL(eventId));
    return response.data;
  },

  /**
   * Register for an event
   */
  registerEvent: async (eventId, notes = '', options = {}) => {
    // options: { simulate_payment: boolean }
    const payload = { notes, ...options };
    const response = await apiClient.post(ENDPOINTS.EVENTS.REGISTER(eventId), payload);
    return response.data;
  },

  /**
   * Cancel event registration
   */
  cancelRegistration: async (eventId) => {
    const response = await apiClient.post(ENDPOINTS.EVENTS.CANCEL(eventId));
    return response.data;
  },

  /**
   * Create a new event (admin only)
   */
  createEvent: async (eventData) => {
    const response = await apiClient.post(ENDPOINTS.EVENTS.CREATE, eventData);
    return response.data;
  },

  /**
   * Update an event (admin only)
   */
  updateEvent: async (eventId, eventData) => {
    const response = await apiClient.put(ENDPOINTS.EVENTS.DETAIL(eventId), eventData);
    return response.data;
  },

  /**
   * Delete an event (admin only)
   */
  deleteEvent: async (eventId) => {
    const response = await apiClient.delete(ENDPOINTS.EVENTS.DETAIL(eventId));
    return response.data;
  },

  /**
   * Get user's event registrations (tickets)
   */
  getRegistrations: async () => {
    const response = await apiClient.get(ENDPOINTS.EVENT_REGISTRATIONS.LIST);
    return response.data;
  },

  /**
   * Create a Stripe Payment Intent for an event (in-app payment)
   */
  createPaymentIntent: async (eventId) => {
    const response = await apiClient.post(`${ENDPOINTS.EVENTS.DETAIL(eventId)}create_payment_intent/`);
    return response.data;
  },

  /**
   * Confirm payment and create registration after successful payment
   */
  confirmPayment: async (eventId, paymentIntentId) => {
    const response = await apiClient.post(`${ENDPOINTS.EVENTS.DETAIL(eventId)}confirm_payment/`, {
      payment_intent_id: paymentIntentId,
    });
    return response.data;
  },

  /**
   * Get event registration details by ID (admin only)
   */
  getRegistrationDetails: async (registrationId) => {
    const response = await apiClient.get(`${ENDPOINTS.EVENT_REGISTRATIONS.LIST}${registrationId}/`);
    return response.data;
  },
};
