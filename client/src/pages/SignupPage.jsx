import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useAuthStore from '../store/useAuthStore';
import { api } from '../lib/axios';

const SignupPage = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', password: '', role: 'PATIENT' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/auth/register', formData);
      if (response.data.token) {
        login(response.data.user, response.data.token);
        if (response.data.user.role === 'PATIENT') {
          navigate('/complete-profile');
        } else if (response.data.user.role === 'DOCTOR') {
          navigate('/doctor/dashboard');
        } else if (response.data.user.role === 'ADMIN') {
          navigate('/hospital/dashboard');
        } else if (response.data.user.role === 'PHARMACIST') {
          navigate('/pharmacy/dashboard');
        } else {
          navigate('/');
        }
      } else {
        navigate('/login');
      }
    } catch (err) {
      setError(err.response?.data?.message || t('signup.failedCreate'));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

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
        className="glass-card w-full max-w-lg z-10"
      >
        <div className="flex flex-col items-center mb-6">
          <img src="/logo.jpeg" alt="MediTrack Logo" className="h-16 w-auto mb-4 rounded-xl shadow-lg border border-slate-700 object-contain shadow-primary/20" />
          <h2 className="text-3xl font-bold text-white text-center">{t('signup.joinMediTrack')}</h2>
          <p className="text-slate-400 mt-2">{t('signup.createAccount')}</p>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-200 p-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">{t('signup.firstName')}</label>
              <input type="text" name="firstName" required onChange={handleChange}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                placeholder="John" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">{t('signup.lastName')}</label>
              <input type="text" name="lastName" required onChange={handleChange}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                placeholder="Doe" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">{t('signup.emailAddress')}</label>
            <input type="email" name="email" required onChange={handleChange}
              className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              placeholder="name@example.com" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">{t('signup.password')}</label>
            <input type="password" name="password" required onChange={handleChange}
              className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              placeholder="••••••••" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">{t('signup.accountRole')}</label>
            <select name="role" onChange={handleChange}
              className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            >
              <option value="PATIENT">{t('signup.rolePatient')}</option>
              <option value="DOCTOR">{t('signup.roleDoctor')}</option>
              <option value="PHARMACIST">{t('signup.rolePharmacist')}</option>
              <option value="ADMIN">{t('signup.roleAdmin')}</option>
            </select>
          </div>

          <button type="submit" disabled={loading}
            className="w-full py-4 mt-4 bg-gradient-brand hover:brightness-110 bg-primary text-white rounded-lg font-bold transition-all shadow-lg shadow-orange-500/30 flex justify-center items-center"
          >
            {loading ? <span className="animate-pulse">{t('signup.creatingAccount')}</span> : t('signup.createAccountBtn')}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-400">
          {t('signup.alreadyHaveAccount')}{' '}
          <Link to="/login" className="text-primary hover:underline font-bold delay-150">{t('signup.signIn')}</Link>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SignupPage;
