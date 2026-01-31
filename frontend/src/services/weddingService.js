import api from "./api";

const weddingService = {
  // Create wedding
  createWedding: async (weddingData) => {
    const response = await api.post("/weddings", weddingData);
    return response.data;
  },

  // Get all weddings (admin/planner)
  getAllWeddings: async (params) => {
    const response = await api.get("/weddings", { params });
    return response.data;
  },

  // Get my weddings (couple)
  getMyWeddings: async () => {
    const response = await api.get("/weddings/my-weddings");
    return response.data;
  },

  // Get single wedding
  getWedding: async (id) => {
    const response = await api.get(`/weddings/${id}`);
    return response.data;
  },

  // Update wedding
  updateWedding: async (id, weddingData) => {
    const response = await api.put(`/weddings/${id}`, weddingData);
    return response.data;
  },

  // Delete wedding
  deleteWedding: async (id) => {
    const response = await api.delete(`/weddings/${id}`);
    return response.data;
  },

  // Assign planner
  assignPlanner: async (id, plannerId) => {
    const response = await api.put(`/weddings/${id}/assign-planner`, {
      plannerId,
    });
    return response.data;
  },

  // Update status
  updateStatus: async (id, status) => {
    const response = await api.put(`/weddings/${id}/status`, { status });
    return response.data;
  },
};

export default weddingService;
