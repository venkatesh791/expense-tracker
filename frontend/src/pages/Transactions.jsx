import React, { useState, useEffect } from 'react';
import { useCurrency } from '../context/CurrencyContext';
import api from '../utils/api';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { Search, Calendar, Tag, ArrowUpRight, ArrowDownLeft, FileSpreadsheet, FileText, ChevronDown, ChevronUp } from 'lucide-react';

const Transactions = () => {
  const { format, symbol } = useCurrency();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Sorting & Pagination
  const [sortField, setSortField] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc'); // asc, desc
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      // Fetch combined records
      // We will pull both Incomes and Expenses, but wait!
      // In the backend, we don't have a combined CRUD endpoint, but we can query them separately or we can combine them!
      // Oh! In dashboardController we had a combined transactions fetching logic.
      // Wait, let's design a custom endpoint in dashboardController or calculate it in this component, or write a dedicated endpoint?
      // Wait, let's check: in backend/routes/dashboardRoutes.js we only have /summary, /analytics, /insights.
      // We can add a combined transactions endpoint to backend, OR we can fetch incomes and expenses in parallel and combine them on the client!
      // Fetching and combining on the client is very flexible, but wait: sorting and pagination on combined items is much easier and more correct if done on the backend.
      // Let's add a backend endpoint or check if we can add it to `dashboardController.js` or create a new route.
      // Actually, wait! Let's write a combined transaction fetch route in the backend!
      // Let's check: where do we fetch transactions in the backend? We have `incomeController` and `expenseController`.
      // Let's create a route: `/api/dashboard/transactions` (in `dashboardController.js` and `dashboardRoutes.js`) to support querying both incomes and expenses, combining them, sorting, paginating, and filtering on the database level!
      // That is extremely robust, clean, and professional.
      
      // Let's see: how can we implement combined transactions in the backend?
      // Let's check: we can modify `dashboardController.js` to add `getTransactions`:
      // It queries all Incomes and Expenses matching filters (dates, search, category), formats them with `type: 'income'` or `type: 'expense'`, merges the arrays, sorts them, and slices them according to pagination!
      // Let's write that combined backend logic, it is beautiful.
      // Wait! I can update `dashboardController.js` and `dashboardRoutes.js` to add this endpoint. Let's do that right after setting up this page component. For now, let's assume the endpoint is `/dashboard/transactions` and handles:
      // - params: `{ page, limit, search, type, category, startDate, endDate, sort }`.
      
      const { data } = await api.get('/dashboard/transactions', {
        params: {
          page,
          limit: 10,
          search,
          type: typeFilter,
          category: categoryFilter,
          startDate,
          endDate,
          sort: `${sortOrder === 'desc' ? '-' : ''}${sortField}`,
        },
      });

      setTransactions(data.transactions);
      setPages(data.pages);
      setTotal(data.total);
    } catch (err) {
      console.error('Error fetching transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [search, typeFilter, categoryFilter, startDate, endDate, sortField, sortOrder, page]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
    setPage(1);
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (transactions.length === 0) return;

    // Headers
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Date,Type,Category,Amount,Description\n";

    // Row loop
    transactions.forEach((tx) => {
      const dateFormatted = new Date(tx.date).toLocaleDateString();
      const notesCleaned = (tx.description || '').replace(/"/g, '""');
      csvContent += `"${dateFormatted}","${tx.type}","${tx.category}",${tx.amount},"${notesCleaned}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `transaction_history_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export to PDF
  const handleExportPDF = () => {
    if (transactions.length === 0) return;

    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Expense Tracker - Transaction History", 14, 20);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Report generated on: ${new Date().toLocaleDateString()}`, 14, 26);
    
    // Columns
    const tableColumn = ["Date", "Type", "Category", "Amount", "Description"];
    const tableRows = [];

    transactions.forEach((tx) => {
      const txData = [
        new Date(tx.date).toLocaleDateString(),
        tx.type.toUpperCase(),
        tx.category,
        `${symbol}${tx.amount}`,
        tx.description || '-',
      ];
      tableRows.push(txData);
    });

    // Generate table
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 32,
      theme: 'grid',
      headStyles: { fillColor: [37, 99, 235], fontStyle: 'bold' },
      styles: { fontSize: 9, font: 'helvetica' },
    });

    doc.save(`transaction_report_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const categories = [
    'Salary', 'Freelancing', 'Business', 'Investments',
    'Food', 'Travel', 'Shopping', 'Bills', 'Entertainment', 'Education', 'Healthcare', 'Other'
  ];

  const renderSortIcon = (field) => {
    if (sortField !== field) return null;
    return sortOrder === 'desc' ? <ChevronDown size={14} /> : <ChevronUp size={14} />;
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header & Export Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="font-display text-xl font-extrabold tracking-tight text-slate-800 dark:text-white">Transaction History</h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-medium font-sans">Full ledger of incomes and expenses</p>
        </div>

        {/* Export triggers */}
        <div className="flex items-center space-x-3 self-start">
          <button
            onClick={handleExportCSV}
            disabled={transactions.length === 0}
            className="py-2.5 px-4 bg-white dark:bg-darkCard hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-darkBorder rounded-2xl font-bold text-xs flex items-center gap-1.5 disabled:opacity-50 transition-colors"
          >
            <FileSpreadsheet size={14} className="text-success" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handleExportPDF}
            disabled={transactions.length === 0}
            className="py-2.5 px-4 bg-white dark:bg-darkCard hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-darkBorder rounded-2xl font-bold text-xs flex items-center gap-1.5 disabled:opacity-50 transition-colors"
          >
            <FileText size={14} className="text-danger" />
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      {/* Advanced Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 bg-white dark:bg-darkCard p-5 border border-slate-200 dark:border-darkBorder rounded-3xl">
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          <input
            type="text"
            placeholder="Search notes..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-darkBorder bg-transparent focus:border-primary focus:outline-none text-xs font-semibold"
          />
        </div>

        {/* Type */}
        <select
          value={typeFilter}
          onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
          className="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-darkBorder bg-transparent focus:border-primary focus:outline-none text-xs font-semibold"
        >
          <option value="">All Types</option>
          <option value="income">Incomes</option>
          <option value="expense">Expenses</option>
        </select>

        {/* Category */}
        <select
          value={categoryFilter}
          onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
          className="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-darkBorder bg-transparent focus:border-primary focus:outline-none text-xs font-semibold"
        >
          <option value="">All Categories</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        {/* Start Date */}
        <div className="relative flex items-center">
          <Calendar className="absolute left-3 text-slate-400 pointer-events-none" size={14} />
          <input
            type="date"
            placeholder="Start date"
            value={startDate}
            onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-darkBorder bg-transparent focus:outline-none text-xs font-semibold"
          />
        </div>

        {/* End Date */}
        <div className="relative flex items-center">
          <Calendar className="absolute left-3 text-slate-400 pointer-events-none" size={14} />
          <input
            type="date"
            placeholder="End date"
            value={endDate}
            onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-darkBorder bg-transparent focus:outline-none text-xs font-semibold"
          />
        </div>

      </div>

      {/* Ledger Table */}
      <div className="bg-white dark:bg-darkCard rounded-3xl border border-slate-200 dark:border-darkBorder overflow-hidden">
        <div className="overflow-x-auto animate-fadeIn">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-darkBorder text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider select-none">
                <th onClick={() => handleSort('date')} className="py-3.5 px-6 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  <div className="flex items-center gap-1 font-bold">
                    <span>Date</span>
                    {renderSortIcon('date')}
                  </div>
                </th>
                <th onClick={() => handleSort('category')} className="py-3.5 px-6 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  <div className="flex items-center gap-1 font-bold">
                    <span>Category</span>
                    {renderSortIcon('category')}
                  </div>
                </th>
                <th className="py-3.5 px-6 font-bold">Type</th>
                <th className="py-3.5 px-6 font-bold">Description</th>
                <th onClick={() => handleSort('amount')} className="py-3.5 px-6 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 text-right transition-colors">
                  <div className="flex items-center justify-end gap-1 font-bold">
                    <span>Amount</span>
                    {renderSortIcon('amount')}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-darkBorder/60 text-sm">
              {loading ? (
                [1, 2, 3, 4, 5].map(i => (
                  <tr key={i} className="shimmer h-12">
                    <td colSpan="5"></td>
                  </tr>
                ))
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-xs text-slate-400 dark:text-slate-500 font-semibold">
                    No transactions matching the criteria were found.
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-4 px-6 text-xs font-semibold">
                      {new Date(tx.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="py-4 px-6 font-bold text-slate-700 dark:text-slate-200">
                      {tx.category}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase flex items-center gap-1 w-fit ${
                        tx.type === 'income' ? 'text-success bg-success/10' : 'text-danger bg-danger/10'
                      }`}>
                        {tx.type === 'income' ? <ArrowUpRight size={10} /> : <ArrowDownLeft size={10} />}
                        {tx.type}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-400 dark:text-slate-500 truncate max-w-xs">
                      {tx.description || '-'}
                    </td>
                    <td className={`py-4 px-6 text-right font-extrabold ${
                      tx.type === 'income' ? 'text-success' : 'text-danger'
                    }`}>
                      {tx.type === 'income' ? '+' : '-'}
                      {format(tx.amount)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        {pages > 1 && (
          <div className="p-4 border-t border-slate-100 dark:border-darkBorder flex items-center justify-between">
            <button
              onClick={() => setPage(prev => Math.max(1, prev - 1))}
              disabled={page === 1}
              className="px-4 py-2 border border-slate-200 dark:border-darkBorder hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold rounded-xl disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-xs text-slate-400 dark:text-slate-500 font-bold">
              Page {page} of {pages} ({total} total transactions)
            </span>
            <button
              onClick={() => setPage(prev => Math.min(pages, prev + 1))}
              disabled={page === pages}
              className="px-4 py-2 border border-slate-200 dark:border-darkBorder hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold rounded-xl disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Transactions;
