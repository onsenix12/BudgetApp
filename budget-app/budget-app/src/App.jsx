// src/App.jsx
import React, { useState } from 'react';
import { TrendingUp, DollarSign, Menu, X } from 'lucide-react';

// Transaction and Budget Components
import TransactionForm from './components/TransactionForm';
import CSVImport from './components/CSVImport';
import MonthlyReport from './components/MonthlyReport';
import TransactionList from './components/TransactionList';

// Investment Components
import InvestmentForm from './components/InvestmentForm';
import InvestmentCSVImport from './components/InvestmentCSVImport';
import InvestmentList from './components/InvestmentList';

function App() {
  const [activeTab, setActiveTab] = useState('transactions');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white/70 backdrop-blur-lg shadow-sm sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl shadow-md">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                FinTrack
              </h1>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-1">
              <button
                onClick={() => setActiveTab('transactions')}
                className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === 'transactions'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                Transactions
              </button>
              <button
                onClick={() => setActiveTab('investments')}
                className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === 'investments'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                Investments
              </button>
            </nav>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white/95 backdrop-blur-lg">
            <div className="px-4 py-3 space-y-2">
              <button
                onClick={() => {
                  setActiveTab('transactions');
                  setMobileMenuOpen(false);
                }}
                className={`w-full px-4 py-2 rounded-lg font-medium text-left transition-all duration-200 ${
                  activeTab === 'transactions'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                Transactions
              </button>
              <button
                onClick={() => {
                  setActiveTab('investments');
                  setMobileMenuOpen(false);
                }}
                className={`w-full px-4 py-2 rounded-lg font-medium text-left transition-all duration-200 ${
                  activeTab === 'investments'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                Investments
              </button>
            </div>
          </div>
        )}
      </header>
      
      <main className="max-w-7xl mx-auto py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        {/* Transactions Section */}
        {activeTab === 'transactions' && (
          <section aria-labelledby="transactions-title" className="animate-slide-up">
            <div className="flex items-center mb-8">
              <DollarSign className="w-8 h-8 text-indigo-600 mr-3" />
              <h2 id="transactions-title" className="text-3xl font-bold text-gray-800">
                Transactions & Budget
              </h2>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div className="space-y-6">
                <TransactionForm />
                <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-gray-100">
                  <CSVImport />
                </div>
              </div>
              <div className="space-y-6">
                <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-gray-100">
                  <MonthlyReport />
                </div>
              </div>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 p-6">
              <TransactionList />
            </div>
          </section>
        )}

        {/* Investments Section */}
        {activeTab === 'investments' && (
          <section aria-labelledby="investments-title" className="animate-slide-up">
            <div className="flex items-center mb-8">
              <TrendingUp className="w-8 h-8 text-indigo-600 mr-3" />
              <h2 id="investments-title" className="text-3xl font-bold text-gray-800">
                Investment Portfolio
              </h2>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div className="space-y-6">
                <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-gray-100">
                  <InvestmentForm />
                </div>
                <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-gray-100">
                  <InvestmentCSVImport />
                </div>
              </div>
              <div className="space-y-6">
                {/* Space for future investment analytics/charts */}
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-8 rounded-2xl border-2 border-dashed border-indigo-200">
                  <div className="text-center">
                    <TrendingUp className="w-12 h-12 text-indigo-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Investment Analytics</h3>
                    <p className="text-gray-500">Coming soon: Charts and performance metrics</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 p-6">
              <InvestmentList />
            </div>
          </section>
        )}
      </main>

      <footer className="mt-16 bg-white/50 backdrop-blur-sm border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-sm text-gray-600">
              &copy; {new Date().getFullYear()} FinTrack. Built with ❤️ for better financial management.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;