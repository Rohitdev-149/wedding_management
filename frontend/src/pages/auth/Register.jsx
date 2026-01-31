import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  HeartIcon,
  UserGroupIcon,
  UserIcon,
} from "@heroicons/react/24/outline";

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [step, setStep] = useState(1); // 1: Choose Role, 2: Registration Form
  const [selectedRole, setSelectedRole] = useState("");

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "",
    // Vendor specific
    businessName: "",
    category: "",
    description: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showVendorDetails, setShowVendorDetails] = useState(true);
  const [apiError, setApiError] = useState("");

  const roles = [
    {
      value: "couple",
      title: "Couple",
      description:
        "Plan your wedding, manage guests, budget, and book vendors together",
      icon: <UserGroupIcon className="w-12 h-12" />,
    },
    {
      value: "vendor",
      title: "Vendor",
      description:
        "Offer your services such as photography, catering, decoration, and more",
      icon: <UserIcon className="w-12 h-12" />,
    },
  ];

  const vendorCategories = [
    { value: "photography", label: "Photography" },
    { value: "catering", label: "Catering" },
    { value: "decoration", label: "Decoration" },
    { value: "venue", label: "Venue" },
    { value: "music", label: "Music" },
    { value: "makeup", label: "Makeup" },
    { value: "other", label: "Other" },
  ];

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setFormData((prev) => ({ ...prev, role }));
    setShowVendorDetails(role === "vendor");
    setStep(2);
  };

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

    if (!formData.fullName) {
      newErrors.fullName = "Full name is required";
    }

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.phone) {
      newErrors.phone = "Phone number is required";
    } else if (!/^[0-9]{10,15}$/.test(formData.phone)) {
      newErrors.phone = "Phone number is invalid";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (selectedRole === "vendor") {
      if (!formData.businessName) {
        newErrors.businessName = "Business name is required";
      }
      if (!formData.category) {
        newErrors.category = "Category is required";
      }
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
      const userData = {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: formData.role,
      };

      if (selectedRole === "vendor") {
        userData.vendorDetails = {
          businessName: formData.businessName,
          category: formData.category,
          description: formData.description,
        };
      }

      await register(userData);
      navigate("/dashboard");
    } catch (error) {
      setApiError(
        error.response?.data?.message ||
          "Registration failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-500 to-rose-500 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>
        <div className="relative z-10 flex flex-col justify-center items-center text-white p-12">
          <HeartIcon className="w-24 h-24 mb-8" />
          <h1 className="text-5xl font-serif font-bold mb-4 text-center">
            Join Now and Start Planning!
          </h1>
          <p className="text-xl text-center text-white/90">
            Join now and start planning your perfect wedding
          </p>
        </div>
      </div>

      {/* Right Side - Registration Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 min-h-screen">
        <div className="w-full max-w-2xl h-full flex items-center justify-center">
          <div className="w-full">
            {/* Logo for Mobile */}
            <div className="lg:hidden text-center mb-8">
              <Link to="/" className="inline-flex items-center space-x-2">
                <HeartIcon className="w-10 h-10 text-primary-500" />
                <span className="text-3xl font-serif font-bold text-primary-600">
                  Wedding Planner
                </span>
              </Link>
            </div>

            <div className="card">
              {step === 1 ? (
                <>
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-serif font-bold text-gray-900 mb-2">
                      Get Started
                    </h2>
                    <p className="text-gray-600">
                      Choose your role to get started
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {roles.map((role) => (
                      <button
                        key={role.value}
                        onClick={() => handleRoleSelect(role.value)}
                        className="card hover:shadow-2xl transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-primary-400 text-left"
                      >
                        <div className="text-primary-500 mb-4">{role.icon}</div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          {role.title}
                        </h3>
                        <p className="text-gray-600 text-sm">
                          {role.description}
                        </p>
                      </button>
                    ))}
                  </div>

                  <div className="mt-8 text-center">
                    <p className="text-gray-600">
                      Already have an account?{" "}
                      <Link
                        to="/login"
                        className="text-primary-600 font-semibold hover:text-primary-700"
                      >
                        Login
                      </Link>
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-center mb-8 sm:col-span-2">
                    <h2 className="text-3xl font-serif font-bold text-gray-900 mb-2">
                      Sign Up and Create Your Account
                    </h2>
                    <p className="text-gray-600">
                      Creating account as{" "}
                      <span className="font-semibold text-primary-600">
                        {selectedRole === "couple" ? "Couple" : "Vendor"}
                      </span>
                    </p>
                    <button
                      onClick={() => setStep(1)}
                      className="text-sm text-primary-600 hover:text-primary-700 mt-2"
                    >
                      Change role
                    </button>
                  </div>

                  {apiError && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg sm:col-span-2">
                      {apiError}
                    </div>
                  )}

                  <form
                    onSubmit={handleSubmit}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                    role="form"
                    aria-label="Registration Form"
                    autoComplete="on"
                  >
                    <div>
                      <label className="label">Full Name</label>
                      <input
                        type="text"
                        name="fullName"
                        autoComplete="name"
                        value={formData.fullName}
                        onChange={handleChange}
                        className={`input-field ${
                          errors.fullName ? "border-red-500" : ""
                        }`}
                        placeholder="Enter your full name"
                      />
                      {errors.fullName && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.fullName}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="label">Email</label>
                      <input
                        type="email"
                        name="email"
                        autoComplete="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`input-field ${
                          errors.email ? "border-red-500" : ""
                        }`}
                        placeholder="Enter your email"
                      />
                      {errors.email && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.email}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="label">Phone Number</label>
                      <input
                        type="tel"
                        name="phone"
                        inputMode="tel"
                        autoComplete="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        className={`input-field ${
                          errors.phone ? "border-red-500" : ""
                        }`}
                        placeholder="Enter your phone number"
                      />
                      {errors.phone && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.phone}
                        </p>
                      )}
                    </div>

                    {selectedRole === "vendor" && (
                      <>
                        <div className="sm:col-span-2 md:hidden flex justify-end">
                          <button
                            type="button"
                            onClick={() =>
                              setShowVendorDetails(!showVendorDetails)
                            }
                            className="text-sm text-primary-600"
                          >
                            {showVendorDetails
                              ? "Hide vendor details"
                              : "Show vendor details"}
                          </button>
                        </div>

                        <div
                          className={`${showVendorDetails ? "" : "hidden"} sm:col-span-2`}
                        >
                          <div>
                            <label className="label">Business Name</label>
                            <input
                              type="text"
                              name="businessName"
                              autoComplete="organization"
                              value={formData.businessName}
                              onChange={handleChange}
                              className={`input-field ${errors.businessName ? "border-red-500" : ""}`}
                              placeholder="Enter your business name"
                            />
                            {errors.businessName && (
                              <p className="mt-1 text-sm text-red-600">
                                {errors.businessName}
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="label">Category</label>
                            <select
                              name="category"
                              value={formData.category}
                              onChange={handleChange}
                              className={`input-field ${errors.category ? "border-red-500" : ""}`}
                            >
                              <option value="">Select category</option>
                              {vendorCategories.map((cat) => (
                                <option key={cat.value} value={cat.value}>
                                  {cat.label}
                                </option>
                              ))}
                            </select>
                            {errors.category && (
                              <p className="mt-1 text-sm text-red-600">
                                {errors.category}
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="label">
                              Description (Optional)
                            </label>
                            <textarea
                              name="description"
                              value={formData.description}
                              onChange={handleChange}
                              className="input-field"
                              rows="3"
                              placeholder="Brief description of your services"
                            />
                          </div>
                        </div>
                      </>
                    )}

                    <div>
                      <label className="label">Password</label>
                      <input
                        type="password"
                        name="password"
                        autoComplete="new-password"
                        value={formData.password}
                        onChange={handleChange}
                        className={`input-field ${
                          errors.password ? "border-red-500" : ""
                        }`}
                        placeholder="Create a password"
                      />
                      {errors.password && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.password}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="label">Confirm Password</label>
                      <input
                        type="password"
                        name="confirmPassword"
                        autoComplete="new-password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className={`input-field ${
                          errors.confirmPassword ? "border-red-500" : ""
                        }`}
                        placeholder="Confirm your password"
                      />
                      {errors.confirmPassword && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.confirmPassword}
                        </p>
                      )}
                    </div>

                    <div className="flex items-start sm:col-span-2">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 mt-1"
                        required
                      />
                      <label className="ml-2 text-sm text-gray-600">
                        I agree to the{" "}
                        <a
                          href="#"
                          className="text-primary-600 hover:text-primary-700"
                        >
                          Terms of Service
                        </a>{" "}
                        and{" "}
                        <a
                          href="#"
                          className="text-primary-600 hover:text-primary-700"
                        >
                          Privacy Policy
                        </a>
                      </label>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="btn-primary w-full sm:col-span-2"
                    >
                      {loading ? (
                        <div className="flex items-center justify-center">
                          <div className="loader mr-2"></div>
                          Creating account...
                        </div>
                      ) : (
                        "Sign Up"
                      )}
                    </button>
                  </form>

                  <div className="mt-6 text-center sm:col-span-2">
                    <p className="text-gray-600">
                      Already have an account?{" "}
                      <Link
                        to="/login"
                        className="text-primary-600 font-semibold hover:text-primary-700"
                      >
                        Login
                      </Link>
                    </p>
                  </div>
                </>
              )}
            </div>

            <div className="mt-6 text-center">
              <Link to="/" className="text-gray-600 hover:text-primary-600">
                ← Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
