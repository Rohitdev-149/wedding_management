import api from "./api";

const guestService = {
  // Get all guests
  getGuests: async (weddingId, params) => {
    const response = await api.get(`/guests/wedding/${weddingId}`, { params });
    return response.data;
  },

  // Get single guest
  getGuest: async (id) => {
    const response = await api.get(`/guests/${id}`);
    return response.data;
  },

  // Add guest
  addGuest: async (weddingId, guestData) => {
    const response = await api.post(`/guests/wedding/${weddingId}`, guestData);
    return response.data;
  },

  // Add guests bulk
  addGuestsBulk: async (weddingId, guests) => {
    const response = await api.post(`/guests/wedding/${weddingId}/bulk`, {
      guests,
    });
    return response.data;
  },

  // Update guest
  updateGuest: async (id, guestData) => {
    const response = await api.put(`/guests/${id}`, guestData);
    return response.data;
  },

  // Delete guest
  deleteGuest: async (id) => {
    const response = await api.delete(`/guests/${id}`);
    return response.data;
  },

  // Update RSVP
  updateRSVP: async (id, rsvpStatus) => {
    const response = await api.put(`/guests/${id}/rsvp`, { rsvpStatus });
    return response.data;
  },

  // Send invitation
  sendInvitation: async (id) => {
    const response = await api.put(`/guests/${id}/send-invitation`);
    return response.data;
  },

  // Assign table
  assignTable: async (id, tableNumber) => {
    const response = await api.put(`/guests/${id}/assign-table`, {
      tableNumber,
    });
    return response.data;
  },

  // Get guest statistics
  getGuestStats: async (weddingId) => {
    const response = await api.get(`/guests/wedding/${weddingId}/stats`);
    return response.data;
  },
};

export default guestService;
