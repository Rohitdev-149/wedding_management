import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/common/Layout";
import Loader from "../../components/common/Loader";
import PageHeader from "../../components/common/PageHeader";
import EmptyState from "../../components/common/EmptyState";
import api from "../../services/api";
import weddingService from "../../services/weddingService";
import bookingService from "../../services/bookingService";
import vendorService from "../../services/vendorService";
import {
  MagnifyingGlassIcon,
  StarIcon,
  PhoneIcon,
  EnvelopeIcon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";

const VendorsPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [vendors, setVendors] = useState([]);
  const [wedding, setWedding] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [uploading, setUploading] = useState(false);

  const [bookingForm, setBookingForm] = useState({
    service: "",
    serviceDate: "",
    amount: "",
    advancePaid: "",
    bookingDetails: "",
    terms: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch wedding
      const weddingsResponse = await weddingService.getMyWeddings();
      if (weddingsResponse.data.length === 0) {
        navigate("/wedding/create");
        return;
      }
      setWedding(weddingsResponse.data[0]);

      // Get current user
      try {
        const meRes = await api.get("/auth/me");
        const meUser = meRes.data?.data ?? null;
        setCurrentUser(meUser);
      } catch (err) {
        // ignore - user might be not logged in
      }

      // Then fetch all users and filter vendors
      await fetchAllVendors();
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllVendors = async () => {
    try {
      // Since we don't have a public vendors endpoint, we'll use a workaround
      // Create a backend endpoint to get all vendors
      const response = await api.get("/users/vendors");
      // Ensure vendors is always an array
      const vendorsData = Array.isArray(response.data)
        ? response.data
        : response.data?.data || [];
      setVendors(vendorsData);
    } catch (error) {
      // If endpoint doesn't exist, show empty state
      console.error("Error fetching vendors:", error);
      setVendors([]);
    }
  };

  const openGallery = (index = 0) => {
    setGalleryIndex(index);
    setShowGallery(true);
  };

  const closeGallery = () => {
    setShowGallery(false);
    setGalleryIndex(0);
  };

  // Gallery controls
  const prevImage = () => {
    setGalleryIndex((i) => {
      const len = selectedVendor?.vendorDetails?.images?.length || 0;
      return (i - 1 + len) % Math.max(len, 1);
    });
  };

  const nextImage = () => {
    setGalleryIndex((i) => {
      const len = selectedVendor?.vendorDetails?.images?.length || 0;
      return (i + 1) % Math.max(len, 1);
    });
  };

  const thumbsRef = React.useRef(null);
  useEffect(() => {
    if (!showGallery) return;
    const onKey = (e) => {
      if (e.key === "ArrowLeft") prevImage();
      if (e.key === "ArrowRight") nextImage();
      if (e.key === "Escape") closeGallery();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showGallery, selectedVendor]);

  useEffect(() => {
    // scroll thumbnail into view
    if (!thumbsRef.current) return;
    const el = thumbsRef.current.querySelector(`[data-idx='${galleryIndex}']`);
    if (el && el.scrollIntoView)
      el.scrollIntoView({ behavior: "smooth", inline: "center" });
  }, [galleryIndex]);

  const handleUploadFiles = async (e, vendorId) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Allow large uploads (but warn if >200)
    if (
      (selectedVendor?.vendorDetails?.images?.length || 0) + files.length >
      200
    ) {
      alert(
        "You can upload up to 200 images per vendor. Please select fewer files.",
      );
      return;
    }

    try {
      setUploading(true);
      const res = await vendorService.uploadVendorImages(vendorId, files);
      // Backend returns full images array
      const updatedImages = res.data?.data?.images || res.data?.images || [];
      setSelectedVendor((prev) => ({
        ...prev,
        vendorDetails: {
          ...prev.vendorDetails,
          images: updatedImages,
        },
      }));
      setVendors((prev) =>
        prev.map((v) =>
          v._id === vendorId
            ? {
                ...v,
                vendorDetails: {
                  ...v.vendorDetails,
                  images: updatedImages,
                },
              }
            : v,
        ),
      );
    } catch (err) {
      console.error("Upload failed:", err);
      alert(err.response?.data?.message || "Image upload failed");
    } finally {
      setUploading(false);
      // clear input value
      e.target.value = "";
    }
  };

  const handleBookVendor = (vendor) => {
    setSelectedVendor(vendor);
    setBookingForm({
      service: vendor.vendorDetails?.businessName || "",
      serviceDate: wedding?.weddingDate?.split("T")[0] || "",
      amount: "",
      advancePaid: "",
      bookingDetails: "",
      terms: "",
    });
    setShowBookingModal(true);
  };

  const handleSubmitBooking = async (e) => {
    e.preventDefault();
    try {
      const bookingData = {
        wedding: wedding._id,
        vendor: selectedVendor._id,
        service: bookingForm.service,
        serviceDate: bookingForm.serviceDate,
        amount: parseFloat(bookingForm.amount),
        advancePaid: parseFloat(bookingForm.advancePaid || 0),
        bookingDetails: bookingForm.bookingDetails,
        terms: bookingForm.terms,
      };

      await bookingService.createBooking(bookingData);
      setShowBookingModal(false);
      setSelectedVendor(null);
      alert("Booking request sent successfully!");
      navigate("/bookings");
    } catch (error) {
      console.error("Error creating booking:", error);
      alert(error.response?.data?.message || "Failed to create booking");
    }
  };

  const categories = [
    { value: "", label: "All Categories" },
    { value: "photography", label: "Photography" },
    { value: "catering", label: "Catering" },
    { value: "decoration", label: "Decoration" },
    { value: "venue", label: "Venue" },
    { value: "music", label: "Music" },
    { value: "makeup", label: "Makeup" },
    { value: "other", label: "Other" },
  ];

  const filteredVendors = Array.isArray(vendors)
    ? vendors.filter((vendor) => {
        const matchesSearch =
          vendor.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          vendor.vendorDetails?.businessName
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase());

        const matchesCategory =
          !filterCategory || vendor.vendorDetails?.category === filterCategory;

        return matchesSearch && matchesCategory;
      })
    : [];

  if (loading) {
    return (
      <Layout>
        <Loader />
      </Layout>
    );
  }

  const categoryIcons = {
    photography: "📷",
    catering: "🍽️",
    decoration: "🎨",
    venue: "🏛️",
    music: "🎵",
    makeup: "💄",
    other: "✨",
  };

  return (
    <Layout>
      <div className="space-y-8">
        {/* Gallery Modal */}
        {showGallery && selectedVendor && (
          <div
            className="fixed inset-0 z-[60] bg-black bg-opacity-80 flex items-center justify-center p-6 overflow-y-auto"
            onClick={closeGallery}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Escape" && closeGallery()}
          >
            <div
              className="bg-white rounded-xl w-full max-w-6xl max-h-[90vh] overflow-hidden p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-2 px-4">
                <h3 className="text-lg font-semibold">Gallery</h3>
                <div className="flex items-center gap-2">
                  {currentUser && currentUser._id === selectedVendor._id && (
                    <label className="btn-primary cursor-pointer">
                      {uploading ? "Uploading..." : "Upload Images"}
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={(e) =>
                          handleUploadFiles(e, selectedVendor._id)
                        }
                      />
                    </label>
                  )}
                  <button className="btn-secondary" onClick={closeGallery}>
                    Close
                  </button>
                </div>
              </div>

              <div className="relative flex items-center justify-center bg-gray-50">
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white p-2 rounded-full shadow"
                >
                  <ChevronLeftIcon className="w-6 h-6" />
                </button>

                <div className="max-h-[72vh] w-full flex items-center justify-center">
                  {selectedVendor.vendorDetails?.images &&
                  selectedVendor.vendorDetails.images.length > 0 ? (
                    <img
                      src={selectedVendor.vendorDetails.images[galleryIndex]}
                      alt={`large-${galleryIndex}`}
                      className="max-h-[72vh] object-contain mx-auto"
                    />
                  ) : (
                    <div className="py-24">No images available</div>
                  )}
                </div>

                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white p-2 rounded-full shadow"
                >
                  <ChevronRightIcon className="w-6 h-6" />
                </button>
              </div>

              <div
                ref={thumbsRef}
                className="mt-4 px-4 overflow-x-auto flex gap-2 items-center"
              >
                {(selectedVendor.vendorDetails?.images || []).map(
                  (img, idx) => (
                    <button
                      key={idx}
                      data-idx={idx}
                      onClick={() => setGalleryIndex(idx)}
                      className={`rounded overflow-hidden border ${idx === galleryIndex ? "ring-2 ring-primary-500" : "opacity-80"}`}
                    >
                      <img
                        src={img}
                        alt={`thumb-${idx}`}
                        className="w-24 h-16 object-cover"
                      />
                    </button>
                  ),
                )}
              </div>
            </div>
          </div>
        )}
        <PageHeader
          title="Find vendors"
          subtitle="Discover and book the best vendors for your wedding"
        />

        <div className="card">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search vendors or business name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="input-field"
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Vendors Count */}
        <div className="flex items-center justify-between">
          <p className="text-gray-600">
            {filteredVendors.length}{" "}
            {filteredVendors.length === 1 ? "vendor" : "vendors"} found
          </p>
        </div>

        {filteredVendors.length === 0 ? (
          <EmptyState
            icon="🔍"
            title="No vendors found"
            description={
              vendors.length === 0
                ? "No vendors have registered yet. Check back later."
                : "Try adjusting your search or filters."
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVendors.map((vendor) => (
              <div
                key={vendor._id}
                onClick={() => handleBookVendor(vendor)}
                className="card-interactive group"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleBookVendor(vendor);
                  }
                }}
              >
                {/* Vendor Icon/Avatar */}
                <div className="aspect-video bg-gradient-to-br from-primary-100 to-rose-100 rounded-lg mb-4 overflow-hidden group-hover:scale-105 transition-transform">
                  {vendor.vendorDetails?.images &&
                  vendor.vendorDetails.images.length > 0 ? (
                    <img
                      src={vendor.vendorDetails.images[0]}
                      alt={
                        vendor.vendorDetails?.businessName || vendor.fullName
                      }
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <span className="text-7xl">
                        {categoryIcons[vendor.vendorDetails?.category] || "✨"}
                      </span>
                    </div>
                  )}
                </div>

                {/* Business Name */}
                <h3 className="text-xl font-semibold text-gray-900 mb-1">
                  {vendor.vendorDetails?.businessName || vendor.fullName}
                </h3>

                {/* Category Badge */}
                <div className="mb-3">
                  <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-semibold capitalize">
                    {vendor.vendorDetails?.category || "General"}
                  </span>
                </div>

                {/* Description */}
                {vendor.vendorDetails?.description && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {vendor.vendorDetails.description}
                  </p>
                )}

                {/* Rating */}
                <div className="flex items-center mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <StarIcon
                      key={star}
                      className={`w-5 h-5 ${
                        star <= (vendor.vendorDetails?.rating || 0)
                          ? "text-yellow-400 fill-current"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                  <span className="ml-2 text-sm text-gray-600">
                    ({vendor.vendorDetails?.totalReviews || 0} reviews)
                  </span>
                </div>

                {/* Contact Info */}
                <div className="space-y-2 mb-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <EnvelopeIcon className="w-4 h-4 mr-2" />
                    <span className="truncate">{vendor.email}</span>
                  </div>
                  <div className="flex items-center">
                    <PhoneIcon className="w-4 h-4 mr-2" />
                    <span>{vendor.phone}</span>
                  </div>
                </div>

                {/* Book Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleBookVendor(vendor);
                  }}
                  className="btn-primary w-full"
                >
                  Book Now
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {showBookingModal && selectedVendor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 p-4 overflow-y-auto min-h-screen">
          <div className="bg-white rounded-2xl p-6 max-w-6xl w-full my-8 flex-shrink-0">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-2xl font-serif font-bold text-gray-900">
                  Book{" "}
                  {selectedVendor.vendorDetails?.businessName ||
                    selectedVendor.fullName}
                </h3>
                <p className="text-gray-600 capitalize">
                  {selectedVendor.vendorDetails?.category || "Vendor"}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowBookingModal(false);
                  setSelectedVendor(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left: Images (show at least 10) */}
              <div>
                <div className="mb-4">
                  <div className="flex gap-4">
                    {/* Large hero image on left */}
                    <div className="flex-shrink-0 w-full md:w-2/3 rounded-lg overflow-hidden">
                      {(selectedVendor.vendorDetails?.images || []).length >
                      0 ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openGallery(0);
                          }}
                          className="w-full h-[420px] overflow-hidden rounded-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                          <img
                            src={selectedVendor.vendorDetails.images[0]}
                            alt="hero"
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ) : (
                        <div className="w-full h-[420px] flex items-center justify-center bg-gray-50 rounded-lg">
                          {categoryIcons[
                            selectedVendor.vendorDetails?.category
                          ] || "✨"}
                        </div>
                      )}
                    </div>

                    {/* Thumbnail grid on right */}
                    <div className="w-1/3 grid grid-cols-2 grid-rows-3 gap-2">
                      {(selectedVendor.vendorDetails?.images || [])
                        .slice(1, 7)
                        .map((img, idx) => {
                          const realIdx = idx + 1;
                          const isLastSlot =
                            idx === 5 &&
                            (selectedVendor.vendorDetails?.images?.length ||
                              0) > 6;
                          return (
                            <div
                              key={realIdx}
                              className="relative rounded-lg overflow-hidden border"
                            >
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openGallery(realIdx);
                                }}
                                className="w-full h-full block cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500"
                              >
                                <img
                                  src={img}
                                  alt={`thumb-${realIdx}`}
                                  className="w-full h-28 object-cover"
                                />
                              </button>

                              {isLastSlot && (
                                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openGallery(realIdx);
                                    }}
                                    className="bg-black bg-opacity-70 text-white px-3 py-1 rounded hover:bg-opacity-90"
                                  >
                                    Show All Images
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })}

                      {/* placeholders if less than slots */}
                      {Array.from({
                        length: Math.max(
                          0,
                          6 -
                            (selectedVendor.vendorDetails?.images?.slice(1, 7)
                              .length || 0),
                        ),
                      }).map((_, i) => (
                        <div
                          key={`thumb-ph-${i}`}
                          className="w-full h-28 flex items-center justify-center rounded-lg border bg-gray-50 text-gray-300"
                        >
                          {categoryIcons[
                            selectedVendor.vendorDetails?.category
                          ] || "✨"}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => openGallery(0)}
                    className="btn-secondary"
                  >
                    Show more images
                  </button>

                  {/* Upload - show only if current user is the vendor owner */}
                  {currentUser && currentUser._id === selectedVendor._id && (
                    <label className="btn-primary cursor-pointer">
                      {uploading ? "Uploading..." : "Upload Images"}
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={(e) =>
                          handleUploadFiles(e, selectedVendor._id)
                        }
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Right: Booking Form */}
              <div>
                <form onSubmit={handleSubmitBooking} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="label">Service Description *</label>
                      <input
                        type="text"
                        value={bookingForm.service}
                        onChange={(e) =>
                          setBookingForm({
                            ...bookingForm,
                            service: e.target.value,
                          })
                        }
                        className="input-field"
                        placeholder="e.g., Full Day Wedding Photography"
                        required
                      />
                    </div>

                    <div>
                      <label className="label">Service Date *</label>
                      <input
                        type="date"
                        value={bookingForm.serviceDate}
                        onChange={(e) =>
                          setBookingForm({
                            ...bookingForm,
                            serviceDate: e.target.value,
                          })
                        }
                        className="input-field"
                        required
                      />
                    </div>

                    <div>
                      <label className="label">Total Amount (₹) *</label>
                      <input
                        type="number"
                        value={bookingForm.amount}
                        onChange={(e) =>
                          setBookingForm({
                            ...bookingForm,
                            amount: e.target.value,
                          })
                        }
                        className="input-field"
                        placeholder="50000"
                        min="0"
                        required
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="label">Advance Payment (₹)</label>
                      <input
                        type="number"
                        value={bookingForm.advancePaid}
                        onChange={(e) =>
                          setBookingForm({
                            ...bookingForm,
                            advancePaid: e.target.value,
                          })
                        }
                        className="input-field"
                        placeholder="10000"
                        min="0"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="label">Booking Details *</label>
                      <textarea
                        value={bookingForm.bookingDetails}
                        onChange={(e) =>
                          setBookingForm({
                            ...bookingForm,
                            bookingDetails: e.target.value,
                          })
                        }
                        className="input-field"
                        rows="3"
                        placeholder="Describe what services are included..."
                        required
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="label">Terms & Conditions</label>
                      <textarea
                        value={bookingForm.terms}
                        onChange={(e) =>
                          setBookingForm({
                            ...bookingForm,
                            terms: e.target.value,
                          })
                        }
                        className="input-field"
                        rows="2"
                        placeholder="Payment terms, cancellation policy, etc."
                      />
                    </div>
                  </div>

                  {/* Vendor Contact Info */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">
                      Vendor Contact
                    </h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>📧 {selectedVendor.email}</p>
                      <p>📱 {selectedVendor.phone}</p>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => {
                        setShowBookingModal(false);
                        setSelectedVendor(null);
                      }}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn-primary">
                      Send Booking Request
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default VendorsPage;
