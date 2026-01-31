const mongoose = require('mongoose');

const guestSchema = new mongoose.Schema(
  {
    wedding: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Wedding',
      required: [true, 'Wedding reference is required'],
    },
    fullName: {
      type: String,
      required: [true, 'Guest name is required'],
      trim: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email',
      ],
    },
    phone: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      enum: ['family', 'friend', 'colleague', 'other'],
      default: 'friend',
    },
    side: {
      type: String,
      enum: ['partner1', 'partner2', 'mutual'],
      required: [true, 'Guest side is required'],
    },
    rsvpStatus: {
      type: String,
      enum: ['pending', 'accepted', 'declined', 'maybe'],
      default: 'pending',
    },
    rsvpDate: {
      type: Date,
      default: null,
    },
    numberOfGuests: {
      type: Number,
      default: 1,
      min: [1, 'Number of guests must be at least 1'],
    },
    mealPreference: {
      type: String,
      enum: ['veg', 'non-veg', 'vegan', 'jain', 'none'],
      default: 'none',
    },
    specialRequirements: {
      type: String,
      maxlength: [500, 'Special requirements cannot exceed 500 characters'],
    },
    invitationSent: {
      type: Boolean,
      default: false,
    },
    invitationSentDate: {
      type: Date,
      default: null,
    },
    tableNumber: {
      type: Number,
      default: null,
    },
    notes: {
      type: String,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
guestSchema.index({ wedding: 1 });
guestSchema.index({ rsvpStatus: 1 });
guestSchema.index({ email: 1 });

module.exports = mongoose.model('Guest', guestSchema);