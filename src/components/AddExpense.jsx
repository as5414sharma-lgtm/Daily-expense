import { useState } from "react";
import {
  PlusCircle,
  Calendar,
  Tag,
  FileText,
  DollarSign,
  Utensils,
  Car,
  ShoppingBag,
  Receipt,
  Heart,
  Plane,
  Wine,
  Gift,
  MoreHorizontal,
  Send,
  Mail,
  CheckCircle,
  AlertCircle
} from "lucide-react";

export default function AddExpense({ setExpenses, sendEmail }) {
  const today = new Date().toISOString().split("T")[0];

  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food");
  const [otherCategory, setOtherCategory] = useState("");
  const [date, setDate] = useState(today);
  const [note, setNote] = useState("");
  const [email, setEmail] = useState("");
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailStatus, setEmailStatus] = useState(null); // null, "success", "error"
  const [emailMessage, setEmailMessage] = useState("");

  // Category data with matching border colors
  const categories = [
    {
      id: "Food", name: "Food", icon: Utensils,
      bgColor: "bg-orange-100", textColor: "text-orange-700",
      borderColor: "border-orange-200", iconColor: "text-orange-500",
      selectedBorder: "border-orange-400"
    },

    {
      id: "Transportation", name: "Transport", icon: Car,
      bgColor: "bg-blue-100", textColor: "text-blue-700",
      borderColor: "border-blue-200", iconColor: "text-blue-500",
      selectedBorder: "border-blue-400"
    },

    {
      id: "Shopping", name: "Shopping", icon: ShoppingBag,
      bgColor: "bg-purple-100", textColor: "text-purple-700",
      borderColor: "border-purple-200", iconColor: "text-purple-500",
      selectedBorder: "border-purple-400"
    },

    {
      id: "Bills & Utilities", name: "Bills", icon: Receipt,
      bgColor: "bg-green-100", textColor: "text-green-700",
      borderColor: "border-green-200", iconColor: "text-green-500",
      selectedBorder: "border-green-400"
    },

    {
      id: "Healthcare", name: "Health", icon: Heart,
      bgColor: "bg-red-100", textColor: "text-red-700",
      borderColor: "border-red-200", iconColor: "text-red-500",
      selectedBorder: "border-red-400"
    },

    {
      id: "Travel", name: "Travel", icon: Plane,
      bgColor: "bg-cyan-100", textColor: "text-cyan-700",
      borderColor: "border-cyan-200", iconColor: "text-cyan-500",
      selectedBorder: "border-cyan-400"
    },

    {
      id: "Alcohol", name: "Alcohol", icon: Wine,
      bgColor: "bg-amber-100", textColor: "text-amber-700",
      borderColor: "border-amber-200", iconColor: "text-amber-500",
      selectedBorder: "border-amber-400"
    },

    {
      id: "Gifts & Donations", name: "Gifts", icon: Gift,
      bgColor: "bg-pink-100", textColor: "text-pink-700",
      borderColor: "border-pink-200", iconColor: "text-pink-500",
      selectedBorder: "border-pink-400"
    },

    {
      id: "Other", name: "Other", icon: MoreHorizontal,
      bgColor: "bg-gray-100", textColor: "text-gray-700",
      borderColor: "border-gray-200", iconColor: "text-gray-500",
      selectedBorder: "border-gray-400"
    },
  ];

  // Function to validate email
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  // Function to generate expense summary
  const generateExpenseSummary = () => {
    const finalCategory = category === "Other" ? otherCategory : category;
    return {
      amount: parseFloat(amount),
      category: finalCategory,
      date: new Date(date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      note: note || "No additional notes",
      formattedAmount: `₹${parseFloat(amount).toFixed(2)}`
    };
  };

  // Function to simulate sending email
  const sendExpenseEmail = async () => {
    if (!validateEmail(email)) {
      setEmailStatus("error");
      setEmailMessage("Please enter a valid email address");
      setTimeout(() => setEmailStatus(null), 3000);
      return false;
    }

    setIsSendingEmail(true);
    setEmailStatus(null);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      const expenseSummary = generateExpenseSummary();
      const isEmailValid = validateEmail(email);
      const isServerAvailable = Math.random() > 0.1; // 90% chance of success
      if (!isEmailValid) {
        throw new Error("Invalid email address format");
      }
      if (!isServerAvailable) {
        throw new Error("Email service temporarily unavailable");
      }

      sendEmail(email, expenseSummary); // Assume this function sends the email

      setTimeout(() => {
        setEmail("");
        setEmailStatus(null);
      }, 3000);

      return true;
    } catch (error) {
      console.error("Email sending failed:", error);
      setEmailStatus("error");
      setEmailMessage(`Failed to send email: ${error.message || "Please try again later"}`);

      setTimeout(() => setEmailStatus(null), 4000);
      return false;
    } finally {
      setIsSendingEmail(false);
    }
  };

  // Function to add expense to local state
  function addExpense(e) {
    e.preventDefault();

    if (!validateForm()) return;

    const finalCategory = category === "Other" ? otherCategory : category;

    const newExpense = {
      id: Date.now(),
      amount: parseFloat(amount),
      category: finalCategory,
      date,
      note,
      sharedViaEmail: false
    };

    setExpenses((prev) => [...prev, newExpense]);
    resetForm();
  }

  // Function to add expense and send email separately
  async function addExpenseAndSendEmail(e) {
    e.preventDefault();

    if (!validateForm()) return;

    const finalCategory = category === "Other" ? otherCategory : category;

    const newExpense = {
      id: Date.now(),
      amount: parseFloat(amount),
      category: finalCategory,
      date,
      note,
      sharedViaEmail: false, // Will be updated after email is sent
      emailRecipient: email
    };

    // First add the expense
    setExpenses((prev) => [...prev, newExpense]);

    // Then send email separately
    const emailSent = await sendExpenseEmail();

    // Update the expense if email was sent
    if (emailSent) {
      setExpenses((prev) =>
        prev.map(exp =>
          exp.id === newExpense.id
            ? { ...exp, sharedViaEmail: true, emailSentAt: new Date().toISOString() }
            : exp
        )
      );

      // Reset form after successful email
      resetForm();
    }
  }

  // Function to just send email without saving
  async function sendEmailOnly(e) {
    e.preventDefault();

    if (!validateForm()) return;

    await sendExpenseEmail();
  }

  // Validate form
  function validateForm() {
    if (!amount || parseFloat(amount) <= 0) {
      setEmailStatus("error");
      setEmailMessage("Please enter a valid amount");
      setTimeout(() => setEmailStatus(null), 3000);
      return false;
    }

    if (category === "Other" && otherCategory.trim() === "") {
      setEmailStatus("error");
      setEmailMessage("Please enter the expense type for 'Other'");
      setTimeout(() => setEmailStatus(null), 3000);
      return false;
    }

    return true;
  }

  // Reset form
  function resetForm() {
    setAmount("");
    setCategory("Food");
    setOtherCategory("");
    setDate(today);
    setNote("");
  }

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-2xl shadow-lg border border-gray-100">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
          <PlusCircle className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-800">Add New Expense</h2>
          <p className="text-xs text-gray-500 mt-0.5">Track and share your expenses</p>
        </div>
      </div>

      <form onSubmit={addExpense} className="space-y-5">
        {/* Amount Field */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <div className="p-1 bg-blue-50 rounded-md">
              <DollarSign className="w-3.5 h-3.5 text-blue-600" />
            </div>
            Amount
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-700 text-base font-semibold">
              ₹
            </span>
            <input
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
              step="0.01"
              min="0"
              required
            />
          </div>
        </div>

        {/* Compact Category Field - 6 per row */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <div className="p-1 bg-purple-50 rounded-md">
              <Tag className="w-3.5 h-3.5 text-purple-600" />
            </div>
            Category
          </label>

          <div className="grid grid-cols-6 gap-2">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isSelected = category === cat.id;

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all duration-200 ${cat.bgColor} ${cat.textColor} ${isSelected
                    ? `${cat.selectedBorder} border-2 shadow-sm transform scale-105`
                    : `${cat.borderColor} hover:shadow-xs`
                    }`}
                >
                  <div className={`p-1 rounded-md ${isSelected ? 'bg-white/50' : 'bg-white/30'}`}>
                    <Icon className={`w-4 h-4 ${cat.iconColor}`} />
                  </div>
                  <span className="text-xs font-medium mt-1 truncate w-full text-center">
                    {cat.name}
                  </span>
                </button>
              );
            })}
          </div>

          {category === "Other" && (
            <div className="mt-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Enter custom category"
                  value={otherCategory}
                  onChange={(e) => setOtherCategory(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-sm bg-white border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
                  required
                />
                <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              </div>
            </div>
          )}
        </div>

        {/* Date Field */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <div className="p-1 bg-green-50 rounded-md">
              <Calendar className="w-3.5 h-3.5 text-green-600" />
            </div>
            Date
          </label>
          <div className="relative">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full pl-9 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-1 focus:ring-green-500 focus:border-green-500 outline-none transition-all duration-200"
              required
            />
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          </div>
        </div>

        {/* Note Field */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <div className="p-1 bg-amber-50 rounded-md">
              <FileText className="w-3.5 h-3.5 text-amber-600" />
            </div>
            Note (Optional)
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Add a brief description..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full pl-9 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-1 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all duration-200"
            />
            <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          </div>
        </div>

        {/* Email Section */}
        <div className="space-y-2 pt-2 border-t border-gray-100">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <div className="p-1 bg-indigo-50 rounded-md">
              <Mail className="w-3.5 h-3.5 text-indigo-600" />
            </div>
            Share Expense via Email
          </label>
          
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <input
                type="email"
                placeholder="recipient@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-sm bg-white border border-indigo-200 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-200"
              />
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-indigo-400" />
            </div>

            <button
              type="button"
              onClick={sendEmailOnly}
              disabled={!email || isSendingEmail}
              className="px-4 py-2.5 bg-indigo-50 text-indigo-700 font-medium rounded-lg border border-indigo-200 hover:bg-indigo-100 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSendingEmail ? (
                <>
                  <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm">Sending...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span className="text-sm">Send Email</span>
                </>
              )}
            </button>
          </div>

          <p className="text-xs text-gray-500">
            Send expense details to someone without saving it locally
          </p>
        </div>

        {/* Status Messages */}
        {emailStatus && (
          <div className={`flex items-center gap-2 p-3 rounded-lg border animate-fadeIn ${emailStatus === "success"
            ? "bg-green-50 border-green-200"
            : "bg-red-50 border-red-200"
            }`}>
            {emailStatus === "success" ? (
              <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
            )}
            <span className={`text-sm font-medium ${emailStatus === "success" ? "text-green-700" : "text-red-700"
              }`}>
              {emailMessage}
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-3 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            {/* Save Only Button */}
            <button
              type="submit"
              disabled={!amount || parseFloat(amount) <= 0}
              className="py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-blue-700 focus:ring-2 focus:ring-blue-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center justify-center gap-2">
                <PlusCircle className="w-4 h-4" />
                <span className="text-sm">Save Expense</span>
              </div>
            </button>

            {/* Save & Email Button */}
            <button
              type="button"
              onClick={addExpenseAndSendEmail}
              disabled={!amount || parseFloat(amount) <= 0 || !email}
              className="py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-600 hover:to-purple-700 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center justify-center gap-2">
                {isSendingEmail ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm">Saving & Sending...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span className="text-sm">Save & Email</span>
                  </>
                )}
              </div>
            </button>
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-500">
              <span className="font-medium text-blue-600">Save Expense:</span> Store locally •
              <span className="font-medium text-indigo-600 ml-2">Send Email:</span> Share only •
              <span className="font-medium text-purple-600 ml-2">Save & Email:</span> Both
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}