const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Event title is required"],
      trim: true,
    },
    description: {
      type: String,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    eventDate: {
      type: Date,
      required: [true, "Event date is required"],
    },
    startTime: {
      type: String,
      required: [true, "Start time is required"],
    },
    endTime: {
      type: String,
      required: [true, "End time is required"],
    },
    location: {
      name: String,
      address: String,
    },
    eventType: {
      type: String,
      enum: [
        "ceremony",
        "reception",
        "engagement",
        "mehendi",
        "sangeet",
        "haldi",
        "cocktail",
        "rehearsal",
        "other",
      ],
      required: [true, "Event type is required"],
    },
    isMainEvent: {
      type: Boolean,
      default: false,
    },
    attendees: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Guest",
      },
    ],
    vendors: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    status: {
      type: String,
      enum: ["planned", "confirmed", "completed", "cancelled"],
      default: "planned",
    },
    reminderSent: {
      type: Boolean,
      default: false,
    },
    notes: {
      type: String,
      maxlength: [500, "Notes cannot exceed 500 characters"],
    },
  },
  {
    timestamps: true,
  },
);

const timelineSchema = new mongoose.Schema(
  {
    wedding: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Wedding",
      required: [true, "Wedding reference is required"],
      unique: true,
    },
    events: [eventSchema],
  },
  {
    timestamps: true,
  },
);

// Index
timelineSchema.index({ wedding: 1 });

module.exports = mongoose.model("Timeline", timelineSchema);
