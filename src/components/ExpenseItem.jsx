import { Pencil, Trash2, Users, Calendar, Save, X, Tag, IndianRupee, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export default function ExpenseItem({ exp, onDelete, onEdit, onSplit }) {
  const [isEditing, setIsEditing] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [amount, setAmount] = useState(exp.amount);
  const [category, setCategory] = useState(exp.category);
  const [selectedDate, setSelectedDate] = useState(new Date(exp.date));
  const [currentMonth, setCurrentMonth] = useState(new Date(exp.date));
  const [note, setNote] = useState(exp.note || "");
  const [customCategory, setCustomCategory] = useState("");
  const calendarRef = useRef(null);

  // Exact 9 categories from the image
  const categories = [
    "Food",
    "Transportation", 
    "Shopping",
    "Bills & Utilities",
    "Healthcare",
    "Travel",
    "Alcohol",
    "Gifts & Donations",
    "Other"
  ];

  // Close calendar when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setShowCalendar(false);
      }
    }
    
    if (showCalendar) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showCalendar]);

  const getCategoryIcon = (category) => {
    const cat = category.toLowerCase();
    if (cat.includes("food")) return "🍕";
    if (cat.includes("transport")) return "🚗";
    if (cat.includes("shopping")) return "🛍️";
    if (cat.includes("bills") || cat.includes("utilities")) return "📄";
    if (cat.includes("health")) return "🏥";
    if (cat.includes("travel")) return "✈️";
    if (cat.includes("alcohol")) return "🍷";
    if (cat.includes("gift") || cat.includes("donation")) return "🎁";
    return "💰"; // For "Other" or default
  };

  const formatDate = (date) => {
    return date.toLocaleDateString("en-US", { 
      weekday: "short", 
      month: "short", 
      day: "numeric" 
    });
  };

  // Get split payment info
  const getPaidByInfo = () => {
    if (!exp.split) return null;
    return exp.split.paidBy || 'you'; // 'you' or 'others'
  };

  const paidBy = getPaidByInfo();

  // Calendar functions
  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };

  const generateCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    
    const days = [];
    
    // Previous month days
    const prevMonthDays = getDaysInMonth(year, month - 1);
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({
        day: prevMonthDays - i,
        isCurrentMonth: false,
        isSelected: false,
        date: new Date(year, month - 1, prevMonthDays - i)
      });
    }
    
    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      days.push({
        day,
        isCurrentMonth: true,
        isSelected: date.toDateString() === selectedDate.toDateString(),
        date
      });
    }
    
    // Next month days
    const totalCells = 42; // 6 weeks * 7 days
    const nextMonthDays = totalCells - days.length;
    for (let day = 1; day <= nextMonthDays; day++) {
      days.push({
        day,
        isCurrentMonth: false,
        isSelected: false,
        date: new Date(year, month + 1, day)
      });
    }
    
    return days;
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setShowCalendar(false);
  };

  const handleToday = () => {
    const today = new Date();
    setSelectedDate(today);
    setCurrentMonth(today);
  };

  const handleClear = () => {
    setSelectedDate(new Date(exp.date));
    setShowCalendar(false);
  };

  const handleCustomCategory = () => {
    if (customCategory.trim()) {
      setCategory(customCategory.trim());
      setCustomCategory("");
    }
  };

  const handleSave = () => {
    const updatedExpense = {
      ...exp,
      amount: parseFloat(amount),
      category: category,
      date: selectedDate.toISOString(),
      note: note.trim()
    };
    
    onEdit(updatedExpense);
    setIsEditing(false);
    setShowCalendar(false);
  };

  const handleCancel = () => {
    setAmount(exp.amount);
    setCategory(exp.category);
    setSelectedDate(new Date(exp.date));
    setCurrentMonth(new Date(exp.date));
    setNote(exp.note || "");
    setCustomCategory("");
    setIsEditing(false);
    setShowCalendar(false);
  };

  const calendarDays = generateCalendar();
  const monthNames = ["January", "February", "March", "April", "May", "June", 
                     "July", "August", "September", "October", "November", "December"];
  const dayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  if (isEditing) {
    return (
      <div className="bg-white rounded-xl p-5 border-2 border-blue-500 shadow-lg">
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <Pencil className="w-5 h-5" />
              Edit Expense
            </h3>
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
              Editing Mode
            </span>
          </div>

          {/* Amount Field */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
              <IndianRupee className="w-4 h-4" />
              Amount
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600">₹</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                min="0"
                step="0.01"
                placeholder="Enter amount"
                required
              />
            </div>
          </div>

          {/* Category Field - Grid layout with 9 categories */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Tag className="w-4 h-4" />
              Category
            </label>
            
            {/* Grid of 9 categories - 3x3 layout */}
            <div className="grid grid-cols-3 gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`
                    px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200
                    flex flex-col items-center justify-center gap-1
                    ${category === cat
                      ? 'bg-blue-500 text-white shadow-md transform scale-105'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100 hover:shadow-sm border border-gray-200'
                    }
                  `}
                >
                  <span className="text-lg">{getCategoryIcon(cat)}</span>
                  <span className="text-xs">{cat}</span>
                </button>
              ))}
            </div>

            {/* Custom Category Input */}
            <div className="space-y-2 pt-2">
              <label className="block text-sm font-medium text-gray-600">
                Enter custom category (e.g., Entertainment, Health)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleCustomCategory()}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="Type custom category..."
                />
                <button
                  onClick={handleCustomCategory}
                  disabled={!customCategory.trim()}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    customCategory.trim()
                      ? 'bg-blue-500 text-white hover:bg-blue-600'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Add
                </button>
              </div>
              {customCategory.trim() && category === customCategory.trim() && (
                <div className="text-xs text-green-600 flex items-center gap-1">
                  ✓ Using custom category: "{customCategory}"
                </div>
              )}
            </div>

            {/* Selected Category Display */}
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-sm text-blue-700 flex items-center gap-2">
                <span className="font-semibold">Selected:</span>
                <span className="px-3 py-1 bg-white rounded-full text-blue-600 border border-blue-300">
                  {category}
                </span>
              </div>
            </div>
          </div>

          {/* Date Field with Calendar */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Date
            </label>
            <div className="relative">
              <input
                type="text"
                value={selectedDate.toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric', 
                  year: 'numeric' 
                })}
                readOnly
                onClick={() => setShowCalendar(!showCalendar)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all cursor-pointer bg-white"
                placeholder="Select date"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <Calendar className="w-5 h-5 text-gray-500" />
              </div>
              
              {/* Calendar Popup */}
              {showCalendar && (
                <div 
                  ref={calendarRef}
                  className="absolute z-50 mt-2 w-full bg-white border border-gray-300 rounded-xl shadow-xl p-4"
                >
                  {/* Calendar Header */}
                  <div className="flex items-center justify-between mb-4">
                    <button
                      onClick={handlePrevMonth}
                      className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div className="text-lg font-semibold">
                      {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                    </div>
                    <button
                      onClick={handleNextMonth}
                      className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                  
                  {/* Day Headers */}
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {dayNames.map(day => (
                      <div key={day} className="text-center text-sm font-medium text-gray-500 py-1">
                        {day}
                      </div>
                    ))}
                  </div>
                  
                  {/* Calendar Days */}
                  <div className="grid grid-cols-7 gap-1">
                    {calendarDays.map((dayObj, index) => (
                      <button
                        key={index}
                        onClick={() => handleDateSelect(dayObj.date)}
                        className={`
                          h-10 rounded-lg flex items-center justify-center text-sm
                          ${!dayObj.isCurrentMonth ? 'text-gray-400' : 'text-gray-700'}
                          ${dayObj.isSelected ? 'bg-blue-500 text-white' : ''}
                          ${dayObj.isCurrentMonth && !dayObj.isSelected ? 'hover:bg-gray-100' : ''}
                          transition-colors
                        `}
                      >
                        {dayObj.day}
                      </button>
                    ))}
                  </div>
                  
                  {/* Calendar Footer */}
                  <div className="flex justify-between mt-4 pt-4 border-t border-gray-200">
                    <button
                      onClick={handleClear}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg"
                    >
                      Clear
                    </button>
                    <button
                      onClick={handleToday}
                      className="px-4 py-2 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg"
                    >
                      Today
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Note Field */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Note (Optional)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all resize-none"
              placeholder="Add a note for this expense..."
              rows="2"
            />
          </div>

          {/* Split Info (if exists) - SIMPLIFIED */}
          {exp.split && (
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-sm text-blue-700">
                <strong>Split Bill:</strong>
                <div className="mt-1">
                  <span className="font-medium">Paid by: </span>
                  <span className={`font-bold ${paidBy === 'you' ? 'text-green-600' : 'text-blue-600'}`}>
                    {paidBy === 'you' ? 'You' : 'Others'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={handleSave}
              className="flex-1 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200 flex items-center justify-center gap-2 font-semibold"
            >
              <Save className="w-5 h-5" />
              Save Changes
            </button>
            <button
              onClick={handleCancel}
              className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-200 flex items-center justify-center gap-2 font-semibold"
            >
              <X className="w-5 h-5" />
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  // View Mode (Not Editing)
  return (
    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:border-gray-300 transition-all duration-200">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{getCategoryIcon(exp.category)}</span>
          <div>
            <div className="text-xl font-bold text-gray-800">
              ₹{exp.amount.toFixed(2)}
            </div>
            <div className="text-sm text-gray-500">
              {exp.category}
            </div>
          </div>
        </div>
        
        <div className="flex flex-col items-end gap-2">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            exp.category.toLowerCase().includes("food")
              ? "bg-green-100 text-green-700"
              : exp.category.toLowerCase().includes("transport")
                ? "bg-purple-100 text-purple-700"
                : exp.category.toLowerCase().includes("shopping")
                  ? "bg-yellow-100 text-yellow-700"
                  : exp.category.toLowerCase().includes("bills") || exp.category.toLowerCase().includes("utilities")
                    ? "bg-blue-100 text-blue-700"
                    : exp.category.toLowerCase().includes("health")
                      ? "bg-red-100 text-red-700"
                      : exp.category.toLowerCase().includes("travel")
                        ? "bg-indigo-100 text-indigo-700"
                        : exp.category.toLowerCase().includes("alcohol")
                          ? "bg-orange-100 text-orange-700"
                          : exp.category.toLowerCase().includes("gift") || exp.category.toLowerCase().includes("donation")
                            ? "bg-pink-100 text-pink-700"
                            : "bg-gray-100 text-gray-700" // For "Other" or custom
          }`}>
            {exp.category}
          </span>
          
          {/* Simple Split Badge */}
          {exp.split && (
            <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded ${
              paidBy === 'you' 
                ? 'bg-green-100 text-green-700' 
                : 'bg-blue-100 text-blue-700'
            }`}>
              <Users className="w-3 h-3" />
              <span>Paid by {paidBy === 'you' ? 'You' : 'Others'}</span>
            </div>
          )}
        </div>
      </div>

      {exp.note && (
        <div className="mb-3 p-3 bg-white rounded-lg border border-gray-200">
          <div className="font-medium text-gray-800">{exp.note}</div>
        </div>
      )}

      {/* Simple Split Info in View Mode */}
      {exp.split && (
        <div className="mb-3 p-3 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Split Bill</span>
            <span className={`text-sm font-bold ${
              paidBy === 'you' ? 'text-green-600' : 'text-blue-600'
            }`}>
              Paid by {paidBy === 'you' ? 'You' : 'Others'}
            </span>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between text-sm pt-3 border-t border-gray-200">
        <div className="flex items-center gap-2 text-gray-500">
          <Calendar className="w-4 h-4" />
          <span>{formatDate(new Date(exp.date))}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => onSplit(exp)}
            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Split Bill"
          >
            <Users className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsEditing(true)}
            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Edit Expense"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              if (window.confirm("Are you sure you want to delete this expense?")) {
                onDelete(exp.id);
              }
            }}
            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete Expense"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}