import api from "./api";

const budgetService = {
  // Get budget
  getBudget: async (weddingId) => {
    const response = await api.get(`/budgets/wedding/${weddingId}`);
    return response.data;
  },

  // Update total budget
  updateTotalBudget: async (weddingId, totalBudget) => {
    const response = await api.put(`/budgets/wedding/${weddingId}`, {
      totalBudget,
    });
    return response.data;
  },

  // Add expense
  addExpense: async (weddingId, expenseData) => {
    const response = await api.post(
      `/budgets/wedding/${weddingId}/expenses`,
      expenseData,
    );
    return response.data;
  },

  // Update expense
  updateExpense: async (weddingId, expenseId, expenseData) => {
    const response = await api.put(
      `/budgets/wedding/${weddingId}/expenses/${expenseId}`,
      expenseData,
    );
    return response.data;
  },

  // Delete expense
  deleteExpense: async (weddingId, expenseId) => {
    const response = await api.delete(
      `/budgets/wedding/${weddingId}/expenses/${expenseId}`,
    );
    return response.data;
  },

  // Mark expense as paid
  markExpensePaid: async (weddingId, expenseId) => {
    const response = await api.put(
      `/budgets/wedding/${weddingId}/expenses/${expenseId}/mark-paid`,
    );
    return response.data;
  },

  // Get budget summary
  getBudgetSummary: async (weddingId) => {
    const response = await api.get(`/budgets/wedding/${weddingId}/summary`);
    return response.data;
  },

  // Get expenses by category
  getExpensesByCategory: async (weddingId, category) => {
    const response = await api.get(
      `/budgets/wedding/${weddingId}/expenses/category/${category}`,
    );
    return response.data;
  },
};

export default budgetService;
