import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/common/Layout";
import Loader from "../../components/common/Loader";
import weddingService from "../../services/weddingService";
import { formatDate, calculateDaysUntil } from "../../utils/formatters";
import {
  PencilIcon,
  MapPinIcon,
  CalendarIcon,
  HeartIcon,
  UserGroupIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

const WeddingDetailsPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [wedding, setWedding] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    weddingDate: "",
    venueName: "",
    venueStreet: "",
    venueCity: "",
    venueState: "",
    venueCountry: "",
    venueZipCode: "",
    description: "",
    theme: "",
    expectedGuests: "",
  });

  useEffect(() => {
    fetchWedding();
  }, []);

  const fetchWedding = async () => {
    try {
      const response = await weddingService.getMyWeddings();
      if (response.data.length === 0) {
        navigate("/wedding/create");
        return;
      }

      const weddingData = response.data[0];
      setWedding(weddingData);
      setFormData({
        title: weddingData.title,
        weddingDate: weddingData.weddingDate.split("T")[0],
        venueName: weddingData.venue.name,
        venueStreet: weddingData.venue.address.street || "",
        venueCity: weddingData.venue.address.city,
        venueState: weddingData.venue.address.state || "",
        venueCountry: weddingData.venue.address.country,
        venueZipCode: weddingData.venue.address.zipCode || "",
        description: weddingData.description || "",
        theme: weddingData.theme || "",
        expectedGuests: weddingData.guestCount?.expected?.toString() || "",
      });
    } catch (error) {
      console.error("Error fetching wedding:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const updateData = {
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

      if (formData.expectedGuests) {
        updateData.guestCount = {
          expected: parseInt(formData.expectedGuests),
        };
      }

      await weddingService.updateWedding(wedding._id, updateData);
      setIsEditing(false);
      fetchWedding();
      alert("Wedding updated successfully!");
    } catch (error) {
      console.error("Error updating wedding:", error);
      alert(error.response?.data?.message || "Failed to update wedding");
    }
  };

  const handleUpdateStatus = async (status) => {
    try {
      await weddingService.updateStatus(wedding._id, status);
      fetchWedding();
      alert("Status updated successfully!");
    } catch (error) {
      console.error("Error updating status:", error);
      alert(error.response?.data?.message || "Failed to update status");
    }
  };

  if (loading) {
    return (
      <Layout>
        <Loader />
      </Layout>
    );
  }

  const daysUntil = calculateDaysUntil(wedding.weddingDate);
  const statusColors = {
    planning: "bg-yellow-100 text-yellow-800",
    confirmed: "bg-green-100 text-green-800",
    completed: "bg-blue-100 text-blue-800",
    cancelled: "bg-red-100 text-red-800",
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">
              Wedding Details
            </h1>
            <p className="text-gray-600">Manage your wedding information</p>
          </div>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="btn-primary flex items-center"
            >
              <PencilIcon className="w-5 h-5 mr-2" />
              Edit Details
            </button>
          )}
        </div>

        {/* Countdown Card */}
        {!isEditing && (
          <div className="card bg-gradient-to-r from-primary-500 to-rose-500 text-white">
            <div className="text-center">
              <HeartIcon className="w-16 h-16 mx-auto mb-4 opacity-80" />
              <h2 className="text-3xl font-serif font-bold mb-2">
                {wedding.title}
              </h2>
              <p className="text-white/90 text-lg mb-6">
                {formatDate(wedding.weddingDate)}
              </p>
              <div className="inline-flex items-center space-x-4 bg-white/20 backdrop-blur-sm rounded-lg px-8 py-4">
                <div>
                  <div className="text-5xl font-bold">{daysUntil}</div>
                  <div className="text-sm text-white/90">
                    {daysUntil === 1 ? "Day" : "Days"} to go!
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Wedding Status */}
        {!isEditing && (
          <div className="card">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Wedding Status
            </h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-gray-600">Current Status:</span>
                <span
                  className={`px-4 py-2 rounded-full text-sm font-semibold capitalize ${statusColors[wedding.status]}`}
                >
                  {wedding.status}
                </span>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleUpdateStatus("planning")}
                  className="px-4 py-2 text-sm font-semibold text-yellow-700 bg-yellow-100 rounded-lg hover:bg-yellow-200"
                >
                  Planning
                </button>
                <button
                  onClick={() => handleUpdateStatus("confirmed")}
                  className="px-4 py-2 text-sm font-semibold text-green-700 bg-green-100 rounded-lg hover:bg-green-200"
                >
                  Confirmed
                </button>
                <button
                  onClick={() => handleUpdateStatus("completed")}
                  className="px-4 py-2 text-sm font-semibold text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200"
                >
                  Completed
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Wedding Details or Edit Form */}
        <div className="card">
          {isEditing ? (
            <form onSubmit={handleUpdate} className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Edit Wedding Details
              </h3>

              {/* Basic Information */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">
                  Basic Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="label">Wedding Title *</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      className="input-field"
                      required
                    />
                  </div>

                  <div>
                    <label className="label">Wedding Date *</label>
                    <input
                      type="date"
                      name="weddingDate"
                      value={formData.weddingDate}
                      onChange={handleChange}
                      className="input-field"
                      required
                    />
                  </div>

                  <div>
                    <label className="label">Expected Guests</label>
                    <input
                      type="number"
                      name="expectedGuests"
                      value={formData.expectedGuests}
                      onChange={handleChange}
                      className="input-field"
                      min="1"
                    />
                  </div>
                </div>
              </div>

              {/* Venue Information */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">
                  Venue Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="label">Venue Name *</label>
                    <input
                      type="text"
                      name="venueName"
                      value={formData.venueName}
                      onChange={handleChange}
                      className="input-field"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="label">Street Address</label>
                    <input
                      type="text"
                      name="venueStreet"
                      value={formData.venueStreet}
                      onChange={handleChange}
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="label">City *</label>
                    <input
                      type="text"
                      name="venueCity"
                      value={formData.venueCity}
                      onChange={handleChange}
                      className="input-field"
                      required
                    />
                  </div>

                  <div>
                    <label className="label">State/Province</label>
                    <input
                      type="text"
                      name="venueState"
                      value={formData.venueState}
                      onChange={handleChange}
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="label">Country *</label>
                    <input
                      type="text"
                      name="venueCountry"
                      value={formData.venueCountry}
                      onChange={handleChange}
                      className="input-field"
                      required
                    />
                  </div>

                  <div>
                    <label className="label">Zip/Postal Code</label>
                    <input
                      type="text"
                      name="venueZipCode"
                      value={formData.venueZipCode}
                      onChange={handleChange}
                      className="input-field"
                    />
                  </div>
                </div>
              </div>

              {/* Additional Details */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">
                  Additional Details
                </h4>
                <div className="space-y-6">
                  <div>
                    <label className="label">Theme</label>
                    <input
                      type="text"
                      name="theme"
                      value={formData.theme}
                      onChange={handleChange}
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="label">Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      className="input-field"
                      rows="4"
                    />
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-8">
              {/* Basic Information Display */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <CalendarIcon className="w-6 h-6 text-primary-500 mr-2" />
                  Wedding Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-600">Wedding Title</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {wedding.title}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Wedding Date</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatDate(wedding.weddingDate)}
                    </p>
                  </div>
                  {wedding.theme && (
                    <div>
                      <p className="text-sm text-gray-600">Theme</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {wedding.theme}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-600">Expected Guests</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {wedding.guestCount?.expected || "Not set"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Venue Information Display */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <MapPinIcon className="w-6 h-6 text-primary-500 mr-2" />
                  Venue Details
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Venue Name</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {wedding.venue.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Address</p>
                    <p className="text-gray-900">
                      {wedding.venue.address.street &&
                        `${wedding.venue.address.street}, `}
                      {wedding.venue.address.city},{" "}
                      {wedding.venue.address.state &&
                        `${wedding.venue.address.state}, `}
                      {wedding.venue.address.country}
                      {wedding.venue.address.zipCode &&
                        ` - ${wedding.venue.address.zipCode}`}
                    </p>
                  </div>
                </div>
              </div>

              {/* Couple Information */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <UserGroupIcon className="w-6 h-6 text-primary-500 mr-2" />
                  Couple
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 bg-pink-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-2">Partner 1</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {wedding.couple?.partner1?.fullName || "N/A"}
                    </p>
                    <p className="text-sm text-gray-600">
                      {wedding.couple?.partner1?.email}
                    </p>
                  </div>
                  <div className="p-4 bg-pink-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-2">Partner 2</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {wedding.couple?.partner2?.fullName || "N/A"}
                    </p>
                    <p className="text-sm text-gray-600">
                      {wedding.couple?.partner2?.email}
                    </p>
                  </div>
                </div>
              </div>

              {/* Description */}
              {wedding.description && (
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    Description
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {wedding.description}
                  </p>
                </div>
              )}

              {/* Planner */}
              {wedding.planner && (
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <CheckCircleIcon className="w-6 h-6 text-green-500 mr-2" />
                    Wedding Planner
                  </h3>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-lg font-semibold text-gray-900">
                      {wedding.planner.fullName}
                    </p>
                    <p className="text-sm text-gray-600">
                      {wedding.planner.email}
                    </p>
                    <p className="text-sm text-gray-600">
                      {wedding.planner.phone}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default WeddingDetailsPage;
