import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Camera, FileText, Upload, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '../lib/axios';
import useAuthStore from '../store/useAuthStore';

const API_ORIGIN = 'http://localhost:5002';

const DoctorSettings = () => {
  const { t } = useTranslation();
  const { user, token, login } = useAuthStore();
  const [doctorData, setDoctorData] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [licenseImage, setLicenseImage] = useState(null);
  const [profilePreview, setProfilePreview] = useState(null);
  const [licensePreview, setLicensePreview] = useState(null);
  const [licensePickIsPdf, setLicensePickIsPdf] = useState(false);
  const [status, setStatus] = useState({ type: null, message: '' });
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(null);

  const fetchDoctorDashboard = useCallback(async () => {
    if (!user?.id) return;
    setLoadError(null);
    try {
      const res = await api.get(`/doctors/${user.id}/dashboard`);
      setDoctorData(res.data);
    } catch (err) {
      console.error(err);
      setLoadError(err.response?.data?.message || t('doctorSettings.loadingProfile'));
      setDoctorData(null);
    }
  }, [user?.id, t]);

  useEffect(() => { fetchDoctorDashboard(); }, [fetchDoctorDashboard]);

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    if (type === 'profile') {
      setProfileImage(file);
      setProfilePreview(previewUrl);
    } else {
      setLicenseImage(file);
      setLicensePickIsPdf(file.type === 'application/pdf');
      setLicensePreview(file.type === 'application/pdf' ? null : previewUrl);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!profileImage && !licenseImage) {
      setStatus({ type: 'error', message: t('doctorSettings.selectFile') });
      return;
    }
    setLoading(true);
    setStatus({ type: null, message: '' });
    const formData = new FormData();
    if (profileImage) formData.append('profileImage', profileImage);
    if (licenseImage) formData.append('licenseImage', licenseImage);
    try {
      await api.post('/doctors/upload-credentials', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setProfileImage(null);
      setLicenseImage(null);
      setProfilePreview(null);
      setLicensePreview(null);
      setLicensePickIsPdf(false);
      await fetchDoctorDashboard();
      setStatus({ type: 'success', message: t('doctorSettings.uploadSuccess') });
    } catch (err) {
      console.error(err);
      setStatus({ type: 'error', message: err.response?.data?.message || t('doctorSettings.uploadError') });
    } finally {
      setLoading(false);
    }
  };

  if (loadError) {
    return (
      <div className="max-w-xl mx-auto text-center p-12 rounded-2xl border border-red-500/40 bg-red-500/10 text-red-200">
        <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-90" />
        <p className="font-semibold mb-2">{loadError}</p>
        <button
          type="button"
          onClick={() => fetchDoctorDashboard()}
          className="mt-4 px-6 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium border border-slate-600"
        >
          {t('doctorSettings.tryAgain')}
        </button>
      </div>
    );
  }

  if (!doctorData && user?.role === 'DOCTOR') {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-slate-400">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4" />
        <p>{t('doctorSettings.loadingProfile')}</p>
      </div>
    );
  }

  const licenseUrl = doctorData?.licenseImage ? `${API_ORIGIN}${doctorData.licenseImage}` : null;
  const isLicensePdf = licenseUrl && /\.pdf(\?|$)/i.test(licenseUrl);
  const profileUrl = doctorData?.profileImage ? `${API_ORIGIN}${doctorData.profileImage}` : null;

  return (
    <div className="max-w-4xl mx-auto text-white">
      <header className="mb-10">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          {t('doctorSettings.verificationProfile')}
        </h1>
        <p className="text-slate-400 mt-2">{t('doctorSettings.uploadDocuments')}</p>
      </header>

      {status.message && (
        <div className={`p-4 rounded-lg mb-8 border ${status.type === 'error' ? 'bg-red-500/10 border-red-500/50 text-red-400' : 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400'} flex items-center gap-3`}>
          {status.type === 'success' && <CheckCircle2 className="w-5 h-5" />}
          {status.message}
        </div>
      )}

      <form onSubmit={handleUpload} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* Profile Picture Upload */}
          <div className="glass-card p-6 bg-slate-900/50 border border-slate-800 rounded-2xl flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4">
              <Camera className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-xl font-bold mb-2">{t('doctorSettings.professionalPortrait')}</h2>
            <p className="text-sm text-slate-400 text-center mb-6">{t('doctorSettings.portraitDesc')}</p>

            <label className="relative group cursor-pointer w-full max-w-[250px] aspect-square rounded-full border-2 border-dashed border-slate-700 hover:border-primary transition-colors flex flex-col items-center justify-center overflow-hidden bg-slate-800/50">
              {profilePreview || profileUrl ? (
                <img src={profilePreview || profileUrl} alt="Profile Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center text-slate-500 group-hover:text-primary transition-colors">
                  <Upload className="w-8 h-8 mb-2" />
                  <span className="text-sm font-medium">{t('doctorSettings.browseFiles')}</span>
                </div>
              )}
              <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'profile')} />
            </label>
          </div>

          {/* License Upload */}
          <div className="glass-card p-6 bg-slate-900/50 border border-slate-800 rounded-2xl flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-accent-blue/20 flex items-center justify-center mb-4">
              <FileText className="w-8 h-8 text-accent-blue" />
            </div>
            <h2 className="text-xl font-bold mb-2">{t('doctorSettings.medicalLicense')}</h2>
            <p className="text-sm text-slate-400 text-center mb-6">{t('doctorSettings.licenseDesc')}</p>

            <label className="relative group cursor-pointer w-full max-w-[250px] aspect-[3/4] rounded-xl border-2 border-dashed border-slate-700 hover:border-accent-blue transition-colors flex flex-col items-center justify-center overflow-hidden bg-slate-800/50">
              {(licensePreview || licensePickIsPdf) && licensePickIsPdf ? (
                <div className="flex flex-col items-center justify-center gap-2 p-4 text-slate-300 text-center">
                  <FileText className="w-12 h-12 text-accent-blue" />
                  <span className="text-sm font-medium">{t('doctorSettings.pdfSelected')}</span>
                  <span className="text-xs text-slate-500">{t('doctorSettings.submitToUpload')}</span>
                </div>
              ) : licensePreview ? (
                <img src={licensePreview} alt="License Preview" className="w-full h-full object-cover opacity-80" />
              ) : licenseUrl && isLicensePdf ? (
                <div className="flex flex-col items-center justify-center gap-2 p-4 text-slate-300 text-center">
                  <FileText className="w-12 h-12 text-accent-blue" />
                  <span className="text-sm font-medium">{t('doctorSettings.pdfOnFile')}</span>
                  <a href={licenseUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-accent-blue underline" onClick={(e) => e.stopPropagation()}>
                    {t('doctorSettings.openDocument')}
                  </a>
                </div>
              ) : licenseUrl ? (
                <img src={licenseUrl} alt="License Preview" className="w-full h-full object-cover opacity-80" />
              ) : (
                <div className="flex flex-col items-center text-slate-500 group-hover:text-accent-blue transition-colors">
                  <Upload className="w-8 h-8 mb-2" />
                  <span className="text-sm font-medium">{t('doctorSettings.browseFiles')}</span>
                </div>
              )}
              <input type="file" className="hidden" accept="image/*,application/pdf" onChange={(e) => handleFileChange(e, 'license')} />
            </label>
          </div>

        </div>

        <div className="flex justify-end pt-6 border-t border-slate-800">
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 bg-primary hover:bg-orange-600 text-white font-bold rounded-xl shadow-[0_4px_15px_rgba(255,102,0,0.3)] transition-all flex items-center gap-2"
          >
            {loading ? <span className="animate-pulse">{t('doctorSettings.uploading')}</span> : t('doctorSettings.submitVerification')}
          </button>
        </div>
      </form>

      {/* Profile Update Section */}
      <div className="mt-16 pt-16 border-t border-slate-800">
        <header className="mb-8">
          <h2 className="text-2xl font-bold">{t('doctorSettings.updateProfilePassword')}</h2>
          <p className="text-slate-400 mt-2">{t('doctorSettings.changeDetails')}</p>
        </header>

        <form onSubmit={async (e) => {
          e.preventDefault();
          setStatus({ type: null, message: '' });
          const data = new FormData(e.target);
          const payload = Object.fromEntries(data.entries());
          try {
            await api.put('/doctors/profile', payload);
            setStatus({ type: 'success', message: t('doctorSettings.profileUpdated') });
            setDoctorData((prev) => ({
              ...prev,
              specialization: payload.specialization,
              clinicAddress: payload.clinicAddress,
            }));
            if (token && user) {
              login({ ...user, firstName: payload.firstName, lastName: payload.lastName }, token);
            }
          } catch {
            setStatus({ type: 'error', message: t('doctorSettings.failedUpdate') });
          }
        }} className="space-y-6 max-w-2xl bg-slate-900/50 p-8 rounded-2xl glass-card border border-slate-800">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">{t('doctorSettings.firstName')}</label>
              <input name="firstName" defaultValue={user.firstName} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">{t('doctorSettings.lastName')}</label>
              <input name="lastName" defaultValue={user.lastName} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none" required />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">{t('doctorSettings.specialization')}</label>
            <input name="specialization" defaultValue={doctorData?.specialization} placeholder="e.g., Cardiology" className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">{t('doctorSettings.clinicAddress')}</label>
            <input name="clinicAddress" defaultValue={doctorData?.clinicAddress} placeholder="e.g., 123 Medical St" className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">{t('doctorSettings.newPassword')}</label>
            <input name="password" type="password" placeholder={t('doctorSettings.leaveBlank')} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
          </div>

          <button type="submit" className="w-full py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 font-bold rounded-xl transition-all">
            {t('doctorSettings.updateProfile')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default DoctorSettings;
