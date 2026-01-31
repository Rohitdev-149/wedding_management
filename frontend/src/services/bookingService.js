import api from "./api";

const bookingService = {
  // Create booking
  createBooking: async (bookingData) => {
    const response = await api.post("/bookings", bookingData);
    return response.data;
  },

  // Get wedding bookings
  getWeddingBookings: async (weddingId, params) => {
    const response = await api.get(`/bookings/wedding/${weddingId}`, {
      params,
    });
    return response.data;
  },

  // Get vendor bookings
  getVendorBookings: async (params) => {
    const response = await api.get("/bookings/my-bookings", { params });
    return response.data;
  },

  // Get single booking
  getBooking: async (id) => {
    const response = await api.get(`/bookings/${id}`);
    return response.data;
  },

  // Update booking status
  updateBookingStatus: async (id, status) => {
    const response = await api.put(`/bookings/${id}/status`, { status });
    return response.data;
  },

  // Update payment
  updatePayment: async (id, advancePaid) => {
    const response = await api.put(`/bookings/${id}/payment`, { advancePaid });
    return response.data;
  },

  // Cancel booking
  cancelBooking: async (id, cancellationReason) => {
    const response = await api.put(`/bookings/${id}/cancel`, {
      cancellationReason,
    });
    return response.data;
  },

  // Add review
  addReview: async (id, rating, comment) => {
    const response = await api.put(`/bookings/${id}/review`, {
      rating,
      comment,
    });
    return response.data;
  },
};

export default bookingService;
