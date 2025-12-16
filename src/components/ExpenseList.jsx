import { useState, useMemo } from "react";
import ExpenseItem from "./ExpenseItem";
import { Filter, Download, Search, SortAsc, Users } from "lucide-react";

export default function ExpenseList({ expenses, setExpenses }) {
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [filterCategory, setFilterCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSplitModal, setShowSplitModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);

  function deleteExpense(id) {
    if (window.confirm("Are you sure you want to delete this expense?")) {
      setExpenses((prev) => prev.filter((exp) => exp.id !== id));
    }
  }

  function editExpense(updated) {
    setExpenses((prev) =>
      prev.map((exp) => (exp.id === updated.id ? updated : exp))
    );
  }

  function splitBill(expense, splitData) {
    setExpenses((prev) =>
      prev.map((exp) => {
        if (exp.id === expense.id) {
          return {
            ...exp,
            split: splitData,
            splitAmount: expense.amount / splitData.totalPeople,
          };
        }
        return exp;
      })
    );
  }

  // Get unique categories for filter
  const categories = useMemo(() => {
    const cats = ["all", ...new Set(expenses.map((exp) => exp.category))];
    return cats;
  }, [expenses]);

  // Filter and sort expenses
  const filteredExpenses = useMemo(() => {
    let result = [...expenses];

    // Filter by category
    if (filterCategory !== "all") {
      result = result.filter((exp) => exp.category === filterCategory);
    }

    // Filter by search query
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (exp) =>
          exp.category.toLowerCase().includes(query) ||
          exp.note?.toLowerCase().includes(query)
      );
    }

    // Sort
    result.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case "amount":
          aValue = a.amount;
          bValue = b.amount;
          break;
        case "category":
          aValue = a.category.toLowerCase();
          bValue = b.category.toLowerCase();
          break;
        case "date":
        default:
          aValue = new Date(a.date);
          bValue = new Date(b.date);
          break;
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return result;
  }, [expenses, sortBy, sortOrder, filterCategory, searchQuery]);

  const totalAmount = useMemo(() => {
    return filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  }, [filteredExpenses]);

  // Calculate all split totals
  const splitSummary = useMemo(() => {
    const summary = {
      youOwe: 0,
      youAreOwed: 0,
      netBalance: 0,
      splits: []
    };

    expenses.forEach(exp => {
      if (exp.split) {
        const yourShare = exp.splitAmount || (exp.amount / exp.split.totalPeople);
        const othersShare = exp.amount - yourShare;
        
        if (exp.split.paidBy === 'you') {
          // You paid, others owe you
          summary.youAreOwed += othersShare;
          summary.splits.push({
            expense: exp,
            amount: othersShare,
            type: 'owed'
          });
        } else {
          // Someone else paid, you owe them
          summary.youOwe += yourShare;
          summary.splits.push({
            expense: exp,
            amount: yourShare,
            type: 'owe'
          });
        }
      }
    });

    summary.netBalance = summary.youAreOwed - summary.youOwe;
    return summary;
  }, [expenses]);

  // Open split modal
  const handleSplitBill = (expense) => {
    setSelectedExpense(expense);
    setShowSplitModal(true);
  };

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden max-w-4xl mx-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Expense History</h2>
              <p className="text-gray-500 text-sm mt-1">
                {filteredExpenses.length} expense{filteredExpenses.length !== 1 ? "s" : ""} • 
                Total: <span className="font-semibold text-gray-800 ml-1">₹{totalAmount.toFixed(2)}</span>
              </p>
            </div>

            {/* Split Summary */}
            <div className="flex items-center gap-4">
              {splitSummary.netBalance !== 0 && (
                <div className={`px-4 py-2 rounded-lg ${
                  splitSummary.netBalance > 0 
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  <div className="text-sm font-medium">
                    {splitSummary.netBalance > 0 ? 'You are owed' : 'You owe'}
                  </div>
                  <div className={`text-lg font-bold ${
                    splitSummary.netBalance > 0 ? 'text-green-800' : 'text-red-800'
                  }`}>
                    ₹{Math.abs(splitSummary.netBalance).toFixed(2)}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Filters & Search */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Search */}
            <div className="md:col-span-5">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by category or note..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="md:col-span-3">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none transition-all duration-200"
                >
                  <option value="all">All Categories</option>
                  {categories.filter(cat => cat !== "all").map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Sort By */}
            <div className="md:col-span-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
              >
                <option value="date">Sort by Date</option>
                <option value="amount">Sort by Amount</option>
                <option value="category">Sort by Category</option>
              </select>
            </div>

            {/* Sort Order */}
            <div className="md:col-span-2">
              <button
                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors duration-200 flex items-center justify-center gap-2 text-gray-700 font-medium"
              >
                <SortAsc className={`w-4 h-4 transition-transform ${sortOrder === "desc" ? "rotate-180" : ""}`} />
                {sortOrder === "asc" ? "Ascending" : "Descending"}
              </button>
            </div>
          </div>
        </div>

        {/* Expenses List */}
        <div className="p-6">
          {filteredExpenses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  {filteredExpenses.map((exp) => (
    <div key={exp.id} className="animate-fadeIn">
      <ExpenseItem
        exp={exp}
        onDelete={deleteExpense}
        onEdit={editExpense}
        onSplit={handleSplitBill}
      />
    </div>
  ))}
</div>

          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                {expenses.length === 0 ? "No expenses yet" : "No matching expenses found"}
              </h3>
              <p className="text-gray-500 max-w-md mx-auto">
                {expenses.length === 0 
                  ? "Start by adding your first expense to track your spending."
                  : "Try adjusting your filters or search query to find what you're looking for."
                }
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Split Bill Modal */}
      {showSplitModal && selectedExpense && (
        <SplitBillModal
          expense={selectedExpense}
          onClose={() => {
            setShowSplitModal(false);
            setSelectedExpense(null);
          }}
          onSplit={splitBill}
        />
      )}
    </>
  );
}

// Split Bill Modal Component
function SplitBillModal({ expense, onClose, onSplit }) {
  const [splitData, setSplitData] = useState({
    totalPeople: 2,
    paidBy: 'you',
    splitEqually: true,
    customShares: {}
  });

  const handleSplit = () => {
    onSplit(expense, splitData);
    onClose();
  };

  const perPersonAmount = expense.amount / splitData.totalPeople;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-800">Split Bill</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="font-medium text-gray-700">{expense.note || expense.category}</div>
            <div className="text-lg font-bold text-gray-800">₹{expense.amount.toFixed(2)}</div>
          </div>
          <div className="text-sm text-gray-500">{expense.date}</div>
        </div>

        <div className="space-y-4">
          {/* Total People */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Split between how many people?
            </label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSplitData(prev => ({ 
                  ...prev, 
                  totalPeople: Math.max(2, prev.totalPeople - 1) 
                }))}
                className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                −
              </button>
              <div className="flex-1 text-center">
                <div className="text-2xl font-bold">{splitData.totalPeople}</div>
                <div className="text-sm text-gray-500">people</div>
              </div>
              <button
                onClick={() => setSplitData(prev => ({ 
                  ...prev, 
                  totalPeople: prev.totalPeople + 1 
                }))}
                className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                +
              </button>
            </div>
          </div>

          {/* Paid By */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Who paid?
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setSplitData(prev => ({ ...prev, paidBy: 'you' }))}
                className={`px-4 py-3 rounded-lg border text-center ${
                  splitData.paidBy === 'you' 
                    ? 'bg-blue-50 border-blue-500 text-blue-700' 
                    : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className="font-medium">You</div>
                <div className="text-sm text-gray-500">Paid full amount</div>
              </button>
              <button
                onClick={() => setSplitData(prev => ({ ...prev, paidBy: 'others' }))}
                className={`px-4 py-3 rounded-lg border text-center ${
                  splitData.paidBy === 'others' 
                    ? 'bg-blue-50 border-blue-500 text-blue-700' 
                    : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className="font-medium">Others</div>
                <div className="text-sm text-gray-500">Others paid</div>
              </button>
            </div>
          </div>

          {/* Split Amount */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-center mb-2">
              <div className="text-sm text-gray-500">Each person pays</div>
              <div className="text-2xl font-bold text-gray-800">₹{perPersonAmount.toFixed(2)}</div>
            </div>
            {splitData.paidBy === 'you' ? (
              <div className="text-sm text-green-600 text-center">
                You'll get ₹{(expense.amount - perPersonAmount).toFixed(2)} back
              </div>
            ) : (
              <div className="text-sm text-red-600 text-center">
                You owe ₹{perPersonAmount.toFixed(2)}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSplit}
              className="flex-1 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
            >
              <Users className="w-4 h-4" />
              Split Bill
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}