import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { HeartIcon } from "@heroicons/react/24/outline";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    setApiError("");
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
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
      await login(formData);
      navigate("/dashboard");
    } catch (error) {
      setApiError(
        error.response?.data?.message || "Login failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-surface-50">
      <div className="hidden lg:flex lg:w-1/2 bg-primary-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary-700/30" aria-hidden />
        <div className="relative z-10 flex flex-col justify-center items-center text-white p-12 max-w-md mx-auto">
          <HeartIcon className="w-16 h-16 mb-6 text-primary-200" aria-hidden />
          <h1 className="text-3xl font-serif font-bold text-center">
            Welcome back
          </h1>
          <p className="mt-3 text-center text-primary-100">
            Sign in to continue planning your wedding.
          </p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2">
              <HeartIcon className="w-8 h-8 text-primary-600" aria-hidden />
              <span className="text-xl font-serif font-semibold text-gray-900">
                Wedding Planner
              </span>
            </Link>
          </div>

          <div className="card shadow-elevation-2">
            <div className="mb-6">
              <h2 className="text-2xl font-serif font-bold text-gray-900">
                Sign in
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                Enter your credentials to continue
              </p>
            </div>

            {apiError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-700 text-sm rounded-xl" role="alert">
                {apiError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="label">Email</label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                  className={`input-field ${errors.email ? "border-red-400 focus:ring-red-500/20 focus:border-red-500" : ""}`}
                  placeholder="you@example.com"
                />
                {errors.email && (
                  <p className="mt-1.5 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="label">Password</label>
                <input
                  id="password"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  className={`input-field ${errors.password ? "border-red-400 focus:ring-red-500/20 focus:border-red-500" : ""}`}
                  placeholder="••••••••"
                />
                {errors.password && (
                  <p className="mt-1.5 text-sm text-red-600">{errors.password}</p>
                )}
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-gray-600">Remember me</span>
                </label>
                <Link
                  to="/forgot-password"
                  className="text-primary-600 hover:text-primary-700 font-medium"
                >
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="loader w-5 h-5 border-2" />
                    Signing in…
                  </span>
                ) : (
                  "Sign in"
                )}
              </button>

              <p className="text-center text-sm text-gray-600">
                Don&apos;t have an account?{" "}
                <Link to="/register" className="font-medium text-primary-600 hover:text-primary-700">
                  Sign up
                </Link>
              </p>
            </form>
          </div>

          <p className="mt-6 text-center">
            <Link to="/" className="text-sm text-gray-500 hover:text-gray-700">
              ← Back to home
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
