import React, { useState, useEffect } from "react";
import Layout from "../components/common/Layout";
import { useAuth } from "../context/AuthContext";
import authService from "../services/authService";
import vendorService from "../services/vendorService";
import {
  UserCircleIcon,
  EnvelopeIcon,
  PhoneIcon,
  KeyIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [profileForm, setProfileForm] = useState({
    fullName: user?.fullName || "",
    phone: user?.phone || "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [vendorForm, setVendorForm] = useState({
    businessName: user?.vendorDetails?.businessName || "",
    category: user?.vendorDetails?.category || "",
    description: user?.vendorDetails?.description || "",
    images: user?.vendorDetails?.images || [],
  });
  const [uploadingImages, setUploadingImages] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileForm({ fullName: user.fullName || "", phone: user.phone || "" });
      setVendorForm({
        businessName: user.vendorDetails?.businessName || "",
        category: user.vendorDetails?.category || "",
        description: user.vendorDetails?.description || "",
        images: user.vendorDetails?.images || [],
      });
    }
  }, [user?._id]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const updateData = {
        fullName: profileForm.fullName,
        phone: profileForm.phone,
      };

      if (user?.role === "vendor") {
        updateData.vendorDetails = {
          businessName: vendorForm.businessName,
          category: vendorForm.category,
          description: vendorForm.description,
          images: Array.isArray(vendorForm.images) ? vendorForm.images : [],
        };
      }

      const response = await authService.updateProfile(updateData);
      updateUser(response.data);
      setIsEditingProfile(false);
      setSuccessMessage("Profile updated successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || "Failed to update profile",
      );
      setTimeout(() => setErrorMessage(""), 3000);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setSuccessMessage("");
    setErrorMessage("");

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setErrorMessage("New passwords do not match");
      setTimeout(() => setErrorMessage(""), 3000);
      return;
    }

    try {
      await authService.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setIsChangingPassword(false);
      setSuccessMessage("Password changed successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || "Failed to change password",
      );
      setTimeout(() => setErrorMessage(""), 3000);
    }
  };

  const handleUploadImages = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !user?._id) return;

    const maxImages = 200;
    if ((vendorForm.images?.length || 0) + files.length > maxImages) {
      setErrorMessage(
        `You can upload up to ${maxImages} images. Please select fewer files.`,
      );
      setTimeout(() => setErrorMessage(""), 3000);
      return;
    }

    try {
      setUploadingImages(true);
      setErrorMessage("");
      const res = await vendorService.uploadVendorImages(user._id, files);
      const updatedImages = res.data?.data?.images || res.data?.images || [];
      setVendorForm((prev) => ({ ...prev, images: updatedImages }));
      updateUser({
        ...user,
        vendorDetails: {
          ...(user?.vendorDetails || {}),
          images: updatedImages,
        },
      });
      setSuccessMessage("Images uploaded successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      const errMsg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Image upload failed";
      setErrorMessage(errMsg);
      setTimeout(() => setErrorMessage(""), 5000);
    } finally {
      setUploadingImages(false);
      e.target.value = "";
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">
            Profile Settings
          </h1>
          <p className="text-gray-600">Manage your account information</p>
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="p-4 bg-green-50 border border-green-200 text-green-600 rounded-lg flex items-center">
            <CheckCircleIcon className="w-5 h-5 mr-2" />
            {successMessage}
          </div>
        )}
        {errorMessage && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
            {errorMessage}
          </div>
        )}

        {/* Profile Information */}
        <div className="card">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-900">
              Profile Information
            </h3>
            {!isEditingProfile && (
              <button
                onClick={() => setIsEditingProfile(true)}
                className="btn-primary"
              >
                Edit Profile
              </button>
            )}
          </div>

          {isEditingProfile ? (
            <form onSubmit={handleProfileUpdate} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="label">Full Name</label>
                  <input
                    type="text"
                    value={profileForm.fullName}
                    onChange={(e) =>
                      setProfileForm({
                        ...profileForm,
                        fullName: e.target.value,
                      })
                    }
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="label">Phone Number</label>
                  <input
                    type="tel"
                    value={profileForm.phone}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, phone: e.target.value })
                    }
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="label">Email</label>
                  <input
                    type="email"
                    value={user?.email}
                    className="input-field bg-gray-100"
                    disabled
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Email cannot be changed
                  </p>
                </div>

                <div>
                  <label className="label">Role</label>
                  <input
                    type="text"
                    value={user?.role}
                    className="input-field bg-gray-100 capitalize"
                    disabled
                  />
                </div>
              </div>

              {/* Vendor Details */}
              {user?.role === "vendor" && (
                <div className="pt-6 border-t border-gray-200">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">
                    Vendor Details
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="label">Business Name</label>
                      <input
                        type="text"
                        value={vendorForm.businessName}
                        onChange={(e) =>
                          setVendorForm({
                            ...vendorForm,
                            businessName: e.target.value,
                          })
                        }
                        className="input-field"
                      />
                    </div>

                    <div>
                      <label className="label">Category</label>
                      <select
                        value={vendorForm.category}
                        onChange={(e) =>
                          setVendorForm({
                            ...vendorForm,
                            category: e.target.value,
                          })
                        }
                        className="input-field"
                      >
                        <option value="">Select category</option>
                        <option value="photography">Photography</option>
                        <option value="catering">Catering</option>
                        <option value="decoration">Decoration</option>
                        <option value="venue">Venue</option>
                        <option value="music">Music</option>
                        <option value="makeup">Makeup</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="label">Description</label>
                      <textarea
                        value={vendorForm.description}
                        onChange={(e) =>
                          setVendorForm({
                            ...vendorForm,
                            description: e.target.value,
                          })
                        }
                        className="input-field"
                        rows="3"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="label">Gallery Images</label>
                      <p className="text-xs text-gray-500 mb-2">
                        Add images from your device or via URL to showcase your
                        work. These will be visible to couples.
                      </p>
                      <div className="flex flex-wrap gap-2 mb-3">
                        <label className="btn-primary cursor-pointer">
                          {uploadingImages ? "Uploading..." : "Upload from Device"}
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={handleUploadImages}
                            disabled={uploadingImages}
                          />
                        </label>
                        <span className="text-sm text-gray-500 self-center">
                          or add URL below
                        </span>
                      </div>
                      <div className="space-y-3">
                        {(vendorForm.images || []).map((img, idx) => (
                          <div
                            key={idx}
                            className="flex items-center space-x-3"
                          >
                            <input
                              type="url"
                              value={img}
                              onChange={(e) => {
                                const newImages = [
                                  ...(vendorForm.images || []),
                                ];
                                newImages[idx] = e.target.value;
                                setVendorForm({
                                  ...vendorForm,
                                  images: newImages,
                                });
                              }}
                              placeholder="https://example.com/photo.jpg"
                              className="input-field flex-1"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const newImages = [
                                  ...(vendorForm.images || []),
                                ];
                                newImages.splice(idx, 1);
                                setVendorForm({
                                  ...vendorForm,
                                  images: newImages,
                                });
                              }}
                              className="btn-secondary"
                            >
                              Remove
                            </button>
                          </div>
                        ))}

                        <div>
                          <button
                            type="button"
                            onClick={() =>
                              setVendorForm({
                                ...vendorForm,
                                images: [...(vendorForm.images || []), ""],
                              })
                            }
                            className="btn-primary"
                          >
                            Add Image URL
                          </button>
                        </div>

                        {/* Preview thumbnails */}
                        <div className="mt-3 grid grid-cols-3 gap-3">
                          {(vendorForm.images || []).map((img, idx) =>
                            img ? (
                              <img
                                key={idx}
                                src={img}
                                alt={`preview-${idx}`}
                                className="w-full h-24 object-cover rounded-lg border"
                                onError={(e) =>
                                  (e.target.style.display = "none")
                                }
                              />
                            ) : null,
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
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
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center space-x-3">
                  <UserCircleIcon className="w-6 h-6 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Full Name</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {user?.fullName}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <EnvelopeIcon className="w-6 h-6 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {user?.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <PhoneIcon className="w-6 h-6 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {user?.phone}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 flex items-center justify-center">
                    <span className="text-xl">👤</span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Role</p>
                    <p className="text-lg font-semibold text-gray-900 capitalize">
                      {user?.role}
                    </p>
                  </div>
                </div>
              </div>

              {/* Vendor Details Display */}
              {user?.role === "vendor" && user?.vendorDetails && (
                <div className="pt-6 border-t border-gray-200">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">
                    Vendor Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-gray-600">Business Name</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {user.vendorDetails.businessName || "Not set"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Category</p>
                      <p className="text-lg font-semibold text-gray-900 capitalize">
                        {user.vendorDetails.category || "Not set"}
                      </p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-sm text-gray-600">Description</p>
                      <p className="text-gray-900">
                        {user.vendorDetails.description || "Not set"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Rating</p>
                      <p className="text-lg font-semibold text-gray-900">
                        ⭐ {user.vendorDetails.rating || 0}/5 (
                        {user.vendorDetails.totalReviews || 0} reviews)
                      </p>
                    </div>
                    {user.vendorDetails.images &&
                      user.vendorDetails.images.length > 0 && (
                        <div className="md:col-span-2">
                          <p className="text-sm text-gray-600">Gallery</p>
                          <div className="mt-2 grid grid-cols-3 gap-3">
                            {user.vendorDetails.images.map((img, idx) => (
                              <img
                                key={idx}
                                src={img}
                                alt={`vendor-${idx}`}
                                className="w-full h-28 object-cover rounded-lg border"
                              />
                            ))}
                          </div>
                        </div>
                      )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Change Password */}
        <div className="card">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-900 flex items-center">
              <KeyIcon className="w-6 h-6 text-primary-500 mr-2" />
              Change Password
            </h3>
            {!isChangingPassword && (
              <button
                onClick={() => setIsChangingPassword(true)}
                className="btn-secondary"
              >
                Change Password
              </button>
            )}
          </div>

          {isChangingPassword ? (
            <form onSubmit={handlePasswordChange} className="space-y-6">
              <div>
                <label className="label">Current Password</label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      currentPassword: e.target.value,
                    })
                  }
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="label">New Password</label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      newPassword: e.target.value,
                    })
                  }
                  className="input-field"
                  required
                  minLength={6}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Minimum 6 characters
                </p>
              </div>

              <div>
                <label className="label">Confirm New Password</label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      confirmPassword: e.target.value,
                    })
                  }
                  className="input-field"
                  required
                />
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsChangingPassword(false);
                    setPasswordForm({
                      currentPassword: "",
                      newPassword: "",
                      confirmPassword: "",
                    });
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Update Password
                </button>
              </div>
            </form>
          ) : (
            <p className="text-gray-600">
              Keep your account secure by regularly updating your password.
            </p>
          )}
        </div>

        {/* Account Info */}
        <div className="card bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Account Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Account Created</p>
              <p className="font-semibold text-gray-900">
                {new Date(user?.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Last Login</p>
              <p className="font-semibold text-gray-900">
                {user?.lastLogin
                  ? new Date(user.lastLogin).toLocaleDateString()
                  : "N/A"}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Account Status</p>
              <p className="font-semibold text-green-600">
                {user?.isActive ? "Active" : "Inactive"}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Email Verified</p>
              <p className="font-semibold text-gray-900">
                {user?.isEmailVerified ? "Yes" : "No"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProfilePage;
