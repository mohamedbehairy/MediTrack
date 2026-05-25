import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  AlertTriangle, Plus, Edit2, Trash2, X, Loader2,
  Search, CheckCircle2, RefreshCw, AlertCircle, Pill
} from 'lucide-react';
import { api } from '../lib/axios';

/* ── Severity Badge ─────────────────────────────────────────────────────── */
const SeverityBadge = ({ severity }) => {
  const config = {
    HIGH: { bg: 'bg-rose-500/10', border: 'border-rose-500/30', text: 'text-rose-400', label: '⚠️ High Risk' },
    MODERATE: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400', label: '⚡ Moderate' },
    LOW: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400', label: '💡 Low' },
  };
  const c = config[severity] || config.LOW;
  return (
    <span className={`text-xs font-bold px-3 py-1 rounded-full border ${c.bg} ${c.border} ${c.text}`}>
      {c.label}
    </span>
  );
};

/* ── Interaction Modal (Add/Edit) ─────────────────────────────────────────── */
const InteractionModal = ({ interaction, medications, onClose, onSaved }) => {
  const [formData, setFormData] = useState(interaction || {
    medication1Id: '',
    medication2Id: '',
    severity: 'MODERATE',
    description: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.medication1Id || !formData.medication2Id || !formData.description.trim()) {
      setError('All fields are required');
      return;
    }

    if (formData.medication1Id === formData.medication2Id) {
      setError('Please select two different medications');
      return;
    }

    setSaving(true);
    try {
      if (interaction?.id) {
        await api.put(`/pharmacy/interactions/${interaction.id}`, formData);
      } else {
        await api.post('/pharmacy/interactions', formData);
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save interaction');
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
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
            <AlertTriangle className="text-amber-400 w-5 h-5" />
            {interaction ? 'Edit Interaction' : 'Add Drug Interaction'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
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
              First Medication *
            </label>
            <select
              name="medication1Id"
              value={formData.medication1Id}
              onChange={handleChange}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-teal-500 transition-colors"
            >
              <option value="">Select medication...</option>
              {medications.map(med => (
                <option key={med.id} value={med.id}>
                  {med.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">
              Second Medication *
            </label>
            <select
              name="medication2Id"
              value={formData.medication2Id}
              onChange={handleChange}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-teal-500 transition-colors"
            >
              <option value="">Select medication...</option>
              {medications.map(med => (
                <option key={med.id} value={med.id}>
                  {med.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">
              Severity *
            </label>
            <select
              name="severity"
              value={formData.severity}
              onChange={handleChange}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-teal-500 transition-colors"
            >
              <option value="LOW">Low Risk</option>
              <option value="MODERATE">Moderate Risk</option>
              <option value="HIGH">High Risk</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the interaction and its effects..."
              rows="4"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-teal-500 transition-colors resize-none"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl font-medium text-slate-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-3 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl transition-all disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {saving ? (
                <><Loader2 size={15} className="animate-spin" /> Saving...</>
              ) : (
                <><CheckCircle2 size={15} /> {interaction ? 'Update' : 'Create'}</>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

/* ── Delete Confirmation Modal ──────────────────────────────────────────── */
const DeleteConfirmModal = ({ interaction, onClose, onConfirm }) => {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/pharmacy/interactions/${interaction.id}`);
      onConfirm();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete interaction');
      setDeleting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
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
        <div className="p-5 border-b border-slate-800 flex items-center gap-3">
          <AlertTriangle className="text-rose-400 w-6 h-6" />
          <h2 className="text-lg font-bold text-white">Delete Interaction?</h2>
        </div>

        <div className="p-5 space-y-4">
          {error ? (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-400 text-sm flex items-center gap-2">
              <AlertTriangle size={14} /> {error}
            </div>
          ) : (
            <p className="text-slate-400">
              Are you sure you want to delete this interaction? This action cannot be undone.
            </p>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={deleting}
              className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl font-medium text-slate-300 transition-colors disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="flex-1 py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl transition-all disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {deleting ? (
                <><Loader2 size={15} className="animate-spin" /> Deleting...</>
              ) : (
                <>Delete</>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

/* ── Main Page ─────────────────────────────────────────────────────────── */
const DrugInteractions = () => {
  const { t } = useTranslation();
  const [interactions, setInteractions] = useState([]);
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [editingInteraction, setEditingInteraction] = useState(null);
  const [deletingInteraction, setDeletingInteraction] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [interRes, medRes] = await Promise.all([
        api.get('/pharmacy/interactions'),
        api.get('/pharmacy/medications'),
      ]);
      setInteractions(interRes.data);
      setMedications(medRes.data);
    } catch (err) {
      console.error('Failed to load data', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredInteractions = interactions.filter(inter => {
    if (severityFilter !== 'all' && inter.severity !== severityFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const med1 = medications.find(m => m.id === inter.medication1Id)?.name.toLowerCase() || '';
      const med2 = medications.find(m => m.id === inter.medication2Id)?.name.toLowerCase() || '';
      return med1.includes(q) || med2.includes(q) || inter.description.toLowerCase().includes(q);
    }
    return true;
  });

  const getMedicationName = (id) => {
    return medications.find(m => m.id === id)?.name || 'Unknown';
  };

  const handleAddClick = () => {
    setEditingInteraction(null);
    setShowModal(true);
  };

  const handleEditClick = (inter) => {
    setEditingInteraction(inter);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingInteraction(null);
  };

  if (loading) {
    return (
      <div className="flex flex-col h-full items-center justify-center text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin mb-4 text-teal-500" />
        <p>Loading drug interactions…</p>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-7xl mx-auto text-white">
        {/* Header */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <AlertTriangle className="text-amber-400 w-8 h-8" />
              Drug Interactions تعارض الأدوية
            </h1>
            <p className="text-slate-400 mt-1">Manage and monitor potential drug interactions to ensure patient safety.</p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={fetchData}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-slate-300 font-medium text-sm transition-colors"
            >
              <RefreshCw size={15} /> Refresh
            </button>
            <button
              onClick={handleAddClick}
              className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-500 rounded-xl text-white font-bold text-sm transition-colors"
            >
              <Plus size={15} /> Add Interaction
            </button>
          </div>
        </header>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute start-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by medication name or description…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-slate-900/80 border border-slate-700 focus:border-teal-500 rounded-xl ps-11 pe-4 py-3 text-white outline-none transition-colors placeholder:text-slate-500"
            />
          </div>
          <div className="flex gap-1 bg-slate-900/50 p-1 rounded-xl border border-slate-800 shrink-0">
            {[['all', 'All'], ['HIGH', '🔴 High'], ['MODERATE', '🟡 Moderate'], ['LOW', '🔵 Low']].map(([key, label]) => (
              <button key={key} onClick={() => setSeverityFilter(key)}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${severityFilter === key ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Interactions list */}
        {filteredInteractions.length === 0 ? (
          <div className="glass-card p-16 text-center flex flex-col items-center text-slate-500 border-dashed border-2 border-slate-700">
            <AlertCircle className="w-14 h-14 mb-4 opacity-20" />
            <p className="text-lg">
              {search
                ? `No interactions found matching "${search}".`
                : 'No drug interactions recorded yet.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredInteractions.map((inter, idx) => (
              <motion.div
                key={inter.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="glass-card p-5 border-l-4 border-l-amber-400 hover:shadow-lg transition-shadow"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-bold text-white">
                        {getMedicationName(inter.medication1Id)} ↔️ {getMedicationName(inter.medication2Id)}
                      </h3>
                      <SeverityBadge severity={inter.severity} />
                    </div>
                    <p className="text-slate-400 text-sm">{inter.description}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleEditClick(inter)}
                      className="p-2 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 transition-colors"
                      title="Edit"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => setDeletingInteraction(inter)}
                      className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 pt-8 border-t border-slate-800">
          <div className="glass-card p-4 text-center">
            <div className="text-2xl font-bold text-teal-400">{interactions.length}</div>
            <div className="text-sm text-slate-400 mt-1">Total Interactions</div>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="text-2xl font-bold text-rose-400">{interactions.filter(i => i.severity === 'HIGH').length}</div>
            <div className="text-sm text-slate-400 mt-1">High Risk</div>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="text-2xl font-bold text-amber-400">{interactions.filter(i => i.severity === 'MODERATE').length}</div>
            <div className="text-sm text-slate-400 mt-1">Moderate Risk</div>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <InteractionModal
            interaction={editingInteraction}
            medications={medications}
            onClose={handleCloseModal}
            onSaved={fetchData}
          />
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deletingInteraction && (
          <DeleteConfirmModal
            interaction={deletingInteraction}
            onClose={() => setDeletingInteraction(null)}
            onConfirm={fetchData}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default DrugInteractions;
