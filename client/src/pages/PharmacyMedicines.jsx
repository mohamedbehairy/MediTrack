import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  Pill, Plus, Edit2, Trash2, X, AlertTriangle, Loader2,
  Search, CheckCircle2, RefreshCw
} from 'lucide-react';
import { api } from '../lib/axios';

/* ── Medication Modal (Add/Edit) ─────────────────────────────────────────── */
const MedicationModal = ({ medication, onClose, onSaved }) => {
  const [formData, setFormData] = useState(medication || {
    name: '',
    activeIngredient: '',
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

    if (!formData.name.trim() || !formData.activeIngredient.trim()) {
      setError('Name and active ingredient are required');
      return;
    }

    setSaving(true);
    try {
      if (medication?.id) {
        await api.put(`/pharmacy/medications/${medication.id}`, formData);
      } else {
        await api.post('/pharmacy/medications', formData);
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save medication');
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
            <Pill className="text-teal-400 w-5 h-5" />
            {medication ? 'Edit Medication' : 'Add New Medication'}
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
              Medication Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Aspirin"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-teal-500 transition-colors"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">
              Active Ingredient *
            </label>
            <input
              type="text"
              name="activeIngredient"
              value={formData.activeIngredient}
              onChange={handleChange}
              placeholder="e.g., Acetylsalicylic Acid"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-teal-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">
              Description (Optional)
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Add notes about this medication..."
              rows="3"
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
                <><CheckCircle2 size={15} /> {medication ? 'Update' : 'Create'}</>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

/* ── Delete Confirmation Modal ──────────────────────────────────────────── */
const DeleteConfirmModal = ({ medication, onClose, onConfirm }) => {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/pharmacy/medications/${medication.id}`);
      onConfirm();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete medication');
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
          <h2 className="text-lg font-bold text-white">Delete Medication?</h2>
        </div>

        <div className="p-5 space-y-4">
          {error ? (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-400 text-sm flex items-center gap-2">
              <AlertTriangle size={14} /> {error}
            </div>
          ) : (
            <p className="text-slate-400">
              Are you sure you want to delete <span className="font-bold text-white">"{medication.name}"</span>? This action cannot be undone.
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
const PharmacyMedicines = () => {
  const { t } = useTranslation();
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editingMedication, setEditingMedication] = useState(null);
  const [deletingMedication, setDeletingMedication] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const fetchMedications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/pharmacy/medications');
      setMedications(res.data);
    } catch (err) {
      console.error('Failed to load medications', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMedications();
  }, [fetchMedications]);

  const filteredMedications = medications.filter(med => {
    const q = search.toLowerCase();
    return med.name.toLowerCase().includes(q) ||
           med.activeIngredient.toLowerCase().includes(q);
  });

  const handleAddClick = () => {
    setEditingMedication(null);
    setShowModal(true);
  };

  const handleEditClick = (med) => {
    setEditingMedication(med);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingMedication(null);
  };

  if (loading) {
    return (
      <div className="flex flex-col h-full items-center justify-center text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin mb-4 text-teal-500" />
        <p>Loading medications…</p>
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
              <Pill className="text-teal-400 w-8 h-8" />
              Medicines Management
            </h1>
            <p className="text-slate-400 mt-1">Manage medications in the system. Add, edit, or remove medicines.</p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={fetchMedications}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-slate-300 font-medium text-sm transition-colors"
            >
              <RefreshCw size={15} /> Refresh
            </button>
            <button
              onClick={handleAddClick}
              className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-500 rounded-xl text-white font-bold text-sm transition-colors"
            >
              <Plus size={15} /> Add Medicine
            </button>
          </div>
        </header>

        {/* Search bar */}
        <div className="relative mb-6">
          <Search className="absolute start-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by name or active ingredient…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-slate-900/80 border border-slate-700 focus:border-teal-500 rounded-xl ps-11 pe-4 py-3 text-white outline-none transition-colors placeholder:text-slate-500"
          />
        </div>

        {/* Medications table */}
        {filteredMedications.length === 0 ? (
          <div className="glass-card p-16 text-center flex flex-col items-center text-slate-500 border-dashed border-2 border-slate-700">
            <Pill className="w-14 h-14 mb-4 opacity-20" />
            <p className="text-lg">
              {search
                ? `No medications found matching "${search}".`
                : 'No medications yet. Add your first medicine to get started.'}
            </p>
          </div>
        ) : (
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-800/50 border-b border-slate-700">
                  <tr>
                    <th className="px-6 py-4 text-start text-sm font-bold text-slate-300">Medication Name</th>
                    <th className="px-6 py-4 text-start text-sm font-bold text-slate-300">Active Ingredient</th>
                    <th className="px-6 py-4 text-start text-sm font-bold text-slate-300">Description</th>
                    <th className="px-6 py-4 text-center text-sm font-bold text-slate-300">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {filteredMedications.map((med, idx) => (
                    <motion.tr
                      key={med.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      className="hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center shrink-0">
                            <Pill className="w-5 h-5 text-teal-400" />
                          </div>
                          <span className="font-bold text-white">{med.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-400 text-sm">{med.activeIngredient}</td>
                      <td className="px-6 py-4 text-slate-500 text-sm">
                        {med.description ? (
                          <span className="line-clamp-1">{med.description}</span>
                        ) : (
                          <span className="text-slate-600 italic">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEditClick(med)}
                            className="p-2 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 transition-colors"
                            title="Edit"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => setDeletingMedication(med)}
                            className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <MedicationModal
            medication={editingMedication}
            onClose={handleCloseModal}
            onSaved={fetchMedications}
          />
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deletingMedication && (
          <DeleteConfirmModal
            medication={deletingMedication}
            onClose={() => setDeletingMedication(null)}
            onConfirm={fetchMedications}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default PharmacyMedicines;
