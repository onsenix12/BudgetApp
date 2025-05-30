// src/components/TransactionList.jsx
import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { Pencil, Trash2, X, Check, DollarSign, Calendar, Tag } from 'lucide-react';

function TransactionList() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    description: '',
    amount: '',
    category: '',
    type: ''
  });

  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, "transactions"), orderBy("date", "desc"));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const transactionsData = [];
      querySnapshot.forEach((doc) => {
        transactionsData.push({
          id: doc.id,
          ...doc.data(),
          date: doc.data().date.toDate()
        });
      });
      setTransactions(transactionsData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching transactions: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        await deleteDoc(doc(db, "transactions", id));
      } catch (error) {
        console.error("Error deleting transaction: ", error);
        alert("Failed to delete transaction. Please try again.");
      }
    }
  };

  const handleEdit = (transaction) => {
    setEditingId(transaction.id);
    setEditForm({
      description: transaction.description,
      amount: transaction.amount.toString(),
      category: transaction.category,
      type: transaction.type
    });
  };

  const handleUpdate = async (id) => {
    try {
      const transactionRef = doc(db, "transactions", id);
      await updateDoc(transactionRef, {
        description: editForm.description,
        amount: parseFloat(editForm.amount),
        category: editForm.category,
        type: editForm.type
      });
      setEditingId(null);
    } catch (error) {
      console.error("Error updating transaction: ", error);
      alert("Failed to update transaction. Please try again.");
    }
  };

  const handleCancel = () => {
    setEditingId(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading transactions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center mb-8">
        <DollarSign className="w-8 h-8 text-indigo-600 mr-3" />
        <h3 className="text-2xl font-bold text-gray-800">Transaction History</h3>
      </div>

      {transactions.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
          <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500 text-lg">No transactions yet. Add one above!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {transactions.map(tx => (
            <div
              key={tx.id}
              className={`group relative bg-white rounded-xl border transition-all duration-300 transform
                hover:shadow-lg hover:scale-[1.01] border-gray-100`}
            >
              <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-xl transition-all duration-300
                ${tx.type === 'income' ? 'bg-gradient-to-b from-emerald-500 to-teal-500' : 'bg-gradient-to-b from-red-500 to-rose-500'}
                group-hover:w-2`} />
              
              <div className="p-6 pl-7">
                {editingId === tx.id ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <input
                          type="text"
                          value={editForm.description}
                          onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                        <input
                          type="number"
                          step="any"
                          value={editForm.amount}
                          onChange={(e) => setEditForm({...editForm, amount: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                        <input
                          type="text"
                          value={editForm.category}
                          onChange={(e) => setEditForm({...editForm, category: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                        <select
                          value={editForm.type}
                          onChange={(e) => setEditForm({...editForm, type: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        >
                          <option value="income">Income</option>
                          <option value="expense">Expense</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={handleCancel}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                      >
                        <X className="w-4 h-4 inline mr-1" />
                        Cancel
                      </button>
                      <button
                        onClick={() => handleUpdate(tx.id)}
                        className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        <Check className="w-4 h-4 inline mr-1" />
                        Save Changes
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="text-xl font-bold text-gray-800">{tx.description}</h4>
                          <div className="flex flex-wrap items-center gap-3 mt-2 text-sm">
                            <span className="flex items-center">
                              <Tag className="w-4 h-4 mr-1 text-gray-400" />
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">
                                {tx.category}
                              </span>
                            </span>
                            <span className="flex items-center text-gray-500">
                              <Calendar className="w-4 h-4 mr-1" />
                              {tx.date.toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEdit(tx)}
                            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(tx.id)}
                            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <div className={`inline-flex items-center px-4 py-2 rounded-lg ${
                          tx.type === 'income' 
                            ? 'bg-gradient-to-br from-green-50 to-emerald-50 text-green-700' 
                            : 'bg-gradient-to-br from-red-50 to-rose-50 text-red-700'
                        }`}>
                          <DollarSign className="w-4 h-4 mr-1" />
                          <span className="font-semibold">
                            {tx.type === 'income' ? '+' : '-'}${tx.amount.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default TransactionList;