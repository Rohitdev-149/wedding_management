const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    wedding: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Wedding",
      required: [true, "Wedding reference is required"],
    },
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Vendor reference is required"],
    },
    couple: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Couple reference is required"],
    },
    service: {
      type: String,
      required: [true, "Service type is required"],
      trim: true,
    },
    serviceDate: {
      type: Date,
      required: [true, "Service date is required"],
    },
    amount: {
      type: Number,
      required: [true, "Booking amount is required"],
      min: [0, "Amount cannot be negative"],
    },
    advancePaid: {
      type: Number,
      default: 0,
      min: [0, "Advance paid cannot be negative"],
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled", "declined"],
      default: "pending",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "partial", "completed", "refunded"],
      default: "pending",
    },
    bookingDetails: {
      type: String,
      maxlength: [1000, "Booking details cannot exceed 1000 characters"],
    },
    terms: {
      type: String,
      maxlength: [1000, "Terms cannot exceed 1000 characters"],
    },
    contractUrl: {
      type: String,
      default: null,
    },
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
    cancellationReason: {
      type: String,
      maxlength: [500, "Cancellation reason cannot exceed 500 characters"],
    },
    review: {
      rating: {
        type: Number,
        min: 1,
        max: 5,
      },
      comment: {
        type: String,
        maxlength: [1000, "Review comment cannot exceed 1000 characters"],
      },
      reviewDate: Date,
    },
  },
  {
    timestamps: true,
  },
);

// Indexes
bookingSchema.index({ wedding: 1 });
bookingSchema.index({ vendor: 1 });
bookingSchema.index({ couple: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ serviceDate: 1 });

// Virtual for remaining payment
bookingSchema.virtual("remainingPayment").get(function () {
  return this.amount - this.advancePaid;
});

// Ensure virtuals are included in JSON
bookingSchema.set("toJSON", { virtuals: true });
bookingSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Booking", bookingSchema);
