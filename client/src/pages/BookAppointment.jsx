import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { api } from '../lib/axios';
import { Calendar, User, Search, Clock } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import { useNavigate } from 'react-router-dom';

const BookAppointment = () => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [appointmentDate, setAppointmentDate] = useState('');
  const [notes, setNotes] = useState('');
  const [submitStatus, setSubmitStatus] = useState(null);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await api.get('/doctors');
        setDoctors(res.data);
        setFilteredDoctors(res.data);
      } catch (err) {
        console.error('Failed to load doctors catalog', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  const handleSearch = (e) => {
    const q = e.target.value.toLowerCase();
    setSearch(q);
    if (!q) {
      setFilteredDoctors(doctors);
    } else {
      setFilteredDoctors(doctors.filter(d => 
        d.user.firstName.toLowerCase().includes(q) || 
        d.user.lastName.toLowerCase().includes(q) ||
        d.specialization.toLowerCase().includes(q)
      ));
    }
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!selectedDoctor || !appointmentDate) return;
    
    // Fallback: If ADMIN is using this, ideally they should select a patient ID too,
    // but for simplicity we assume patients use this, or Admin is booking as a test.
    // Realistically, the Hospital would have a patient select dropdown.
    let patientIdToBook = user.id; 
    
    try {
      await api.post('/appointments', {
        patientId: patientIdToBook,
        doctorId: selectedDoctor.id,
        date: appointmentDate,
        notes
      });
      setSubmitStatus({ type: 'success', message: t('bookAppointment.booked') });
      setTimeout(() => {
        navigate(user.role === 'ADMIN' ? '/hospital/dashboard' : '/patient/dashboard');
      }, 2000);
    } catch (err) {
      setSubmitStatus({ type: 'error', message: err.response?.data?.message || t('bookAppointment.failedBook') });
    }
  };

  if (loading) return <div className="h-full flex items-center justify-center text-slate-400">{t('bookAppointment.loadingDoctors')}</div>;

  return (
    <div className="text-white max-w-5xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Calendar className="text-primary"/> {t('bookAppointment.bookAppointment')}
        </h1>
        <p className="text-slate-400 mt-1">{t('bookAppointment.selectDoctorAndTime')}</p>
      </header>

      {submitStatus && (
        <div className={`p-4 rounded-lg mb-6 border ${submitStatus.type === 'error' ? 'bg-red-500/20 border-red-500 text-red-200' : 'bg-emerald-500/20 border-emerald-500 text-emerald-200'}`}>
          {submitStatus.message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Step 1: Browse Doctors */}
        <div className="glass-card p-6 flex flex-col h-[70vh]">
           <h2 className="text-xl font-bold mb-4 flex items-center gap-2 border-b border-white/10 pb-4">
             <Search size={20} className="text-accent-blue" /> {t('bookAppointment.selectDoctor')}
           </h2>
           <input 
             type="text" 
             placeholder="Search by name or specialization..." 
             className="w-full bg-slate-900/80 border border-slate-700 rounded-lg px-4 py-2 text-white outline-none focus:border-primary transition-colors mb-4"
             value={search}
             onChange={handleSearch}
           />
           
           <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
             {filteredDoctors.map(doctor => (
               <div 
                 key={doctor.id} 
                 onClick={() => setSelectedDoctor(doctor)}
                 className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-4 ${selectedDoctor?.id === doctor.id ? 'bg-primary/20 border-primary shadow-[0_0_10px_rgba(255,102,0,0.1)]' : 'bg-slate-800/50 border-slate-700 hover:border-slate-500'}`}
               >
                 <div className="bg-slate-700 p-3 rounded-full hidden sm:block">
                   <User size={24} className={selectedDoctor?.id === doctor.id ? 'text-primary' : 'text-slate-400'} />
                 </div>
                 <div>
                   <h3 className="font-bold text-lg">Dr. {doctor.user.firstName} {doctor.user.lastName}</h3>
                   <p className="text-accent-blue text-sm">{doctor.specialization}</p>
                   <p className="text-slate-400 text-xs mt-1">{doctor.clinicAddress || 'Main Clinic'}</p>
                 </div>
               </div>
             ))}
             {filteredDoctors.length === 0 && <p className="text-slate-500 text-center py-4">No doctors found matching your criteria.</p>}
           </div>
        </div>

        {/* Step 2: Book Date & Details */}
        <div className="glass-card p-6 bg-slate-900/90 relative overflow-hidden">
           {/* If no doctor is selected, block UI gently */}
           {!selectedDoctor && (
             <div className="absolute inset-0 z-10 bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center text-slate-400">
                <User size={48} className="mb-4 opacity-50" />
                <p>Select a doctor from the list to schedule.</p>
             </div>
           )}

           <h2 className="text-xl font-bold mb-6 flex items-center gap-2 border-b border-white/10 pb-4">
             <Clock size={20} className="text-primary" /> Schedule Specifics
           </h2>

           <form onSubmit={handleBooking} className="space-y-6 relative z-0">
              {selectedDoctor && (
                <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 mb-6">
                  <p className="text-sm text-slate-400">Booking with</p>
                  <p className="font-bold text-lg">Dr. {selectedDoctor.user.firstName} {selectedDoctor.user.lastName}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Preferred Date & Time</label>
                <input 
                  type="datetime-local" 
                  required
                  value={appointmentDate}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Reason for Visit / Notes <span className="text-slate-500 text-xs">(Optional)</span></label>
                <textarea 
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="Describe your symptoms or reason for checking up..."
                />
              </div>

              <button type="submit" className="w-full py-4 bg-gradient-brand hover:brightness-110 bg-primary text-white rounded-lg font-bold transition-all shadow-lg flex items-center justify-center gap-2">
                 <Calendar size={18} /> {t('bookAppointment.confirmBooking')}
              </button>
           </form>
        </div>
      </div>
    </div>
  );
};

export default BookAppointment;
