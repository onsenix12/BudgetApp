// src/components/InvestmentForm.jsx
import React, { useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { TrendingUp, CheckCircle, XCircle, DollarSign, Calendar, Hash, FileText } from 'lucide-react';

const investmentTypes = ["ETF", "Stock", "Cryptocurrency", "Bond", "Fixed Deposit", "Other"];

function InvestmentForm() {
  const [name, setName] = useState('');
  const [type, setType] = useState(investmentTypes[0]);
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [purchasePrice, setPurchasePrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [currentValue, setCurrentValue] = useState('');
  const [notes, setNotes] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback('');
    setIsSubmitting(true);

    if (!name || !type || !purchaseDate || purchasePrice === '' || quantity === '' || currentValue === '') {
      setFeedback('error:Please fill in all required fields.');
      setIsSubmitting(false);
      return;
    }

    try {
      await addDoc(collection(db, "investments"), {
        name: name.trim(),
        type: type,
        purchaseDate: Timestamp.fromDate(new Date(purchaseDate)),
        purchasePrice: parseFloat(purchasePrice),
        quantity: parseFloat(quantity),
        currentValue: parseFloat(currentValue),
        notes: notes.trim(),
        lastUpdated: Timestamp.now(),
        createdAt: Timestamp.now()
      });

      setFeedback('success:Investment added successfully!');
      // Clear form
      setName('');
      setType(investmentTypes[0]);
      setPurchaseDate(new Date().toISOString().split('T')[0]);
      setPurchasePrice('');
      setQuantity('');
      setCurrentValue('');
      setNotes('');
      setTimeout(() => setFeedback(''), 3000);
    } catch (error) {
      console.error("Error adding investment: ", error);
      setFeedback(`error:Failed to add investment: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalInvestment = purchasePrice && quantity ? (parseFloat(purchasePrice) * parseFloat(quantity)).toFixed(2) : '0.00';
  const currentTotalValue = parseFloat(currentValue) || 0;
  const profitLoss = purchasePrice && quantity && currentValue ? (currentTotalValue - (parseFloat(purchasePrice) * parseFloat(quantity))).toFixed(2) : '0.00';
  const profitLossPercentage = totalInvestment > 0 ? ((profitLoss / totalInvestment) * 100).toFixed(2) : '0.00';

  return (
    <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300">
      <div className="flex items-center justify-center mb-8">
        <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full">
          <TrendingUp className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-gray-800 ml-3 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
          Add Investment
        </h3>
      </div>

      {feedback && (
        <div className={`mb-6 p-4 rounded-lg flex items-center animate-slide-up ${
          feedback.startsWith('success') 
            ? 'bg-green-50 border border-green-200' 
            : 'bg-red-50 border border-red-200'
        }`}>
          {feedback.startsWith('success') ? (
            <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
          ) : (
            <XCircle className="w-5 h-5 text-red-600 mr-2" />
          )}
          <p className={`text-sm font-medium ${
            feedback.startsWith('success') ? 'text-green-700' : 'text-red-700'
          }`}>
            {feedback.split(':')[1]}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="group">
            <label htmlFor="investment-name" className="block text-sm font-semibold text-gray-700 mb-2">
              Investment Name
            </label>
            <input
              id="investment-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Apple Inc., Bitcoin"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 
                       focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent 
                       transition-all duration-200 hover:border-gray-400"
              required
            />
          </div>

          <div className="group">
            <label htmlFor="investment-type" className="block text-sm font-semibold text-gray-700 mb-2">
              Investment Type
            </label>
            <div className="relative">
              <select
                id="investment-type"
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm bg-white 
                         focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent 
                         transition-all duration-200 hover:border-gray-400 appearance-none cursor-pointer"
                required
              >
                {investmentTypes.map(it => (
                  <option key={it} value={it}>{it}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="group">
            <label htmlFor="purchase-date" className="block text-sm font-semibold text-gray-700 mb-2">
              <Calendar className="inline w-4 h-4 mr-1" />
              Purchase Date
            </label>
            <input
              id="purchase-date"
              type="date"
              value={purchaseDate}
              onChange={(e) => setPurchaseDate(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm 
                       focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent 
                       transition-all duration-200 hover:border-gray-400 cursor-pointer"
              required
            />
          </div>

          <div className="group">
            <label htmlFor="purchase-price" className="block text-sm font-semibold text-gray-700 mb-2">
              <DollarSign className="inline w-4 h-4 mr-1" />
              Price per Unit
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">$</span>
              <input
                id="purchase-price"
                type="number"
                step="any"
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(e.target.value)}
                placeholder="0.00"
                className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 
                         focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent 
                         transition-all duration-200 hover:border-gray-400"
                required
              />
            </div>
          </div>

          <div className="group">
            <label htmlFor="quantity" className="block text-sm font-semibold text-gray-700 mb-2">
              <Hash className="inline w-4 h-4 mr-1" />
              Quantity
            </label>
            <input
              id="quantity"
              type="number"
              step="any"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="0"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 
                       focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent 
                       transition-all duration-200 hover:border-gray-400"
              required
            />
          </div>
        </div>

        <div className="group">
          <label htmlFor="current-value" className="block text-sm font-semibold text-gray-700 mb-2">
            Total Current Value
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">$</span>
            <input
              id="current-value"
              type="number"
              step="any"
              value={currentValue}
              onChange={(e) => setCurrentValue(e.target.value)}
              placeholder="0.00"
              className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 
                       focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent 
                       transition-all duration-200 hover:border-gray-400"
              required
            />
          </div>
        </div>

        {/* Investment Summary */}
        {(purchasePrice && quantity && currentValue) && (
          <div className="p-4 bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl border border-gray-200">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-500 font-medium">Total Invested</p>
                <p className="text-lg font-bold text-gray-800">${totalInvestment}</p>
              </div>
              <div>
                <p className="text-gray-500 font-medium">Current Value</p>
                <p className="text-lg font-bold text-gray-800">${currentTotalValue.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-gray-500 font-medium">Profit/Loss</p>
                <p className={`text-lg font-bold ${parseFloat(profitLoss) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {parseFloat(profitLoss) >= 0 ? '+' : ''}${profitLoss}
                </p>
              </div>
              <div>
                <p className="text-gray-500 font-medium">Return %</p>
                <p className={`text-lg font-bold ${parseFloat(profitLossPercentage) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {parseFloat(profitLossPercentage) >= 0 ? '+' : ''}{profitLossPercentage}%
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="group">
          <label htmlFor="notes" className="block text-sm font-semibold text-gray-700 mb-2">
            <FileText className="inline w-4 h-4 mr-1" />
            Notes (Optional)
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any additional notes about this investment..."
            rows="3"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 
                     focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent 
                     transition-all duration-200 hover:border-gray-400 resize-none"
          />
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-6 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 
                     text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5
                     focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 
                     transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none
                     flex items-center justify-center space-x-2"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Adding Investment...</span>
              </>
            ) : (
              <>
                <TrendingUp className="w-5 h-5" />
                <span>Add Investment</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default InvestmentForm;