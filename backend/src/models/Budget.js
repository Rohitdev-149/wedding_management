const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: [true, "Expense category is required"],
      enum: [
        "photography",
        "catering",
        "decoration",
        "venue",
        "music",
        "makeup",
        "attire",
        "invitations",
        "transportation",
        "accommodation",
        "other",
      ],
    },
    description: {
      type: String,
      required: [true, "Expense description is required"],
      trim: true,
    },
    budgetedAmount: {
      type: Number,
      required: [true, "Budgeted amount is required"],
      min: [0, "Budgeted amount cannot be negative"],
    },
    actualAmount: {
      type: Number,
      default: 0,
      min: [0, "Actual amount cannot be negative"],
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    paidDate: {
      type: Date,
      default: null,
    },
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
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

const budgetSchema = new mongoose.Schema(
  {
    wedding: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Wedding",
      required: [true, "Wedding reference is required"],
      unique: true,
    },
    totalBudget: {
      type: Number,
      required: [true, "Total budget is required"],
      min: [0, "Total budget cannot be negative"],
    },
    expenses: [expenseSchema],
  },
  {
    timestamps: true,
  },
);

// Virtual for total spent
budgetSchema.virtual("totalSpent").get(function () {
  return this.expenses.reduce((sum, expense) => sum + expense.actualAmount, 0);
});

// Virtual for remaining budget
budgetSchema.virtual("remainingBudget").get(function () {
  return this.totalBudget - this.totalSpent;
});

// Virtual for budget utilization percentage
budgetSchema.virtual("utilizationPercentage").get(function () {
  if (this.totalBudget === 0) return 0;
  return ((this.totalSpent / this.totalBudget) * 100).toFixed(2);
});

// Indexes
budgetSchema.index({ wedding: 1 });

// Ensure virtuals are included in JSON
budgetSchema.set("toJSON", { virtuals: true });
budgetSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Budget", budgetSchema);
