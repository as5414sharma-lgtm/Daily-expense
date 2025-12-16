import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid
} from "recharts";
import { TrendingUp, PieChart as PieChartIcon, BarChart3, DollarSign } from "lucide-react";

export default function Charts({ expenses }) {
  // Calculate category totals with colors
  const categoryTotals = expenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
    return acc;
  }, {});

  const categoryColors = {
    'Food': '#FF6B6B',
    'Travel': '#4ECDC4',
    'Shopping': '#FFD166',
    'Bills': '#06D6A0',
    'Other': '#118AB2'
  };

  const categoryData = Object.entries(categoryTotals).map(([cat, total]) => ({
    name: cat,
    value: total,
    color: categoryColors[cat] || '#8884d8'
  })).sort((a, b) => b.value - a.value);

 
  const dailyTotals = expenses.reduce((acc, exp) => {
    acc[exp.date] = (acc[exp.date] || 0) + exp.amount;
    return acc;
  }, {});

  const dailyData = Object.entries(dailyTotals)
    .map(([d, total]) => ({
      date: new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      fullDate: d,
      total,
      day: new Date(d).toLocaleDateString('en-US', { weekday: 'short' })
    }))
    .sort((a, b) => new Date(a.fullDate) - new Date(b.fullDate))
    .slice(-7); // Last 7 days

  // Stats calculations
  const totalExpense = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const averageExpense = expenses.length > 0 ? totalExpense / expenses.length : 0;
  const topCategory = categoryData.length > 0 ? categoryData[0] : null;

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-xl border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Total Spent</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">₹{totalExpense.toFixed(2)}</p>
            </div>
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 p-5 rounded-xl border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">Average Expense</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">₹{averageExpense.toFixed(2)}</p>
            </div>
            <div className="p-2 bg-green-500/10 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-5 rounded-xl border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 font-medium">Transactions</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{expenses.length}</p>
            </div>
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <BarChart3 className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-5 rounded-xl border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-600 font-medium">Top Category</p>
              <p className="text-lg font-bold text-gray-800 mt-1 truncate">
                {topCategory ? topCategory.name : 'N/A'}
              </p>
              <p className="text-sm text-gray-600">
                {topCategory ? `₹${topCategory.value.toFixed(2)}` : ''}
              </p>
            </div>
            <div className="p-2 bg-orange-500/10 rounded-lg">
              <PieChartIcon className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Pie Chart Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <PieChartIcon className="w-5 h-5 text-blue-600" />
                  Expense by Category
                </h3>
                <p className="text-sm text-gray-500 mt-1">Breakdown of your spending</p>
              </div>
              <div className="text-sm font-medium text-gray-600">
                Total: <span className="text-gray-800">₹{totalExpense.toFixed(2)}</span>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                    label={(entry) => `${entry.name}: ₹${entry.value.toFixed(2)}`}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="#fff" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [`₹${Number(value).toFixed(2)}`, 'Amount']}
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36}
                    formatter={(value) => <span className="text-sm text-gray-700">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            {/* Category Breakdown List */}
            <div className="mt-6 space-y-3">
              {categoryData.map((category) => {
                const percentage = ((category.value / totalExpense) * 100).toFixed(1);
                return (
                  <div key={category.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: category.color }}
                      />
                      <span className="font-medium text-gray-700">{category.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-800">₹{category.value.toFixed(2)}</div>
                      <div className="text-sm text-gray-500">{percentage}%</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bar Chart Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-green-600" />
                  Daily Expenses (Last 7 Days)
                </h3>
                <p className="text-sm text-gray-500 mt-1">Your spending trends</p>
              </div>
              <div className="text-sm font-medium text-gray-600">
                Period: <span className="text-gray-800">7 days</span>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fill: '#666' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{ fill: '#666' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value) => `₹${value}`}
                  />
                  <Tooltip 
                    formatter={(value) => [`₹${Number(value).toFixed(2)}`, 'Amount']}
                    labelFormatter={(label) => `Date: ${label}`}
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Bar 
                    dataKey="total" 
                    radius={[4, 4, 0, 0]}
                    fill="#4ECDC4"
                    name="Daily Expense"
                  >
                    {dailyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.total > 1000 ? '#06D6A0' : '#4ECDC4'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            {/* Daily Stats */}
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600">Highest Day</div>
                <div className="text-lg font-bold text-gray-800">
                  {dailyData.length > 0 
                    ? dailyData.reduce((max, day) => day.total > max.total ? day : max, dailyData[0]).date
                    : 'N/A'
                  }
                </div>
                <div className="text-sm text-gray-500">
                  ₹{dailyData.length > 0 
                    ? dailyData.reduce((max, day) => day.total > max.total ? day : max, dailyData[0]).total.toFixed(2)
                    : '0.00'
                  }
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600">Lowest Day</div>
                <div className="text-lg font-bold text-gray-800">
                  {dailyData.length > 0 
                    ? dailyData.reduce((min, day) => day.total < min.total ? day : min, dailyData[0]).date
                    : 'N/A'
                  }
                </div>
                <div className="text-sm text-gray-500">
                  ₹{dailyData.length > 0 
                    ? dailyData.reduce((min, day) => day.total < min.total ? day : min, dailyData[0]).total.toFixed(2)
                    : '0.00'
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {expenses.length === 0 && (
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-12 text-center border border-gray-200">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 mx-auto bg-gray-200 rounded-full flex items-center justify-center mb-4">
              <BarChart3 className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">No Data Available</h3>
            <p className="text-gray-500 mb-6">
              Start adding expenses to see beautiful charts and insights about your spending habits.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}