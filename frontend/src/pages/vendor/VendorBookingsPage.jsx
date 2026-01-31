import React, { useState, useEffect } from "react";
import Layout from "../../components/common/Layout";
import Loader from "../../components/common/Loader";
import bookingService from "../../services/bookingService";
import { formatCurrency, formatDate } from "../../utils/formatters";

const VendorBookingsPage = () => {
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    fetchBookings();
  }, [filter]);

  const fetchBookings = async () => {
    try {
      const params = filter ? { status: filter } : {};
      const response = await bookingService.getVendorBookings(params);
      setBookings(response.data);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (bookingId, status) => {
    try {
      await bookingService.updateBookingStatus(bookingId, status);
      fetchBookings();
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

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">
            My Bookings
          </h1>
          <p className="text-gray-600">Manage your booking requests</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="card">
            <div className="text-2xl font-bold text-gray-900">
              {bookings.length}
            </div>
            <div className="text-sm text-gray-600">Total Bookings</div>
          </div>
          <div className="card bg-yellow-50">
            <div className="text-2xl font-bold text-yellow-600">
              {bookings.filter((b) => b.status === "pending").length}
            </div>
            <div className="text-sm text-gray-600">Pending</div>
          </div>
          <div className="card bg-green-50">
            <div className="text-2xl font-bold text-green-600">
              {bookings.filter((b) => b.status === "confirmed").length}
            </div>
            <div className="text-sm text-gray-600">Confirmed</div>
          </div>
          <div className="card bg-blue-50">
            <div className="text-2xl font-bold text-blue-600">
              {bookings.filter((b) => b.status === "completed").length}
            </div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
        </div>

        {/* Filter */}
        <div className="card">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="input-field max-w-xs"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Bookings */}
        <div className="space-y-4">
          {bookings.length === 0 ? (
            <div className="card text-center py-12 text-gray-500">
              No bookings found.
            </div>
          ) : (
            bookings.map((booking) => (
              <div key={booking._id} className="card">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {booking.service}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {booking.wedding?.title}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      booking.status === "confirmed"
                        ? "bg-green-100 text-green-800"
                        : booking.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {booking.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-4">
                  <div>
                    <span className="text-gray-600">Client:</span>{" "}
                    <span className="font-semibold">
                      {booking.couple?.fullName}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Date:</span>{" "}
                    <span className="font-semibold">
                      {formatDate(booking.serviceDate)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Amount:</span>{" "}
                    <span className="font-semibold">
                      {formatCurrency(booking.amount)}
                    </span>
                  </div>
                </div>

                {booking.status === "pending" && (
                  <div className="flex space-x-4 pt-4 border-t border-gray-200">
                    <button
                      onClick={() =>
                        handleUpdateStatus(booking._id, "confirmed")
                      }
                      className="btn-primary flex-1"
                    >
                      Confirm Booking
                    </button>
                    <button
                      onClick={() =>
                        handleUpdateStatus(booking._id, "declined")
                      }
                      className="btn-secondary flex-1"
                    >
                      Decline
                    </button>
                  </div>
                )}

                {booking.status === "confirmed" && (
                  <button
                    onClick={() => handleUpdateStatus(booking._id, "completed")}
                    className="btn-primary w-full mt-4"
                  >
                    Mark as Completed
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
};

export default VendorBookingsPage;
