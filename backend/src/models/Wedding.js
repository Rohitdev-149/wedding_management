const mongoose = require("mongoose");

const weddingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Wedding title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    couple: {
      partner1: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Partner 1 is required"],
      },
      partner2: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Partner 2 is required"],
      },
    },
    weddingDate: {
      type: Date,
      required: [true, "Wedding date is required"],
    },
    venue: {
      name: {
        type: String,
        required: [true, "Venue name is required"],
        trim: true,
      },
      address: {
        street: String,
        city: {
          type: String,
          required: true,
        },
        state: String,
        country: {
          type: String,
          required: true,
        },
        zipCode: String,
      },
      coordinates: {
        latitude: Number,
        longitude: Number,
      },
    },
    planner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    status: {
      type: String,
      enum: ["planning", "confirmed", "completed", "cancelled"],
      default: "planning",
    },
    guestCount: {
      expected: {
        type: Number,
        default: 0,
      },
      confirmed: {
        type: Number,
        default: 0,
      },
    },
    description: {
      type: String,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    theme: {
      type: String,
      trim: true,
    },
    images: [
      {
        url: String,
        caption: String,
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    privacy: {
      type: String,
      enum: ["public", "private", "invited-only"],
      default: "invited-only",
    },
  },
  {
    timestamps: true,
  },
);

// Indexes
weddingSchema.index({ "couple.partner1": 1, "couple.partner2": 1 });
weddingSchema.index({ weddingDate: 1 });
weddingSchema.index({ planner: 1 });
weddingSchema.index({ status: 1 });

// Virtual for days until wedding
weddingSchema.virtual("daysUntilWedding").get(function () {
  if (!this.weddingDate) return null;
  const today = new Date();
  const weddingDate = new Date(this.weddingDate);
  const diffTime = weddingDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Ensure virtuals are included in JSON
weddingSchema.set("toJSON", { virtuals: true });
weddingSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Wedding", weddingSchema);
