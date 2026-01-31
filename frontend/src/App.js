import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import PrivateRoute from "./components/common/PrivateRoute";
import { ROLES } from "./utils/constants";
import Loader from "./components/common/Loader";

// Lazy load all pages to reduce initial bundle size
const LandingPage = lazy(() => import("./pages/LandingPage"));
const Login = lazy(() => import("./pages/auth/Login"));
const Register = lazy(() => import("./pages/auth/Register"));
const ForgotPassword = lazy(() => import("./pages/auth/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/auth/ResetPassword"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Unauthorized = lazy(() => import("./pages/Unauthorized"));
const WeddingDetailsPage = lazy(
  () => import("./pages/couple/WeddingDetailsPage"),
);
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const CreateWedding = lazy(() => import("./pages/couple/CreateWedding"));
const BudgetPage = lazy(() => import("./pages/couple/BudgetPage"));
const GuestsPage = lazy(() => import("./pages/couple/GuestsPage"));
const TimelinePage = lazy(() => import("./pages/couple/TimelinePage"));
const VendorsPage = lazy(() => import("./pages/couple/VendorsPage"));
const BookingsPage = lazy(() => import("./pages/couple/BookingsPage"));
const VendorBookingsPage = lazy(
  () => import("./pages/vendor/VendorBookingsPage"),
);

// Loading fallback component
const PageLoader = () => <Loader fullScreen />;

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen">
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route
                path="/reset-password/:resetToken"
                element={<ResetPassword />}
              />
              <Route path="/unauthorized" element={<Unauthorized />} />

              {/* Protected Routes - All Roles */}
              <Route
                path="/dashboard"
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                }
              />

              {/* Couple Routes */}
              <Route
                path="/wedding/create"
                element={
                  <PrivateRoute roles={[ROLES.COUPLE]}>
                    <CreateWedding />
                  </PrivateRoute>
                }
              />
              <Route
                path="/budget"
                element={
                  <PrivateRoute
                    roles={[ROLES.COUPLE, ROLES.PLANNER, ROLES.ADMIN]}
                  >
                    <BudgetPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/guests"
                element={
                  <PrivateRoute
                    roles={[ROLES.COUPLE, ROLES.PLANNER, ROLES.ADMIN]}
                  >
                    <GuestsPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/timeline"
                element={
                  <PrivateRoute
                    roles={[ROLES.COUPLE, ROLES.PLANNER, ROLES.ADMIN]}
                  >
                    <TimelinePage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/vendors"
                element={
                  <PrivateRoute roles={[ROLES.COUPLE]}>
                    <VendorsPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/bookings"
                element={
                  <PrivateRoute
                    roles={[ROLES.COUPLE, ROLES.PLANNER, ROLES.ADMIN]}
                  >
                    <BookingsPage />
                  </PrivateRoute>
                }
              />

              {/* Vendor Routes */}
              <Route
                path="/vendor/bookings"
                element={
                  <PrivateRoute roles={[ROLES.VENDOR]}>
                    <VendorBookingsPage />
                  </PrivateRoute>
                }
              />

              {/* Wedding Details Page */}
              <Route
                path="/wedding"
                element={
                  <PrivateRoute
                    roles={[ROLES.COUPLE, ROLES.PLANNER, ROLES.ADMIN]}
                  >
                    <WeddingDetailsPage />
                  </PrivateRoute>
                }
              />

              {/* Profile Page - All Roles */}
              <Route
                path="/profile"
                element={
                  <PrivateRoute>
                    <ProfilePage />
                  </PrivateRoute>
                }
              />

              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
