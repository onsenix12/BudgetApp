// src/components/InvestmentList.jsx
import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { TrendingUp, TrendingDown, Calendar, Tag, BarChart3, DollarSign, Hash } from 'lucide-react';

function InvestmentList() {
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [hoveredInvestment, setHoveredInvestment] = useState(null);

  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, "investments"), orderBy("purchaseDate", "desc"));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const investmentsData = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const totalInvested = data.purchasePrice * data.quantity;
        const profitLoss = data.currentValue - totalInvested;
        const profitLossPercentage = totalInvested > 0 ? (profitLoss / totalInvested * 100) : 0;
        
        investmentsData.push({
          id: doc.id,
          ...data,
          purchaseDate: data.purchaseDate.toDate(),
          totalInvested,
          profitLoss,
          profitLossPercentage
        });
      });
      setInvestments(investmentsData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching investments: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredInvestments = investments.filter(inv => {
    if (filter === 'all') return true;
    if (filter === 'profit') return inv.profitLoss >= 0;
    if (filter === 'loss') return inv.profitLoss < 0;
    return inv.type === filter;
  });

  // Calculate portfolio summary
  const totalPortfolioValue = investments.reduce((sum, inv) => sum + inv.currentValue, 0);
  const totalInvested = investments.reduce((sum, inv) => sum + inv.totalInvested, 0);
  const totalProfitLoss = totalPortfolioValue - totalInvested;
  const totalProfitLossPercentage = totalInvested > 0 ? (totalProfitLoss / totalInvested * 100) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading investments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Portfolio Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total Invested</p>
              <p className="text-2xl font-bold text-blue-700">${totalInvested.toFixed(2)}</p>
            </div>
            <DollarSign className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-50 to-violet-50 p-6 rounded-xl border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Current Value</p>
              <p className="text-2xl font-bold text-purple-700">${totalPortfolioValue.toFixed(2)}</p>
            </div>
            <BarChart3 className="w-8 h-8 text-purple-500" />
          </div>
        </div>
        
        <div className={`p-6 rounded-xl border ${totalProfitLoss >= 0 
          ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200' 
          : 'bg-gradient-to-br from-red-50 to-rose-50 border-red-200'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${totalProfitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                Total P/L
              </p>
              <p className={`text-2xl font-bold ${totalProfitLoss >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                {totalProfitLoss >= 0 ? '+' : ''}${Math.abs(totalProfitLoss).toFixed(2)}
              </p>
            </div>
            {totalProfitLoss >= 0 ? (
              <TrendingUp className="w-8 h-8 text-green-500" />
            ) : (
              <TrendingDown className="w-8 h-8 text-red-500" />
            )}
          </div>
        </div>
        
        <div className={`p-6 rounded-xl border ${totalProfitLossPercentage >= 0 
          ? 'bg-gradient-to-br from-teal-50 to-cyan-50 border-teal-200' 
          : 'bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${totalProfitLossPercentage >= 0 ? 'text-teal-600' : 'text-orange-600'}`}>
                Total Return
              </p>
              <p className={`text-2xl font-bold ${totalProfitLossPercentage >= 0 ? 'text-teal-700' : 'text-orange-700'}`}>
                {totalProfitLossPercentage >= 0 ? '+' : ''}{totalProfitLossPercentage.toFixed(2)}%
              </p>
            </div>
            <div className="text-3xl">
              {totalProfitLossPercentage >= 0 ? '📈' : '📉'}
            </div>
          </div>
        </div>
      </div>

      {/* Header and Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h3 className="text-2xl font-bold text-gray-800 flex items-center">
          <BarChart3 className="w-6 h-6 mr-2 text-emerald-600" />
          Investment Portfolio
        </h3>
        
        <div className="flex items-center space-x-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm font-medium text-gray-700 
                     hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          >
            <option value="all">All Investments</option>
            <option value="profit">Profitable Only</option>
            <option value="loss">Loss Only</option>
          </select>
        </div>
      </div>

      {/* Investments List */}
      {filteredInvestments.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
          <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500 text-lg">
            {filter === 'all' 
              ? "No investments yet. Start building your portfolio!" 
              : `No ${filter} investments found.`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredInvestments.map((inv) => (
            <div
              key={inv.id}
              onMouseEnter={() => setHoveredInvestment(inv.id)}
              onMouseLeave={() => setHoveredInvestment(null)}
              className={`group relative bg-white rounded-xl border transition-all duration-300 transform
                ${hoveredInvestment === inv.id ? 'shadow-lg scale-[1.01] border-gray-200' : 'shadow-sm border-gray-100'}`}
            >
              <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-xl transition-all duration-300
                ${inv.profitLoss >= 0 ? 'bg-gradient-to-b from-emerald-500 to-teal-500' : 'bg-gradient-to-b from-red-500 to-rose-500'}
                ${hoveredInvestment === inv.id ? 'w-2' : 'w-1'}`} />
              
              <div className="p-6 pl-7">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="text-xl font-bold text-gray-800">{inv.name}</h4>
                        <div className="flex flex-wrap items-center gap-3 mt-2 text-sm">
                          <span className="flex items-center">
                            <Tag className="w-4 h-4 mr-1 text-gray-400" />
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">
                              {inv.type}
                            </span>
                          </span>
                          <span className="flex items-center text-gray-500">
                            <Calendar className="w-4 h-4 mr-1" />
                            {inv.purchaseDate.toLocaleDateString()}
                          </span>
                          <span className="flex items-center text-gray-500">
                            <Hash className="w-4 h-4 mr-1" />
                            {inv.quantity} units
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider">Buy Price</p>
                        <p className="text-sm font-semibold text-gray-800">${inv.purchasePrice.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider">Total Cost</p>
                        <p className="text-sm font-semibold text-gray-800">${inv.totalInvested.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider">Current Value</p>
                        <p className="text-sm font-semibold text-gray-800">${inv.currentValue.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider">P/L</p>
                        <p className={`text-sm font-semibold ${inv.profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {inv.profitLoss >= 0 ? '+' : ''}${inv.profitLoss.toFixed(2)}
                          <span className="text-xs ml-1">({inv.profitLossPercentage >= 0 ? '+' : ''}{inv.profitLossPercentage.toFixed(2)}%)</span>
                        </p>
                      </div>
                    </div>
                    
                    {inv.notes && (
                      <p className="mt-3 text-sm text-gray-600 italic bg-gray-50 p-2 rounded">
                        {inv.notes}
                      </p>
                    )}
                  </div>
                  
                  <div className={`flex flex-col items-center justify-center p-4 rounded-xl
                    ${inv.profitLoss >= 0 
                      ? 'bg-gradient-to-br from-green-50 to-emerald-50' 
                      : 'bg-gradient-to-br from-red-50 to-rose-50'}`}>
                    {inv.profitLoss >= 0 ? (
                      <TrendingUp className="w-10 h-10 text-green-500 mb-2" />
                    ) : (
                      <TrendingDown className="w-10 h-10 text-red-500 mb-2" />
                    )}
                    <p className={`text-2xl font-bold ${inv.profitLoss >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                      {inv.profitLossPercentage >= 0 ? '+' : ''}{inv.profitLossPercentage.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default InvestmentList;