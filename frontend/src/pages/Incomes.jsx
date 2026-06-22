import React, { useState, useEffect } from 'react';
import { useCurrency } from '../context/CurrencyContext';
import api from '../utils/api';
import { Plus, Edit2, Trash2, ArrowUpRight, Search, Calendar, Tag, FileText, X } from 'lucide-react';

const Incomes = () => {
  const { format, symbol } = useCurrency();
  const [incomes, setIncomes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Form Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Salary');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [formError, setFormError] = useState('');

  const fetchIncomes = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/incomes', {
        params: {
          search,
          category: categoryFilter,
          page,
          limit: 8,
        },
      });
      setIncomes(data.incomes);
      setPages(data.pages);
      setTotal(data.total);
    } catch (err) {
      console.error('Error fetching incomes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncomes();
  }, [search, categoryFilter, page]);

  const handleOpenAdd = () => {
    setIsEditMode(false);
    setAmount('');
    setCategory('Salary');
    setDate(new Date().toISOString().split('T')[0]);
    setDescription('');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (income) => {
    setIsEditMode(true);
    setCurrentId(income._id);
    setAmount(income.amount);
    setCategory(income.category);
    setDate(new Date(income.date).toISOString().split('T')[0]);
    setDescription(income.description || '');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this income entry?')) {
      try {
        await api.delete(`/incomes/${id}`);
        fetchIncomes();
      } catch (err) {
        console.error('Error deleting income:', err);
      }
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!amount || amount <= 0) {
      setFormError('Amount must be greater than zero');
      return;
    }
    if (!category) {
      setFormError('Please select a category');
      return;
    }
    if (!date) {
      setFormError('Please select a date');
      return;
    }

    try {
      const payload = { amount: Number(amount), category, date, description };
      if (isEditMode) {
        await api.put(`/incomes/${currentId}`, payload);
      } else {
        await api.post('/incomes', payload);
      }
      setIsModalOpen(false);
      fetchIncomes();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save income entry');
    }
  };

  const categories = ['Salary', 'Freelancing', 'Business', 'Investments', 'Other'];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold tracking-tight">Income Management</h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Record and track your earnings</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="py-3 px-5 bg-success text-white rounded-2xl font-bold hover:bg-success-dark shadow-md shadow-success/20 transition-all flex items-center justify-center gap-1.5 self-start"
        >
          <Plus size={16} />
          <span>Add Income</span>
        </button>
      </div>

      {/* Filters row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search description..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-darkBorder bg-white dark:bg-darkCard focus:border-primary focus:outline-none text-sm font-semibold transition-colors shadow-sm"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
          className="py-3 px-4 rounded-2xl border border-slate-200 dark:border-darkBorder bg-white dark:bg-darkCard focus:border-primary focus:outline-none text-sm font-semibold shadow-sm"
        >
          <option value="">All Categories</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        
        <div className="flex items-center justify-end text-xs text-slate-400 font-bold uppercase tracking-wider px-2">
          Total Entries: {total}
        </div>
      </div>

      {/* Incomes table/list */}
      <div className="bg-white dark:bg-darkCard rounded-3xl border border-slate-200/50 dark:border-darkBorder/40 shadow-sm overflow-hidden glass">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-darkBorder text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
                <th className="py-3.5 px-6">Date</th>
                <th className="py-3.5 px-6">Category</th>
                <th className="py-3.5 px-6">Description</th>
                <th className="py-3.5 px-6 text-right">Amount</th>
                <th className="py-3.5 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-darkBorder/60 text-sm">
              {loading ? (
                [1, 2, 3].map(i => (
                  <tr key={i} className="shimmer h-14">
                    <td colSpan="5"></td>
                  </tr>
                ))
              ) : incomes.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-xs text-slate-400 dark:text-slate-500 font-semibold">
                    No income sources found. Add one above!
                  </td>
                </tr>
              ) : (
                incomes.map((inc) => (
                  <tr key={inc._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-4 px-6 text-xs font-semibold">
                      {new Date(inc.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-extrabold text-slate-700 dark:text-slate-200">
                        {inc.category}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-400 dark:text-slate-500 truncate max-w-xs">
                      {inc.description || '-'}
                    </td>
                    <td className="py-4 px-6 text-right font-extrabold text-success">
                      +{format(inc.amount)}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => handleOpenEdit(inc)}
                          className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(inc._id)}
                          className="p-2 text-slate-400 hover:text-danger hover:bg-danger/5 rounded-lg transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
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
              Page {page} of {pages}
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

      {/* CRUD Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="w-full max-w-md bg-white dark:bg-darkCard rounded-3xl p-6 border border-slate-200/50 dark:border-darkBorder/30 shadow-2xl glass relative">
            <div className="flex justify-between items-center mb-6">
              <h4 className="font-extrabold text-lg">
                {isEditMode ? 'Edit Income Entry' : 'Add Income Entry'}
              </h4>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X size={18} />
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 bg-danger/10 text-danger text-xs font-bold rounded-xl border border-danger/20">
                {formError}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 mb-1.5 uppercase tracking-wide">
                  Amount ({symbol})
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400">{symbol}</span>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="5000.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full pl-8 pr-4 py-3 rounded-xl border border-slate-200 dark:border-darkBorder bg-transparent focus:border-primary focus:outline-none text-sm font-semibold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 mb-1.5 uppercase tracking-wide">
                  Category
                </label>
                <div className="relative">
                  <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full pl-9 pr-4 py-3 rounded-xl border border-slate-200 dark:border-darkBorder bg-transparent focus:border-primary focus:outline-none text-sm font-semibold"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 mb-1.5 uppercase tracking-wide">
                  Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full pl-9 pr-4 py-3 rounded-xl border border-slate-200 dark:border-darkBorder bg-transparent focus:border-primary focus:outline-none text-sm font-semibold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 mb-1.5 uppercase tracking-wide">
                  Description
                </label>
                <div className="relative">
                  <FileText className="absolute left-3.5 top-3.5 text-slate-400" size={14} />
                  <textarea
                    placeholder="Short detail description..."
                    rows="3"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full pl-9 pr-4 py-3 rounded-xl border border-slate-200 dark:border-darkBorder bg-transparent focus:border-primary focus:outline-none text-sm font-semibold"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-success text-white rounded-xl font-bold hover:bg-success-dark shadow-md shadow-success/15 transition-all flex items-center justify-center"
              >
                <span>{isEditMode ? 'Update Income' : 'Save Income'}</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Incomes;
