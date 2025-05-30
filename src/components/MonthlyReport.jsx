// src/components/MonthlyReport.jsx
import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { Calendar, TrendingUp, TrendingDown, PieChart, ArrowLeft, ArrowRight } from 'lucide-react';

const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function MonthlyReport() {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();

  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [monthlyTransactions, setMonthlyTransactions] = useState([]);
  const [expensesByCategory, setExpensesByCategory] = useState({});
  const [totalMonthlyIncome, setTotalMonthlyIncome] = useState(0);
  const [totalMonthlyExpenses, setTotalMonthlyExpenses] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchMonthlyData = async () => {
      setLoading(true);
      const startDate = new Date(selectedYear, selectedMonth, 1);
      const endDate = new Date(selectedYear, selectedMonth + 1, 0, 23, 59, 59, 999);

      const transactionsRef = collection(db, "transactions");
      const q = query(transactionsRef,
        where("date", ">=", Timestamp.fromDate(startDate)),
        where("date", "<=", Timestamp.fromDate(endDate))
      );

      try {
        const querySnapshot = await getDocs(q);
        const transactions = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMonthlyTransactions(transactions);
      } catch (error) {
        console.error("Error fetching monthly transactions: ", error);
        setMonthlyTransactions([]);
      }
      setLoading(false);
    };

    fetchMonthlyData();
  }, [selectedYear, selectedMonth]);

  useEffect(() => {
    let income = 0;
    let expenses = 0;
    const categories = {};

    monthlyTransactions.forEach(tx => {
      if (tx.type === 'income') {
        income += tx.amount;
      } else if (tx.type === 'expense') {
        expenses += tx.amount;
        categories[tx.category] = (categories[tx.category] || 0) + tx.amount;
      }
    });

    setTotalMonthlyIncome(income);
    setTotalMonthlyExpenses(expenses);
    setExpensesByCategory(categories);
  }, [monthlyTransactions]);

  const navigateMonth = (direction) => {
    if (direction === 'prev') {
      if (selectedMonth === 0) {
        setSelectedMonth(11);
        setSelectedYear(selectedYear - 1);
      } else {
        setSelectedMonth(selectedMonth - 1);
      }
    } else {
      if (selectedMonth === 11) {
        setSelectedMonth(0);
        setSelectedYear(selectedYear + 1);
      } else {
        setSelectedMonth(selectedMonth + 1);
      }
    }
  };

  const netSavings = totalMonthlyIncome - totalMonthlyExpenses;
  const savingsRate = totalMonthlyIncome > 0 ? (netSavings / totalMonthlyIncome * 100) : 0;

  // Get top 5 expense categories
  const topCategories = Object.entries(expensesByCategory)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

  // Calculate percentage for each category
  const categoryPercentages = topCategories.map(([category, amount]) => ({
    category,
    amount,
    percentage: totalMonthlyExpenses > 0 ? (amount / totalMonthlyExpenses * 100) : 0,
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading report...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-800 flex items-center">
          <PieChart className="w-6 h-6 mr-2 text-indigo-600" />
          Monthly Report
        </h3>
      </div>

      {/* Month Navigation */}
      <div className="flex items-center justify-between bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-xl">
        <button
          onClick={() => navigateMonth('prev')}
          className="p-2 hover:bg-white/60 rounded-lg transition-colors duration-200"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        
        <div className="text-center">
          <h4 className="text-xl font-bold text-gray-800">
            {monthNames[selectedMonth]} {selectedYear}
          </h4>
          <p className="text-sm text-gray-600 flex items-center justify-center mt-1">
            <Calendar className="w-4 h-4 mr-1" />
            {monthlyTransactions.length} transactions
          </p>
        </div>
        
        <button
          onClick={() => navigateMonth('next')}
          className="p-2 hover:bg-white/60 rounded-lg transition-colors duration-200"
          disabled={selectedYear === currentYear && selectedMonth === currentMonth}
        >
          <ArrowRight className={`w-5 h-5 ${
            selectedYear === currentYear && selectedMonth === currentMonth 
              ? 'text-gray-300' 
              : 'text-gray-600'
          }`} />
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Income</p>
              <p className="text-xl font-bold text-green-600 mt-1">
                ${totalMonthlyIncome.toFixed(2)}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-500 opacity-20" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Expenses</p>
              <p className="text-xl font-bold text-red-600 mt-1">
                ${totalMonthlyExpenses.toFixed(2)}
              </p>
            </div>
            <TrendingDown className="w-8 h-8 text-red-500 opacity-20" />
          </div>
        </div>
      </div>

      {/* Net Savings */}
      <div className={`p-6 rounded-xl ${
        netSavings >= 0 
          ? 'bg-gradient-to-br from-emerald-50 to-green-50 border border-green-200' 
          : 'bg-gradient-to-br from-red-50 to-rose-50 border border-red-200'
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-sm font-medium ${netSavings >= 0 ? 'text-green-700' : 'text-red-700'}`}>
              Net Savings
            </p>
            <p className={`text-2xl font-bold ${netSavings >= 0 ? 'text-green-800' : 'text-red-800'}`}>
              ${Math.abs(netSavings).toFixed(2)}
            </p>
            <p className={`text-sm mt-1 ${netSavings >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {netSavings >= 0 
                ? `You saved ${savingsRate.toFixed(1)}% of your income!` 
                : `You overspent by ${Math.abs(savingsRate).toFixed(1)}%`}
            </p>
          </div>
          <div className={`text-4xl ${netSavings >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {netSavings >= 0 ? '📈' : '📉'}
          </div>
        </div>
      </div>

      {/* Top Expense Categories */}
      {totalMonthlyExpenses > 0 && categoryPercentages.length > 0 && (
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h4 className="font-semibold text-gray-800 mb-4">Top Expense Categories</h4>
          <div className="space-y-3">
            {categoryPercentages.map(({ category, amount, percentage }) => (
              <div key={category} className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium text-gray-700">{category}</span>
                  <span className="text-gray-600">
                    ${amount.toFixed(2)} ({percentage.toFixed(1)}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {monthlyTransactions.length === 0 && !loading && (
        <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500">No transactions found for this month.</p>
        </div>
      )}
    </div>
  );
}

export default MonthlyReport;