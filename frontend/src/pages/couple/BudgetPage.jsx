import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/common/Layout";
import Loader from "../../components/common/Loader";
import weddingService from "../../services/weddingService";
import budgetService from "../../services/budgetService";
import { formatCurrency } from "../../utils/formatters";
import { BUDGET_CATEGORIES } from "../../utils/constants";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";

const BudgetPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [wedding, setWedding] = useState(null);
  const [budget, setBudget] = useState(null);
  const [summary, setSummary] = useState(null);
  const [showTotalBudgetModal, setShowTotalBudgetModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [totalBudgetInput, setTotalBudgetInput] = useState("");
  const [expenseForm, setExpenseForm] = useState({
    category: "",
    description: "",
    budgetedAmount: "",
    actualAmount: "",
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

      const budgetResponse = await budgetService.getBudget(weddingData._id);
      setBudget(budgetResponse.data);
      setTotalBudgetInput(budgetResponse.data.totalBudget.toString());

      const summaryResponse = await budgetService.getBudgetSummary(
        weddingData._id,
      );
      setSummary(summaryResponse.data);
    } catch (error) {
      console.error("Error fetching budget:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTotalBudget = async () => {
    try {
      await budgetService.updateTotalBudget(
        wedding._id,
        parseFloat(totalBudgetInput),
      );
      setShowTotalBudgetModal(false);
      fetchData();
    } catch (error) {
      console.error("Error updating total budget:", error);
      alert(error.response?.data?.message || "Failed to update budget");
    }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    try {
      const expenseData = {
        category: expenseForm.category,
        description: expenseForm.description,
        budgetedAmount: parseFloat(expenseForm.budgetedAmount),
        actualAmount: parseFloat(expenseForm.actualAmount || 0),
        notes: expenseForm.notes,
      };

      if (editingExpense) {
        await budgetService.updateExpense(
          wedding._id,
          editingExpense._id,
          expenseData,
        );
      } else {
        await budgetService.addExpense(wedding._id, expenseData);
      }

      setShowExpenseModal(false);
      setEditingExpense(null);
      setExpenseForm({
        category: "",
        description: "",
        budgetedAmount: "",
        actualAmount: "",
        notes: "",
      });
      fetchData();
    } catch (error) {
      console.error("Error saving expense:", error);
      alert(error.response?.data?.message || "Failed to save expense");
    }
  };

  const handleEditExpense = (expense) => {
    setEditingExpense(expense);
    setExpenseForm({
      category: expense.category,
      description: expense.description,
      budgetedAmount: expense.budgetedAmount.toString(),
      actualAmount: expense.actualAmount.toString(),
      notes: expense.notes || "",
    });
    setShowExpenseModal(true);
  };

  const handleDeleteExpense = async (expenseId) => {
    if (!window.confirm("Are you sure you want to delete this expense?"))
      return;

    try {
      await budgetService.deleteExpense(wedding._id, expenseId);
      fetchData();
    } catch (error) {
      console.error("Error deleting expense:", error);
      alert(error.response?.data?.message || "Failed to delete expense");
    }
  };

  const handleMarkPaid = async (expenseId) => {
    try {
      await budgetService.markExpensePaid(wedding._id, expenseId);
      fetchData();
    } catch (error) {
      console.error("Error marking expense as paid:", error);
      alert(error.response?.data?.message || "Failed to update expense");
    }
  };

  if (loading) {
    return (
      <Layout>
        <Loader />
      </Layout>
    );
  }

  const categoryColors = {
    photography: "bg-purple-100 text-purple-800",
    catering: "bg-orange-100 text-orange-800",
    decoration: "bg-pink-100 text-pink-800",
    venue: "bg-blue-100 text-blue-800",
    music: "bg-green-100 text-green-800",
    makeup: "bg-yellow-100 text-yellow-800",
    attire: "bg-red-100 text-red-800",
    invitations: "bg-indigo-100 text-indigo-800",
    transportation: "bg-teal-100 text-teal-800",
    accommodation: "bg-cyan-100 text-cyan-800",
    other: "bg-gray-100 text-gray-800",
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">
              Budget Tracker
            </h1>
            <p className="text-gray-600">{wedding?.title}</p>
          </div>
          <button
            onClick={() => setShowExpenseModal(true)}
            className="btn-primary flex items-center"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Add Expense
          </button>
        </div>

        {/* Budget Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div
            className="card cursor-pointer"
            onClick={() => setShowTotalBudgetModal(true)}
          >
            <div className="text-sm text-gray-600 mb-2">Total Budget</div>
            <div className="text-3xl font-bold text-gray-900">
              {formatCurrency(budget?.totalBudget || 0)}
            </div>
            <button className="text-sm text-primary-600 hover:text-primary-700 mt-2">
              Update Budget
            </button>
          </div>

          <div className="card bg-gradient-to-br from-red-50 to-orange-50">
            <div className="text-sm text-gray-600 mb-2">Total Spent</div>
            <div className="text-3xl font-bold text-red-600">
              {formatCurrency(budget?.totalSpent || 0)}
            </div>
            <div className="text-sm text-gray-600 mt-2">
              {budget?.utilizationPercentage || 0}% utilized
            </div>
          </div>

          <div className="card bg-gradient-to-br from-green-50 to-emerald-50">
            <div className="text-sm text-gray-600 mb-2">Remaining</div>
            <div className="text-3xl font-bold text-green-600">
              {formatCurrency(budget?.remainingBudget || 0)}
            </div>
          </div>

          <div className="card bg-gradient-to-br from-blue-50 to-cyan-50">
            <div className="text-sm text-gray-600 mb-2">Total Expenses</div>
            <div className="text-3xl font-bold text-blue-600">
              {budget?.expenses?.length || 0}
            </div>
            <div className="text-sm text-gray-600 mt-2">
              {summary?.paidExpenses || 0} paid
            </div>
          </div>
        </div>

        {/* Category Breakdown */}
        {summary && (
          <div className="card">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Category Breakdown
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(summary.categoryBreakdown).map(
                ([category, data]) => {
                  if (data.count === 0) return null;
                  const percentage = budget?.totalBudget
                    ? ((data.actual / budget.totalBudget) * 100).toFixed(1)
                    : 0;

                  return (
                    <div
                      key={category}
                      className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${categoryColors[category]}`}
                        >
                          {category}
                        </span>
                        <span className="text-sm text-gray-600">
                          {data.count} items
                        </span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Budgeted:</span>
                          <span className="font-semibold">
                            {formatCurrency(data.budgeted)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Spent:</span>
                          <span className="font-semibold">
                            {formatCurrency(data.actual)}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                          <div
                            className="bg-primary-500 h-2 rounded-full"
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                },
              )}
            </div>
          </div>
        )}

        {/* Expenses List */}
        <div className="card">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            All Expenses
          </h3>
          {budget?.expenses?.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>No expenses added yet.</p>
              <button
                onClick={() => setShowExpenseModal(true)}
                className="btn-primary mt-4"
              >
                Add Your First Expense
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                      Category
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                      Description
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                      Budgeted
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                      Actual
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900">
                      Status
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {budget?.expenses?.map((expense) => (
                    <tr key={expense._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${categoryColors[expense.category]}`}
                        >
                          {expense.category}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-gray-900">
                          {expense.description}
                        </div>
                        {expense.notes && (
                          <div className="text-xs text-gray-500">
                            {expense.notes}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right text-sm">
                        {formatCurrency(expense.budgetedAmount)}
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-semibold">
                        {formatCurrency(expense.actualAmount)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {expense.isPaid ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                            <CheckCircleIcon className="w-4 h-4 mr-1" />
                            Paid
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
                            <XCircleIcon className="w-4 h-4 mr-1" />
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center space-x-2">
                          {!expense.isPaid && (
                            <button
                              onClick={() => handleMarkPaid(expense._id)}
                              className="text-green-600 hover:text-green-700"
                              title="Mark as Paid"
                            >
                              <CheckCircleIcon className="w-5 h-5" />
                            </button>
                          )}
                          <button
                            onClick={() => handleEditExpense(expense)}
                            className="text-blue-600 hover:text-blue-700"
                            title="Edit"
                          >
                            <PencilIcon className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteExpense(expense._id)}
                            className="text-red-600 hover:text-red-700"
                            title="Delete"
                          >
                            <TrashIcon className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Total Budget Modal */}
      {showTotalBudgetModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Update Total Budget
            </h3>
            <div className="mb-6">
              <label className="label">Total Budget Amount</label>
              <input
                type="number"
                value={totalBudgetInput}
                onChange={(e) => setTotalBudgetInput(e.target.value)}
                className="input-field"
                placeholder="500000"
                min="0"
              />
            </div>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowTotalBudgetModal(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button onClick={handleUpdateTotalBudget} className="btn-primary">
                Update Budget
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Expense Modal */}
      {showExpenseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full my-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              {editingExpense ? "Edit Expense" : "Add New Expense"}
            </h3>
            <form onSubmit={handleAddExpense} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Category *</label>
                  <select
                    value={expenseForm.category}
                    onChange={(e) =>
                      setExpenseForm({
                        ...expenseForm,
                        category: e.target.value,
                      })
                    }
                    className="input-field"
                    required
                  >
                    <option value="">Select category</option>
                    {Object.keys(BUDGET_CATEGORIES).map((key) => (
                      <option key={key} value={BUDGET_CATEGORIES[key]}>
                        {BUDGET_CATEGORIES[key]}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label">Description *</label>
                  <input
                    type="text"
                    value={expenseForm.description}
                    onChange={(e) =>
                      setExpenseForm({
                        ...expenseForm,
                        description: e.target.value,
                      })
                    }
                    className="input-field"
                    placeholder="e.g., Professional photographer"
                    required
                  />
                </div>

                <div>
                  <label className="label">Budgeted Amount *</label>
                  <input
                    type="number"
                    value={expenseForm.budgetedAmount}
                    onChange={(e) =>
                      setExpenseForm({
                        ...expenseForm,
                        budgetedAmount: e.target.value,
                      })
                    }
                    className="input-field"
                    placeholder="50000"
                    min="0"
                    required
                  />
                </div>

                <div>
                  <label className="label">Actual Amount</label>
                  <input
                    type="number"
                    value={expenseForm.actualAmount}
                    onChange={(e) =>
                      setExpenseForm({
                        ...expenseForm,
                        actualAmount: e.target.value,
                      })
                    }
                    className="input-field"
                    placeholder="45000"
                    min="0"
                  />
                </div>
              </div>

              <div>
                <label className="label">Notes (Optional)</label>
                <textarea
                  value={expenseForm.notes}
                  onChange={(e) =>
                    setExpenseForm({ ...expenseForm, notes: e.target.value })
                  }
                  className="input-field"
                  rows="3"
                  placeholder="Additional details..."
                />
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowExpenseModal(false);
                    setEditingExpense(null);
                    setExpenseForm({
                      category: "",
                      description: "",
                      budgetedAmount: "",
                      actualAmount: "",
                      notes: "",
                    });
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingExpense ? "Update Expense" : "Add Expense"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default BudgetPage;
