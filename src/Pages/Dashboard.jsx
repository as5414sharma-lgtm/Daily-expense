"use client"

import AddExpense from "../components/AddExpense"
import ExpenseList from "../components/ExpenseList"
import Filters from "../components/Filters"
import Charts from "../components/Charts"
import emailjs from '@emailjs/browser';
import { useState } from "react"

export default function Dashboard({ expenses, setExpenses }) {
  const [filter, setFilter] = useState("all")


  function getFilteredExpenses() {
    const today = new Date()
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay())
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)

    return expenses.filter((exp) => {
      const expDate = new Date(exp.date)
      const expDateOnly = new Date(expDate.getFullYear(), expDate.getMonth(), expDate.getDate())

      switch (filter) {
        case "daily":
          return expDateOnly.getTime() === startOfToday.getTime()
        case "weekly":
          return expDateOnly >= startOfWeek && expDateOnly <= today
        case "monthly":
          return expDate.getFullYear() === today.getFullYear() && expDate.getMonth() === today.getMonth()
        case "all":
        default:
          return true
      }
    })
  }
  const filteredExpenses = getFilteredExpenses()

  const sendEmail = (e, expenseSummary) => {
    const templateParams = {
      subject: "Payment Reminder: Invoice #INV-2023-115 Overdue",
      to_email: e, // EmailJS will use this for sending
      recipient_name: "John Smith",
      amount_due: "$1,250.00",
      invoice_date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      due_date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      invoice_number: "INV-2023-115",
      overdue_days: "5",
      bank_name: "Chase Bank",
      account_number: "XXXX-XXXX-9876",
      routing_number: "021000021",
      paypal_email: "payments@yourcompany.com",
      venmo_handle: "@YourCompany-Venmo",
      zelle_info: "555-123-4567",
      upi_id: "yourcompany@upi",
      cashapp_handle: "$YourCompanyApp",
      contact_email: "billing@yourcompany.com",
      sender_name: "Anmol sharma",
      sender_title: "Accounts Manager",
      sender_phone: "(555) 123-4567",
      current_year: new Date().getFullYear(),
      company_name: "Chit Fund App 25 days Money Double"
    };

    emailjs.send(
      'service_6mzj1hl',
      'template_aso469o',
      templateParams,
      {
        publicKey: 'dLRI2smx9rZ6cYxgh',
      }
    )
      .then((result) => {
        alert('Message Sent Successfully!');
        console.log(result.text);
      }, (error) => {
        console.log(error);
        alert('Something went wrong, please try again.');
      });
  }

  return (
    <div className="max-w-4xl mx-auto">
      
      <AddExpense setExpenses={setExpenses} sendEmail={sendEmail} />
      <Filters setFilter={setFilter} currentFilter={filter} />
      <ExpenseList expenses={filteredExpenses} setExpenses={setExpenses} />
      <Charts expenses={filteredExpenses} />
    </div>
  )
}
