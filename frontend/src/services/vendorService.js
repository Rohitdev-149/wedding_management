import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api/v1";

const uploadVendorImages = async (vendorId, files) => {
  const formData = new FormData();
  Array.from(files).forEach((file) => {
    formData.append("images", file);
  });

  const token = localStorage.getItem("token");
  const headers = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  // Do NOT set Content-Type - browser must set multipart/form-data with boundary

  const res = await axios.post(
    `${API_URL}/users/vendors/${vendorId}/images`,
    formData,
    { headers }
  );
  return res;
};

export default {
  uploadVendorImages,
};
