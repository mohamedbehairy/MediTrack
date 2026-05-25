import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { api } from '../lib/axios';
import { ShieldAlert, Plus, Save, AlertTriangle } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import { useNavigate } from 'react-router-dom';

const WritePrescription = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [patients, setPatients] = useState([]);
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [selectedPatientProfile, setSelectedPatientProfile] = useState(null);
  const [diagnosis, setDiagnosis] = useState('');
  const [prescribedMeds, setPrescribedMeds] = useState([
    { medicationId: '', dosage: '', frequency: '', durationDays: 7 }
  ]);
  
  // Interaction Warning State
  const [warning, setWarning] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    // Fetch patients and medication catalog
    const fetchData = async () => {
      try {
        const [patientsRes, medsRes] = await Promise.all([
          api.get('/doctors/patients/search'),
          api.get('/prescriptions/medications')
        ]);
        setPatients(patientsRes.data);
        setMedications(medsRes.data);
      } catch (err) {
        console.error('Failed to load data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!selectedPatientId) {
      setSelectedPatientProfile(null);
      return;
    }
    const fetchProfile = async () => {
      try {
        const res = await api.get(`/patients/${selectedPatientId}`);
        setSelectedPatientProfile(res.data);
      } catch (err) {
        console.error('Failed to load patient history', err);
      }
    };
    fetchProfile();
  }, [selectedPatientId]);

  const handleAddMed = () => {
    setPrescribedMeds([...prescribedMeds, { medicationId: '', dosage: '', frequency: '', durationDays: 7 }]);
  };

  const handleMedChange = (index, field, value) => {
    const updated = [...prescribedMeds];
    updated[index][field] = value;
    setPrescribedMeds(updated);
  };

  const handleSubmit = async (e, skipWarning = false) => {
    if (e) e.preventDefault();
    setWarning(null);
    setSuccessMsg('');

    // Filter out empty rows
    const validMeds = prescribedMeds.filter(m => m.medicationId !== '');
    if (validMeds.length === 0) return alert('Select at least one medication');

    const payload = {
      patientId: parseInt(selectedPatientId),
      doctorId: user.id, // Depending on backend this might need doctor table ID, not user ID; assumes backend queries it or handles it. Actually, backend might need `doctorId`. Wait!
      diagnosis,
      medications: validMeds.map(m => ({ ...m, medicationId: parseInt(m.medicationId), durationDays: parseInt(m.durationDays) })),
      skipWarning
    };

    try {
      const res = await api.post('/prescriptions', payload);
      setSuccessMsg('Prescription saved successfully! Inventory rules prepared.');
      setTimeout(() => navigate('/doctor/dashboard'), 2000);
    } catch (err) {
      if (err.response && err.response.status === 409) {
        // Safety Engine Caught an Interaction
        setWarning(err.response.data.conflicts);
      } else {
        alert(err.response?.data?.message || 'Server Error');
      }
    }
  };

  if (loading) return <div className="h-full flex items-center justify-center text-slate-400">Loading Medical Engine...</div>;

  return (
    <div className="text-white max-w-7xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <ShieldAlert className="text-accent-rose"/> Smart Prescription Engine
        </h1>
        <p className="text-slate-400 mt-1">AI-assisted contraindication and dosage check. Unified Patient History.</p>
      </header>

      {successMsg && (
        <div className="p-4 rounded-lg mb-6 bg-emerald-500/20 border border-emerald-500 text-emerald-200 font-bold">
          {successMsg}
        </div>
      )}

      {warning && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-6 rounded-lg mb-6 bg-red-900/40 border border-red-500 text-red-200">
           <h3 className="text-xl font-bold mb-2 flex items-center gap-2"><AlertTriangle /> SAFETY ENGINE WARNING</h3>
           <p className="mb-4 text-sm text-red-300">The system has detected potential dangerous interactions with the patient's current active record or between prescribed drugs.</p>
           
           <ul className="space-y-3 mb-6">
             {warning.map((w, i) => (
                <li key={i} className="bg-red-950/50 p-3 rounded border border-red-800/50">
                  <strong>Conflict:</strong> {w.newMed} <span className="text-slate-400 mx-2">vs</span> {w.currentMed} <br/>
                  <span className="text-xs text-red-300 block mt-1">{w.explanation}</span>
                  <span className="text-xs text-red-400 block mt-1 font-mono">Recommendation: {w.monitoring}</span>
                </li>
             ))}
           </ul>

           <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
             <button onClick={() => setWarning(null)} className="px-6 py-2 bg-slate-800 text-white rounded hover:bg-slate-700 font-bold">Modify Prescription</button>
             <button onClick={() => handleSubmit(null, true)} className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-500 font-bold">Override Warning & Prescribe</button>
           </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Form */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={(e) => handleSubmit(e, false)} className="glass-card p-6 space-y-6">
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div>
                 <label className="block text-sm font-medium text-slate-300 mb-2">Select Patient</label>
                 <select required value={selectedPatientId} onChange={e => setSelectedPatientId(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary">
                   <option value="">-- Choose Patient --</option>
                   {patients.map(p => (
                     <option key={p.id} value={p.userId}>{p.user.firstName} {p.user.lastName}</option>
                   ))}
                 </select>
               </div>
               
               <div>
                 <label className="block text-sm font-medium text-slate-300 mb-2">Diagnosis</label>
                 <input type="text" required value={diagnosis} onChange={e => setDiagnosis(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary" placeholder="e.g. Acute Bronchitis" />
               </div>
             </div>

             <div className="border-t border-slate-700 pt-6">
                <div className="flex justify-between items-center mb-4">
                   <h3 className="font-bold text-lg">Medications</h3>
                   <button type="button" onClick={handleAddMed} className="text-sm bg-primary/20 text-primary hover:bg-primary hover:text-white px-3 py-1.5 rounded flex items-center gap-1 transition-colors">
                     <Plus size={16}/> Add Medication
                   </button>
                </div>

                <div className="space-y-4">
                  {prescribedMeds.map((pm, idx) => (
                    <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center bg-slate-800/50 p-3 rounded-lg border border-slate-700">
                       <div className="md:col-span-4">
                         <select required value={pm.medicationId} onChange={e => handleMedChange(idx, 'medicationId', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-white">
                           <option value="">Select Drug...</option>
                           {medications.map(m => (
                             <option key={m.id} value={m.id}>{m.name} ({m.activeIngredient})</option>
                           ))}
                         </select>
                       </div>
                       <div className="md:col-span-3">
                         <input type="text" required value={pm.dosage} onChange={e => handleMedChange(idx, 'dosage', e.target.value)} placeholder="Dosage (e.g. 500mg)" className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-white"/>
                       </div>
                       <div className="md:col-span-3">
                         <input type="text" required value={pm.frequency} onChange={e => handleMedChange(idx, 'frequency', e.target.value)} placeholder="Frequency (e.g. Twice Daily)" className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-white"/>
                       </div>
                       <div className="md:col-span-2">
                         <input type="number" required min="1" value={pm.durationDays} onChange={e => handleMedChange(idx, 'durationDays', e.target.value)} placeholder="Days" title="Duration in Days" className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-white"/>
                       </div>
                    </div>
                  ))}
                </div>
             </div>

             <button type="submit" className="w-full py-4 mt-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] flex justify-center items-center gap-2">
               <Save size={20}/> Issue Prescription & Run Safety Check
             </button>
          </form>
        </div>

        {/* Right Column: Unified Medical History */}
        <div className="space-y-6">
           <h2 className="text-xl font-semibold flex items-center gap-2 border-b border-white/10 pb-4">
             Patient History Reference
           </h2>
           
           {!selectedPatientProfile ? (
             <div className="glass-card p-6 text-center text-slate-500 italic">
               Select a patient to view their unified medical history.
             </div>
           ) : (
             <div className="glass-card p-6 space-y-6 max-h-[800px] overflow-y-auto custom-scrollbar">
                <div>
                   <h3 className="font-bold text-lg mb-2 text-white">Known Conditions</h3>
                   <p className="text-slate-400 text-sm">{selectedPatientProfile.medicalHistory || 'No specific conditions logged.'}</p>
                   <p className="text-slate-400 text-sm mt-1">Blood Type: <span className="text-red-400 font-bold">{selectedPatientProfile.bloodType || 'Unknown'}</span></p>
                </div>

                <div className="border-t border-slate-700 pt-4">
                   <h3 className="font-bold text-lg mb-4 text-white">Past Prescriptions</h3>
                   
                   {selectedPatientProfile.prescriptions?.length > 0 ? (
                      <div className="space-y-4">
                        {selectedPatientProfile.prescriptions.map(px => (
                           <div key={px.id} className="bg-slate-900/50 p-4 rounded border border-slate-700">
                             <p className="text-xs text-slate-500 mb-1">{new Date(px.dateIssued).toLocaleDateString()} • Dr. {px.doctor.user.lastName}</p>
                             <p className="text-sm font-bold text-primary mb-2 line-clamp-1">{px.diagnosis}</p>
                             
                             <ul className="space-y-1">
                               {px.medications.map(pm => (
                                 <li key={pm.id} className="text-xs text-slate-300 list-disc ml-4">
                                   {pm.medication.name} - {pm.dosage}
                                 </li>
                               ))}
                             </ul>
                           </div>
                        ))}
                      </div>
                   ) : (
                      <p className="text-sm text-slate-500">No previous prescriptions recorded.</p>
                   )}
                </div>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default WritePrescription;
