// src/components/TransactionForm.jsx
import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { PlusCircle, CheckCircle, XCircle } from 'lucide-react';

const expenseCategories = [
  "Food", "Transport", "Housing", "Utilities", "Healthcare",
  "Entertainment", "Shopping/Personal Care", "Education", "Gifts/Donations", "Other"
];

const incomeCategories = [
  "Salary", "Bonus", "Investment Income", "Gifts Received", "Other"
];

function TransactionForm() {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense');
  const [category, setCategory] = useState(expenseCategories[0]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [currentCategories, setCurrentCategories] = useState(expenseCategories);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (type === 'expense') {
      setCurrentCategories(expenseCategories);
      if (!expenseCategories.includes(category)) {
        setCategory(expenseCategories[0]);
      }
    } else if (type === 'income') {
      setCurrentCategories(incomeCategories);
      if (!incomeCategories.includes(category)) {
        setCategory(incomeCategories[0]);
      }
    }
  }, [type, category]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    if (!description || amount === '' || !category || !date) {
      setError('Please fill in all required fields.');
      setIsSubmitting(false);
      return;
    }
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setError('Please enter a valid positive amount.');
      setIsSubmitting(false);
      return;
    }

    try {
      await addDoc(collection(db, "transactions"), {
        description: description.trim(),
        amount: numericAmount,
        type: type,
        category: category,
        date: Timestamp.fromDate(new Date(date + "T00:00:00")),
        createdAt: Timestamp.now()
      });

      setSuccess('Transaction added successfully!');
      setDescription('');
      setAmount('');
      setDate(new Date().toISOString().split('T')[0]);
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error("Error adding transaction: ", err);
      setError("Failed to add transaction. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300">
      <div className="flex items-center justify-center mb-8">
        <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full">
          <PlusCircle className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-gray-800 ml-3 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          Add Transaction
        </h3>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center animate-slide-up">
          <XCircle className="w-5 h-5 text-red-600 mr-2" />
          <p className="text-red-700 text-sm font-medium">{error}</p>
        </div>
      )}
      
      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center animate-slide-up">
          <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
          <p className="text-green-700 text-sm font-medium">{success}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="group">
          <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
            Description
          </label>
          <input
            id="description"
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g., Groceries at Whole Foods"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 
                     focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent 
                     transition-all duration-200 hover:border-gray-400"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="group">
            <label htmlFor="amount" className="block text-sm font-semibold text-gray-700 mb-2">
              Amount ($)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">$</span>
              <input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                step="0.01"
                className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 
                         focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent 
                         transition-all duration-200 hover:border-gray-400"
                required
              />
            </div>
          </div>
          
          <div className="group">
            <label htmlFor="type" className="block text-sm font-semibold text-gray-700 mb-2">
              Type
            </label>
            <div className="relative">
              <select
                id="type"
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm bg-white 
                         focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent 
                         transition-all duration-200 hover:border-gray-400 appearance-none cursor-pointer"
              >
                <option value="expense">💸 Expense</option>
                <option value="income">💰 Income</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="group">
            <label htmlFor="category" className="block text-sm font-semibold text-gray-700 mb-2">
              Category
            </label>
            <div className="relative">
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm bg-white 
                         focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent 
                         transition-all duration-200 hover:border-gray-400 appearance-none cursor-pointer"
                required
              >
                {currentCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="group">
            <label htmlFor="date" className="block text-sm font-semibold text-gray-700 mb-2">
              Date
            </label>
            <input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm 
                       focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent 
                       transition-all duration-200 hover:border-gray-400 cursor-pointer"
              required
            />
          </div>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 
                     text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5
                     focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 
                     transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none
                     flex items-center justify-center space-x-2"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Adding...</span>
              </>
            ) : (
              <>
                <PlusCircle className="w-5 h-5" />
                <span>Add Transaction</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default TransactionForm;