import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import Layout from "../components/common/Layout";
import Loader from "../components/common/Loader";
import PageHeader from "../components/common/PageHeader";
import EmptyState from "../components/common/EmptyState";
import weddingService from "../services/weddingService";
import {
  calculateDaysUntil,
  formatDate,
  formatCurrency,
} from "../utils/formatters";
import {
  HeartIcon,
  UsersIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [myWeddings, setMyWeddings] = useState([]);

  useEffect(() => {
    if (user?.role === "couple") {
      fetchMyWeddings();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchMyWeddings = async () => {
    try {
      const response = await weddingService.getMyWeddings();
      setMyWeddings(response.data);
    } catch (error) {
      console.error("Error fetching weddings:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <Loader />
      </Layout>
    );
  }

  // COUPLE DASHBOARD
  if (user?.role === "couple") {
    const hasWedding = myWeddings.length > 0;
    const wedding = myWeddings[0]; // Assuming one wedding per couple

    if (!hasWedding) {
      return (
        <Layout>
          <div className="max-w-xl mx-auto">
            <EmptyState
              icon="💒"
              title="Welcome to your wedding journey"
              description="Create your wedding to start planning guests, budget, timeline, and vendors."
              action={
                <Link to="/wedding/create" className="btn-primary">
                  Create your wedding
                </Link>
              }
            />
          </div>
        </Layout>
      );
    }

    const daysUntil = calculateDaysUntil(wedding.weddingDate);

    return (
      <Layout>
        <div className="space-y-8">
          <PageHeader
            title={`Welcome back, ${user.fullName}`}
            subtitle="Here’s your wedding at a glance"
            action={
              <Link to="/" className="btn-secondary hidden sm:inline-flex">
                Home
              </Link>
            }
          />

          <div className="card bg-primary-600 text-white border-0 shadow-elevation-2">
            <div className="text-center py-2">
              <h2 className="text-xl font-serif font-bold">{wedding.title}</h2>
              <p className="text-primary-100 mt-1 mb-6">
                {formatDate(wedding.weddingDate)} • {wedding.venue?.name || "—"}
              </p>
              <div className="inline-flex items-center gap-4 bg-white/10 rounded-xl px-6 py-4">
                <span className="text-4xl font-bold tabular-nums">{daysUntil}</span>
                <span className="text-sm text-primary-100">Days to go</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link to="/guests" className="card-interactive">
              <div className="flex items-center justify-between mb-4">
                <UsersIcon className="w-8 h-8 text-primary-500" />
              </div>
              <div className="text-3xl font-bold text-gray-900">
                {wedding.guestCount.confirmed || 0}
                <span className="text-lg text-gray-500">
                  /{wedding.guestCount.expected || 0}
                </span>
              </div>
              <div className="text-sm text-gray-600">Guests Confirmed</div>
            </Link>

            <Link to="/budget" className="card-interactive">
              <div className="flex items-center justify-between mb-4">
                <CurrencyDollarIcon className="w-8 h-8 text-green-500" />
              </div>
              <div className="text-3xl font-bold text-gray-900">
                {formatCurrency(0)}
              </div>
              <div className="text-sm text-gray-600">Budget Spent</div>
            </Link>

            <Link to="/timeline" className="card-interactive">
              <div className="flex items-center justify-between mb-4">
                <CalendarIcon className="w-8 h-8 text-blue-500" />
              </div>
              <div className="text-3xl font-bold text-gray-900">0</div>
              <div className="text-sm text-gray-600">Events Planned</div>
            </Link>

            <Link to="/bookings" className="card-interactive">
              <div className="flex items-center justify-between mb-4">
                <ClockIcon className="w-8 h-8 text-purple-500" />
              </div>
              <div className="text-3xl font-bold text-gray-900">0</div>
              <div className="text-sm text-gray-600">Vendors Booked</div>
            </Link>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick actions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Link
                to="/guests/add"
                className="p-4 border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-colors text-center"
              >
                <UsersIcon className="w-8 h-8 text-primary-600 mx-auto mb-2" aria-hidden />
                <span className="font-medium text-gray-900">Add guests</span>
              </Link>
              <Link
                to="/budget"
                className="p-4 border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-colors text-center"
              >
                <CurrencyDollarIcon className="w-8 h-8 text-primary-600 mx-auto mb-2" aria-hidden />
                <span className="font-medium text-gray-900">Set budget</span>
              </Link>
              <Link
                to="/vendors"
                className="p-4 border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-colors text-center"
              >
                <ClockIcon className="w-8 h-8 text-primary-600 mx-auto mb-2" aria-hidden />
                <span className="font-medium text-gray-900">Find vendors</span>
              </Link>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (user?.role === "vendor") {
    return (
      <Layout>
        <div className="space-y-8">
          <PageHeader
            title={`Welcome back, ${user.fullName}`}
            subtitle={user.vendorDetails?.businessName || "Vendor dashboard"}
            action={
              <Link to="/" className="btn-secondary hidden sm:inline-flex">
                Home
              </Link>
            }
          />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="card">
              <div className="text-2xl font-bold text-gray-900">0</div>
              <div className="text-sm text-gray-500 mt-1">Pending requests</div>
            </div>
            <div className="card">
              <div className="text-2xl font-bold text-gray-900">0</div>
              <div className="text-sm text-gray-500 mt-1">Confirmed bookings</div>
            </div>
            <div className="card">
              <div className="text-2xl font-bold text-gray-900">
                {user.vendorDetails?.rating ?? 0}/5
              </div>
              <div className="text-sm text-gray-500 mt-1">Your rating</div>
            </div>
          </div>
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent bookings</h3>
            <EmptyState
              icon="📋"
              title="No bookings yet"
              description="Complete your profile and get discovered by couples."
              action={
                <Link to="/profile" className="btn-primary">
                  Edit profile
                </Link>
              }
            />
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-xl mx-auto">
        <EmptyState
          icon="✨"
          title="Dashboard coming soon"
          description={`Your ${user?.role} dashboard is being built.`}
          action={
            <Link to="/" className="btn-primary">
              Back to home
            </Link>
          }
        />
      </div>
    </Layout>
  );
};

export default Dashboard;
