const Budget = require("../models/Budget");
const Wedding = require("../models/Wedding");
const ErrorResponse = require("../utils/errorResponse");

// Helper function to check wedding access
const checkWeddingAccess = async (weddingId, userId, userRole) => {
  const wedding = await Wedding.findById(weddingId);

  if (!wedding) {
    throw new ErrorResponse("Wedding not found", 404);
  }

  const isCouple =
    wedding.couple.partner1.toString() === userId ||
    wedding.couple.partner2.toString() === userId;
  const isPlanner = wedding.planner && wedding.planner.toString() === userId;
  const isAdmin = userRole === "admin";

  if (!isCouple && !isPlanner && !isAdmin) {
    throw new ErrorResponse(
      "Not authorized to access this wedding budget",
      403,
    );
  }

  return wedding;
};

// @desc    Get budget for a wedding
// @route   GET /api/v1/budgets/wedding/:weddingId
// @access  Private (Couple, Planner, Admin)
exports.getBudget = async (req, res, next) => {
  try {
    await checkWeddingAccess(req.params.weddingId, req.user.id, req.user.role);

    const budget = await Budget.findOne({
      wedding: req.params.weddingId,
    }).populate("expenses.vendor", "fullName email phone vendorDetails");

    if (!budget) {
      return next(new ErrorResponse("Budget not found", 404));
    }

    res.status(200).json({
      success: true,
      data: budget,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update total budget
// @route   PUT /api/v1/budgets/wedding/:weddingId
// @access  Private (Couple, Admin)
exports.updateTotalBudget = async (req, res, next) => {
  try {
    const { totalBudget } = req.body;

    if (!totalBudget) {
      return next(new ErrorResponse("Total budget is required", 400));
    }

    if (totalBudget < 0) {
      return next(new ErrorResponse("Budget cannot be negative", 400));
    }

    await checkWeddingAccess(req.params.weddingId, req.user.id, req.user.role);

    // Only couple or admin can update total budget
    if (req.user.role !== "couple" && req.user.role !== "admin") {
      return next(
        new ErrorResponse("Not authorized to update total budget", 403),
      );
    }

    let budget = await Budget.findOne({ wedding: req.params.weddingId });

    if (!budget) {
      return next(new ErrorResponse("Budget not found", 404));
    }

    budget.totalBudget = totalBudget;
    await budget.save();

    res.status(200).json({
      success: true,
      message: "Total budget updated successfully",
      data: budget,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add expense
// @route   POST /api/v1/budgets/wedding/:weddingId/expenses
// @access  Private (Couple, Planner, Admin)
exports.addExpense = async (req, res, next) => {
  try {
    const {
      category,
      description,
      budgetedAmount,
      actualAmount,
      vendor,
      notes,
    } = req.body;

    await checkWeddingAccess(req.params.weddingId, req.user.id, req.user.role);

    let budget = await Budget.findOne({ wedding: req.params.weddingId });

    if (!budget) {
      return next(new ErrorResponse("Budget not found", 404));
    }

    // Verify vendor exists if provided
    if (vendor) {
      const User = require("../models/User");
      const vendorUser = await User.findById(vendor);

      if (!vendorUser) {
        return next(new ErrorResponse("Vendor not found", 404));
      }

      if (vendorUser.role !== "vendor") {
        return next(new ErrorResponse("User is not a vendor", 400));
      }
    }

    const newExpense = {
      category,
      description,
      budgetedAmount,
      actualAmount: actualAmount || 0,
      vendor: vendor || null,
      notes: notes || "",
      isPaid: false,
    };

    budget.expenses.push(newExpense);
    await budget.save();

    await budget.populate("expenses.vendor", "fullName email vendorDetails");

    res.status(201).json({
      success: true,
      message: "Expense added successfully",
      data: budget,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update expense
// @route   PUT /api/v1/budgets/wedding/:weddingId/expenses/:expenseId
// @access  Private (Couple, Planner, Admin)
exports.updateExpense = async (req, res, next) => {
  try {
    await checkWeddingAccess(req.params.weddingId, req.user.id, req.user.role);

    const budget = await Budget.findOne({ wedding: req.params.weddingId });

    if (!budget) {
      return next(new ErrorResponse("Budget not found", 404));
    }

    const expense = budget.expenses.id(req.params.expenseId);

    if (!expense) {
      return next(new ErrorResponse("Expense not found", 404));
    }

    // Update fields
    const allowedFields = [
      "category",
      "description",
      "budgetedAmount",
      "actualAmount",
      "vendor",
      "notes",
      "isPaid",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        expense[field] = req.body[field];
      }
    });

    // Set paid date if marking as paid
    if (req.body.isPaid === true && !expense.paidDate) {
      expense.paidDate = Date.now();
    } else if (req.body.isPaid === false) {
      expense.paidDate = null;
    }

    await budget.save();
    await budget.populate("expenses.vendor", "fullName email vendorDetails");

    res.status(200).json({
      success: true,
      message: "Expense updated successfully",
      data: budget,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete expense
// @route   DELETE /api/v1/budgets/wedding/:weddingId/expenses/:expenseId
// @access  Private (Couple, Admin)
exports.deleteExpense = async (req, res, next) => {
  try {
    await checkWeddingAccess(req.params.weddingId, req.user.id, req.user.role);

    // Only couple or admin can delete expenses
    if (req.user.role !== "couple" && req.user.role !== "admin") {
      return next(new ErrorResponse("Not authorized to delete expenses", 403));
    }

    const budget = await Budget.findOne({ wedding: req.params.weddingId });

    if (!budget) {
      return next(new ErrorResponse("Budget not found", 404));
    }

    const expense = budget.expenses.id(req.params.expenseId);

    if (!expense) {
      return next(new ErrorResponse("Expense not found", 404));
    }

    expense.deleteOne();
    await budget.save();

    res.status(200).json({
      success: true,
      message: "Expense deleted successfully",
      data: budget,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark expense as paid
// @route   PUT /api/v1/budgets/wedding/:weddingId/expenses/:expenseId/mark-paid
// @access  Private (Couple, Planner, Admin)
exports.markExpensePaid = async (req, res, next) => {
  try {
    await checkWeddingAccess(req.params.weddingId, req.user.id, req.user.role);

    const budget = await Budget.findOne({ wedding: req.params.weddingId });

    if (!budget) {
      return next(new ErrorResponse("Budget not found", 404));
    }

    const expense = budget.expenses.id(req.params.expenseId);

    if (!expense) {
      return next(new ErrorResponse("Expense not found", 404));
    }

    expense.isPaid = true;
    expense.paidDate = Date.now();

    await budget.save();

    res.status(200).json({
      success: true,
      message: "Expense marked as paid",
      data: budget,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get budget summary
// @route   GET /api/v1/budgets/wedding/:weddingId/summary
// @access  Private (Couple, Planner, Admin)
exports.getBudgetSummary = async (req, res, next) => {
  try {
    await checkWeddingAccess(req.params.weddingId, req.user.id, req.user.role);

    const budget = await Budget.findOne({ wedding: req.params.weddingId });

    if (!budget) {
      return next(new ErrorResponse("Budget not found", 404));
    }

    // Calculate category-wise spending
    const categoryBreakdown = {};
    const categories = [
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
    ];

    categories.forEach((cat) => {
      const categoryExpenses = budget.expenses.filter(
        (e) => e.category === cat,
      );

      categoryBreakdown[cat] = {
        budgeted: categoryExpenses.reduce(
          (sum, e) => sum + e.budgetedAmount,
          0,
        ),
        actual: categoryExpenses.reduce((sum, e) => sum + e.actualAmount, 0),
        count: categoryExpenses.length,
      };
    });

    // Calculate payment status
    const paidExpenses = budget.expenses.filter((e) => e.isPaid);
    const unpaidExpenses = budget.expenses.filter((e) => !e.isPaid);

    const summary = {
      totalBudget: budget.totalBudget,
      totalSpent: budget.totalSpent,
      remainingBudget: budget.remainingBudget,
      utilizationPercentage: budget.utilizationPercentage,
      totalExpenses: budget.expenses.length,
      paidExpenses: paidExpenses.length,
      unpaidExpenses: unpaidExpenses.length,
      totalBudgeted: budget.expenses.reduce(
        (sum, e) => sum + e.budgetedAmount,
        0,
      ),
      categoryBreakdown,
    };

    res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get expenses by category
// @route   GET /api/v1/budgets/wedding/:weddingId/expenses/category/:category
// @access  Private (Couple, Planner, Admin)
exports.getExpensesByCategory = async (req, res, next) => {
  try {
    await checkWeddingAccess(req.params.weddingId, req.user.id, req.user.role);

    const budget = await Budget.findOne({
      wedding: req.params.weddingId,
    }).populate("expenses.vendor", "fullName email vendorDetails");

    if (!budget) {
      return next(new ErrorResponse("Budget not found", 404));
    }

    const categoryExpenses = budget.expenses.filter(
      (expense) => expense.category === req.params.category,
    );

    res.status(200).json({
      success: true,
      count: categoryExpenses.length,
      data: categoryExpenses,
    });
  } catch (error) {
    next(error);
  }
};
