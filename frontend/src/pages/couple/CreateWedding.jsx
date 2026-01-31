import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/common/Layout";
import weddingService from "../../services/weddingService";
import { HeartIcon } from "@heroicons/react/24/outline";

const CreateWedding = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    weddingDate: "",
    venueName: "",
    venueStreet: "",
    venueCity: "",
    venueState: "",
    venueCountry: "India",
    venueZipCode: "",
    partner2Email: "",
    description: "",
    theme: "",
    expectedGuests: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    setApiError("");
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Wedding title is required";
    }

    if (!formData.weddingDate) {
      newErrors.weddingDate = "Wedding date is required";
    } else {
      const selectedDate = new Date(formData.weddingDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        newErrors.weddingDate = "Wedding date cannot be in the past";
      }
    }

    if (!formData.venueName.trim()) {
      newErrors.venueName = "Venue name is required";
    }

    if (!formData.venueCity.trim()) {
      newErrors.venueCity = "City is required";
    }

    if (!formData.venueCountry.trim()) {
      newErrors.venueCountry = "Country is required";
    }

    if (
      formData.partner2Email &&
      !/\S+@\S+\.\S+/.test(formData.partner2Email)
    ) {
      newErrors.partner2Email = "Please provide a valid email";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");

    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      const weddingData = {
        title: formData.title,
        weddingDate: formData.weddingDate,
        venue: {
          name: formData.venueName,
          address: {
            street: formData.venueStreet,
            city: formData.venueCity,
            state: formData.venueState,
            country: formData.venueCountry,
            zipCode: formData.venueZipCode,
          },
        },
        description: formData.description,
        theme: formData.theme,
      };

      if (formData.partner2Email) {
        weddingData.partner2Email = formData.partner2Email;
      }

      if (formData.expectedGuests) {
        weddingData.guestCount = {
          expected: parseInt(formData.expectedGuests),
        };
      }

      await weddingService.createWedding(weddingData);
      navigate("/dashboard");
    } catch (error) {
      setApiError(
        error.response?.data?.message ||
          "Failed to create wedding. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">
            Create Your Wedding
          </h1>
          <p className="text-gray-600">
            Let's start planning your perfect day!
          </p>
        </div>

        <div className="card">
          {apiError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
              {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <HeartIcon className="w-6 h-6 text-primary-500 mr-2" />
                Basic Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="label">Wedding Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className={`input-field ${errors.title ? "border-red-500" : ""}`}
                    placeholder="e.g., John & Emily's Wedding"
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                  )}
                </div>

                <div>
                  <label className="label">Wedding Date *</label>
                  <input
                    type="date"
                    name="weddingDate"
                    value={formData.weddingDate}
                    onChange={handleChange}
                    className={`input-field ${errors.weddingDate ? "border-red-500" : ""}`}
                  />
                  {errors.weddingDate && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.weddingDate}
                    </p>
                  )}
                </div>

                <div>
                  <label className="label">Expected Guests</label>
                  <input
                    type="number"
                    name="expectedGuests"
                    value={formData.expectedGuests}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="e.g., 150"
                    min="1"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="label">Partner's Email (Optional)</label>
                  <input
                    type="email"
                    name="partner2Email"
                    value={formData.partner2Email}
                    onChange={handleChange}
                    className={`input-field ${errors.partner2Email ? "border-red-500" : ""}`}
                    placeholder="partner@example.com"
                  />
                  {errors.partner2Email && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.partner2Email}
                    </p>
                  )}
                  <p className="mt-1 text-sm text-gray-500">
                    If your partner has an account, they'll be added
                    automatically
                  </p>
                </div>
              </div>
            </div>

            {/* Venue Information */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Venue Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="label">Venue Name *</label>
                  <input
                    type="text"
                    name="venueName"
                    value={formData.venueName}
                    onChange={handleChange}
                    className={`input-field ${errors.venueName ? "border-red-500" : ""}`}
                    placeholder="e.g., Rose Garden Venue"
                  />
                  {errors.venueName && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.venueName}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="label">Street Address</label>
                  <input
                    type="text"
                    name="venueStreet"
                    value={formData.venueStreet}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="123 Main Street"
                  />
                </div>

                <div>
                  <label className="label">City *</label>
                  <input
                    type="text"
                    name="venueCity"
                    value={formData.venueCity}
                    onChange={handleChange}
                    className={`input-field ${errors.venueCity ? "border-red-500" : ""}`}
                    placeholder="Mumbai"
                  />
                  {errors.venueCity && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.venueCity}
                    </p>
                  )}
                </div>

                <div>
                  <label className="label">State/Province</label>
                  <input
                    type="text"
                    name="venueState"
                    value={formData.venueState}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Maharashtra"
                  />
                </div>

                <div>
                  <label className="label">Country *</label>
                  <input
                    type="text"
                    name="venueCountry"
                    value={formData.venueCountry}
                    onChange={handleChange}
                    className={`input-field ${errors.venueCountry ? "border-red-500" : ""}`}
                    placeholder="India"
                  />
                  {errors.venueCountry && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.venueCountry}
                    </p>
                  )}
                </div>

                <div>
                  <label className="label">Zip/Postal Code</label>
                  <input
                    type="text"
                    name="venueZipCode"
                    value={formData.venueZipCode}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="400001"
                  />
                </div>
              </div>
            </div>

            {/* Additional Details */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Additional Details
              </h2>
              <div className="space-y-6">
                <div>
                  <label className="label">Theme (Optional)</label>
                  <input
                    type="text"
                    name="theme"
                    value={formData.theme}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="e.g., Garden Romance, Traditional, Modern Elegance"
                  />
                </div>

                <div>
                  <label className="label">Description (Optional)</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="input-field"
                    rows="4"
                    placeholder="Tell us about your wedding vision..."
                  />
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate("/dashboard")}
                className="btn-secondary"
                disabled={loading}
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? (
                  <div className="flex items-center">
                    <div className="loader mr-2"></div>
                    Creating Wedding...
                  </div>
                ) : (
                  "Create Wedding"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default CreateWedding;
