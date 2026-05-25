import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useAuthStore from '../store/useAuthStore';
import { api } from '../lib/axios';
import { Check, ArrowRight, AlertCircle } from 'lucide-react';

const CompleteProfilePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    bloodType: '',
    dateOfBirth: '',
    medicalHistory: ''
  });

  useEffect(() => {
    const checkAuth = () => {
      if (!useAuthStore.getState().user) {
        navigate('/login', { replace: true });
      }
    };

    if (useAuthStore.persist.hasHydrated()) {
      checkAuth();
      return;
    }

    return useAuthStore.persist.onFinishHydration(checkAuth);
  }, [navigate]);

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const handleNext = () => {
    if (step === 1 && !formData.bloodType) {
      setError(t('completeProfile.selectBloodType'));
      return;
    }
    if (step === 2 && !formData.dateOfBirth) {
      setError(t('completeProfile.selectDateOfBirth'));
      return;
    }
    setError(null);
    setStep(step + 1);
  };

  const handleBack = () => setStep(step - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.bloodType || !formData.dateOfBirth) {
      setError(t('completeProfile.fillAllFields'));
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await api.put('/patients/profile', {
        firstName: user.firstName,
        lastName: user.lastName,
        bloodType: formData.bloodType,
        dateOfBirth: formData.dateOfBirth,
        medicalHistory: formData.medicalHistory
      });
      setSuccess(true);
      setTimeout(() => {
        const email = user?.email;
        logout();
        navigate('/login', {
          replace: true,
          state: {
            message: t('completeProfile.profileCreatedLogin'),
            email,
          },
        });
      }, 2500);
    } catch (err) {
      setError(err.response?.data?.message || t('completeProfile.errorUpdatingProfile'));
      setLoading(false);
    }
  };

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-gradient-secondary flex items-center justify-center p-4"
      >
        <div className="absolute inset-0 z-0 bg-black/40" />

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="relative z-10 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 10 }}
            className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 400 }}
              className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center"
            >
              <Check className="w-10 h-10 text-white" />
            </motion.div>
          </motion.div>

          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-4xl font-bold text-white mb-2"
          >
            {t('completeProfile.registrationSuccess')}
          </motion.h2>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-slate-300 text-lg mb-2"
          >
            {t('completeProfile.profileCreated')}
          </motion.p>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-slate-400 text-sm"
          >
            {t('completeProfile.redirectingToLogin')}
          </motion.p>

          <motion.div
            animate={{ opacity: [0.5, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="mt-8"
          >
            <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
          </motion.div>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-secondary flex items-center justify-center p-4 relative py-12"
    >
      <div className="absolute inset-0 z-0 bg-black/40" />

      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 100 }}
        className="glass-card w-full max-w-2xl z-10"
      >
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">{t('completeProfile.completeYourProfile')}</h2>
          <p className="text-slate-400">{t('completeProfile.stepDescription')}</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase">{t('completeProfile.step')} {step} {t('completeProfile.of')} 3</span>
            <span className="text-xs font-semibold text-slate-400">{Math.round((step / 3) * 100)}%</span>
          </div>
          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: '0%' }}
              animate={{ width: `${(step / 3) * 100}%` }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
              className="h-full bg-gradient-to-r from-primary to-accent-blue rounded-full"
            />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-accent-rose/20 border border-accent-rose text-accent-rose p-4 rounded-lg mb-6 flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p className="text-sm">{error}</p>
          </motion.div>
        )}

        {/* Step Content */}
        <AnimatePresence mode="wait">
          {/* Step 1: Blood Type */}
          {step === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="text-xl font-semibold text-white mb-6">{t('completeProfile.bloodType')}</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
                {bloodTypes.map((type) => (
                  <motion.button
                    key={type}
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, bloodType: type });
                      setError(null);
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`py-4 px-3 rounded-lg font-semibold transition-all duration-200 ${
                      formData.bloodType === type
                        ? 'bg-primary text-white shadow-lg shadow-primary/50'
                        : 'bg-slate-800 text-slate-300 border border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    {type}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 2: Date of Birth */}
          {step === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="text-xl font-semibold text-white mb-6">{t('completeProfile.dateOfBirth')}</h3>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">{t('completeProfile.selectYourBirthDate')}</label>
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => {
                    setFormData({ ...formData, dateOfBirth: e.target.value });
                    setError(null);
                  }}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>
            </motion.div>
          )}

          {/* Step 3: Clinical Background */}
          {step === 3 && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="text-xl font-semibold text-white mb-6">{t('completeProfile.clinicalBackground')}</h3>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">{t('completeProfile.medicalHistoryHint')}</label>
                <textarea
                  value={formData.medicalHistory}
                  onChange={(e) => setFormData({ ...formData, medicalHistory: e.target.value })}
                  placeholder={t('completeProfile.medicalHistoryPlaceholder')}
                  rows="6"
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
                />
                <p className="text-xs text-slate-500 mt-2">{t('completeProfile.optional')}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="flex gap-4 mt-8">
          {step > 1 && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleBack}
              className="flex-1 py-3 px-6 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-semibold transition-all"
            >
              {t('completeProfile.back')}
            </motion.button>
          )}

          {step < 3 ? (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleNext}
              className="flex-1 py-3 px-6 bg-gradient-brand hover:brightness-110 bg-primary text-white rounded-lg font-semibold transition-all shadow-lg shadow-primary/30 flex items-center justify-center gap-2"
            >
              {t('completeProfile.next')} <ArrowRight className="w-4 h-4" />
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 py-3 px-6 bg-gradient-brand hover:brightness-110 bg-primary text-white rounded-lg font-semibold transition-all shadow-lg shadow-primary/30 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {t('completeProfile.complete')} <Check className="w-4 h-4" />
                </>
              )}
            </motion.button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CompleteProfilePage;
