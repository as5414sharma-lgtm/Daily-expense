"use client"

export default function Filters({ setFilter, currentFilter }) {
  const buttonClass = (type) =>
    `px-4 py-2 rounded font-medium transition ${
      currentFilter === type ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800 hover:bg-gray-300"
    }`

  return (
    <div className="flex gap-3 mt-6">
      <button onClick={() => setFilter("daily")} className={buttonClass("daily")}>
        Daily
      </button>
      <button onClick={() => setFilter("weekly")} className={buttonClass("weekly")}>
        Weekly
      </button>
      <button onClick={() => setFilter("monthly")} className={buttonClass("monthly")}>
        Monthly
      </button>
      <button onClick={() => setFilter("all")} className={buttonClass("all")}>
        All
      </button>
    </div>
  )
}
