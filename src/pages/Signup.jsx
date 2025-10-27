import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../api/auth';
import { useAuth } from '../contexts/AuthContext';
import { ThemeToggle } from '../components/ThemeToggle';
import { SEO, SEOConfig } from '../components/SEO';
import { Mail, Building2, User, AlertCircle, Zap, Bot, Database, TrendingUp, ArrowRight, CheckCircle2, Shield } from 'lucide-react';

export function Signup() {
  const [step, setStep] = useState('register'); // 'register' or 'otp'
  const [formData, setFormData] = useState({
    email: '',
    companyName: '',
    firstName: '',
    lastName: '',
  });
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [otpData, setOtpData] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRequestSignupOTP = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Request OTP for signup with all registration data
      const response = await authAPI.requestSignupOTP({
        email: formData.email,
        companyName: formData.companyName,
        profile: {
          firstName: formData.firstName,
          lastName: formData.lastName,
        },
      });
      setOtpData(response.data);
      setStep('otp');
      console.log('OTP:', response.data.otp); // For development
    } catch (err) {
      setError(err.error || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Verify OTP and create account
      const response = await authAPI.verifySignupOTP(formData.email, otp);
      login(response.data.user, response.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEO {...SEOConfig.signup} />
      <div className="min-h-screen flex bg-white dark:bg-gray-900">
        {/* Left Side - Video Only */}
        <div className="hidden lg:flex lg:w-1/2 bg-black relative overflow-hidden">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src="/brain-signalling.mp4" type="video/mp4" />
          </video>
        </div>

      {/* Right Side - All Content & Signup Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative">
        <div className="absolute top-6 right-6">
          <ThemeToggle />
        </div>

        <div className="w-full max-w-md">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 mb-8">
            <img src="/favicon_io/android-chrome-192x192.png" alt="RagSense Logo" className="w-12 h-12" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">RagSense LAB</h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm">RAG Transformer Platform</p>
            </div>
          </div>

          {/* Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Create Your Account</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Get started with RagSense today - no credit card required
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2">
              <AlertCircle size={18} className="text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Registration Form */}
          {step === 'register' ? (
            <form onSubmit={handleRequestSignupOTP} className="space-y-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  <Building2 size={16} />
                  Company Name
                </label>
                <input
                  type="text"
                  name="companyName"
                  placeholder="Acme Inc"
                  value={formData.companyName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    <User size={16} />
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  <Mail size={16} />
                  Work Email
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="you@company.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 px-6 py-3.5 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-primary-500/30"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Sending OTP...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Continue
                    <ArrowRight size={18} />
                  </span>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyAndRegister} className="space-y-5">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  Email Address
                </label>
                <div className="p-3 bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl">
                  <p className="text-sm text-gray-900 dark:text-white font-medium">{formData.email}</p>
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  <Shield size={16} />
                  Verification Code
                </label>
                <input
                  type="text"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                  required
                  className="w-full px-4 py-4 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all text-center text-2xl font-bold tracking-[0.5em]"
                />
                {otpData && (
                  <div className="flex items-center gap-2 mt-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <CheckCircle2 size={16} className="text-green-600 dark:text-green-400" />
                    <p className="text-xs text-green-700 dark:text-green-400">
                      OTP sent to your email!
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep('register')}
                  className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold rounded-xl border-2 border-gray-200 dark:border-gray-700 transition-all"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-primary-500/30"
                >
                  {loading ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          )}

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-semibold transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
