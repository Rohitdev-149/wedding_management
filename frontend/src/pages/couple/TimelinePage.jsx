import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/common/Layout";
import Loader from "../../components/common/Loader";
import weddingService from "../../services/weddingService";
import timelineService from "../../services/timelineService";
import { formatDate, formatTime } from "../../utils/formatters";
import { EVENT_TYPES } from "../../utils/constants";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";

const TimelinePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [wedding, setWedding] = useState(null);
  const [timeline, setTimeline] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const modalRef = useRef(null);
  const firstInputRef = useRef(null);

  useEffect(() => {
    if (!showEventModal) return;

    const modalEl = modalRef.current;

    // focus first input when modal opens
    setTimeout(() => {
      firstInputRef.current?.focus();
      modalEl?.focus();
    }, 0);

    // keyboard handlers: Esc to close, Tab trap
    const keyHandler = (e) => {
      if (e.key === "Escape") {
        setShowEventModal(false);
        setEditingEvent(null);
        setEventForm({
          title: "",
          description: "",
          eventDate: "",
          startTime: "",
          endTime: "",
          locationName: "",
          locationAddress: "",
          eventType: "other",
          isMainEvent: false,
          notes: "",
        });
      }

      if (e.key === "Tab") {
        const focusable = modalEl.querySelectorAll(
          'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        );
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", keyHandler);

    return () => document.removeEventListener("keydown", keyHandler);
  }, [showEventModal]);

  const [eventForm, setEventForm] = useState({
    title: "",
    description: "",
    eventDate: "",
    startTime: "",
    endTime: "",
    locationName: "",
    locationAddress: "",
    eventType: "other",
    isMainEvent: false,
    notes: "",
  });

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

      const timelineResponse = await timelineService.getTimeline(
        weddingData._id,
      );
      setTimeline(timelineResponse.data);
    } catch (error) {
      console.error("Error fetching timeline:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEvent = async (e) => {
    e.preventDefault();
    try {
      const eventData = {
        title: eventForm.title,
        description: eventForm.description,
        eventDate: eventForm.eventDate,
        startTime: eventForm.startTime,
        endTime: eventForm.endTime,
        location: {
          name: eventForm.locationName,
          address: eventForm.locationAddress,
        },
        eventType: eventForm.eventType,
        isMainEvent: eventForm.isMainEvent,
        notes: eventForm.notes,
      };

      if (editingEvent) {
        await timelineService.updateEvent(
          wedding._id,
          editingEvent._id,
          eventData,
        );
      } else {
        await timelineService.addEvent(wedding._id, eventData);
      }

      setShowEventModal(false);
      setEditingEvent(null);
      resetForm();
      fetchData();
    } catch (error) {
      console.error("Error saving event:", error);
      alert(error.response?.data?.message || "Failed to save event");
    }
  };

  const handleEditEvent = (event) => {
    setEditingEvent(event);
    setEventForm({
      title: event.title,
      description: event.description || "",
      eventDate: event.eventDate.split("T")[0],
      startTime: event.startTime,
      endTime: event.endTime,
      locationName: event.location?.name || "",
      locationAddress: event.location?.address || "",
      eventType: event.eventType,
      isMainEvent: event.isMainEvent,
      notes: event.notes || "",
    });
    setShowEventModal(true);
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;

    try {
      await timelineService.deleteEvent(wedding._id, eventId);
      fetchData();
    } catch (error) {
      console.error("Error deleting event:", error);
      alert(error.response?.data?.message || "Failed to delete event");
    }
  };

  const resetForm = () => {
    setEventForm({
      title: "",
      description: "",
      eventDate: "",
      startTime: "",
      endTime: "",
      locationName: "",
      locationAddress: "",
      eventType: "other",
      isMainEvent: false,
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

  const eventTypeColors = {
    ceremony: "bg-red-100 text-red-800 border-red-200",
    reception: "bg-pink-100 text-pink-800 border-pink-200",
    engagement: "bg-purple-100 text-purple-800 border-purple-200",
    mehendi: "bg-orange-100 text-orange-800 border-orange-200",
    sangeet: "bg-yellow-100 text-yellow-800 border-yellow-200",
    haldi: "bg-green-100 text-green-800 border-green-200",
    cocktail: "bg-blue-100 text-blue-800 border-blue-200",
    rehearsal: "bg-indigo-100 text-indigo-800 border-indigo-200",
    other: "bg-gray-100 text-gray-800 border-gray-200",
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">
              Wedding Timeline
            </h1>
            <p className="text-gray-600">{wedding?.title}</p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowEventModal(true);
            }}
            className="btn-primary flex items-center"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Add Event
          </button>
        </div>

        {/* Timeline */}
        <div className="card">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">
            All Events ({timeline?.events?.length || 0})
          </h3>
          {!timeline?.events || timeline.events.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <CalendarIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p>No events scheduled yet.</p>
              <button
                onClick={() => {
                  resetForm();
                  setShowEventModal(true);
                }}
                className="btn-primary mt-4"
              >
                Add Your First Event
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {timeline.events.map((event, index) => (
                <div
                  key={event._id}
                  className={`border-2 rounded-xl p-6 ${
                    eventTypeColors[event.eventType]
                  } ${event.isMainEvent ? "ring-2 ring-primary-500" : ""}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="text-xl font-semibold text-gray-900">
                          {event.title}
                        </h4>
                        {event.isMainEvent && (
                          <span className="px-3 py-1 bg-primary-500 text-white text-xs font-semibold rounded-full">
                            Main Event
                          </span>
                        )}
                        <span className="px-3 py-1 bg-white/50 backdrop-blur-sm text-xs font-semibold rounded-full capitalize">
                          {event.eventType}
                        </span>
                      </div>

                      {event.description && (
                        <p className="text-gray-700 mb-4">
                          {event.description}
                        </p>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center text-gray-700">
                          <CalendarIcon className="w-5 h-5 mr-2" />
                          {formatDate(event.eventDate)}
                        </div>
                        <div className="flex items-center text-gray-700">
                          <ClockIcon className="w-5 h-5 mr-2" />
                          {formatTime(event.startTime)} -{" "}
                          {formatTime(event.endTime)}
                        </div>
                        {event.location?.name && (
                          <div className="flex items-center text-gray-700">
                            <MapPinIcon className="w-5 h-5 mr-2" />
                            {event.location.name}
                          </div>
                        )}
                      </div>

                      {event.location?.address && (
                        <p className="text-sm text-gray-600 mt-2">
                          📍 {event.location.address}
                        </p>
                      )}

                      {event.notes && (
                        <p className="text-sm text-gray-600 mt-2 italic">
                          Note: {event.notes}
                        </p>
                      )}
                    </div>

                    <div className="flex space-x-2 ml-4">
                      <button
                        onClick={() => handleEditEvent(event)}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg"
                        title="Edit"
                      >
                        <PencilIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteEvent(event._id)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
                        title="Delete"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Event Modal */}
      {showEventModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="event-modal-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowEventModal(false);
              setEditingEvent(null);
              setEventForm({
                title: "",
                description: "",
                eventDate: "",
                startTime: "",
                endTime: "",
                locationName: "",
                locationAddress: "",
                eventType: "other",
                isMainEvent: false,
                notes: "",
              });
            }
          }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-start sm:items-center justify-center z-50 p-4 overflow-y-auto"
        >
          <div
            ref={modalRef}
            tabIndex={-1}
            className="bg-white rounded-2xl p-4 max-w-2xl w-full max-h-[90vh] overflow-y-auto my-6 fade-in"
          >
            <h3
              id="event-modal-title"
              className="text-xl font-semibold text-gray-900 mb-4"
            >
              {editingEvent ? "Edit Event" : "Add New Event"}
            </h3>
            <form onSubmit={handleAddEvent} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="label">Event Title *</label>
                  <input
                    ref={firstInputRef}
                    type="text"
                    value={eventForm.title}
                    onChange={(e) =>
                      setEventForm({ ...eventForm, title: e.target.value })
                    }
                    className="input-field"
                    placeholder="e.g., Wedding Ceremony"
                    required
                  />
                </div>

                <div>
                  <label className="label">Event Type *</label>
                  <select
                    value={eventForm.eventType}
                    onChange={(e) =>
                      setEventForm({ ...eventForm, eventType: e.target.value })
                    }
                    className="input-field"
                    required
                  >
                    {Object.keys(EVENT_TYPES).map((key) => (
                      <option key={key} value={EVENT_TYPES[key]}>
                        {EVENT_TYPES[key].charAt(0).toUpperCase() +
                          EVENT_TYPES[key].slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label">Event Date *</label>
                  <input
                    type="date"
                    value={eventForm.eventDate}
                    onChange={(e) =>
                      setEventForm({ ...eventForm, eventDate: e.target.value })
                    }
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="label">Start Time *</label>
                  <input
                    type="time"
                    value={eventForm.startTime}
                    onChange={(e) =>
                      setEventForm({ ...eventForm, startTime: e.target.value })
                    }
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="label">End Time *</label>
                  <input
                    type="time"
                    value={eventForm.endTime}
                    onChange={(e) =>
                      setEventForm({ ...eventForm, endTime: e.target.value })
                    }
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="label">Location Name</label>
                  <input
                    type="text"
                    value={eventForm.locationName}
                    onChange={(e) =>
                      setEventForm({
                        ...eventForm,
                        locationName: e.target.value,
                      })
                    }
                    className="input-field"
                    placeholder="e.g., Rose Garden"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="label">Location Address</label>
                  <input
                    type="text"
                    value={eventForm.locationAddress}
                    onChange={(e) =>
                      setEventForm({
                        ...eventForm,
                        locationAddress: e.target.value,
                      })
                    }
                    className="input-field"
                    placeholder="Full address"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="label">Description</label>
                  <textarea
                    value={eventForm.description}
                    onChange={(e) =>
                      setEventForm({
                        ...eventForm,
                        description: e.target.value,
                      })
                    }
                    className="input-field"
                    rows="3"
                    placeholder="Event details..."
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="label">Notes</label>
                  <textarea
                    value={eventForm.notes}
                    onChange={(e) =>
                      setEventForm({ ...eventForm, notes: e.target.value })
                    }
                    className="input-field"
                    rows="2"
                    placeholder="Additional notes..."
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={eventForm.isMainEvent}
                      onChange={(e) =>
                        setEventForm({
                          ...eventForm,
                          isMainEvent: e.target.checked,
                        })
                      }
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Mark as Main Event
                    </span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEventModal(false);
                    setEditingEvent(null);
                    resetForm();
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingEvent ? "Update Event" : "Add Event"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default TimelinePage;
