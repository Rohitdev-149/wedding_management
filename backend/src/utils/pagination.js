/**
 * Pagination helper utilities
 * Provides consistent pagination across API endpoints
 */

const getPagination = (query) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, parseInt(query.limit) || 10);
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

const getPaginationResponse = (data, total, page, limit) => {
  return {
    success: true,
    data,
    pagination: {
      total,
      pages: Math.ceil(total / limit),
      current: page,
      limit,
      hasNext: page * limit < total,
      hasPrev: page > 1,
    },
    timestamp: new Date().toISOString(),
  };
};

module.exports = { getPagination, getPaginationResponse };
