import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/common/Layout";
import Loader from "../../components/common/Loader";
import weddingService from "../../services/weddingService";
import guestService from "../../services/guestService";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EnvelopeIcon,
  CheckCircleIcon,
  XCircleIcon,
  QuestionMarkCircleIcon,
} from "@heroicons/react/24/outline";

const GuestsPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [wedding, setWedding] = useState(null);
  const [guests, setGuests] = useState([]);
  const [stats, setStats] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRSVP, setFilterRSVP] = useState("");
  const [filterSide, setFilterSide] = useState("");
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [editingGuest, setEditingGuest] = useState(null);

  const [guestForm, setGuestForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    category: "friend",
    side: "partner1",
    numberOfGuests: "1",
    mealPreference: "none",
    specialRequirements: "",
    notes: "",
  });

  useEffect(() => {
    fetchData();
  }, [searchTerm, filterRSVP, filterSide]);

  const fetchData = async () => {
    try {
      const weddingsResponse = await weddingService.getMyWeddings();
      if (weddingsResponse.data.length === 0) {
        navigate("/wedding/create");
        return;
      }

      const weddingData = weddingsResponse.data[0];
      setWedding(weddingData);

      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (filterRSVP) params.rsvpStatus = filterRSVP;
      if (filterSide) params.side = filterSide;

      const guestsResponse = await guestService.getGuests(
        weddingData._id,
        params,
      );
      setGuests(guestsResponse.data);

      const statsResponse = await guestService.getGuestStats(weddingData._id);
      setStats(statsResponse.data);
    } catch (error) {
      console.error("Error fetching guests:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddGuest = async (e) => {
    e.preventDefault();
    try {
      const guestData = {
        ...guestForm,
        numberOfGuests: parseInt(guestForm.numberOfGuests),
      };

      if (editingGuest) {
        await guestService.updateGuest(editingGuest._id, guestData);
      } else {
        await guestService.addGuest(wedding._id, guestData);
      }

      setShowGuestModal(false);
      setEditingGuest(null);
      resetForm();
      fetchData();
    } catch (error) {
      console.error("Error saving guest:", error);
      alert(error.response?.data?.message || "Failed to save guest");
    }
  };

  const handleEditGuest = (guest) => {
    setEditingGuest(guest);
    setGuestForm({
      fullName: guest.fullName,
      email: guest.email || "",
      phone: guest.phone || "",
      category: guest.category,
      side: guest.side,
      numberOfGuests: guest.numberOfGuests.toString(),
      mealPreference: guest.mealPreference,
      specialRequirements: guest.specialRequirements || "",
      notes: guest.notes || "",
    });
    setShowGuestModal(true);
  };

  const handleDeleteGuest = async (guestId) => {
    if (!window.confirm("Are you sure you want to delete this guest?")) return;

    try {
      await guestService.deleteGuest(guestId);
      fetchData();
    } catch (error) {
      console.error("Error deleting guest:", error);
      alert(error.response?.data?.message || "Failed to delete guest");
    }
  };

  const handleUpdateRSVP = async (guestId, status) => {
    try {
      await guestService.updateRSVP(guestId, status);
      fetchData();
    } catch (error) {
      console.error("Error updating RSVP:", error);
      alert(error.response?.data?.message || "Failed to update RSVP");
    }
  };

  const handleSendInvitation = async (guestId) => {
    try {
      await guestService.sendInvitation(guestId);
      fetchData();
      alert("Invitation marked as sent!");
    } catch (error) {
      console.error("Error sending invitation:", error);
      alert(error.response?.data?.message || "Failed to send invitation");
    }
  };

  const resetForm = () => {
    setGuestForm({
      fullName: "",
      email: "",
      phone: "",
      category: "friend",
      side: "partner1",
      numberOfGuests: "1",
      mealPreference: "none",
      specialRequirements: "",
      notes: "",
    });
  };

  if (loading) {
    return (
      <Layout>
        <Loader />
      </Layout>
    );
  }

  const getRSVPIcon = (status) => {
    switch (status) {
      case "accepted":
        return <CheckCircleIcon className="w-5 h-5 text-green-600" />;
      case "declined":
        return <XCircleIcon className="w-5 h-5 text-red-600" />;
      case "maybe":
        return <QuestionMarkCircleIcon className="w-5 h-5 text-yellow-600" />;
      default:
        return <QuestionMarkCircleIcon className="w-5 h-5 text-gray-400" />;
    }
  };

  const getRSVPBadge = (status) => {
    const badges = {
      accepted: "bg-green-100 text-green-800",
      declined: "bg-red-100 text-red-800",
      maybe: "bg-yellow-100 text-yellow-800",
      pending: "bg-gray-100 text-gray-800",
    };
    return badges[status] || badges.pending;
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">
              Guest List
            </h1>
            <p className="text-gray-600">{wedding?.title}</p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowGuestModal(true);
            }}
            className="btn-primary flex items-center justify-center"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Add Guest
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="card text-center">
            <div className="text-2xl font-bold text-gray-900">
              {stats?.rsvpStats?.reduce(
                (sum, stat) => sum + stat.totalGuests,
                0,
              ) || 0}
            </div>
            <div className="text-sm text-gray-600">Total Guests</div>
          </div>
          <div className="card text-center bg-green-50">
            <div className="text-2xl font-bold text-green-600">
              {stats?.rsvpStats?.find((s) => s._id === "accepted")
                ?.totalGuests || 0}
            </div>
            <div className="text-sm text-gray-600">Accepted</div>
          </div>
          <div className="card text-center bg-red-50">
            <div className="text-2xl font-bold text-red-600">
              {stats?.rsvpStats?.find((s) => s._id === "declined")
                ?.totalGuests || 0}
            </div>
            <div className="text-sm text-gray-600">Declined</div>
          </div>
          <div className="card text-center bg-yellow-50">
            <div className="text-2xl font-bold text-yellow-600">
              {stats?.rsvpStats?.find((s) => s._id === "maybe")?.totalGuests ||
                0}
            </div>
            <div className="text-sm text-gray-600">Maybe</div>
          </div>
          <div className="card text-center bg-gray-50">
            <div className="text-2xl font-bold text-gray-600">
              {stats?.rsvpStats?.find((s) => s._id === "pending")
                ?.totalGuests || 0}
            </div>
            <div className="text-sm text-gray-600">Pending</div>
          </div>
        </div>

        {/* Filters */}
        <div className="card">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search guests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>

            <div className="relative">
              <FunnelIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                value={filterRSVP}
                onChange={(e) => setFilterRSVP(e.target.value)}
                className="input-field pl-10"
              >
                <option value="">All RSVP Status</option>
                <option value="accepted">Accepted</option>
                <option value="declined">Declined</option>
                <option value="maybe">Maybe</option>
                <option value="pending">Pending</option>
              </select>
            </div>

            <div className="relative">
              <FunnelIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                value={filterSide}
                onChange={(e) => setFilterSide(e.target.value)}
                className="input-field pl-10"
              >
                <option value="">All Sides</option>
                <option value="partner1">Partner 1</option>
                <option value="partner2">Partner 2</option>
                <option value="mutual">Mutual</option>
              </select>
            </div>
          </div>
        </div>

        {/* Guests Table */}
        <div className="card">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            All Guests ({guests.length})
          </h3>
          {guests.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>No guests found.</p>
              <button
                onClick={() => {
                  resetForm();
                  setShowGuestModal(true);
                }}
                className="btn-primary mt-4"
              >
                Add Your First Guest
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                      Name
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                      Contact
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900">
                      Side
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900">
                      Guests
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900">
                      Meal
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900">
                      RSVP
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {guests.map((guest) => (
                    <tr key={guest._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-gray-900">
                          {guest.fullName}
                        </div>
                        <div className="text-xs text-gray-500 capitalize">
                          {guest.category}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-900">
                          {guest.email}
                        </div>
                        <div className="text-xs text-gray-500">
                          {guest.phone}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 capitalize">
                          {guest.side.replace("partner", "P")}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center text-sm">
                        {guest.numberOfGuests}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800 uppercase">
                          {guest.mealPreference}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center space-x-2">
                          <select
                            value={guest.rsvpStatus}
                            onChange={(e) =>
                              handleUpdateRSVP(guest._id, e.target.value)
                            }
                            className={`text-xs font-semibold rounded-full px-3 py-1 border-0 ${getRSVPBadge(
                              guest.rsvpStatus,
                            )}`}
                          >
                            <option value="pending">Pending</option>
                            <option value="accepted">Accepted</option>
                            <option value="declined">Declined</option>
                            <option value="maybe">Maybe</option>
                          </select>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center space-x-2">
                          {!guest.invitationSent && (
                            <button
                              onClick={() => handleSendInvitation(guest._id)}
                              className="text-primary-600 hover:text-primary-700"
                              title="Send Invitation"
                            >
                              <EnvelopeIcon className="w-5 h-5" />
                            </button>
                          )}
                          <button
                            onClick={() => handleEditGuest(guest)}
                            className="text-blue-600 hover:text-blue-700"
                            title="Edit"
                          >
                            <PencilIcon className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteGuest(guest._id)}
                            className="text-red-600 hover:text-red-700"
                            title="Delete"
                          >
                            <TrashIcon className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Guest Modal */}
      {showGuestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full my-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              {editingGuest ? "Edit Guest" : "Add New Guest"}
            </h3>
            <form onSubmit={handleAddGuest} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="label">Full Name *</label>
                  <input
                    type="text"
                    value={guestForm.fullName}
                    onChange={(e) =>
                      setGuestForm({ ...guestForm, fullName: e.target.value })
                    }
                    className="input-field"
                    placeholder="John Doe"
                    required
                  />
                </div>

                <div>
                  <label className="label">Email</label>
                  <input
                    type="email"
                    value={guestForm.email}
                    onChange={(e) =>
                      setGuestForm({ ...guestForm, email: e.target.value })
                    }
                    className="input-field"
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <label className="label">Phone</label>
                  <input
                    type="tel"
                    value={guestForm.phone}
                    onChange={(e) =>
                      setGuestForm({ ...guestForm, phone: e.target.value })
                    }
                    className="input-field"
                    placeholder="1234567890"
                  />
                </div>

                <div>
                  <label className="label">Category *</label>
                  <select
                    value={guestForm.category}
                    onChange={(e) =>
                      setGuestForm({ ...guestForm, category: e.target.value })
                    }
                    className="input-field"
                    required
                  >
                    <option value="family">Family</option>
                    <option value="friend">Friend</option>
                    <option value="colleague">Colleague</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="label">Side *</label>
                  <select
                    value={guestForm.side}
                    onChange={(e) =>
                      setGuestForm({ ...guestForm, side: e.target.value })
                    }
                    className="input-field"
                    required
                  >
                    <option value="partner1">Partner 1</option>
                    <option value="partner2">Partner 2</option>
                    <option value="mutual">Mutual</option>
                  </select>
                </div>

                <div>
                  <label className="label">Number of Guests *</label>
                  <input
                    type="number"
                    value={guestForm.numberOfGuests}
                    onChange={(e) =>
                      setGuestForm({
                        ...guestForm,
                        numberOfGuests: e.target.value,
                      })
                    }
                    className="input-field"
                    min="1"
                    required
                  />
                </div>

                <div>
                  <label className="label">Meal Preference</label>
                  <select
                    value={guestForm.mealPreference}
                    onChange={(e) =>
                      setGuestForm({
                        ...guestForm,
                        mealPreference: e.target.value,
                      })
                    }
                    className="input-field"
                  >
                    <option value="none">None</option>
                    <option value="veg">Vegetarian</option>
                    <option value="non-veg">Non-Vegetarian</option>
                    <option value="vegan">Vegan</option>
                    <option value="jain">Jain</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="label">Special Requirements</label>
                  <textarea
                    value={guestForm.specialRequirements}
                    onChange={(e) =>
                      setGuestForm({
                        ...guestForm,
                        specialRequirements: e.target.value,
                      })
                    }
                    className="input-field"
                    rows="2"
                    placeholder="Allergies, accessibility needs, etc."
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="label">Notes</label>
                  <textarea
                    value={guestForm.notes}
                    onChange={(e) =>
                      setGuestForm({ ...guestForm, notes: e.target.value })
                    }
                    className="input-field"
                    rows="2"
                    placeholder="Additional notes..."
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowGuestModal(false);
                    setEditingGuest(null);
                    resetForm();
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingGuest ? "Update Guest" : "Add Guest"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default GuestsPage;
