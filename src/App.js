import { useState, useEffect } from "react";
import Dashboard from "./Pages/Dashboard";

function App() {
  
const [expenses, setExpenses] = useState(() => {
  const stored = localStorage.getItem("expenses");
  return stored ? JSON.parse(stored) : [];
});
useEffect(() => {
  localStorage.setItem("expenses", JSON.stringify(expenses));
}, [expenses]);
  useEffect(() => {
    const saved = localStorage.getItem("expenses");
    if (saved) setExpenses(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("expenses", JSON.stringify(expenses));
  }, [expenses]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Dashboard expenses={expenses} setExpenses={setExpenses} />
    </div>
  );
}

export default App;
