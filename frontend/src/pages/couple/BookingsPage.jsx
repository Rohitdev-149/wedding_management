import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/common/Layout";
import Loader from "../../components/common/Loader";
import weddingService from "../../services/weddingService";
import bookingService from "../../services/bookingService";
import { formatCurrency, formatDate } from "../../utils/formatters";
import {
  PlusIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

const BookingsPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [wedding, setWedding] = useState(null);
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const weddingsResponse = await weddingService.getMyWeddings();
      if (weddingsResponse.data.length === 0) {
        navigate("/wedding/create");
        return;
      }

      const weddingData = weddingsResponse.data[0];
      setWedding(weddingData);

      const bookingsResponse = await bookingService.getWeddingBookings(
        weddingData._id,
      );
      setBookings(bookingsResponse.data);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking?"))
      return;

    try {
      await bookingService.cancelBooking(bookingId, "Changed plans");
      fetchData();
    } catch (error) {
      console.error("Error cancelling booking:", error);
      alert(error.response?.data?.message || "Failed to cancel booking");
    }
  };

  if (loading) {
    return (
      <Layout>
        <Loader />
      </Layout>
    );
  }

  const getStatusBadge = (status) => {
    const badges = {
      pending: "bg-yellow-100 text-yellow-800",
      confirmed: "bg-green-100 text-green-800",
      completed: "bg-blue-100 text-blue-800",
      cancelled: "bg-red-100 text-red-800",
      declined: "bg-gray-100 text-gray-800",
    };
    return badges[status] || badges.pending;
  };

  const getPaymentBadge = (status) => {
    const badges = {
      pending: "bg-red-100 text-red-800",
      partial: "bg-yellow-100 text-yellow-800",
      completed: "bg-green-100 text-green-800",
      refunded: "bg-gray-100 text-gray-800",
    };
    return badges[status] || badges.pending;
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">
              Vendor Bookings
            </h1>
            <p className="text-gray-600">{wedding?.title}</p>
          </div>
          <button
            onClick={() => navigate("/vendors")}
            className="btn-primary flex items-center"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Find Vendors
          </button>
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

        {/* Bookings List */}
        <div className="card">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">
            All Bookings
          </h3>
          {bookings.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <ClockIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p>No bookings yet.</p>
              <button
                onClick={() => navigate("/vendors")}
                className="btn-primary mt-4"
              >
                Browse Vendors
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <div
                  key={booking._id}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="text-lg font-semibold text-gray-900">
                          {booking.service}
                        </h4>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(booking.status)}`}
                        >
                          {booking.status}
                        </span>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${getPaymentBadge(booking.paymentStatus)}`}
                        >
                          {booking.paymentStatus}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                        <div>
                          <span className="font-semibold">Vendor:</span>{" "}
                          {booking.vendor?.fullName || "N/A"}
                        </div>
                        <div>
                          <span className="font-semibold">Service Date:</span>{" "}
                          {formatDate(booking.serviceDate)}
                        </div>
                        <div>
                          <span className="font-semibold">Amount:</span>{" "}
                          {formatCurrency(booking.amount)}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="space-y-1">
                          <div className="text-gray-600">
                            <span className="font-semibold">Advance Paid:</span>{" "}
                            {formatCurrency(booking.advancePaid)}
                          </div>
                          <div className="text-gray-600">
                            <span className="font-semibold">Remaining:</span>{" "}
                            {formatCurrency(booking.remainingPayment || 0)}
                          </div>
                        </div>
                        {booking.bookingDetails && (
                          <div className="text-gray-600">
                            <span className="font-semibold">Details:</span>{" "}
                            {booking.bookingDetails}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="ml-4">
                      {booking.status === "pending" && (
                        <button
                          onClick={() => handleCancelBooking(booking._id)}
                          className="text-red-600 hover:text-red-700 text-sm font-semibold"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default BookingsPage;
