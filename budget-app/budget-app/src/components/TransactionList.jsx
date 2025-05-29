// src/components/TransactionList.jsx
import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';

function TransactionList() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, "transactions"), orderBy("date", "desc"));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const transactionsData = [];
      querySnapshot.forEach((doc) => {
        transactionsData.push({
          id: doc.id,
          ...doc.data(),
          date: doc.data().date.toDate() // Convert Firestore Timestamp back to JS Date
        });
      });
      setTransactions(transactionsData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching transactions: ", error);
      setLoading(false);
    });

    // Clean up the listener when the component unmounts
    return () => unsubscribe();
  }, []); // The empty array [] means this effect runs only once when the component mounts

  // Basic inline styles
  const styles = {
    container: { margin: '20px 0', padding: '20px', border: '1px solid #ccc', backgroundColor: '#fff', borderRadius: '8px' },
    header: { textAlign: 'center', color: '#333', marginBottom: '20px', fontSize: '1.5em' },
    loadingText: { textAlign: 'center', color: '#555', padding: '20px 0' },
    noTransactionsText: { textAlign: 'center', color: '#555', padding: '20px 0' },
    list: { listStyle: 'none', padding: 0 },
    listItem: {
      display: 'flex',
      flexDirection: 'row', // Default to row for wider screens
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '10px',
      marginBottom: '8px',
      borderRadius: '4px',
      borderLeftWidth: '5px',
      borderLeftStyle: 'solid',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    },
    listItemDetails: { flexGrow: 1 },
    description: { fontWeight: 'bold', color: '#444', marginBottom: '3px' },
    meta: { fontSize: '0.9em', color: '#666' },
    amount: { fontSize: '1.1em', fontWeight: 'bold', whiteSpace: 'nowrap', marginLeft: '10px' },
    // Media query effect for smaller screens (applied via JS, or could be in a <style> tag)
    // For simplicity, this example just uses flex-direction and alignment that works okay on both.
    // True media queries are best in CSS files.
  };

  if (loading) {
    return <p style={styles.loadingText}>Loading transactions...</p>;
  }

  return (
    <div style={styles.container}>
      <h3 style={styles.header}>Transaction History</h3>
      {transactions.length === 0 ? (
        <p style={styles.noTransactionsText}>No transactions yet. Add one above!</p>
      ) : (
        <ul style={styles.list}>
          {transactions.map(tx => {
            const itemStyle = {
              ...styles.listItem,
              borderLeftColor: tx.type === 'income' ? 'green' : 'red',
              backgroundColor: tx.type === 'income' ? '#e8f5e9' : '#ffebee',
            };
            const amountStyle = {
                ...styles.amount,
                color: tx.type === 'income' ? 'green' : 'red',
            };

            return (
              <li key={tx.id} style={itemStyle}>
                <div style={styles.listItemDetails}>
                  <p style={styles.description}>{tx.description}</p>
                  <p style={styles.meta}>
                    {tx.date.toLocaleDateString()} - <span style={{fontStyle: 'italic'}}>{tx.category}</span>
                  </p>
                </div>
                <div style={amountStyle}>
                  {tx.type === 'income' ? '+' : '-'}${tx.amount.toFixed(2)}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default TransactionList;