import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, ArrowRight, Loader2 } from 'lucide-react';

const AuthPage = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('email'); // 'email' or 'otp'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);
  
  const { signInWithEmail, verifyOtp } = useAuth();
  const navigate = useNavigate();

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    
    setLoading(true);
    setError('');
    
    try {
      const { success, error } = await signInWithEmail(email);
      
      if (success) {
        window.localStorage.setItem('emailForSignIn', email);
        setStep('otp');
        startCountdown();
      } else {
        setError(error || 'Failed to send OTP. Please try again.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) return;
    
    setLoading(true);
    setError('');
    
    try {
      const { success, error: serverError, isNewUser } = await verifyOtp(email, otp);
      
      if (success) {
        if (isNewUser) {
          navigate('/onboarding/name');
        } else {
          navigate('/dashboard');
        }
      } else {
        setError(serverError || error || 'Invalid or expired OTP. Please try again.');
      }
    } catch (err) {
      setError('An error occurred while verifying OTP. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const startCountdown = () => {
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleResendOtp = () => {
    if (countdown > 0) return;
    
    setLoading(true);
    setError('');
    
    signInWithEmail(email)
      .then(({ success, error }) => {
        if (success) {
          startCountdown();
        } else {
          setError(error || 'Failed to resend OTP. Please try again.');
        }
      })
      .catch((err) => {
        setError('An error occurred. Please try again.');
        console.error(err);
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-xl shadow-sm p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {step === 'email' ? 'Sign in to Task Manager' : 'Enter Verification Code'}
          </h1>
          <p className="text-gray-600">
            {step === 'email' 
              ? 'Enter your email to continue' 
              : `We've sent a 6-digit code to ${email}`}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {step === 'email' ? (
          <form onSubmit={handleEmailSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input pl-10"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !email}
              className="btn btn-primary w-full flex items-center justify-center"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                  Sending...
                </>
              ) : (
                <>
                  Continue with Email
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleOtpSubmit} className="space-y-6">
            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-1">
                Enter 6-digit code
              </label>
              <input
                id="otp"
                name="otp"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                className="input text-center text-xl tracking-widest font-mono"
                placeholder="000000"
                autoFocus
              />
              <div className="mt-2 text-sm text-gray-500">
                {countdown > 0 ? (
                  <span>Resend code in {countdown}s</span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    className="text-primary hover:text-primary-dark font-medium"
                    disabled={loading}
                  >
                    Resend code
                  </button>
                )}
              </div>
            </div>

            <div className="text-sm text-gray-600 text-center">
              <p>Or check your email for a magic link to log in instantly</p>
            </div>

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="btn btn-primary w-full flex items-center justify-center"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                  Verifying...
                </>
              ) : (
                'Verify Code'
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default AuthPage;
