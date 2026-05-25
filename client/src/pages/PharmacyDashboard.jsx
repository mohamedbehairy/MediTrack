import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  Package, AlertTriangle, CheckCircle2, Loader2,
  RefreshCw, Plus, X, TrendingUp, Pill,
  BarChart3, Archive, ShieldAlert, Search
} from 'lucide-react';
import { api } from '../lib/axios';

/* ── Restock Modal ─────────────────────────────────────────────────────────── */
const RestockModal = ({ medication, onClose, onRestocked }) => {
  const [amount, setAmount] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const n = parseInt(amount);
    if (!n || n <= 0) { setError('Enter a valid positive amount.'); return; }
    setSaving(true);
    try {
      await api.put(`/pharmacy/inventory/${medication.id}/restock`, { amount: n });
      onRestocked();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Restock failed.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-5 border-b border-slate-800 flex justify-between items-center">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <TrendingUp className="text-teal-400 w-5 h-5" /> Restock: {medication.name}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
            <X size={16} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-400 text-sm flex items-center gap-2">
              <AlertTriangle size={14} /> {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">
              Current Stock: <span className="text-white font-bold">{medication.inventory?.stockLevel ?? 0} units</span>
            </label>
            <input
              type="number"
              min="1"
              placeholder="Units to add"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-teal-500 transition-colors"
              autoFocus
            />
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose}
              className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl font-medium text-slate-300 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 py-3 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl transition-all disabled:opacity-60 flex items-center justify-center gap-2">
              {saving ? <><Loader2 size={15} className="animate-spin" /> Restocking…</> : <><Plus size={15} /> Confirm Restock</>}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

/* ── Stat card ─────────────────────────────────────────────────────────────── */
const StatCard = ({ icon: Icon, label, value, color, border }) => (
  <div className={`glass-card p-5 flex items-center gap-4 border-t-2 ${border}`}>
    <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${color.replace('text-', 'bg-').replace('400', '500/15').replace('500', '500/15')}`}>
      <Icon className={`w-5 h-5 ${color}`} />
    </div>
    <div>
      <p className="text-xs text-slate-400 uppercase tracking-wider">{label}</p>
      <p className={`text-2xl font-black ${color}`}>{value}</p>
    </div>
  </div>
);

/* ── Main page ─────────────────────────────────────────────────────────────── */
const PharmacyDashboard = () => {
  const { t } = useTranslation();
  const [inventory, setInventory] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [restockTarget, setRestockTarget] = useState(null);
  const [filter, setFilter] = useState('all'); // all | low | ok

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [invRes, statsRes] = await Promise.all([
        api.get('/pharmacy/inventory'),
        api.get('/pharmacy/stats'),
      ]);
      setInventory(invRes.data);
      setStats(statsRes.data);
    } catch (err) {
      console.error('Failed to load pharmacy data', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = inventory.filter(med => {
    const stock = med.inventory?.stockLevel ?? 0;
    if (filter === 'low' && stock >= 50) return false;
    if (filter === 'ok' && stock < 50) return false;
    if (search) {
      const q = search.toLowerCase();
      return med.name.toLowerCase().includes(q) || med.activeIngredient.toLowerCase().includes(q);
    }
    return true;
  });

  if (loading) return (
    <div className="flex flex-col h-full items-center justify-center text-slate-400">
      <Loader2 className="w-8 h-8 animate-spin mb-4 text-teal-500" />
      <p>Loading pharmacy inventory…</p>
    </div>
  );

  return (
    <>
      <div className="max-w-7xl mx-auto text-white">

        {/* Header */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Package className="text-teal-400 w-8 h-8" />
              Inventory Management
            </h1>
            <p className="text-slate-400 mt-1">Monitor stock levels and restock medications in real time.</p>
          </div>
          <button onClick={fetchData}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-slate-300 font-medium text-sm transition-colors">
            <RefreshCw size={15} /> Refresh
          </button>
        </header>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard icon={Pill}         label="Total Medications"  value={stats.totalMeds}           color="text-teal-400"    border="border-t-teal-500" />
            <StatCard icon={Archive}      label="Total Units"        value={stats.totalStock}          color="text-blue-400"   border="border-t-blue-500" />
            <StatCard icon={AlertTriangle} label="Low Stock Items"   value={stats.lowStockItems}       color="text-amber-400"  border="border-t-amber-500" />
            <StatCard icon={ShieldAlert}  label="Out of Stock"       value={stats.outOfStock}          color="text-rose-400"   border="border-t-rose-500" />
          </div>
        )}

        {/* Low stock alert banner */}
        {stats?.lowStockItems > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center gap-3"
          >
            <AlertTriangle className="text-amber-400 w-5 h-5 shrink-0 animate-pulse" />
            <p className="text-amber-300 text-sm font-medium">
              <strong>{stats.lowStockItems}</strong> medication{stats.lowStockItems > 1 ? 's are' : ' is'} running low (below 50 units). Restock soon to avoid shortages.
            </p>
          </motion.div>
        )}

        {/* Search + filter bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute start-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by name or active ingredient…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-slate-900/80 border border-slate-700 focus:border-teal-500 rounded-xl ps-11 pe-4 py-3 text-white outline-none transition-colors placeholder:text-slate-500"
            />
          </div>
          <div className="flex gap-1 bg-slate-900/50 p-1 rounded-xl border border-slate-800 shrink-0">
            {[['all', 'All'], ['low', 'Low Stock'], ['ok', 'In Stock']].map(([key, label]) => (
              <button key={key} onClick={() => setFilter(key)}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${filter === key ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Inventory grid */}
        {filtered.length === 0 ? (
          <div className="glass-card p-16 text-center flex flex-col items-center text-slate-500 border-dashed border-2 border-slate-700">
            <Package className="w-14 h-14 mb-4 opacity-20" />
            <p className="text-lg">No medications found{search ? ` matching "${search}"` : ''}.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((med, idx) => {
              const stock = med.inventory?.stockLevel ?? 0;
              const isOut = stock === 0;
              const isLow = stock > 0 && stock < 50;
              const maxStock = 500;
              const pct = Math.min((stock / maxStock) * 100, 100);
              const barColor = isOut ? 'bg-rose-500' : isLow ? 'bg-amber-500' : stock > 200 ? 'bg-teal-500' : 'bg-blue-500';
              const borderColor = isOut ? 'border-t-rose-500' : isLow ? 'border-t-amber-500' : 'border-t-teal-500/50';
              const statusLabel = isOut ? 'Out of Stock' : isLow ? 'Low Stock' : 'In Stock';
              const statusColor = isOut ? 'text-rose-400 bg-rose-500/10 border-rose-500/30' : isLow ? 'text-amber-400 bg-amber-500/10 border-amber-500/30' : 'text-teal-400 bg-teal-500/10 border-teal-500/30';

              return (
                <motion.div
                  key={med.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className={`glass-card p-5 border-t-2 ${borderColor} flex flex-col gap-4 hover:shadow-lg transition-shadow`}
                >
                  <div className="flex justify-between items-start">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-white truncate">{med.name}</h3>
                      <p className="text-xs text-slate-400 truncate mt-0.5">{med.activeIngredient}</p>
                    </div>
                    {(isOut || isLow) && (
                      <AlertTriangle size={16} className={isOut ? 'text-rose-400 animate-pulse shrink-0 ms-2' : 'text-amber-400 shrink-0 ms-2'} />
                    )}
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-xs text-slate-500">Stock</span>
                      <span className={`text-sm font-black ${isOut ? 'text-rose-400' : isLow ? 'text-amber-400' : 'text-white'}`}>{stock} units</span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.7, ease: 'easeOut' }}
                        className={`h-full rounded-full ${barColor}`}
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${statusColor}`}>{statusLabel}</span>
                    {med.inventory?.lastRestock && (
                      <span className="text-xs text-slate-600">
                        {new Date(med.inventory.lastRestock).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => setRestockTarget(med)}
                    className="w-full py-2.5 bg-teal-600/15 hover:bg-teal-500 text-teal-400 hover:text-white border border-teal-500/30 rounded-xl transition-all font-bold text-sm flex items-center justify-center gap-2"
                  >
                    <Plus size={14} /> Restock
                  </button>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Restock Modal */}
      <AnimatePresence>
        {restockTarget && (
          <RestockModal
            medication={restockTarget}
            onClose={() => setRestockTarget(null)}
            onRestocked={fetchData}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default PharmacyDashboard;
