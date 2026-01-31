const express = require("express");
const { body } = require("express-validator");
const {
  getBudget,
  updateTotalBudget,
  addExpense,
  updateExpense,
  deleteExpense,
  markExpensePaid,
  getBudgetSummary,
  getExpensesByCategory,
} = require("../controllers/budgetController");
const { protect, authorize } = require("../middleware/auth");
const { validate } = require("../middleware/validation");

const router = express.Router();

// Validation rules
const addExpenseValidation = [
  body("category")
    .notEmpty()
    .withMessage("Category is required")
    .isIn([
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
    ])
    .withMessage("Invalid category"),
  body("description").trim().notEmpty().withMessage("Description is required"),
  body("budgetedAmount")
    .notEmpty()
    .withMessage("Budgeted amount is required")
    .isNumeric()
    .withMessage("Budgeted amount must be a number")
    .custom((value) => value >= 0)
    .withMessage("Budgeted amount cannot be negative"),
  body("actualAmount")
    .optional()
    .isNumeric()
    .withMessage("Actual amount must be a number")
    .custom((value) => value >= 0)
    .withMessage("Actual amount cannot be negative"),
];

const updateTotalBudgetValidation = [
  body("totalBudget")
    .notEmpty()
    .withMessage("Total budget is required")
    .isNumeric()
    .withMessage("Total budget must be a number")
    .custom((value) => value >= 0)
    .withMessage("Total budget cannot be negative"),
];

// Routes
router.get(
  "/wedding/:weddingId",
  protect,
  authorize("couple", "planner", "admin"),
  getBudget,
);

router.put(
  "/wedding/:weddingId",
  protect,
  authorize("couple", "admin"),
  updateTotalBudgetValidation,
  validate,
  updateTotalBudget,
);

router.get(
  "/wedding/:weddingId/summary",
  protect,
  authorize("couple", "planner", "admin"),
  getBudgetSummary,
);

router.get(
  "/wedding/:weddingId/expenses/category/:category",
  protect,
  authorize("couple", "planner", "admin"),
  getExpensesByCategory,
);

router.post(
  "/wedding/:weddingId/expenses",
  protect,
  authorize("couple", "planner", "admin"),
  addExpenseValidation,
  validate,
  addExpense,
);

router.put(
  "/wedding/:weddingId/expenses/:expenseId",
  protect,
  authorize("couple", "planner", "admin"),
  updateExpense,
);

router.delete(
  "/wedding/:weddingId/expenses/:expenseId",
  protect,
  authorize("couple", "admin"),
  deleteExpense,
);

router.put(
  "/wedding/:weddingId/expenses/:expenseId/mark-paid",
  protect,
  authorize("couple", "planner", "admin"),
  markExpensePaid,
);

module.exports = router;
