import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import useAuthStore from "../store/useAuthStore";
import { api } from "../lib/axios";
import {
  Eye,
  EyeOff,
  ArrowRight,
  Stethoscope,
  Shield,
  Activity,
} from "lucide-react";

// Floating particle component
const Particle = ({ x, y, size, delay, color }) => (
  <motion.div
    className="absolute rounded-full pointer-events-none"
    style={{
      left: `${x}%`,
      top: `${y}%`,
      width: size,
      height: size,
      background: color,
      filter: "blur(1px)",
    }}
    animate={{ y: [0, -30, 0], opacity: [0.2, 0.6, 0.2], scale: [1, 1.3, 1] }}
    transition={{
      duration: 4 + Math.random() * 3,
      delay,
      repeat: Infinity,
      ease: "easeInOut",
    }}
  />
);

const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: 4 + Math.random() * 8,
  delay: Math.random() * 4,
  color:
    i % 3 === 0
      ? "rgba(255,102,0,0.4)"
      : i % 3 === 1
        ? "rgba(14,165,233,0.3)"
        : "rgba(16,185,129,0.3)",
}));

const inputClass =
  "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder:text-slate-500 outline-none transition-all duration-300 focus:border-primary/70 focus:bg-white/8 focus:shadow-[0_0_0_3px_rgba(255,102,0,0.15)]";

const LoginPage = () => {
  const { t, i18n } = useTranslation();

  const DEMO_ACCOUNTS = [
    {
      label: t("login.doctor"),
      email: "house@meditrack.com",
      color: "text-primary",
      icon: Stethoscope,
    },
    {
      label: t("login.patient"),
      email: "patient@example.com",
      color: "text-accent-blue",
      icon: Activity,
    },
    {
      label: t("login.pharmacist"),
      email: "pharmacy@meditrack.com",
      color: "text-emerald-400",
      icon: Shield,
    },
  ];

  const location = useLocation();
  const registrationState = location.state;

  const [email, setEmail] = useState(
    registrationState?.email || "house@meditrack.com",
  );
  const [password, setPassword] = useState("password123");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(registrationState?.message || null);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(null);

  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await api.post("/auth/login", { email, password });
      login(res.data.user, res.data.token);
      const role = res.data.user.role;
      if (role === "DOCTOR") navigate("/doctor/dashboard");
      else if (role === "PATIENT") navigate("/patient/dashboard");
      else if (role === "ADMIN") navigate("/hospital/dashboard");
      else if (role === "PHARMACIST") navigate("/pharmacy/dashboard");
      else navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || t("login.invalidCredentials"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background gradient orbs */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2 }}
      >
        <motion.div
          className="absolute w-[600px] h-[600px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(255,102,0,0.12) 0%, transparent 70%)",
            top: "-15%",
            left: "-10%",
          }}
          animate={{ x: [0, 40, 0], y: [0, 20, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute w-[500px] h-[500px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(14,165,233,0.10) 0%, transparent 70%)",
            bottom: "-10%",
            right: "-5%",
          }}
          animate={{ x: [0, -30, 0], y: [0, -25, 0] }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />
        <motion.div
          className="absolute w-[300px] h-[300px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)",
            top: "40%",
            left: "40%",
          }}
          animate={{ scale: [1, 1.3, 1] }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5,
          }}
        />
      </motion.div>

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {PARTICLES.map((p) => (
          <Particle key={p.id} {...p} />
        ))}
      </div>

      {/* Grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Language toggle top-right */}
      <button
        onClick={() =>
          i18n.changeLanguage(i18n.language === "ar" ? "en" : "ar")
        }
        className="absolute top-4 end-4 z-20 text-xs font-bold px-3 py-1.5 rounded-full border border-white/20 text-slate-300 hover:text-white hover:border-primary/60 transition-all"
      >
        {i18n.language === "ar" ? "EN" : "عربي"}
      </button>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{
          duration: 0.6,
          type: "spring",
          stiffness: 120,
          damping: 20,
        }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="relative bg-slate-900/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-[0_25px_60px_rgba(0,0,0,0.5)]">
          {/* Top glow line */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />

          {/* Logo + header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col items-center mb-8"
          >
            <motion.div
              whileHover={{ scale: 1.05, rotate: 2 }}
              className="relative mb-5"
            >
              <div className="absolute inset-0 rounded-2xl bg-primary/20 blur-xl scale-125" />
              <img
                src="/logo.jpeg"
                alt="MediTrack"
                className="relative h-16 w-auto rounded-2xl border border-white/10 shadow-2xl object-contain"
              />
            </motion.div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              {t("login.welcomeBack")}
            </h1>
            <p className="text-slate-400 text-sm mt-1.5">
              {t("login.signInPortal")}
            </p>
          </motion.div>

          {/* Success / Error */}
          <AnimatePresence>
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-5 overflow-hidden"
              >
                <div className="bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 px-4 py-3 rounded-xl text-sm text-center">
                  {success}
                </div>
              </motion.div>
            )}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-5 overflow-hidden"
              >
                <div className="bg-rose-500/10 border border-rose-500/40 text-rose-300 px-4 py-3 rounded-xl text-sm text-center">
                  {error}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <motion.form
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            onSubmit={handleLogin}
            className="space-y-4"
          >
            {/* Email */}
            <div className="relative">
              <motion.label
                className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider"
                animate={{ color: focused === "email" ? "#FF6600" : "#94a3b8" }}
              >
                {t("login.emailAddress")}
              </motion.label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocused("email")}
                onBlur={() => setFocused(null)}
                placeholder="name@meditrack.com"
                className={inputClass}
              />
            </div>

            {/* Password */}
            <div className="relative">
              <motion.label
                className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider"
                animate={{
                  color: focused === "password" ? "#FF6600" : "#94a3b8",
                }}
              >
                {t("login.password")}
              </motion.label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocused("password")}
                  onBlur={() => setFocused(null)}
                  placeholder="••••••••"
                  className={`${inputClass} pr-12`}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((s) => !s)}
                  className="absolute end-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-4 mt-2 rounded-xl font-bold text-white relative overflow-hidden group"
              style={{
                background: "linear-gradient(135deg, #FF6600 0%, #f97316 100%)",
              }}
            >
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
              <span className="relative flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full inline-block"
                    />
                    {t("login.authenticating")}
                  </>
                ) : (
                  <>
                    {t("login.accessPortal")}
                    <ArrowRight
                      size={18}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </>
                )}
              </span>
            </motion.button>
          </motion.form>

          {/* Register link */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-5 text-center"
          >
            <p className="text-slate-500 text-sm">
              {t("login.noAccount")}{" "}
              <Link
                to="/signup"
                className="font-bold text-primary hover:text-orange-400 transition-colors underline underline-offset-2"
              >
                {t("login.createAccount")}
              </Link>
            </p>
          </motion.div>

          {/* Divider */}
          <div className="my-5 flex items-center gap-3">
            <div className="flex-1 h-px bg-white/8" />
            <span className="text-xs text-slate-600 font-medium">
              {t("login.demoAccounts")}
            </span>
            <div className="flex-1 h-px bg-white/8" />
          </div>

          {/* Demo accounts */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {DEMO_ACCOUNTS.map(
              ({ label, email: demoEmail, color, icon: Icon }) => (
                <motion.button
                  key={label}
                  type="button"
                  whileHover={{ scale: 1.04, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    setEmail(demoEmail);
                    setPassword("password123");
                  }}
                  className="flex flex-col items-center gap-1.5 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/8 hover:border-white/20 transition-all group"
                >
                  <Icon
                    size={18}
                    className={`${color} group-hover:scale-110 transition-transform`}
                  />
                  <span className={`text-xs font-semibold ${color}`}>
                    {label}
                  </span>
                </motion.button>
              ),
            )}
          </div>
          <p className="text-center text-xs text-slate-600 mt-2">
            {t("login.clickToFill")}{" "}
            <span className="text-slate-500 font-mono">password123</span>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
