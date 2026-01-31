import api from "./api";

const timelineService = {
  // Get timeline
  getTimeline: async (weddingId) => {
    const response = await api.get(`/timelines/wedding/${weddingId}`);
    return response.data;
  },

  // Add event
  addEvent: async (weddingId, eventData) => {
    const response = await api.post(
      `/timelines/wedding/${weddingId}/events`,
      eventData,
    );
    return response.data;
  },

  // Update event
  updateEvent: async (weddingId, eventId, eventData) => {
    const response = await api.put(
      `/timelines/wedding/${weddingId}/events/${eventId}`,
      eventData,
    );
    return response.data;
  },

  // Delete event
  deleteEvent: async (weddingId, eventId) => {
    const response = await api.delete(
      `/timelines/wedding/${weddingId}/events/${eventId}`,
    );
    return response.data;
  },

  // Get upcoming events
  getUpcomingEvents: async (weddingId) => {
    const response = await api.get(
      `/timelines/wedding/${weddingId}/events/upcoming`,
    );
    return response.data;
  },

  // Get events by type
  getEventsByType: async (weddingId, eventType) => {
    const response = await api.get(
      `/timelines/wedding/${weddingId}/events/type/${eventType}`,
    );
    return response.data;
  },
};

export default timelineService;
