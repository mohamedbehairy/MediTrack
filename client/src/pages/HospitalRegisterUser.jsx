import { UserPlus } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { api } from "../lib/axios";

const HospitalRegisterUser = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "PATIENT",
  });

  const [status, setStatus] = useState({ type: null, message: "" });
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: null, message: "" });

    try {
      await api.post("/auth/register", formData);
      setStatus({
        type: "success",
        message: `${formData.role} registered successfully!`,
      });
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        role: "PATIENT",
      });
    } catch (err) {
      setStatus({
        type: "error",
        message: err.response?.data?.message || "Failed to create account.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  return (
    <div className="text-white max-w-3xl mx-auto">
      <header className="mb-12">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <UserPlus className="text-primary" /> Enroll New User
        </h1>
        <p className="text-slate-400 mt-1">
          Official hospital registration gateway.
        </p>
      </header>

      <div className="glass-card p-8">
        {status.message && (
          <div
            className={`p-4 rounded-lg mb-6 text-sm border ${status.type === "error" ? "bg-red-500/20 border-red-500 text-red-200" : "bg-emerald-500/20 border-emerald-500 text-emerald-200"}`}
          >
            {status.message}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                First Name
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                required
                onChange={handleChange}
                className="w-full bg-slate-900/80 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                placeholder="First Name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Last Name
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                required
                onChange={handleChange}
                className="w-full bg-slate-900/80 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                placeholder="Last Name"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              required
              onChange={handleChange}
              className="w-full bg-slate-900/80 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              placeholder="name@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Temporary Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              required
              onChange={handleChange}
              className="w-full bg-slate-900/80 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              placeholder="••••••••"
            />
            <p className="text-xs text-slate-500 mt-2">
              The user will be prompted to change this upon first login.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Platform Role
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full bg-slate-900/80 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            >
              <option value="PATIENT">Patient Profile</option>
              <option value="DOCTOR">Doctor Profile</option>
              <option value="PHARMACIST">Pharmacy Staff</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 mt-8 bg-gradient-brand hover:brightness-110 bg-primary text-white rounded-lg font-bold transition-all flex justify-center items-center gap-2"
          >
            {loading ? (
              <span className="animate-pulse flex items-center gap-2">
                Processing...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <UserPlus size={18} /> Register System User
              </span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default HospitalRegisterUser;
