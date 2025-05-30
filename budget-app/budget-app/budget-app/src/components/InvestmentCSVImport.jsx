// src/components/InvestmentCSVImport.jsx
import React, { useState } from 'react';
import Papa from 'papaparse';
import { db } from '../firebase';
import { collection, writeBatch, doc, Timestamp } from 'firebase/firestore';
import { Upload, FileSpreadsheet, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const investmentTypes = ["ETF", "Stock", "Cryptocurrency", "Bond", "Fixed Deposit", "Other"];

function InvestmentCSVImport() {
  const [file, setFile] = useState(null);
  const [isImporting, setIsImporting] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === "text/csv" || droppedFile.name.endsWith('.csv')) {
        setFile(droppedFile);
        setFeedback('');
      } else {
        setFeedback('error:Please upload a CSV file.');
      }
    }
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && (selectedFile.type === "text/csv" || selectedFile.name.endsWith('.csv'))) {
      setFile(selectedFile);
      setFeedback('');
    } else if (selectedFile) {
      setFeedback('error:Please upload a CSV file.');
    }
  };

  const handleInvestmentImport = async () => {
    if (!file) {
      setFeedback('error:Please select a CSV file first.');
      return;
    }

    setIsImporting(true);
    setFeedback('info:Importing investments...');

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const investmentsToImport = [];
        let errors = [];

        results.data.forEach((row, index) => {
          const { Name, Type, PurchaseDate, PurchasePrice, Quantity, CurrentValue, Notes } = row;

          // Basic Validation
          if (!Name || !Type || !PurchaseDate || PurchasePrice === undefined || Quantity === undefined || CurrentValue === undefined) {
            errors.push(`Row ${index + 2}: Missing required fields. Row skipped.`);
            return;
          }

          const purchasePriceNum = parseFloat(PurchasePrice);
          const quantityNum = parseFloat(Quantity);
          const currentValueNum = parseFloat(CurrentValue);

          if (isNaN(purchasePriceNum) || isNaN(quantityNum) || isNaN(currentValueNum)) {
            errors.push(`Row ${index + 2}: Invalid number for PurchasePrice, Quantity, or CurrentValue. Row skipped.`);
            return;
          }

          const parsedDate = new Date(PurchaseDate);
          if (isNaN(parsedDate.getTime())) {
            errors.push(`Row ${index + 2}: Invalid PurchaseDate format '${PurchaseDate}'. Please use YYYY-MM-DD. Row skipped.`);
            return;
          }

          const normalizedType = Type.trim();
          if (!investmentTypes.map(it => it.toLowerCase()).includes(normalizedType.toLowerCase())) {
            console.warn(`Row ${index + 2}: Type '${normalizedType}' is not in the standard list but will be imported.`);
          }

          investmentsToImport.push({
            name: Name.trim(),
            type: normalizedType,
            purchaseDate: Timestamp.fromDate(parsedDate),
            purchasePrice: purchasePriceNum,
            quantity: quantityNum,
            currentValue: currentValueNum,
            notes: Notes ? Notes.trim() : '',
            lastUpdated: Timestamp.now(),
            createdAt: Timestamp.now(),
            source: 'csv_import'
          });
        });

        if (investmentsToImport.length === 0 && errors.length === 0 && results.data.length > 0) {
          setFeedback('error:No valid investments found in the file. Please check file content and format.');
          setIsImporting(false);
          return;
        }
        
        if (investmentsToImport.length === 0 && errors.length === 0 && results.data.length === 0) {
          setFeedback('error:The CSV file appears to be empty.');
          setIsImporting(false);
          return;
        }

        if (investmentsToImport.length > 0) {
          if (investmentsToImport.length > 500) {
            errors.push(`File has ${investmentsToImport.length} investments, exceeding 500 limit per import.`);
            setFeedback(`error:Import failed. ${errors.join(' ')}`);
            setIsImporting(false);
            return;
          }

          const batch = writeBatch(db);
          investmentsToImport.forEach(investment => {
            const newInvestmentRef = doc(collection(db, "investments"));
            batch.set(newInvestmentRef, investment);
          });

          try {
            await batch.commit();
            let successMsg = `success:${investmentsToImport.length} investment(s) imported successfully!`;
            if (errors.length > 0) {
              successMsg = `warning:${investmentsToImport.length} investments imported. ${errors.length} rows had issues.`;
            }
            setFeedback(successMsg);
            if (errors.length > 0) console.warn("CSV Import Row Errors:", errors);
          } catch (error) {
            console.error("Error committing batch for investments: ", error);
            setFeedback(`error:Error importing investments: ${error.message}`);
          }
        } else {
          setFeedback(`error:No investments were imported. ${errors.join(' ')}`);
          if (errors.length > 0) console.warn("CSV Import Row Errors:", errors);
        }

        setIsImporting(false);
        setFile(null);
        if (document.getElementById('investment-csv-input')) {
          document.getElementById('investment-csv-input').value = '';
        }
      },
      error: (error) => {
        console.error("Error parsing investment CSV: ", error);
        setFeedback(`error:Error parsing CSV file: ${error.message}`);
        setIsImporting(false);
      }
    });
  };

  const getFeedbackIcon = () => {
    if (feedback.startsWith('success')) return <CheckCircle className="w-5 h-5 text-green-600" />;
    if (feedback.startsWith('error')) return <XCircle className="w-5 h-5 text-red-600" />;
    if (feedback.startsWith('warning')) return <AlertCircle className="w-5 h-5 text-amber-600" />;
    return <AlertCircle className="w-5 h-5 text-blue-600" />;
  };

  const getFeedbackStyles = () => {
    if (feedback.startsWith('success')) return 'bg-green-50 border-green-200 text-green-700';
    if (feedback.startsWith('error')) return 'bg-red-50 border-red-200 text-red-700';
    if (feedback.startsWith('warning')) return 'bg-amber-50 border-amber-200 text-amber-700';
    return 'bg-blue-50 border-blue-200 text-blue-700';
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300">
      <div className="flex items-center justify-center mb-6">
        <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full">
          <FileSpreadsheet className="w-6 h-6 text-white" />
        </div>
        <h4 className="text-xl font-bold text-gray-800 ml-3">Import Investments from CSV</h4>
      </div>

      {/* CSV Format Guide */}
      <div className="mb-6 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
        <p className="text-sm font-medium text-blue-800 mb-2">CSV Format Required:</p>
        <p className="text-xs text-blue-700 font-mono">
          Name, Type, PurchaseDate, PurchasePrice, Quantity, CurrentValue, Notes
        </p>
        <p className="text-xs text-blue-600 mt-1">
          Date format: YYYY-MM-DD | Types: {investmentTypes.join(', ')}
        </p>
      </div>

      {/* File Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200
          ${dragActive ? 'border-emerald-400 bg-emerald-50' : 'border-gray-300 hover:border-gray-400'}
          ${file ? 'bg-green-50 border-green-300' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          id="investment-csv-input"
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isImporting}
        />
        
        <div className="pointer-events-none">
          <Upload className={`w-12 h-12 mx-auto mb-4 ${file ? 'text-green-500' : 'text-gray-400'}`} />
          {file ? (
            <div>
              <p className="text-sm font-medium text-green-700">File selected:</p>
              <p className="text-lg font-semibold text-green-800">{file.name}</p>
              <p className="text-xs text-green-600 mt-1">Click to change or drag a new file</p>
            </div>
          ) : (
            <div>
              <p className="text-lg font-medium text-gray-700">
                Drop your CSV file here
              </p>
              <p className="text-sm text-gray-500 mt-1">or click to browse</p>
            </div>
          )}
        </div>
      </div>

      {/* Feedback Message */}
      {feedback && (
        <div className={`mt-4 p-4 rounded-lg border flex items-center animate-slide-up ${getFeedbackStyles()}`}>
          {getFeedbackIcon()}
          <p className="text-sm font-medium ml-2">
            {feedback.split(':')[1]}
          </p>
        </div>
      )}

      {/* Import Button */}
      <button
        onClick={handleInvestmentImport}
        disabled={isImporting || !file}
        className="w-full mt-6 py-3.5 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 
                 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5
                 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 
                 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none
                 flex items-center justify-center space-x-2"
      >
        {isImporting ? (
          <>
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Importing Investments...</span>
          </>
        ) : (
          <>
            <Upload className="w-5 h-5" />
            <span>Import Investments</span>
          </>
        )}
      </button>
    </div>
  );
}

export default InvestmentCSVImport;